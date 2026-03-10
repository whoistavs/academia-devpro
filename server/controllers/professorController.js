// server/controllers/professorController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getProfessorCourses = async (req, res) => {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado.' });
    }
    try {
        const courses = await Course.find({ authorId: req.user.id });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
}

export const getProfessorStudents = async (req, res) => {
    try {

        const myCourses = await Course.find({ authorId: req.user.id });
        const myCourseIds = myCourses.map(c => c._id.toString());



        const students = await User.find({
            purchasedCourses: { $in: myCourseIds }
        }).select('name email avatar purchasedCourses');


        const richStudents = students.map(s => {
            const boughtMyCourses = myCourses.filter(c =>
                s.purchasedCourses.includes(c._id.toString()) ||
                s.purchasedCourses.includes(c._id)
            );
            return {
                id: s._id,
                name: s.name,
                email: s.email,
                avatar: s.avatar,
                courses: boughtMyCourses.map(c => c.title)
            };
        });

        res.json(richStudents);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao buscar alunos.' });
    }
}

export const getStudentProfessors = async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await User.findById(studentId);

        if (!student.purchasedCourses || student.purchasedCourses.length === 0) {
            return res.json([]);
        }


        const purchasedCourses = await Course.find({
            _id: { $in: student.purchasedCourses }
        });


        const authorIds = [...new Set(purchasedCourses.map(c => c.authorId))];


        const professors = await User.find({
            _id: { $in: authorIds }
        }).select('name email avatar role');


        const richProfessors = professors.map(p => {
            const coursesTaught = purchasedCourses
                .filter(c => c.authorId === p._id.toString() || c.authorId === p.id)
                .map(c => c.title);

            return {
                id: p._id,
                name: p.name,
                email: p.email,
                avatar: p.avatar,
                role: p.role,
                courses: coursesTaught
            };
        });

        res.json(richProfessors);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao buscar professores.' });
    }
}

