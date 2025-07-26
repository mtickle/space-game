// StarSystemViewer.jsx
import { getPlanetColor } from '@utils/colorUtils'; // This is useful for planets without explicit planetColor, or to derive gradient colors
import { SquareArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Helper to darken a hex color (simple for now, can be more robust)
const darkenColor = (hex, percent) => {
    let f = parseInt(hex.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = (f >> 8) & 0x00ff,
        B = f & 0x0000ff;
    return (
        "#" +
        (
            0x1000000 +
            (Math.round((t - R) * p) + R) * 0x10000 +
            (Math.round((t - G) * p) + G) * 0x100 +
            (Math.round((t - B) * p) + B)
        )
            .toString(16)
            .slice(1)
    );
};

const StarSystemViewer = ({ activeSystem, onClose }) => {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const wrapper = wrapperRef.current;

        if (!canvas || !ctx || !wrapper) {
            console.warn("Canvas or wrapper not available, skipping drawing.");
            return;
        }

        const rect = wrapper.getBoundingClientRect();
        const width = canvas.width = rect.width;
        const height = canvas.height = rect.height;
        const cx = width / 2; // Center X of the canvas
        const cy = height / 2; // Center Y of the canvas

        // Base scale for planet radii
        const PLANET_RADIUS_SCALE = 5; // Adjust this to make planets larger/smaller
        const MIN_PLANET_RADIUS = 15; // Minimum visual radius for very small planets

        // Base distance for planets from the center
        const BASE_ORBIT_DISTANCE = 30;
        const ORBIT_INCREMENT = 40; // How much distance between conceptual "rings"


        // --- Drawing Function ---
        function draw() {
            // NMS-like subtle gradient background for the entire canvas
            const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
            backgroundGradient.addColorStop(0, '#1a1a2e'); // Dark blue/purple
            backgroundGradient.addColorStop(0.5, '#3b3b5c'); // Slightly lighter blue/purple
            backgroundGradient.addColorStop(1, '#1a1a2e'); // Dark blue/purple
            ctx.fillStyle = backgroundGradient;
            ctx.fillRect(0, 0, width, height);

            // Optional: Faint background "stars" or "nebula" dots
            // You can generate a few random, very translucent circles for a nebula effect
            for (let i = 0; i < 50; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`; // Faint white stars
                ctx.fill();
            }

            // Optional: A couple of larger, very faint, blurred circles for nebulous clouds
            ctx.filter = 'blur(8px)'; // Apply blur for a soft effect
            ctx.fillStyle = 'rgba(100, 100, 255, 0.05)'; // Very faint blue
            ctx.beginPath();
            ctx.arc(width * 0.2, height * 0.3, 100, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 100, 100, 0.05)'; // Very faint red
            ctx.beginPath();
            ctx.arc(width * 0.7, height * 0.8, 120, 0, Math.PI * 2);
            ctx.fill();
            ctx.filter = 'none'; // Reset filter for crisp drawing of planets/text

            if (!activeSystem || !activeSystem.planets) {
                console.warn("Star system data is not available yet.");
                ctx.fillStyle = '#fff';
                ctx.font = '20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText("Loading Star System...", cx, cy);
                return;
            }

            // --- Draw Planets ---
            // NMS style is more illustrative. Let's arrange them somewhat radially
            // but consider their size for visual hierarchy.
            // Sort planets by orbitRadius or planetSize to control layout order
            // (larger planets might go on "outer" rings, or just be more prominent)
            const sortedPlanets = [...activeSystem.planets].sort((a, b) => a.orbitRadius - b.orbitRadius);
            // Or, for a more visual NMS-like layout, sort by size and distribute
            // sortedPlanets = [...activeSystem.planets].sort((a, b) => b.planetSize - a.planetSize);
            // We need to keep track of previous planet's position and size to avoid overlap
            let lastPlacedRadius = 0; // Represents the radius of the outer edge of the previous "ring"
            let currentAngleOffset = 0; // To space planets angularly within a ring

            // Reset positions for each draw call to re-calculate based on current data
            const planetPositions = [];

            const numPlanets = sortedPlanets.length;
            const segmentAngle = (Math.PI * 2) / numPlanets; // Evenly distribute

            sortedPlanets.forEach((planet, index) => {
                const planetRadius = Math.max(MIN_PLANET_RADIUS, planet.planetSize * PLANET_RADIUS_SCALE);

                // Calculate effective orbit radius dynamically
                // Start with a base, then ensure enough space from the previous "ring"
                let effectiveOrbitRadius;
                if (index === 0) {
                    // First planet, use its base orbitRadius from data or a default minimum
                    effectiveOrbitRadius = BASE_ORBIT_DISTANCE + planetRadius;
                } else {
                    // For subsequent planets, ensure they are outside the previous planet's orbit + its own size
                    // This is a simplification; a true non-overlapping would need more complex geometry.
                    // For a more NMS-like illustrative placement, we can just space rings out.
                    effectiveOrbitRadius = lastPlacedRadius + ORBIT_INCREMENT + planetRadius;
                }

                // Add some randomness to angles/radii for a less rigid feel, like NMS screenshot
                const angle = (index * segmentAngle * (1.0 + Math.random() * 0.1)) + (Math.random() * Math.PI / 8 - Math.PI / 16); // More significant random angle
                const currentRadius = effectiveOrbitRadius + (Math.random() * 30 - 15); // Larger random radius offset

                const px = cx + Math.cos(angle) * currentRadius;
                const py = cy + Math.sin(angle) * currentRadius;

                // Store the position for click detection (important for randomness)
                planetPositions.push({ id: planet.planetId, px, py, radius: planetRadius });

                // Update lastPlacedRadius for the next iteration (simple linear progression)
                // This is a simple strategy, not a perfect collision detection.
                lastPlacedRadius = currentRadius + planetRadius;

                // --- Draw Planet Sphere (rest of the drawing code for planet remains the same) ---
                ctx.beginPath();
                // ... (your existing planet drawing code using px, py, planetRadius)
                const planetMainColor = planet.planetColor || getPlanetColor(planet.planetType) || '#808080';
                const planetDarkColor = darkenColor(planetMainColor, 0.4);

                const planetGradient = ctx.createRadialGradient(
                    px - planetRadius * 0.3, // Offset light source for shadow effect
                    py - planetRadius * 0.3,
                    0,
                    px,
                    py,
                    planetRadius
                );
                planetGradient.addColorStop(0, planetMainColor);
                planetGradient.addColorStop(1, planetDarkColor);
                ctx.fillStyle = planetGradient;
                ctx.arc(px, py, planetRadius, 0, Math.PI * 2);
                ctx.fill();

                // Optional: Faint outer glow/atmosphere
                ctx.filter = 'blur(2px)';
                ctx.fillStyle = `rgba(${parseInt(planetMainColor.slice(1, 3), 16)}, ${parseInt(planetMainColor.slice(3, 5), 16)}, ${parseInt(planetMainColor.slice(5, 7), 16)}, 0.2)`;
                ctx.beginPath();
                ctx.arc(px, py, planetRadius + 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.filter = 'none';

                // --- Planet Name & Details Call-outs ---
                // Positioning for text: adjust based on planet size and desired look
                const textOffset = planetRadius + 5; // Distance from planet edge
                let currentTextX = px + textOffset;
                let currentTextY = py + 5; // Vertically align with planet center

                // Adjust text position if it goes off-screen (simple boundary check)
                if (currentTextX + ctx.measureText(planet.planetName).width > width - 10) {
                    currentTextX = px - textOffset - ctx.measureText(planet.planetName).width;
                }
                if (currentTextY < 20) currentTextY = 20; // Prevent going too high
                if (currentTextY > height - 20) currentTextY = height - 20; // Prevent going too low


                ctx.fillStyle = '#fff';
                ctx.font = '14px NMSFont, monospace';
                ctx.textAlign = 'left';
                ctx.fillText(planet.planetName, currentTextX, currentTextY);

                let detailY = currentTextY + 16;

                if (planet.moons && planet.moons.length > 0) {
                    ctx.fillStyle = '#C0C0C0';
                    ctx.font = '10px monospace';
                    ctx.fillText(`${planet.moons.length} Moon(s)`, currentTextX, detailY);
                    detailY += 12;
                }

                if (planet.settlements && planet.settlements.length > 0) {
                    ctx.fillStyle = '#FFFF00';
                    ctx.font = '10px monospace';
                    ctx.fillText(`${planet.settlements.length} Settlement(s)`, currentTextX, detailY);
                }
            });
        }

        draw();

        // --- Event Handlers (for click interaction) ---
        function handleClick(event) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            activeSystem.planets?.forEach((planet, index) => {
                const planetRadius = Math.max(MIN_PLANET_RADIUS, planet.planetSize * PLANET_RADIUS_SCALE);

                const effectiveOrbitRadius = (planet.orbitRadius || (BASE_ORBIT_DISTANCE + index * ORBIT_INCREMENT));
                const angle = (index * segmentAngle) + (Math.random() * 0.5 - 0.25); // Needs to match draw's random offset for click detection
                const currentRadius = effectiveOrbitRadius + (Math.random() * 20 - 10);

                const px = cx + Math.cos(angle) * currentRadius;
                const py = cy + Math.sin(angle) * currentRadius;

                const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                if (dist < planetRadius) { // Click detection based on actual planet radius
                    console.log(`Clicked on planet: ${planet.planetName}`);
                    setSelectedPlanet(planet);
                }
            });
        }

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mousemove', (event) => {
            setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        });

        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('mousemove', (event) => {
                setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
            });
        };
    }, [activeSystem]);

    return (
        <div className="w-full h-full relative flex flex-col">
            <div className="flex justify-start items-center gap-4 bg-gray-900 bg-opacity-80 px-6 py-3 z-20">
                <button
                    onClick={onClose}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    <SquareArrowLeft className="inline w-4 h-4 mr-1 text-red-400" /> Back to Galaxy Map
                </button>
            </div>

            <div ref={wrapperRef} className="flex-grow w-full bg-black"> {/* Changed bg-black to ensure full coverage */}
                <canvas ref={canvasRef} className="w-full h-full z-10" />
            </div>

            {selectedPlanet && (
                <div className="absolute bottom-4 left-4 text-white bg-gray-900 p-3 rounded shadow-lg z-30">
                    <h3>{selectedPlanet.planetName} Details</h3>
                    <p>Type: {selectedPlanet.planetType}</p>
                    <p>Conditions: {selectedPlanet.planetConditions.weather}, {selectedPlanet.planetConditions.temperature}</p>
                    <p>Settlements: {selectedPlanet.settlements?.length || 0}</p>
                    {/* Add more details as needed */}
                </div>
            )}
        </div>
    );
};

export default StarSystemViewer;