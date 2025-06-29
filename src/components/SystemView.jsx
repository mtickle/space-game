import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const SystemView = ({ stars }) => {
    const { starName } = useParams();
    const navigate = useNavigate();
    const [star, setStar] = useState(null);
    const canvasRef = useRef(null);

    // Fetch star data
    useEffect(() => {
        const foundStar = stars.find(star => star.name === decodeURIComponent(starName));
        if (foundStar) {
            setStar(foundStar);
        } else {
            navigate('/'); // Redirect to map if star not found
        }
    }, [starName, stars, navigate]);

    // Draw star and planets on canvas
    useEffect(() => {
        if (!star) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Draw star with glow
        ctx.beginPath();
        ctx.arc(0, 0, star.size * 2, 0, Math.PI * 2); // Larger star for visibility
        ctx.fillStyle = star.color;
        ctx.shadowBlur = 15; // Retro glow
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw planet orbits
        star.planets.forEach(planet => {
            ctx.beginPath();
            ctx.arc(0, 0, planet.orbitRadius * 1.5, 0, Math.PI * 2); // Scaled orbits
            ctx.strokeStyle = planet.color + '33';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Draw planet
            const angle = Math.random() * Math.PI * 2;
            const px = Math.cos(angle) * planet.orbitRadius * 1.5;
            const py = Math.sin(angle) * planet.orbitRadius * 1.5;
            ctx.beginPath();
            ctx.arc(px, py, planet.size / 2, 0, Math.PI * 2); // Larger planets
            ctx.fillStyle = planet.color;
            ctx.fill();
        });

        ctx.restore();
    }, [star]);

    if (!star) return null;

    return (
        <div className="h-screen bg-black flex flex-col items-center text-white font-mono p-4">
            <h1 className="text-3xl mb-4 text-orange-400 tracking-wider">STARWEAVE '78: {star.name}</h1>
            <div className="bg-black bg-opacity-90 p-6 rounded-lg border-2 border-orange-400 shadow-[0_0_8px_#ff0] max-w-2xl w-full">
                <h2 className="text-2xl font-bold text-yellow-400">{star.name}</h2>
                <p className="text-green-400"><strong>Type:</strong> {star.type}</p>
                <p className="text-green-400"><strong>Temperature:</strong> {star.temp}</p>
                <p className="mt-2 text-sm text-gray-300">{star.description}</p>
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    className="mt-4 border-2 border-green-500 shadow-[0_0_8px_#0f0]"
                />
                <div className="mt-4 max-h-60 overflow-y-auto">
                    <h3 className="text-lg font-bold text-yellow-400">Planetary System</h3>
                    {star.planets.map((planet, index) => (
                        <div key={index} className="mt-2 flex items-center text-sm text-gray-300">
                            <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: planet.color }}
                            />
                            <div>
                                <p><strong>{planet.name}</strong> ({planet.type})</p>
                                <p>Size: {planet.size > 6 ? 'Large' : planet.size > 3 ? 'Medium' : 'Small'}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm text-white"
                    onClick={() => navigate('/')}
                >
                    Back to Map
                </button>
            </div>
        </div>
    );
};

export default SystemView;
