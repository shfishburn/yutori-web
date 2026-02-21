/** Shopify handle for the Pulse Sauna product. */
export const PRODUCT_HANDLE = 'pulse-sauna';

/* ── SEO ──────────────────────────────────────────────────── */

export const SEO = {
  title: 'Pulse Sauna \u2014 Clear-Cedar Backyard Sauna by Yutori Labs',
  description:
    'A sensor-connected clear-cedar sauna with Saunum even heat, integrated red/NIR light, and the Yutori app for structured protocols, live coaching, and emergency alerts.',
  path: '/sauna',
};

/* ── Hero ─────────────────────────────────────────────────── */

export const HERO = {
  badge: 'Backyard sauna',
  title: 'Pulse Sauna',
  fallbackPrice: '$24,999',
  priceNote: 'delivered',
  description:
    'A clear-cedar backyard sauna built around Saunum\u2019s even heat, integrated red/NIR light, and the Yutori app\u00a0\u2014 which turns your sessions into structured protocols with an emergency alert system in case something goes seriously wrong.',
  imagePlaceholder: 'Product imagery coming soon',
  ctaLabel: 'Add deposit to cart \u2014 $2,500',
  ctaLoadingLabel: 'Adding to cart\u2026',
  ctaUnavailableLabel: 'Add to cart unavailable',
  ctaError: 'Unable to add the deposit to your cart. Please try again.',
  ctaUnavailableHelp:
    'Checkout is temporarily unavailable. Refresh this page or contact support@yutorilabs.com.',
  depositNote: '10% non-refundable deposit \u00b7 12-week lead time',
  quickStats: [
    { value: '5\u2019\u00d77\u2019', label: 'Interior' },
    { value: 'R-19', label: 'Insulation' },
    { value: '240V', label: '50A circuit' },
    { value: '1\u20133', label: 'Users' },
  ],
};

/* ── The Space ────────────────────────────────────────────── */

export const THE_SPACE = {
  label: 'The Space',
  heading: 'A quiet cedar room, built to last.',
  description:
    '5\u2019\u00a0\u00d7\u00a07\u2019 interior hot room, framed with 2\u00d74 studs and sealed to R-19 for fast heat-up and stable temperature. Clear cedar inside and out for a calm, natural aesthetic.',
  cards: [
    {
      title: 'Clear cedar throughout',
      body: 'Interior cladding, benching, and exterior siding in clear cedar. Natural grain, no stain, no off-gassing.',
    },
    {
      title: 'Dual-pane tempered glass',
      body: '1\u2033 low-E glass with light gray tint in door and window. Aluminum spacer for thermal performance and a soft view line.',
    },
    {
      title: 'Epoxy-coated concrete floor',
      body: 'Easy wash-down, durable, non-combustible. Grade slopes away from the door for drainage.',
    },
    {
      title: 'Metal roof',
      body: 'Designed for year-round outdoor exposure. Rain, snow, sun \u2014 the structure handles it.',
    },
    {
      title: 'Tyvek weather barrier',
      body: 'Behind the exterior cedar with an interior air gap for moisture control and long-term durability.',
    },
    {
      title: 'R-19 insulation',
      body: '2\u00d74 framed walls and ceiling, fully sealed. Fast heat-up and minimal energy waste.',
    },
  ],
};

/* ── Heat & Climate ───────────────────────────────────────── */

export const HEAT_CLIMATE = {
  label: 'Heat & Climate',
  heading: 'Saunum: even heat, not hot ceiling.',
  description:
    'The Saunum Air 7.5 electric heater with integrated climate equalizer pulls hot ceiling air and cool floor air into a mixing chamber, then redistributes a more even, oxygen-rich stream across the room.',
  cards: [
    {
      icon: '\ud83c\udf21\ufe0f',
      iconLabel: 'Thermometer',
      title: 'Climate Equalizer',
      body: 'Saunum\u2019s fan system blends ceiling and floor air for uniform temperature distribution. No more \u201cscorching at the top, cold at your feet.\u201d',
      highlight: true,
    },
    {
      icon: '\ud83d\udca8',
      iconLabel: 'Wind',
      title: 'Engineered Ventilation',
      body: 'Fresh-air intake near the floor, extraction duct mid-wall on the opposite side. Cross-room airflow for fresh air during sessions and post-session drying.',
      highlight: false,
    },
    {
      icon: '\ud83d\udcf1',
      iconLabel: 'Phone',
      title: 'Remote Pre-heat',
      body: 'Saunum wall controller plus the Saunum mobile app. Start heating from inside the house and walk into a ready sauna.',
      highlight: false,
    },
  ],
};

/* ── Red / NIR Light ──────────────────────────────────────── */

