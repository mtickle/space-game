import { getRandomConditions } from '@utils/conditionUtils';
import { economyNames } from '@utils/economyUtils';
import { generateFauna } from '@utils/faunaUtils';
import { generateFlora } from '@utils/floraUtils';
import { generateMineral } from '@utils/mineralUtils';
import { v4 as uuidv4 } from 'uuid';

// New list of potential unique planet names
const uniquePlanetNames = [
    'Aurelis', 'Celestine', 'Dravira', 'Elarion', 'Feyrith', 'Glimmera', 'Havenar', 'Iridesa', 'Jovaris', 'Kryon',
    'Lunareth', 'Miravelle', 'Nebulora', 'Oceanya', 'Praxilon', 'Quaraxis', 'Ravella', 'Sylvara', 'Targonis', 'Umberon',
    'Vaeloria', 'Wynthara', 'Xylara', 'Yseris', 'Zorayne', 'Altheris', 'Brynora', 'Clythera', 'Drenvar', 'Elysium',
    'Fiorina', 'Galathar', 'Heliora', 'Ithryll', 'Jynxara', 'Korveth', 'Luthara', 'Mythera', 'Nytheris', 'Orythia',
    'Pyrrhus', 'Quelthar', 'Rynora', 'Solvane', 'Thalira', 'Ulvoria', 'Vyrith', 'Wexlar', 'Xandora', 'Ylvana',
    'Zentara', 'Aethyra', 'Bolaris', 'Cynthera', 'Draxion', 'Eryndis', 'Falthar', 'Gryphon', 'Hylara', 'Ixilon',
    'Joveth', 'Kalthor', 'Lyris', 'Mavora', 'Nyxara', 'Orithia', 'Phelora', 'Qirath', 'Ravine', 'Selvyn',
    'Taryon', 'Ulythia', 'Valthar', 'Wyrdith', 'Xerath', 'Yorath', 'Zenvora', 'Alvira', 'Benthos', 'Clyra',
    'Dolveth', 'Eryon', 'Fynara', 'Galthor', 'Hyris', 'Ildara', 'Jorveth', 'Klyther', 'Lunora', 'Myrvyn',
    'Nalthar', 'Olyria', 'Pyrith', 'Quorax', 'Ralthor', 'Sylith', 'Tolvyn', 'Uryth', 'Vexara', 'Wynthor',
    'Xylith', 'Ythera', 'Zorvyn', 'Alyther', 'Brynith', 'Calthar', 'Dyris', 'Elvora', 'Falthir', 'Gryther',
    'Havara', 'Ilyria', 'Jynara', 'Korath', 'Lyrith', 'Malthor', 'Nyvora', 'Orveth', 'Palthar', 'Qyvora',
    'Rynith', 'Selveth', 'Talthor', 'Urvora', 'Valthir', 'Wylith', 'Xyris', 'Ylvora', 'Zalthar', 'Aurvyn'
];

// New list of potential settlement names
const settlementNames = [
    'New Haven', 'Eldergate', 'Skyreach', 'Dawnspire', 'Ironhold', 'Frosthaven', 'Suncrest', 'Stormwatch', 'Ashfall', 'Riverhold',
    'Brightstone', 'Duskmoor', 'Starhaven', 'Windgate', 'Thornvale', 'Crystalreach', 'Shadowkeep', 'Goldspire', 'Frostspire', 'Oasisville',
    'Emberton', 'Seawatch', 'Highridge', 'Moonshade', 'Sandhaven', 'Firehold', 'Mistral', 'Dawnwatch', 'Ironvale', 'Stormhold',
    'Lightspire', 'Frostgate', 'Sunwatch', 'Ashridge', 'Rivergate', 'Brightmoor', 'Duskspire', 'Starhold', 'Windhaven', 'Thornhold',
    'Crystalgate', 'Shadowspire', 'Goldhaven', 'Frostwatch', 'Oasiscity', 'Emberhold', 'Seaspire', 'Highwatch', 'Moonhold', 'Sandspire',
    'Firewatch', 'Mistwatch', 'Dawnhold', 'Ironspire', 'Stormgate', 'Lightwatch', 'Frosthold', 'Sunhold', 'Ashhold', 'Riverwatch',
    'Brightspire', 'Duskhold', 'Starwatch', 'Windspire', 'Thornwatch', 'Crystalhold', 'Shadowhold', 'Goldwatch', 'Frostreach', 'Oasisreach',
    'Emberwatch', 'Seahold', 'Highspire', 'Moonwatch', 'Sandwatch', 'Firehold', 'Mistspire', 'Dawnreach', 'Ironwatch', 'Stormspire'
];

