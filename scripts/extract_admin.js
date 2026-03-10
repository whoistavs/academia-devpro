import fs from 'fs';

let code = fs.readFileSync('server/index.js', 'utf8');

const regexes = [
    // financials 1 (lines ~496 to ~530)
    /app\.get\('\/api\/admin\/financials', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // financials 2 (lines ~2290)
    /app\.get\('\/api\/admin\/financials', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // debts
    /app\.get\('\/api\/admin\/debts', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // payouts/manual
    /app\.post\('\/api\/admin\/payouts\/manual', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // approvals
    /app\.get\('\/api\/admin\/approvals', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // approve 1
    /app\.post\('\/api\/admin\/approve\/:id', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // approve 2
    /app\.post\('\/api\/admin\/approve\/:id', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // reject 1
    /app\.post\('\/api\/admin\/reject\/:id', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // reject 2
    /app\.post\('\/api\/admin\/reject\/:id', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    // coupons (all 4)
    /app\.get\('\/api\/admin\/coupons', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    /app\.post\('\/api\/admin\/coupons', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    /app\.delete\('\/api\/admin\/coupons\/:id', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
    /app\.put\('\/api\/admin\/coupons\/:id', verifyAdmin, async \(req, res\) => \{[\s\S]*?\}\);\n/m,
];

let extractedCode = '';
for (const rx of regexes) {
    const match = code.match(rx);
    if (match) {
        extractedCode += match[0] + '\n\n';
        code = code.replace(rx, '// Admin logic extracted\n');
    }
}

fs.writeFileSync('server/extracted_admin.js', extractedCode);
code = code.replace("import authRoutes from './routes/authRoutes.js';", "import authRoutes from './routes/authRoutes.js';\nimport adminRoutes from './routes/adminRoutes.js';\napp.use('/api', adminRoutes);");
fs.writeFileSync('server/index.js.new', code);

console.log('Extracted admin endpoints successfully!');
