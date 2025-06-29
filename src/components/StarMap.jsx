
import { useEffect, useRef, useState } from 'react';

// Procedural star name generator
const generateStarName = () => {
    const prefixes = ['Zorath', 'Klyra', 'Vexis', 'Nyxara', 'Solara', 'Dracon', 'Aether', 'Lumys'];
    const suffixes = ['I', 'II', 'III', 'IV', 'IX', 'A', 'B', 'Prime'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

// Procedural planet name generator
const generatePlanetName = (starName, index) => {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
    return `${starName} ${letters[index]}`;
};

// Star descriptions based on MK class
const getStarDescription = (type) => {
    const descriptions = {
        O: 'A massive, blazing blue star with intense radiation, rare and volatile.',
        B: 'A bright blue-white star, hot and luminous, often surrounded by nebulae.',
        A: 'A white star with strong stellar winds, a beacon in the cosmos.',
        F: 'A yellow-white star, stable and warm, with potential for vibrant systems.',
        G: 'A yellow star like Sol, often hosting habitable planets.',
        K: 'An orange star, cooler and steady, with long-lived systems.',
        M: 'A dim red dwarf, common and cool, with faint habitable zones.',
    };
    return descriptions[type] || 'An enigmatic star of unknown properties.';
};

// Generate planetary system
const generatePlanets = (starName) => {
    const planetTypes = [
        { type: 'Rocky', color: '#A0AEC0', weight: 0.4 },
        { type: 'Gas Giant', color: '#F6AD55', weight: 0.3 },
        { type: 'Ice World', color: '#90CDF4', weight: 0.2 },
        { type: 'Exotic', color: '#ED64A6', weight: 0.1 },
    ];

    const numPlanets = Math.floor(Math.random() * 12) + 2; // 2–13 planets
    const planets = [];
    for (let i = 0; i < numPlanets; i++) {
        const rand = Math.random();
        let cumulative = 0;
        let planetType = planetTypes[planetTypes.length - 1];
        for (const p of planetTypes) {
            cumulative += p.weight;
            if (rand < cumulative) {
                planetType = p;
                break;
            }
        }
        planets.push({
            name: generatePlanetName(starName, i),
            type: planetType.type,
            color: planetType.color,
            size: Math.floor(Math.random() * 10) + 1, // 1–10
            orbitRadius: 15 + i * 8, // Staggered orbits
        });
    }
    return planets;
};

const StarMap = () => {
    const canvasRef = useRef(null);
    const [selectedStar, setSelectedStar] = useState(null);
    const [stars, setStars] = useState([]);

    // Generate stars and planets only once on mount
    useEffect(() => {
        const classes = [
            { type: 'O', color: '#A3BFFA', temp: '>30,000K', size: 10, weight: 0.05 },
            { type: 'B', color: '#BEE3F8', temp: '10,000–30,000K', size: 8, weight: 0.1 },
            { type: 'A', color: '#EBF8FF', temp: '7,500–10,000K', size: 7, weight: 0.1 },
            { type: 'F', color: '#FEFCBF', temp: '6,000–7,500K', size: 6, weight: 0.1 },
            { type: 'G', color: '#FFFF99', temp: '5,200–6,000K', size: 5, weight: 0.15 },
            { type: 'K', color: '#FBD38D', temp: '3,700–5,200K', size: 4, weight: 0.2 },
            { type: 'M', color: '#F56565', temp: '<3,700K', size: 3, weight: 0.4 },
        ];

        const stars = [];
        for (let i = 0; i < 20; i++) {
            const rand = Math.random();
            let cumulative = 0;
            let starClass = classes[classes.length - 1];
            for (const c of classes) {
                cumulative += c.weight;
                if (rand < cumulative) {
                    starClass = c;
                    break;
                }
            }
            const starName = generateStarName();
            stars.push({
                x: Math.random() * 1000 - 500,
                y: Math.random() * 600 - 300,
                type: starClass.type,
                color: starClass.color,
                temp: starClass.temp,
                size: starClass.size,
                name: starName,
                description: getStarDescription(starClass.type),
                planets: generatePlanets(starName),
            });
        }

        setStars(stars);
    }, []);

    // Redraw stars and planets on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        stars.forEach(star => {
            // Draw star
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.fill();

            // Draw planet orbits
            star.planets.forEach(planet => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, planet.orbitRadius, 0, Math.PI * 2);
                ctx.strokeStyle = planet.color + '33'; // Semi-transparent orbit
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Draw planet
                const angle = Math.random() * Math.PI * 2; // Random orbit position
                const px = star.x + Math.cos(angle) * planet.orbitRadius;
                const py = star.y + Math.sin(angle) * planet.orbitRadius;
                ctx.beginPath();
                ctx.arc(px, py, planet.size / 4, 0, Math.PI * 2);
                ctx.fillStyle = planet.color;
                ctx.fill();
            });

            // Highlight selected star
            if (selectedStar && selectedStar.name === star.name) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size + 2, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        ctx.restore();
    }, [stars, selectedStar]);

    const handleClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - canvas.width / 2;
        const mouseY = e.clientY - rect.top - canvas.height / 2;

        const clickedStar = stars.find(star => {
            const dx = mouseX - star.x;
            const dy = mouseY - star.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < star.size + 4; // Hotzone increased
        });

        setSelectedStar(clickedStar ? {
            ...clickedStar,
            clientX: e.clientX - rect.left,
            clientY: e.clientY - rect.top,
        } : null);
    };

    return (
        <div className="relative flex flex-col items-center text-white font-mono">
            <h1 className="text-3xl mb-4 text-orange-400 tracking-wider">STARWEAVE '78</h1>
            <canvas
                ref={canvasRef}
                width={1000}
                height={600}
                className="border-2 border-green-500 bg-black shadow-[0_0_10px_#0f0] cursor-pointer"
            />
            {selectedStar && (
                <div
                    className="absolute bg-black bg-opacity-90 p-4 rounded-lg border-2 border-orange-400 shadow-[0_0_8px_#ff0] max-w-sm transition-opacity duration-200 z-10"
                    style={{
                        left: Math.min(selectedStar.clientX + 10, 900),
                        top: Math.min(selectedStar.clientY + 10, 500),
                    }}
                    onClick={() => setSelectedStar(null)}
                >
                    <h2 className="text-2xl font-bold text-yellow-400">{selectedStar.name}</h2>
                    <p className="text-green-400"><strong>Type:</strong> {selectedStar.type}</p>
                    <p className="text-green-400"><strong>Temperature:</strong> {selectedStar.temp}</p>
                    <p className="mt-2 text-sm text-gray-300">{selectedStar.description}</p>
                    <div className="mt-4 max-h-40 overflow-y-auto">
                        <h3 className="text-lg font-bold text-yellow-400">Planetary System</h3>
                        {selectedStar.planets.map((planet, index) => (
                            <div key={index} className="text-sm text-gray-300">
                                <p><strong>{planet.name}</strong> ({planet.type})</p>
                                <p>Size: {planet.size > 6 ? 'Large' : planet.size > 3 ? 'Medium' : 'Small'}</p>
                            </div>
                        ))}
                    </div>
                    <button
                        className="mt-2 px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStar(null);
                        }}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default StarMap;
