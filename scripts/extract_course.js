import fs from 'fs';

const lines = fs.readFileSync('server/index.js', 'utf8').split('\n');

const endpointsToExtract = [
    { sig: "app.get('/api/courses'", name: "getCourses" },
    { sig: "app.post('/api/courses'", name: "createCourse" },
    { sig: "app.get('/api/courses/:id/status'", name: "getCourseStatus" },
    { sig: "app.get('/api/courses/:id'", name: "getCourseById" },
    { sig: "app.put('/api/courses/:id'", name: "updateCourse" },
    { sig: "app.get('/api/courses/id/:id'", name: "getCourseByIdStrict" },
    { sig: "app.get('/api/courses/:slug'", name: "getCourseBySlug" },
    { sig: "app.get('/api/tracks'", name: "getTracks" },
    { sig: "app.post('/api/tracks'", name: "createTrack" },
    { sig: "app.put('/api/tracks/:id'", name: "updateTrack" },
    { sig: "app.delete('/api/tracks/:id'", name: "deleteTrack" },
    { sig: "app.get('/api/courses/:id/reviews'", name: "getReviews" },
    { sig: "app.post('/api/courses/:id/reviews'", name: "addReview" },
    { sig: "app.get('/api/certificates/validate/:code'", name: "validateCertificate" },
    { sig: "app.get('/api/comments/:courseSlug/:lessonIndex'", name: "getComments" },
    { sig: "app.post('/api/comments'", name: "addComment" },
    { sig: "app.post('/api/admin/seed'", name: "seedData" }
];

let controllerCode = `// server/controllers/courseController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';
import Track from '../models/Track.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Comment from '../models/Comment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

`;

let i = 0;
let extractedCount = 0;
const extractedBlocks = {};

while (i < lines.length) {
    let line = lines[i];

    // Sort logic to match longest exact signatures first 
    // e.g., app.get('/api/courses/:id/status' before app.get('/api/courses/:id'
    let matchedEndpoint = endpointsToExtract
        .sort((a, b) => b.sig.length - a.sig.length)
        .find(ep => line.includes(ep.sig));

    if (matchedEndpoint) {
        let blockLines = [];
        let braceCount = 0;
        let started = false;

        let startIdx = i;
        while (i < lines.length) {
            blockLines.push(lines[i]);
            for (let char of lines[i]) {
                if (char === '{') { braceCount++; started = true; }
                else if (char === '}') { braceCount--; }
            }
            if (started && braceCount === 0) break;
            i++;
        }

        let firstLine = blockLines[0];
        let replacement = `export const ${matchedEndpoint.name} = async (req, res) => {`;
        blockLines[0] = replacement;

        let lastLine = blockLines[blockLines.length - 1];
        blockLines[blockLines.length - 1] = lastLine.replace('});', '}').replace('})', '}');

        extractedBlocks[matchedEndpoint.name] = blockLines.join('\n');

        lines.splice(startIdx, i - startIdx + 1);
        i = startIdx;
        extractedCount++;
    } else {
        i++;
    }
}

for (const [name, block] of Object.entries(extractedBlocks)) {
    controllerCode += block + '\n\n';
}

fs.writeFileSync('server/controllers/courseController.js', controllerCode);

const routeImport = "import courseRoutes from './routes/courseRoutes.js';";
const authRouteImportIdx = lines.findIndex(l => l.includes('import adminRoutes from'));

if (!lines.some(l => l.includes('import courseRoutes from'))) {
    if (authRouteImportIdx !== -1) {
        lines.splice(authRouteImportIdx + 1, 0, routeImport);
    } else {
        lines.unshift(routeImport);
    }
}

const appUse = "app.use('/api', courseRoutes);";
const authAppUseIdx = lines.findIndex(l => l.includes("app.use('/api', adminRoutes);"));

if (!lines.some(l => l.includes(appUse))) {
    if (authAppUseIdx !== -1) {
        lines.splice(authAppUseIdx + 1, 0, appUse);
    } else {
        const appUseJsonIdx = lines.findIndex(l => l.includes('app.use(express.json())'));
        lines.splice(appUseJsonIdx + 1, 0, appUse);
    }
}

fs.writeFileSync('server/index.js.new', lines.join('\n'));
console.log(`Course extraction: ${Object.keys(extractedBlocks).length} unique routes from ${extractedCount} occurences!`);
