import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { calculateBadges } from '../utils/badgeSystem.js';

export const getProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const progress = await Progress.findOne({ userId, courseId });
        res.json(progress || { completedLessons: [], quizScores: {} });
    } catch (e) {
        console.error("Error fetching progress:", e);
        res.status(500).json({ error: 'Erro ao buscar progresso.' });
    }
};

export const updateProgress = async (req, res) => {
    try {
        const { courseId, lessonId, progress } = req.body;
        const userId = req.user.id;

        if (!courseId || (!lessonId && lessonId !== 0)) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        let userProgress = await Progress.findOne({ userId, courseId });
        if (!userProgress) {
            userProgress = new Progress({
                userId,
                courseId,
                completedLessons: [],
                quizScores: {}
            });
        }

        let alreadyCompleted = false;

        if (lessonId === 'final_exam') {
            const newScores = { ...(userProgress.quizScores || {}), final_exam: progress };
            userProgress.quizScores = newScores;

            alreadyCompleted = userProgress.completedLessons.some(l => String(l) === 'final_exam');
            if (!alreadyCompleted) {
                userProgress.completedLessons.push('final_exam');
            }

            if (progress >= 70) {
                const user = await User.findById(userId);
                if (user) {
                    const certExists = user.certificates?.some(c => c.courseId === courseId);
                    if (!certExists) {
                        const courseCode = courseId.toString().substring(0, 4).toUpperCase();
                        const userCode = userId.toString().substring(0, 8).toUpperCase();
                        const timestamp = Date.now().toString(36).toUpperCase();
                        const uniqueCode = `DVP-${courseCode}-${userCode}-${timestamp}`;

                        if (!user.certificates) user.certificates = [];
                        user.certificates.push({
                            courseId,
                            code: uniqueCode,
                            date: new Date()
                        });
                        await user.save();
                    }
                }
            }
            userProgress.lastAccessed = Date.now();
        } else {
            const lid = String(lessonId);
            alreadyCompleted = userProgress.completedLessons.some(l => String(l) === lid);
            if (!alreadyCompleted) {
                userProgress.completedLessons.push(lid);
            }
            userProgress.lastAccessed = Date.now();
        }

        await userProgress.save();

        let earnedXp = 0;
        let newBadges = [];
        let leveledUp = false;
        let finalUser = null;

        if (!alreadyCompleted) {
            const user = await User.findById(userId);
            if (user) {
                const oldLevel = user.level || 1;
                const oldBadges = [...(user.badges || [])];
                
                earnedXp = (lessonId === 'final_exam') ? 50 : 10;
                user.xp = (user.xp || 0) + earnedXp;
                
                user.level = Math.floor(user.xp / 500) + 1;
                if (user.level > oldLevel) leveledUp = true;
                
                user.badges = calculateBadges(user);
                newBadges = user.badges.filter(b => !oldBadges.includes(b));
                
                await user.save();
                finalUser = user;
            }
        }

        res.json({ 
            message: 'Progresso salvo.', 
            progress: userProgress,
            gamification: {
                earnedXp,
                newBadges,
                leveledUp,
                user: finalUser ? {
                    xp: finalUser.xp,
                    level: finalUser.level,
                    badges: finalUser.badges
                } : null
            }
        });

    } catch (e) {
        console.error("Error updating progress:", e);
        res.status(500).json({ error: 'Erro ao salvar progresso.' });
    }
};
