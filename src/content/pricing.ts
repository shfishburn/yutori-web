/**
 * Canonical product pricing — single source of truth.
 * Mirrors spec/pricing.json. Update both files together when prices change.
 */
export const P = {
  // Pulse Shower
  showerWith:           '$3,475',
  showerWithDeposit:    '$695',
  showerWithout:        '$2,475',
  showerWithoutDeposit: '$495',

  // Pulse Plunge
  plunge:               '$14,975',
  plungeDeposit:        '$2,995',
  plungeBalance:        '$11,980',

  // Pulse Sauna
  sauna:                '$24,975',
  saunaDeposit:         '$4,995',
  saunaBalance:         '$19,980',

  // Sensors (individual)
  sensor:               '$87',

  // Contrast Bundle
  bundle:               '$157',
  bundleList:           '$174',
  bundleSavings:        '$17',

  // App subscription
  appMonthlyShort:      '$4.97',
  appMonthly:           '$4.97/mo',
  appMonthlyOrAnnual:   '$4.97/mo or $39.99/yr',
} as const;
