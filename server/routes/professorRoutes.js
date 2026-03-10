import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
    getProfessorCourses,
    getProfessorStudents,
    getStudentProfessors
} from '../controllers/professorController.js';

const router = express.Router();

router.get('/professor/courses', verifyToken, getProfessorCourses);
router.get('/professor/students', verifyToken, getProfessorStudents);
router.get('/student/professors', verifyToken, getStudentProfessors);

export default router;
