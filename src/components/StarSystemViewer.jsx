
import { getMoonColor, getPlanetColor } from '@utils/colorUtils';
import { generateElementalMineral } from '@utils/mineralUtils';
import { Pause, Play, SquareArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const StarSystemViewer = ({ starSystem, onClose }) => {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const requestRef = useRef();
    const orbitState = useRef({});
    const [zoomedPlanet, setZoomedPlanet] = useState(null);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [hoveredMoon, setHoveredMoon] = useState(null);
    const [settlementPositions, setSettlementPositions] = useState([]);
    const motionPausedRef = useRef(false);

    const toggleMotion = () => {
        motionPausedRef.current = !motionPausedRef.current;
    };

    useEffect(() => {
        orbitState.current = {};

        starSystem.planets?.forEach((planet, index) => {
            const baseAngle = Math.random() * Math.PI * 2;
            const planetOrbitRadius = 80 + index * 50;
            const moonCount = planet.moons?.length || 0;

            // Max space allowed for moons around this planet
            const maxMoonOrbit = planetOrbitRadius * 0.7; // 70% of distance from star
            const moonSpacing = moonCount > 0 ? maxMoonOrbit / (moonCount + 1) : 0;

            orbitState.current[planet.name] = {
                angle: baseAngle,
                speed: 0.001 + Math.random() * 0.001,
                radius: planetOrbitRadius,
                moons: (planet.moons || []).map((moon, mIndex) => ({
                    angle: Math.random() * Math.PI * 2,
                    speed: 0.005 + Math.random() * 0.003,
                    radius: moonSpacing * (mIndex + 1),
                    type: moon.type,
                    name: moon.name,
                    resource: generateElementalMineral()?.mineralName || 'Unknown',
                })),
            };
        });
    }, [starSystem]);

    useEffect(() => {
        if (!selectedPlanet || !selectedPlanet.settlements || selectedPlanet.settlements.length === 0) {
            setSettlementPositions([]);
            return;
        }

        const width = canvasRef.current?.width || 800;
        const height = canvasRef.current?.height || 600;
        const cx = width / 2;
        const cy = height / 2;
        const positions = [];

        const settlementCount = selectedPlanet.settlements.length;

        for (let i = 0; i < settlementCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 80;
            const sx = cx + Math.cos(angle) * radius;
            const sy = cy + Math.sin(angle) * radius;
            positions.push({
                x: sx,
                y: sy,
                name: selectedPlanet.settlements[i].name
            });
        }

        setSettlementPositions(positions);
    }, [selectedPlanet]);

    // useEffect(() => {
    //     if (selectedPlanet) {
    //         const width = canvasRef.current?.width || 800;
    //         const height = canvasRef.current?.height || 600;
    //         const cx = width / 2;
    //         const cy = height / 2;
    //         const settlementCount = selectedPlanet.settlements?.length || 5;
    //         const positions = [];
    //         for (let i = 0; i < settlementCount; i++) {
    //             const angle = Math.random() * Math.PI * 2;
    //             const radius = Math.random() * 80;
    //             const sx = cx + Math.cos(angle) * radius;
    //             const sy = cy + Math.sin(angle) * radius;
    //             positions.push({ x: sx, y: sy, name: selectedPlanet.settlements?.[i]?.name || `Settlement ${i + 1} ` });
    //         }
    //         setSettlementPositions(positions);
    //     } else {
    //         setSettlementPositions([]);
    //     }
    // }, [selectedPlanet]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const wrapper = wrapperRef.current;
        const rect = wrapper.getBoundingClientRect();
        const width = canvas.width = rect.width;
        const height = canvas.height = rect.height;
        const cx = width / 2;
        const cy = height / 2;

        function handleClick(event) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (zoomedPlanet) {
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                if (dist < 20) {
                    setSelectedPlanet(zoomedPlanet);
                    return;
                }
            } else {
                starSystem.planets?.forEach((planet) => {
                    const orbit = orbitState.current[planet.name];
                    const px = cx + Math.cos(orbit.angle) * orbit.radius;
                    const py = cy + Math.sin(orbit.angle) * orbit.radius;
                    const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                    if (dist < 12) {
                        setZoomedPlanet(planet);
                    }
                });
            }
        }

        function generateMoonOrbits(planet, maxFraction = 0.8) {
            const maxRadius = planet.orbitRadius * maxFraction;
            const count = planet.moons?.length || 0;
            const spacing = count > 0 ? maxRadius / (count + 1) : 0;

            return (planet.moons || []).map((moon, i) => ({
                ...moon,
                angle: Math.random() * Math.PI * 2,
                speed: 0.004 + Math.random() * 0.002,
                radius: spacing * (i + 1),
            }));
        }

        function handleMouseMove(event) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            setMousePos({ x, y });

            if (zoomedPlanet) {
                const px = cx;
                const py = cy;
                const orbit = orbitState.current[zoomedPlanet.name];
                const hoveredIndex = orbit.moons?.findIndex((moon, mIndex) => {
                    const moonGap = 14;
                    const moonOrbitRadius = 30 + mIndex * moonGap;

                    const mx = px + Math.cos(moon.angle) * moonOrbitRadius;
                    const my = py + Math.sin(moon.angle) * moonOrbitRadius;
                    const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
                    return dist < 12;
                });

                const hovered = hoveredIndex >= 0 ? orbit.moons[hoveredIndex] : null;
                setHoveredMoon(hovered);
            } else {
                setHoveredMoon(null);
            }
        }

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mousemove', handleMouseMove);
        return () => {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [starSystem, zoomedPlanet]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;

        // Define gradients
        const gradients = {
            'Rocky': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120), // Match planet radius
            'Gas Giant': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
            'Ice World': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
            'Exotic': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
            'Oceanic': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
            'Volcanic': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
            'Barren': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
            'Crystaline': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
            'Radiated': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
            'Artificial': ctx.createRadialGradient(cx, cy, 0, cx, cy, 120),
        };
        gradients['Rocky'].addColorStop(0, '#A0AEC0'); gradients['Rocky'].addColorStop(1, '#718096');
        gradients['Gas Giant'].addColorStop(0, '#F6AD55'); gradients['Gas Giant'].addColorStop(1, '#ED8936');
        gradients['Ice World'].addColorStop(0, '#90CDF4'); gradients['Ice World'].addColorStop(1, '#4299E1');
        gradients['Exotic'].addColorStop(0, '#ED64A6'); gradients['Exotic'].addColorStop(1, '#D53F8C');
        gradients['Oceanic'].addColorStop(0, '#63B3ED'); gradients['Oceanic'].addColorStop(1, '#2B6CB0');
        gradients['Volcanic'].addColorStop(0, '#FC8181'); gradients['Volcanic'].addColorStop(1, '#E53E3E');
        gradients['Barren'].addColorStop(0, '#CBD5E0'); gradients['Barren'].addColorStop(1, '#A0AEC0');
        gradients['Crystaline'].addColorStop(0, '#B794F4'); gradients['Crystaline'].addColorStop(1, '#9F7AEA');
        gradients['Radiated'].addColorStop(0, '#FBB6CE'); gradients['Radiated'].addColorStop(1, '#F687B3');
        gradients['Artificial'].addColorStop(0, '#F0E68C'); gradients['Artificial'].addColorStop(1, '#D4AF37');

        function draw() {
            ctx.fillStyle = '#1A202C';
            ctx.fillRect(0, 0, width, height);

            if (selectedPlanet) {
                ctx.beginPath();
                const gradient = gradients[selectedPlanet.type] || gradients['Rocky']; // Fallback to Rocky if type missing
                ctx.fillStyle = gradient;
                ctx.arc(cx, cy, 200, 0, Math.PI * 2); // Use gradient for planet disc
                ctx.fill();

                settlementPositions.forEach((pos) => {
                    ctx.beginPath();
                    ctx.fillStyle = '#FFD700';
                    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px monospace';
                    ctx.fillText(pos.name, pos.x + 6, pos.y);
                });

                ctx.fillStyle = '#fff';
                ctx.font = '16px monospace';
                ctx.fillText(selectedPlanet.name, cx + 110, cy - 100);
                ctx.fillText(`Type: ${selectedPlanet.type} `, cx + 110, cy - 80);
                ctx.fillText(`Settlements: ${settlementPositions.length} `, cx + 110, cy - 60);
            } else if (zoomedPlanet) {
                const orbit = orbitState.current[zoomedPlanet.name];
                if (!motionPausedRef.current) orbit.angle += orbit.speed;

                const px = cx;
                const py = cy;

                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                //ctx.arc(px, py, 80, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.fillStyle = getPlanetColor(zoomedPlanet.type);
                ctx.arc(px, py, 20, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.font = '16px monospace';
                ctx.fillText(zoomedPlanet.name, px + 25, py);
                // Spread them out more for zoomed planet view
                const baseOrbit = 30;
                const moonGap = 20; // Spread moons apart visually

                orbit.moons?.forEach((moon, mIndex) => {
                    if (!motionPausedRef.current) {
                        moon.angle += moon.speed;
                    }

                    const moonOrbit = baseOrbit + mIndex * moonGap;
                    const mx = px + Math.cos(moon.angle) * moonOrbit;
                    const my = py + Math.sin(moon.angle) * moonOrbit;

                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.arc(px, py, moonOrbit, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.fillStyle = getMoonColor(moon.type);
                    ctx.arc(mx, my, 6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ccc';
                    ctx.font = '10px monospace';
                    ctx.fillText(moon.name || 'Moon', mx + 8, my);
                });

            } else {
                ctx.beginPath();
                ctx.fillStyle = starSystem.color || '#FFD700';
                ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.font = '16px monospace';
                ctx.fillText(starSystem.name, cx + 30, cy + 5);

                starSystem.planets?.forEach((planet) => {
                    const orbit = orbitState.current[planet.name];
                    if (!motionPausedRef.current) orbit.angle += orbit.speed;

                    const px = cx + Math.cos(orbit.angle) * orbit.radius;
                    const py = cy + Math.sin(orbit.angle) * orbit.radius;

                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.arc(cx, cy, orbit.radius, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.fillStyle = getPlanetColor(planet.type);
                    ctx.arc(px, py, 10, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#fff';
                    ctx.font = '12px monospace';
                    ctx.fillText(planet.name, px + 12, py);

                    orbit.moons?.forEach((moon) => {
                        if (!motionPausedRef.current) moon.angle += moon.speed;
                        const mx = px + Math.cos(moon.angle) * moon.radius;
                        const my = py + Math.sin(moon.angle) * moon.radius;

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                        ctx.arc(px, py, moon.radius, 0, Math.PI * 2);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.fillStyle = getMoonColor(moon.type);
                        ctx.arc(mx, my, 3, 0, Math.PI * 2);
                        ctx.fill();
                    });
                });
            }

            requestRef.current = requestAnimationFrame(draw);
        }

        draw();
        return () => cancelAnimationFrame(requestRef.current);
    }, [starSystem, zoomedPlanet, selectedPlanet, hoveredMoon, settlementPositions]);

    return (
        <div>
            <div className="absolute inset-0 bg-black bg-opacity-90 z-20 flex flex-col">
                <div ref={wrapperRef} className="relative w-full h-full bg-black border-l border-gray-800">
                    <canvas ref={canvasRef} className="w-full h-full z-10" />

                    {hoveredMoon && (
                        <div
                            className="absolute text-xs bg-gray-900 text-white px-2 py-1 rounded border border-gray-700 pointer-events-none"
                            style={{ top: mousePos.y + 12, left: mousePos.x + 12 }}
                        >
                            <strong>{hoveredMoon.name}</strong><br />
                            Type: {hoveredMoon.type}<br />
                            Resource: {hoveredMoon.resource || 'None'}
                        </div>
                    )}

                    <div className="absolute top-0 left-0 right-0 flex justify-start items-center gap-4 bg-map-background bg-opacity-80 px-6 py-3 border-b border-gray-800 z-20">
                        {selectedPlanet && (
                            <button
                                onClick={() => setSelectedPlanet(null)}
                                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                <SquareArrowLeft className="inline w-4 h-4 mr-1 text-blue-400" /> Back to Orbital View
                            </button>
                        )}
                        {zoomedPlanet && (
                            <button
                                onClick={() => setZoomedPlanet(null)}
                                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                <SquareArrowLeft className="inline w-4 h-4 mr-1 text-blue-400" /> Back to Star View
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            <SquareArrowLeft className="inline w-4 h-4 mr-1 text-red-400" /> Back to Galaxy Map
                        </button>
                        <button
                            onClick={toggleMotion}
                            className="flex items-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            {motionPausedRef.current ? (
                                <>
                                    <Play className="inline w-4 h-4 mr-2 text-green-400" />
                                    Resume Motion
                                </>
                            ) : (
                                <>
                                    <Pause className="inline w-4 h-4 mr-2 text-yellow-400" />
                                    Pause Motion
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StarSystemViewer;