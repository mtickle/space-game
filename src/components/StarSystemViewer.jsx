// @components/StarSystemViewer.jsx

import { useCallback, useEffect, useRef, useState } from 'react';

const StarSystemViewer = ({ activeSystem, onClose }) => {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const systemPositions = useRef({});
    // New ref to store static background star positions
    const backgroundStars = useRef([]);
    // New ref to store static background nebula positions
    const backgroundNebulae = useRef([]);

    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

    const getPlanetVisualSize = useCallback((celestialBody) => {
        if (!celestialBody) return 1;
        if (celestialBody.moonId) {
            return celestialBody.moonSize || 4;
        }
        return celestialBody.size || 8;
    }, []);

    // --- EFFECT: Handle Canvas Resizing and Initial Setup ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
                setCanvasDimensions({ width, height });
                // Regenerate static background stars and nebulae on resize
                generateStaticBackground(width, height);
            }
        });

        resizeObserver.observe(container);

        // Initial generation of background stars/nebulae on mount
        if (canvas.width > 0 && canvas.height > 0) {
            generateStaticBackground(canvas.width, canvas.height);
        }

        return () => resizeObserver.unobserve(container);
    }, []);

    // Function to generate static background stars and nebulae
    const generateStaticBackground = useCallback((width, height) => {
        const newStars = [];
        for (let i = 0; i < 150; i++) { // Increased number of stars for denser field
            newStars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5,
                alpha: 0.1 + Math.random() * 0.25 // Slightly brighter stars
            });
        }
        backgroundStars.current = newStars;

        const newNebulae = [];
        // Nebula 1
        newNebulae.push({
            x: width * 0.2, y: height * 0.3, radius: 100, color: 'rgba(100, 100, 255, 0.05)' // Blue
        });
        // Nebula 2
        newNebulae.push({
            x: width * 0.7, y: height * 0.8, radius: 120, color: 'rgba(255, 100, 100, 0.05)' // Red
        });
        // Add a third for variety
        newNebulae.push({
            x: width * 0.5, y: height * 0.1, radius: 80, color: 'rgba(100, 255, 100, 0.05)' // Green
        });
        backgroundNebulae.current = newNebulae;
    }, []);


    // --- EFFECT: Calculate Static Positions When Active System or Canvas Dimensions Change ---
    useEffect(() => {
        console.log("StarSystemViewer: Position calculation useEffect running...");
        if (!activeSystem || !canvasDimensions.width || !canvasDimensions.height) {
            systemPositions.current = { systemScale: 1, planetPositions: {} };
            console.warn("StarSystemViewer: Skipping position calculation due to missing activeSystem or canvas dimensions.");
            return;
        }

        const newSystemPositions = {
            systemScale: 1,
            planetPositions: {}
        };

        const planets = activeSystem.planets || [];
        if (planets.length === 0) {
            systemPositions.current = newSystemPositions;
            console.warn("StarSystemViewer: Active system has no planets. Position calculation finished.");
            return;
        }

        const maxCanvasRadius = Math.min(canvasDimensions.width, canvasDimensions.height) / 2;
        // Adjusted: Increased clusterRadius and min separations for more spread-out look
        const clusterRadius = maxCanvasRadius * 0.6; // Planets will be within 60% of canvas half-dimension
        const minPlanetSeparation = 70; // More separation between planet centers
        const minMoonSeparation = 30;     // More separation between moon centers

        planets.forEach(planet => {
            if (planet.planetId === undefined || planet.planetId === null) {
                console.error("StarSystemViewer: Planet skipped during position calculation due to missing planetId:", planet);
                return;
            }

            let planetX, planetY;
            let attempts = 0;
            const maxAttempts = 200; // Increased attempts for better packing

            do {
                planetX = (Math.random() * 2 - 1) * clusterRadius;
                planetY = (Math.random() * 2 - 1) * clusterRadius;
                attempts++;
            } while (attempts < maxAttempts &&
                Object.values(newSystemPositions.planetPositions).some(p => {
                    const dx = planetX - p.x;
                    const dy = planetY - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    // Ensure a minimum distance between planet edges plus separation
                    return distance < (getPlanetVisualSize(planet) + getPlanetVisualSize(p.data)) + minPlanetSeparation;
                }));

            newSystemPositions.planetPositions[planet.planetId] = {
                x: planetX,
                y: planetY,
                data: planet,
                moons: {}
            };

            if (planet.moons && planet.moons.length > 0) {
                planet.moons.forEach(moon => {
                    if (moon.moonId === undefined || moon.moonId === null) {
                        console.error(`StarSystemViewer: Moon of planet ${planet.planetId} skipped during position calculation due to missing moonId:`, moon);
                        return;
                    }

                    let moonX, moonY;
                    let moonAttempts = 0;
                    const maxMoonAttempts = 100;
                    // Adjusted: More generous moon cluster radius around planet
                    const moonClusterRadius = getPlanetVisualSize(planet) * 2 + 50;

                    do {
                        moonX = (Math.random() * 2 - 1) * moonClusterRadius;
                        moonY = (Math.random() * 2 - 1) * moonClusterRadius;
                        moonAttempts++;
                    } while (moonAttempts < maxMoonAttempts &&
                        Object.values(newSystemPositions.planetPositions[planet.planetId].moons).some(m => {
                            const dx = moonX - m.x;
                            const dy = moonY - m.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            // Ensure a minimum distance between moon edges plus separation
                            return distance < (getPlanetVisualSize(moon) + getPlanetVisualSize(m.data)) + minMoonSeparation;
                        }));

                    newSystemPositions.planetPositions[planet.planetId].moons[moon.moonId] = {
                        x: moonX,
                        y: moonY,
                        data: moon
                    };
                });
            }
        });

        const allCelestialBodies = Object.values(newSystemPositions.planetPositions).flatMap(p => {
            const moons = Object.values(p.moons).map(m => ({ x: p.x + m.x, y: p.y + m.y, data: m.data }));
            return [{ x: p.x, y: p.y, data: p.data }, ...moons];
        });

        if (allCelestialBodies.length > 0) {
            const minX = Math.min(...allCelestialBodies.map(c => c.x - getPlanetVisualSize(c.data)));
            const maxX = Math.max(...allCelestialBodies.map(c => c.x + getPlanetVisualSize(c.data)));
            const minY = Math.min(...allCelestialBodies.map(c => c.y - getPlanetVisualSize(c.data)));
            const maxY = Math.max(...allCelestialBodies.map(c => c.y + getPlanetVisualSize(c.data)));

            const contentWidth = maxX - minX;
            const contentHeight = maxY - minY;

            const desiredPaddingRatio = 0.8;
            const scaleX = (canvasDimensions.width * desiredPaddingRatio) / contentWidth;
            const scaleY = (canvasDimensions.height * desiredPaddingRatio) / contentHeight;

            newSystemPositions.systemScale = Math.min(scaleX, scaleY, 1.0);
            newSystemPositions.systemScale = Math.max(newSystemPositions.systemScale, 0.1);
        }

        systemPositions.current = newSystemPositions;
        console.log("StarSystemViewer: Calculated systemPositions:", systemPositions.current);

    }, [activeSystem, canvasDimensions, getPlanetVisualSize]);


    // --- Draw Scene Function ---
    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvasDimensions;

        // 1. Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 2. Draw NMS-like subtle gradient background
        const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
        backgroundGradient.addColorStop(0, '#1a1a2e');
        backgroundGradient.addColorStop(0.5, '#3b3b5c');
        backgroundGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, width, height);

        // 3. Draw static background stars
        backgroundStars.current.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });

        // 4. Draw static background nebulous clouds
        ctx.filter = 'blur(8px)';
        backgroundNebulae.current.forEach(nebula => {
            ctx.fillStyle = nebula.color;
            ctx.beginPath();
            ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.filter = 'none'; // IMPORTANT: Reset filter after drawing blurs!

        if (!activeSystem) return;

        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(systemPositions.current.systemScale, systemPositions.current.systemScale);

        // --- Draw the Star ---
        ctx.beginPath();
        ctx.arc(0, 0, activeSystem.starSize || 15, 0, Math.PI * 2);
        ctx.fillStyle = activeSystem.starColor || '#FFD700';
        ctx.shadowBlur = 20;
        ctx.shadowColor = activeSystem.starColor || '#FFD700';
        ctx.fill();
        ctx.shadowBlur = 0;

        const allCelestialBodiesToDraw = [];

        Object.values(systemPositions.current.planetPositions).forEach(pPos => {
            const planet = pPos.data;
            allCelestialBodiesToDraw.push({
                x: pPos.x,
                y: pPos.y,
                size: getPlanetVisualSize(planet),
                color: planet.color || '#8888AA',
                name: planet.planetName || `Planet ${planet.planetId}`,
                type: 'planet',
                originalData: planet
            });

            Object.values(pPos.moons).forEach(mPos => {
                const moon = mPos.data;
                allCelestialBodiesToDraw.push({
                    x: pPos.x + mPos.x,
                    y: pPos.y + mPos.y,
                    size: getPlanetVisualSize(moon),
                    color: moon.moonColor || '#BBBBBB',
                    // name: moon.moonName || `Moon ${moon.moonId}`, // Moon names still removed for less clutter
                    type: 'moon',
                    originalData: moon,
                    parentPlanetPos: { x: pPos.x, y: pPos.y }
                });
            });
        });

        allCelestialBodiesToDraw.sort((a, b) => b.size - a.size);

        allCelestialBodiesToDraw.forEach(body => {
            const { x, y, size, color, name, type, originalData, parentPlanetPos } = body;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            if (type === 'planet') {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(name, x, y - size - 10);

                let textYOffset = size + 15;

                const moonCount = originalData.moons ? originalData.moons.length : 0;
                if (moonCount > 0) {
                    ctx.fillStyle = '#C0C0C0';
                    ctx.font = '10px monospace';
                    ctx.fillText(`${moonCount} Moon(s)`, x, y + textYOffset);
                    textYOffset += 15;
                }

                if (originalData.settlements && originalData.settlements.length > 0) {
                    ctx.fillStyle = '#FFFF00';
                    ctx.font = '10px monospace';
                    ctx.fillText(`${originalData.settlements.length} Settlement(s)`, x, y + textYOffset);
                }
            }
        });

        ctx.restore();

        if (activeSystem) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(10, 10, 260, 100);

            ctx.fillStyle = '#00ff88';
            ctx.font = '20px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(activeSystem.name || 'Unnamed System', 20, 35);

            ctx.font = '14px monospace';
            ctx.fillStyle = '#FFFFFF';
            const totalPlanets = (activeSystem.planets || []).length;
            const totalMoons = (activeSystem.planets || []).reduce((acc, p) => acc + (p.moons ? p.moons.length : 0), 0);
            ctx.fillText(`${totalPlanets} PLANETS / ${totalMoons} MOON(S)`, 20, 60);
        }

    }, [activeSystem, canvasDimensions, getPlanetVisualSize, backgroundStars, backgroundNebulae]); // Added background refs to deps


    // --- Animation Loop (still static) ---
    useEffect(() => {
        const animate = () => {
            drawScene();
            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [drawScene, activeSystem]);

    return (
        <div className="star-system-viewer w-full h-full relative">
            <button
                onClick={onClose}
                className="absolute top-4 left-4 z-20 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center space-x-2"
            >
                <span>Back to Galaxy Map</span>
            </button>
            <canvas ref={canvasRef} className="w-full h-full block"></canvas>
        </div>
    );
};

export default StarSystemViewer;