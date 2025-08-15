//import { getFaunaIcon } from '@utils/faunaUtils';
import {
    Bug,
    CircleHelp,
    Cpu,
    Crown, Diameter,
    Droplet,
    Earth, Factory,
    Feather,
    Fish,
    FlaskConical,
    Flower,
    HandCoins, LandPlot,
    Leaf,
    MapPin,
    MousePointer,
    Octagon,
    PawPrint,
    Radiation,
    Shell,
    Shrub,
    Sparkles,
    Sprout,
    ThermometerSnowflake, ThermometerSun,
    TreePalm,
    TreePine,
    Turtle,
    Waves,
    Wind
} from 'lucide-react';
import { useState } from 'react';

const PlanetPanel = ({ planet, factionColor, onMapClick }) => {
    const [open, setOpen] = useState(false);

    // --- FloraIcon Sub-Component ---
    const FloraIcon = ({ type }) => {
        const iconMap = {
            'tree': <TreePine className="inline w-4 h-4 mr-2 text-green-500" />,
            'shrub': <Shrub className="inline w-4 h-4 mr-2 text-green-600" />,
            'flower': <Flower className="inline w-4 h-4 mr-2 text-pink-500" />,
            'vine': <TreePalm className="inline w-4 h-4 mr-2 text-green-700" />,
            'seaweed': <Waves className="inline w-4 h-4 mr-2 text-blue-500" />,
            'fungus': <Bug className="inline w-4 h-4 mr-2 text-purple-500" />,
            'moss': <Leaf className="inline w-4 h-4 mr-2 text-lime-500" />,
            'bush': <Shrub className="inline w-4 h-4 mr-2 text-green-600" />,
            'grass': <Leaf className="inline w-4 h-4 mr-2 text-lime-600" />,
            'coral-like': <Fish className="inline w-4 h-4 mr-2 text-teal-500" />
        };
        return iconMap[type] || <CircleHelp className="inline w-4 h-4 mr-2 text-gray-400" />;
    };

    // --- NEW: FaunaIcon Sub-Component ---
    const FaunaIcon = ({ type }) => {
        const iconMap = {
            'mammal': <PawPrint className="inline w-4 h-4 mr-2 text-red-400" />,
            'reptile': <Turtle className="inline w-4 h-4 mr-2 text-green-400" />,
            'avian': <Feather className="inline w-4 h-4 mr-2 text-yellow-400" />,
            'amphibian': <Droplet className="inline w-4 h-4 mr-2 text-blue-400" />,
            'insectoid': <Bug className="inline w-4 h-4 mr-2 text-purple-400" />,
            'crustacean': <Shell className="inline w-4 h-4 mr-2 text-teal-400" />,
            'rodent': <MousePointer className="inline w-4 h-4 mr-2 text-gray-400" />,
            'cephalopod': <Octagon className="inline w-4 h-4 mr-2 text-indigo-400" />,
            'plantimal': <Leaf className="inline w-4 h-4 mr-2 text-lime-400" />,
            'hybrid': <Sparkles className="inline w-4 h-4 mr-2 text-pink-400" />,
            'synthetic': <Cpu className="inline w-4 h-4 mr-2 text-gray-500" />
        };
        return iconMap[type] || <CircleHelp className="inline w-4 h-4 mr-2 text-gray-400" />;
    };

    console.log('Rendering PlanetPanel with planet:', planet);

    // --- Guard clause: Don't render if planet is undefined
    if (!planet) {
        return (
            <div className="text-gray-400 italic px-4 py-2">
                No planet selected.
            </div>
        );
    }

    return (
        <div className="border-t border-gray-700 py-2">
            <button
                className="w-full text-left text-lg text-yellow-300 font-semibold hover:text-yellow-200"
                onClick={() => setOpen(!open)}
            >
                {open ? '▼' : '▶'} <span style={{ color: factionColor }}>{planet.planetName}</span> <span className="text-sm text-gray-400">({planet.planetType})</span>
            </button>

            {open && (
                <div className="ml-4 mt-1 space-y-2 pb-5">
                    <div>
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                            <Earth className="w-4 h-4" /> Planetary Details
                        </div>
                        <ul className="ml-4 list-disc text-gray-200 text-sm">
                            <li><LandPlot className="inline w-4 h-4 mr-1 text-red-400" /><strong>Type:</strong> {planet.planetType}</li>
                            <li><Diameter className="inline w-4 h-4 mr-1 text-red-400" /><strong>Size:</strong> {planet.size > 6 ? 'Large' : planet.size > 3 ? 'Medium' : 'Small'}</li>
                        </ul>
                    </div>


                    {Array.isArray(planet.moons) && planet.moons.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <Earth className="w-4 h-4" /> Moons
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.moons.map((moon, idx) => (
                                    <li key={idx}>
                                        <span className="text-white">{moon.moonName}</span>{' '}
                                        <span className="text-gray-400">({moon.moonType})</span>
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


                    {planet.settlements && planet.settlements.length > 0 && (
                        <>
                            {/* Economy */}
                            <div>
                                <div className="flex items-center gap-1 text-orange-400 font-bold">
                                    <HandCoins className="w-4 h-4" /> Economy
                                </div>
                                {planet.economy ? (
                                    <>
                                        <p className="ml-4 text-sm text-gray-200 font-semibold">{planet.economy.name}</p>
                                        <p className="ml-4 text-xs text-gray-400 italic">{planet.economy.description}</p>
                                    </>
                                ) : (
                                    <p className="ml-4 text-sm text-gray-400 italic">Economy scan failed.</p>
                                )}
                            </div>

                            {/* Industry */}
                            <div>
                                <div className="flex items-center gap-1 text-orange-400 font-bold">
                                    <Factory className="w-4 h-4" /> Industry
                                </div>
                                {planet.industry ? (
                                    <>
                                        <p className="ml-4 text-sm text-gray-200 font-semibold">{planet.industry.name}</p>
                                        <p className="ml-4 text-xs text-gray-400 italic">{planet.industry.description}</p>
                                    </>
                                ) : (
                                    <p className="ml-4 text-sm text-gray-400 italic">Industry scan failed.</p>
                                )}
                            </div>

                            {/* Settlements */}
                            <div>
                                <div className="flex items-center gap-1 text-orange-400 font-bold">
                                    <MapPin className="w-4 h-4" /> Settlements
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
                        </>
                    )}

                    {/* Atmosphere */}
                    {planet.atmosphere && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <Wind className="w-4 h-4" /> Atmosphere
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.atmosphere.elements.map((element, i) => (
                                    <li key={i}>
                                        {element.name} ({Math.round(element.percent * 100)}%)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                    {planet.resourceList?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <FlaskConical className="w-4 h-4" /> Resources
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.resourceList.map((mineral, i) => (
                                    <li key={i}>
                                        <FlaskConical className="inline w-4 h-4 mr-1 text-pink-400" />
                                        {mineral.mineralName} ({mineral.elements.join(', ')})
                                        {mineral.unknownElements && (
                                            <span className="text-purple-400"> + {mineral.unknownElements.map(e => e.symbol).join(', ')} (Unknown)</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                    {planet.floraList?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <Sprout className="w-4 h-4" /> Flora
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.floraList.map((f, i) => (
                                    <li key={i} className="mb-1"><FloraIcon type={f.type} />
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


                    {planet.faunaList?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <PawPrint className="w-4 h-4" /> Fauna
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.faunaList.map((f, i) => (
                                    <li key={i} className="mb-1"> <FaunaIcon type={f.type} />
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