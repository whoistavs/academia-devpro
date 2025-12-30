import { useNavigate } from "react-router-dom";

// Hardcoded Production URL to prevent any configuration issues
const API_URL = "https://devpro-backend.onrender.com/api";

const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.accessToken;
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

export const api = {
    // Courses
    getCourses: async () => {
        const res = await fetch(`${API_URL}/courses`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
    },
    getCourse: async (slug) => {
        const res = await fetch(`${API_URL}/courses/${slug}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch course");
        return res.json();
    },

    // Progress
    getProgress: async (courseId) => {
        const res = await fetch(`${API_URL}/progress/${courseId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch progress");
        return res.json();
    },
    updateProgress: async (courseId, lessonId, quizScore) => {
        const res = await fetch(`${API_URL}/progress/update`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ courseId, lessonId, quizScore }),
        });
        if (!res.ok) throw new Error("Failed to update progress");
        return res.json();
    },

    // Auth
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Login failed");
        }
        return res.json();
    },
    register: async (name, email, password, role) => {
        const res = await fetch(`${API_URL}/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Registration failed");
        }
        return res.json();
    },
    // Professor / Admin
    createCourse: async (courseData) => {
        const res = await fetch(`${API_URL}/courses`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(courseData),
        });
        if (!res.ok) throw new Error("Failed to create course");
        return res.json();
    },
    updateCourse: async (id, courseData) => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(courseData),
        });
        if (!res.ok) throw new Error("Failed to update course");
        return res.json();
    },
    getProfessorCourses: async () => {
        const res = await fetch(`${API_URL}/professor/courses`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch professor courses");
        return res.json();
    },
    updateCourseStatus: async (id, status) => {
        const res = await fetch(`${API_URL}/courses/${id}/status`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
    },
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: {
                Authorization: getHeaders().Authorization // Content-Type must be auto-set by browser for FormData
            },
            body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload image");
        return res.json();
    },
    // Admin
    getUsers: async () => {
        const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
    },
    updateUserRole: async (userId, role) => {
        const res = await fetch(`${API_URL}/users/${userId}/role`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ role }),
        });
        if (!res.ok) throw new Error("Failed to update role");
        return res.json();
    },
    deleteUser: async (userId) => {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to delete user");
        return res.json();
    }
};
