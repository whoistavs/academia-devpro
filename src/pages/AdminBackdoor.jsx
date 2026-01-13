
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminBackdoor = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Iniciando processo...");

    useEffect(() => {
        const createLocalAdmin = async () => {
            const API_URL = "https://devpro-backend.onrender.com/api";
            try {
                setStatus("Conectando ao servidor...");

                
                const res = await fetch(`${API_URL}/cadastro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: "Super Admin Local",
                        email: "admin.local@devpro.com",
                        password: "admin",
                        role: "admin"
                    })
                });

                if (res.ok || res.status === 400) {
                    setStatus("Conta localizada. Fazendo login...");

                    
                    const loginRes = await fetch(`${API_URL}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: "admin.local@devpro.com",
                            password: "admin"
                        })
                    });

                    const data = await loginRes.json();

                    if (data.accessToken) {
                        setStatus("Sucesso! Entrando como Admin...");

                        
                        login({
                            id: data.id,
                            name: data.name,
                            email: data.email,
                            role: 'admin',
                            avatar: data.avatar
                        }, data.accessToken);

                        
                        setTimeout(() => {
                            navigate('/admin');
                        }, 1500);
                    } else {
                        setStatus("Erro no Login: " + (data.error || "Senha incorreta?"));
                        console.error(data);
                    }
                } else {
                    setStatus("Erro ao criar conta: " + res.status);
                }
            } catch (e) {
                setStatus("Erro Conexão: " + e.message);
            }
        };

        createLocalAdmin();

    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-red-900 text-white flex-col p-8 text-center font-sans">
            <h1 className="text-3xl font-bold mb-6 text-yellow-300">⚠️ MODO DE RECUPERAÇÃO DE ADMIN ⚠️</h1>
            <div className="bg-red-800 p-6 rounded-lg shadow-lg border border-red-700 w-full max-w-md">
                <p className="text-xl font-mono mb-4 animate-pulse">{status}</p>
                <p className="text-sm opacity-60">Se travar aqui, verifique o Console (F12).</p>
            </div>
            <button
                onClick={() => navigate('/')}
                className="mt-8 px-4 py-2 bg-white text-red-900 rounded hover:bg-gray-200"
            >
                Cancelar
            </button>
        </div>
    );
};

export default AdminBackdoor;
