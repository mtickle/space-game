// Procedural star name generator
export const generateStarName = () => {
    const prefixes = ['Zorath', 'Klyra', 'Vexis', 'Nyxara', 'Solara', 'Dracon', 'Aether', 'Lumys'];
    const suffixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII','IX','X','Alpha', 'Bravo', 'Prime'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

// Procedural planet name generator
export const generatePlanetName = (starName, index) => {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
    return `${starName} ${letters[index]}`;
};

// Star descriptions based on MK class
export const getStarDescription = (type) => {
    const descriptions = {
        O: 'A massive, blazing blue star with intense radiation, rare and volatile.',
        B: 'A bright blue-white star, hot and luminous, often surrounded by nebulae.',
        A: 'A white star with strong stellar winds, a beacon in the cosmos.',
        F: 'A yellow-white star, stable and warm, with potential for vibrant systems.',
        G: 'A yellow star like Sol, often hosting habitable planets.',
        K: 'An orange star, cooler and steady, with long-lived systems.',
        M: 'A dim red dwarf, common and cool, with faint habitable zones.',
    };
    return descriptions[type] || 'An enigmatic star of unknown properties.';
};

// Generate planetary system
export const generatePlanets = (starName) => {
    const planetTypes = [
        { type: 'Rocky', color: '#A0AEC0', weight: 0.4 },
        { type: 'Gas Giant', color: '#F6AD55', weight: 0.3 },
        { type: 'Ice World', color: '#90CDF4', weight: 0.2 },
        { type: 'Exotic', color: '#ED64A6', weight: 0.1 },
    ];

    const numPlanets = Math.floor(Math.random() * 5) + 2; // 2–6 planets
    const planets = [];
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
        planets.push({
            name: generatePlanetName(starName, i),
            type: planetType.type,
            color: planetType.color,
            size: Math.floor(Math.random() * 10) + 1, // 1–10
            orbitRadius: 20 + i * 15, // Wider orbit spacing
        });
    }
    return planets;
};
