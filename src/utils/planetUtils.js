

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

// Generate planetary system (updated for inhabited planets, settlements, population, and random capital)
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
            }
        }
        planets.push(planet);
    }
    return planets;
};