import { getConditionsForPlanetType } from '@utils/conditionUtils.js';
import { generateMineral } from '@utils/mineralUtils';
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

    // useEffect(() => {
    //     stars.forEach(star => {
    //         if (!star.planets || star.planets.length === 0) {
    //             star.planets = generateOrEnhancePlanets(star);
    //             console.log('Initialized planets for', star.name, ':', star.planets);
    //         }
    //         if (isNaN(star.x) || isNaN(star.y)) {
    //             console.warn('Invalid coordinates for star', star.name, ': x=', star.x, 'y=', star.y);
    //             star.x = star.x || 0; // Default to 0 if undefined
    //             star.y = star.y || 0;
    //         }
    //     });
    // }, [stars]);


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



    const generateOrEnhancePlanets = (star) => {
        const planetCount = Math.floor(Math.random() * 3) + 1;
        let planets = star.planets || [];

        const typeColorMap = {
            "Gas Giant": '#FFD700',
            "Rocky": '#B87333',
            "Radiated": '#FF69B4',
            "Ice World": '#87CEEB',
            "Oceanic": '#1E90FF',
            "Volcanic": '#FF4500',
            "Barren": '#A9A9A9',
            "Exotic": '#DA70D6',
            "Crystaline": '#00FFFF',
            "Artificial": '#7FFF00'
        };

        if (!planets.length) {
            for (let i = 0; i < planetCount; i++) {
                const type = Object.keys(typeColorMap)[Math.floor(Math.random() * 10)];
                const planet = {
                    name: `Planet - ${i + 1}`,
                    type,
                    orbitRadius: 50 + i * 30,
                    size: 1 + Math.random() * 3, // Reduced range: 1 to 4
                    color: typeColorMap[type] || '#00FF00',
                    angle: Math.random() * Math.PI * 2,
                    minerals: generateMineralsForPlanet(type),
                    ...getConditionsForPlanetType(type)
                };
                planets.push(planet);
            }
        } else {
            planets = planets.map(planet => {
                const color = typeColorMap[planet.type] || '#00FF00';
                return {
                    ...planet,
                    color,
                    angle: planet.angle !== undefined ? planet.angle : Math.random() * Math.PI * 2,
                    size: Math.min(planet.size, 4), // Cap size at 4
                    minerals: generateMineralsForPlanet(planet.type),
                    ...getConditionsForPlanetType(planet.type)
                };
            });
        }
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
                        console.warn('Undefined angle for planet', planet.name, 'setting to 0');
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
                    console.log('Drawing planet:', planet.name, 'at', { x: px, y: py }, 'color:', planet.color);
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

        </div>
    );
};

export default StarMap;