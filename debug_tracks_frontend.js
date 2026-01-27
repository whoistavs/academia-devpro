
import fetch from 'node-fetch';

async function testFrontendLogic() {
    try {
        console.log("Fetching tracks...");
        const res = await fetch('http://localhost:3000/api/tracks');
        const data = await res.json();
        console.log("Raw Data:", JSON.stringify(data, null, 2));

        if (!Array.isArray(data)) throw new Error("Not an array");

        const allCourses = []; // Simulate empty courses for now, or fetch if needed
        // The component fetches courses too:
        // const allCourses = await api.getCourses()...

        const formattedTracks = data.map(t => {
            console.log("Processing track:", t.id);
            const modules = t.modules || [];
            const mappedModules = modules.map(modId => {
                // Logic from Tracks.jsx
                const found = allCourses.find(c => c._id === modId || c.id === modId || c.id === parseInt(modId));
                return found ? {
                    title: found.title.pt || found.title,
                    slug: found.slug,
                    id: found._id
                } : { title: "Curso Removido", slug: "#", id: modId };
            });

            return {
                ...t,
                modules: mappedModules
            };
        });

        console.log("Formatted Tracks:", formattedTracks);

    } catch (e) {
        console.error("Frontend Logic Error:", e);
    }
}

testFrontendLogic();
