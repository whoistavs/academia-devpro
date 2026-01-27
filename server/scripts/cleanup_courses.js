import Course from '../models/Course.js';

export const cleanupEmptyCourses = async () => {
    try {
        console.log("Starting Course Cleanup...");

        // Find courses where both 'aulas' is empty and 'modulos' is empty (or modulos has only titles but no items)
        // We will be aggressive based on the user request: "Only keep Lógica and Carreira"
        // Lógica ID: 1, Carreira ID: 22.

        const keptIds = [1, 22];
        const keptSlugs = ['logica-de-programacao', 'carreira-soft-skills'];

        const result = await Course.deleteMany({
            slug: { $nin: keptSlugs },
            id: { $nin: keptIds }, // Safety check for numeric IDs
            $or: [
                { aulas: { $size: 0 }, modulos: { $size: 0 } },
                { aulas: { $size: 0 }, modulos: { $exists: false } },
                // Also target courses that might have been seeded as empty
                { title: { $regex: /Git|JavaScript|React|Node/, $options: 'i' } }
            ]
        });

        // Hard cleanup: Remove anything that is NOT the two specific courses
        // This is safer given the explicit user request.
        const cleanupResult = await Course.deleteMany({
            $and: [
                { slug: { $ne: 'logica-de-programacao' } },
                { slug: { $ne: 'carreira-soft-skills' } }
            ]
        });

        console.log(`Cleanup complete. Removed ${cleanupResult.deletedCount} empty/unwanted courses.`);

        const remaining = await Course.find({}, 'title slug');
        console.log("Remaining Courses:", remaining.map(c => c.title));

    } catch (error) {
        console.error("Cleanup Error:", error);
    }
};
