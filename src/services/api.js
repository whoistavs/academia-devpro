
import { useNavigate } from "react-router-dom";

// Centralized API Configuration
// Centralized API Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

console.log("API Service Configured with URL:", API_URL);

const getHeaders = (params = {}) => {
    const user = JSON.parse(localStorage.getItem("user"));
    // AuthContext stores token separately in 'token' key
    const token = localStorage.getItem("token") || user?.accessToken;

    const headers = {
        Authorization: token ? `Bearer ${token}` : "",
    };

    // If 'json' is true (default), add Content-Type: application/json
    // If uploading files (FormData), we must NOT set Content-Type manually
    if (params.json !== false) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

export const api = {
    // --- Public / General ---
    getCourses: async (params = "") => {
        const query = params ? `?${params}` : "";
        const res = await fetch(`${API_URL}/courses${query}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
    },
    getCourse: async (slug) => {
        const res = await fetch(`${API_URL}/courses/${slug}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch course");
        return res.json();
    },
    getCourseById: async (id) => {
        const res = await fetch(`${API_URL}/courses/id/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch course by ID");
        return res.json();
    },

    // --- Authentication ---
    login: async (email, password, rememberMe = false) => {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, rememberMe }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Login fail");
        }
        return res.json();
    },
    resendVerification: async (email) => {
        const res = await fetch(`${API_URL}/resend-verification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Erro ao reenviar");
        }
        return res.json();
    },
    forgotPassword: async (email, language = 'pt') => {
        const res = await fetch(`${API_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, language }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Erro ao solicitar reset");
        }
        return res.json();
    },
    validateCode: async (email, code, language = 'pt') => {
        const res = await fetch(`${API_URL}/validate-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, language }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Código inválido");
        }
        return res.json();
    },
    resetPassword: async (email, code, newPassword, language = 'pt') => {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword, language }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Erro ao redefinir senha");
        }
        return res.json();
    },
    register: async (userData) => {
        // userData can contain { name, email, password, role, ... }
        const res = await fetch(`${API_URL}/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Register fail");
        }
        return res.json();
    },
    verifyPassword: async (password) => {
        const res = await fetch(`${API_URL}/auth/verify-password`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Senha incorreta");
        }
        return res.json();
    },

    // --- User Self-Management ---
    getMe: async () => {
        const res = await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to get profile");
        return res.json();
    },
    updateMe: async (data) => {
        const res = await fetch(`${API_URL}/users/me`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to update profile");
        }
        return res.json();
    },
    completeProfile: async (data) => {
        const res = await fetch(`${API_URL}/user/complete-profile`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to complete profile");
        }
        return res.json();
    },
    deleteMe: async () => {
        // Preferencialmente via POST tunnel para evitar bloqueios de método DELETE
        const res = await fetch(`${API_URL}/users/delete-me`, {
            method: "POST", // Using POST as fail-safe
            headers: getHeaders()
        });

        // Handle specific auth errors that suggest account is already gone
        if (res.status === 401 || res.status === 403 || res.status === 404) {
            throw new Error("ACCOUNT_GONE");
        }

        if (!res.ok) throw new Error("Failed to delete account");
        return res.json(); // or text
    },
    changePassword: async (oldPassword, newPassword, language = 'pt') => {
        const res = await fetch(`${API_URL}/users/change-password`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ oldPassword, newPassword, language }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed match password");
        }
        return res.json();
    },
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: getHeaders({ json: false }), // Let browser set boundary
            body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload image");
        return res.json();
    },


    // --- Student Progress ---
    getProgress: async (courseId) => {
        const res = await fetch(`${API_URL}/progress/${courseId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch progress");
        return res.json();
    },
    updateProgress: async (data) => {
        // data: { courseId, lessonId, quizScore }
        const res = await fetch(`${API_URL}/progress/update`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed update progress");
        return res.json();
    },

    // --- Professor / Admin Content ---
    createCourse: async (courseData) => {
        const res = await fetch(`${API_URL}/courses`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(courseData),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed create course");
        }
        return res.json();
    },
    updateCourse: async (id, courseData) => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(courseData),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed update course");
        }
        return res.json();
    },
    getProfessorCourses: async () => {
        const res = await fetch(`${API_URL}/professor/courses`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch my courses");
        return res.json();
    },
    updateCourseStatus: async (id, status) => {
        const res = await fetch(`${API_URL}/courses/${id}/status`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed status update");
        return res.json();
    },
    deleteCourse: async (id) => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed delete course");
        }
        return res.json();
    },


    // --- Admin User Management ---
    getUsers: async () => {
        const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed users fetch");
        return res.json();
    },
    updateUserRole: async (userId, role) => {
        const res = await fetch(`${API_URL}/users/${userId}/role`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ role }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed role update");
        }
        return res.json();
    },
    adminDeleteUser: async (userId) => {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed admin delete user");
        return res.json();
    },
    getFinancials: async () => {
        const res = await fetch(`${API_URL}/admin/financials`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch financials");
        return res.json();
    },
    requestPayout: async () => {
        const res = await fetch(`${API_URL}/admin/payout`, {
            method: "POST",
            headers: getHeaders()
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed request payout");
        }
        return res.json();
    },

    // --- Approvals ---
    getPendingApprovals: async () => {
        const res = await fetch(`${API_URL}/admin/approvals`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch approvals");
        return res.json();
    },
    approveTransaction: async (id) => {
        const res = await fetch(`${API_URL}/admin/approve/${id}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed approve");
        return res.json();
    },
    rejectTransaction: async (id) => {
        const res = await fetch(`${API_URL}/admin/reject/${id}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed reject");
        return res.json();
    },

    // --- Professor Payouts ---
    getProfessorDebts: async () => {
        const res = await fetch(`${API_URL}/admin/debts`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch debts");
        return res.json();
    },
    registerManualPayout: async (data) => {
        // data: { professorId, amount, notes }
        const res = await fetch(`${API_URL}/admin/payouts/manual`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed payout");
        return res.json();
    },

    // --- Professor Students & Chat ---
    getProfessorStudents: async () => {
        const res = await fetch(`${API_URL}/professor/students`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch students");
        return res.json();
    },
    getStudentProfessors: async () => {
        const res = await fetch(`${API_URL}/student/professors`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch professors");
        return res.json();
    },
    getChatMessages: async (userId) => {
        const res = await fetch(`${API_URL}/chat/${userId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch chat");
        return res.json();
    },
    sendChatMessage: async (data) => {
        // data: { receiverId, content, file? } or FormData
        const headers = getHeaders();
        let body;

        if (data instanceof FormData) {
            delete headers['Content-Type']; // Let browser set boundary
            body = data;
        } else {
            body = JSON.stringify(data);
        }

        const res = await fetch(`${API_URL}/chat/send`, {
            method: 'POST',
            headers,
            body
        });
        if (!res.ok) throw new Error("Failed send message");
        return res.json();
    },

    // --- Comments ---
    getComments: async (slug, lessonIndex) => {
        const res = await fetch(`${API_URL}/comments/${slug}/${lessonIndex}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch comments");
        return res.json();
    },
    postComment: async (data) => {
        const res = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed post comment");
        return res.json();
    },

    // --- Payment ---
    createPreference: async (courseId) => {
        const res = await fetch(`${API_URL}/checkout`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ courseId }),
        });
        if (!res.ok) throw new Error("Failed init checkout");
        return res.json();
    },
    verifyPayment: async (payment_id, courseId) => {
        const res = await fetch(`${API_URL}/payment/verify`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ payment_id, courseId }),
        });
        if (!res.ok) throw new Error("Failed verify payment");
        return res.json();
    },
    confirmManualPayment: async (courseId, txId) => {
        const res = await fetch(`${API_URL}/payment/confirm-manual`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ courseId, txId }),
        });
        if (!res.ok) throw new Error("Failed confirm payment");
        return res.json();
    },
    // purchaseCourse: DEPRECATED IN FAVOR OF CHECKOUT
    updateBankDetails: async (data) => {
        const res = await fetch(`${API_URL}/users/bank-account`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed update bank details");
        return res.json();
    }
};


export default api;
