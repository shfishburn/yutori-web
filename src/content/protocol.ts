export const PROTOCOL = {
  seo: {
    title: 'Your Protocol | Yutori Labs',
    description: 'Personalized thermal wellness protocol with weekly progression, benchmarks, and guidance.',
    path: '/protocol',
  },
  heading: 'Your Protocol',
  subtitle: 'Personalized progression plan from Yutori Coach.',

  overviewHeading: 'Overview',
  weekHeading: (n: number) => `Week ${n}`,
  frequencyLabel: 'Frequency',
  durationLabel: 'Duration',
  temperatureLabel: 'Temperature',
  notesLabel: 'Guidance',
  benchmarkLabel: 'Benchmark',
  progressHeading: 'Progress marker',
  safetyHeading: 'Safety notes',

  disclaimer: 'For general wellness only — not medical advice. Consult a physician before making health decisions.',

  emptyHeading: 'No protocol yet',
  emptyBody: 'Generate a protocol from the Coach tab in the Yutori app. You need at least 5 sessions.',

  loading: 'Loading your protocol…',
  error: 'Could not load protocol data.',

  backToDashboard: 'Back to dashboard',

  typeLabels: {
    sauna: 'Sauna',
    cold_plunge: 'Cold plunge',
    contrast: 'Contrast',
  } as Record<string, string>,
} as const;
