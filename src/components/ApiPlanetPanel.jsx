import {
    Biohazard,
    Bug,
    CheckCircle2,
    CircleHelp,
    Clock,
    Cloudy,
    Cpu, Crown, Diameter, Droplet, Earth,
    Feather, Fish, FlaskConical, Flower, Gauge, HandCoins, Landmark, Leaf,
    Moon, MousePointer, Octagon,
    Orbit,
    PawPrint, Radiation, Shell, Shrub, Sparkles, Sprout,
    TestTube2,
    ThermometerSnowflake, ThermometerSun, TreePalm, TreePine, Turtle,
    Users,
    Waves, Wind,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

// --- Helper Sub-Component for a single expandable section ---
const InfoSection = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const IconComponent = icon;
    return (
        <div>
            <button
                className="w-full flex items-center gap-2 font-bold text-green-300 hover:text-green-200 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <IconComponent size={16} /> {isOpen ? '▼' : '▶'} {title}
            </button>
            {isOpen && (
                <div className="ml-4 mt-1 pt-2 border-l border-gray-700 pl-4 text-xs">
                    {children}
                </div>
            )}
        </div>
    );
};

const toSentenceCase = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const FloraItem = ({ flora }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-l border-gray-700 pl-3">
            <button
                className="w-full text-left text-gray-300 font-semibold hover:text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FloraIcon type={flora.type} /> {isOpen ? '▼' : '▶'} {flora.name}
                <span className="italic text-gray-500 ml-2">({toSentenceCase(flora.rarity)})</span>
            </button>

            {isOpen && (
                <div className="ml-8 mt-1 text-xs text-gray-400 space-y-1">
                    <p><strong>Appearance:</strong> {toSentenceCase(flora.appearance)}</p>
                    <p><strong>Utility:</strong> {flora.utility}</p>
                    <div className="flex flex-wrap gap-x-4">
                        <span className={flora.edible ? 'text-green-400' : 'text-red-400'}>
                            {flora.edible ? <CheckCircle2 size={12} className="inline mr-1" /> : <XCircle size={12} className="inline mr-1" />}
                            Edible
                        </span>
                        <span className={!flora.poisonous ? 'text-green-400' : 'text-red-400'}>
                            {!flora.poisonous ? <CheckCircle2 size={12} className="inline mr-1" /> : <XCircle size={12} className="inline mr-1" />}
                            Non-Poisonous
                        </span>
                        <span className={flora.cultivatable ? 'text-green-400' : 'text-gray-500'}>
                            {flora.cultivatable ? <CheckCircle2 size={12} className="inline mr-1" /> : <XCircle size={12} className="inline mr-1" />}
                            Cultivatable
                        </span>
                        <span className={flora.sentient ? 'text-purple-400' : 'text-gray-500'}>
                            {flora.sentient ? <TestTube2 size={12} className="inline mr-1" /> : ''}
                            {flora.sentient && 'Sentient'}
                        </span>
                    </div>
                    {flora.notes && (
                        <p className="italic text-cyan-400 pt-1">"{flora.notes}"</p>
                    )}
                </div>
            )}
        </div>
    );
};


