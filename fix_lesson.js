
const fs = require('fs');
const path = 'src/pages/LessonView.jsx';
const content = fs.readFileSync(path, 'utf8');

const startMarker = '    const slugify = (text) => {';
// The string '    const slugify' appears twice. First time is valid code. Second time is the garbage.

const firstIndex = content.indexOf(startMarker);
if (firstIndex === -1) {
    console.error("First mock not found");
    process.exit(1);
}

const secondIndex = content.indexOf(startMarker, firstIndex + 100); // skip a bit
if (secondIndex === -1) {
    console.error("Second mock (garbage) not found. File might be already fixed or indentation mismatch.");
    // Try to find it via substring search if indentation varies
    const flexibleMarker = 'const slugify = (text) => {';
    const idx = content.lastIndexOf(flexibleMarker);
    if (idx === firstIndex) {
        console.error("Only found one instance.");
        process.exit(1);
    }
} else {
    console.log("Found second instance at index:", secondIndex);
}

const endMarker = '{/* Logic: Quiz OR Challenge OR Manual Complete */}';
const endIndex = content.indexOf(endMarker);

if (endIndex === -1) {
    console.error("End marker not found");
    process.exit(1);
}

// Check safety: secondIndex must be before endIndex
if (secondIndex > endIndex) {
    console.error("Indices disconnected?", secondIndex, endIndex);
    // Maybe the garbage is AFTER the marker? No, lines 293 vs 363.
    // Wait, line 293 is BEFORE line 363.
    // So secondIndex < endIndex.
}

console.log("Splicing from", secondIndex, "to", endIndex);

const newBlock = `
                        {/* Debug Info Overlay */}
                        <div className="fixed top-24 right-4 z-50 bg-black/90 text-green-400 p-4 rounded border border-green-500 font-mono text-xs max-w-sm overflow-auto opacity-90">
                            <h3 className="font-bold underline mb-2">DEBUG INFO</h3>
                            <p>Lesson Idx: {lessonIndex}</p>
                            <p>Title: {JSON.stringify(lesson?.titulo)}</p>
                            <p>Content Type: {typeof lesson?.content}</p>
                            <p>Content Len: {lesson?.content?.length}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm prose dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded text-gray-800 dark:text-gray-200 overflow-auto max-h-96">
                                {lesson.content}
                            </pre>
                        </div>
                        
                        `;

const newContent = content.substring(0, secondIndex) + newBlock + content.substring(endIndex);

fs.writeFileSync(path, newContent, 'utf8');
console.log("Success.");
