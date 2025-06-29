
import { useEffect, useRef, useState } from 'react';

const StarMap = () => {
    const canvasRef = useRef(null);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Star generation with MK classification
    const generateStars = () => {
        const classes = [
            { type: 'O', color: '#A3BFFA', temp: '>30,000K', size: 10, weight: 0.05 },
            { type: 'B', color: '#BEE3F8', temp: '10,000–30,000K', size: 8, weight: 0.1 },
            { type: 'A', color: '#EBF8FF', temp: '7,500–10,000K', size: 7, weight: 0.1 },
            { type: 'F', color: '#FEFCBF', temp: '6,000–7,500K', size: 6, weight: 0.1 },
            { type: 'G', color: '#FFFF99', temp: '5,200–6,000K', size: 5, weight: 0.15 },
            { type: 'K', color: '#FBD38D', temp: '3,700–5,200K', size: 4, weight: 0.2 },
            { type: 'M', color: '#F56565', temp: '<3,700K', size: 3, weight: 0.4 },
        ];

        const stars = [];
        for (let i = 0; i < 20; i++) {
            const rand = Math.random();
            let cumulative = 0;
            let starClass = classes[classes.length - 1];
            for (const c of classes) {
                cumulative += c.weight;
                if (rand < cumulative) {
                    starClass = c;
                    break;
                }
            }
            stars.push({
                x: Math.random() * 800 - 400,
                y: Math.random() * 600 - 300,
                type: starClass.type,
                color: starClass.color,
                temp: starClass.temp,
                size: starClass.size,
            });
        }
        return stars;
    };

    const stars = generateStars();

    // Canvas rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const draw = () => {
            ctx.fillStyle = '#1A202C';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
            ctx.scale(zoom, zoom);

            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = star.color;
                ctx.fill();
            });

            ctx.restore();
        };

        draw();
    }, [zoom, offset]);

    // Mouse interactions
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom;
        const mouseY = (e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom;

        if (isDragging) {
            setOffset({
                x: offset.x + (e.clientX - dragStart.x),
                y: offset.y + (e.clientY - dragStart.y),
            });
            setDragStart({ x: e.clientX, y: e.clientY });
        }

        const hovered = stars.find(star => {
            const dx = mouseX - star.x;
            const dy = mouseY - star.y;
            return Math.sqrt(dx * dx + dy * dy) < star.size;
        });
        setHoveredStar(hovered || null);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        setZoom(prev => Math.max(0.5, Math.min(5, prev - e.deltaY * 0.001)));
    };

    return (
        <div className="relative flex flex-col items-center text-white">
            <h1 className="text-2xl mb-4">Starweave Local Group</h1>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-700"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
            />
            {hoveredStar && (
                <div className="absolute top-10 left-10 bg-gray-800 p-4 rounded shadow-lg">
                    <p><strong>Star Type:</strong> {hoveredStar.type}</p>
                    <p><strong>Temperature:</strong> {hoveredStar.temp}</p>
                </div>
            )}
            <p className="mt-4">Scroll to zoom, click and drag to pan</p>
        </div>
    );
};

export default StarMap;
