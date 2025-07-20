// saveStarToLocalStorage.js

export const saveStarToLocalStorage = (star, stars) => {
    if (!star || !star.name) return;

    // Save the updated star itself
    localStorage.setItem(`star_${star.name}`, JSON.stringify(star));

    // Also update the global visited list if not already in it
    const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
    if (!visited.includes(star.name)) {
        visited.push(star.name);
        localStorage.setItem('visitedStars', JSON.stringify(visited));
    }

    // Optionally update a star summary list (e.g., name and coords only) here if needed
};


export const saveStarSystemToStorage = (starSystem) => {
    if (!starSystem || typeof starSystem !== 'object') {
        console.warn('[Storage] Invalid star system:', starSystem);
        return;
    }

    const { id } = starSystem;
    if (!id) {
        console.warn('[Storage] Star system missing ID:', starSystem);
        return;
    }

    const existing = JSON.parse(localStorage.getItem('savedStarSystems') || '[]');
    const updated = existing.filter(s => s.id !== id);
    updated.push(starSystem);
    localStorage.setItem('savedStarSystems', JSON.stringify(updated));
};