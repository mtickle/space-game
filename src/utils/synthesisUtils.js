import { synthesizePlanetarySystem } from '@utils/planetUtils';

//import { generateStarType } from '@utils/starTypeUtils';
import { generateFullStarProfile } from '@utils/starUtils';
//import { generateStarTemperature } from '@utils/starTypeUtils';
//import { generateStarDescription } from '@utils/starTypeUtils';
import { generateFaction } from '@utils/factionUtils';


export function synthesizeStarSystem(star) {
    if (!star || !star.id || !star.name) {
        // console.warn('[Synthesis] Invalid star object:', star);
        return null;
    }

    //--- Let's make babies, baby.
    const planets = synthesizePlanetarySystem(star.name, star.id);


    if (!planets || !Array.isArray(planets)) {
        // console.warn('[Synthesis] Failed to generate planets for star:', star.name);
        return null;
    }

    const catalogedFlora = planets.flatMap(p => p.floraList || []);
    const catalogedFauna = planets.flatMap(p => p.faunaList || []);
    const { type, temp, description } = generateFullStarProfile();
    const faction = generateFaction(); // { name, symbol }



    const starSystem = {
        id: star.id,
        name: star.name,
        x: star.x,
        y: star.y,
        size: star.size,
        type,
        temp,
        description,
        faction,
        planets,
        catalogedFauna,
        catalogedFlora,
        version: 1,
        faction
    };

    //saveStarSystemToStorage(starSystem);

    return starSystem;
}

