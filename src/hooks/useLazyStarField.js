// hooks/useLazyStarField.js

import { useEffect, useRef, useState } from 'react';
import { generateStarSystem } from '../utils/systemUtils';

const SECTOR_SIZE = 500;

const getSectorKey = (x, y) => {
    const sx = Math.floor(x / SECTOR_SIZE);
    const sy = Math.floor(y / SECTOR_SIZE);
    return `${sx},${sy}`;
};

const getVisibleSectors = (offsetX, offsetY, canvasWidth, canvasHeight, scale) => {
    const sectorKeys = new Set();
    const viewLeft = (-canvasWidth / 2 - offsetX) / scale;
    const viewRight = (canvasWidth / 2 - offsetX) / scale;
    const viewTop = (-canvasHeight / 2 - offsetY) / scale;
    const viewBottom = (canvasHeight / 2 - offsetY) / scale;

    for (let x = viewLeft; x < viewRight; x += SECTOR_SIZE) {
        for (let y = viewTop; y < viewBottom; y += SECTOR_SIZE) {
            sectorKeys.add(getSectorKey(x, y));
        }
    }

    return [...sectorKeys];
};

export const useLazyStarField = ({ offsetX, offsetY, canvasWidth, canvasHeight, scale }) => {
    const [stars, setStars] = useState([]);
    const loadedSectors = useRef(new Set());

    useEffect(() => {
        if (!canvasWidth || !canvasHeight) return;

        const visibleSectors = getVisibleSectors(offsetX, offsetY, canvasWidth, canvasHeight, scale);

        visibleSectors.forEach(key => {
            if (loadedSectors.current.has(key)) return;

            // Parse sector key back into coordinates
            const [sx, sy] = key.split(',').map(Number);
            const newStars = Array.from({ length: 5 }, (_, i) => {
                const s = generateStarSystem(i);
                return {
                    ...s,
                    x: sx * SECTOR_SIZE + Math.random() * SECTOR_SIZE,
                    y: sy * SECTOR_SIZE + Math.random() * SECTOR_SIZE,
                };
            });

            setStars(prev => [...prev, ...newStars]);
            loadedSectors.current.add(key);
        });
    }, [offsetX, offsetY, canvasWidth, canvasHeight, scale]);

    return stars;
};
