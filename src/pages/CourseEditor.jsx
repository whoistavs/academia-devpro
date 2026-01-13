import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Save, ArrowLeft, Trash, Plus } from 'lucide-react';
import PasswordConfirmationModal from '../components/PasswordConfirmationModal';
import { ModuleCard } from '../components/editor/ModuleCard';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    
    const [course, setCourse] = useState({
        title: '',
        description: '',
        category: 'Front-end',
        level: 'Iniciante',
        duration: '',
        image: '',
        language: 'pt',
        modulos: [], 
        aulas: []    
    });

    useEffect(() => {
        if (id) {
            fetchCourse();
        } else {
            
            setCourse(prev => ({
                ...prev,
                modulos: [{ title: 'Módulo 1', items: [] }]
            }));
        }
    }, [id]);

    
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const fetchCourse = async () => {
        setLoading(true);
        try {
            
            const found = await api.getCourseById(id);

            if (found) {
                
                
                let editorModules = (found.modulos || []).map(m => {
                    if (!m) return null;
                    let mod = typeof m === 'string' ? { title: m, items: [] } : m;
                    
                    return {
                        ...mod,
                        title: typeof mod.title === 'string' ? mod.title : (mod.title?.pt || mod.title?.en || 'Módulo'),
                        items: mod.items || mod.lessons || [],
                        _uiId: generateId() 
                    };
                }).filter(Boolean);

                
                
                const hasItems = editorModules.some(m => m.items && m.items.length > 0);

                if (!hasItems && found.aulas && found.aulas.length > 0) {
                    if (editorModules.length === 0) {
                        editorModules.push({ title: "Módulo Recuperado", items: [], _uiId: generateId() });
                    }
                    
                    
                    editorModules[0].items = found.aulas.map(a => ({
                        type: a.questions ? 'quiz' : 'lesson',
                        ...a,
                        
                        titulo: typeof a.titulo === 'string' ? { pt: a.titulo } : a.titulo,
                        duracao: typeof a.duracao === 'string' ? { pt: a.duracao } : a.duracao,
                        content: typeof a.content === 'string' ? { pt: a.content } : a.content
                    }));
                }

                setCourse({
                    ...found,
                    title: typeof found.title === 'string' ? found.title : (found.title?.pt || found.title?.en || ''),
                    description: typeof found.description === 'string' ? found.description : (found.description?.pt || found.description?.en || ''),
                    level: typeof found.level === 'string' ? found.level : (found.level?.pt || found.level?.en || 'Iniciante'),
                    image: found.image || '',
                    language: found.language || 'pt',
                    category: found.category || 'Front-end',
                    duration: found.duration || '',
                    modulos: editorModules
                });
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao carregar dados do curso.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourse(prev => ({ ...prev, [name]: value }));
    };

    

    const addModule = () => {
        setCourse(prev => ({
            ...prev,
            modulos: [...prev.modulos, { title: `Novo Módulo`, items: [], _uiId: generateId() }]
        }));
    };

    const addFinalExam = () => {
        setCourse(prev => ({
            ...prev,
            modulos: [...prev.modulos, {
                title: "Prova Final",
                items: [{ type: 'quiz', questions: [], title: "Prova Final Obrigatória" }],
                _uiId: generateId()
            }]
        }));
    };

    const updateModule = (index, field, value) => {
        setCourse(prev => {
            const newModules = [...prev.modulos];
            newModules[index] = { ...newModules[index], [field]: value };
            return { ...prev, modulos: newModules };
        });
    };

    const removeModule = (index) => {
        
        setCourse(prev => {
            const newModulos = prev.modulos.filter((_, i) => i !== index);
            return {
                ...prev,
                modulos: newModulos
            };
        });
    };

    

    const handleDeleteCourse = async () => {
        try {
            await api.deleteCourse(id);
            navigate('/professor');
        } catch (error) {
            alert('Erro ao excluir curso: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            
            
            const flatLessons = [];

            course.modulos.forEach(mod => {
                if (mod.items && mod.items.length > 0) {
                    mod.items.forEach(item => {
                        
                        const safeItem = { ...item };
                        if (safeItem.type === 'lesson' && !safeItem.titulo) safeItem.titulo = { pt: "Sem Título" };
                        
                        safeItem.moduleTitle = mod.title;
                        flatLessons.push(safeItem);
                    });
                }
            });

            
            const cleanModules = course.modulos.map(({ _uiId, ...rest }) => rest);

            const payload = {
                ...course,
                aulas: flatLessons,
                modulos: cleanModules
            };

            if (id) {
                await api.updateCourse(id, payload);
            } else {
                await api.createCourse(payload);
            }
            
            alert("Curso salvo com sucesso!");
            navigate('/professor');
        } catch (error) {
            alert("Erro ao salvar curso: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/professor')} className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {id ? 'Editar Conteúdo do Curso' : 'Criar Novo Curso'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {id && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center transition-colors font-medium"
                            >
                                <Trash className="w-5 h-5 mr-2" />
                                Excluir
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>

                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    {}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Informações Básicas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título do Curso</label>
                                <input
                                    type="text" name="title" value={course.title} onChange={handleChange} required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-3 border"
                                    placeholder="Ex: Formação Fullstack Developer Empreendedor"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                                <textarea
                                    name="description" value={course.description} onChange={handleChange} required rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-3 border"
                                    placeholder="Descreva o que o aluno vai aprender..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                                <select
                                    name="category" value={course.category} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-3 border"
                                >
                                    <option value="Front-end">Front-end</option>
                                    <option value="Back-end">Back-end</option>
                                    <option value="Mobile">Mobile</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="Fundamentos">Fundamentos</option>
                                    <option value="Design">Design</option>
                                    <option value="Carreira">Carreira</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nível</label>
                                <select
                                    name="level" value={course.level} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-3 border"
                                >
                                    <option value="Iniciante">Iniciante</option>
                                    <option value="Intermediário">Intermediário</option>
                                    <option value="Avançado">Avançado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duração Estimada</label>
                                <input
                                    type="text" name="duration" value={course.duration} onChange={handleChange} placeholder="Ex: 20h"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-3 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL da Imagem de Capa</label>
                                <input
                                    type="text" name="image" value={course.image} onChange={handleChange} placeholder="https://..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-3 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Idioma do Curso</label>
                                <select
                                    name="language" value={course.language} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-3 border"
                                >
                                    <option value="pt">Português</option>
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="zh">中文 (Chinese)</option>
                                    <option value="ar">العربية (Arabic)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço (R$)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={course.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-3 border"
                                />
                                <p className="text-xs text-gray-500 mt-1">Deixe 0 para cursos gratuitos. 10% de taxa da plataforma será aplicada.</p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b pb-4 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Grade Curricular</h2>
                            <div className="flex gap-3">
                                <button type="button" onClick={addModule} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                                    <Plus className="w-5 h-5 mr-1" /> Novo Módulo
                                </button>
                                <button type="button" onClick={addFinalExam} className="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                                    <Plus className="w-5 h-5 mr-1" /> Prova Final
                                </button>
                            </div>
                        </div>

                        {course.modulos.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 text-lg mb-4">Comece adicionando o primeiro módulo do curso.</p>
                                <button type="button" onClick={addModule} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-indigo-700 transition">
                                    Adicionar Módulo
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {course.modulos.map((modulo, idx) => (
                                    <ModuleCard
                                        key={modulo._uiId || idx} 
                                        module={modulo}
                                        index={idx}
                                        updateModule={updateModule}
                                        removeModule={removeModule}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </form>
            </div>

            <PasswordConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteCourse}
                title="Excluir Curso"
                message="Tem certeza que deseja excluir este curso permanentemente? Todos os dados serão perdidos."
            />


        </main>
    );
};

export default CourseEditor;