const ApiPlanetPanel = ({ planet }) => {
    if (!planet) return null;


    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-xl font-bold text-cyan-300">{planet.planetName}</h4>
            <p className="text-sm text-gray-500 mb-3">{planet.planetType} World</p>

            <div className="space-y-3">
                <InfoSection title="Planetary Details" icon={Earth}>
                    <ul className="list-disc list-inside space-y-1">
                        <li><Diameter size={14} className="inline mr-1" />Size: {planet.planetSize}</li>
                        <li><Gauge size={14} className="inline mr-1" />Gravity: {planet.gravity}g</li>
                        <li><Clock size={14} className="inline mr-1" />Day: {planet.rotationalPeriod} hrs</li>
                        <li><Orbit size={14} className="inline mr-1" />Year: {planet.orbitalPeriod} days</li>
                    </ul>
                </InfoSection>

                {planet.planetConditions && (
                    <InfoSection title="Conditions" icon={Cloudy}>
                        <ul className="list-disc list-inside space-y-1">
                            <li><Wind size={14} className="inline mr-1" />{planet.planetConditions.wind}</li>
                            <li><ThermometerSun size={14} className="inline mr-1" />{planet.planetConditions.temperature}</li>
                            <li><ThermometerSnowflake size={14} className="inline mr-1" />{planet.planetConditions.nightTemperature}</li>
                            <li><Biohazard size={14} className="inline mr-1" />{planet.planetConditions.toxicity}</li>
                            <li><Radiation size={14} className="inline mr-1" />{planet.planetConditions.radiation}</li>
                        </ul>
                    </InfoSection>
                )}

                {planet.hasCivilization && (
                    <>
                        <InfoSection title="Civilization" icon={HandCoins}>
                            <p className="font-semibold text-gray-300">{planet.economy?.name || 'N/A'}</p>
                            <p className="italic text-gray-400 mb-2">{planet.economy?.description}</p>
                            <p className="font-semibold text-gray-300">{planet.industry?.name || 'N/A'}</p>
                            <p className="italic text-gray-400">{planet.industry?.description}</p>
                        </InfoSection>

                        <InfoSection title={`Inhabitants (${planet.inhabitants?.length || 0})`} icon={Users}>
                            <ul className="list-disc list-inside space-y-1">
                                {planet.inhabitants.map((s, i) => (
                                    <li key={i}>{s.speciesName} ({s.populationPercentage}%) - <span className="italic text-gray-500">{s.type}</span></li>
                                ))}
                            </ul>
                        </InfoSection>

                        <InfoSection title={`Settlements (${planet.settlements?.length || 0})`} icon={Landmark}>
                            <div className="space-y-2">
                                {planet.settlements.map((s, i) => (
                                    <div key={i}>
                                        <p className="font-semibold text-gray-300">{s.isCapital && <Crown size={12} className="inline mr-1 text-yellow-400" />} {s.name} (Pop: {s.population.toLocaleString()})</p>
                                        <p className="text-gray-500 text-xs">{s.layout.theme} | {s.layout.condition}</p>
                                        <ul className="list-disc list-inside ml-4 text-gray-400">
                                            {s.layout.buildings.map((b, j) => <li key={j}>{b.name} <span className="text-gray-600">({b.type})</span></li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </InfoSection>
                    </>
                )}

                {planet.moons?.length > 0 && (
                    <InfoSection title={`Moons (${planet.moons.length})`} icon={Moon}>
                        <ul className="space-y-2">
                            {planet.moons.map((moon, i) => (
                                <li key={i}>
                                    <p className="font-semibold text-gray-300">{moon.moonName} <span className="text-gray-500">({moon.moonType})</span></p>
                                    <ul className="ml-4 list-disc text-gray-400">
                                        <li>Gravity: {moon.gravity}g</li>
                                        <li>Orbit: {moon.orbitalPeriod} hrs</li>
                                        {moon.moonSettlements?.length > 0 && (
                                            <li>Settlements: {moon.moonSettlements.join(', ')}</li>
                                        )}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </InfoSection>
                )}

                {planet.resourceList?.length > 0 && (
                    <InfoSection title="Resources" icon={FlaskConical}>
                        <ul className="list-disc list-inside space-y-1">
                            {planet.resourceList.map((res, i) => (
                                <li key={i}>
                                    <span className="font-semibold text-gray-300">{res.mineralName}</span>
                                    <div className="pl-4 text-gray-500">
                                        <span>Elements: {res.elements.join(', ')}</span>
                                        {res.unknownElements?.length > 0 && (
                                            <span className="text-purple-400 ml-2">
                                                + {res.unknownElements.map(e => e.symbol).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </InfoSection>
                )}

                {planet.floraList?.length > 0 && (
                    <InfoSection title={`Flora (${planet.floraList.length})`} icon={Sprout}>
                        <div className="space-y-2">
                            {planet.floraList.map((f, i) => <FloraItem key={i} flora={f} />)}
                        </div>
                    </InfoSection>
                )}

                {planet.faunaList?.length > 0 && (
                    <InfoSection title="Fauna" icon={PawPrint}>
                        <ul className="space-y-1">
                            {planet.faunaList.map((f, i) => <li key={i}><FaunaIcon type={f.type} />{f.name}</li>)}
                        </ul>
                    </InfoSection>
                )}

            </div>
        </div>
    );
};

// You'll need to re-add the FloraIcon and FaunaIcon sub-components here
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

export default ApiPlanetPanel;
