// Procedural star name generator
export const generateStarName = () => {
    const prefixes = ['Zorath', 'Klyra', 'Vexis', 'Nyxara', 'Solara', 'Dracon', 'Aether', 'Lumys', 'Velthar', 'Omnix', 'Xelora', 'Quenari', 'Thalor', 'Yllith', 'Cynera', 'Draxon',
        'Vireon', 'Zenthis', 'Myrrak', 'Korinex', 'Ozyra', 'Pharex', 'Lunor', 'Zarneth',
        'Elyra', 'Kharix', 'Nexara', 'Voltan', 'Arqis', 'Xyrenth', 'Ulnari', 'Soryth',
        'Jaxira', 'Torven', 'Iyssar', 'Zyrion', 'Halmar', 'Teryx', 'Mavros', 'Lioren',
        'Kaelis', 'Vanyr', 'Orvyn', 'Nalore', 'Tyrix', 'Kyralis', 'Zavren', 'Solvyn',
        'Orryx', 'Eryndor', 'Iskari', 'Boreth', 'Rhelan', 'Azyth', 'Caldra', 'Xyneth',
        'Vorana', 'Dureth', 'Zyphor', 'Galvex', 'Tarnyx', 'Ulrix', 'Norym', 'Seltra',
        'Yvera', 'Kaelith', 'Draymar', 'Onyxis', 'Felyra', 'Vokar', 'Xolryn', 'Lazeth',
        'Morith', 'Kyvra', 'Zereth', 'Orilax', 'Ymarra', 'Thryss', 'Velkor', 'Zenyra',
        'Sykaris', 'Lorvex', 'Pythera', 'Vornak', 'Qirell', 'Zhyrra', 'Talvek', 'Umbrak',
        'Arthen', 'Jureth', 'Velsor', 'Xanith', 'Cirella', 'Kheros', 'Nirvax', 'Soryn',
        'Obryth', 'Thalrix', 'Veraxa', 'Lymari', 'Azryn', 'Dornak', 'Phalor', 'Quiris',
        'Xevara', 'Yllor', 'Zovra', 'Mekalor'];
    const suffixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Alpha', 'Bravo', 'Prime'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
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


