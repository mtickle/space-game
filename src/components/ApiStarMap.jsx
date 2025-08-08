import AdminPanel from '@components/AdminPanel';
import Sidebar from '@components/Sidebar';
import StarSystemViewer from '@components/StarSystemViewer';
import { useApiStarField } from '@hooks/useApiStarField.js'; // <-- NEW: Using the API-driven hook
import Footer from '@layouts/Footer';
import Header from '@layouts/Header';
import {
    createHandleClick,
    createHandleContextMenu,
    createHandleMouseDown,
    createHandleMouseMove,
    createHandleMouseUp,
    createHandleWheel
} from '@utils/mouseUtils.jsx';
import { useCallback, useEffect, useRef, useState } from 'react';

// A simple helper to replace the one from the old hook
const getStarTooltip = (star) => {
    if (!star) return null;
    return {
        name: star.name,
        type: star.type,
        faction: star.faction?.name || 'Unknown',
        planets: star.planets?.length || 0,
    };
};


const ApiStarMap = () => {
    // --- STATE MANAGEMENT ---
    // View state (pan & zoom) is now managed inside this component
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(1);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // --- API DATA FETCHING ---
    // The new hook fetches stars from the API based on the current view
    const stars = useApiStarField({
        offsetX,
        offsetY,
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
        scale,
    });

    // --- UI & INTERACTION STATE ---
    const [activeSystem, setActiveSystem] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [factionFilter, setFactionFilter] = useState('All');
    const [starTypeFilter, setStarTypeFilter] = useState('All');
    const [showVisited, setShowVisited] = useState(false);
    const [showSystemMap, setShowSystemMap] = useState(false);

    // --- REFS ---
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const orbitState = useRef({});
    const backgroundStars = useRef([]);
    const NEBULA_CLOUDS = useRef([]);

    // --- EFFECT HOOKS ---
    // Effect to manage canvas size and generate static background
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
                setCanvasSize({ width, height });

                // Generate static background stars and nebulae
                const numBgStars = 200;
                const starsArray = Array.from({ length: numBgStars }, () => ({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5,
                    opacity: 0.1 + Math.random() * 0.2
                }));
                backgroundStars.current = starsArray;

                NEBULA_CLOUDS.current = [
                    { x: width * 0.2, y: height * 0.3, radius: 150, color: 'rgba(100, 100, 255, 0.03)' },
                    { x: width * 0.7, y: height * 0.8, radius: 180, color: 'rgba(255, 100, 100, 0.03)' }
                ];
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, []); // Runs only once on mount

    // Effect to initialize planet orbits for animation
    useEffect(() => {
        const state = {};
        stars.forEach(star => {
            if (!star.planets || star.planets.length === 0) return;
            state[star.id] = star.planets.map((planet, i) => ({
                angle: Math.random() * Math.PI * 2,
                speed: 0.001 + Math.random() * 0.001,
                radius: planet.orbitRadius || (20 + i * 8),
            }));
        });
        orbitState.current = state;
    }, [stars]);

    // --- MOUSE HANDLERS ---
    const handleMouseDown = createHandleMouseDown(setIsDragging, setDragStart);
    const handleMouseMove = useCallback((e) => {
        createHandleMouseMove({
            canvasRef, offsetX, offsetY, scale, isDragging,
            setOffsetX, setOffsetY, dragStart, setDragStart,
            stars, setHoveredStar, orbitState
        })(e);
    }, [offsetX, offsetY, scale, isDragging, dragStart, stars]);

    const handleMouseUp = createHandleMouseUp(setIsDragging);
    const handleWheel = useCallback((e) => {
        createHandleWheel(scale, setScale)(e);
    }, [scale, setScale]);

    // MODIFIED: Click handler now just sets the active system.
    // The StarSystemViewer component will handle fetching the full data.
    const handleClick = useCallback((e) => {
        createHandleClick({
            isDragging, canvasRef, offsetX, offsetY, scale, stars,
            setActiveSystem,
            setShowSystemMap // <-- ADD THIS LINE
        })(e);
    }, [isDragging, offsetX, offsetY, scale, stars, setActiveSystem, setShowSystemMap]); // <-- Also add it to the dependency array

    const handleContextMenu = createHandleContextMenu({
        canvasRef, offsetX, offsetY, scale, stars
    });

    // --- DRAWING LOGIC ---
    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;

        // Draw static background
        const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
        backgroundGradient.addColorStop(0, '#1a1a2e');
        backgroundGradient.addColorStop(0.5, '#3b3b5c');
        backgroundGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, width, height);

        backgroundStars.current.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        });

        ctx.filter = 'blur(8px)';
        NEBULA_CLOUDS.current.forEach(cloud => {
            ctx.fillStyle = cloud.color;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.filter = 'none';

        // Prepare for drawing main stars
        ctx.save();
        ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
        ctx.scale(scale, scale);

        const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
        const home = JSON.parse(localStorage.getItem('homeSystem') || '{}');

        // Apply filters
        const filteredStars = stars.filter(star =>
            (factionFilter === 'All' || star.faction?.name === factionFilter) &&
            (starTypeFilter === 'All' || star.type === starTypeFilter)
        );

        // Draw each star
        filteredStars.forEach((star) => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Home system indicator
            if (home.id === star.id) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size + 4 / scale, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }

            // Star name
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${12 / scale}px Courier New, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(star.name, star.x, star.y - star.size - 6 / scale);

            // Visited indicator
            if (visited.includes(star.id)) {
                ctx.beginPath();
                ctx.arc(star.x, star.y - star.size - 12 / scale, 2 / scale, 0, Math.PI * 2);
                ctx.fillStyle = '#00FF00';
                ctx.fill();
            }
        });

        ctx.restore();

        // Draw tooltip for hovered star
        if (hoveredStar) {
            const tooltip = getStarTooltip(hoveredStar);
            ctx.save();
            ctx.font = '12px monospace';
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            const text = `★ ${tooltip.name} | ${tooltip.faction}`;
            const metrics = ctx.measureText(text);
            const canvasRect = canvas.getBoundingClientRect();
            const tooltipX = hoveredStar.clientX - canvasRect.left + 15;
            const tooltipY = hoveredStar.clientY - canvasRect.top + 15;
            ctx.fillRect(tooltipX, tooltipY, metrics.width + 10, 20);
            ctx.fillStyle = '#00ff88';
            ctx.fillText(text, tooltipX + 5, tooltipY + 15);
            ctx.restore();
        }
    }, [stars, offsetX, offsetY, scale, activeSystem, hoveredStar, factionFilter, starTypeFilter, showVisited]);

    // --- ANIMATION LOOP ---
    useEffect(() => {
        const animate = () => {
            drawScene();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [drawScene]);

    // --- ANIMATED NAVIGATION ---
    const goToSystem = useCallback((targetStar) => {
        // ... (goToSystem logic remains the same)
    }, [offsetX, offsetY, setOffsetX, setOffsetY, setActiveSystem, stars, orbitState]);

    const goToZeroCommaZero = useCallback(() => {
        // ... (goToZeroCommaZero logic remains the same)
    }, [offsetX, offsetY, setOffsetX, setOffsetY]);

    // --- RENDER ---
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
                <Sidebar
                    activeSystem={activeSystem}
                    setActiveSystem={setActiveSystem}
                    setShowSystemMap={setShowSystemMap}
                />
                <div className="relative flex-1">
                    <canvas
                        ref={canvasRef}
                        className="bg-black cursor-pointer w-full h-full block"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        onClick={handleClick}
                        onContextMenu={handleContextMenu}
                    />
                    {showSystemMap && activeSystem && (
                        <div className="absolute inset-0 z-10 bg-gray-900 overflow-hidden">
                            <StarSystemViewer
                                // Pass the basic star data; this component will fetch the full system
                                activeSystem={activeSystem}
                                onClose={() => setShowSystemMap(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
            <AdminPanel stars={stars} goToSystem={goToSystem} />
            <Footer
                offsetX={offsetX}
                offsetY={offsetY}
                scale={scale}
                setScale={setScale}
                stars={stars}
                setOffsetX={setOffsetX}
                setOffsetY={setOffsetY}
                goToSystem={goToSystem}
                goToZeroCommaZero={goToZeroCommaZero}
                setShowVisited={setShowVisited}
                showVisited={showVisited}
            />
        </div>
    );
};

export default ApiStarMap;
