import { economyNames } from '@utils/economyUtils';
import { generateFauna } from '@utils/faunaUtils';
import { generateFlora } from '@utils/floraUtils';
import { generateMineral } from '@utils/mineralUtils';
import { generateMoons } from '@utils/moonUtils';
import { planetTypes, settlementNames, uniquePlanetNames } from '@utils/namingUtils';
import { v4 as uuidv4 } from 'uuid';

// Procedural planet name generator (updated to support unique names)
export const generatePlanetName = (starName, index, uniqueNames) => {
    if (uniqueNames && uniqueNames.length > 0 && Math.random() < 0.4) { // 40% chance for a unique name
        const name = uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
        uniqueNames.splice(uniqueNames.indexOf(name), 1); // Remove used name to avoid duplicates
        return name;
    }
    const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
    return `${starName} ${letters[index]}`;
};

// Generate planetary system (updated for inhabited planets, settlements, population, random capital, and economy)
export const generatePlanets = (starName) => {

    const numPlanets = Math.floor(Math.random() * 5) + 2; // 2–6 planets
    const planets = [];
    const availableUniqueNames = [...uniquePlanetNames]; // Create a copy to avoid modifying the original
    for (let i = 0; i < numPlanets; i++) {
        const rand = Math.random();
        let cumulative = 0;
        let planetType = planetTypes[planetTypes.length - 1];
        for (const p of planetTypes) {
            cumulative += p.weight;
            if (rand < cumulative) {
                planetType = p;
                break;
            }
        }

        const planet = {
            id: uuidv4(),
            name: generatePlanetName(starName, i, availableUniqueNames.length > 0 ? availableUniqueNames : null),
            type: planetType.type,
            color: planetType.color,
            size: Math.floor(Math.random() * 10) + 1, // 1–10
            orbitRadius: 20 + i * 15, // Wider orbit spacing
        };
        if (!planet.name.includes(starName)) { // Check if planet has a unique name
            const numSettlements = Math.floor(Math.random() * 11); // 0–10 settlements
            if (numSettlements > 0) {
                const availableSettlementNames = [...settlementNames]; // Create a copy
                planet.settlements = [];
                for (let j = 0; j < numSettlements; j++) {
                    const settlementName = availableSettlementNames[Math.floor(Math.random() * availableSettlementNames.length)];
                    availableSettlementNames.splice(availableSettlementNames.indexOf(settlementName), 1); // Remove used name
                    planet.settlements.push({ name: settlementName, population: j === 0 ? Math.floor(Math.random() * 200001) + 900000 : Math.floor(Math.random() * 499001) + 1000 });
                }
                // Randomly assign a capital (not based on population)
                if (planet.settlements.length > 0) {
                    const capitalIndex = Math.floor(Math.random() * planet.settlements.length);
                    planet.settlements[capitalIndex].isCapital = true;
                }
                // Assign a random economy
                planet.economy = economyNames[Math.floor(Math.random() * economyNames.length)];
            }
        }
        planet.moons = generateMoons(planet.name, planet.type);
        planets.push(planet);
    }
    return planets;
};

export const synthesizePlanetarySystem = (starName, starId) => {
    const numPlanets = Math.floor(Math.random() * 5) + 2; // 2–6 planets
    const planets = [];
    const availableUniqueNames = [...uniquePlanetNames];

    for (let i = 0; i < numPlanets; i++) {
        // Weighted planet type selection
        const rand = Math.random();
        let cumulative = 0;
        let planetType = planetTypes[planetTypes.length - 1];
        for (const p of planetTypes) {
            cumulative += p.weight;
            if (rand < cumulative) {
                planetType = p;
                break;
            }
        }

        const planetName = generatePlanetName(starName, i, availableUniqueNames);
        const isUniqueName = !planetName.includes(starName);

        const planet = {
            starId,
            starName,
            planetId: uuidv4(),
            planetName,
            planetType: planetType.type,
            planetColor: planetType.color,
            planetSize: Math.floor(Math.random() * 10) + 1,
            orbitRadius: 20 + i * 15,
            isUniqueName,
            floraList: generateFlora(planetType.type),
            faunaList: generateFauna(planetType.type),
            resourceList: [],
            moons: generateMoons(planetName, planetType.type),
            settlements: [],
        };

        // Generate resources (2–4)
        const resourceCount = Math.floor(Math.random() * 3) + 2;
        for (let r = 0; r < resourceCount; r++) {
            planet.resourceList.push(generateMineral(planetType.type));
        }

        // Settlements + Economy (only for uniquely named planets)
        if (isUniqueName) {
            const numSettlements = Math.floor(Math.random() * 11);
            const availableSettlementNames = [...settlementNames];

            for (let j = 0; j < numSettlements; j++) {
                const settlementName = availableSettlementNames[Math.floor(Math.random() * availableSettlementNames.length)];
                availableSettlementNames.splice(availableSettlementNames.indexOf(settlementName), 1);
                planet.settlements.push({
                    name: settlementName,
                    population: j === 0
                        ? Math.floor(Math.random() * 200001) + 900000
                        : Math.floor(Math.random() * 499001) + 1000,
                });
            }

            if (planet.settlements.length > 0) {
                const capitalIndex = Math.floor(Math.random() * planet.settlements.length);
                planet.settlements[capitalIndex].isCapital = true;
                planet.economy = economyNames[Math.floor(Math.random() * economyNames.length)];
            }
        }

        planets.push(planet);
    }

    return planets;
};