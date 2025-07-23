// saveStarToLocalStorage.js
export function isStarSystemHydrated(starId) {
    const systems = JSON.parse(localStorage.getItem('savedStarSystems') || '[]');
    return systems.some(system => system.id === starId);
}

// export function getHydratedStarSystem(starId) {
//     const systems = JSON.parse(localStorage.getItem('savedStarSystems') || '[]');
//     return systems.find(system => system.id === starId) || null;
// }

export const isHydrated = (id) =>
    !!localStorage.getItem(`hydrated_star_${id}`);

export const getHydratedStarSystem = (id) => {
    const raw = localStorage.getItem(`hydrated_star_${id}`);
    return raw ? JSON.parse(raw) : null;
};

export const getAllHydratedSystems = () => {
    return JSON.parse(localStorage.getItem('savedStarSystems') || '[]');
};


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

    const existingRaw = JSON.parse(localStorage.getItem('savedStarSystems') || '[]');
    const existing = existingRaw.filter(s => s && s.id); // <-- safety filter

    const updated = existing.filter(s => s.id !== id);
    updated.push(starSystem);

    localStorage.setItem('savedStarSystems', JSON.stringify(updated));
};



export const saveHydratedStarSystem = (starSystem) => {
    if (!starSystem || typeof starSystem !== 'object' || !starSystem.id || !starSystem.name) {
        console.warn('[Storage] Invalid star system passed to saveHydratedStarSystem:', starSystem);
        return;
    }

    // Save full object by ID
    localStorage.setItem(`hydrated_star_${starSystem.id}`, JSON.stringify(starSystem));

    // Optionally also store it in a full array
    const existingRaw = JSON.parse(localStorage.getItem('savedStarSystems') || '[]');
    const filtered = existingRaw.filter(s => s?.id !== starSystem.id);
    filtered.push(starSystem);
    localStorage.setItem('savedStarSystems', JSON.stringify(filtered));

    // Track it in visited stars
    const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
    if (!visited.includes(starSystem.name)) {
        visited.push(starSystem.name);
        localStorage.setItem('visitedStars', JSON.stringify(visited));
    }

    console.log(`[Storage] Hydrated star system saved: ${starSystem.name}`);
};
