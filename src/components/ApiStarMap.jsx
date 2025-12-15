import Sidebar from '@components/Sidebar';
import StarSystemViewer from '@components/StarSystemViewer';
import { useApiStarField } from '@hooks/useApiStarField.js';
import Footer from '@layouts/Footer';
import Header from '@layouts/Header';
import { fetchSystemDetails } from '@utils/apiUtils.js'; // Assuming this is where the fetch logic lives
import {
    createHandleContextMenu,
    createHandleMouseDown,
    createHandleMouseMove,
    createHandleMouseUp,
    createHandleWheel
} from '@utils/mouseUtils.jsx';
import { useCallback, useEffect, useRef, useState } from 'react';

// Helper for the tooltip
const getStarTooltip = (star) => {
    if (!star) return null;
    return {
        name: star.name,
        type: star.type,
        faction: star.faction?.name || 'Unknown',
    };
};

const ApiStarMap = () => {
    // --- STATE MANAGEMENT ---
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(1);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const stars = useApiStarField({
        offsetX,
        offsetY,
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
        scale,
    });

    // --- UI & INTERACTION STATE ---
    const [activeSystem, setActiveSystem] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(null); // <-- RE-ADDED FOR TOOLTIP
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [factionFilter, setFactionFilter] = useState('All');
    const [starTypeFilter, setStarTypeFilter] = useState('All');
    const [showVisited, setShowVisited] = useState(false);
    const [showSystemMap, setShowSystemMap] = useState(false);
    const [stats, setStats] = useState({ totalSystems: 0, totalPlanets: 0 });

    // --- REFS ---
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const backgroundStars = useRef([]);
    const NEBULA_CLOUDS = useRef([]);

    // --- EFFECT HOOKS ---
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
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            // NOTE: import.meta is not available in ES2015 preview environments.
            // Uncomment these lines in your Vite project:
            const apiKey = import.meta.env.VITE_API_KEY;
            const baseUrl = import.meta.env.VITE_API_BASE_URL;

            // Placeholder for preview:
            //const apiKey = '';
            //const baseUrl = '';

            try {
                const response = await fetch(`${baseUrl}/api/v1/stats`, {
                    headers: { 'x-api-key': apiKey }
                });

                if (response.ok) {
                    const data = await response.json();

                    setStats({
                        totalSystems: data.starCount || 0,
                        totalPlanets: 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch system stats:", error);
                setStats({ totalSystems: 0, totalPlanets: 0 });
            }
        };

        fetchStats();
    }, []); // Run once on mount

    // --- MOUSE HANDLERS ---
    const handleMouseDown = createHandleMouseDown(setIsDragging, setDragStart);

    // RE-ADDED: Logic to find the hovered star
    const handleMouseMove = useCallback((e) => {
        createHandleMouseMove({
            canvasRef, offsetX, offsetY, scale, isDragging,
            setOffsetX, setOffsetY, dragStart, setDragStart,
            stars, setHoveredStar
        })(e);
    }, [offsetX, offsetY, scale, isDragging, dragStart, stars]);

    const handleMouseUp = createHandleMouseUp(setIsDragging);
    const handleWheel = useCallback((e) => {
        createHandleWheel(scale, setScale)(e);
    }, [scale]);

    // UPDATED: Click handler now calls the API and handles localStorage
    const handleClick = useCallback(async (e) => {
        if (isDragging) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - canvas.width / 2 - offsetX) / scale;
        const mouseY = (e.clientY - rect.top - canvas.height / 2 - offsetY) / scale;

        const clickedStar = stars.find(star => {
            const dx = mouseX - star.x;
            const dy = mouseY - star.y;
            return Math.sqrt(dx * dx + dy * dy) < star.size + 4 / scale;
        });

        if (!clickedStar) return;

        try {
            const fullSystem = await fetchSystemDetails(clickedStar);
            setActiveSystem(fullSystem);
            setShowSystemMap(true);

            // --- FEATURE 1: VISITED SYSTEMS LOGIC ---
            const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
            if (!visited.includes(fullSystem.starId)) {
                visited.push(fullSystem.starId);
                localStorage.setItem('visitedStars', JSON.stringify(visited));
            }
        } catch (error) {
            console.error("Failed to fetch system details:", error);
        }
    }, [isDragging, offsetX, offsetY, scale, stars, setActiveSystem, setShowSystemMap]);

    const handleContextMenu = createHandleContextMenu({
        canvasRef, offsetX, offsetY, scale, stars
    });

    // --- DRAWING LOGIC ---
    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;

        // Background drawing...
        ctx.clearRect(0, 0, width, height);
        const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
        backgroundGradient.addColorStop(0, '#1a1a2e');
        backgroundGradient.addColorStop(0.5, '#3b3b5c');
        backgroundGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, width, height);
        backgroundStars.current.forEach(star => { /* ... draws bg stars ... */ });
        NEBULA_CLOUDS.current.forEach(cloud => { /* ... draws nebula ... */ });

        ctx.save();
        ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
        ctx.scale(scale, scale);

        // --- FEATURES 2 & 3: GET DATA FROM LOCALSTORAGE ---
        const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
        const home = JSON.parse(localStorage.getItem('homeSystem') || '{}');

        const filteredStars = stars.filter(star =>
            (factionFilter === 'All' || star.faction?.name === factionFilter) &&
            (starTypeFilter === 'All' || star.type === starTypeFilter)
        );

        filteredStars.forEach((star) => {
            // ... (existing star drawing logic) ...
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${12 / scale}px Courier New, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(star.name, star.x, star.y - star.size - 6 / scale);

            // --- FEATURE 3: HOME SYSTEM INDICATOR ---
            if (home.id === star.id) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size + 4 / scale, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }

            // --- FEATURE 2: VISITED SYSTEM INDICATOR ---
            if (visited.includes(star.id)) {
                ctx.beginPath();
                ctx.arc(star.x, star.y + star.size + 5 / scale, 2 / scale, 0, Math.PI * 2);
                ctx.fillStyle = '#00FF00'; // Green dot
                ctx.fill();
            }
        });

        ctx.restore();

        // --- FEATURE 4: TOOLTIP ---
        if (hoveredStar) {
            const tooltip = getStarTooltip(hoveredStar);
            if (tooltip) {
                ctx.save();
                ctx.font = '12px monospace';
                ctx.fillStyle = 'rgba(0,0,0,0.8)';
                const text = `★ ${tooltip.name} | ${tooltip.faction}`;
                const metrics = ctx.measureText(text);
                const canvasRect = canvas.getBoundingClientRect();

                // Position tooltip relative to the mouse cursor
                const tooltipX = hoveredStar.clientX - canvasRect.left + 15;
                const tooltipY = hoveredStar.clientY - canvasRect.top + 15;

                ctx.fillRect(tooltipX, tooltipY, metrics.width + 10, 20);
                ctx.fillStyle = '#00ff88';
                ctx.fillText(text, tooltipX + 5, tooltipY + 14);
                ctx.restore();
            }
        }
    }, [stars, offsetX, offsetY, scale, hoveredStar, factionFilter, starTypeFilter]);

    // --- ANIMATION LOOP ---
    useEffect(() => {
        const animate = () => {
            drawScene();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [drawScene]);

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
                                activeSystem={activeSystem}
                                onClose={() => setShowSystemMap(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
            {/* <AdminPanel stars={stars} goToSystem={() => { }} /> */}
            <Footer
                offsetX={offsetX}
                offsetY={offsetY}
                scale={scale}
                setScale={setScale}
                stars={stars}
                setOffsetX={setOffsetX}
                setOffsetY={setOffsetY}
                goToSystem={() => { }}
                goToZeroCommaZero={() => { }}
                setShowVisited={setShowVisited}
                showVisited={showVisited}
            />
        </div>
    );
};

export default ApiStarMap;
