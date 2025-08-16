import { useEffect, useRef, useState } from 'react';

const SECTOR_SIZE = 500; // Must match your server-side logic

// Helper function to calculate which sectors are in view
const getVisibleSectors = (offsetX, offsetY, width, height, scale) => {
    const sectors = new Set();
    const viewLeft = (-width / 2 - offsetX) / scale;
    const viewRight = (width / 2 - offsetX) / scale;
    const viewTop = (-height / 2 - offsetY) / scale;
    const viewBottom = (height / 2 - offsetY) / scale;

    const startX = Math.floor(viewLeft / SECTOR_SIZE);
    const endX = Math.floor(viewRight / SECTOR_SIZE);
    const startY = Math.floor(viewTop / SECTOR_SIZE);
    const endY = Math.floor(viewBottom / SECTOR_SIZE);

    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            sectors.add(`${x},${y}`);
        }
    }
    return [...sectors];
};

export const useApiStarField = ({ offsetX, offsetY, canvasWidth, canvasHeight, scale }) => {
    const [stars, setStars] = useState([]);
    const loadedSectors = useRef(new Set());

    useEffect(() => {
        if (!canvasWidth || !canvasHeight) return;

        // 1. Determine which sectors should be visible
        const visibleSectors = getVisibleSectors(offsetX, offsetY, canvasWidth, canvasHeight, scale);

        // 2. For each visible sector, check if we need to load it
        visibleSectors.forEach(sectorId => {
            if (!loadedSectors.current.has(sectorId)) {
                // Mark this sector as "loading" immediately to prevent duplicate calls
                loadedSectors.current.add(sectorId);
                const [sectorX, sectorY] = sectorId.split(',');

               // console.log(`Entering new sector ${sectorId}. Fetching stars...`);

                // Construct the full URL from the environment variable
                const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/generateStars?sectorX=${sectorX}&sectorY=${sectorY}`;


                // 3. Make the API call for the new sector
                fetch(apiUrl, { // <-- Use the new variable here
                    headers: {
                        'x-api-key': import.meta.env.VITE_API_KEY
                    }
                })
                    .then(res => {
                        if (!res.ok) throw new Error(`API error for sector ${sectorId}`);
                        return res.json();
                    })
                    .then(newStars => {
                        // 4. Add the new stars to our state
                        setStars(prevStars => [...prevStars, ...newStars]);
                    })
                    .catch(error => {
                        console.error(error);
                        // If the fetch fails, remove it from the set so we can try again later
                        loadedSectors.current.delete(sectorId);

                    });
            }
        });
    }, [offsetX, offsetY, canvasWidth, canvasHeight, scale]); // Re-run when the view changes

    return stars;
};