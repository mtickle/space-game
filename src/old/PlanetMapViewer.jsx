// PlanetMapViewer.jsx
import { useEffect, useRef } from 'react';

const PlanetMapViewer = ({ planet, goBack }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!planet || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = 500;
        const height = 500;
        canvas.width = width;
        canvas.height = height;

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2 - 10;

        // Background gradient by type
        const gradients = {
            'Rocky': ['#A0AEC0', '#718096'],
            'Gas Giant': ['#F6AD55', '#ED8936'],
            'Ice World': ['#90CDF4', '#4299E1'],
            'Exotic': ['#ED64A6', '#D53F8C'],
            'Oceanic': ['#63B3ED', '#2B6CB0'],
            'Volcanic': ['#FC8181', '#E53E3E'],
            'Barren': ['#CBD5E0', '#A0AEC0'],
            'Crystaline': ['#B794F4', '#9F7AEA'],
            'Radiated': ['#FBB6CE', '#F687B3'],
            'Artificial': ['#F0E68C', '#D4AF37'],
        };

        const [innerColor, outerColor] = gradients[planet.type] || gradients['Rocky'];
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Place settlements
        const placed = [];
        const minDist = 30;

        planet.settlements?.forEach((s, i) => {
            let x, y, tries = 0;
            do {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * (radius - 20);
                x = centerX + dist * Math.cos(angle);
                y = centerY + dist * Math.sin(angle);
                tries++;
            } while (
                placed.some(p => Math.hypot(p.x - x, p.y - y) < minDist) && tries < 50
            );

            placed.push({ x, y });

            ctx.beginPath();
            ctx.arc(x, y, s.isCapital ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = s.isCapital ? '#FFFF00' : '#FFFFFF';
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = '12px monospace';
            ctx.fillText(s.name, x + 8, y + 4);
        });
    }, [planet]);

    return (
        <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-start p-4 overflow-auto">
            <button
                onClick={goBack}
                className="self-start mb-4 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
            >
                ← Back to Star System
            </button>
            <h2 className="text-xl font-bold text-yellow-400 mb-2">{planet.name}</h2>
            <p className="text-gray-400 mb-4">{planet.type} planet with {planet.settlements?.length || 0} settlements</p>
            <canvas ref={canvasRef} className="border-2 border-white rounded-full shadow-lg" />
        </div>
    );
};

export default PlanetMapViewer;
