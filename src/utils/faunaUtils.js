// faunaUtils.js

//--- Animal Behavior Types
export const behaviorTypes = [
    'peaceful', 'edible', 'hostile', 'territorial', 'skittish', 'parasitic', 'symbiotic', 'curious', 'sentient', 'pack hunter'
];

export const lifeformTypes = [
    { type: 'mammal', icon: 'PawPrint' },
    { type: 'reptile', icon: 'Turtle' },
    { type: 'avian', icon: 'Feather' },
    { type: 'amphibian', icon: 'Droplet' },
    { type: 'insectoid', icon: 'Bug' },
    { type: 'crustacean', icon: 'Shell' },
    { type: 'rodent', icon: 'MousePointer' }, // Closest match for a small, twitchy critter
    { type: 'cephalopod', icon: 'Octagon' },   // Placeholder — could be replaced with a better icon
    { type: 'plantimal', icon: 'Leaf' },
    { type: 'hybrid', icon: 'Sparkles' },
    { type: 'synthetic', icon: 'Cpu' }
];

//--- Biomes
export const biomes = [
    'surface', 'marine', 'subterranean', 'aerial', 'amphibious'
];

//--- Planetary Fauna Density Rules
export const faunaDensityByPlanetType = {
    'Rocky': 'moderate',
    'Gas Giant': 'none',
    'Ice World': 'sparse',
    'Exotic': 'abundant',
    'Oceanic': 'aquaticOnly',
    'Volcanic': 'sparse',
    'Barren': 'none',
    'Crystaline': 'moderate',
    'Radiated': 'bizarreOnly',
    'Artificial': 'syntheticOnly',
    'Metallic': 'syntheticOnly',
    'Carbonaceous': 'moderate'
};

//--- Base Pools
const nameSyllables = [
    'zor', 'vex', 'tal', 'nir', 'lux', 'garn', 'ska', 'dro', 'fel', 'mek', 'quor', 'zin', 'rax', 'yil', 'xen', 'um', 'ol', 'tra'
];

export function generateCreatureName() {
    const syllableCount = Math.floor(Math.random() * 2) + 2;
    let name = '';
    for (let i = 0; i < syllableCount; i++) {
        name += nameSyllables[Math.floor(Math.random() * nameSyllables.length)];
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function generateFauna({ planetType }) {
    const density = faunaDensityByPlanetType[planetType] || 'moderate';
    if (density === 'none') return [];

    const count = {
        sparse: Math.floor(Math.random() * 2) + 1,
        moderate: Math.floor(Math.random() * 4) + 2,
        abundant: Math.floor(Math.random() * 10) + 5,
        aquaticOnly: Math.floor(Math.random() * 5) + 3,
        bizarreOnly: Math.floor(Math.random() * 3) + 2,
        syntheticOnly: Math.floor(Math.random() * 4) + 1
    }[density];

    const creatures = [];
    for (let i = 0; i < count; i++) {
        const name = generateCreatureName();
        const behavior = randomFrom(behaviorTypes);
        const type = (density === 'syntheticOnly') ? 'synthetic' : randomFrom(lifeformTypes);
        const biome = (density === 'aquaticOnly') ? 'marine' : randomFrom(biomes);
        const feet = type === 'cephalopod' ? 8 : type === 'synthetic' ? randomInt(0, 12) : randomInt(0, 6);
        const hasGender = Math.random() > 0.2;
        const laysEggs = ['reptile', 'avian', 'insectoid', 'amphibian'].includes(type);
        const description = `A ${behavior} ${type} that prefers the ${biome} biome.`;

        creatures.push({
            name,
            type,
            behavior,
            biome,
            feet,
            gendered: hasGender,
            laysEggs,
            description
        });
    }

    return creatures;
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
