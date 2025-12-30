
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Users, ShieldAlert, Edit, BookOpen } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '../components/TableSkeleton';
import CourseSkeleton from '../components/CourseSkeleton'; // Reuse for pending courses maybe? or just generic loading text for that small section

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Redirect if not admin
    React.useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // FETCH DATA WITH REACT QUERY
    const { data: users = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: api.getUsers,
        enabled: user?.role === 'admin'
    });

    const { data: courses = [], isLoading: loadingCourses } = useQuery({
        queryKey: ['courses', 'all'], // distinct key from public courses
        queryFn: () => api.getCourses("all=true"),
        enabled: user?.role === 'admin'
    });


    // ACTIONS
    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
        try {
            await api.adminDeleteUser(id);
            // Invalidate cache to refetch automatically
            queryClient.invalidateQueries(['users']);
        } catch (err) {
            alert('Erro ao excluir usuário.');
        }
    };

    const handleRoleChange = async (id, currentRole) => {
        let newRole = 'student';
        if (currentRole === 'student' || !currentRole) newRole = 'professor';
        else if (currentRole === 'professor') newRole = 'admin';
        else if (currentRole === 'admin') newRole = 'student';

        if (!window.confirm(`Deseja alterar o nível de acesso para: ${newRole}?`)) return;

        try {
            await api.updateUserRole(id, newRole);
            queryClient.invalidateQueries(['users']);
        } catch (err) {
            alert('Erro ao atualizar função.');
        }
    };

    const handleCourseStatus = async (courseId, status) => {
        if (!window.confirm(`Deseja mudar o status para: ${status}?`)) return;
        try {
            await api.updateCourseStatus(courseId, status);
            queryClient.invalidateQueries(['courses', 'all']);
            queryClient.invalidateQueries(['courses']); // Update public list too
        } catch (e) {
            alert("Erro ao moderar curso");
        }
    };

    if (!user || user.role !== 'admin') return null;

    const pendingCourses = courses.filter(c => c.status === 'pending');

    // Helper to safe display titles
    const getTitle = (c) => typeof c.title === 'string' ? c.title : (c.title?.pt || c.title?.en || "Curso");

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <ShieldAlert className="w-8 h-8 mr-3 text-red-600" />
                        Painel Administrativo
                    </h1>
                </div>

                {/* COURSE APPROVALS */}
                {loadingCourses ? (
                    <div className="mb-8"><TableSkeleton rows={2} /></div>
                ) : pendingCourses.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-amber-200 dark:border-amber-700 mb-8">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
                            <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-100 flex items-center">
                                <ShieldAlert className="w-5 h-5 mr-2" />
                                Aprovação de Cursos Pendentes ({pendingCourses.length})
                            </h2>
                        </div>
                        <div className="p-6">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {pendingCourses.map(course => (
                                    <li key={course.id} className="py-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                {getTitle(course)}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Autor ID: {course.authorId} | Categoria: {course.category}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleCourseStatus(course._id || course.id, 'published')}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                                            >
                                                Aprovar
                                            </button>
                                            <button
                                                onClick={() => handleCourseStatus(course._id || course.id, 'rejected')}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
                                            >
                                                Rejeitar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}


                {/* ALL COURSES MANAGEMENT */}
                {loadingCourses ? (
                    <div className="mb-8"><TableSkeleton rows={3} /></div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-900 mb-8">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
                            <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2" />
                                Gerenciar Cursos ({courses.length})
                            </h2>
                        </div>
                        <div className="p-6">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                                {courses.map(course => (
                                    <li key={course.id} className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 px-2 rounded -mx-2">
                                        <div className="flex items-center">
                                            {course.status === 'published' ? (
                                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-3" title="Publicado"></span>
                                            ) : course.status === 'pending' ? (
                                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-3 animate-pulse" title="Pendente"></span>
                                            ) : (
                                                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-3" title="Rascunho/Outro"></span>
                                            )}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {getTitle(course)}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {course.status.toUpperCase()} | Aulas: {course.aulas?.length || 0}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/professor/editor/${course._id || course.id}`)}
                                                className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                                title="Editar Curso"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {/* We can add delete here later */}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* USERS TABLE */}

                {loadingUsers ? (
                    <TableSkeleton rows={8} />
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Usuários Cadastrados ({users.length})
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-gray-600 dark:text-gray-300">
                                <thead className="bg-gray-100 dark:bg-gray-700 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Função</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium flex items-center">
                                                {u.avatar && <img src={u.avatar} alt="" className="w-6 h-6 rounded-full mr-2 object-cover" />}
                                                {u.name}
                                            </td>
                                            <td className="px-6 py-4">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => u.id !== user.id && handleRoleChange(u.id, u.role)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all transform active:scale-95
                                                        ${u.role === 'admin' ? 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200' :
                                                            u.role === 'professor' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200' :
                                                                'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'}`}
                                                    title={u.id !== user.id ? "Alterar: Estudante -> Professor -> Admin" : "Atual"}
                                                    disabled={u.id === user.id}
                                                    style={{ minWidth: '80px' }}
                                                >
                                                    {(u.role || 'student').toUpperCase()}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {u.id !== user.id && (
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                                        title="Excluir Usuário"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                                Nenhum usuário encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default AdminDashboard;
