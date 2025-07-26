// @components/StarSystemViewer.jsx

import { useCallback, useEffect, useRef, useState } from 'react';

const StarSystemViewer = ({ activeSystem, onClose }) => {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    // systemOrbitState will store the calculated orbit radii, angles, and speeds for this viewer.
    // It's a ref so it doesn't trigger re-renders when its internal properties (like angle) change.
    const systemOrbitState = useRef({});

    // State to hold canvas dimensions, triggering re-calculation of orbits on resize.
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

    // Helper function to determine a consistent visual size for planets and moons.
    // It now intelligently uses 'moonSize' for moons and 'size' for planets.
    const getPlanetVisualSize = useCallback((celestialBody) => {
        if (!celestialBody) return 1;

        // If the object has a 'moonId' property, it's a moon. Use moonSize, default to 4.
        if (celestialBody.moonId) {
            return celestialBody.moonSize || 4;
        }
        // Otherwise, assume it's a planet. Use size, default to 8.
        return celestialBody.size || 8;
    }, []);

    // --- EFFECT: Handle Canvas Resizing and Initial Setup ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement;
        if (!container) return;

        // Use ResizeObserver to dynamically adjust canvas dimensions to its parent container.
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
                setCanvasDimensions({ width, height }); // Update state to trigger orbit recalculation if needed
            }
        });

        resizeObserver.observe(container);

        // Cleanup observer on component unmount.
        return () => resizeObserver.unobserve(container);
    }, []); // Runs once on mount to set up the observer.


    // --- EFFECT: Calculate Orbits When Active System or Canvas Dimensions Change ---
    // This effect ensures that orbit radii and system scale are calculated dynamically.
    useEffect(() => {
        console.log("StarSystemViewer: Orbit calculation useEffect running...");
        console.log("StarSystemViewer: activeSystem received:", activeSystem);
        console.log("StarSystemViewer: canvasDimensions:", canvasDimensions);

        if (!activeSystem || !canvasDimensions.width || !canvasDimensions.height) {
            // If no active system or canvas dimensions are zero, reset and return.
            systemOrbitState.current = { systemScale: 1, planetOrbits: {} };
            console.warn("StarSystemViewer: Skipping orbit calculation due to missing activeSystem or canvas dimensions.");
            return;
        }

        const newOrbitState = {
            systemScale: 1, // Will be calculated dynamically
            planetOrbits: {} // Stores calculated radius, angle, speed for each planet/moon
        };

        const planets = activeSystem.planets || [];
        if (planets.length === 0) {
            systemOrbitState.current = newOrbitState;
            console.warn("StarSystemViewer: Active system has no planets. Orbit calculation finished.");
            return;
        }

        const minPlanetSpacing = 40; // Minimum distance between planet orbits
        const minMoonSpacing = 15;    // Minimum distance between moon orbits
        const basePlanetOrbitRadius = 60; // Starting radius for the first planet's orbit

        let currentOrbitRadius = basePlanetOrbitRadius;

        planets.forEach((planet, planetIndex) => {
            // --- Crucial ID check for planets (using planet.planetId) ---
            if (planet.planetId === undefined || planet.planetId === null) {
                console.error("StarSystemViewer: Planet skipped during orbit calculation due to missing planetId:", planet);
                return; // Skip this planet if it doesn't have a valid ID
            }

            const planetVisualSize = getPlanetVisualSize(planet);
            // Calculate clearance needed for this planet's orbit lane
            const planetClearance = planetVisualSize * 2;

            // Ensure current orbit radius is at least enough for this planet,
            // factoring in previous orbits, spacing, and planet's own size.
            currentOrbitRadius = Math.max(currentOrbitRadius, basePlanetOrbitRadius + (planetIndex * minPlanetSpacing) + (planetIndex * planetClearance));


            // Store planet's initial orbit data (radius, angle, speed) (using planet.planetId)
            newOrbitState.planetOrbits[planet.planetId] = {
                radius: currentOrbitRadius,
                angle: Math.random() * Math.PI * 2, // Start at a random angle
                speed: (0.0005 + Math.random() * 0.0005) / (currentOrbitRadius / 100), // Slower for larger orbits
                moons: {} // Placeholder for moon orbits for this planet
            };

            // --- Calculate Moons for this Planet ---
            if (planet.moons && planet.moons.length > 0) {
                // Moons orbit their parent planet, so their base radius is relative to the planet's visual size.
                let currentMoonOrbitRadius = planetVisualSize + minMoonSpacing;

                planet.moons.forEach((moon, moonIndex) => {
                    // --- Crucial ID check for moons (NOW USING moon.moonId) ---
                    if (moon.moonId === undefined || moon.moonId === null) {
                        console.error(`StarSystemViewer: Moon of planet ${planet.planetId} skipped during orbit calculation due to missing moonId:`, moon);
                        return; // Skip this moon if it doesn't have a valid ID
                    }

                    const moonVisualSize = getPlanetVisualSize(moon);
                    const moonClearance = moonVisualSize * 2;

                    // Calculate moon's orbit radius relative to its parent planet.
                    currentMoonOrbitRadius = Math.max(currentMoonOrbitRadius, (planetVisualSize + minMoonSpacing) + (moonIndex * minMoonSpacing) + (moonIndex * moonClearance));

                    // Store moon's initial orbit data (using planet.planetId and moon.moonId)
                    newOrbitState.planetOrbits[planet.planetId].moons[moon.moonId] = {
                        radius: currentMoonOrbitRadius,
                        angle: Math.random() * Math.PI * 2, // Random initial angle for moon
                        speed: (0.002 + Math.random() * 0.001) / (currentMoonOrbitRadius / 10), // Moons orbit faster
                    };
                });
            }

            // Advance currentOrbitRadius for the next planet's orbit.
            currentOrbitRadius += planetClearance + minPlanetSpacing;
        });

        // --- Calculate System Scale to fit all orbits within the canvas ---
        const maxOrbitRadius = Math.max(...Object.values(newOrbitState.planetOrbits).map(p => p.radius), 0);
        const desiredPaddingRatio = 0.8; // Use 80% of the canvas for the system, leaving 20% padding

        if (maxOrbitRadius > 0 && canvasDimensions.width > 0 && canvasDimensions.height > 0) {
            // Determine the maximum available radius (half of the smallest canvas dimension)
            const maxAvailableCanvasRadius = Math.min(canvasDimensions.width, canvasDimensions.height) / 2;

            // Calculate scale based on fitting the largest orbit within the padded canvas radius.
            newOrbitState.systemScale = (maxAvailableCanvasRadius * desiredPaddingRatio) / maxOrbitRadius;

            // Prevent scaling up very small systems excessively.
            newOrbitState.systemScale = Math.min(newOrbitState.systemScale, 1.0); // Max scale of 1 (no zoom-in beyond actual size)
            newOrbitState.systemScale = Math.max(newOrbitState.systemScale, 0.1); // Min scale of 0.1 (prevent disappearing)
        }

        // Store the final calculated orbit state in the ref.
        systemOrbitState.current = newOrbitState;
        console.log("StarSystemViewer: Calculated systemOrbitState:", systemOrbitState.current);

        // The drawScene effect will pick this up on the next animation frame.
    }, [activeSystem, canvasDimensions, getPlanetVisualSize]); // Recalculate if system, canvas size, or visual size logic changes.


    // --- Draw Scene Function ---
    // This function is responsible for all canvas rendering.
    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvasDimensions;

        // 1. Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 2. Draw NMS-like subtle gradient background
        const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
        backgroundGradient.addColorStop(0, '#1a1a2e'); // Dark blue/purple
        backgroundGradient.addColorStop(0.5, '#3b3b5c'); // Slightly lighter blue/purple
        backgroundGradient.addColorStop(1, '#1a1a2e'); // FIXED
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, width, height);

        // 3. Draw subtle, static background stars and nebulous clouds for atmosphere
        // (Simplified; for production, you might want to pre-calculate and store these like in StarMap)
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`; // Faint white stars
            ctx.fill();
        }
        ctx.filter = 'blur(8px)'; // Apply blur for nebula effect
        ctx.fillStyle = 'rgba(100, 100, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(width * 0.2, height * 0.3, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 100, 100, 0.05)';
        ctx.beginPath();
        ctx.arc(width * 0.7, height * 0.8, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none'; // IMPORTANT: Reset filter after drawing blurs!

        if (!activeSystem) return; // Don't draw if no active system

        // Save context state before applying transforms for the system view.
        ctx.save();
        // Translate to the center of the canvas.
        ctx.translate(width / 2, height / 2);
        // Apply the calculated system-wide scale.
        ctx.scale(systemOrbitState.current.systemScale, systemOrbitState.current.systemScale);

        // --- Draw the Star ---
        ctx.beginPath();
        ctx.arc(0, 0, activeSystem.starSize || 15, 0, Math.PI * 2);
        ctx.fillStyle = activeSystem.starColor || '#FFD700'; // Default to gold
        ctx.shadowBlur = 20; // Star glow effect
        ctx.shadowColor = activeSystem.starColor || '#FFD700';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for subsequent drawings

        // --- Draw Planets and Moons ---
        const planets = activeSystem.planets || [];
        planets.forEach(planet => {
            // --- Crucial ID check for planets (drawing - using planet.planetId) ---
            if (planet.planetId === undefined || planet.planetId === null) {
                console.warn("StarSystemViewer: Skipping drawing planet due to missing planetId:", planet);
                return; // Skip drawing this planet
            }

            // Retrieve pre-calculated orbit data for this planet. (using planet.planetId)
            const planetOrbitData = systemOrbitState.current.planetOrbits[planet.planetId];
            if (!planetOrbitData) {
                // This means the planet was likely skipped during the orbit calculation due to a missing ID.
                console.warn(`StarSystemViewer: No orbit data found for planet ID '${planet.planetId}'. Skipping drawing.`);
                return;
            }

            // Update planet angle for animation (this mutates the ref directly for efficiency)
            planetOrbitData.angle += planetOrbitData.speed;

            // Calculate planet's current position based on its orbit.
            const planetX = Math.cos(planetOrbitData.angle) * planetOrbitData.radius;
            const planetY = Math.sin(planetOrbitData.angle) * planetOrbitData.radius;

            // Draw orbit path for planet (faint circle around the star)
            ctx.beginPath();
            ctx.arc(0, 0, planetOrbitData.radius, 0, Math.PI * 2);
            ctx.strokeStyle = (planet.color || '#FFFFFF') + '33'; // Semi-transparent white
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw the planet itself
            ctx.beginPath();
            ctx.arc(planetX, planetY, getPlanetVisualSize(planet), 0, Math.PI * 2);
            ctx.fillStyle = planet.color || '#8888AA'; // Default planet color
            ctx.fill();

            // Draw planet label (positioned above the planet) (using planet.planetId)
            ctx.fillStyle = '#FFFFFF';
            // Use a generic monospace font for now, or import a specific NMS-like font
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(planet.planetName || `Planet ${planet.planetId}`, planetX, planetY - getPlanetVisualSize(planet) - 10);

            // --- Draw Moons for this Planet ---
            if (planet.moons && planet.moons.length > 0) {
                planet.moons.forEach(moon => {
                    // --- Crucial ID check for moons (using moon.moonId) ---
                    if (moon.moonId === undefined || moon.moonId === null) {
                        console.warn(`StarSystemViewer: Skipping drawing moon of planet ${planet.planetId} due to missing moonId:`, moon);
                        return; // Skip drawing this moon
                    }

                    // Retrieve pre-calculated orbit data for this moon. (using moon.moonId)
                    const moonOrbitData = planetOrbitData.moons[moon.moonId];
                    if (!moonOrbitData) {
                        console.warn(`StarSystemViewer: No orbit data found for moon ID '${moon.moonId}' (planet ${planet.planetId}). Skipping drawing.`);
                        return;
                    }

                    // Update moon angle for animation
                    moonOrbitData.angle += moonOrbitData.speed;

                    // Calculate moon's position relative to its parent planet.
                    const moonX = planetX + Math.cos(moonOrbitData.angle) * moonOrbitData.radius;
                    const moonY = planetY + Math.sin(moonOrbitData.angle) * moonOrbitData.radius;

                    // Draw moon orbit path (faint circle around the parent planet)
                    ctx.beginPath();
                    ctx.arc(planetX, planetY, moonOrbitData.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = (moon.moonColor || '#CCCCCC') + '22'; // Use moon.moonColor if available, else default
                    ctx.lineWidth = 0.5;
                    ctx.stroke();

                    // Draw the moon itself
                    ctx.beginPath();
                    ctx.arc(moonX, moonY, getPlanetVisualSize(moon), 0, Math.PI * 2);
                    ctx.fillStyle = moon.moonColor || '#BBBBBB'; // Use moon.moonColor if available, else default
                    ctx.fill();

                    // Moon label (optional, can be too cluttered) (NOW USING moon.moonName)
                    // If you enable this, make sure 'moonName' is consistently available.
                    ctx.fillStyle = '#CCCCCC';
                    ctx.font = '10px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(moon.moonName || `Moon ${moon.moonId}`, moonX, moonY - getPlanetVisualSize(moon) - 5);
                });
            }
        });

        // Restore context to remove system-wide transforms before drawing UI elements.
        ctx.restore();


        // --- Top-left UI elements (NMS-like system info) ---
        // This is drawn directly on the canvas for simplicity. For complex UI, use HTML/CSS overlays.
        if (activeSystem) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; // Semi-transparent black background for text
            ctx.fillRect(10, 10, 260, 100); // Adjust size as needed

            ctx.fillStyle = '#00ff88'; // NMS-like green accent color
            ctx.font = '20px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(activeSystem.name || 'Unnamed System', 20, 35);

            ctx.font = '14px monospace';
            ctx.fillStyle = '#FFFFFF';
            // Assuming activeSystem has a 'moonsCount' property calculated or available.
            // If not, you'd need to calculate it here:
            const totalMoons = (activeSystem.planets || []).reduce((acc, p) => acc + (p.moons ? p.moons.length : 0), 0);
            ctx.fillText(`${planets.length} PLANETS / ${totalMoons} MOON(S)`, 20, 60);

            // Example of NMS style icons (requires a font like "Material Symbols Outlined" loaded via Google Fonts)
            // ctx.font = '24px "Material Symbols Outlined"';
            // ctx.fillText('☉', 20, 90); // Sun/star icon
            // ctx.fillText('🪐', 50, 90); // Planet icon
        }

    }, [activeSystem, canvasDimensions, getPlanetVisualSize]); // Re-draw if system, dimensions, or visual size logic changes.


    // --- Animation Loop ---
    // This effect manages the requestAnimationFrame loop for continuous drawing.
    useEffect(() => {
        const animate = () => {
            if (activeSystem) { // Only animate if a system is currently active
                drawScene(); // Call the drawing function
            }
            animationFrameId.current = requestAnimationFrame(animate); // Request next frame
        };

        animate(); // Start the animation loop

        // Cleanup: cancel the animation frame when the component unmounts or activeSystem changes.
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [drawScene, activeSystem]); // Depend on drawScene and activeSystem.

    return (
        <div className="star-system-viewer w-full h-full relative">
            <button
                onClick={onClose}
                className="absolute top-4 left-4 z-20 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center space-x-2"
            >
                {/* Consider adding a Material Symbols icon here if you include the font: */}
                {/* <span className="material-symbols-outlined">arrow_back</span> */}
                <span>Back to Galaxy Map</span>
            </button>
            <canvas ref={canvasRef} className="w-full h-full block"></canvas>
            {/* Additional HTML UI overlays could be placed here if not drawn on canvas */}
        </div>
    );
};

export default StarSystemViewer;