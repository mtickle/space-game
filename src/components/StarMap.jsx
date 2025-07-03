// StarMap.jsx
import { useEffect, useRef, useState } from 'react';
import { generatePlanets } from '../utils/planetUtils';
import Header from './Header';
import Sidebar from './Sidebar';

const StarMap = ({
    stars,
    offsetX,
    setOffsetX,
    offsetY,
    setOffsetY,
    scale,
    setScale,
    setCanvasSize,
}) => {
    const canvasRef = useRef(null);
    const [selectedStar, setSelectedStar] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [redrawTrigger, setRedrawTrigger] = useState(false);
    const [factionFilter, setFactionFilter] = useState('All');
    const [starTypeFilter, setStarTypeFilter] = useState('All');
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
                setCanvasSize({ width: canvas.width, height: canvas.height });
                setRedrawTrigger(prev => !prev);
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, [setCanvasSize]);

    const drawScene = () => {
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

            // Only draw orbits and planets for the selected star
            if (selectedStar?.name === star.name && star.planets) {
                star.planets.forEach((planet) => {
                    // Orbit ring
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, planet.orbitRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = planet.color + '33';
                    ctx.lineWidth = 0.5 / scale;
                    ctx.stroke();

                    // Planet dot (animated position)
                    planet.angle = (planet.angle ?? Math.random() * Math.PI * 2) + 0.01;
                    const px = star.x + Math.cos(planet.angle) * planet.orbitRadius;
                    const py = star.y + Math.sin(planet.angle) * planet.orbitRadius;
                    ctx.beginPath();
                    ctx.arc(px, py, planet.size ?? 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = planet.color;
                    ctx.fill();
                });
            }
        });

        ctx.restore();
    };

    useEffect(() => {
        const animate = () => {
            drawScene();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [stars, offsetX, offsetY, scale, factionFilter, selectedStar]);

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
                if (!clickedStar.planets || clickedStar.planets.length === 0) {
                    clickedStar.planets = generatePlanets(clickedStar.name);
                }
                clickedStar.planets.forEach(p => {
                    p.angle = p.angle ?? Math.random() * Math.PI * 2;
                });
                setSelectedStar(clickedStar);
            } else {
                setSelectedStar(null);
                setSelectedPlanet(null);
            }
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
                <Sidebar selectedStar={selectedStar} onMapClick={() => { }} />
                <div className="flex flex-1 items-center justify-center relative">
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
            </div>
            <div className="bg-black bg-opacity-90 border-t-2 border-green-500 p-2 flex justify-between items-center text-sm text-green-400">
                <div>
                    Coordinates: ({Math.round(offsetX)}, {Math.round(offsetY)}) | Zoom: {scale.toFixed(2)}x | Total Systems: {stars.length}
                </div>
                <button
                    className="underline text-green-400 hover:text-green-200 transition-colors"
                    onClick={() => {
                        setOffsetX(0);
                        setOffsetY(0);
                    }}
                >
                    Return to (0,0)
                </button>
            </div>
        </div>
    );
};

export default StarMap;
