// ─── AI MATCHING ENGINE v2 ────────────────────────────────────────────────────
// Scores warehouses across 12 signals. Returns 0-99.

export function scoreWarehouse(warehouse: any, answers: Record<string, any>, extraNote = '') {
  let score = 0
  const reasons: string[] = []
  const wh = warehouse

  // ── 1. VOLUME FIT (25 pts) ────────────────────────────────────────────────
  const orderRangeMap: Record<string, [number, number]> = {
    startup:     [0,    500],
    growing:     [500,  2000],
    established: [2000, 10000],
    enterprise:  [10000, 999999],
  }
  const range = orderRangeMap[answers.monthly_orders] || [500, 5000]
  const avgOrders = (range[0] + range[1]) / 2
  if (avgOrders >= wh.min_volume && avgOrders <= wh.max_volume) {
    score += 25; reasons.push('Volume fits perfectly')
  } else if (avgOrders < wh.min_volume * 0.5) {
    score += 3  // way below minimum
  } else if (avgOrders < wh.min_volume) {
    score += 10 // slightly below
  } else {
    score += 14 // above max — still workable
  }

  // ── 2. LOCATION FIT (25 pts) ──────────────────────────────────────────────
  // Build a set of regions the shipper needs coverage in
  const locMap: Record<string, string[]> = {
    west:          ['West', 'Northwest'],
    east:          ['East'],
    midwest:       ['Midwest'],
    south:         ['South', 'Southeast'],
    nationwide:    ['West', 'East', 'Midwest', 'South', 'Southeast', 'Northwest'],
    international: ['West', 'East', 'Southeast'],
  }
  const neededRegions = locMap[answers.location] || []
  if (neededRegions.includes(wh.region)) {
    score += 25; reasons.push('Located in your target region')
  }

  // ── 3. EXTRA NOTE — parse natural language requirements (20 pts) ──────────
  if (extraNote) {
    const note = extraNote.toLowerCase()
    const whText = [
      wh.name, wh.location, wh.region, wh.description || '',
      ...(wh.specialties || []), ...(wh.services || []), ...(wh.integrations || [])
    ].join(' ').toLowerCase()

    // Multi-coast / multi-location keywords
    const multiCoastKw = ['both coast', 'east and west', 'west and east', 'bi-coastal', 'nationwide', 'both coasts', 'multiple location', 'multiple warehouse', 'multiple region', 'cross country', 'national']
    if (multiCoastKw.some((kw: string) => note.includes(kw))) {
      // Reward warehouses in major hubs / nationwide coverage
      const isNational = ['West','East','Midwest'].includes(wh.region) || (wh.sqft || 0) > 300000
      if (isNational) { score += 15; reasons.push('Strong national coverage') }
    }

    // Budget / pricing mentions
    const budgetLow  = note.match(/under \$?(\d+)|budget.{0,15}\$?(\d+)|cheap|affordable|low.cost/)
    const budgetHigh = note.match(/premium|white.?glove|luxury|high.end/)
    if (budgetLow && (wh.pricing?.perOrder || 99) < 3.5) {
      score += 10; reasons.push('Competitive pricing matches your budget')
    }
    if (budgetHigh && (wh.pricing?.perOrder || 0) >= 3.5) {
      score += 8; reasons.push('Premium service tier')
    }

    // Integration mentions
    const integrations = (wh.integrations || []).map((i: string) => i.toLowerCase())
    const intKeywords = ['shopify', 'amazon', 'woocommerce', 'bigcommerce', 'magento', 'netsuite', 'sap', 'oracle', 'tiktok', 'walmart', 'etsy', 'shipstation']
    intKeywords.forEach((kw: string) => {
      if (note.includes(kw) && integrations.some((i: string) => i.includes(kw))) {
        score += 5; reasons.push(`Integrates with ${kw.charAt(0).toUpperCase() + kw.slice(1)}`)
      }
    })

    // Service-specific keywords in note
    const svcKeywords: [string, string][] = [
      ['climate control', 'Climate Control'], ['cold storage', 'Cold Storage'],
      ['hazmat', 'Hazmat'], ['returns', 'Returns'], ['kitting', 'Kitting'],
      ['subscription', 'Subscription'], ['fba', 'FBA'], ['white glove', 'White Glove'],
      ['international', 'International'], ['b2b', 'B2B'], ['cross.dock', 'Cross-Docking'],
      ['same.day', 'Same-Day'], ['custom pack', 'Custom Packaging'],
    ]
    svcKeywords.forEach(([kw, svcName]: [string, string]) => {
      const pattern = new RegExp(kw)
      if (pattern.test(note)) {
        const hasIt = (wh.services || []).some((s: string) => s.toLowerCase().includes(svcName.toLowerCase()))
        if (hasIt) { score += 8; reasons.push(`Offers ${svcName}`) }
        else        { score -= 5 } // penalize if note requires it but warehouse lacks it
      }
    })

    // Specialty keywords in note
    const specKeywords: [string, string][] = [
      ['beauty', 'beauty'], ['cosmetic', 'beauty'], ['fashion', 'fashion'],
      ['apparel', 'apparel'], ['supplement', 'supplement'], ['health', 'health'],
      ['food', 'food'], ['beverage', 'food'], ['electronic', 'electronic'],
      ['furniture', 'furniture'], ['auto', 'auto'], ['luxury', 'luxury'],
    ]
    specKeywords.forEach(([kw, specName]: [string, string]) => {
      if (note.includes(kw)) {
        const hasIt = (wh.specialties || []).some((s: string) => s.toLowerCase().includes(specName))
        if (hasIt) { score += 6; reasons.push(`Specializes in ${specName}`) }
      }
    })

    // General text match — if warehouse name/location mentioned in note
    const whWords = [wh.name?.toLowerCase(), wh.location?.toLowerCase(), wh.region?.toLowerCase()].filter(Boolean)
    if (whWords.some((w: string | undefined) => w && note.includes(w))) {
      score += 15; reasons.push('Matches your specific warehouse request')
    }
  }

  // ── 4. PRODUCT SPECIALTY (15 pts) ─────────────────────────────────────────
  const products: string[] = answers.product_type || []
  const specials: string[] = (wh.specialties || []).map((s: string) => s.toLowerCase())
  const productAliases: Record<string, string[]> = {
    apparel:      ['apparel', 'fashion', 'clothing', 'garment'],
    beauty:       ['beauty', 'cosmetic', 'skincare', 'personal care'],
    electronics:  ['electronic', 'tech', 'gadget', 'device'],
    food:         ['food', 'beverage', 'grocery', 'snack', 'drink'],
    supplements:  ['supplement', 'vitamin', 'health', 'wellness', 'nutraceutical'],
    furniture:    ['furniture', 'home', 'decor', 'large item'],
    auto:         ['auto', 'automotive', 'vehicle', 'parts'],
    books:        ['book', 'media', 'publication'],
    toys:         ['toy', 'game', 'children'],
    pet:          ['pet', 'animal', 'dog', 'cat'],
    general:      ['general', 'ecommerce', 'dtc'],
  }
  let specScore = 0
  products.forEach((p: string) => {
    const aliases = productAliases[p] || [p]
    if (specials.some((s: string) => aliases.some((a: string) => s.includes(a)))) {
      specScore += 8
      if (!reasons.includes('Specializes in your product category'))
        reasons.push('Specializes in your product category')
    }
  })
  score += Math.min(15, specScore)

  // ── 5. SERVICES MATCH (15 pts) ────────────────────────────────────────────
  const needed: string[] = answers.services || []
  const svcAliasMap: Record<string, string[]> = {
    returns:      ['returns', 'reverse'],
    kitting:      ['kitting', 'assembly', 'bundle'],
    fba:          ['fba', 'amazon fba', 'fba prep'],
    subscription: ['subscription', 'subscription box'],
    b2b_dist:     ['edi', 'retail', 'b2b', 'distribution'],
    international:['international', 'global', 'cross-border'],
    climate:      ['climate', 'cold', 'temperature'],
    custom_pack:  ['custom pack', 'custom packaging', 'gift wrap'],
  }
  let svcScore = 0
  needed.forEach((s: string) => {
    const aliases = svcAliasMap[s] || [s]
    const whSvcs = (wh.services || []).map((ws: string) => ws.toLowerCase())
    if (whSvcs.some((ws: string) => aliases.some(a => ws.includes(a)))) {
      svcScore += 6
      if (!reasons.some((r: string) => r.includes('service')))
        reasons.push(`Offers required services`)
    }
  })
  score += Math.min(15, svcScore)

  // ── 6. BUSINESS TYPE BONUS (10 pts) ──────────────────────────────────────
  const bt = answers.business_type
  const btMatch: Record<string, [string[], string]> = {
    b2b:          [['b2b', 'wholesale', 'edi', 'retail distribution'], 'B2B specialist'],
    subscription: [['subscription', 'cratejoy', 'recharge'], 'Subscription expert'],
    marketplace:  [['fba', 'amazon', 'marketplace'], 'Amazon/marketplace certified'],
    dtc:          [['dtc', 'ecommerce', 'd2c'], 'DTC specialist'],
    retail:       [['retail', 'omnichannel', 'distribution'], 'Retail distribution expert'],
  }
  if (bt && btMatch[bt]) {
    const [aliases, label] = btMatch[bt]
    const allText = [...specials, ...(wh.services || []).map((s: string) => s.toLowerCase())]
    if (allText.some((t: string) => aliases.some((a: string) => t.includes(a)))) {
      score += 10; reasons.push(label)
    }
  }

  // ── 7. QUALITY SIGNALS (5 pts) ────────────────────────────────────────────
  if ((wh.rating || 0) >= 4.8) { score += 3; reasons.push('Top-rated warehouse') }
  if ((wh.accuracy || 0) >= 99.8) { score += 2; reasons.push('99.8%+ order accuracy') }

  // ── 8. AD BOOST (applied last, max +30%) ─────────────────────────────────
  const boost = wh.ad_boost || 0
  const base  = Math.max(0, Math.min(score, 99))
  const final = Math.min(99, Math.round(base + (base * boost / 100)))

  return {
    ...wh,
    matchScore:   final,
    matchReasons: [...new Set(reasons)].slice(0, 4),
  }
}

