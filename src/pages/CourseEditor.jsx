import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Save, ArrowLeft, Plus, Trash, Image as ImageIcon, Video } from 'lucide-react';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [course, setCourse] = useState({
        title: '',
        description: '',
        category: 'Front-end',
        level: 'Iniciante',
        duration: '',
        image: '',
        modulos: [], // Array of strings (module names)
        aulas: []    // Array of lesson objects
    });

    // We need a better structure for editing, but let's stick to the mismatched backend structure for compatibility.
    // Backend uses: modulos: string[], aulas: { titulo: {pt}, content: {pt}, ... }[]
    // This is hard to edit visually as "Modules containing Lessons".
    // For this editor, we will try to group them virtually or just edit lessons linearly? 
    // The user requirement says "criar módulos e aulas".
    // Let's implement a UI that MAPS lessons to modules if possible, but the backend structure is weird.
    // Let's assume a simplified structure for NEW courses where lessons have a 'module' field?
    // Or we stick to the flat list of lessons and a list of module names. 
    // Let's implement: Module List (manage strings) + Lesson List (with a dropdown to select Module).

    useEffect(() => {
        if (id) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        setLoading(true); // Assuming API endpoint supports get by ID? 
        // Our backend GET /api/courses/:slug supports slug. 
        // We passed _id in the link. We should probably update backend or iterate pending courses?
        // Let's try to fetch all professor courses and find by ID for now since we don't have a direct ID endpoint for editing specifically implemented yet (only PUT).
        // Actually PUT /api/courses/:id exists. GET /api/courses/:id does NOT exist in my previous edit (only slug).
        // I should have added GET /api/courses/:id.
        // Workaround: Fetch all professor courses and find.
        try {
            const courses = await api.getProfessorCourses();
            const found = courses.find(c => c._id === id || c.id == id);
            if (found) {
                // Flatten localized fields for editing simplicity
                setCourse({
                    ...found,
                    title: typeof found.title === 'string' ? found.title : (found.title.pt || found.title.en),
                    description: typeof found.description === 'string' ? found.description : (found.description.pt || found.description.en),
                    level: typeof found.level === 'string' ? found.level : (found.level.pt || found.level.en),
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourse(prev => ({ ...prev, [name]: value }));
    };

    // Module Management
    const addModule = () => {
        const name = prompt("Nome do Módulo:");
        if (name) {
            setCourse(prev => ({ ...prev, modulos: [...prev.modulos, name] }));
        }
    };

    const removeModule = (index) => {
        setCourse(prev => ({
            ...prev,
            modulos: prev.modulos.filter((_, i) => i !== index)
        }));
    };

    // Lesson Management
    const addLesson = () => {
        const newLesson = {
            titulo: { pt: "Nova Aula" },
            duracao: { pt: "10 min" },
            status: "livre",
            content: { pt: "" },
            video: "", // Validating "colocar vídeos"
            link: "" // or generic link
        };
        setCourse(prev => ({ ...prev, aulas: [...prev.aulas, newLesson] }));
    };

    const updateLesson = (index, field, value) => {
        const newAulas = [...course.aulas];
        // Handle nested localized fields
        if (field === 'titulo' || field === 'content' || field === 'duracao') {
            newAulas[index][field] = { pt: value, en: value };
        } else {
            newAulas[index][field] = value;
        }
        setCourse(prev => ({ ...prev, aulas: newAulas }));
    };

    const removeLesson = (index) => {
        setCourse(prev => ({
            ...prev,
            aulas: prev.aulas.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (id) {
                await api.updateCourse(id, course);
            } else {
                await api.createCourse(course);
            }
            navigate('/professor');
        } catch (error) {
            alert("Erro ao salvar curso: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/professor')} className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {id ? 'Editar Curso' : 'Criar Novo Curso'}
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações Básicas</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                            <input
                                type="text" name="title" value={course.title} onChange={handleChange} required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                            <textarea
                                name="description" value={course.description} onChange={handleChange} required rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                                <select
                                    name="category" value={course.category} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                >
                                    <option value="Front-end">Front-end</option>
                                    <option value="Back-end">Back-end</option>
                                    <option value="Mobile">Mobile</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="Fundamentos">Fundamentos</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duração</label>
                                <input
                                    type="text" name="duration" value={course.duration} onChange={handleChange} placeholder="Ex: 20h"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL da Imagem de Capa</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="text" name="image" value={course.image} onChange={handleChange} placeholder="https://..."
                                    className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                />
                                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 dark:bg-gray-600 dark:border-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                                    <ImageIcon className="h-4 w-4" />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Modules */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Módulos</h2>
                            <button type="button" onClick={addModule} className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center">
                                <Plus className="w-4 h-4 mr-1" /> Adicionar Módulo
                            </button>
                        </div>
                        {course.modulos.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">Nenhum módulo definido.</p>
                        ) : (
                            <ul className="space-y-2">
                                {course.modulos.map((mod, idx) => (
                                    <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                                        <span className="text-gray-800 dark:text-gray-200">{mod}</span>
                                        <button type="button" onClick={() => removeModule(idx)} className="text-red-500 hover:text-red-700">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Lessons */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Aulas</h2>
                            <button type="button" onClick={addLesson} className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center">
                                <Plus className="w-4 h-4 mr-1" /> Adicionar Aula
                            </button>
                        </div>

                        {course.aulas.map((aula, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Aula {idx + 1}</h3>
                                    <button type="button" onClick={() => removeLesson(idx)} className="text-red-500 hover:text-red-700 text-sm">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Título</label>
                                        <input
                                            type="text"
                                            value={aula.titulo.pt || aula.titulo}
                                            onChange={(e) => updateLesson(idx, 'titulo', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm p-1.5 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Duração</label>
                                        <input
                                            type="text"
                                            value={aula.duracao.pt || aula.duracao}
                                            onChange={(e) => updateLesson(idx, 'duracao', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm p-1.5 border"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">URL do Vídeo</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            value={aula.video || ''}
                                            onChange={(e) => updateLesson(idx, 'video', e.target.value)}
                                            placeholder="https://youtube.com/..."
                                            className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm p-1.5 border"
                                        />
                                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 dark:bg-gray-600 dark:border-gray-600 text-gray-500 dark:text-gray-300 text-sm">
                                            <Video className="h-4 w-4" />
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Conteúdo (Markdown)</label>
                                    <textarea
                                        rows={3}
                                        value={aula.content.pt || aula.content}
                                        onChange={(e) => updateLesson(idx, 'content', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm p-1.5 border"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {saving ? 'Salvando...' : 'Salvar e Enviar para Análise'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default CourseEditor;