export const planetTypes = [
    { type: 'Rocky', color: '#A0AEC0', weight: 0.25 },
    { type: 'Gas Giant', color: '#F6AD55', weight: 0.2 },
    { type: 'Ice World', color: '#90CDF4', weight: 0.15 },
    { type: 'Exotic', color: '#ED64A6', weight: 0.1 },
    { type: 'Oceanic', color: '#63B3ED', weight: 0.1 },
    { type: 'Volcanic', color: '#FC8181', weight: 0.05 },
    { type: 'Barren', color: '#CBD5E0', weight: 0.05 },
    { type: 'Crystaline', color: '#B794F4', weight: 0.05 },
    { type: 'Radiated', color: '#FBB6CE', weight: 0.03 },
    { type: 'Artificial', color: '#F0E68C', weight: 0.02 }
];

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

// Import economy names

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



//import { uniquePlanetNames } from './nameUtils'; 

const moonTypes = [
    'Rocky',
    'Icy',
    'Volcanic',
    'Desolate',
    'Oceanic',
    'Cratered',
    'Frozen',
    'Metallic',
    'Carbonaceous',
];

const namedMoonProbability = 0.6; // 20% chance a moon gets a unique name
let moonNameIndex = 0;

/**
 * Generate moons for a given planet.
 * @param {string} planetName
 * @param {string} planetType
 * @returns {Array} Array of moon objects
 */
export function generateMoons(planetName, planetType) {
    //if (planetType === 'Gas Giant') return [];

    const numMoons = Math.floor(Math.random() ** 2 * 13); // heavily weighted toward fewer moons

    const moons = [];
    for (let i = 0; i < numMoons; i++) {
        const isNamed = Math.random() < namedMoonProbability && moonNameIndex < uniquePlanetNames.length;
        const name = isNamed
            ? uniquePlanetNames[moonNameIndex++]
            : `${planetName} ${toRoman(i + 1)}`;

        const type = moonTypes[Math.floor(Math.random() * moonTypes.length)];
        const size = (Math.random() * 0.3 + 0.1).toFixed(2); // 0.1–0.4 (scaled relative to planets)

        const moon = {
            name,
            type,
            size: parseFloat(size),
            conditions: getRandomConditions(),
            settlements: isNamed ? generateMoonSettlements(name) : [],
        };

        // console.log('[PlanetUtils] Generated moon ' + moon.type + '  for planet ' + planetName);
        if (moon.settlements.length) {
            //console.log(`[MoonDebug] 🛰 ${moon.name} has settlements:`, moon.settlements);
        }
        moons.push(moon);
    }

    return moons;
}

// Helper to generate 1–2 settlements
function generateMoonSettlements(moonName) {
    const count = Math.random() < 0.6 ? 2 : 1; // 60% chance of 2 settlements
    const settlements = [];
    for (let i = 0; i < count; i++) {
        const suffix = ['Base', 'Station', 'Outpost', 'Dome', 'Colony'][Math.floor(Math.random() * 5)];
        settlements.push(`${moonName} ${suffix}`);
    }
    return settlements;
}

// Helper for Roman numerals like "III"
function toRoman(num) {
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romans[num - 1] || `${num}`;
}
