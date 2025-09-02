import {
    Bug,
    CircleHelp,
    Cloudy,
    Cpu,
    Crown,
    Droplet,
    Earth,
    Factory,
    Feather,
    Fish,
    FlaskConical,
    Flower,
    HandCoins,
    Landmark,
    Leaf,
    Moon,
    MousePointer, Octagon,
    PawPrint,
    Shell,
    Shrub,
    Sparkles,
    Sprout,
    TreePalm,
    TreePine,
    Turtle,
    Users,
    Waves, Wind
} from 'lucide-react';
import { useState } from 'react';

const Settlement = ({ settlement }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button
                className="w-full text-left text-gray-300 font-semibold hover:text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {settlement.isCapital && <Crown size={14} className="inline mr-1 text-yellow-400" />}
                {isOpen ? '▼' : '▶'} {settlement.name}
                <span className="text-gray-500 ml-2">(Pop: {settlement.population.toLocaleString()})</span>
            </button>

            {isOpen && (
                <div className="ml-8 mt-1 text-xs text-gray-400 space-y-1">
                    <p>Theme: <span className="text-gray-300">{settlement.layout.theme}</span></p>
                    <p>Condition: <span className="text-gray-300">{settlement.layout.condition}</span></p>

                    {/* Buildings List */}
                    {settlement.layout.buildings?.length > 0 && (
                        <div>
                            <p className="font-semibold text-gray-300 mt-1">Key Buildings:</p>
                            <ul className="list-disc list-inside">
                                {settlement.layout.buildings.map((building, i) => (
                                    <li key={i}>
                                        {building.name} <span className="text-gray-500">({building.type})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// --- Icon Sub-Components for Flora and Fauna ---
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


const ApiPlanetPanel = ({ planet }) => {
    const [open, setOpen] = useState(true);
    const [showMoons, setShowMoons] = useState(false); // State for moon visibility

    console.log('Rendering ApiPlanetPanel for planet:', planet?.planetName || 'Unknown');
    console.dir(planet, { depth: null });

    if (!planet) {
        return <div className="text-gray-400 italic px-4 py-2">No planet selected.</div>;
    }

    return (
        <div className="border-t border-gray-700 py-2">
            <button
                className="w-full text-left text-lg text-yellow-300 font-semibold hover:text-yellow-200 flex items-center"
                onClick={() => setOpen(!open)}
            >
                <span className="mr-2">{open ? '▼' : '▶'}</span>
                <span style={{ color: planet.planetColor }}>{planet.planetName}</span>
                <span className="text-sm text-gray-400 ml-2">({planet.planetType})</span>
            </button>

            {open && (
                <div className="ml-4 mt-2 space-y-3 pb-4 text-sm">
                    {/* Planetary Details Section */}

                    <div>

                    </div>

                    <div className="ml-4 mt-2 space-y-4 pb-5 pr-2">

                        <div className="flex items-center gap-2 font-bold text-green-400">
                            <Earth size={16} /> Planetary Details</div>
                        <ul className="ml-4 list-disc text-xs text-gray-400">
                            <li>Size: {planet.planetSize}</li>
                            <li>Orbit Radius: {planet.orbitRadius}</li>
                            <li>Gravity: {planet.gravity}g</li>
                            <li>Day Length: {planet.rotationalPeriod} hours</li>
                            <li>Year Length: {planet.orbitalPeriod} days</li>
                        </ul>

                        {planet.planetConditions && (
                            <div>
                                <div className="flex items-center gap-2 font-bold text-green-400">
                                    <Cloudy size={16} /> Conditions
                                </div>
                                <ul className="ml-4 list-disc text-xs text-gray-400">
                                    <li>Wind: {planet.planetConditions.wind}</li>
                                    <li>Day: {planet.planetConditions.temperature}</li>
                                    <li>Night: {planet.planetConditions.nightTemperature}</li>
                                    <li>Toxicity: {planet.planetConditions.toxicity}</li>
                                    <li>Radiation: {planet.planetConditions.radiation}</li>
                                </ul>
                            </div>
                        )}
                        {planet.atmosphere && planet.atmosphere.elements?.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 font-bold text-green-400">
                                    <Wind size={16} /> Atmosphere
                                </div>
                                <ul className="ml-4 mt-1 border-l border-gray-600 pl-3 list-disc list-inside text-xs">
                                    {planet.atmosphere.elements.map((element, i) => (
                                        <li key={i}>
                                            {element.name}: {Math.round(element.percent * 100)}%
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Resources */}
                        {planet.resourceList && planet.resourceList.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 font-bold text-green-400">
                                    <FlaskConical size={16} /> Resources
                                </div>
                                <ul className="ml-4 mt-1 border-l border-gray-600 pl-3 list-disc list-inside text-xs">
                                    {planet.resourceList.map((resource, i) => (
                                        <li key={i}>
                                            <span className="font-semibold text-gray-300">{resource.mineralName}</span>
                                            <span className="text-gray-500 ml-2">({resource.elements.join(', ')})</span>
                                            {resource.unknownElements && resource.unknownElements.length > 0 && (
                                                <span className="text-purple-400 ml-2">
                                                    + {resource.unknownElements.map(e => e.symbol).join(', ')} (Unknown)
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* --- Inhabitants Section --- */}
                        {planet.inhabitants && planet.inhabitants.length > 0 && (
                            <div>
                                <div className="flex items-center gap-1 text-cyan-400 font-bold">
                                    <Users className="w-4 h-4" /> Inhabitants
                                </div>
                                {planet.inhabitants.map((species, i) => (
                                    <div key={i} className="ml-4 mt-1">
                                        <p className="text-sm text-gray-200 font-semibold">{species.speciesName}</p>
                                        <p className="text-xs text-gray-400 italic">"{species.disposition}"</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- Economy Section --- */}
                        {planet.economy && (
                            <div>
                                <div className="flex items-center gap-1 text-orange-400 font-bold">
                                    <HandCoins className="w-4 h-4" /> Economy
                                </div>
                                <p className="ml-4 text-sm text-gray-200 font-semibold">{planet.economy.name}</p>
                                <p className="ml-4 text-xs text-gray-400 italic">{planet.economy.description}</p>
                            </div>
                        )}

                        {/* --- Industry Section --- */}
                        {planet.industry && (
                            <div>
                                <div className="flex items-center gap-1 text-orange-400 font-bold">
                                    <Factory className="w-4 h-4" /> Industry
                                </div>
                                <p className="ml-4 text-sm text-gray-200 font-semibold">{planet.industry.name}</p>
                                <p className="ml-4 text-xs text-gray-400 italic">{planet.industry.description}</p>
                            </div>
                        )}

                        {/* --- Settlements & Buildings Section --- */}
                        {/* Settlements */}
                        {planet.settlements && planet.settlements.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 font-bold text-green-400">
                                    <Landmark size={16} /> Settlements
                                </div>
                                <div className="ml-4 mt-1 border-l border-gray-600 pl-3 space-y-2">
                                    {planet.settlements.map((settlement, i) => (
                                        <Settlement key={i} settlement={settlement} />
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Moons (Collapsible) */}
                        {planet.moons?.length > 0 && (
                            <div>
                                <button
                                    className="w-full text-left flex items-center gap-2 font-bold text-green-400"
                                    onClick={() => setShowMoons(!showMoons)}
                                >
                                    <Moon size={16} /> {showMoons ? '▼' : '▶'} Moons ({planet.moons.length})
                                </button>
                                {showMoons && (
                                    <ul className="ml-4 mt-1 pl-2 space-y-2">
                                        {planet.moons.map((moon, i) => (
                                            <li key={i}>
                                                <p className="font-semibold text-gray-300">{moon.moonName} <span className="text-gray-500">({moon.moonType})</span></p>
                                                <ul className="ml-4 list-disc text-xs text-gray-400">
                                                    <li>Size: {moon.moonSize}</li>
                                                    <li>Weather: {moon.moonConditions.weather}</li>
                                                    <li>Day Temp: {moon.moonConditions.temperature}</li>
                                                    <li>Night Temp: {moon.moonConditions.nightTemperature}</li>
                                                    <li>Toxicity: {moon.moonConditions.toxicity}</li>
                                                    <li>Wind: {moon.moonConditions.wind}</li>
                                                    <li>Radiation: {moon.moonConditions.radiation}</li>
                                                    {moon.moonSettlements?.length > 0 && (
                                                        <li>Settlements: {moon.moonSettlements.join(', ')}</li>
                                                    )}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* --- Flora Section --- */}
                        {planet.floraList?.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 font-bold text-green-400"><Sprout size={16} /> Flora</div>
                                <ul className="ml-4 mt-1 pl-2 space-y-2">
                                    {planet.floraList.map((f, i) => (
                                        <li key={i}>
                                            <div>
                                                <span className="font-semibold"><FloraIcon type={f.type} /> {f.name}</span>
                                                <ul className="ml-8 list-disc text-xs text-gray-400">
                                                    <li>Rarity: {f.rarity}, Appearance: {f.appearance}</li>
                                                    <li>Utility: {f.utility}</li>
                                                    {f.notes && <li className="italic">"{f.notes}"</li>}
                                                </ul>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* --- Fauna Section --- */}
                        {planet.faunaList?.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 font-bold text-green-400"><PawPrint size={16} /> Fauna</div>
                                <ul className="ml-4 mt-1 pl-2 space-y-2">
                                    {planet.faunaList.map((f, i) => (
                                        <li key={i}>
                                            <div>
                                                <span className="font-semibold"><FaunaIcon type={f.type} /> {f.name}</span>
                                                <ul className="ml-8 list-disc text-xs text-gray-400">
                                                    <li>Behavior: {f.behavior}</li>
                                                    <li className="italic">"{f.description}"</li>
                                                </ul>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiPlanetPanel;
