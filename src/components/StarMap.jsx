import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StarMap = ({ stars }) => {
    const canvasRef = useRef(null);
    const [selectedStar, setSelectedStar] = useState(null);
    const navigate = useNavigate();
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(0.5); // Start zoomed out to show more
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Redraw stars and planets on canvas with pan/zoom
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
        ctx.scale(scale, scale);

        stars.forEach(star => {
            // Draw star with glow
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw planet orbits
            star.planets.forEach(planet => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, planet.orbitRadius, 0, Math.PI * 2);
                ctx.strokeStyle = planet.color + '33';
                ctx.lineWidth = 0.5 / scale;
                ctx.stroke();

                // Draw planet
                const angle = Math.random() * Math.PI * 2;
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
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }
        });

        ctx.restore();
    }, [stars, selectedStar, offsetX, offsetY, scale]);

    // Handle mouse events for pan and zoom
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setOffsetX(offsetX + dx / scale);
            setOffsetY(offsetY + dy / scale);
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const newScale = Math.min(Math.max(scale - e.deltaY * zoomSpeed * 0.001, 0.5), 2);
        setScale(newScale);
    };

    const handleClick = (e) => {
        if (!isDragging) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left - canvas.width / 2 - offsetX) / scale;
            const mouseY = (e.clientY - rect.top - canvas.height / 2 - offsetY) / scale;

            const clickedStar = stars.find(star => {
                const dx = mouseX - star.x;
                const dy = mouseY - star.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < star.size + 4;
            });

            if (clickedStar) {
                setSelectedStar({ ...clickedStar, clientX: e.clientX - rect.left, clientY: e.clientY - rect.top });
                navigate(`/system/${encodeURIComponent(clickedStar.name)}`);
            } else {
                setSelectedStar(null);
            }
        }
    };

    return (
        <div className="relative flex flex-col items-center text-white font-mono h-screen w-screen">
            <h1 className="text-3xl mb-4 text-orange-400 tracking-wider">STARWEAVE '78</h1>
            <div className="w-full h-full">
                <canvas
                    ref={canvasRef}
                    style={{ width: '100vw', height: '100vh' }}
                    className="border-2 border-green-500 bg-black shadow-[0_0_10px_#0f0] cursor-pointer"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    onClick={handleClick}
                />
            </div>
            {selectedStar && (
                <div
                    className="absolute bg-black bg-opacity-90 p-4 rounded-lg border-2 border-orange-400 shadow-[0_0_8px_#ff0] max-w-sm transition-opacity duration-200 z-10"
                    style={{
                        left: Math.min(selectedStar.clientX + 10, window.innerWidth - 250),
                        top: Math.min(selectedStar.clientY + 10, window.innerHeight - 200),
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
