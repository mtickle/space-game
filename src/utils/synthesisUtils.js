import { v4 as uuidv4 } from 'uuid';
//import { generateEconomy } from './economyUtils';
//import { generateResourcesForPlanet } from './resourceUtils';
//import { getRandomInt } from './randomUtils';
//import { generateSettlementsForPlanet } from './settlementUtils';
import { synthesizePlanetarySystem } from '@utils/planetUtils';

export function synthesizeStarSystem(star) {
    const starId = uuidv4();
    //const planetCount = getRandomInt(1, 6);

    const planets = synthesizePlanetarySystem(star.name, star.id)

    console.log(planets)

    // for (let i = 0; i < planetCount; i++) {
    //     const planetId = uuidv4();
    //     const typeData = getRandomItem(planetTypes);
    //     const type = typeData.type;
    //     const name = `${getPlanetNameFragment()}-${i + 1}`;

    //     const moonCount = type === 'Gas Giant' ? getRandomInt(2, 5) : getRandomInt(0, 2);
    //     const moons = Array.from({ length: moonCount }).map((_, idx) => ({
    //         id: uuidv4(),
    //         name: `${name.toLowerCase()} ${String.fromCharCode(97 + idx)}`,
    //         type: getRandomItem(['Rocky', 'Metallic', 'Carbonaceous', 'Ice World']),
    //         flora: generateFlora(type),
    //         fauna: generateFauna(type),
    //     }));

    //     const planet = {
    //         id: planetId,
    //         name,
    //         type,
    //         color: typeData.color,
    //         orbitRadius: 50 + i * 40,
    //         size: 3 + Math.random() * 6,
    //         angle: Math.random() * Math.PI * 2,
    //         moons,
    //         conditions: getConditionsForPlanetType(type),
    //         resources: generateResourcesForPlanet(type),
    //         settlements: generateSettlementsForPlanet(type),
    //         flora: generateFloraForPlanet(type),
    //         fauna: generateFaunaForPlanet(type),
    //     };

    //     planets.push(planet);
    // }

    //const fauna = planets.flatMap(p => p.fauna);
    //const flora = planets.flatMap(p => p.flora);

    // return {
    //     id: starId,
    //     name: star.name,
    //     type: star.type,
    //     position: { x: star.x, y: star.y, z: star.z || 0 },
    //     faction: star.faction || null,
    //     economy: generateEconomy(),
    //     planets,
    //     catalogedFauna: fauna,
    //     catalogedFlora: flora,
    //     version: 1
    // };
}

// Placeholder until a better naming utility is added
//function getPlanetNameFragment() {
//    const parts = ['Tor', 'Xen', 'Myra', 'Vel', 'Zar', 'Lun', 'Ar', 'Nex', 'Drax', 'Jor'];
//    return getRandomItem(parts);
//}
