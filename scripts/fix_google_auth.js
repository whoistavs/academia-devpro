const fs = require('fs');
let content = fs.readFileSync('server/index.js', 'utf8');

const targetStr = `        res.json({
            id: user._id,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider,
            profileCompleted: user.profileCompleted,
            accessToken: token
        });`;

const replaceStr = `        res.json({
            id: user._id,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider,
            profileCompleted: user.profileCompleted,
            streak: user.streak || 0,
            badges: user.badges || [],
            xp: user.xp || 0,
            level: user.level || 1,
            bankAccount: user.bankAccount,
            accessToken: token
        });`;

// Normalize everything to standard \n
content = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplace = replaceStr.replace(/\r\n/g, '\n');

if (content.includes(normalizedTarget)) {
    content = content.replace(normalizedTarget, normalizedReplace);
    fs.writeFileSync('server/index.js', content, 'utf8');
    console.log("SUCCESS");
} else {
    console.log("NOT FOUND");
}
