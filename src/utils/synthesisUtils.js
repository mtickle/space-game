import { synthesizePlanetarySystem } from '@utils/planetUtils';
import { saveStarSystemToStorage } from '@utils/storageUtils';

export function synthesizeStarSystem(star) {
    if (!star || !star.id || !star.name) {
        console.warn('[Synthesis] Invalid star object:', star);
        return null;
    }

    const planets = synthesizePlanetarySystem(star.name, star.id);

    if (!planets || !Array.isArray(planets)) {
        console.warn('[Synthesis] Failed to generate planets for star:', star.name);
        return null;
    }

    const catalogedFlora = planets.flatMap(p => p.floraList || []);
    const catalogedFauna = planets.flatMap(p => p.faunaList || []);

    const starSystem = {
        id: star.id,
        name: star.name,
        planets,
        catalogedFauna,
        catalogedFlora,
        version: 1,
    };

    console.log('[Synthesis] Star system generated:', starSystem);

    saveStarSystemToStorage(starSystem);

    return starSystem;
}

