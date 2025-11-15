import { useCallback, useEffect, useRef, useState } from 'react';

// --- COLOR UTILITIES ---
function getPlanetColor(type) {
    const colors = {
        Ice: '#A0DFF0',
        Volcanic: '#F06257',
        Rocky: '#BCAAA4',
        Oceanic: '#4FC3F7',
        Gas: '#CE93D8',
        Exotic: '#FFEB3B',
        Crystaline: '#81D4FA'
    };
    return colors[type] || '#FFFFFF'; // Default to white
}

// (Moon color function removed as we are not drawing moons in this view)

const StarSystemViewer = ({ activeSystem, onClose }) => {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

    // Ref to store the animation state (angles) for each planet
    const planetOrbits = useRef({});

    // This effect initializes the orbit angles when a new system is loaded
    useEffect(() => {
        if (activeSystem && activeSystem.planets) {
            planetOrbits.current = {}; // Clear old orbit data
            activeSystem.planets.forEach((planet, index) => {
                planetOrbits.current[planet.planetId] = {
                    angle: Math.random() * Math.PI * 2, // Random starting angle
                    speed: 0.005 / (index + 1), // Inner planets orbit faster
                    radius: 60 + (index * 40), // Simple circular orbit radius
                    size: (planet.planetSize || 5) * 1.5 // Visual size
                };
            });
        }
    }, [activeSystem]);

    // Main animation loop
    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !activeSystem) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;

        // Clear canvas
        ctx.fillStyle = '#0a0a1a'; // Dark space blue
        ctx.fillRect(0, 0, width, height);

        // Center the coordinate system
        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Draw the Star in the center
        ctx.fillStyle = '#FFD700'; // Yellow star color
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillText(activeSystem.starName, 0, 0);
        ctx.shadowBlur = 0;

        // Draw each planet
        activeSystem.planets.forEach((planet, index) => {
            const orbit = planetOrbits.current[planet.planetId];
            if (!orbit) return;

            // 1. Update the angle for animation
            orbit.angle += orbit.speed;

            // 2. Calculate the planet's new X, Y position
            const x = Math.cos(orbit.angle) * orbit.radius;
            const y = Math.sin(orbit.angle) * orbit.radius;

            // 3. Draw the orbit path
            ctx.beginPath();
            ctx.arc(0, 0, orbit.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 4. Draw the planet
            ctx.beginPath();
            ctx.arc(x, y, orbit.size, 0, Math.PI * 2);
            ctx.fillStyle = getPlanetColor(planet.planetType);
            ctx.shadowColor = getPlanetColor(planet.planetType);
            ctx.shadowBlur = 10;
            ctx.fill();

            // 5. Draw the planet name
            ctx.fillStyle = 'white';
            ctx.font = '12px monospace';
            ctx.fillText(planet.planetName, x, y + orbit.size + 12);
        });

        ctx.restore(); // Restore context to default state

        animationFrameId.current = requestAnimationFrame(drawScene);
    }, [activeSystem, canvasDimensions]);

    // Start animation loop
    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(drawScene);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [drawScene]);

    // Handle canvas resizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
                setCanvasDimensions({ width, height });
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, []);

    return (
        <div className="star-system-viewer w-full h-full relative bg-[#1a1a2e]">
            <div className="absolute top-4 left-4 z-20 p-4 bg-black/60 rounded-lg text-white font-mono backdrop-blur-sm border border-slate-700 shadow-lg">
                <h1 className="text-xl font-bold text-[#00ff88]">
                    {activeSystem?.starName || 'Unnamed System'}
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                    {`${activeSystem?.planets?.length || 0} PLANETS`}
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 px-3 py-1.5 w-full bg-slate-700 text-white text-sm rounded-md hover:bg-slate-600 transition-colors duration-200"
                >
                    Back to Galaxy Map
                </button>
            </div>
            <canvas ref={canvasRef} className="w-full h-full block"></canvas>
        </div>
    );
};

export default StarSystemViewer;