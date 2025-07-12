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

// Compress star data to reduce storage size
const compressStars = (stars) => {
    return stars.map(star => ({
        name: star.name,
        x: star.x,
        y: star.y,
        size: star.size,
        color: star.color,
        type: star.type,
        temp: star.temp,
        faction: star.faction ? { name: star.faction.name, color: star.faction.color } : null,
        // Minimal planets data
        planets: star.planets ? star.planets.map(p => ({ name: p.name, orbitRadius: p.orbitRadius })) : []
    }));
};

export const useLazyStarField = ({ offsetX, offsetY, canvasWidth, canvasHeight, scale, seed = 42 }) => {
    const [stars, setStars] = useState([]);
    const loadedSectors = useRef(new Set());
    const rng = useRef(mulberry32(seed));

    useEffect(() => {
        if (!canvasWidth || !canvasHeight) return;

        const visibleSectors = getVisibleSectors(offsetX, offsetY, canvasWidth, canvasHeight, scale);

        // Clear unused sectors to free space
        const currentSectors = new Set(visibleSectors);
        loadedSectors.current.forEach(key => {
            if (!currentSectors.has(key)) {
                const [sx, sy] = key.split(',').map(Number);
                localStorage.removeItem(`stars_sector_${sx}_${sy}`);
                loadedSectors.current.delete(key);
            }
        });

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
                    // Check quota before saving
                    const checkStorage = () => {
                        try {
                            const testKey = 'testQuota';
                            const testData = new Array(1024 * 1024).join('x'); // 1MB test
                            localStorage.setItem(testKey, testData);
                            localStorage.removeItem(testKey);
                            return true;
                        } catch (e) {
                            return false;
                        }
                    };

                    if (checkStorage()) {
                        const compressedStars = compressStars(newStars);
                        const dataString = JSON.stringify(compressedStars);
                        if (dataString.length < 1024 * 1024 * 4) { // Approx 4MB limit per sector
                            localStorage.setItem(localKey, dataString);
                        } else {
                            console.warn(`Sector ${localKey} exceeds 4MB, not saved. Consider reducing data or using IndexedDB.`);
                        }
                    }
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
                // Retry with compression
                const compressedStars = compressStars(newStars);
                localStorage.setItem(localKey, JSON.stringify(compressedStars)); // Try again, may still fail
            }

            setStars(prev => {
                const existing = prev.filter(s => {
                    const [ex, ey] = getSectorKey(s.x, s.y).split(',').map(Number);
                    return ex !== sx || ey !== sy;
                });
                return [...existing, ...newStars];
            });
            loadedSectors.current.add(key);
        });
    }, [offsetX, offsetY, canvasWidth, canvasHeight, scale, seed]);

    return stars;
};

// Utility to reset saved galaxy
export const clearStoredGalaxy = () => {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('stars_sector_')) {
            localStorage.removeItem(key);
        }
    });
};

// Tooltip interface skeleton
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
    const localKey = `stars_sector_${sx}_${sy}`;
    const sectorStars = allStars.filter(s => Math.floor(s.x / SECTOR_SIZE) === sx && Math.floor(s.y / SECTOR_SIZE) === sy);
    try {
        const compressedStars = compressStars(sectorStars);
        localStorage.setItem(localKey, JSON.stringify(compressedStars));
    } catch (e) {
        console.warn(`Error saving star to ${localKey}:`, e);
    }
};