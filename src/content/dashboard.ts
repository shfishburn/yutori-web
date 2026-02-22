export const DASHBOARD = {
  seo: {
    title: 'Dashboard | Yutori Labs',
    description: 'View your thermal wellness stats, session trends, and streak data.',
    path: '/dashboard',
  },
  heading: 'Dashboard',
  subtitle: 'Your thermal wellness at a glance.',

  // Summary card labels
  totalSessions: 'Total sessions',
  currentStreak: 'Current streak',
  totalTime: 'Total time',
  avgDuration: 'Avg duration',
  streakUnit: 'days',

  // Weekly activity
  weeklyHeading: 'Weekly activity',
  weeklyDescription: 'Sessions per week over the last 12 weeks.',
  saunaLabel: 'Sauna',
  coldLabel: 'Cold plunge',
  weeklyEmpty: 'Complete a session to see your weekly activity.',

  // Temperature trends
  tempHeading: 'Temperature trends',
  tempDescription: 'Peak sauna and low cold plunge temps across recent sessions.',
  tempEmpty: 'Temperature data will appear after your first sessions.',

  // Breakdown
  breakdownHeading: 'Session breakdown',
  breakdownSauna: 'Sauna sessions',
  breakdownCold: 'Cold plunge sessions',

  // Recent sessions
  recentHeading: 'Recent sessions',
  recentViewAll: 'View all sessions',
  recentEmpty: 'No sessions yet.',

  // States
  loading: 'Loading your dashboard...',
  error: 'Could not load dashboard data.',
  emptyState:
    'No sessions synced yet. Complete a session in the mobile app to get started.',
} as const;
