// server/controllers/courseController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';
import Track from '../models/Track.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Comment from '../models/Comment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'published' });
        
        // Enhance courses with ratings
        const coursesWithRatings = await Promise.all(courses.map(async (course) => {
            const reviews = await Review.find({ courseId: String(course._id) });
            const total = reviews.length;
            const average = total > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
                : 0;
            
            return {
                ...course.toObject(),
                rating: parseFloat(average),
                reviewsCount: total
            };
        }));

        res.json(coursesWithRatings);
    } catch (e) {
        console.error("Error fetching courses:", e);
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
}

export const createCourse = async (req, res) => {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão negada.' });
    }

    const { title, description, category, level, image, duration, price, modulos, aulas, language } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    const titleText = typeof title === 'string' ? title : (title.pt || title.en || 'curso');
    const slug = titleText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now().toString(36);

    try {
        const newCourse = new Course({
            title, description, category, level, image, duration, slug,
            price: price || 0,
            modulos: modulos || [],
            aulas: aulas || [],
            language: language || 'pt',
            authorId: req.user.id,
            status: req.user.role === 'admin' ? 'published' : 'pending'
        });

        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar curso.' });
    }
}

export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });

        const isOwner = course.authorId === req.user.id;
        const isSystemCourse = !course.authorId || course.authorId === 'admin';
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !(isAdmin && isSystemCourse)) {
            return res.status(403).json({ error: 'Permissão negada. Admin só edita cursos do Sistema ou Próprios.' });
        }

        Object.assign(course, req.body);

        course.markModified('modulos');
        course.markModified('aulas');

        await course.save();

        try {
            const coursesPath = path.join(__dirname, 'courses.json');
            if (fs.existsSync(coursesPath)) {
                let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));
                const idx = courses.findIndex(c => String(c._id) === String(course._id) || c.slug === course.slug);

                if (idx >= 0) {
                    const courseObj = course.toObject();
                    if (courseObj._id) courseObj._id = courseObj._id.toString();
                    courses[idx] = { ...courses[idx], ...courseObj };
                    fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 2));
                    console.log(`PERSISTENCE SUCCESS: Updated '${course.title}' in courses.json`);
                } else {
                    console.warn(`PERSISTENCE WARNING: Could not find '${course.title}' (Slug: ${course.slug}, ID: ${course._id}) in courses.json`);
                }
            }
        } catch (err) {
            console.error("Failed to persist course update:", err);
        }

        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar.' });
    }
}

export const getCourseByIdStrict = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });
        
        const reviews = await Review.find({ courseId: String(course._id) });
        const total = reviews.length;
        const average = total > 0 
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
            : 0;

        const courseObj = course.toObject();
        courseObj.rating = parseFloat(average);
        courseObj.reviewsCount = total;

        res.json(courseObj);
    } catch (e) {
        res.status(500).json({ error: 'Erro no servidor.' });
    }
}

export const getCourseBySlug = async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });

        let authorName = 'Professor';
        if (course.authorId === 'admin') authorName = 'DevPro Oficial';
        else if (course.authorId) {
            try {
                const author = await User.findById(course.authorId);
                if (author) authorName = author.name;
            } catch (e) { }
        }

        const reviews = await Review.find({ courseId: String(course._id) });
        const total = reviews.length;
        const average = total > 0 
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
            : 0;

        const courseObj = course.toObject();
        courseObj.authorName = authorName;
        courseObj.rating = parseFloat(average);
        courseObj.reviewsCount = total;

        res.json(courseObj);
    } catch (e) {
        res.status(500).json({ error: 'Erro no servidor.' });
    }
}

export const getTracks = async (req, res) => {
    try {
        const tracks = await Track.find().sort({ order: 1 });
        res.json(tracks);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar trilhas' });
    }
}

export const createTrack = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    try {
        const newTrack = await Track.create(req.body);
        res.status(201).json(newTrack);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao criar trilha: ' + e.message });
    }
}

export const updateTrack = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    try {
        // Use findOneAndUpdate with "id" (string) or "_id" (mongo)? 
        // Frontend sends the string ID (e.g. "fullstack-master") usually as param if we use that as route.
        // Let's assume params.id matches the DB 'id' field OR '_id'.
        // Safer to try both or rely on what we send.

        let track = await Track.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!track) {
            // Try by ObjectId
            if (req.params.id.length === 24) {
                track = await Track.findByIdAndUpdate(req.params.id, req.body, { new: true });
            }
        }

        if (!track) return res.status(404).json({ error: 'Trilha não encontrada' });
        res.json(track);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao atualizar: ' + e.message });
    }
}

export const deleteTrack = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    try {
        let result = await Track.findOneAndDelete({ id: req.params.id });
        if (!result && req.params.id.length === 24) {
            result = await Track.findByIdAndDelete(req.params.id);
        }

        if (!result) return res.status(404).json({ error: 'Trilha não encontrada' });
        res.json({ message: 'Trilha removida' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao remover: ' + e.message });
    }
}

export const validateCertificate = async (req, res) => {
    try {
        const { code } = req.params;
        const user = await User.findOne({ 'certificates.code': code });

        if (!user) {
            return res.json({ valid: false });
        }

        const cert = user.certificates.find(c => c.code === code);
        const course = await Course.findById(cert.courseId);

        res.json({
            valid: true,
            studentName: user.name,
            courseTitle: course ? (typeof course.title === 'string' ? course.title : (course.title.pt || course.title.en)) : 'Curso Removido',
            date: cert.date
        });
    } catch (error) {
        console.error("Certificate validation error:", error);
        res.status(500).json({ error: 'Failed to validate certificate' });
    }
}

export const getReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ courseId: id }).sort({ createdAt: -1 });


        const total = reviews.length;
        const average = total > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
            : 0;

        res.json({ reviews, average, total });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
}

export const addReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating) return res.status(400).json({ error: 'Nota é obrigatória.' });

    try {
        const user = await User.findById(req.user.id);






        const reviewData = {
            courseId: id,
            userId: user._id,
            userName: user.name,
            userAvatar: user.avatar,
            rating,
            comment,
            createdAt: new Date()
        };


        const review = await Review.findOneAndUpdate(
            { courseId: id, userId: user._id },
            reviewData,
            { new: true, upsert: true }
        );

        res.json(review);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao salvar avaliação.' });
    }
}

export const getComments = async (req, res) => {
    try {
        const { courseSlug, lessonIndex } = req.params;
        const comments = await Comment.find({ 
            courseSlug, 
            lessonIndex: Number(lessonIndex) 
        }).sort({ createdAt: -1 });
        res.json(comments);

    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar comentários' });
    }
}

export const addComment = async (req, res) => {
    try {
        const { courseSlug, lessonIndex, content } = req.body;
        const user = await User.findById(req.user.id);

        const newComment = new Comment({
            courseSlug,
            lessonIndex,
            userId: user._id,
            userName: user.name,
            userAvatar: user.avatar,
            content
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao postar comentário' });
    }
}

