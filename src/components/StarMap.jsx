import { getConditionsForPlanetType } from '@utils/conditionUtils.js';
import { generateMineral } from '@utils/mineralUtils';
import { planetTypes } from '@utils/planetUtils.js';
import { useEffect, useRef, useState } from 'react';
import Header from './Header';
import PlanetMapModal from './PlanetMapModal';
import Sidebar from './Sidebar';

const StarMap = ({ stars }) => {
    const canvasRef = useRef(null);
    const [selectedStar, setSelectedStar] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [mapState, setMapState] = useState({ offsetX: 0, offsetY: 0, scale: 1, clickOffsetX: 0, clickOffsetY: 0 });
    const [redrawTrigger, setRedrawTrigger] = useState(false);
    const [factionFilter, setFactionFilter] = useState('All');
    const [starTypeFilter, setStarTypeFilter] = useState('All');
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [animationFrameId, setAnimationFrameId] = useState(null);

    useEffect(() => {
        //--- In the beginning God created the heavens and the earth.
        console.log('Processing star systems for initialization');
        stars.forEach(star => {

            //--- A Star system is born!
            console.log(`System ${star.name} born at coordinates ${star.x},${star.y}`);

            if (!star.planets || star.planets.length === 0) {
                console.log(`Generating planets for star: ${star.name}`);
                star.planets = generateOrEnhancePlanets(star);
                console.log(`Initialized ${star.planets.length} planets for ${star.name}`);
            } else {
                //There are already planets ...
                //console.log(`Star ${star.name} already has ${star.planets.length} planets, skipping generation`);
            }
            if (isNaN(star.x) || isNaN(star.y)) {
                console.warn(`Invalid coordinates for star ${star.name}: x=${star.x}, y=${star.y}`);
                star.x = star.x || 0; // Default to 0 if undefined
                star.y = star.y || 0;
            }
        });
        console.log(`Completed processing ${stars.length} star systems`);
    }, [stars]);


    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
                setRedrawTrigger(prev => !prev);
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, []);


    // useEffect(() => {
    //     const animateOrbits = () => {
    //         if (selectedStar) {
    //             const updatedPlanets = selectedStar.planets.map(planet => ({
    //                 ...planet,
    //                 angle: (planet.angle + 0.01) % (Math.PI * 2)
    //             }));
    //             setSelectedStar(prev => prev ? { ...prev, planets: updatedPlanets } : prev);
    //             setAnimationFrameId(requestAnimationFrame(animateOrbits));
    //         }
    //     };
    //     if (selectedStar && !animationFrameId) {
    //         setAnimationFrameId(requestAnimationFrame(animateOrbits));
    //     } else if (!selectedStar && animationFrameId) {
    //         cancelAnimationFrame(animationFrameId);
    //         setAnimationFrameId(null);
    //     }
    //     return () => animationFrameId && cancelAnimationFrame(animationFrameId);
    // }, [selectedStar, animationFrameId]);


    //--- Take us to sector 0,0
    const handleResetView = () => {
        console.log('Resetting view to coordinates (0,0)');
        setOffsetX(0);
        setOffsetY(0);
    };


    const generateOrEnhancePlanets = (star) => {
        console.log('Generating or enhancing planets for star:', star.name);
        const planetCount = Math.floor(Math.random() * 3) + 1;
        let planets = star.planets || [];

        // Function to select a planet type based on weights
        const getWeightedRandomType = () => {
            const totalWeight = planetTypes.reduce((sum, { weight }) => sum + weight, 0);
            let random = Math.random() * totalWeight;
            for (const { type, weight } of planetTypes) {
                random -= weight;
                if (random <= 0) return type;
            }
            return planetTypes[planetTypes.length - 1].type; // Fallback
        };

        if (!planets.length) {
            for (let i = 0; i < planetCount; i++) {
                const type = getWeightedRandomType();
                const color = planetTypes.find(p => p.type === type).color;
                const planet = {
                    name: `Planet - ${i + 1}`,
                    type,
                    orbitRadius: 50 + i * 30,
                    size: 1 + Math.random() * 3, // Reduced range: 1 to 4
                    color,
                    angle: Math.random() * Math.PI * 2,
                    minerals: generateMineralsForPlanet(type),
                    ...getConditionsForPlanetType(type)
                };
                planets.push(planet);
            }
        } else {
            planets = planets.map((planet, i) => {
                const type = planet.type || getWeightedRandomType();
                const color = planetTypes.find(p => p.type === type)?.color || '#00FF00';
                return {
                    ...planet,
                    color,
                    orbitRadius: planet.orbitRadius ?? 50 + i * 30,
                    angle: typeof planet.angle === 'number' ? planet.angle : Math.random() * Math.PI * 2,
                    size: Math.min(planet.size ?? (1 + Math.random() * 3), 4),
                    minerals: generateMineralsForPlanet(type),
                    ...getConditionsForPlanetType(type)
                };
            });
        }
        console.log(`Completed star system for ${star.name} with ${planets.length} planets`);
        return planets;
    };

    const generateMineralsForPlanet = (planetType) => {
        const mineralCount = Math.floor(Math.random() * 3) + 1;
        const minerals = [];
        for (let i = 0; i < mineralCount; i++) {
            const mineral = generateMineral(planetType);
            if (mineral && mineral.elements && mineral.elements.length > 0) {
                minerals.push(mineral);
            } else {
                console.warn('Invalid mineral generated, skipping:', mineral);
            }
        }
        return minerals;
    };

    const enhanceSelectedStar = (star) => {
        if (star) {
            console.log(`Enhancing selected star system: ${star.name}`);
            return { ...star, planets: generateOrEnhancePlanets(star) };
        }
        return star;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1A202C';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
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

            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${12 / scale}px Courier New, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(star.name, star.x, star.y - star.size - 6 / scale);

            const drawPlanets = (planets) => {
                if (!planets || planets.length === 0) {
                    console.warn('No planets to draw for', star.name);
                    return;
                }
                planets.forEach((planet) => {
                    if (planet.angle === undefined) {
                        //console.warn('Undefined angle for planet', planet.name, 'setting to 0');
                        planet.angle = 0;
                    }
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, planet.orbitRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = planet.color + '33';
                    ctx.lineWidth = 0.5 / scale;
                    ctx.stroke();

                    const px = star.x + Math.cos(planet.angle) * planet.orbitRadius;
                    const py = star.y + Math.sin(planet.angle) * planet.orbitRadius;
                    if (isNaN(px) || isNaN(py)) {
                        console.error('Invalid planet coordinates for', planet.name, 'star.x:', star.x, 'star.y:', star.y, 'angle:', planet.angle, 'orbitRadius:', planet.orbitRadius);
                        return;
                    }
                    ctx.beginPath();
                    ctx.arc(px, py, planet.size, 0, Math.PI * 2);
                    ctx.fillStyle = planet.color;
                    ctx.fill();
                    //console.log('Drawing planet:', planet.name, 'at', { x: px, y: py }, 'color:', planet.color);
                });
            };

            if (hoveredStar?.name === star.name) drawPlanets(star.planets);
            if (selectedStar?.name === star.name) drawPlanets(selectedStar.planets);
        });

        ctx.restore();
    }, [stars, selectedStar, hoveredStar, offsetX, offsetY, scale, redrawTrigger, factionFilter]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - canvas.width / 2 - offsetX) / scale;
        const mouseY = (e.clientY - rect.top - canvas.height / 2 - offsetY) / scale;

        if (isDragging) {
            setOffsetX(offsetX + (e.clientX - dragStart.x) / scale);
            setOffsetY(offsetY + (e.clientY - dragStart.y) / scale);
            setDragStart({ x: e.clientX, y: e.clientY });
        } else {
            const hovered = stars.find(star => {
                const dx = mouseX - star.x;
                const dy = mouseY - star.y;
                return Math.sqrt(dx * dx + dy * dy) < star.size + 4;
            });
            setHoveredStar(hovered ? { ...hovered, clientX: e.clientX - rect.left, clientY: e.clientY - rect.top } : null);
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e) => {
        const zoomSpeed = 0.1;
        const newScale = Math.min(Math.max(scale - e.deltaY * zoomSpeed * 0.001, 0.5), 2);
        setScale(newScale);
    };

    const handleClick = (e) => {
        if (!isDragging) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left - canvas.width / 2 - offsetX) / scale;
            const mouseY = (e.clientY - rect.top - canvas.height / 2 - offsetY) / scale;

            const clickedStar = stars.find(star => {
                const dx = mouseX - star.x;
                const dy = mouseY - star.y;
                return Math.sqrt(dx * dx + dy * dy) < star.size + 4;
            });

            if (clickedStar) {
                const screenX = clickedStar.x * scale + offsetX + canvas.width / 2;
                const screenY = clickedStar.y * scale + offsetY + canvas.height / 2;
                const clickOffsetX = e.clientX - screenX;
                const clickOffsetY = e.clientY - screenY;
                setMapState({ offsetX, offsetY, scale, clickOffsetX, clickOffsetY });
                setSelectedStar(enhanceSelectedStar(clickedStar));
            } else {
                setSelectedStar(null);
                setSelectedPlanet(null);
            }
        }
    };

    const handleMapClick = (planet) => {
        if (planet.settlements) {
            setSelectedPlanet(planet);
        }
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
                <Sidebar selectedStar={selectedStar} onMapClick={handleMapClick} />
                <div className="flex flex-1 items-center justify-center relative">
                    <div className="relative w-full h-full border-black-500 shadow-[0_0-10px_#0f0]">
                        <canvas
                            ref={canvasRef}
                            className="bg-black cursor-pointer w-full h-full block"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onWheel={handleWheel}
                            onClick={handleClick}
                        />
                    </div>

                    {hoveredStar && !selectedStar && (
                        <div
                            className="absolute bg-black bg-opacity-90 p-2 rounded-lg border-2 border-orange-400 shadow-[0_0-5px_#ff0] text-sm z-10"
                            style={{
                                left: Math.min(hoveredStar.clientX + 30, window.innerWidth - 220),
                                top: Math.min(hoveredStar.clientY + 40, window.innerHeight - 120),
                            }}
                        >
                            <div className="flex items-center mb-1">
                                {hoveredStar.faction?.symbol || '⛔'}
                                <p className="text-yellow-400 font-bold"> {hoveredStar.name}</p>
                            </div>
                            <p className="text-green-400"><strong>Type:</strong> {hoveredStar.type}</p>
                            <p className="text-green-400"><strong>Temp:</strong> {hoveredStar.temp}</p>
                            <p className="text-green-400"><strong>Faction:</strong> {hoveredStar.faction?.name || 'Unknown'}</p>
                        </div>
                    )}
                </div>
            </div>
            {selectedPlanet && (
                <PlanetMapModal planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
            )}
            <div className="bg-black bg-opacity-90 border-t-2 border-green-500 p-2 flex justify-between items-center text-sm text-green-400">
                <div>
                    Coordinates: ({Math.round(offsetX)}, {Math.round(offsetY)}) | Zoom: {scale.toFixed(2)}x
                </div>
                <button
                    className="underline text-green-400 hover:text-green-200 transition-colors"
                    onClick={handleResetView}
                >
                    Return to (0,0)
                </button>
            </div>

        </div>
    );
};

export default StarMap;