import { getMoonColor } from '@utils/colorUtils'; // Adjust path if necessary
import { useCallback, useEffect, useRef, useState } from 'react';

const StarSystemViewer = ({ activeSystem, onClose }) => {
    // Core Refs for canvas and animation
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const systemPositions = useRef({});
    const backgroundStars = useRef([]);
    const backgroundNebulae = useRef([]);

    // State
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [viewScale, setViewScale] = useState(1);
    const [hoveredCelestialBody, setHoveredCelestialBody] = useState(null);

    // Refs for interaction and animation state
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const introAnimation = useRef({ startTime: null, duration: 1500 });
    const moonRevealAnimation = useRef({ startTime: null, duration: 800 });
    const prevViewScale = useRef(viewScale);

    // Constants
    const MOON_VISIBILITY_THRESHOLD = 1.5;
    const MOON_LABEL_VISIBILITY_THRESHOLD = 2.5;

    // --- Helper Functions ---

    const getPlanetVisualSize = useCallback((celestialBody) => {
        if (!celestialBody) return 1;
        if (celestialBody.moonId) {
            return (celestialBody.moonSize || 4) * 5;
        }
        return (celestialBody.planetSize || 8) * 5;
    }, []);

    const darkenColor = useCallback((hex, percent) => {
        let f = parseInt(hex.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = (f >> 8) & 0x00FF, B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    }, []);

    const generateStaticBackground = useCallback((width, height) => {
        const newStars = Array.from({ length: 150 }, () => ({ x: Math.random() * width, y: Math.random() * height, radius: Math.random() * 1.5, alpha: 0.1 + Math.random() * 0.25, }));
        backgroundStars.current = newStars;
        const newNebulae = [{ x: width * 0.2, y: height * 0.3, radius: 100, color: 'rgba(100, 100, 255, 0.05)' }, { x: width * 0.7, y: height * 0.8, radius: 120, color: 'rgba(255, 100, 100, 0.05)' }, { x: width * 0.5, y: height * 0.1, radius: 80, color: 'rgba(100, 255, 100, 0.05)' },];
        backgroundNebulae.current = newNebulae;
    }, []);

    const calculateSystemPositions = useCallback((systemData, width, height) => {
        const newPlanetPositions = {};
        const starX = 0, starY = 0, baseOrbitRadius = 100, orbitSpacing = 80;
        systemData.planets.forEach((planet, index) => {
            const angle = planet.angle !== undefined ? planet.angle : (index * (2 * Math.PI / systemData.planets.length));
            const orbitRadius = planet.orbitRadius !== undefined ? planet.orbitRadius : (baseOrbitRadius + index * orbitSpacing);
            const planetX = starX + orbitRadius * Math.cos(angle);
            const planetY = starY + orbitRadius * Math.sin(angle);
            const moons = {};
            planet.moons.forEach((moon, moonIndex) => {
                const moonAngle = moon.angle !== undefined ? moon.angle : (moonIndex * (2 * Math.PI / planet.moons.length));
                const moonOrbitRadius = getPlanetVisualSize(planet) + (getPlanetVisualSize(moon) * 2.5);
                const moonX = moonOrbitRadius * Math.cos(moonAngle), moonY = moonOrbitRadius * Math.sin(moonAngle);
                moons[moon.moonId] = { x: moonX, y: moonY, data: moon };
            });
            newPlanetPositions[planet.planetId] = { x: planetX, y: planetY, data: planet, moons: moons };
        });
        const REPULSION_ITERATIONS = 150, REPULSION_PADDING = 50;
        let planetsForLayout = Object.values(newPlanetPositions);
        for (let i = 0; i < REPULSION_ITERATIONS; i++) {
            for (let j = 0; j < planetsForLayout.length; j++) {
                for (let k = j + 1; k < planetsForLayout.length; k++) {
                    const p1 = planetsForLayout[j], p2 = planetsForLayout[k];
                    const p1Radius = getPlanetVisualSize(p1.data), p2Radius = getPlanetVisualSize(p2.data);
                    const dx = p1.x - p2.x, dy = p1.y - p2.y, distance = Math.sqrt(dx * dx + dy * dy) || 0.001;
                    const minDistance = p1Radius + p2Radius + REPULSION_PADDING;
                    if (distance < minDistance) {
                        const overlap = minDistance - distance, forceX = (dx / distance) * overlap * 0.5, forceY = (dy / distance) * overlap * 0.5;
                        p1.x += forceX; p1.y += forceY; p2.x -= forceX; p2.y -= forceY;
                    }
                }
            }
        }
        let maxOrbitRadius = 0;
        planetsForLayout.forEach(p => {
            newPlanetPositions[p.data.planetId] = p;
            const currentOrbit = Math.sqrt(p.x * p.x + p.y * p.y), planetVisualRadius = getPlanetVisualSize(p.data);
            maxOrbitRadius = Math.max(maxOrbitRadius, currentOrbit + planetVisualRadius);
        });
        const paddingFactor = 1.2; let systemScale = 1.0;
        if (maxOrbitRadius > 0) {
            const systemDiameter = maxOrbitRadius * 2 * paddingFactor;
            systemScale = Math.min(width / systemDiameter, height / systemDiameter, 1.0);
        }
        return { systemScale, planetPositions: newPlanetPositions };
    }, [getPlanetVisualSize]);

    // --- Mouse Event Handlers ---

    const handleMouseDown = useCallback((e) => {
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        canvasRef.current.style.cursor = 'grabbing';
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        canvasRef.current.style.cursor = 'grab';
    }, []);

    const handleMouseLeave = useCallback(() => {
        isDragging.current = false;
        setHoveredCelestialBody(null);
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    }, []);

    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (isDragging.current) {
            const dx = e.clientX - lastMousePos.current.x, dy = e.clientY - lastMousePos.current.y;
            setViewOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        } else {
            const rect = canvas.getBoundingClientRect(), mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
            let newHoveredBody = null;

            if (systemPositions.current.planetPositions) {
                const { width, height } = canvasDimensions;
                const combinedScale = (systemPositions.current.systemScale || 1) * viewScale;

                // This temporary array is only for hit-detection
                const allCelestialBodies = [];

                Object.values(systemPositions.current.planetPositions).forEach(pPos => {
                    const planet = pPos.data;
                    // Use the final, non-animated position (pPos.x) for hit detection
                    allCelestialBodies.push({
                        x: pPos.x,
                        y: pPos.y,
                        size: getPlanetVisualSize(planet),
                        type: 'planet',
                        originalData: planet,
                        name: planet.planetName || `Planet ${planet.planetId}`
                    });

                    if (viewScale >= MOON_VISIBILITY_THRESHOLD) {
                        Object.values(pPos.moons).forEach(mPos => {
                            const moon = mPos.data;
                            // Use the final, non-animated positions for moons as well
                            allCelestialBodies.push({
                                x: pPos.x + mPos.x,
                                y: pPos.y + mPos.y,
                                size: getPlanetVisualSize(moon),
                                color: getMoonColor(moon.moonType),
                                type: 'moon',
                                originalData: moon,
                                name: moon.moonName || `Moon ${moon.moonId}`
                            });
                        });
                    }
                });

                // Sort so smaller bodies (moons) are checked first
                allCelestialBodies.sort((a, b) => a.size - b.size);

                for (const body of allCelestialBodies) {
                    const transformedX = (body.x * combinedScale) + (width / 2 + viewOffset.x);
                    const transformedY = (body.y * combinedScale) + (height / 2 + viewOffset.y);
                    const transformedRadius = body.size * combinedScale;
                    const distance = Math.sqrt((mouseX - transformedX) ** 2 + (mouseY - transformedY) ** 2);

                    if (distance < transformedRadius) {
                        newHoveredBody = { ...body, screenX: transformedX, screenY: transformedY, screenRadius: transformedRadius };
                        break;
                    }
                }
            }

            if (JSON.stringify(newHoveredBody) !== JSON.stringify(hoveredCelestialBody)) {
                setHoveredCelestialBody(newHoveredBody);
            }
        }
    }, [isDragging, viewOffset, viewScale, canvasDimensions, hoveredCelestialBody, getPlanetVisualSize, MOON_VISIBILITY_THRESHOLD]);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const scaleAmount = 1.1;
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = (mouseX - (canvasDimensions.width / 2 + viewOffset.x)) / viewScale;
        const worldY = (mouseY - (canvasDimensions.height / 2 + viewOffset.y)) / viewScale;
        const newScale = e.deltaY < 0 ? viewScale * scaleAmount : viewScale / scaleAmount;
        const clampedScale = Math.max(0.1, Math.min(newScale, 5));
        const newOffsetX = mouseX - worldX * clampedScale - canvasDimensions.width / 2;
        const newOffsetY = mouseY - worldY * clampedScale - canvasDimensions.height / 2;
        setViewScale(clampedScale);
        setViewOffset({ x: newOffsetX, y: newOffsetY });
    }, [viewScale, viewOffset, canvasDimensions]);

    // --- Drawing Function ---

    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvasDimensions.width || !canvasDimensions.height) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvasDimensions;

        let introProgress = 1.0;
        const introAnim = introAnimation.current;
        if (introAnim.startTime) {
            const elapsed = performance.now() - introAnim.startTime;
            introProgress = Math.min(elapsed / introAnim.duration, 1.0);
            const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
            introProgress = easeOutQuint(introProgress);
            if (introProgress >= 1.0) introAnim.startTime = null;
        }

        let moonProgress = viewScale >= MOON_VISIBILITY_THRESHOLD ? 1.0 : 0.0;
        const moonAnim = moonRevealAnimation.current;
        if (moonAnim.startTime) {
            const elapsed = performance.now() - moonAnim.startTime;
            const progress = Math.min(elapsed / moonAnim.duration, 1.0);
            const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
            moonProgress = easeOutBack(progress);
            if (progress >= 1.0) moonAnim.startTime = null;
        }

        ctx.clearRect(0, 0, width, height);

        const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
        backgroundGradient.addColorStop(0, '#1a1a2e'); backgroundGradient.addColorStop(0.5, '#3b3b5c'); backgroundGradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = backgroundGradient; ctx.fillRect(0, 0, width, height);
        ctx.save();
        ctx.translate(viewOffset.x * 0.1, viewOffset.y * 0.1);
        backgroundStars.current.forEach(star => { ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`; ctx.fill(); });
        ctx.restore();
        ctx.save();
        ctx.translate(viewOffset.x * 0.3, viewOffset.y * 0.3);
        ctx.filter = 'blur(8px)';
        backgroundNebulae.current.forEach(nebula => { ctx.fillStyle = nebula.color; ctx.beginPath(); ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2); ctx.fill(); });
        ctx.filter = 'none'; ctx.restore();

        if (!activeSystem || !systemPositions.current.planetPositions) return;

        // STEP 1: The array is DECLARED here. Its name is "allCelestialBodiesData".
        // This entire block replaces the data collection section in `drawScene`
        // to ensure the structure and scope are correct.

        // In drawScene, replace the data collection block with this:

        const allCelestialBodiesData = [];
        const combinedScale = systemPositions.current.systemScale * viewScale;

        // Loop through each planet
        Object.values(systemPositions.current.planetPositions).forEach(pPos => {
            // Group the planet's animated position into an object.
            // This makes the dependency clearer for the JavaScript engine.
            const parentPosition = {
                x: pPos.x * introProgress,
                y: pPos.y * introProgress,
            };
            const planet = pPos.data;

            // Add the planet to our list of things to draw
            allCelestialBodiesData.push({
                x: parentPosition.x,
                y: parentPosition.y,
                size: getPlanetVisualSize(planet),
                color: planet.planetColor || '#8888AA',
                name: planet.planetName || `Planet ${planet.planetId}`,
                type: 'planet',
                originalData: planet
            });

            // Handle the moons for THIS planet
            if (viewScale >= MOON_VISIBILITY_THRESHOLD) {
                Object.values(pPos.moons).forEach(mPos => {
                    const moon = mPos.data;
                    allCelestialBodiesData.push({
                        // Use the properties from the parentPosition object
                        x: parentPosition.x + (mPos.x * moonProgress),
                        y: parentPosition.y + (mPos.y * moonProgress),
                        size: getPlanetVisualSize(moon),
                        color: getMoonColor(moon.moonType),
                        type: 'moon',
                        originalData: moon,
                        name: moon.moonName || `Moon ${moon.moonId}`
                    });
                });
            }
        });

        // Sort everything to be drawn
        allCelestialBodiesData.sort((a, b) => b.size - a.size);

        ctx.save();
        ctx.translate(width / 2 + viewOffset.x, height / 2 + viewOffset.y);
        ctx.scale(combinedScale, combinedScale);
        const planetInfoBoxesToDraw = [];

        // STEP 5: USED here.
        allCelestialBodiesData.forEach(body => {
            const { x, y, size, color, name, type, originalData } = body;
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, color); gradient.addColorStop(1, darkenColor(color, type === 'planet' ? 0.4 : 0.5));
            ctx.fillStyle = gradient;
            if (hoveredCelestialBody && hoveredCelestialBody.originalData === originalData) {
                ctx.shadowBlur = size * 2.5; ctx.shadowColor = 'rgba(255, 255, 100, 0.9)';
            } else if (type === 'moon') {
                ctx.shadowBlur = size * 1.8; ctx.shadowColor = 'rgba(230, 230, 255, 0.8)';
            } else {
                ctx.shadowBlur = size * 1.5; ctx.shadowColor = color;
            }
            ctx.fill(); ctx.shadowBlur = 0;
            if (type === 'planet') {
                planetInfoBoxesToDraw.push({ name, moonCount: originalData.moons?.length || 0, settlementsCount: originalData.settlements?.length || 0, screenX: (x * combinedScale) + (width / 2 + viewOffset.x), screenY: (y * combinedScale) + (height / 2 + viewOffset.y), screenRadius: size * combinedScale, originalData });
            }
        });
        ctx.restore();


        if (introProgress > 0.8) {
            ctx.globalAlpha = (introProgress - 0.8) / 0.2;
            
            // placedRects will store the bounding boxes of labels already drawn to avoid overlaps
            const placedRects = []; 
            // Helper to check if two rectangles (boxes) collide
            const checkCollision = (boxA, boxB) => { 
                const margin = 4; // Add a small margin for visual separation
                return boxA.x < boxB.x + boxB.width + margin && 
                       boxA.x + boxA.width + margin > boxB.x && 
                       boxA.y < boxB.y + boxB.height + margin && 
                       boxA.y + boxA.height + margin > boxB.y; 
            };

            // Helper function to draw a pill box at a given position and with given text info
            const drawPillBoxAtPosition = (boxInfo, textInfo) => { 
                const { x, y, width, height } = boxInfo; 
                const { name, subText } = textInfo; 
                const padding = 8, lineHeight = 14, cornerRadius = 8; 
                
                ctx.fillStyle = 'rgba(23, 23, 33, 0.85)'; // Background fill
                ctx.strokeStyle = 'rgba(100, 100, 120, 0.9)'; // Border stroke
                ctx.lineWidth = 1; 
                ctx.beginPath(); 
                ctx.roundRect(x, y, width, height, cornerRadius); 
                ctx.fill(); 
                ctx.stroke(); 
                
                ctx.fillStyle = '#FFFFFF'; 
                ctx.font = 'bold 12px monospace'; // Font for name
                ctx.textAlign = 'left'; 
                ctx.textBaseline = 'top'; 
                ctx.fillText(name, x + padding, y + padding); 
                
                if (subText) { 
                    ctx.fillStyle = '#C0C0C0'; // Color for subText
                    ctx.font = '10px monospace'; // Font for subText
                    ctx.fillText(subText, x + padding, y + padding + lineHeight + 2); 
                } 
            };

            // Collect all bodies that might need labels (planets and visible/hovered moons)
            // This block is for collecting data for the collision-avoiding labels
            // It replaces the previous STEP 6 and STEP 7 logic.
            const labelsToProcess = [];

            // Add planets
            Object.values(systemPositions.current.planetPositions).forEach(pPos => {
                const planet = pPos.data;
                const screenX = (pPos.x * combinedScale) + (width / 2 + viewOffset.x);
                const screenY = (pPos.y * combinedScale) + (height / 2 + viewOffset.y);
                const screenRadius = getPlanetVisualSize(planet) * combinedScale;

                labelsToProcess.push({
                    type: 'planet',
                    name: planet.planetName || `Planet ${planet.planetId}`,
                    originalData: planet, // Keep original data for subText logic
                    screenX: screenX,
                    screenY: screenY,
                    screenRadius: screenRadius
                });

                // Add moons if they are visible (based on MOON_VISIBILITY_THRESHOLD)
                // This is for always-on moon labels if MOON_LABEL_VISIBILITY_THRESHOLD is low
                // (Currently, moon labels are only on hover, so this section might be redundant for your current needs)
                // If you want ALL visible moons to have labels when zoomed in, this is the place.
                if (viewScale >= MOON_LABEL_VISIBILITY_THRESHOLD) { // Check if moon labels should generally be visible
                    Object.values(pPos.moons).forEach(mPos => {
                        const moon = mPos.data;
                        const moonScreenX = (pPos.x + mPos.x) * combinedScale + (width / 2 + viewOffset.x);
                        const moonScreenY = (pPos.y + mPos.y) * combinedScale + (height / 2 + viewOffset.y);
                        const moonScreenRadius = getPlanetVisualSize(moon) * combinedScale;

                        labelsToProcess.push({
                            type: 'moon',
                            name: moon.moonName || `Moon ${moon.moonId}`,
                            originalData: moon,
                            screenX: moonScreenX,
                            screenY: moonScreenY,
                            screenRadius: moonScreenRadius
                        });
                    });
                }
            });

            // Add the hovered moon if it exists and its label should be visible
            if (hoveredCelestialBody && hoveredCelestialBody.type === 'moon' && viewScale >= MOON_LABEL_VISIBILITY_THRESHOLD) {
                // Ensure this specific hovered moon is added if it wasn't already (e.g., by the general moon visibility)
                // Avoid duplicates if it's already in labelsToProcess from the general moon visibility block
                const isAlreadyInList = labelsToProcess.some(label => label.originalData === hoveredCelestialBody.originalData);
                if (!isAlreadyInList) {
                    labelsToProcess.push({
                        type: 'moon',
                        name: hoveredCelestialBody.name,
                        originalData: hoveredCelestialBody.originalData,
                        screenX: hoveredCelestialBody.screenX,
                        screenY: hoveredCelestialBody.screenY,
                        screenRadius: hoveredCelestialBody.screenRadius
                    });
                }
            }


            // --- Process and Draw Labels ---
            labelsToProcess.forEach(labelInfo => {
                const nameText = labelInfo.name;
                let subText = '';

                // Determine subText based on type and originalData
                if (labelInfo.type === 'moon') {
                    subText = labelInfo.originalData.moonType || 'Moon';
                    const moonSettlements = labelInfo.originalData.moonSettlements;
                    if (moonSettlements && moonSettlements.length > 0) {
                        subText += (subText ? ' | ' : '') + `Set: ${moonSettlements.length}`;
                    }
                } else if (labelInfo.type === 'planet') {
                    const moonCount = labelInfo.originalData.moons?.length || 0;
                    const settlementsCount = labelInfo.originalData.settlements?.length || 0;
                    const resources = labelInfo.originalData.resourceList ? labelInfo.originalData.resourceList.map(r => r.mineralName).join(', ') : '';

                    if (moonCount > 0 && settlementsCount > 0) {
                        subText = `${moonCount} Moon(s) | ${settlementsCount} Settlement(s)`;
                    } else if (moonCount > 0) {
                        subText = `${moonCount} Moon(s)`;
                    } else if (settlementsCount > 0) {
                        subText = `${settlementsCount} Settlement(s)`;
                    }
                    if (resources) {
                        subText += (subText ? ' | ' : '') + `Res: ${resources}`;
                    }
                }
                // Space station labels are handled differently (not in this collision avoidance loop yet)

                const padding = 8;
                const lineHeight = 14;
                const textHeight = subText ? (lineHeight * 2) : lineHeight;

                // --- CRITICAL: Set font for measurement BEFORE measuring ---
                ctx.font = 'bold 12px monospace'; // Font for nameText measurement
                const nameTextWidth = ctx.measureText(nameText).width;

                let subTextWidth = 0;
                if (subText) {
                    ctx.font = '10px monospace'; // Font for subText measurement
                    subTextWidth = ctx.measureText(subText).width;
                }
                
                const boxWidth = Math.max(nameTextWidth, subTextWidth) + padding * 2;
                const boxHeight = textHeight + padding * 2; // Simplified boxHeight calculation

                const margin = 12; // Margin from the body's edge
                const r = labelInfo.screenRadius + margin; // Distance from body center to start looking for label position

                // Define preferred positions around the body (relative to body's screen center)
                // Order matters for collision avoidance (e.g., try right, then left, then top, then bottom)
                const positions = [
                    { x: labelInfo.screenX + r, y: labelInfo.screenY - boxHeight / 2 }, // Right
                    { x: labelInfo.screenX - r - boxWidth, y: labelInfo.screenY - boxHeight / 2 }, // Left
                    { x: labelInfo.screenX - boxWidth / 2, y: labelInfo.screenY - r - boxHeight }, // Top
                    { x: labelInfo.screenX - boxWidth / 2, y: labelInfo.screenY + r }, // Bottom
                ];

                // Attempt to place the label in the first non-colliding position
                let placed = false;
                for (const pos of positions) {
                    const candidateBox = { x: pos.x, y: pos.y, width: boxWidth, height: boxHeight };
                    // Check if this candidate box collides with any already placed labels or celestial bodies
                    // For now, only checking against other labels (placedRects)
                    if (!placedRects.some(rect => checkCollision(candidateBox, rect))) {
                        drawPillBoxAtPosition(candidateBox, { name: nameText, subText: subText });
                        placedRects.push(candidateBox); // Add this label's box to placedRects
                        placed = true;
                        break;
                    }
                }

                // Optional: If no non-colliding position found, you might choose not to draw the label
                if (!placed) {
                    // console.warn(`Label for ${nameText} could not be placed without collision.`);
                }
            });
            ctx.globalAlpha = 1.0;
        }
    }, [activeSystem, canvasDimensions, getPlanetVisualSize, backgroundStars, backgroundNebulae, darkenColor, viewOffset, viewScale, MOON_VISIBILITY_THRESHOLD, MOON_LABEL_VISIBILITY_THRESHOLD, hoveredCelestialBody]);
    // --- useEffect Hooks ---

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
        return () => resizeObserver.unobserve(container);
    }, [generateStaticBackground]);

    useEffect(() => {
        const isNowVisible = viewScale >= MOON_VISIBILITY_THRESHOLD;
        const wasPreviouslyVisible = prevViewScale.current >= MOON_VISIBILITY_THRESHOLD;
        if (isNowVisible && !wasPreviouslyVisible) {
            moonRevealAnimation.current.startTime = performance.now();
        }
        prevViewScale.current = viewScale;
    }, [viewScale, MOON_VISIBILITY_THRESHOLD]);

    useEffect(() => {
        if (!activeSystem || !activeSystem.starId || !canvasDimensions.width || !canvasDimensions.height) {
            systemPositions.current = { systemScale: 1, planetPositions: {} };
            return;
        }
        const localStorageKey = `system_layout_${activeSystem.starId}`;
        let layoutData = null;
        try {
            const storedLayout = localStorage.getItem(localStorageKey);
            if (storedLayout) layoutData = JSON.parse(storedLayout);
        } catch (e) { console.error("Failed to load system layout from local storage:", e); }
        if (!layoutData) {
            layoutData = calculateSystemPositions(activeSystem, canvasDimensions.width, canvasDimensions.height);
            try { localStorage.setItem(localStorageKey, JSON.stringify(layoutData)); } catch (e) { console.error("Failed to save system layout to local storage:", e); }
        }
        systemPositions.current = layoutData;
        introAnimation.current.startTime = performance.now();
    }, [activeSystem, canvasDimensions, calculateSystemPositions]);

    useEffect(() => {
        const animate = () => {
            drawScene();
            animationFrameId.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
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
            <div className="absolute top-4 left-4 z-20 p-4 bg-black/60 rounded-lg text-white font-mono backdrop-blur-sm border border-slate-700 shadow-lg">
                <h1 className="text-xl font-bold text-[#00ff88]">
                    {activeSystem?.starName || 'Unnamed System'}
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                    {`${activeSystem?.planets?.length || 0} PLANETS / ${activeSystem?.planets?.reduce((acc, p) => acc + (p.moons?.length || 0), 0) || 0} MOON(S)`}
                </p>
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