export const LIGHT_THERAPY = {
  label: 'Integrated Light Therapy',
  heading: 'PlatinumLED SaunaMAX\u00a0Pro',
  description:
    '320-watt red and near-infrared panel mounted inside the hot room. Layer photobiomodulation into an already-scheduled sauna session instead of requiring a separate device and habit.',
  bulletPoints: [
    '320 \u00d7 1W LEDs across five wavelengths',
    '630/660 nm red + 810/830/850 nm near-infrared',
    'Fan-less, IP65, sauna-rated to 150\u00b0F / 65\u00b0C',
    'Ultra-low EMF (0.0 \u00b5T at 4\u2033)',
    '~39\u2033 \u00d7 10\u2033 \u00d7 3.5\u2033, 17 lb',
  ],
  wavelengths: ['630', '660', '810', '830', '850'],
  spectrumLabel: 'R+ | NIR+ Spectrum',
  spectrumUnit: 'wavelengths in nm',
};

/* ── Yutori App ───────────────────────────────────────────── */

export const APP_SECTION = {
  label: 'The Yutori App',
  heading: 'Sensors, coaching, and safety\u00a0\u2014 built\u00a0in.',
  description:
    'Bluetooth sensors stream ambient temperature and humidity to the app. Apple Health and Google Health Connect pull heart rate and HRV from your wearable. Everything else follows from the data.',
  features: [
    {
      badge: 'Live',
      badgeColor: 'bg-accent text-accent-fg',
      title: 'Live Coach',
      body: 'Computes your personal timing window from historical durations, current temperature zone, and demographic factors. Simple states: \u201cbuilding up,\u201d \u201cin the zone,\u201d \u201ctime to wrap.\u201d',
    },
    {
      badge: 'Safety',
      badgeColor: 'bg-heat text-heat-fg',
      title: 'Safety Guardrails',
      body: 'HR ceiling at \u224885% of age-predicted max. Dangerous-zone temperature detection. Absolute max duration per modality. Contrast-specific warnings when alternating hot and cold.',
    },
    {
      badge: 'Trends',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Long-term Analysis',
      body: 'Aggregates 30\u201390 days of sessions into average durations, peak temps, HR/HRV trends, usage patterns, and adaptation markers. AI-generated narrative insights tied to your numbers.',
    },
    {
      badge: 'Protocols',
      badgeColor: 'bg-surface-raised text-fg-muted',
      title: 'Structured Protocols',
      body: 'Multi-week sauna, cold, or contrast protocols with weekly focus, frequency, duration, and temperature guidelines \u2014 grounded in your actual session data.',
    },
  ],
  emergency: {
    title: 'Emergency Alert System',
    body: 'Monitors for signs of serious trouble during sessions. If thresholds are met, the app triggers escalating alerts on your phone, notifies pre-selected emergency contacts, and where supported, initiates an emergency call workflow.',
    disclaimer:
      'This system is a backup, not a guarantee. It depends on sensor data, device connectivity, and local emergency-call capabilities.',
  },
};

/* ── Science ──────────────────────────────────────────────── */

export const SCIENCE = {
  label: 'Research-Informed',
  heading: 'What the science says\u00a0\u2014 and doesn\u2019t.',
  description:
    'The research on heat, cold, and light is encouraging but not definitive. Different people respond differently. We built Pulse Sauna to make dose visible and repeatable, not to promise specific outcomes.',
  modalities: [
    {
      color: 'border-heat-dim/40 bg-heat-subtle',
      titleColor: 'text-heat',
      title: 'Heat',
      points: [
        'Cardiovascular load similar to light\u2013moderate exercise',
        'Heat shock protein activation (HSP70/90)',
        'Post-sauna temperature drop supports deeper sleep',
      ],
    },
    {
      color: 'border-accent-dim/40 bg-accent-subtle',
      titleColor: 'text-accent',
      title: 'Cold',
      points: [
        'Sharp norepinephrine surge \u2014 alertness and mood',
        'Brown adipose activation, modest metabolic effects',
        'Autonomic adaptation and cold tolerance over time',
      ],
    },
    {
      color: 'border-edge bg-canvas',
      titleColor: 'text-fg',
      title: 'Contrast',
      points: [
        'Layers heat and cold stressors in a single session',
        'Trains vasculature for rapid shifts',
        'Often reported as more mood-elevating than either alone',
      ],
    },
    {
      color: 'border-edge bg-canvas',
      titleColor: 'text-fg',
      title: 'Light',
      points: [
        'Red / NIR interacts with mitochondrial pathways',
        'Recovery and pain reduction in some protocols',
        'Layered into the sauna \u2014 no extra device or habit',
      ],
    },
  ],
  disclaimer:
    'We always recommend discussing substantial changes to your routine with your healthcare provider.',
};

/* ── Installation ─────────────────────────────────────────── */

