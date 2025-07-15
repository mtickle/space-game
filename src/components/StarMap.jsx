// StarMap.jsx

//--- Welcome to the StarMap component! 
//--- This component renders a star map with interactive features like zooming, dragging, and selecting stars. 
//--- It also includes a sidebar for star details and an admin panel for additional functionalities.

import AdminPanel from '@components/AdminPanel';
import Sidebar from '@components/Sidebar';
import { getStarTooltip } from '@hooks/useLazyStarField';
import Footer from '@layouts/Footer';
import Header from '@layouts/Header';
import { generatePlanets } from '@utils/planetUtils';
import { saveStarToLocalStorage } from '@utils/storageUtils';
import { useEffect, useRef, useState } from 'react';

import {
    createHandleClick,
    createHandleContextMenu,
    createHandleMouseDown,
    createHandleMouseMove,
    createHandleMouseUp,
    createHandleWheel
} from '@utils/mouseUtils';

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
    const [showVisited, setShowVisited] = useState(false);

    //--- This effect sets the initial canvas size and listens for window resize events to adjust the canvas size dynamically.
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

    //--- Mouse handler delegation using mouseUtils.
    const handleMouseDown = createHandleMouseDown(setIsDragging, setDragStart);
    const handleMouseMove = createHandleMouseMove({
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
        setHoveredStar
    });
    const handleMouseUp = createHandleMouseUp(setIsDragging);
    const handleWheel = createHandleWheel(scale, setScale);
    const handleClick = createHandleClick({
        isDragging,
        canvasRef,
        offsetX,
        offsetY,
        scale,
        stars,
        setSelectedStar
    });
    const handleContextMenu = createHandleContextMenu({
        canvasRef,
        offsetX,
        offsetY,
        scale,
        stars
    });

    //--- This function draws the star map scene, including stars, planets, and tooltips.
    const drawScene = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
        const home = JSON.parse(localStorage.getItem('homeSystem') || '{}');

        ctx.save();
        ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
        ctx.scale(scale, scale);

        const filteredStars = factionFilter === 'All' ? stars : stars.filter(star => star.faction?.name === factionFilter);
        const sortedStars = [...filteredStars].sort((a, b) => (a.z || 0) - (b.z || 0));

        sortedStars.forEach((star) => {
            const depth = star.z || 0;
            const alpha = 1 - depth * 0.8;
            const blur = 10 * (1 - depth);

            //--- Draw a circle, fill it in, give it a glow and some shadow and 
            //--- a star is born.
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = blur;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            //--- This is a skinny white circle we place around our "home" system.
            if (home.name === star.name) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size + 4 / scale, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }

            //--- Here is your star system name
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${12 / scale}px Courier New, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(star.name, star.x, star.y - star.size - 6 / scale);

            //--- This is a little green dot we place at each system
            //--- as a visual cue that we have visited it.            
            if (visited.includes(star.name)) {
                ctx.beginPath();
                ctx.arc(star.x, star.y - star.size - 12 / scale, 2 / scale, 0, Math.PI * 2);
                ctx.fillStyle = '#00FF00';
                ctx.fill();
            }

            //--- Now, you've gone and either hovered over a system or clicked it.
            //--- We already have the planets created, we just need to render them 
            //--- based on their attributes.
            if ((selectedStar?.name === star.name || hoveredStar?.name === star.name) && star.planets) {
                star.planets.forEach((planet) => {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, planet.orbitRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = planet.color + '33';
                    ctx.lineWidth = .5 / scale;
                    ctx.stroke();

                    planet.angle = (planet.angle ?? Math.random() * Math.PI * 2) + 0.01;
                    const px = star.x + Math.cos(planet.angle) * planet.orbitRadius;
                    const py = star.y + Math.sin(planet.angle) * planet.orbitRadius;
                    ctx.beginPath();
                    const renderSize = Math.min(planet.size ?? 1.5, 4);
                    ctx.arc(px, py, renderSize, 0, Math.PI * 2);
                    ctx.fillStyle = planet.color;
                    ctx.fill();
                });
            }
        });

        ctx.restore();

        //--- Here's a tooltip. I want to make this better and more informative.
        if (hoveredStar) {
            const tooltip = getStarTooltip(hoveredStar);
            ctx.save();
            ctx.font = '12px monospace';
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            const text = `★ ${tooltip.name} | ${tooltip.faction} | ${tooltip.planets} planets`;
            const metrics = ctx.measureText(text);
            ctx.fillRect(hoveredStar.clientX + 10, hoveredStar.clientY - 10, metrics.width + 10, 20);
            ctx.fillStyle = '#00ff88';
            ctx.fillText(text, hoveredStar.clientX + 15, hoveredStar.clientY + 5);
            ctx.restore();
        }
    };

    //--- Make the planets actually orbit.
    useEffect(() => {
        const animate = () => {
            drawScene();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [stars, offsetX, offsetY, scale, factionFilter, selectedStar, hoveredStar]);

    //--- This is a smooth zoom from where ever you are to the selected system.
    //--- Right now this is done from the visited systems history panel.
    //--- We will send you back there and show you the planets in orbit. 
    const goToSystem = (targetStar) => {
        // Try to get the full star object from localStorage
        const saved = localStorage.getItem(`star_${targetStar.name}`);
        let fullStar = saved ? JSON.parse(saved) : stars.find(s => s.name === targetStar.name);
        if (!fullStar) return;

        const duration = 600;
        const frameRate = 60;
        const steps = Math.round((duration / 1000) * frameRate);
        const startX = offsetX;
        const startY = offsetY;
        const deltaX = -fullStar.x - startX;
        const deltaY = -fullStar.y - startY;

        let currentStep = 0;

        const animate = () => {
            currentStep++;
            const t = currentStep / steps;
            const ease = t < 0.5
                ? 2 * t * t
                : -1 + (4 - 2 * t) * t;

            setOffsetX(startX + deltaX * ease);
            setOffsetY(startY + deltaY * ease);

            if (currentStep < steps) {
                requestAnimationFrame(animate);
            } else {
                // Ensure planets are loaded (from save or generate fresh)
                if (!fullStar.planets || fullStar.planets.length === 0) {
                    fullStar.planets = generatePlanets(fullStar.name);
                    fullStar.planets.forEach(p => {
                        p.angle = p.angle ?? Math.random() * Math.PI * 2;
                    });
                }

                saveStarToLocalStorage(fullStar, stars);

                setSelectedStar(fullStar); //--- Show the planets in orbit.
            }
        };

        requestAnimationFrame(animate);
    };

    //--- Here some smooth motion to return you back to the galactic center of 0,0.
    const goToZeroCommaZero = () => {
        const duration = 600;
        const frameRate = 60;
        const steps = Math.round((duration / 1000) * frameRate);
        const startX = offsetX;
        const startY = offsetY;
        const deltaX = -startX;
        const deltaY = -startY;

        let currentStep = 0;

        const animate = () => {
            currentStep++;
            const t = currentStep / steps;
            const ease = t < 0.5
                ? 2 * t * t
                : -1 + (4 - 2 * t) * t;

            setOffsetX(startX + deltaX * ease);
            setOffsetY(startY + deltaY * ease);

            if (currentStep < steps) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
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
                        onContextMenu={handleContextMenu}
                    />
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
        </div>
    );
};

export default StarMap;
