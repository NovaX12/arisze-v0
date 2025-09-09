export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'achievement' | 'social' | 'academic' | 'exploration' | 'activity'
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

export const ALL_BADGES: Badge[] = [
  // Unlocked by default (for testing)
  {
    id: 'newbie',
    name: 'Newbie',
    description: 'Welcome to Arisze! You\'ve joined the community.',
    icon: '🌱',
    category: 'achievement',
    rarity: 'common'
  },
  {
    id: 'profile-pro',
    name: 'Profile Pro',
    description: 'You\'ve filled out your entire profile.',
    icon: '✅',
    category: 'achievement',
    rarity: 'common'
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'One of the first 100 users to join Arisze.',
    icon: '🐦',
    category: 'achievement',
    rarity: 'rare'
  },

  // Locked badges (need to be earned)
  {
    id: 'first-five',
    name: 'First Five',
    description: 'Attended your first 5 events.',
    icon: '🎉',
    category: 'social',
    rarity: 'common'
  },
  {
    id: 'caffeine-fiend',
    name: 'Caffeine Fiend',
    description: 'Booked an event at 3 different cafes.',
    icon: '☕',
    category: 'exploration',
    rarity: 'uncommon'
  },
  {
    id: 'academic-ally',
    name: 'Academic Ally',
    description: 'Joined a Study Group Session.',
    icon: '🎓',
    category: 'academic',
    rarity: 'common'
  },
  {
    id: 'music-lover',
    name: 'Music Lover',
    description: 'Attended a Live Acoustic Music event.',
    icon: '🎸',
    category: 'activity',
    rarity: 'uncommon'
  },
  {
    id: 'creative-soul',
    name: 'Creative Soul',
    description: 'Participated in an Art Workshop.',
    icon: '🎨',
    category: 'activity',
    rarity: 'uncommon'
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Attended a Networking Mixer.',
    icon: '🤝',
    category: 'social',
    rarity: 'uncommon'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Booked an event that starts after 9 PM.',
    icon: '🦉',
    category: 'activity',
    rarity: 'uncommon'
  },
  {
    id: 'kaunas-explorer',
    name: 'Kaunas Explorer',
    description: 'Visited venues in 3 different districts of Kaunas.',
    icon: '🗺️',
    category: 'exploration',
    rarity: 'rare'
  },
  {
    id: 'planner-pro',
    name: 'Planner Pro',
    description: 'Booked an event more than a week in advance.',
    icon: '🗓️',
    category: 'achievement',
    rarity: 'uncommon'
  },
  {
    id: 'perfect-streak',
    name: 'Perfect Streak',
    description: 'Logged in for 7 consecutive days.',
    icon: '💯',
    category: 'achievement',
    rarity: 'rare'
  },
  {
    id: 'community-builder',
    name: 'Community Builder',
    description: 'Successfully organized and hosted an event.',
    icon: '🤝',
    category: 'social',
    rarity: 'rare'
  },
  {
    id: 'top-reviewer',
    name: 'Top Reviewer',
    description: 'Left 5 event reviews.',
    icon: '⭐',
    category: 'social',
    rarity: 'uncommon'
  },
  {
    id: 'arisze-veteran',
    name: 'Arisze Veteran',
    description: 'You\'ve been a member for one year.',
    icon: '👑',
    category: 'achievement',
    rarity: 'legendary'
  }
]

// Default unlocked badges for new users
export const DEFAULT_EARNED_BADGES = ['newbie', 'profile-pro', 'early-bird', 'academic-ally']

export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find(badge => badge.id === id)
}

export function getBadgesByCategory(category: Badge['category']): Badge[] {
  return ALL_BADGES.filter(badge => badge.category === category)
}

export function getBadgesByRarity(rarity: Badge['rarity']): Badge[] {
  return ALL_BADGES.filter(badge => badge.rarity === rarity)
}
