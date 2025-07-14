import { generateElementalMineral } from '@utils/mineralUtils';
import { useEffect, useRef, useState } from 'react';

const StarSystemViewer = ({ starSystem, onClose }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const orbitState = useRef({});
    const [zoomedPlanet, setZoomedPlanet] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [hoveredMoon, setHoveredMoon] = useState(null);

    useEffect(() => {
        orbitState.current = {};
        starSystem.planets?.forEach((planet, index) => {
            const baseAngle = Math.random() * Math.PI * 2;
            orbitState.current[planet.name] = {
                angle: baseAngle,
                speed: 0.001 + Math.random() * 0.001,
                radius: 80 + index * 50,
                moons: (planet.moons || []).map((moon, mIndex) => ({
                    angle: Math.random() * Math.PI * 2,
                    speed: 0.005 + Math.random() * 0.003,
                    radius: 15 + mIndex * 12,
                    type: moon.type,
                    name: moon.name,
                    resource: generateElementalMineral()?.mineralName || 'Unknown'
                }))
            };
        });
    }, [starSystem]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;
        const cx = width / 2;
        const cy = height / 2;

        function handleClick(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

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

        function handleMouseMove(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            setMousePos({ x, y });

            if (zoomedPlanet) {
                const px = cx;
                const py = cy;
                const orbit = orbitState.current[zoomedPlanet.name];

                const hovered = orbit.moons?.find((moon) => {
                    const mx = px + Math.cos(moon.angle) * moon.radius * 2.5;
                    const my = py + Math.sin(moon.angle) * moon.radius * 2.5;
                    const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
                    return dist < 8;
                });

                setHoveredMoon(hovered || null);
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
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;
        const cx = width / 2;
        const cy = height / 2;

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
            return colors[type] || '#4FC3F7';
        }

        function getMoonColor(type) {
            const colors = {
                Ice: '#90CAF9',
                Volcanic: '#EF9A9A',
                Rocky: '#B0BEC5',
                Oceanic: '#81D4FA',
                Exotic: '#FFF176',
                Crystaline: '#E1BEE7'
            };
            return colors[type] || '#B0BEC5';
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            ctx.beginPath();
            ctx.fillStyle = starSystem.color || '#FFD700';
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.fill();

            if (zoomedPlanet) {
                const orbit = orbitState.current[zoomedPlanet.name];
                orbit.angle += orbit.speed;

                const px = cx;
                const py = cy;

                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.arc(px, py, 80, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.fillStyle = getPlanetColor(zoomedPlanet.type);
                ctx.arc(px, py, 20, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.font = '16px monospace';
                ctx.fillText(zoomedPlanet.name, px + 25, py);

                orbit.moons?.forEach((moon) => {
                    if (hoveredMoon !== moon) {
                        moon.angle += moon.speed;
                    }
                    const mx = px + Math.cos(moon.angle) * moon.radius * 2.5;
                    const my = py + Math.sin(moon.angle) * moon.radius * 2.5;

                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.arc(px, py, moon.radius * 2.5, 0, Math.PI * 2);
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
                starSystem.planets?.forEach((planet, index) => {
                    const orbit = orbitState.current[planet.name];
                    orbit.angle += orbit.speed;

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
                        moon.angle += moon.speed;
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
    }, [starSystem, zoomedPlanet, hoveredMoon]);

    return (
        // Main div to appease React
        <div>

            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
                {zoomedPlanet && (
                    <button
                        onClick={() => setZoomedPlanet(null)}
                        className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Back to Star View
                    </button>
                )}
                <canvas ref={canvasRef} className="w-full h-full" />
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
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Close Map
                </button>
            </div>
        </div>

    );
};

export default StarSystemViewer;
