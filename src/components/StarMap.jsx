// StarMap.jsx

import AdminPanel from '@components/AdminPanel';
import Sidebar from '@components/Sidebar';
import StarSystemViewer from '@components/StarSystemViewer';
import { getStarTooltip } from '@hooks/useLazyStarField';
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
import { hydrateOrSynthesizeSystem } from '@utils/planetUtils';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    const [activeSystem, setActiveSystem] = useState(null);
    const canvasRef = useRef(null);
    const [selectedStar, setSelectedStar] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [factionFilter, setFactionFilter] = useState('All');
    const [starTypeFilter, setStarTypeFilter] = useState('All');
    const animationFrameRef = useRef(null);
    const [showVisited, setShowVisited] = useState(false);
    const orbitState = useRef({});

    const [showSystemMap, setShowSystemMap] = useState(false);

    // --- NEW: Ref to store static background stars ---
    const backgroundStars = useRef([]);
    const NEBULA_CLOUDS = useRef([]); // Also store nebula cloud properties

    //--- Effect to manage canvas size and generate static background elements ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;

                if (setCanvasSize) {
                    setCanvasSize({ width, height });
                }

                // --- Generate static background stars and nebulae ONCE on resize/mount ---
                const numStars = 200;
                const starsArray = [];
                for (let i = 0; i < numStars; i++) {
                    starsArray.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        radius: Math.random() * 1.5,
                        opacity: 0.1 + Math.random() * 0.2
                    });
                }
                backgroundStars.current = starsArray;

                // Generate static nebula clouds
                NEBULA_CLOUDS.current = [
                    { x: width * 0.2, y: height * 0.3, radius: 150, color: 'rgba(100, 100, 255, 0.03)' },
                    { x: width * 0.7, y: height * 0.8, radius: 180, color: 'rgba(255, 100, 100, 0.03)' }
                ];

                // Trigger a redraw after initial setup or resize
                // drawScene is now explicitly called within the animation loop,
                // so simply updating the ref will be picked up on the next frame.
                // If you remove redrawTrigger, make sure drawScene dependencies are robust.
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, [setCanvasSize]); // Removed redrawTrigger as a dependency here, it's not needed.


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


    //--- Mouse handler delegation using mouseUtils.
    const handleMouseDown = createHandleMouseDown(setIsDragging, setDragStart);
    const handleMouseMove = useCallback((e) => {
        createHandleMouseMove({
            canvasRef,
            offsetX,
            offsetY,
            scale,
            isDragging,
            setOffsetX,
            setOffsetY,
            dragStart,
            setDragStart,
            stars,
            setHoveredStar,
            orbitState
        })(e);
    }, [offsetX, offsetY, scale, isDragging, dragStart, stars, setOffsetX, setOffsetY, setDragStart, setHoveredStar, orbitState]);

    const handleMouseUp = createHandleMouseUp(setIsDragging);
    const handleWheel = useCallback((e) => {
        createHandleWheel(scale, setScale)(e);
    }, [scale, setScale]);

    const handleClick = useCallback((e) => {
        createHandleClick({
            isDragging,
            canvasRef,
            offsetX,
            offsetY,
            scale,
            stars,
            setSelectedStar,
            setActiveSystem,
            setShowSystemMap
        })(e);
    }, [isDragging, canvasRef, offsetX, offsetY, scale, stars, setSelectedStar, setActiveSystem, setShowSystemMap]);

    const handleContextMenu = createHandleContextMenu({
        canvasRef,
        offsetX,
        offsetY,
        scale,
        stars
    });


    //--- This function draws the star map scene, including stars, planets, and tooltips.
    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const width = canvas.width;
        const height = canvas.height;

        // --- STATIC BACKGROUND IMPLEMENTATION (Now using stored data) ---
        const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
        backgroundGradient.addColorStop(0, '#1a1a2e');
        backgroundGradient.addColorStop(0.5, '#3b3b5c');
        backgroundGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, width, height);

        // Draw static background stars
        backgroundStars.current.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        });

        // Draw static nebulous clouds
        ctx.filter = 'blur(8px)';
        NEBULA_CLOUDS.current.forEach(cloud => {
            ctx.fillStyle = cloud.color;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.filter = 'none'; // Reset filter!
        // --- END STATIC BACKGROUND IMPLEMENTATION ---


        const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
        const home = JSON.parse(localStorage.getItem('homeSystem') || '{}');

        ctx.save();
        ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
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

            if (home.id === star.id) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size + 4 / scale, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${12 / scale}px Courier New, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(star.name, star.x, star.y - star.size - 6 / scale);

            if (showVisited && visited.includes(star.id)) {
                ctx.beginPath();
                ctx.arc(star.x, star.y - star.size - 12 / scale, 2 / scale, 0, Math.PI * 2);
                ctx.fillStyle = '#00FF00';
                ctx.fill();
            }

            const isSelected = selectedStar?.id === star.id;
            if (isSelected && visited.includes(star.id) && Array.isArray(star.planets)) {
                const orbits = orbitState.current[star.id] || [];
                star.planets.forEach((planet, i) => {
                    const orbit = orbits[i];
                    if (!orbit) return;

                    orbit.angle += orbit.speed;

                    ctx.beginPath();
                    ctx.arc(star.x, star.y, orbit.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = (planet.color || '#FFFFFF') + '33';
                    ctx.lineWidth = 0.5 / scale;
                    ctx.stroke();

                    const px = star.x + Math.cos(orbit.angle) * orbit.radius;
                    const py = star.y + Math.sin(orbit.angle) * orbit.radius;

                    ctx.beginPath();
                    ctx.arc(px, py, Math.min(planet.size ?? 1.5, 4) / scale, 0, Math.PI * 2);
                    ctx.fillStyle = planet.color || '#FFFFFF';
                    ctx.fill();

                    if (scale > 0.5) {
                        ctx.fillStyle = '#aaa';
                        ctx.font = `${10 / scale}px Courier New`;
                        ctx.fillText(planet.planetName || `P${i}`, px + 4 / scale, py + 4 / scale);
                    }
                });
            }
        });

        ctx.restore();

        if (hoveredStar) {
            const tooltip = getStarTooltip(hoveredStar);
            ctx.save();
            ctx.font = '12px monospace';
            ctx.fillStyle = 'rgba(0,0,0,0.8)';

            const text = `★ ${tooltip.name} | ${tooltip.faction}`;
            const metrics = ctx.measureText(text);

            // --- THE FIX IS HERE ---
            // Get the bounding rectangle of the canvas element
            const canvasRect = canvas.getBoundingClientRect();

            // Calculate tooltip position relative to the canvas's top-left corner
            // hoveredStar.clientX/Y are viewport coordinates
            // canvasRect.left/top are canvas's viewport coordinates
            const tooltipX = hoveredStar.clientX - canvasRect.left + 500;
            const tooltipY = hoveredStar.clientY - canvasRect.top + 50;

            ctx.fillRect(tooltipX, tooltipY, metrics.width + 10, 20);
            ctx.fillStyle = '#00ff88';
            ctx.fillText(text, tooltipX + 5, tooltipY + 15); // Adjust text position within the rect
            ctx.restore();
        }
    }, [
        stars, offsetX, offsetY, scale,
        selectedStar, hoveredStar,
        factionFilter, starTypeFilter, showVisited,
        orbitState, // orbitState.current is directly mutated, but the object ref itself is stable
        // No explicit redrawTrigger from resize observer needed here, as the initial generation
        // in the useEffect and the animation loop handle it.
    ]);


    useEffect(() => {
        const animate = () => {
            drawScene();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [drawScene]);


    const goToSystem = useCallback((targetStar) => {
        const duration = 600;
        const frameRate = 60;
        const steps = Math.round((duration / 1000) * frameRate);
        const startX = offsetX;
        const startY = offsetY;
        const deltaX = -targetStar.x - startX;
        const deltaY = -targetStar.y - startY;

        let currentStep = 0;
        const animateFrame = () => {
            currentStep++;
            const t = currentStep / steps;
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

            setOffsetX(startX + deltaX * ease);
            setOffsetY(startY + deltaY * ease);

            if (currentStep < steps) {
                requestAnimationFrame(animateFrame);
            } else {
                const system = hydrateOrSynthesizeSystem(targetStar, orbitState, stars);
                setSelectedStar(system);
                setActiveSystem(system);
            }
        };
        requestAnimationFrame(animateFrame);
    }, [offsetX, offsetY, setOffsetX, setOffsetY, setSelectedStar, setActiveSystem, stars, orbitState]);

    const goToZeroCommaZero = useCallback(() => {
        const duration = 600;
        const frameRate = 60;
        const steps = Math.round((duration / 1000) * frameRate);
        const startX = offsetX;
        const startY = offsetY;
        const deltaX = -startX;
        const deltaY = -startY;

        let currentStep = 0;
        const animateFrame = () => {
            currentStep++;
            const t = currentStep / steps;
            const ease = t < 0.5
                ? 2 * t * t
                : -1 + (4 - 2 * t) * t;

            setOffsetX(startX + deltaX * ease);
            setOffsetY(startY + deltaY * ease);

            if (currentStep < steps) {
                requestAnimationFrame(animateFrame);
            }
        };
        requestAnimationFrame(animateFrame);
    }, [offsetX, offsetY, setOffsetX, setOffsetY]);


    return (
        <div>
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
                        selectedStar={selectedStar}
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
                showVisited={showVisited} />
        </div >
    );
};

export default StarMap;