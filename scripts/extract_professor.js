import fs from 'fs';

const lines = fs.readFileSync('server/index.js', 'utf8').split('\n');

const endpointsToExtract = [
    { sig: "app.get('/api/professor/courses'", name: "getProfessorCourses" },
    { sig: "app.get('/api/professor/students'", name: "getProfessorStudents" },
    { sig: "app.get('/api/student/professors'", name: "getStudentProfessors" }
];

let controllerCode = `// server/controllers/professorController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

`;

let i = 0;
let extractedCount = 0;
const extractedBlocks = {};

while (i < lines.length) {
    let line = lines[i];

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

fs.writeFileSync('server/controllers/professorController.js', controllerCode);

const routeImport = "import professorRoutes from './routes/professorRoutes.js';";
const authRouteImportIdx = lines.findIndex(l => l.includes('import courseRoutes from'));

if (!lines.some(l => l.includes('import professorRoutes from'))) {
    if (authRouteImportIdx !== -1) {
        lines.splice(authRouteImportIdx + 1, 0, routeImport);
    } else {
        lines.unshift(routeImport);
    }
}

const appUse = "app.use('/api', professorRoutes);";
const authAppUseIdx = lines.findIndex(l => l.includes("app.use('/api', courseRoutes);"));

if (!lines.some(l => l.includes(appUse))) {
    if (authAppUseIdx !== -1) {
        lines.splice(authAppUseIdx + 1, 0, appUse);
    } else {
        const appUseJsonIdx = lines.findIndex(l => l.includes('app.use(express.json())'));
        lines.splice(appUseJsonIdx + 1, 0, appUse);
    }
}

fs.writeFileSync('server/index.js.new', lines.join('\n'));
console.log(`Professor extraction: ${Object.keys(extractedBlocks).length} unique routes from ${extractedCount} occurences!`);
