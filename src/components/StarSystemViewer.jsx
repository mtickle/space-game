// @components/StarSystemViewer.jsx

import { useCallback, useEffect, useRef, useState } from 'react';

const StarSystemViewer = ({ activeSystem, onClose }) => {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const systemPositions = useRef({});
    const backgroundStars = useRef([]);
    const backgroundNebulae = useRef([]);

    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [viewScale, setViewScale] = useState(1);
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const getPlanetVisualSize = useCallback((celestialBody) => {
        if (!celestialBody) return 1;

        if (celestialBody.moonId) {
            return (celestialBody.moonSize || 4) * 3;
        }
        return (celestialBody.planetSize || 8) * 5;
    }, []);

    const darkenColor = useCallback((hex, percent) => {
        let f = parseInt(hex.slice(1), 16),
            t = percent < 0 ? 0 : 255,
            p = percent < 0 ? percent * -1 : percent,
            R = f >> 16,
            G = (f >> 8) & 0x00FF,
            B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    }, []);

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
                generateStaticBackground(width, height);
            }
        });

        resizeObserver.observe(container);

        if (canvas.width > 0 && canvas.height > 0) {
            generateStaticBackground(canvas.width, canvas.height);
        }

        return () => resizeObserver.unobserve(container);
    }, []);

    const generateStaticBackground = useCallback((width, height) => {
        const newStars = [];
        for (let i = 0; i < 150; i++) {
            newStars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5,
                alpha: 0.1 + Math.random() * 0.25
            });
        }
        backgroundStars.current = newStars;

        const newNebulae = [];
        newNebulae.push({
            x: width * 0.2, y: height * 0.3, radius: 100, color: 'rgba(100, 100, 255, 0.05)'
        });
        newNebulae.push({
            x: width * 0.7, y: height * 0.8, radius: 120, color: 'rgba(255, 100, 100, 0.05)'
        });
        newNebulae.push({
            x: width * 0.5, y: height * 0.1, radius: 80, color: 'rgba(100, 255, 100, 0.05)'
        });
        backgroundNebulae.current = newNebulae;
    }, []);

    useEffect(() => {
        console.log("StarSystemViewer: Position calculation/load useEffect running...");
        if (!activeSystem || !canvasDimensions.width || !canvasDimensions.height) {
            systemPositions.current = { systemScale: 1, planetPositions: {} };
            console.warn("StarSystemViewer: Skipping position calculation due to missing activeSystem or canvas dimensions.");
            return;
        }

        const localStorageKey = `system_layout_${activeSystem.starId}`;

        try {
            const storedLayout = localStorage.getItem(localStorageKey);
            if (storedLayout) {
                systemPositions.current = JSON.parse(storedLayout);
                console.log("StarSystemViewer: Loaded systemPositions from local storage:", systemPositions.current);
                return;
            }
        } catch (e) {
            console.error("Failed to load system layout from local storage:", e);
        }

        console.log("StarSystemViewer: No stored layout found or failed to load. Calculating new positions...");

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
        const clusterRadius = maxCanvasRadius * 0.6;
        const minPlanetSeparation = 70;
        const minMoonSeparation = 30;

        planets.forEach(planet => {
            if (planet.planetId === undefined || planet.planetId === null) {
                console.error("StarSystemViewer: Planet skipped during position calculation due to missing planetId:", planet);
                return;
            }

            let planetX, planetY;
            let attempts = 0;
            const maxAttempts = 200;

            do {
                planetX = (Math.random() * 2 - 1) * clusterRadius;
                planetY = (Math.random() * 2 - 1) * clusterRadius;
                attempts++;
            } while (attempts < maxAttempts &&
                Object.values(newSystemPositions.planetPositions).some(p => {
                    const dx = planetX - p.x;
                    const dy = planetY - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
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
        console.log("StarSystemViewer: Calculated new systemPositions:", systemPositions.current);

        try {
            localStorage.setItem(localStorageKey, JSON.stringify(newSystemPositions));
            console.log("StarSystemViewer: Saved new systemPositions to local storage.");
        } catch (e) {
            console.error("Failed to save system layout to local storage:", e);
        }

    }, [activeSystem, canvasDimensions, getPlanetVisualSize]);


    const handleMouseDown = useCallback((e) => {
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = 'grabbing';
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setViewOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = 'grab';
    }, []);

    const handleMouseLeave = useCallback(() => {
        isDragging.current = false;
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = 'grab';
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const scaleAmount = 1.1;
        const mouseX = e.clientX - canvasRef.current.getBoundingClientRect().left;
        const mouseY = e.clientY - canvasRef.current.getBoundingClientRect().top;

        const worldX = (mouseX - (canvasDimensions.width / 2 + viewOffset.x)) / viewScale;
        const worldY = (mouseY - (canvasDimensions.height / 2 + viewOffset.y)) / viewScale;

        let newScale;
        if (e.deltaY < 0) {
            newScale = viewScale * scaleAmount;
        } else {
            newScale = viewScale / scaleAmount;
        }

        newScale = Math.max(0.1, Math.min(newScale, 5));

        const newOffsetX = mouseX - worldX * newScale - canvasDimensions.width / 2;
        const newOffsetY = mouseY - worldY * newScale - canvasDimensions.height / 2;

        setViewScale(newScale);
        setViewOffset({ x: newOffsetX, y: newOffsetY });
    }, [viewScale, viewOffset, canvasDimensions]);


    // --- Draw Scene Function ---
    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvasDimensions;

        ctx.clearRect(0, 0, width, height);

        // --- Layer 1: Background Gradient ---
        const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
        backgroundGradient.addColorStop(0, '#1a1a2e');
        backgroundGradient.addColorStop(0.5, '#3b3b5c');
        backgroundGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, width, height);

        // --- Layer 2: Parallax Stars ---
        ctx.save();
        ctx.translate(viewOffset.x * 0.1, viewOffset.y * 0.1);
        backgroundStars.current.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });
        ctx.restore();

        // --- Layer 3: Parallax Nebulae ---
        ctx.save();
        ctx.translate(viewOffset.x * 0.3, viewOffset.y * 0.3);
        ctx.filter = 'blur(8px)';
        backgroundNebulae.current.forEach(nebula => {
            ctx.fillStyle = nebula.color;
            ctx.beginPath();
            ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.filter = 'none';
        ctx.restore();

        if (!activeSystem) return;

        // Collect all celestial bodies to draw, including their pre-calculated positions
        const allCelestialBodiesData = [];
        Object.values(systemPositions.current.planetPositions).forEach(pPos => {
            const planet = pPos.data;
            allCelestialBodiesData.push({
                x: pPos.x,
                y: pPos.y,
                size: getPlanetVisualSize(planet),
                color: planet.planetColor || '#8888AA',
                name: planet.planetName || `Planet ${planet.planetId}`,
                type: 'planet',
                originalData: planet
            });
            Object.values(pPos.moons).forEach(mPos => {
                const moon = mPos.data;
                allCelestialBodiesData.push({
                    x: pPos.x + mPos.x,
                    y: pPos.y + mPos.y,
                    size: getPlanetVisualSize(moon),
                    color: moon.moonColor || '#BBBBBB',
                    type: 'moon',
                    originalData: moon,
                    parentPlanetPos: { x: pPos.x, y: pPos.y } // Keep this for potential future lines to parent
                });
            });
        });

        allCelestialBodiesData.sort((a, b) => b.size - a.size); // Draw larger bodies first

        // --- Layer 4: Planets and Moons (fully transformed) ---
        ctx.save();
        // Apply main view transformations
        ctx.translate(width / 2 + viewOffset.x, height / 2 + viewOffset.y);
        const combinedScale = systemPositions.current.systemScale * viewScale;
        ctx.scale(combinedScale, combinedScale);

        // Array to store info box data so we can draw them *after* main transforms are reset
        const infoBoxesToDraw = [];

        allCelestialBodiesData.forEach(body => {
            const { x, y, size, color, name, type, originalData } = body;

            // Draw the body itself with glow and GRADIENT fill
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);

            if (type === 'planet') {
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, darkenColor(color, 0.4));
            } else { // For moons
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, darkenColor(color, 0.5));
            }

            ctx.fillStyle = gradient;

            if (type === 'planet' || type === 'moon') {
                ctx.shadowBlur = size * 1.5;
                ctx.shadowColor = color;
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            // Prepare info box data for drawing later (after main transform reset)
            if (type === 'planet') {
                const screenX = (x * combinedScale) + (width / 2 + viewOffset.x);
                const screenY = (y * combinedScale) + (height / 2 + viewOffset.y);
                const screenRadius = size * combinedScale;

                infoBoxesToDraw.push({
                    name: name,
                    moonCount: originalData.moons ? originalData.moons.length : 0,
                    settlementsCount: originalData.settlements ? originalData.settlements.length : 0,
                    // Store the absolute screen position for the attachment point
                    attachX: screenX + screenRadius,
                    attachY: screenY + screenRadius
                });
            }
        });

        ctx.restore(); // Restore context after drawing planets/moons

        // --- Layer 5: Fixed UI Elements (including planet info boxes) ---
        // These are drawn with a fresh context, not affected by viewOffset/viewScale

        // Draw Planet Info Boxes
        infoBoxesToDraw.forEach(info => {
            const pixelOffsetFromPlanetEdgeX = 15;
            const pixelOffsetFromPlanetEdgeY = 10;

            // Box top-left position (fixed pixel distance from attach point)
            const boxX = info.attachX + pixelOffsetFromPlanetEdgeX;
            const boxY = info.attachY + pixelOffsetFromPlanetEdgeY;

            const nameText = info.name;
            let moonSettlementsText = '';
            if (info.moonCount > 0 && info.settlementsCount > 0) {
                moonSettlementsText = `${info.moonCount} Moon(s) | ${info.settlementsCount} Settlement(s)`;
            } else if (info.moonCount > 0) {
                moonSettlementsText = `${info.moonCount} Moon(s)`;
            } else if (info.settlementsCount > 0) {
                moonSettlementsText = `${info.settlementsCount} Settlement(s)`;
            }

            const padding = 8;
            const lineHeight = 14;
            const textHeight = moonSettlementsText ? (lineHeight * 2) : lineHeight;

            ctx.font = '12px monospace';
            const nameTextWidth = ctx.measureText(nameText).width;
            ctx.font = '10px monospace';
            const moonSettlementsTextWidth = ctx.measureText(moonSettlementsText).width;

            const boxWidth = Math.max(nameTextWidth, moonSettlementsTextWidth) + padding * 2;
            const boxHeight = textHeight + padding * 2;
            const cornerRadius = 8;

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(nameText, boxX + padding, boxY + padding + 10);

            if (moonSettlementsText) {
                ctx.fillStyle = '#C0C0C0';
                ctx.font = '10px monospace';
                ctx.fillText(moonSettlementsText, boxX + padding, boxY + padding + 10 + lineHeight);
            }
        });

        // Draw System Info Box (top-left)
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

    }, [activeSystem, canvasDimensions, getPlanetVisualSize, backgroundStars, backgroundNebulae, darkenColor, viewOffset, viewScale]);


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
    }, [drawScene]);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('wheel', handleWheel);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleWheel]);


    return (
        <div className="star-system-viewer w-full h-full relative">
            <button
                onClick={onClose}
                className="absolute top-4 left-4 z-20 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center space-x-2"
            >
                <span>Back to Galaxy Map</span>
            </button>
            <canvas ref={canvasRef} className="w-full h-full block cursor-grab"></canvas>
        </div>
    );
};

export default StarSystemViewer;