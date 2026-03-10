import fs from 'fs';

try {
    let code = fs.readFileSync('server/index.js', 'utf8');

    // Remove mailConfig and sendVerificationEmail
    const emailBlockRegex = /const mailConfig = \{([\s\S]*?)console\.error\("Email sending failed:", error\);\n\s*\}\n\};\n\n\n\n/m;
    code = code.replace(emailBlockRegex, '// sendVerificationEmail moved to authController.js\n');

    // Remove auth routes from /api/cadastro down to /api/auth/verify-password
    const authRoutesRegex = /app\.post\('\/api\/cadastro'[\s\S]*?app\.post\('\/api\/auth\/verify-password'[\s\S]*?\}\n\s*\);\n/m;
    
    if (authRoutesRegex.test(code)) {
        code = code.replace(authRoutesRegex, '// Auth routes moved to authRoutes.js\napp.use(\'/api\', authRoutes);\n');
        console.log("Auth routes successfully targeted for replacement.");
    } else {
        console.log("Could not find auth routes block. Maybe it was already replaced?");
    }

    // Insert import for authRoutes
    if (!code.includes('authRoutes.js')) {
        code = code.replace("import { tracks as initialTracks } from './tracks.js';", "import { tracks as initialTracks } from './tracks.js';\nimport authRoutes from './routes/authRoutes.js';");
        console.log("Added import authRoutes.");
    }

    fs.writeFileSync('server/index.js', code);
    console.log("Refactoring applied to server/index.js");

} catch(e) {
    console.error("Error during refactoring:", e);
}
