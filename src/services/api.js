
import { useNavigate } from "react-router-dom";



// FORCING PRODUCTION URL (DEBUGGING)
// FORCING PRODUCTION URL (DEBUGGING)
// const API_URL = "https://devpro-backend.onrender.com/api";
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? `http://${window.location.hostname}:3000/api` : "https://devpro-backend.onrender.com/api");



const getHeaders = (params = {}) => {
    const user = JSON.parse(localStorage.getItem("user"));

    const token = localStorage.getItem("token") || user?.accessToken;

    const headers = {
        Authorization: token ? `Bearer ${token}` : "",
    };



    if (params.json !== false) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

export const api = {

    getCourses: async (params = "") => {
        const query = params ? `?${params}` : "";
        const res = await fetch(`${API_URL}/courses${query}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
    },
    validateCertificate: async (code) => {
        const response = await fetch(`${API_URL}/certificates/validate/${code}`);
        return response.json();
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
    googleLogin: async (accessToken) => {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: accessToken })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Google login failed");
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
    contact: async (data) => {
        const res = await fetch(`${API_URL}/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to send message");
        return res.json();
    },


    getMe: async () => {
        const res = await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to get profile");
        return res.json();
    },
    updateMe: async (data) => {
        const res = await fetch(`${API_URL}/users/me`, {
            method: "PUT",
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

        const res = await fetch(`${API_URL}/users/delete-me`, {
            method: "POST",
            headers: getHeaders()
        });


        if (res.status === 401 || res.status === 403 || res.status === 404) {
            throw new Error("ACCOUNT_GONE");
        }

        if (!res.ok) throw new Error("Failed to delete account");
        return res.json();
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
            headers: getHeaders({ json: false }),
            body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload image");
        return res.json();
    },



    getProgress: async (courseId) => {
        const res = await fetch(`${API_URL}/progress/${courseId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch progress");
        return res.json();
    },
    updateProgress: async (data) => {

        const res = await fetch(`${API_URL}/progress/update`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed update progress");
        return res.json();
    },


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

    // Tracks API
    getTracks: async () => {
        const res = await fetch(`${API_URL}/tracks`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch tracks");
        return res.json();
    },
    createTrack: async (data) => {
        const res = await fetch(`${API_URL}/tracks`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed create track");
        return res.json();
    },
    updateTrack: async (id, data) => {
        const res = await fetch(`${API_URL}/tracks/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed update track");
        return res.json();
    },
    deleteTrack: async (id) => {
        const res = await fetch(`${API_URL}/tracks/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed delete track");
        return res.json();
    },



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
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed approve' }));
            throw new Error(err.error || err.message || 'Erro ao aprovar');
        }
        return res.json();
    },
    rejectTransaction: async (id) => {
        const res = await fetch(`${API_URL}/admin/reject/${id}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Failed reject' }));
            throw new Error(err.error || err.message || 'Erro ao rejeitar');
        }
        return res.json();
    },


    getProfessorDebts: async () => {
        const res = await fetch(`${API_URL}/admin/debts`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch debts");
        return res.json();
    },
    registerManualPayout: async (data) => {

        const res = await fetch(`${API_URL}/admin/payouts/manual`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed payout");
        return res.json();
    },


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

        const headers = getHeaders();
        let body;

        if (data instanceof FormData) {
            delete headers['Content-Type'];
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

    validateCoupon: async (code) => {
        const res = await fetch(`${API_URL}/coupons/validate`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ code }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Cupom inválido");
        }
        return res.json();
    },


    createPreference: async (courseId, couponCode = null, trackId = null) => {
        const body = { couponCode };
        if (trackId) body.trackId = trackId;
        else body.courseId = courseId;

        const res = await fetch(`${API_URL}/checkout`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body),
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
    confirmManualPayment: async (courseId, txId, couponCode = null, trackId = null) => {
        const body = { txId, couponCode };
        if (trackId) body.trackId = trackId;
        else body.courseId = courseId;

        const res = await fetch(`${API_URL}/payment/confirm-manual`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed confirm payment");
        return res.json();
    },

    updateBankDetails: async (data) => {
        const res = await fetch(`${API_URL}/users/bank-account`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed update bank details");
        return res.json();
    },

    getLeaderboard: async () => {
        const res = await fetch(`${API_URL}/leaderboard`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch ranking");
        return res.json();
    },


    getReviews: async (courseId) => {
        const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed fetch reviews");
        return res.json();
    },
    postReview: async (courseId, data) => {
        const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed post review");
        return res.json();
    },

    correctChallenge: async (data) => {
        const res = await fetch(`${API_URL}/ai/correct-challenge`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed to correct challenge");
        return res.json();
    },

    chatAI: async (message, history = [], context = "") => {
        const res = await fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ message, history, context })
        });
        if (!res.ok) throw new Error("Failed AI response");
        return res.json();
    }
};


export default api;
