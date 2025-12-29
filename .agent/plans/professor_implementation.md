---
description: Implement Professor Role and Course Creation Workflow
---

# Implementation Plan - Professor Role

## 1. Backend Updates (Server)
- [ ] **Modify `api/cadastro`**: Allow receiving `role` ('student' or 'professor') during signup.
- [ ] **Update Course Schema**: Ensure courses have:
    - `authorId`: ID of the creator.
    - `status`: 'pending' (default for professors), 'published', 'draft'.
- [ ] **New Endpoints**:
    - `POST /api/courses`: Create a new course (Professor/Admin).
    - `PUT /api/courses/:id`: Update a course.
    - `PATCH /api/courses/:id/status`: Approve/Reject course (Admin only).
    - `GET /api/professor/courses`: Get courses for the logged-in professor.
    - `POST /api/upload/course`: specific upload for course assets if needed.

## 2. Frontend Updates

### Authentication
- [ ] **`src/pages/Signup.jsx`**: Add a checkbox/toggle "Quero ser Professor".

### Professor Area
- [ ] **New Page: `src/pages/ProfessorDashboard.jsx`**:
    - List my courses.
    - Status indicators (Pending Approval, Published).
    - "Create Course" button.
- [ ] **New Page: `src/pages/CourseEditor.jsx`**:
    - Form for Course Info (Title, Desc, Image, Level, Category).
    - **Curriculum Builder**:
        - Add Module.
        - Add Lesson to Module (Title, Video URL, Content Type).

### Admin Area
- [ ] **`src/pages/AdminDashboard.jsx`**:
    - Update User List to show "Professor" badge (Yellow).
    - Add "Pending Courses" section to approve/reject course submissions.

### Public Area
- [ ] **`src/pages/Courses.jsx`**: Filter `api/courses` to show ONLY `status: 'published'`.

## 3. Colors & Styles
- Professor Badge: Yellow/Amber (e.g., `bg-yellow-100 text-yellow-800`).