// ─── EMAIL TEMPLATE RENDERER ──────────────────────────────────────────────────
export function renderTemplate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replace(new RegExp(`{{${k}}}`, 'g'), v ?? ''),
    template
  )
}

export function buildEmailVars(lead: any, warehouse: any) {
  const biz: Record<string, string> = {
    dtc: 'DTC / eCommerce', b2b: 'B2B / Wholesale',
    marketplace: 'Amazon Seller', subscription: 'Subscription Box', retail: 'Retail',
  }
  const vol: Record<string, string> = {
    startup: 'Under 500/mo', growing: '500–2,000/mo',
    established: '2,000–10,000/mo', enterprise: '10,000+/mo',
  }
  return {
    warehouse_name:     warehouse?.name || '',
    warehouse_location: warehouse?.location || '',
    warehouse_rating:   String(warehouse?.rating || ''),
    warehouse_reviews:  String(warehouse?.reviews || ''),
    shipper_company:    lead.shipper_company,
    shipper_name:       lead.shipper_name,
    shipper_email:      lead.shipper_email,
    shipper_phone:      lead.shipper_phone || '',
    match_score:        String(lead.match_score || ''),
    business_type:      biz[lead.answers?.business_type] || lead.answers?.business_type || '',
    monthly_orders:     vol[lead.answers?.monthly_orders] || lead.answers?.monthly_orders || '',
    product_types:      (lead.answers?.product_type || []).join(', '),
    location:           lead.answers?.location || '',
    services:           (lead.answers?.services || []).join(', '),
    timeline:           lead.answers?.timeline || '',
    days:               '7',
    survey_link:        `${process.env.NEXT_PUBLIC_APP_URL}/survey/${lead.id}`,
  }
}

export function checkAdminAuth(req: Request): boolean {
  const auth = req.headers.get('x-admin-token')
  return auth === process.env.ADMIN_SECRET || auth === process.env.ADMIN_PASSWORD
}
