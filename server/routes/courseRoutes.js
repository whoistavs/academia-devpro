import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import {
    getCourses,
    createCourse,
    updateCourse,
    getCourseByIdStrict,
    getCourseBySlug,
    getTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    getReviews,
    addReview,
    validateCertificate,
    getComments,
    addComment
} from '../controllers/courseController.js';

const router = express.Router();

// Courses
router.get('/courses', getCourses);
router.post('/courses', verifyToken, verifyAdmin, createCourse);
router.put('/courses/:id', verifyToken, verifyAdmin, updateCourse);
router.get('/courses/id/:id', getCourseByIdStrict);
router.get('/courses/:slug', getCourseBySlug);

// Reviews
router.get('/courses/:id/reviews', getReviews);
router.post('/courses/:id/reviews', verifyToken, addReview);

// Tracks
router.get('/tracks', getTracks);
router.post('/tracks', verifyToken, verifyAdmin, createTrack);
router.put('/tracks/:id', verifyToken, verifyAdmin, updateTrack);
router.delete('/tracks/:id', verifyToken, verifyAdmin, deleteTrack);

// Certificates
router.get('/certificates/validate/:code', validateCertificate);

// Comments
router.get('/comments/:courseSlug/:lessonIndex', getComments);
router.post('/comments', verifyToken, addComment);

export default router;
