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
  bestStreak: 'Best streak',
  level: 'Level',
  xp: 'XP',
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
  breakdownContrast: 'Contrast completions',

  // Achievements
  achievementsHeading: 'Achievements',
  achievementsDescription: 'Milestones unlocked from completed sessions and streaks.',
  achievementsEmpty: 'Complete sessions to unlock achievements.',
  achievementLabels: {
    sauna_first: 'First Sauna',
    plunge_first: 'First Plunge',
    contrast_first: 'First Contrast',
    sauna_10: '10 Sauna Sessions',
    plunge_10: '10 Plunge Sessions',
    contrast_5: '5 Contrast Sessions',
    streak_7: '7-Day Streak',
  },

  // Recent sessions
  recentHeading: 'Recent sessions',
  recentViewAll: 'View all sessions',
  recentEmpty: 'No sessions yet.',

  // Health metrics
  healthHeading: 'Health impact',
  healthDescription: 'Heart rate, HRV, and calorie trends across your sessions.',
  healthEmpty: 'Health data will appear once your wearable syncs during a session.',
  healthAvgHr: 'Avg heart rate',
  healthPeakHr: 'Peak heart rate',
  healthAvgHrv: 'Avg HRV',
  healthTotalCal: 'Total calories',
  healthAvgCal: 'Avg cal / session',
  healthHrUnit: 'bpm',
  healthHrvUnit: 'ms',
  healthCalUnit: 'kcal',
  healthHrTrendHeading: 'Heart rate trend',
  healthHrvTrendHeading: 'HRV trend',
  healthCalTrendHeading: 'Calories per session',

  // States
  loading: 'Loading your dashboard...',
  error: 'Could not load dashboard data.',
  emptyState:
    'No sessions synced yet. Complete a session in the mobile app to get started.',
} as const;
