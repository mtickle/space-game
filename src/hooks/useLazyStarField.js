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

// Deterministic seed-based PRNG
const mulberry32 = (a) => {
    return () => {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

export const useLazyStarField = ({ offsetX, offsetY, canvasWidth, canvasHeight, scale, seed = 42 }) => {
    const [stars, setStars] = useState([]);
    const loadedSectors = useRef(new Set());
    const rng = useRef(mulberry32(seed));

    useEffect(() => {
        if (!canvasWidth || !canvasHeight) return;

        const visibleSectors = getVisibleSectors(offsetX, offsetY, canvasWidth, canvasHeight, scale);

        visibleSectors.forEach(key => {
            if (loadedSectors.current.has(key)) return;

            const [sx, sy] = key.split(',').map(Number);
            const localKey = `stars_sector_${sx}_${sy}`;
            let newStars = [];

            try {
                const saved = localStorage.getItem(localKey);
                if (saved) {
                    newStars = JSON.parse(saved);
                } else {
                    newStars = Array.from({ length: 5 }, (_, i) => {
                        const s = generateStarSystem(i);
                        return {
                            ...s,
                            x: sx * SECTOR_SIZE + rng.current() * SECTOR_SIZE,
                            y: sy * SECTOR_SIZE + rng.current() * SECTOR_SIZE,
                        };
                    });

                    const safeStars = newStars.map(star => ({
                        id: star.id,
                        name: star.name,
                        x: star.x,
                        y: star.y,
                        z: star.z,
                        size: star.size,
                        color: star.color,
                        type: star.type,
                        faction: star.faction,  // Optional: if needed for color/symbol
                    }));
                    try {
                        localStorage.setItem(localKey, JSON.stringify(safeStars));
                    } catch (e) {
                        console.warn(`⚠️ Storage quota exceeded for sector ${localKey}`, e);
                    }

                    //localStorage.setItem(localKey, JSON.stringify(newStars));
                }
            } catch (e) {
                console.warn(`Error loading or generating sector ${localKey}:`, e);
                newStars = Array.from({ length: 5 }, (_, i) => {
                    const s = generateStarSystem(i);
                    return {
                        ...s,
                        x: sx * SECTOR_SIZE + rng.current() * SECTOR_SIZE,
                        y: sy * SECTOR_SIZE + rng.current() * SECTOR_SIZE,
                    };
                });
                localStorage.setItem(localKey, JSON.stringify(newStars));
            }

            setStars(prev => [...prev, ...newStars]);
            loadedSectors.current.add(key);
        });
    }, [offsetX, offsetY, canvasWidth, canvasHeight, scale, seed]);

    return stars;

    // Used to conditionally show planet animations on hover
    // Can be integrated with draw loop in StarMap.jsx
};

// Utility to reset saved galaxy
export const clearStoredGalaxy = () => {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('stars_sector_')) {
            localStorage.removeItem(key);
        }
    });
};

// Tooltip interface skeleton (to be used in StarMap component or globally)
export const getStarTooltip = (star) => {
    if (!star) return null;
    return {
        name: star.name,
        type: star.type,
        faction: star.faction?.name || 'Unknown',
        temperature: star.temp,
        planets: star.planets?.length || 0,
    };
};

// Save updated star back to localStorage sector
export const saveStarToLocalStorage = (star, allStars) => {
    const sx = Math.floor(star.x / SECTOR_SIZE);
    const sy = Math.floor(star.y / SECTOR_SIZE);
    const localKey = `stars_sector_${sx},${sy}`;
    const sectorStars = allStars.filter(s => Math.floor(s.x / SECTOR_SIZE) === sx && Math.floor(s.y / SECTOR_SIZE) === sy);
    try {
        localStorage.setItem(localKey, JSON.stringify(sectorStars));
    } catch (e) {
        console.warn(`Error saving star to ${localKey}:`, e);
    }
};
