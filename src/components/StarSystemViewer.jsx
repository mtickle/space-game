import { useEffect, useRef } from 'react';

const StarSystemViewer = ({ starSystem, onClose }) => {


    if (!starSystem || !starSystem.planets) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white">
                <p className="text-lg">Loading starSystem system...</p>
            </div>
        );
    }
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const orbitState = useRef({});

    const getPlanetColor = (type) => {
        switch (type) {
            case 'Ice World': return '#8ED1FC';
            case 'Volcanic': return '#FF5722';
            case 'Oceanic': return '#00BCD4';
            case 'Gas Giant': return '#FFEB3B';
            case 'Rocky': return '#A1887F';
            default: return '#4FC3F7';
        }
    };

    const getMoonColor = (type) => {
        switch (type) {
            case 'Rocky': return '#A1887F';
            case 'Icy': return '#8ED1FC';
            case 'Volcanic': return '#FF5722';
            case 'Desolate': return '#C0C0C0'
            case 'Oceanic': return '#00BCD4';
            case 'Cratered': return '#C0C0C0'
            case 'Frozen': return '#8ED1FC';
            case 'Metallic': return '#C0C0C0'
            case 'Carbonaceous': return '#C0C0C0'
            default: return '#4FC3F7';
        }
    }
    // Assign basic orbit data on load
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
                    //radius: 15 + mIndex * 12,
                    radius: Math.max(20, 15 + mIndex * 12),

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

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            // Draw starSystem
            ctx.beginPath();
            ctx.fillStyle = starSystem.color || '#FFD700';
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.fill();

            // Draw orbiting planets
            starSystem.planets?.forEach((planet, index) => {
                const orbit = orbitState.current[planet.name];
                orbit.angle += orbit.speed;

                const px = cx + Math.cos(orbit.angle) * orbit.radius;
                const py = cy + Math.sin(orbit.angle) * orbit.radius;

                // Orbit path
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.arc(cx, cy, orbit.radius, 0, Math.PI * 2);
                ctx.stroke();

                // Planet body
                ctx.beginPath();
                //ctx.fillStyle = '#4FC3F7';
                ctx.fillStyle = getPlanetColor(planet.type);
                ctx.arc(px, py, 10, 0, Math.PI * 2);
                ctx.fill();

                // Label
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.fillText(planet.name, px + 12, py);

                // Moons
                orbit.moons?.forEach((moon, mIndex) => {
                    moon.angle += moon.speed;
                    const mx = px + Math.cos(moon.angle) * moon.radius;
                    const my = py + Math.sin(moon.angle) * moon.radius;

                    // Moon orbit
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                    ctx.arc(px, py, moon.radius, 0, Math.PI * 2);
                    ctx.stroke();

                    // Moon body
                    ctx.beginPath();
                    ctx.fillStyle = '#B0BEC5';
                    ctx.arc(mx, my, 3, 0, Math.PI * 2);
                    ctx.fill();
                });
            });

            requestRef.current = requestAnimationFrame(draw);
        }

        draw();
        return () => cancelAnimationFrame(requestRef.current);
    }, [starSystem]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
            <h1 className="text-yellow-300 text-xl font-bold mb-2">{starSystem.name}</h1>
            <canvas ref={canvasRef} className="w-full h-full" />
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
                Close Map
            </button>
        </div>
    );
};

export default StarSystemViewer;
