import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { User, Award, Github, Linkedin, Globe, Twitter, ArrowLeft, Star, Flame, BookOpen, ExternalLink, Calendar, X } from 'lucide-react';
import Skeleton, { SkeletonCard } from '../components/Skeleton';

const PublicProfile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await api.getPublicProfile(username);
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="glass-premium rounded-3xl p-8 mb-8 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mb-4"></div>
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 flex items-center justify-center">
                <div className="text-center glass-premium p-12 rounded-3xl">
                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full inline-block mb-4">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold dark:text-white mb-2">Perfil não encontrado</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Este perfil é privado ou não existe.'}</p>
                    <Link to="/cursos" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                        <ArrowLeft className="w-5 h-5 mr-2" />Voltar aos Cursos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-20 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Profile Header */}
                <div className="glass-premium rounded-3xl p-8 mb-8 relative z-10 border-none ring-1 ring-white/20 dark:ring-indigo-500/20 text-center flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-indigo-500" />
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 shadow-md"></div>
                    </div>

                    <h1 className="text-3xl font-extrabold premium-gradient-text mb-2">{profile.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">
                        <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                            @{profile.username}
                        </span>
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Membro desde {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR', { year: 'numeric' }) : '...'}
                        </span>
                    </div>

                    {profile.bio && (
                        <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-6 leading-relaxed">
                            {profile.bio}
                        </p>
                    )}

                    {/* Social Links */}
                    <div className="flex flex-wrap justify-center gap-4">
                        {profile.socialLinks?.github && (
                            <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 transition-all shadow-md active:scale-95">
                                <Github className="w-6 h-6" />
                            </a>
                        )}
                        {profile.socialLinks?.linkedin && (
                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-md active:scale-95">
                                <Linkedin className="w-6 h-6" />
                            </a>
                        )}
                        {profile.socialLinks?.twitter && (
                            <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-blue-400 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-md active:scale-95">
                                <Twitter className="w-6 h-6" />
                            </a>
                        )}
                        {profile.socialLinks?.website && (
                            <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all shadow-md active:scale-95">
                                <Globe className="w-6 h-6" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass rounded-2xl p-6 text-center shadow-lg border-none ring-1 ring-white/10 dark:ring-gray-700/30">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Dose Diária</p>
                        <div className="flex items-center justify-center text-orange-500 gap-1.5 font-black text-2xl">
                            <Flame className="w-6 h-6 fill-current" />
                            {profile.streak || 0}
                        </div>
                    </div>
                    <div className="glass rounded-2xl p-6 text-center shadow-lg border-none ring-1 ring-white/10 dark:ring-gray-700/30">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nível Atual</p>
                        <div className="text-indigo-600 dark:text-indigo-400 font-black text-2xl">
                            {profile.level || 1}
                        </div>
                    </div>
                    <div className="glass rounded-2xl p-6 text-center shadow-lg border-none ring-1 ring-white/10 dark:ring-gray-700/30">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Experiência</p>
                        <div className="text-purple-600 dark:text-purple-400 font-black text-2xl">
                            {profile.xp || 0} XP
                        </div>
                    </div>
                    <div className="glass rounded-2xl p-6 text-center shadow-lg border-none ring-1 ring-white/10 dark:ring-gray-700/30">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Certificados</p>
                        <div className="text-green-600 dark:text-green-400 font-black text-2xl">
                            {profile.certificates?.length || 0}
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Badges Column */}
                    <div className="space-y-6">
                        <div className="glass rounded-3xl p-6 h-full shadow-xl border-none ring-1 ring-white/10 dark:ring-indigo-500/10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Award className="w-5 h-5 mr-3 text-indigo-500" />
                                Conquistas
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {profile.badges && profile.badges.length > 0 ? (
                                    profile.badges.map(badgeId => {
                                        let BadgeIcon = Award;
                                        let title = "Conquista";
                                        let colorClass = "text-indigo-500";
                                        let bgClass = "bg-indigo-100 dark:bg-indigo-900/40";

                                        if (badgeId === 'first_100_xp') {
                                            BadgeIcon = Star;
                                            title = "Iniciante Promissor";
                                            colorClass = "text-yellow-500";
                                            bgClass = "bg-yellow-100 dark:bg-yellow-900/40";
                                        } else if (badgeId.startsWith('streak')) {
                                            BadgeIcon = Flame;
                                            title = `Mestre do Fogo (${badgeId.split('_')[1]} dias)`;
                                            colorClass = "text-orange-500";
                                            bgClass = "bg-orange-100 dark:bg-orange-900/40";
                                        } else if (badgeId === 'first_certificate') {
                                            title = "Graduado (1º Certificado)";
                                            colorClass = "text-green-500";
                                            bgClass = "bg-green-100 dark:bg-green-900/40";
                                        }

                                        return (
                                            <div key={badgeId} className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm relative group overflow-hidden">
                                                <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass} transition-transform group-hover:scale-110`}>
                                                    <BadgeIcon className="w-6 h-6" />
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 py-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[8px] font-bold text-center block leading-tight px-1 dark:text-white uppercase tracking-tighter">{title}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-3 text-center py-8">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 opacity-50">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-tight">Novas conquistas em breve!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Courses/Certificates Column */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="glass rounded-3xl p-6 shadow-xl border-none ring-1 ring-white/10 dark:ring-indigo-500/10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <BookOpen className="w-5 h-5 mr-3 text-purple-500" />
                                Certificados Concluídos
                            </h3>
                            <div className="space-y-4">
                                {profile.certificates && profile.certificates.length > 0 ? (
                                    profile.certificates.map((cert, idx) => (
                                        <div key={idx} className="glass rounded-2xl p-5 hover:scale-[1.02] transition-all bg-white/30 dark:bg-gray-800/30 border-none ring-1 ring-white/10 dark:ring-gray-700/30 flex items-center justify-between group">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl mr-4 group-hover:rotate-12 transition-transform">
                                                    <Award className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white pr-2">Certificado de Conclusão</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {cert.code}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-gray-400 mb-2">{new Date(cert.date).toLocaleDateString('pt-BR')}</span>
                                                <Link to={`/certificado/validar?code=${cert.code}`} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center">
                                                    Validar <ExternalLink className="w-3 h-3 ml-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                                        <Award className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">O estudante está trilhando seu caminho!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PublicProfile;
