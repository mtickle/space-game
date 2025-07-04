import { useEffect, useRef } from 'react';

const PlanetMapModal = ({ planet, onClose }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Save settlement coordinates to localStorage after first assignment
        let updated = false;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = 500;
        const height = 500;
        const minDistance = 30; // Minimum distance between settlements
        const maxAttempts = 100; // Maximum attempts to reposition a settlement

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

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
        ctx.fillStyle = gradients[planet.type] || gradients['Rocky'];
        ctx.fill();

        // Function to check if two settlements are too close
        const isTooClose = (x1, y1, x2, y2, minDist) => {
            const dx = x1 - x2;
            const dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy) < minDist;
        };

        // Function to check if a point is within the planet's circular boundary
        const isWithinBounds = (x, y, centerX, centerY, maxRadius) => {
            const dx = x - centerX;
            const dy = y - centerY;
            return Math.sqrt(dx * dx + dy * dy) <= maxRadius;
        };

        // Assign coordinates to settlements
        planet.settlements?.forEach((settlement, index) => {
            if (!settlement.mapX || !settlement.mapY) {
                let attempts = 0;
                let x, y;
                do {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * (width / 2 - 20);
                    x = width / 2 + radius * Math.cos(angle);
                    y = height / 2 + radius * Math.sin(angle);
                    attempts++;
                    // Check against all previously placed settlements
                    const overlaps = planet.settlements.some((other, i) => {
                        if (i >= index || !other.mapX || !other.mapY) return false;
                        return isTooClose(x, y, other.mapX, other.mapY, minDistance);
                    });
                    if (!overlaps && isWithinBounds(x, y, width / 2, height / 2, width / 2 - 20)) {
                        settlement.mapX = x;
                        settlement.mapY = y;
                        updated = true;
                        break;
                    }
                } while (attempts < maxAttempts);
                if (attempts >= maxAttempts) {
                    console.warn(`Could not place settlement ${settlement.name} without overlap`);
                    // Fallback: Place at a default position
                    settlement.mapX = width / 2;
                    settlement.mapY = height / 2;
                    updated = true;
                }
            }
            const x = settlement.mapX;
            const y = settlement.mapY;

            ctx.beginPath();
            ctx.arc(x, y, settlement.isCapital ? 5 : 3, 0, Math.PI * 2);
            ctx.fillStyle = settlement.isCapital ? '#FFFF00' : '#FFFFFF';
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.font = '14px monospace';
            ctx.fillText(settlement.name, x + 10, y + 5);
        });

        if (updated) {
            try {
                const storedStar = JSON.parse(localStorage.getItem(`stars_sector_${Math.floor((planet.parentX || 0) / 500)},${Math.floor((planet.parentY || 0) / 500)}`)) || [];
                const updatedStar = storedStar.find(s => s.name === planet.parentStar);
                if (updatedStar) {
                    const p = updatedStar.planets?.find(p => p.name === planet.name);
                    if (p) p.settlements = planet.settlements;
                    localStorage.setItem(`stars_sector_${Math.floor((planet.parentX || 0) / 500)},${Math.floor((planet.parentY || 0) / 500)}`, JSON.stringify(storedStar));
                }
            } catch (e) {
                console.warn('Failed to persist settlement map data', e);
            }
        }
    }, [planet]);

    if (!planet?.settlements) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-4 rounded-lg shadow-[0_0-10px_#0f0] relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-red-400 hover:text-red-300">X</button>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{planet.name} Map</h3>
                <canvas ref={canvasRef} className="border-2 border-black rounded-full" />
            </div>
        </div>
    );
};

export default PlanetMapModal;