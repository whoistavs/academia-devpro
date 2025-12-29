import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, BookOpen, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const ProfessorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || (user.role !== 'professor' && user.role !== 'admin')) {
            navigate('/dashboard');
            return;
        }
        fetchCourses();
    }, [user, navigate]);

    const fetchCourses = async () => {
        try {
            const data = await api.getProfessorCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center">Carregando...</div>;

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <BookOpen className="w-8 h-8 mr-3 text-indigo-600" />
                            Painel do Professor
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Gerencie seus cursos e crie novos conteúdos.
                        </p>
                    </div>
                    <Link
                        to="/professor/editor"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Criar Novo Curso
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div key={course.id || course._id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="p-5 flex-grow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${course.status === 'published' ? 'bg-green-100 text-green-800' :
                                            course.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {course.status === 'published' ? 'Publicado' :
                                            course.status === 'rejected' ? 'Rejeitado' : 'Em Análise'}
                                    </span>
                                    <span className="text-gray-500 text-xs">{course.category}</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={course.title.pt || course.title}>
                                    {typeof course.title === 'object' ? (course.title.pt || course.title.en) : course.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {typeof course.description === 'object' ? (course.description.pt || course.description.en) : course.description}
                                </p>
                                <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                    {course.duration}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                                <Link
                                    to={`/professor/editor/${course._id || course.id}`}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                                >
                                    Editar
                                </Link>
                            </div>
                        </div>
                    ))}

                    {courses.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum curso criado</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece criando seu primeiro curso para compartilhar conhecimento.</p>
                            <div className="mt-6">
                                <Link
                                    to="/professor/editor"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Criar Curso
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ProfessorDashboard;
