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

    // New state for hovered celestial body
    const [hoveredCelestialBody, setHoveredCelestialBody] = useState(null); // { type, name, originalData, screenX, screenY, screenRadius }

    const MOON_VISIBILITY_THRESHOLD = 1.5; // Moons appear when viewScale is 1.5 or greater
    // New threshold for moon labels on hover - make it higher than moon visibility
    const MOON_LABEL_VISIBILITY_THRESHOLD = 2.5; // Moon labels on hover appear when viewScale is 2.5 or greater

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
        //console.log("StarSystemViewer: Position calculation/load useEffect running...");
        //console.log("activeSystem inside useEffect:", activeSystem); // Keep this for debugging

        // GUARDRAIL: Check for activeSystem AND activeSystem.starId
        if (!activeSystem || !activeSystem.starId || !canvasDimensions.width || !canvasDimensions.height) {
            systemPositions.current = { systemScale: 1, planetPositions: {} };
          //  console.warn("StarSystemViewer: Skipping position calculation due to missing activeSystem, starId, or canvas dimensions.");
            // If activeSystem is present but starId is missing, it's a data problem
            if (activeSystem && !activeSystem.starId) {
            //    console.error("StarSystemViewer: activeSystem object is missing 'starId' property!", activeSystem);
            }
            return; // Exit early if essential data is missing
        }

        // Now we are guaranteed that activeSystem and activeSystem.starId exist
        const localStorageKey = `system_layout_${activeSystem.starId}`;
        //console.log("Calculated localStorageKey:", localStorageKey); // Keep this for debugging

        try {
            const storedLayout = localStorage.getItem(localStorageKey);
            if (storedLayout) {
                systemPositions.current = JSON.parse(storedLayout);
          //      console.log("StarSystemViewer: Loaded systemPositions from local storage:", systemPositions.current);
                return;
            }
        } catch (e) {
            //console.error("Failed to load system layout from local storage:", e);
        }

        //console.log("StarSystemViewer: No stored layout found or failed to load. Calculating new positions...");

        // ... rest of your position calculation and saving logic ...
        // Make sure the localStorage.setItem also uses this guarded localStorageKey
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(newSystemPositions));
          //  console.log("StarSystemViewer: Saved new systemPositions to local storage.");
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

    // Modified handleMouseMove for hover detection
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (isDragging.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            setViewOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        } else {
            // --- Hover Detection Logic ---
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let newHoveredBody = null;
            const { width, height } = canvasDimensions;
            const combinedScale = systemPositions.current.systemScale * viewScale;

            // Iterate through bodies (prioritize moons if visible and within threshold)
            // It's important to iterate in reverse drawing order (smallest/topmost last) for correct hit detection
            const allCelestialBodies = [];
            Object.values(systemPositions.current.planetPositions).forEach(pPos => {
                const planet = pPos.data;
                // Add planets
                allCelestialBodies.push({
                    x: pPos.x, y: pPos.y, size: getPlanetVisualSize(planet),
                    type: 'planet', originalData: planet, name: planet.planetName || `Planet ${planet.planetId}`
                });
                // Add moons if visible
                if (viewScale >= MOON_VISIBILITY_THRESHOLD) {
                    Object.values(pPos.moons).forEach(mPos => {
                        const moon = mPos.data;
                        allCelestialBodies.push({
                            x: pPos.x + mPos.x, y: pPos.y + mPos.y, size: getPlanetVisualSize(moon),
                            type: 'moon', originalData: moon, name: moon.moonName || `Moon ${moon.moonId}`
                        });
                    });
                }
            });

            // Sort by size descending (smallest last) so that smaller objects are hit-tested first
            // This is crucial for moons being clickable/hoverable over planets they orbit
            allCelestialBodies.sort((a, b) => a.size - b.size);

            for (let i = 0; i < allCelestialBodies.length; i++) {
                const body = allCelestialBodies[i];
                const transformedX = (body.x * combinedScale) + (width / 2 + viewOffset.x);
                const transformedY = (body.y * combinedScale) + (height / 2 + viewOffset.y);
                const transformedRadius = body.size * combinedScale;

                const distance = Math.sqrt(
                    (mouseX - transformedX) ** 2 +
                    (mouseY - transformedY) ** 2
                );

                if (distance < transformedRadius) {
                    // Found a hovered body
                    newHoveredBody = {
                        type: body.type,
                        name: body.name,
                        originalData: body.originalData,
                        screenX: transformedX,
                        screenY: transformedY,
                        screenRadius: transformedRadius
                    };
                    break; // Found the top-most hovered body, stop checking
                }
            }

            // Only update state if hover status has changed
            if (!isDragging.current && JSON.stringify(newHoveredBody) !== JSON.stringify(hoveredCelestialBody)) {
                setHoveredCelestialBody(newHoveredBody);
            }
        }
    }, [isDragging, viewOffset, viewScale, canvasDimensions, hoveredCelestialBody, getPlanetVisualSize, MOON_VISIBILITY_THRESHOLD]);


    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = 'grab';
    }, []);

    const handleMouseLeave = useCallback(() => {
        isDragging.current = false;
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = 'grab';
        setHoveredCelestialBody(null); // Clear hover when mouse leaves canvas
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
                    // parentPlanetPos: { x: pPos.x, y: pPos.y } // Not used for drawing, only for hit test collection
                });
            });
        });

        allCelestialBodiesData.sort((a, b) => b.size - a.size); // Draw larger bodies first

        // --- Layer 4: Planets and Moons (fully transformed, with conditional moon drawing) ---
        ctx.save();
        ctx.translate(width / 2 + viewOffset.x, height / 2 + viewOffset.y);
        const combinedScale = systemPositions.current.systemScale * viewScale;
        ctx.scale(combinedScale, combinedScale);

        const planetInfoBoxesToDraw = []; // Only for planets

        allCelestialBodiesData.forEach(body => {
            const { x, y, size, color, name, type, originalData } = body;

            // Conditional Moon Drawing
            if (type === 'moon' && viewScale < MOON_VISIBILITY_THRESHOLD) {
                return; // Skip drawing moons if zoom level is below threshold
            }

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

            // Highlight hovered body
            if (hoveredCelestialBody && hoveredCelestialBody.originalData === originalData) {
                ctx.shadowBlur = size * 2; // Stronger glow
                ctx.shadowColor = 'rgba(255, 255, 0, 0.8)'; // Yellowish glow
            } else if (type === 'planet' || type === 'moon') {
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

                planetInfoBoxesToDraw.push({
                    name: name,
                    moonCount: originalData.moons ? originalData.moons.length : 0,
                    settlementsCount: originalData.settlements ? originalData.settlements.length : 0,
                    attachX: screenX + screenRadius,
                    attachY: screenY + screenRadius,
                    type: 'planet' // Indicate this is a planet's box
                });
            }
        });

        ctx.restore(); // Restore context after drawing planets/moons

        // --- Layer 5: Fixed UI Elements (including planet/moon info boxes and system info) ---
        // These are drawn with a fresh context, not affected by viewOffset/viewScale

        // Helper function to draw a pill box
        const drawPillBox = (info, isMoonHovered = false) => {
            const pixelOffsetFromPlanetEdgeX = 15;
            const pixelOffsetFromPlanetEdgeY = 10;

            const boxX = info.attachX + pixelOffsetFromPlanetEdgeX;
            const boxY = info.attachY + pixelOffsetFromPlanetEdgeY;

            const nameText = info.name;
            let subText = '';
            if (isMoonHovered) { // Moon hover box
                // Moons don't have moons or settlements of their own, so just their type
                subText = info.originalData.moonType || 'Moon';
            } else { // Planet box
                if (info.moonCount > 0 && info.settlementsCount > 0) {
                    subText = `${info.moonCount} Moon(s) | ${info.settlementsCount} Settlement(s)`;
                } else if (info.moonCount > 0) {
                    subText = `${info.moonCount} Moon(s)`;
                } else if (info.settlementsCount > 0) {
                    subText = `${info.settlementsCount} Settlement(s)`;
                }
            }

            const padding = 8;
            const lineHeight = 14;
            const textHeight = subText ? (lineHeight * 2) : lineHeight;

            ctx.font = '12px monospace';
            const nameTextWidth = ctx.measureText(nameText).width;
            ctx.font = '10px monospace';
            const subTextWidth = ctx.measureText(subText).width;

            const boxWidth = Math.max(nameTextWidth, subTextWidth) + padding * 2;
            const boxHeight = textHeight + padding * 2;
            const cornerRadius = 8;

            ctx.fillStyle = 'rgba(0,0,0,0.7)'; // Slightly more opaque for hover
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(nameText, boxX + padding, boxY + padding + 10);

            if (subText) {
                ctx.fillStyle = '#C0C0C0';
                ctx.font = '10px monospace';
                ctx.fillText(subText, boxX + padding, boxY + padding + 10 + lineHeight);
            }
        };

        // Draw Planet Info Boxes (always visible for planets)
        planetInfoBoxesToDraw.forEach(info => {
            drawPillBox(info);
        });

        // Draw Moon Info Box (only if hovered and zoom is sufficient)
        if (hoveredCelestialBody &&
            hoveredCelestialBody.type === 'moon' &&
            viewScale >= MOON_LABEL_VISIBILITY_THRESHOLD) {

            const info = {
                name: hoveredCelestialBody.name,
                originalData: hoveredCelestialBody.originalData,
                attachX: hoveredCelestialBody.screenX + hoveredCelestialBody.screenRadius,
                attachY: hoveredCelestialBody.screenY + hoveredCelestialBody.screenRadius
            };
            drawPillBox(info, true); // Pass true to indicate it's a moon hover box
        }


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

    }, [activeSystem, canvasDimensions, getPlanetVisualSize, backgroundStars, backgroundNebulae, darkenColor, viewOffset, viewScale, MOON_VISIBILITY_THRESHOLD, MOON_LABEL_VISIBILITY_THRESHOLD, hoveredCelestialBody]); // Added hoveredCelestialBody and new threshold to dependencies


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