import { generateFauna } from '@utils/faunaUtils'; // Added lifeformTypes import
import { generateFlora } from '@utils/floraUtils';
import { generateMineral } from '@utils/mineralUtils';
import { Bug, CircleQuestionMark, Cpu, Crown, Diameter, Droplet, Earth, Factory, Feather, Fish, FlaskConical, Flower, LandPlot, Leaf, MapPin, MousePointer, Octagon, PawPrint, Radiation, Shell, Shrub, Sparkles, ThermometerSnowflake, ThermometerSun, TreePalm, TreePine, Turtle, Waves, Wind } from 'lucide-react';
import { useMemo, useState } from 'react';

const PlanetPanel = ({ planet, factionColor, onMapClick }) => {
    const [open, setOpen] = useState(false);


        // --- Guard clause: Don't render if planet is undefined
    if (!planet) {
        return (
            <div className="text-gray-400 italic px-4 py-2">
                No planet selected.
            </div>
        );
    }

    const faunaList = useMemo(() => generateFauna(planet.type), [planet.type]);
    const floraList = useMemo(() => generateFlora(planet.type), [planet.type]);
   

    const resourceList = useMemo(() => {
        const resources = [];
        const count = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < count; i++) {
            const mineral = generateMineral(planet.type);
            resources.push(
                <li key={i} className="text-sm text-gray-200">
                    <FlaskConical className="inline w-4 h-4 mr-1 text-pink-400" />
                    {mineral.mineralName} ({mineral.elements.join(', ')})
                    {mineral.unknownElements && (
                        <span className="text-purple-400"> + {mineral.unknownElements.map(e => e.symbol).join(', ')} (Unknown)</span>
                    )}
                </li>
            );
        }
        return resources;
    }, [planet.type]);

    // Map lifeform types to Lucide icons
    const getFaunaIcon = (type) => {
        const iconMap = {
            'Mammal': <PawPrint className="inline w-4 h-4 mr-1 text-red-400" />,
            'Reptile': <Turtle className="inline w-4 h-4 mr-1 text-green-400" />,
            'Avian': <Feather className="inline w-4 h-4 mr-1 text-yellow-400" />,
            'Amphibian': <Droplet className="inline w-4 h-4 mr-1 text-blue-400" />,
            'Insectoid': <Bug className="inline w-4 h-4 mr-1 text-purple-400" />,
            'Crustacean': <Shell className="inline w-4 h-4 mr-1 text-teal-400" />,
            'Rodent': <MousePointer className="inline w-4 h-4 mr-1 text-gray-400" />,
            'Cephalopod': <Octagon className="inline w-4 h-4 mr-1 text-indigo-400" />,
            'Plantimal': <Leaf className="inline w-4 h-4 mr-1 text-lime-400" />,
            'Hybrid': <Sparkles className="inline w-4 h-4 mr-1 text-pink-400" />,
            'Synthetic': <Cpu className="inline w-4 h-4 mr-1 text-gray-500" />
        };
        return iconMap[type] || <PawPrint className="inline w-4 h-4 mr-1 text-gray-400" />; // Default to PawPrint
    };

    const getFloraIcon = (type) => {
        const iconMap = {
            'tree': <TreePine className="inline w-4 h-4 mr-1 text-green-500" />,
            'shrub': <Shrub className="inline w-4 h-4 mr-1 text-green-600" />,
            'flower': <Flower className="inline w-4 h-4 mr-1 text-pink-500" />,
            'vine': <TreePalm className="inline w-4 h-4 mr-1 text-green-700" />,
            'seaweed': <Waves className="inline w-4 h-4 mr-1 text-blue-500" />,
            'fungus': <Bug className="inline w-4 h-4 mr-1 text-purple-500" />,
            'moss': <Leaf className="inline w-4 h-4 mr-1 text-lime-500" />,
            'bush': <Shrub className="inline w-4 h-4 mr-1 text-green-600" />,
            'grass': <Bug className="inline w-4 h-4 mr-1 text-lime-600" />,
            'coral-like': <Fish className="inline w-4 h-4 mr-1 text-teal-500" />
        };
        return iconMap[type] || <CircleQuestionMark className="inline w-4 h-4 mr-1 text-gray-400" />; // Default to TreePine
    };

    return (
        <div className="border-t border-gray-700 py-2">
            <button
                className="w-full text-left text-lg text-yellow-300 font-semibold hover:text-yellow-200"
                onClick={() => setOpen(!open)}
            >
                {open ? '▼' : '▶'} <span style={{ color: factionColor }}>{planet.name}</span> <span className="text-sm text-gray-400">({planet.type})</span>
            </button>

            {open && (
                <div className="ml-4 mt-1 space-y-2 pb-5">
                    <div>
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                            <Earth className="w-4 h-4" /> Planetary Details
                        </div>
                        <ul className="ml-4 list-disc text-gray-200 text-sm">
                            <li><LandPlot className="inline w-4 h-4 mr-1 text-red-400" /><strong>Type:</strong> {planet.type}</li>
                            <li><Diameter className="inline w-4 h-4 mr-1 text-red-400" /><strong>Size:</strong> {planet.size > 6 ? 'Large' : planet.size > 3 ? 'Medium' : 'Small'}</li>
                        </ul>
                    </div>

                    {planet.economy && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <Factory className="w-4 h-4" /> Economy
                            </div>
                            <p className="ml-4 text-sm text-gray-200"><strong>{planet.economy.name}</strong></p>
                            <p className="ml-4 text-xs text-gray-400 italic">{planet.economy.description}</p>
                        </div>
                    )}

                    {Array.isArray(planet.moons) && planet.moons.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <Earth className="w-4 h-4" /> Moons
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.moons.map((moon, idx) => (
                                    <li key={idx}>
                                        <span className="text-white">{moon.name}</span>{' '}
                                        <span className="text-gray-400">({moon.type})</span>
                                        {moon.settlements && moon.settlements.length > 0 && (
                                            <ul className="ml-4 list-disc text-xs text-gray-400">
                                                {moon.settlements.map((s, i) => (
                                                    <li key={i}> {s}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {planet.settlements && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <Factory className="w-4 h-4" /> Settlements
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.settlements.map((s, i) => (
                                    <li key={i}>
                                        {s.isCapital ? (
                                            <Crown className="inline w-5 h-5 mr-1 text-yellow-400" />
                                        ) : (
                                            <MapPin className="inline w-4 h-4 mr-1 text-gray-400" />
                                        )}
                                        {s.name} (Pop: {s.population.toLocaleString()})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                            <FlaskConical className="w-4 h-4" /> Resources
                        </div>
                        <ul className="ml-4 list-disc text-gray-200">
                            {resourceList}
                        </ul>
                    </div>

                    {floraList.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <PawPrint className="w-4 h-4" /> Flora
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {floraList.map((f, i) => (
                                    <li key={i} className="mb-1">{getFloraIcon(f.type)}
                                        {f.name}
                                        <ul className="ml-4 list-disc text-xs text-gray-400">
                                            <li>Type: {f.type}</li>
                                            <li>Rarity: {f.rarity}</li>
                                            <li>Appearance: {f.appearance}</li>
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                    {faunaList.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <PawPrint className="w-4 h-4" /> Fauna
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {faunaList.map((f, i) => (
                                    <li key={i} className="mb-1">{getFaunaIcon(f.type.name)}
                                        {f.name}
                                        <ul className="ml-4 list-disc text-xs text-gray-400">
                                            <li>Type: {f.type.name}</li>
                                            <li>Behavior: {f.behavior}</li>
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                            <Radiation className="w-4 h-4" /> Conditions
                        </div>
                        <ul className="ml-4 list-disc text-gray-200 text-sm space-y-1 mt-1">
                            <li><Wind className="inline w-4 h-4 mr-1 text-cyan-400" />Winds: {planet.wind || 'Gentle'}</li>
                            <li><ThermometerSun className="inline w-4 h-4 mr-1 text-red-400" />Day Temp: {planet.temperature || 'Temperate'}</li>
                            <li><ThermometerSnowflake className="inline w-4 h-4 mr-1 text-blue-400" />Night Temp: {planet.nightTemperature || 'Mild'}</li>
                            <li><Droplet className="inline w-4 h-4 mr-1 text-lime-400" />Toxicity: {planet.toxicity || 'Low'}</li>
                            <li><Radiation className="inline w-4 h-4 mr-1 text-pink-400" />Radiation: {planet.radiation || 'Safe'}</li>
                            <li><MapPin className="inline w-4 h-4 mr-1 text-yellow-400" />Weather: {planet.weather || 'Arid'}</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanetPanel;