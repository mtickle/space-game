import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StarMap = ({ stars }) => {
    const canvasRef = useRef(null);
    const [selectedStar, setSelectedStar] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(null);
    const navigate = useNavigate();
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [mapState, setMapState] = useState({ offsetX: 0, offsetY: 0, scale: 1, clickOffsetX: 0, clickOffsetY: 0 });
    const [redrawTrigger, setRedrawTrigger] = useState(false);

    // Resize canvas dynamically with observer
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
                setRedrawTrigger(prev => !prev);
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, []);

    // Redraw stars and planets
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
        ctx.scale(scale, scale);

        const sortedStars = [...stars].sort((a, b) => (a.z || 0) - (b.z || 0));

        sortedStars.forEach((star) => {
            const depth = star.z || 0;
            const alpha = 1 - depth * 0.8;
            const blur = 10 * (1 - depth);

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = blur;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#FFFFFF';
            
            ctx.textAlign = 'center';
            ctx.fillText(star.name, star.x, star.y - star.size - 5 / scale);

            if (hoveredStar?.name === star.name) {
                star.planets.forEach((planet) => {
                    if (!planet.angle) planet.angle = Math.random() * Math.PI * 2;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, planet.orbitRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = planet.color + '33';
                    ctx.lineWidth = 0.5 / scale;
                    ctx.stroke();

                    const angle = planet.angle;
                    const px = star.x + Math.cos(angle) * planet.orbitRadius;
                    const py = star.y + Math.sin(angle) * planet.orbitRadius;
                    ctx.beginPath();
                    ctx.arc(px, py, planet.size / 4, 0, Math.PI * 2);
                    ctx.fillStyle = planet.color;
                    ctx.fill();
                });
            }

            if (selectedStar?.name === star.name) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size + 2, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }
        });

        ctx.restore();
    }, [stars, selectedStar, hoveredStar, offsetX, offsetY, scale, redrawTrigger]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - canvas.width / 2 - offsetX) / scale;
        const mouseY = (e.clientY - rect.top - canvas.height / 2 - offsetY) / scale;

        if (isDragging) {
            setOffsetX(offsetX + (e.clientX - dragStart.x) / scale);
            setOffsetY(offsetY + (e.clientY - dragStart.y) / scale);
            setDragStart({ x: e.clientX, y: e.clientY });
        } else {
            const hovered = stars.find(star => {
                const dx = mouseX - star.x;
                const dy = mouseY - star.y;
                return Math.sqrt(dx * dx + dy * dy) < star.size + 4;
            });
            setHoveredStar(hovered ? { ...hovered, clientX: e.clientX - rect.left, clientY: e.clientY - rect.top } : null);
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e) => {
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
                return Math.sqrt(dx * dx + dy * dy) < star.size + 4;
            });

            if (clickedStar) {
                const screenX = clickedStar.x * scale + offsetX + canvas.width / 2;
                const screenY = clickedStar.y * scale + offsetY + canvas.height / 2;
                const clickOffsetX = e.clientX - screenX;
                const clickOffsetY = e.clientY - screenY;
                setMapState({ offsetX, offsetY, scale, clickOffsetX, clickOffsetY });
                setSelectedStar({ ...clickedStar, clientX: e.clientX - rect.left, clientY: e.clientY - rect.top });
                navigate(`/system/${encodeURIComponent(clickedStar.name)}`);
            }
        }
    };

    return (

        <div className="w-screen h-screen bg-black flex flex-col items-center justify-center relative text-white font-mono">

            <h1 className="text-3xl mb-4 text-orange-400 tracking-wider">STARWEAVE '78</h1>



            <div className="relative w-[75vw] aspect-[16/9] border-2 border-green-500 shadow-[0_0-10px_#0f0]">
                <canvas
                    ref={canvasRef}
                    className="bg-black cursor-pointer w-full h-full block"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    onClick={handleClick}
                />
            </div>

            {hoveredStar && !selectedStar && (
                <div
                    className="absolute bg-black bg-opacity-90 p-2 rounded-lg border-2 border-orange-400 shadow-[0_0-5px_#ff0] text-sm z-10"
                    style={{
                        left: Math.min(hoveredStar.clientX + 20, window.innerWidth - 220),
                        top: Math.min(hoveredStar.clientY, window.innerHeight - 120),
                    }}
                >
                    <p className="text-yellow-400 font-bold">{hoveredStar.name}</p>
                    <p className="text-green-400"><strong>Type:</strong> {hoveredStar.type}</p>
                    <p className="text-green-400"><strong>Temp:</strong> {hoveredStar.temp}</p>
                </div>
            )}

            {selectedStar && (
                <div
                    className="absolute bg-black bg-opacity-90 p-4 rounded-lg border-2 border-orange-400 shadow-[0_0-8px_#ff0] max-w-sm transition-opacity duration-200 z-10"
                    style={{
                        left: Math.max(10, Math.min(selectedStar.clientX + 10, window.innerWidth - 320)),
                        top: Math.max(10, Math.min(selectedStar.clientY + 10, window.innerHeight - 320)),
                    }}
                    onClick={() => {
                        setSelectedStar(null);
                        setOffsetX(mapState.offsetX);
                        setOffsetY(mapState.offsetY);
                        setScale(mapState.scale);
                        const canvas = canvasRef.current;
                        const targetX = (canvas.width / 2) - mapState.clickOffsetX;
                        const targetY = (canvas.height / 2) - mapState.clickOffsetY;
                        setOffsetX(prev => prev + (targetX - (canvas.width / 2 + prev)));
                        setOffsetY(prev => prev + (targetY - (canvas.height / 2 + prev)));
                        setRedrawTrigger(prev => !prev);
                    }}
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
                            setOffsetX(mapState.offsetX);
                            setOffsetY(mapState.offsetY);
                            setScale(mapState.scale);
                            const canvas = canvasRef.current;
                            const targetX = (canvas.width / 2) - mapState.clickOffsetX;
                            const targetY = (canvas.height / 2) - mapState.clickOffsetY;
                            setOffsetX(prev => prev + (targetX - (canvas.width / 2 + prev)));
                            setOffsetY(prev => prev + (targetY - (canvas.height / 2 + prev)));
                            setRedrawTrigger(prev => !prev);
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
