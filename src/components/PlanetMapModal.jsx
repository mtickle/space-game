
import { useEffect, useRef } from 'react';

const PlanetMapModal = ({ planet, onClose }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = 300;
        const height = 300;

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Background texture by planet type
        const gradients = {
            'Rocky': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Gas Giant': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Ice World': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Exotic': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Oceanic': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Volcanic': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Barren': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Crystaline': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Radiated': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
            'Artificial': ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2),
        };
        gradients['Rocky'].addColorStop(0, '#A0AEC0'); gradients['Rocky'].addColorStop(1, '#718096');
        gradients['Gas Giant'].addColorStop(0, '#F6AD55'); gradients['Gas Giant'].addColorStop(1, '#ED8936');
        gradients['Ice World'].addColorStop(0, '#90CDF4'); gradients['Ice World'].addColorStop(1, '#4299E1');
        gradients['Exotic'].addColorStop(0, '#ED64A6'); gradients['Exotic'].addColorStop(1, '#D53F8C');
        gradients['Oceanic'].addColorStop(0, '#63B3ED'); gradients['Oceanic'].addColorStop(1, '#2B6CB0');
        gradients['Volcanic'].addColorStop(0, '#FC8181'); gradients['Volcanic'].addColorStop(1, '#E53E3E');
        gradients['Barren'].addColorStop(0, '#CBD5E0'); gradients['Barren'].addColorStop(1, '#A0AEC0');
        gradients['Crystaline'].addColorStop(0, '#B794F4'); gradients['Crystaline'].addColorStop(1, '#9F7AEA');
        gradients['Radiated'].addColorStop(0, '#FBB6CE'); gradients['Radiated'].addColorStop(1, '#F687B3');
        gradients['Artificial'].addColorStop(0, '#F0E68C'); gradients['Artificial'].addColorStop(1, '#D4AF37');

        ctx.fillStyle = gradients[planet.type] || gradients['Rocky'];
        ctx.fillRect(0, 0, width, height);

        // Random settlements (5-15)
        const numSettlements = Math.floor(Math.random() * 11) + 5;
        planet.settlements?.forEach((settlement, index) => {
            const x = Math.random() * (width - 20) + 10;
            const y = Math.random() * (height - 20) + 10;
            ctx.beginPath();
            ctx.arc(x, y, settlement.isCapital ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = settlement.isCapital ? '#FFFF00' : '#FFFFFF';
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.font = '10px monospace';
            ctx.fillText(settlement.name + (settlement.isCapital ? ' *' : ''), x - 20, y - 5);
        });

        // Random plots (2-5)
        const numPlots = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < numPlots; i++) {
            const x = Math.random() * (width - 50) + 25;
            const y = Math.random() * (height - 50) + 25;
            const w = Math.random() * 30 + 20;
            const h = Math.random() * 30 + 20;
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
        }
    }, [planet]);

    if (!planet?.settlements) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-4 rounded-lg shadow-[0_0-10px_#0f0] relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-red-400 hover:text-red-300">X</button>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{planet.name} Map</h3>
                <canvas ref={canvasRef} className="border-2 border-green-500" />
            </div>
        </div>
    );
};

export default PlanetMapModal;