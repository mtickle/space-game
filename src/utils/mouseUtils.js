//--- Welcome to mouseUtils. Here are tools for the mouse actions.

import { saveStarToLocalStorage } from '@hooks/useLazyStarField';
import { generatePlanets } from '@utils/planetUtils';

export const createHandleMouseDown = (setIsDragging, setDragStart) => (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
};

export const createHandleMouseMove = ({
    canvasRef,
    offsetX,
    offsetY,
    scale,
    isDragging,
    setOffsetX,
    setOffsetY,
    dragStart,
    setDragStart,
    stars,
    setHoveredStar
}) => (e) => {
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


export const createHandleMouseUp = (setIsDragging) => () => setIsDragging(false);


export const createHandleWheel = (scale, setScale) => (e) => {
    const zoomSpeed = 0.1;
    const newScale = Math.min(Math.max(scale - e.deltaY * zoomSpeed * 0.001, 0.5), 2);
    setScale(newScale);
};

export const createHandleClick = ({
    isDragging,
    canvasRef,
    offsetX,
    offsetY,
    scale,
    stars,
    setSelectedStar,
}) => (e) => {
    if (isDragging) return;

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
        // Ensure planets are generated
        if (!clickedStar.planets || clickedStar.planets.length === 0) {
            clickedStar.planets = generatePlanets(clickedStar.name);
        }

        clickedStar.planets.forEach(p => {
            p.angle = p.angle ?? Math.random() * Math.PI * 2;
        });

        //--- Save this specific system for later use.
        saveStarToLocalStorage(clickedStar, stars);

        //--- Load up the SideBar.
        setSelectedStar(clickedStar);

        // Update visited list
        const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
        if (!visited.includes(clickedStar.name)) {
            visited.push(clickedStar.name);
            localStorage.setItem('visitedStars', JSON.stringify(visited));
        }
    }
};

export const createHandleContextMenu = ({
    canvasRef,
    offsetX,
    offsetY,
    scale,
    stars
}) => (e) => {
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
};
