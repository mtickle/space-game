// StarSystemViewer.jsx
import { getPlanetColor } from '@utils/colorUtils';
import { SquareArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const StarSystemViewer = ({ activeSystem, onClose }) => {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const wrapper = wrapperRef.current;

        // Essential null checks for canvas and wrapper
        if (!canvas || !ctx || !wrapper) {
            console.warn("Canvas or wrapper not available, skipping drawing.");
            return;
        }

        // Get the actual dimensions of the wrapper div
        const rect = wrapper.getBoundingClientRect();
        const width = canvas.width = rect.width;
        const height = canvas.height = rect.height; // <-- Canvas internal height set here
        const cx = width / 2;
        const cy = height / 2;

        // Basic planet gradients (simplified, can be expanded later)
        const planetGradients = {
            'Rocky': ['#A0AEC0', '#718096'],
            'Gas Giant': ['#F6AD55', '#ED8936'],
            'Ice World': ['#90CDF4', '#4299E1'],
            'Exotic': ['#ED64A6', '#D53F8C'],
            'Oceanic': ['#63B3ED', '#2B6CB0'],
            'Volcanic': ['#FC8181', '#E53E3E'],
            'Barren': ['#CBD5E0', '#A0AEC0'],
            'Crystaline': ['#B794F4', '#9F7AEA'],
            'Radiated': ['#FBB6CE', '#F687B3'],
            'Artificial': ['#F0E68C', '#D4AF37'],
            'Carbonaceous': ['#4A5568', '#2D3748'],
            'Desolate': ['#718096', '#4A5568'],
            'Icy': ['#D1EEFA', '#A7D9EE'],
        };

        const getGradient = (type, c_x, c_y, radius) => {
            const colors = planetGradients[type] || planetGradients['Rocky']; // Default to Rocky
            const gradient = ctx.createRadialGradient(c_x, c_y, 0, c_x, c_y, radius);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            return gradient;
        };

        // --- Drawing Function ---
        function draw() {
            ctx.fillStyle = '#1A202C'; // Dark background for the map
            ctx.fillRect(0, 0, width, height);

            if (!activeSystem || !activeSystem.planets) {
                console.warn("Star system data is not available yet.");
                ctx.fillStyle = '#fff';
                ctx.font = '20px monospace';
                ctx.textAlign = 'center';
                ctx.fillText("Loading Star System...", cx, cy);
                return;
            }

            // Draw the central star
            ctx.beginPath();
            ctx.fillStyle = activeSystem.color || '#FFD700'; // Use star's color or default
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '16px monospace';
            ctx.fillText(activeSystem.name, cx + 30, cy + 5);

            // Draw planets statically
            const planetCount = activeSystem.planets.length;
            const orbitOffset = 100; // Base distance from star
            const orbitIncrement = 60; // Distance between planet orbits

            activeSystem.planets.forEach((planet, index) => {
                const angle = (index / planetCount) * Math.PI * 2;
                const radius = orbitOffset + (index * orbitIncrement);

                const px = cx + Math.cos(angle) * radius;
                const py = cy + Math.sin(angle) * radius;

                // Draw planet "orbit" circle (purely visual, no motion)
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();

                // Draw planet
                ctx.beginPath();
                ctx.fillStyle = getPlanetColor(planet.planetType) || '#808080'; // Fallback color
                ctx.arc(px, py, 12, 0, Math.PI * 2); // Slightly larger planets for clarity
                ctx.fill();

                // Draw planet name
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.fillText(planet.planetName, px + 15, py + 5);

                // For demonstration, draw a small yellow circle for settlements if any
                if (planet.settlements && planet.settlements.length > 0) {
                    ctx.beginPath();
                    ctx.fillStyle = 'yellow';
                    ctx.arc(px - 8, py - 8, 3, 0, Math.PI * 2); // Small indicator
                    ctx.fill();
                }

                // If you want to show a single moon for demonstration (like the NMS image)
                if (planet.moons && planet.moons.length > 0) {
                    const moon = planet.moons[0]; // Just show the first moon
                    const moonOrbitRadius = 20; // Small fixed orbit around planet
                    const moonAngle = angle + Math.PI / 4; // Offset slightly from planet

                    const mx = px + Math.cos(moonAngle) * moonOrbitRadius;
                    const my = py + Math.sin(moonAngle) * moonOrbitRadius;

                    ctx.beginPath();
                    ctx.fillStyle = getPlanetColor(moon.type) || '#ccc'; // Re-using planet color util for moon
                    ctx.arc(mx, my, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // Call draw once to render the static map when activeSystem changes
        draw();

        // --- Event Handlers (for click interaction on static elements) ---
        function handleClick(event) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Check if a planet was clicked
            const planetClickRadius = 12; // Match planet draw size
            activeSystem.planets?.forEach((planet, index) => {
                const angle = (index / planetCount) * Math.PI * 2;
                const radius = orbitOffset + (index * orbitIncrement);

                const px = cx + Math.cos(angle) * radius;
                const py = cy + Math.sin(angle) * radius;

                const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                if (dist < planetClickRadius) {
                    console.log(`Clicked on planet: ${planet.planetName}`);
                    setSelectedPlanet(planet); // Set selected planet for future details view
                }
            });
        }

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mousemove', (event) => {
            setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        });

        // Cleanup function for event listeners
        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('mousemove', (event) => {
                setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
            });
        };
    }, [activeSystem]); // Depend on activeSystem to re-render when it changes

    return (
        // *** Outer div for StarSystemViewer (full height) ***
        // This div needs to be w-full h-full to occupy all space given by its parent
        // It should NOT have any background colors, padding, borders, shadows, or rounded corners
        // if you want the canvas to fill it completely.
        <div className="w-full h-full relative flex flex-col"> {/* Added 'relative' and 'flex flex-col' for internal layout */}
            {/* Top Bar (Back button) - This will be at the top */}
            {/* Apply background and padding directly to this bar */}
            <div className="flex justify-start items-center gap-4 bg-gray-900 bg-opacity-80 px-6 py-3 z-20">
                <button
                    onClick={onClose}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    <SquareArrowLeft className="inline w-4 h-4 mr-1 text-red-400" /> Back to Galaxy Map
                </button>
            </div>

            {/* Wrapper for Canvas - This will take remaining height */}
            {/* It should also be w-full h-full, and flex-grow to take remaining space */}
            <div ref={wrapperRef} className="flex-grow w-full bg-black"> {/* flex-grow ensures it takes available height, w-full for width */}
                <canvas ref={canvasRef} className="w-full h-full z-10" /> {/* Canvas fills this wrapper */}
            </div>

            {/* Selected Planet Details - This will be at the bottom, or positioned absolutely */}
            {selectedPlanet && (
                <div className="absolute bottom-4 left-4 text-white bg-gray-900 p-3 rounded shadow-lg z-30"> {/* Z-index to ensure it's on top */}
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