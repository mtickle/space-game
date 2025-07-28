import { getFaunaIcon } from '@utils/faunaUtils';
import { getFloraIcon } from '@utils/floraUtils';
import { Crown, Diameter, Droplet, Earth, Factory, FlaskConical, HandCoins, LandPlot, MapPin, PawPrint, Radiation, Sprout, ThermometerSnowflake, ThermometerSun, Wind } from 'lucide-react';
import { useState } from 'react';

const PlanetPanel = ({ planet, factionColor, onMapClick }) => {
    const [open, setOpen] = useState(false);

    console.log(planet)

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




                    {planet.resources?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <FlaskConical className="w-4 h-4" /> Resources
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.resources.map((mineral, i) => (
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


                    {planet.faunaList?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <PawPrint className="w-4 h-4" /> Fauna
                            </div>
                            <ul className="ml-4 list-disc text-gray-200 text-sm">
                                {planet.faunaList.map((f, i) => (
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