export const INSTALLATION = {
  label: 'Installation',
  heading: 'What you need on-site.',
  requirements: [
    {
      title: 'Level pad',
      body: 'Non-combustible surface, minimum 6\u2019\u00d79\u2019 for the sauna footprint, door swing, and a small landing. Grade sloped away from the door for drainage.',
    },
    {
      title: 'Dedicated 240V / 50A circuit',
      body: 'Installed by a licensed electrician to NEC and local code. Exterior 50A RV-style receptacle near the pad. Single plug \u2014 no on-site wiring inside the sauna body.',
    },
    {
      title: 'Clearances',
      body: 'Side and rear clearances per local building and electrical codes, and per Saunum\u2019s heater clearance requirements.',
    },
    {
      title: 'Wi-Fi coverage',
      body: 'Reliable signal at the sauna location for Saunum control, Yutori syncing, AI coaching, and emergency alert workflows.',
    },
  ],
};

/* ── Pricing & Delivery ───────────────────────────────────── */

export const PRICING = {
  label: 'Pricing & Delivery',
  heading: '$24,999, delivered.',
  description:
    'One price, delivered to your site. Target delivery within 12\u00a0weeks of signed agreement, subject to material and freight conditions.',
  cards: [
    {
      value: '$2,500',
      title: 'Deposit',
      body: '10% non-refundable deposit due at site visit and contract signing to reserve a build slot and secure materials.',
      highlight: true,
    },
    {
      value: '$22,499',
      title: 'Balance',
      body: 'Remaining 90% due prior to shipment or at delivery, as specified in your purchase agreement.',
      highlight: false,
    },
    {
      value: '~12 wks',
      title: 'Lead time',
      body: 'Target delivery within 12 weeks of signed agreement. We\u2019ll keep you updated on build progress throughout.',
      highlight: false,
    },
  ],
  finePrint:
    'Deposit is non-refundable and reserves your build slot. Full terms are specified in the purchase agreement signed at contract.',
};

/* ── Specs ─────────────────────────────────────────────────── */

export const SPECS_SECTION = {
  label: 'Specifications',
  heading: 'Full specs.',
};

export const SPECS: [string, string][] = [
  ['Interior size', '5\u2019 \u00d7 7\u2019 hot room, 1\u20133 users'],
  ['Construction', '2\u00d74 framing, R-19 insulated walls & ceiling'],
  ['Interior finish', 'Clear cedar cladding and benching'],
  ['Exterior finish', 'Clear cedar siding with Tyvek WRB'],
  ['Floor', 'Epoxy-resin coated concrete, wash-down friendly'],
  ['Roof', 'Metal roof, outdoor rated'],
  ['Glazing', '1\u2033 dual-pane low-E tempered glass, light gray tint'],
  ['Heater', 'Saunum Air 7.5 with climate equalizer'],
  ['Ventilation', '4\u2033 intake \u226412\u2033 from floor; 6\u20138\u2033 extraction 24\u201347\u2033 from floor'],
  ['Red / NIR light', 'PlatinumLED SaunaMAX Pro \u2014 320 W, 630/660/810/830/850 nm'],
  ['Power', '240 V, 50 A RV-style plug to dedicated circuit'],
  ['Control', 'Saunum wall controller + Saunum mobile app'],
  ['App', 'Yutori app with sensors, Live Coach, trends & protocols'],
  ['Safety', 'Live guardrails + multi-step emergency alert system'],
];

/* ── Safety & Limitations ─────────────────────────────────── */

export const SAFETY = {
  label: 'Important',
  heading: 'Safety & limitations.',
  description:
    'Pulse Sauna and the Yutori app make heat and cold exposure easier to structure and safer to explore, but there are important limits to keep in mind.',
  disclaimers: [
    {
      title: 'Not a medical device',
      body: 'Pulse Sauna, the Saunum heater, the SaunaMAX Pro light, and the Yutori app are not medical devices and are not intended to diagnose, treat, cure, or prevent any disease. They should not replace medical advice, screening, or supervision from your healthcare team.',
    },
    {
      title: 'Connectivity-dependent emergency alerts',
      body: 'The emergency alert system depends on your phone, sensors, and network. If Wi-Fi or cellular service is poor, if your phone battery is dead, or if permissions are disabled, emergency workflows may be delayed or unavailable. Do not rely on the system as your sole layer of safety.',
    },
    {
      title: 'User configuration and supervision',
      body: 'You must configure emergency contacts and allow necessary permissions. Children, people with significant cardiovascular or neurological conditions, and anyone advised to avoid heat or cold should only use the sauna or plunge under direct supervision and medical guidance.',
    },
    {
      title: 'Heed your own limits',
      body: 'The Live Coach\u2019s guidance is conservative by design, but it is still an estimate. If you feel unwell, light-headed, confused, or distressed, end the session immediately and seek help \u2014 regardless of what the app is showing.',
    },
  ],
};

/* ── Bottom CTA ───────────────────────────────────────────── */

export const CTA = {
  heading: 'Your backyard. Your protocol. Your data.',
  description:
    '$24,999 delivered. 10% deposit reserves your build slot. Target delivery within 12\u00a0weeks of signed agreement.',
  primaryLabel: 'Add deposit to cart',
  primaryLoadingLabel: 'Adding to cart\u2026',
  primaryUnavailableLabel: 'Checkout unavailable',
  secondaryLabel: 'View all products',
};
