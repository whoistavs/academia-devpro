import fs from 'fs';

const lines = fs.readFileSync('server/index.js', 'utf8').split('\n');
const endpointsToExtract = [
    { sig: "app.get('/api/admin/financials'", name: "getFinancials" },
    { sig: "app.get('/api/admin/debts'", name: "getDebts" },
    { sig: "app.post('/api/admin/payouts/manual'", name: "registerManualPayout" },
    { sig: "app.get('/api/admin/approvals'", name: "getApprovals" },
    { sig: "app.post('/api/admin/approve/:id'", name: "approveTransaction" },
    { sig: "app.post('/api/admin/reject/:id'", name: "rejectTransaction" },
    { sig: "app.get('/api/admin/coupons'", name: "getCoupons" },
    { sig: "app.post('/api/admin/coupons'", name: "createCoupon" },
    { sig: "app.delete('/api/admin/coupons/:id'", name: "deleteCoupon" },
    { sig: "app.put('/api/admin/coupons/:id'", name: "updateCoupon" },
    { sig: "app.get('/api/users'", name: "getUsers" },
    { sig: "app.delete('/api/users/:id'", name: "deleteUser" },
    { sig: "app.patch('/api/users/:id/role'", name: "updateUserRole" }
];

let controllerCode = `// server/controllers/adminController.js
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Payout from '../models/Payout.js';
import Coupon from '../models/Coupon.js';

`;

let i = 0;
let extractedCount = 0;

// To store the latest block for each endpoint
const extractedBlocks = {};

while (i < lines.length) {
    let line = lines[i];
    let matchedEndpoint = endpointsToExtract.find(ep => line.includes(ep.sig));

    if (matchedEndpoint) {
        // Parse block
        let blockLines = [];
        let braceCount = 0;
        let started = false;

        let startIdx = i;
        while (i < lines.length) {
            blockLines.push(lines[i]);
            for (let char of lines[i]) {
                if (char === '{') {
                    braceCount++;
                    started = true;
                } else if (char === '}') {
                    braceCount--;
                }
            }
            if (started && braceCount === 0) {
                break;
            }
            i++;
        }

        let firstLine = blockLines[0];
        let replacement = `export const ${matchedEndpoint.name} = async (req, res) => {`;
        blockLines[0] = replacement;

        let lastLine = blockLines[blockLines.length - 1];
        blockLines[blockLines.length - 1] = lastLine.replace('});', '}');

        // Always overwrite to keep the latest implementation in case of duplicates
        extractedBlocks[matchedEndpoint.name] = blockLines.join('\n');

        lines.splice(startIdx, i - startIdx + 1);
        i = startIdx;
        extractedCount++;
    } else {
        i++;
    }
}

// Append unique blocks
for (const [name, block] of Object.entries(extractedBlocks)) {
    controllerCode += block + '\n\n';
}

fs.writeFileSync('server/controllers/adminController.js', controllerCode);

// Optional: check imports in index.js
const adminRouteImport = "import adminRoutes from './routes/adminRoutes.js';";
const authRouteImportIdx = lines.findIndex(l => l.includes('import authRoutes from'));

if (!lines.some(l => l.includes('import adminRoutes from'))) {
    if (authRouteImportIdx !== -1) {
        lines.splice(authRouteImportIdx + 1, 0, adminRouteImport);
    } else {
        lines.unshift(adminRouteImport);
    }
}

const adminAppUse = "app.use('/api', adminRoutes);";
const authAppUseIdx = lines.findIndex(l => l.includes("app.use('/api', authRoutes);"));

if (!lines.some(l => l.includes(adminAppUse))) {
    if (authAppUseIdx !== -1) {
        lines.splice(authAppUseIdx + 1, 0, adminAppUse);
    } else {
        const appUseJsonIdx = lines.findIndex(l => l.includes('app.use(express.json())'));
        lines.splice(appUseJsonIdx + 1, 0, adminAppUse);
    }
}

fs.writeFileSync('server/index.js.new', lines.join('\n'));
console.log(`Successfully extracted ${Object.keys(extractedBlocks).length} unique routes from ${extractedCount} occurences!`);
