
import { useEffect, useRef, useState } from 'react';
import Header from './Header';
import PlanetMapModal from './PlanetMapModal';
import Sidebar from './Sidebar';

const StarMap = ({ stars }) => {
    const canvasRef = useRef(null);
    const [selectedStar, setSelectedStar] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [mapState, setMapState] = useState({ offsetX: 0, offsetY: 0, scale: 1, clickOffsetX: 0, clickOffsetY: 0 });
    const [redrawTrigger, setRedrawTrigger] = useState(false);
    const [factionFilter, setFactionFilter] = useState('All');
    const [starTypeFilter, setStarTypeFilter] = useState('All');
    const [selectedPlanet, setSelectedPlanet] = useState(null);

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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
        ctx.scale(scale, scale);

        const filteredStars = factionFilter === 'All' ? stars : stars.filter(star => star.faction?.name === factionFilter);
        const sortedStars = [...filteredStars].sort((a, b) => (a.z || 0) - (b.z || 0));

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
            ctx.font = `${12 / scale}px Courier New, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(star.name, star.x, star.y - star.size - 6 / scale);

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
    }, [stars, selectedStar, hoveredStar, offsetX, offsetY, scale, redrawTrigger, factionFilter]);

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
            } else {
                setSelectedStar(null);
                setSelectedPlanet(null); // Clear planet selection if clicking outside
            }
        }
    };

    const handlePlanetClick = (planet) => {
        if (planet.settlements) {
            setSelectedPlanet(planet);
        }
    };

    return (
        <div className="w-screen h-screen bg-black flex flex-col text-white font-mono">
            <Header
                stars={stars}
                factionFilter={factionFilter}
                setFactionFilter={setFactionFilter}
                starTypeFilter={starTypeFilter}
                setStarTypeFilter={setStarTypeFilter}
            />
            <div className="flex flex-row flex-1 overflow-hidden">
                <Sidebar selectedStar={selectedStar} />
                <div className="flex flex-1 items-center justify-center relative">
                    <div className="relative w-[75vw] aspect-[16/9] border-black-500 shadow-[0_0-10px_#0f0]">
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
                                left: Math.min(hoveredStar.clientX + 30, window.innerWidth - 220),
                                top: Math.min(hoveredStar.clientY + 40, window.innerHeight - 120),
                            }}
                        >
                            <div className="flex items-center mb-1">
                                {hoveredStar.faction?.symbol || '⛔'}
                                <p className="text-yellow-400 font-bold"> {hoveredStar.name}</p>
                            </div>
                            <p className="text-green-400"><strong>Type:</strong> {hoveredStar.type}</p>
                            <p className="text-green-400"><strong>Temp:</strong> {hoveredStar.temp}</p>
                            <p className="text-green-400"><strong>Faction:</strong> {hoveredStar.faction?.name || 'Unknown'}</p>
                        </div>
                    )}
                    {selectedStar && (
                        <div className="absolute top-2 left-2 bg-black bg-opacity-80 p-2 rounded-lg border-2 border-green-500 shadow-[0_0-5px_#0f0]">
                            {selectedStar.planets.map((planet, index) => (
                                <p key={index} className="text-green-400 cursor-pointer hover:text-green-300" onClick={() => handlePlanetClick(planet)}>
                                    {planet.name} (${planet.type})
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {selectedPlanet && (
                <PlanetMapModal planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
            )}
        </div>
    );
};

export default StarMap;