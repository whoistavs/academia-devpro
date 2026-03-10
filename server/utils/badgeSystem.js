// server/utils/badgeSystem.js

const BADGES_CONFIG = [
    {
        id: 'streak_3',
        name: 'Aprendiz Focado',
        description: '3 dias de ofensiva',
        icon: 'Flame',
        color: 'text-orange-500',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        condition: (user) => (user.streak || 0) >= 3
    },
    {
        id: 'streak_7',
        name: 'Mestre do Fogo',
        description: '7 dias de ofensiva',
        icon: 'Flame',
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        condition: (user) => (user.streak || 0) >= 7
    },
    {
        id: 'first_100_xp',
        name: 'Iniciante Promissor',
        description: 'Alcançou 100 XP',
        icon: 'Star',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        condition: (user) => (user.xp || 0) >= 100
    },
    {
        id: 'first_certificate',
        name: 'Graduado',
        description: 'Conquistou o 1º certificado',
        icon: 'Award',
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        condition: (user) => Array.isArray(user.certificates) && user.certificates.length >= 1
    }
];

/**
 * Evaluates the user's current stats and returns an updated array of badge IDs.
 * @param {Object} user User document from MongoDB
 * @returns {Array<String>} Array of earned badge IDs
 */
export const calculateBadges = (user) => {
    const earnedBadges = new Set(user.badges || []);

    for (const badge of BADGES_CONFIG) {
        if (!earnedBadges.has(badge.id) && badge.condition(user)) {
            earnedBadges.add(badge.id);
        }
    }

    return Array.from(earnedBadges);
};

export const getBadgeDetails = (badgeId) => {
    return BADGES_CONFIG.find(b => b.id === badgeId) || null;
};

export const getAllBadgesConfig = () => {
    return BADGES_CONFIG.map(({ id, name, description, icon, color, bgColor }) => ({
        id, name, description, icon, color, bgColor
    }));
};
