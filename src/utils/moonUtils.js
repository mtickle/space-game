
import { getRandomConditions } from '@utils/conditionUtils';
import { uniquePlanetNames } from '@utils/namingUtils';

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
