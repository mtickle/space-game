// floraUtils.js

import { chance, getRandomInt, getRandomItem } from '@utils/randomUtils';

const floraTypes = [
    'Tree', 'Shrub', 'Flower', 'Vine', 'Seaweed', 'Fungus', 'Moss', 'Bush', 'Grass', 'Coral-like'
];

const utilities = [
    'Healing', 'Fuel', 'Food', 'Building Material', 'Ornamental', 'Fiber', 'Hallucinogen', 'Tech Component'
];

const appearances = [
    'glowing', 'bioluminescent', 'twisting', 'translucent', 'vibrant', 'mossy', 'crystalline',
    'blackened', 'shimmering', 'scaled', 'hairy', 'tubular', 'fan-like', 'drooping', 'spiked'
];

const rarityTable = [
    'Common', 'Common', 'Common', 'Uncommon', 'Uncommon', 'Rare', 'Rare', 'Legendary'
];

const typeFloraPresence = {
    'Rocky': { count: [2, 6] },
    'Gas Giant': { count: [0, 0] },
    'Ice World': { count: [1, 3] },
    'Exotic': { count: [6, 15] },
    'Oceanic': { count: [3, 8], marineOnly: true },
    'Volcanic': { count: [0, 2] },
    'Barren': { count: [0, 0] },
    'Crystaline': { count: [2, 7], specialAppearance: 'crystalline' },
    'Radiated': { count: [2, 5], mutated: true },
    'Artificial': { count: [3, 6], synthetic: true },
    'Metallic': { count: [1, 4], synthetic: true },
    'Carbonaceous': { count: [3, 7] }
};

function generateFloraName() {
    const prefixes = ['Zor', 'Xan', 'Blor', 'Neh', 'Tri', 'Lum', 'Vel', 'Quar', 'Thy', 'Irr'];
    const middles = ['ro', 'li', 'ka', 'zu', 'mi', 'the', 'pha', 'chi'];
    const suffixes = ['plant', 'weed', 'root', 'vine', 'stem', 'blossom', 'bud', 'tree'];
    return `${getRandomItem(prefixes)}${getRandomItem(middles)}${getRandomItem(suffixes)}`;
}

function getFloraNote(type, appearance) {
    const jokes = [
        `Avoid picking the ${type.toLowerCase()} unless you want a rash shaped like your regrets.`,
        `This ${appearance} specimen once tried to unionize with nearby fungi.`,
        `Known to scream when plucked. Local chefs recommend earplugs.`,
        `Its pollen causes mild euphoria and uncontrollable dance moves.`,
        `Harvest with caution: last botanist grew a second shadow.`
    ];
    return getRandomItem(jokes);
}

function generateFlora(planetType, maxCount = 5) {
    const settings = typeFloraPresence[planetType] || { count: [0, 0] };
    const count = getRandomInt(...settings.count);
    const floraList = [];

    for (let i = 0; i < count && i < maxCount; i++) {
        const name = generateFloraName();
        const type = settings.marineOnly ? 'Seaweed' : getRandomItem(floraTypes);
        const appearance = settings.specialAppearance || getRandomItem(appearances);

        floraList.push({
            name,
            type,
            appearance,
            rarity: getRandomItem(rarityTable),
            edible: chance(0.3),
            poisonous: chance(0.2),
            sentient: chance(settings.mutated ? 0.1 : 0.02),
            cultivatable: chance(0.5),
            utility: getRandomItem(utilities),
            synthetic: !!settings.synthetic,
            notes: chance(0.3) ? getFloraNote(type, appearance) : null
        });
    }

    return floraList;
}

export default generateFlora;
