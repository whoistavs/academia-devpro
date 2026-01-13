
import mongoose from 'mongoose';

import User from './models/User.js';
import Course from './models/Course.js';
import connectDB from './connectDb.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = "http://localhost:3000";


const request = async (method, endpoint, body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, data };
};

async function runFullTest() {
    console.log("\n🧪 STARTING PROFESSOR FLOW INTEGRATION TEST\n");

    
    await connectDB();

    const timestamp = Date.now();
    const profEmail = `prof_${timestamp}@test.com`;
    const adminEmail = `admin_${timestamp}@test.com`;
    const password = "password123";

    try {
        
        console.log("👤 Creating Actors...");

        
        let regRes = await request('POST', '/api/cadastro', {
            name: "Prof. Test",
            email: profEmail,
            password: password,
            role: "professor"
        });
        if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);

        
        
        await request('POST', '/api/cadastro', {
            name: "Admin Test",
            email: adminEmail,
            password: password,
            role: "student"
        });

        await User.findOneAndUpdate({ email: adminEmail }, { role: 'admin' });
        console.log("✅ Actors Created: Professor & Admin");

        
        console.log("\n🔐 Logging in...");

        const profLogin = await request('POST', '/api/login', { email: profEmail, password });
        const adminLogin = await request('POST', '/api/login', { email: adminEmail, password });

        const profToken = profLogin.data.accessToken;
        const adminToken = adminLogin.data.accessToken;

        if (!profToken || !adminToken) throw new Error("Login failed");
        console.log("✅ Login successful");

        
        console.log("\n📚 Professor creating course...");
        const courseData = {
            title: `Course ${timestamp}`,
            description: "Test Description",
            category: "Front-end",
            level: "Iniciante",
            duration: "5h",
            status: "published" 
        };

        const createRes = await request('POST', '/api/courses', courseData, profToken);
        const courseId = createRes.data._id;

        if (createRes.data.status !== 'pending') {
            console.error("❌ FAILED: Professor was able to publish directly or status default broken.");
        } else {
            console.log("✅ PASS: Course created with status 'pending' (Correct)");
        }

        
        console.log("\n👀 Checking Public Visibility (Pre-Approval)...");
        const publicCourses = await request('GET', '/api/courses');
        const isVisible = publicCourses.data.some(c => c.id === courseId || c._id === courseId);

        if (isVisible) {
            console.error("❌ FAILED: Pending course is visible to public.");
        } else {
            console.log("✅ PASS: Course is hidden.");
        }

        
        console.log("\n🛡️ Admin approving course...");
        const approveRes = await request('PATCH', `/api/courses/${courseId}/status`, { status: "published" }, adminToken);

        if (approveRes.status !== 200) console.error("❌ Admin approval failed", approveRes.data);
        else console.log("✅ Admin approval executed.");

        
        console.log("\n👀 Checking Public Visibility (Post-Approval)...");
        const publicCourses2 = await request('GET', '/api/courses');
        const isVisible2 = publicCourses2.data.some(c => c.id === courseId || c._id === courseId);

        if (isVisible2) {
            console.log("✅ PASS: Course is now visible!");
        } else {
            console.error("❌ FAILED: Course still hidden after approval.");
        }

        
        console.log("\n🧹 Cleaning up test data...");
        await Course.findByIdAndDelete(courseId);
        await User.findOneAndDelete({ email: profEmail });
        await User.findOneAndDelete({ email: adminEmail });
        console.log("✅ Cleanup done.");

    } catch (e) {
        console.error("\n❌ TEST FAILED:", e.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

runFullTest();
