// using global fetch

// Since api.js is an ES module using 'import.meta.env', it might be hard to run directly in Node without care.
// Instead, I'll write a standalone script using fetch directly to test the server endpoints.

const API_URL = "http://localhost:3000/api";
let TOKEN = "";

async function runTest() {
    console.log("--- Starting Persistence Debug ---");

    // 1. Login to get token (assuming admin or professor exists)
    // trying admin login
    try {
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'testprof@devpro.com', password: 'password123!', rememberMe: false })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error("Login failed: " + JSON.stringify(loginData));
        TOKEN = loginData.accessToken;
        console.log("Logged in as Admin.");
    } catch (e) {
        console.error("Login Error:", e.message);
        return;
    }

    // 2. Create a Course with Hierarchical Data
    const courseData = {
        title: "Debug Course " + Date.now(),
        description: "Testing persistence",
        category: "DevOps",
        level: "Iniciante", // String check
        modulos: [
            {
                title: "Module 1",
                items: [
                    { title: "Lesson 1.1", type: "lesson", content: "Content 1.1" },
                    { title: "Quiz 1.2", type: "quiz", questions: [] }
                ]
            },
            {
                title: "Module 2",
                items: [
                    { title: "Lesson 2.1", type: "lesson", content: "Content 2.1" }
                ]
            }
        ],
        aulas: [] // Editor generates this, let's see if backend cares. 
        // Note: The Editor generates flat lessons. We should mimic that? 
        // The backend save seems to accept 'modulos' directly.
    };

    // Mimic Editor behavior: generate flat lessons just in case backend expects them for legacy views
    courseData.modulos.forEach(m => {
        m.items.forEach(i => {
            courseData.aulas.push({ ...i, moduleTitle: m.title });
        });
    });

    let courseId;

    try {
        const createRes = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify(courseData)
        });
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error("Create failed: " + JSON.stringify(createData));
        courseId = createData._id;
        console.log("Course Created. ID:", courseId);
    } catch (e) {
        console.error("Create Error:", e.message);
        return;
    }

    // 3. Update the Course (Modify Hierarchy)
    // Simulate adding a module and saving
    courseData.modulos.push({
        title: "Module 3 (New)",
        items: [{ title: "Lesson 3.1", type: "lesson" }]
    });
    // Update flat array too
    courseData.aulas.push({ title: "Lesson 3.1", type: "lesson", moduleTitle: "Module 3 (New)" });

    try {
        const updateRes = await fetch(`${API_URL}/courses/${courseId}`, {
            method: 'PUT', // Editor uses PUT
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify(courseData)
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok) throw new Error("Update failed: " + JSON.stringify(updateData));
        console.log("Course Updated.");
    } catch (e) {
        console.error("Update Error:", e.message);
    }

    // 4. Fetch and Verify
    try {
        // Fetch by ID as Editor does
        const getRes = await fetch(`${API_URL}/courses/id/${courseId}`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const fetchedCourse = await getRes.json();

        console.log("--- Verification ---");
        const modules = fetchedCourse.modulos || [];
        console.log(`Modules Count: ${modules.length} (Expected 3)`);

        modules.forEach((m, i) => {
            const items = m.items || m.lessons || [];
            console.log(`Module ${i + 1}: "${m.title}" has ${items.length} items.`);
            // Deep check items
            if (i === 0 && items.length !== 2) console.error("FAIL: Module 1 should have 2 items");
            if (i === 2 && items.length !== 1) console.error("FAIL: Module 3 should have 1 item");
        });

        if (modules.length === 3) {
            console.log("SUCCESS: Hierarchy preserved on backend.");
        } else {
            console.error("FAIL: Hierarchy lost.");
        }

    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

runTest();
