// StarMap.jsx
import AdminPanel from '@components/AdminPanel';
import Sidebar from '@components/Sidebar';
import { getStarTooltip, saveStarToLocalStorage } from '@hooks/useLazyStarField';
import Footer from '@layouts/Footer';
import Header from '@layouts/Header';
import { generatePlanets } from '@utils/planetUtils';
import { useEffect, useRef, useState } from 'react';

const StarMap = ({ stars, offsetX, setOffsetX, offsetY, setOffsetY, scale, setScale, setCanvasSize }) => {
    const canvasRef = useRef(null);
    const [selectedStar, setSelectedStar] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const animationFrameRef = useRef(null);
    const [factionFilter, setFactionFilter] = useState('All');
    const [starTypeFilter, setStarTypeFilter] = useState('All');
    const [showVisited, setShowVisited] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
                setCanvasSize({ width: canvas.width, height: canvas.height });
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, [setCanvasSize]);

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

        const filteredStars = factionFilter === 'All' ? stars : stars.filter(s => s.faction?.name === factionFilter);
        const sortedStars = [...filteredStars].sort((a, b) => (a.z || 0) - (b.z || 0));

        sortedStars.forEach(star => {
            const depth = star.z ?? 0;
            const depthScale = 1 - depth;
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

            if (home.name === star.name) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size + 4 / scale, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }

            const labelScale = 1 / (scale * depthScale);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${12 * labelScale}px Courier New, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(star.name, star.x, star.y - star.size - 6 / scale);

            if (visited.includes(star.name)) {
                ctx.beginPath();
                ctx.arc(star.x, star.y - star.size - 12 / scale, 2 / scale, 0, Math.PI * 2);
                ctx.fillStyle = '#00FF00';
                ctx.fill();
            }

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
                    ctx.arc(px, py, Math.min(planet.size ?? 1.5, 4), 0, Math.PI * 2);
                    ctx.fillStyle = planet.color;
                    ctx.fill();
                });
            }
        });

        ctx.restore();

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

    useEffect(() => {
        const animate = () => {
            drawScene();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [stars, offsetX, offsetY, scale, factionFilter, selectedStar, hoveredStar]);

    const handleWheel = (e) => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoom = 1 + wheel * zoomIntensity;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - canvas.width / 2 - offsetX) / scale;
        const worldY = (mouseY - canvas.height / 2 - offsetY) / scale;

        const newScale = Math.min(Math.max(scale * zoom, 0.5), 4);
        const newOffsetX = offsetX - (worldX * newScale - worldX * scale);
        const newOffsetY = offsetY - (worldY * newScale - worldY * scale);

        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);
        setScale(newScale);
    };

    // ... Keep other handlers the same (drag, click, context, etc.)

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
                        onMouseDown={(e) => setIsDragging(true) || setDragStart({ x: e.clientX, y: e.clientY })}
                        onMouseMove={(e) => {
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
                        }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        onWheel={handleWheel}
                        onClick={(e) => {
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
                                    if (!clickedStar.planets || clickedStar.planets.length === 0) {
                                        clickedStar.planets = generatePlanets(clickedStar.name);
                                        clickedStar.planets.forEach(p => {
                                            p.angle = p.angle ?? Math.random() * Math.PI * 2;
                                        });
                                    }
                                    saveStarToLocalStorage(clickedStar, stars);
                                    setSelectedStar(clickedStar);

                                    const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
                                    if (!visited.includes(clickedStar.name)) {
                                        visited.push(clickedStar.name);
                                        localStorage.setItem('visitedStars', JSON.stringify(visited));
                                    }
                                }
                            }
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
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
                                localStorage.setItem('homeSystem', JSON.stringify({ name: clickedStar.name, x: clickedStar.x, y: clickedStar.y }));
                                alert(`${clickedStar.name} is now your home system.`);
                            }
                        }}
                    />
                </div>
            </div>
            <AdminPanel stars={stars} goToSystem={() => { }} />
            <Footer
                offsetX={offsetX}
                offsetY={offsetY}
                scale={scale}
                stars={stars}
                setOffsetX={setOffsetX}
                setOffsetY={setOffsetY}
                goToSystem={() => { }}
                goToZeroCommaZero={() => {
                    setOffsetX(0);
                    setOffsetY(0);
                }}
                setShowVisited={setShowVisited}
                showVisited={showVisited}
            />
        </div>
    );
};

export default StarMap;
