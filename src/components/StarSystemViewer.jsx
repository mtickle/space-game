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

    console.log(activeSystem)


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

    // New function to calculate system positions
    // In StarSystemViewer component

    const calculateSystemPositions = useCallback((systemData, width, height) => {
        const newPlanetPositions = {};
        const starX = 0;
        const starY = 0;

        // Define base orbit radius and increment for better spacing
        const baseOrbitRadius = 100; // Starting radius for the first planet
        const orbitSpacing = 80;    // Increased default spacing

        // Step 1: Initial Planet and Moon Placement
        systemData.planets.forEach((planet, index) => {
            const angle = planet.angle !== undefined ? planet.angle : (index * (2 * Math.PI / systemData.planets.length));
            const orbitRadius = planet.orbitRadius !== undefined ? planet.orbitRadius : (baseOrbitRadius + index * orbitSpacing);

            const planetX = starX + orbitRadius * Math.cos(angle);
            const planetY = starY + orbitRadius * Math.sin(angle);

            const moons = {};
            planet.moons.forEach((moon, moonIndex) => {
                const moonAngle = moon.angle !== undefined ? moon.angle : (moonIndex * (2 * Math.PI / planet.moons.length));
                // Make moon orbit relative to parent planet's visual size for better scaling
                const moonOrbitRadius = getPlanetVisualSize(planet) + (getPlanetVisualSize(moon) * 1.5);

                const moonX = moonOrbitRadius * Math.cos(moonAngle);
                const moonY = moonOrbitRadius * Math.sin(moonAngle);
                moons[moon.moonId] = { x: moonX, y: moonY, data: moon };
            });

            newPlanetPositions[planet.planetId] = {
                x: planetX,
                y: planetY,
                data: planet,
                moons: moons
            };
        });

        // Step 2: Repulsion-based Adjustment for Planets
        const REPULSION_ITERATIONS = 150;
        const REPULSION_PADDING = 50; // Extra padding between planets in world units

        let planetsForLayout = Object.values(newPlanetPositions);

        for (let i = 0; i < REPULSION_ITERATIONS; i++) {
            for (let j = 0; j < planetsForLayout.length; j++) {
                for (let k = j + 1; k < planetsForLayout.length; k++) {
                    const p1 = planetsForLayout[j];
                    const p2 = planetsForLayout[k];

                    const p1Radius = getPlanetVisualSize(p1.data);
                    const p2Radius = getPlanetVisualSize(p2.data);

                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 0.001; // Epsilon to avoid division by zero

                    const minDistance = p1Radius + p2Radius + REPULSION_PADDING;

                    if (distance < minDistance) {
                        const overlap = minDistance - distance;
                        const forceX = (dx / distance) * overlap * 0.5; // 0.5 damping factor
                        const forceY = (dy / distance) * overlap * 0.5;

                        p1.x += forceX;
                        p1.y += forceY;
                        p2.x -= forceX;
                        p2.y -= forceY;
                    }
                }
            }
        }

        // Step 3: Update positions and calculate new max orbit radius for scaling
        let maxOrbitRadius = 0;
        planetsForLayout.forEach(p => {
            newPlanetPositions[p.data.planetId] = p; // Update with new x, y
            const currentOrbit = Math.sqrt(p.x * p.x + p.y * p.y);
            const planetVisualRadius = getPlanetVisualSize(p.data);
            maxOrbitRadius = Math.max(maxOrbitRadius, currentOrbit + planetVisualRadius);
        });

        // Step 4: Calculate a suitable systemScale to fit everything within the canvas
        const paddingFactor = 1.2;
        let systemScale = 1.0;
        if (maxOrbitRadius > 0) {
            const systemDiameter = maxOrbitRadius * 2 * paddingFactor;
            const potentialScaleX = width / systemDiameter;
            const potentialScaleY = height / systemDiameter;
            systemScale = Math.min(potentialScaleX, potentialScaleY, 1.0);
        }

        return { systemScale, planetPositions: newPlanetPositions };
    }, [getPlanetVisualSize]); // <-- Make sure to add getPlanetVisualSize here

    // And update the useEffect that calls it to include the new dependency
    useEffect(() => {
        // ...
        // ... all the logic inside this effect ...
        // ...
    }, [activeSystem, canvasDimensions, calculateSystemPositions]); // <-- Add calculateSystemPositions here

    useEffect(() => {
        //console.log("StarSystemViewer: Position calculation/load useEffect running...");
        //console.log("activeSystem inside useEffect:", activeSystem); // Keep this for debugging

        // GUARDRAIL: Check for activeSystem AND activeSystem.starId
        if (!activeSystem || !activeSystem.starId || !canvasDimensions.width || !canvasDimensions.height) {
            systemPositions.current = { systemScale: 1, planetPositions: {} };
            // 	console.warn("StarSystemViewer: Skipping position calculation due to missing activeSystem, starId, or canvas dimensions.");
            // If activeSystem is present but starId is missing, it's a data problem
            if (activeSystem && !activeSystem.starId) {
                // 		console.error("StarSystemViewer: activeSystem object is missing 'starId' property!", activeSystem);
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
                // 			console.log("StarSystemViewer: Loaded systemPositions from local storage:", systemPositions.current);
                return;
            }
        } catch (e) {
            //console.error("Failed to load system layout from local storage:", e);
        }

        // If no stored layout found or failed to load, calculate new positions
        console.log("StarSystemViewer: No stored layout found or failed to load. Calculating new positions...");
        const newSystemPositions = calculateSystemPositions(activeSystem, canvasDimensions.width, canvasDimensions.height);
        systemPositions.current = newSystemPositions;

        try {
            localStorage.setItem(localStorageKey, JSON.stringify(newSystemPositions));
            // 	console.log("StarSystemViewer: Saved new systemPositions to local storage.");
        } catch (e) {
            console.error("Failed to save system layout to local storage:", e);
        }

    }, [activeSystem, canvasDimensions, calculateSystemPositions]);


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
    // In StarSystemViewer component

    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvasDimensions;

        ctx.clearRect(0, 0, width, height);

        // --- Layer 1-3: Background, Stars, Nebulae (No Changes) ---
        const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
        backgroundGradient.addColorStop(0, '#1a1a2e');
        backgroundGradient.addColorStop(0.5, '#3b3b5c');
        backgroundGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, width, height);
        ctx.save();
        ctx.translate(viewOffset.x * 0.1, viewOffset.y * 0.1);
        backgroundStars.current.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });
        ctx.restore();
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

        // --- Collect Body Data (No Changes) ---
        const allCelestialBodiesData = [];
        Object.values(systemPositions.current.planetPositions).forEach(pPos => {
            const planet = pPos.data;
            allCelestialBodiesData.push({
                x: pPos.x, y: pPos.y, size: getPlanetVisualSize(planet),
                color: planet.planetColor || '#8888AA', name: planet.planetName || `Planet ${planet.planetId}`,
                type: 'planet', originalData: planet
            });
            Object.values(pPos.moons).forEach(mPos => {
                const moon = mPos.data;
                allCelestialBodiesData.push({
                    x: pPos.x + mPos.x, y: pPos.y + mPos.y, size: getPlanetVisualSize(moon),
                    color: moon.moonColor || '#BBBBBB', type: 'moon', originalData: moon,
                    name: moon.moonName || `Moon ${moon.moonId}`
                });
            });
        });
        allCelestialBodiesData.sort((a, b) => b.size - a.size);

        // --- Layer 4: Planets and Moons (No Changes) ---
        ctx.save();
        ctx.translate(width / 2 + viewOffset.x, height / 2 + viewOffset.y);
        const combinedScale = systemPositions.current.systemScale * viewScale;
        ctx.scale(combinedScale, combinedScale);
        const planetInfoBoxesToDraw = [];
        allCelestialBodiesData.forEach(body => {
            const { x, y, size, color, name, type, originalData } = body;
            if (type === 'moon' && viewScale < MOON_VISIBILITY_THRESHOLD) return;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, darkenColor(color, type === 'planet' ? 0.4 : 0.5));
            ctx.fillStyle = gradient;
            if (hoveredCelestialBody && hoveredCelestialBody.originalData === originalData) {
                ctx.shadowBlur = size * 2;
                ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
            } else {
                ctx.shadowBlur = size * 1.5;
                ctx.shadowColor = color;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
            if (type === 'planet') {
                const screenX = (x * combinedScale) + (width / 2 + viewOffset.x);
                const screenY = (y * combinedScale) + (height / 2 + viewOffset.y);
                const screenRadius = size * combinedScale;
                planetInfoBoxesToDraw.push({
                    name: name, moonCount: originalData.moons ? originalData.moons.length : 0,
                    settlementsCount: originalData.settlements ? originalData.settlements.length : 0,
                    screenX: screenX, screenY: screenY, screenRadius: screenRadius,
                    originalData: originalData
                });
            }
        });
        ctx.restore();

        // --- Layer 5: Fixed UI Elements (NEW ADVANCED LABEL PLACEMENT LOGIC) ---
        const placedRects = [];

        // Step 1: Register all visible celestial bodies as obstacles
        allCelestialBodiesData.forEach(body => {
            if (body.type === 'moon' && viewScale < MOON_VISIBILITY_THRESHOLD) return;
            const screenX = (body.x * combinedScale) + (width / 2 + viewOffset.x);
            const screenY = (body.y * combinedScale) + (height / 2 + viewOffset.y);
            const screenRadius = body.size * combinedScale;
            placedRects.push({
                x: screenX - screenRadius, y: screenY - screenRadius,
                width: screenRadius * 2, height: screenRadius * 2
            });
        });

        const checkCollision = (boxA, boxB) => {
            const margin = 4; // A small buffer between labels
            return (
                boxA.x < boxB.x + boxB.width + margin &&
                boxA.x + boxA.width + margin > boxB.x &&
                boxA.y < boxB.y + boxB.height + margin &&
                boxA.y + boxA.height + margin > boxB.y
            );
        };

        const drawPillBoxAtPosition = (boxInfo, textInfo) => {
            const { x, y, width, height } = boxInfo;
            const { name, subText } = textInfo;
            const padding = 8;
            const lineHeight = 14;
            const cornerRadius = 8;

            ctx.fillStyle = 'rgba(23, 23, 33, 0.85)';
            ctx.strokeStyle = 'rgba(100, 100, 120, 0.9)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, cornerRadius);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top'; // Use top baseline for predictable positioning
            ctx.fillText(name, x + padding, y + padding);

            if (subText) {
                ctx.fillStyle = '#C0C0C0';
                ctx.font = '10px monospace';
                ctx.fillText(subText, x + padding, y + padding + lineHeight + 2);
            }
        };

        // Step 2: Collect all labels that need to be drawn
        const labelsToProcess = [];
        planetInfoBoxesToDraw.forEach(info => {
            labelsToProcess.push({ type: 'planet', ...info });
        });
        if (hoveredCelestialBody && hoveredCelestialBody.type === 'moon' && viewScale >= MOON_LABEL_VISIBILITY_THRESHOLD) {
            labelsToProcess.push({
                type: 'moon', name: hoveredCelestialBody.name,
                originalData: hoveredCelestialBody.originalData,
                screenX: hoveredCelestialBody.screenX, screenY: hoveredCelestialBody.screenY,
                screenRadius: hoveredCelestialBody.screenRadius,
            });
        }

        // Step 3: Iterate, find a position, and draw each label
        labelsToProcess.forEach(labelInfo => {
            const nameText = labelInfo.name;
            let subText = '';
            if (labelInfo.type === 'moon') {
                subText = labelInfo.originalData.moonType || 'Moon';
            } else {
                const { moonCount, settlementsCount } = labelInfo;
                if (moonCount > 0 && settlementsCount > 0) subText = `${moonCount} Moon(s) | ${settlementsCount} Settlement(s)`;
                else if (moonCount > 0) subText = `${moonCount} Moon(s)`;
                else if (settlementsCount > 0) subText = `${settlementsCount} Settlement(s)`;
            }

            const padding = 8;
            const lineHeight = 14;
            const textHeight = subText ? (lineHeight * 2) : lineHeight;
            ctx.font = 'bold 12px monospace';
            const nameTextWidth = ctx.measureText(nameText).width;
            ctx.font = '10px monospace';
            const subTextWidth = subText ? ctx.measureText(subText).width : 0;
            const boxWidth = Math.max(nameTextWidth, subTextWidth) + padding * 2;
            const boxHeight = textHeight + padding * 2 - (subText ? 0 : 2);

            const margin = 12; // Distance from planet edge
            const r = labelInfo.screenRadius + margin;
            const positions = [
                { x: labelInfo.screenX + r, y: labelInfo.screenY - boxHeight / 2 }, // Right
                { x: labelInfo.screenX - r - boxWidth, y: labelInfo.screenY - boxHeight / 2 }, // Left
                { x: labelInfo.screenX - boxWidth / 2, y: labelInfo.screenY - r - boxHeight }, // Top
                { x: labelInfo.screenX - boxWidth / 2, y: labelInfo.screenY + r }, // Bottom
            ];

            let bestPosition = null;
            for (const pos of positions) {
                const candidateBox = { x: pos.x, y: pos.y, width: boxWidth, height: boxHeight };
                if (!placedRects.some(rect => checkCollision(candidateBox, rect))) {
                    bestPosition = candidateBox;
                    break;
                }
            }

            if (bestPosition) {
                drawPillBoxAtPosition(bestPosition, { name: nameText, subText: subText });
                placedRects.push(bestPosition);
            }
        });

        // --- System Info Box (No Changes) ---
        // if (activeSystem) {
        //     ctx.fillStyle = 'rgba(0,0,0,0.5)';
        //     ctx.fillRect(10, 10, 260, 100);
        //     ctx.fillStyle = '#00ff88';
        //     ctx.font = '20px monospace';
        //     ctx.textAlign = 'left';
        //     ctx.textBaseline = 'alphabetic'; // Reset baseline for this text
        //     ctx.fillText(activeSystem.starName || 'Unnamed System', 20, 35);
        //     ctx.font = '14px monospace';
        //     ctx.fillStyle = '#FFFFFF';
        //     const totalPlanets = (activeSystem.planets || []).length;
        //     const totalMoons = (activeSystem.planets || []).reduce((acc, p) => acc + (p.moons ? p.moons.length : 0), 0);
        //     ctx.fillText(`${totalPlanets} PLANETS / ${totalMoons} MOON(S)`, 20, 60);
        // }
    }, [activeSystem, canvasDimensions, getPlanetVisualSize, backgroundStars, backgroundNebulae, darkenColor, viewOffset, viewScale, MOON_VISIBILITY_THRESHOLD, MOON_LABEL_VISIBILITY_THRESHOLD, hoveredCelestialBody]);
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
        <div className="star-system-viewer w-full h-full relative bg-[#1a1a2e]">
            {/* NEW: Combined System Info and Control Panel */}
            <div className="absolute top-4 left-4 z-20 p-4 bg-black/60 rounded-lg text-white font-mono backdrop-blur-sm border border-slate-700 shadow-lg">

                {/* System Name */}
                <h1 className="text-xl font-bold text-[#00ff88]">
                    {activeSystem?.starName || 'Unnamed System'}
                </h1>

                {/* System Stats */}
                <p className="text-sm text-slate-300 mt-1">
                    {`${activeSystem?.planets?.length || 0} PLANETS / ${activeSystem?.planets?.reduce((acc, p) => acc + (p.moons?.length || 0), 0) || 0
                        } MOON(S)`}
                </p>

                {/* Back Button */}
                <button
                    onClick={onClose}
                    className="mt-4 px-3 py-1.5 w-full bg-slate-700 text-white text-sm rounded-md hover:bg-slate-600 transition-colors duration-200"
                >
                    Back to Galaxy Map
                </button>
            </div>

            <canvas ref={canvasRef} className="w-full h-full block cursor-grab"></canvas>
        </div>
    );
};

export default StarSystemViewer;