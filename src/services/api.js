
import { useNavigate } from "react-router-dom";

// Centralized API Configuration
// FORCING PRODUCTION BACKEND to bypass local DB issues
// const ENV_API_URL = import.meta.env.VITE_API_URL;
const PROD_API_URL = "https://devpro-backend.onrender.com/api";
const API_URL = PROD_API_URL;

console.log("API Service Configured with URL:", API_URL);

const getHeaders = (params = {}) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.accessToken;

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

    // --- Authentication ---
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Login fail");
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
        if (!res.ok) throw new Error("Failed to update profile");
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
        if (!res.ok) throw new Error("Failed create course");
        return res.json();
    },
    updateCourse: async (id, courseData) => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(courseData),
        });
        if (!res.ok) throw new Error("Failed update course");
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
        if (!res.ok) throw new Error("Failed delete course");
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
        if (!res.ok) throw new Error("Failed role update");
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
    }
};


export default api;
