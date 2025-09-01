import { Orbit, ShieldCheck, Sun } from 'lucide-react'; // Added new icons
import ApiPlanetPanel from './ApiPlanetPanel';

const Sidebar = ({ activeSystem, setActiveSystem, setShowSystemMap }) => {
    return (
        <aside className="w-96 bg-gray-900/80 border-r-2 border-green-500/50 p-4 flex flex-col overflow-y-auto">
            {activeSystem ? (
                <div>
                    {/* --- STAR HEADER --- */}
                    <h2 className="text-2xl font-bold text-green-400">{activeSystem.starName}</h2>
                    <p className="text-sm text-gray-400 mb-4 italic">"{activeSystem.starDescription}"</p>

                    {/* --- STAR DETAILS --- */}
                    <div className="mb-4 text-sm border-l-2 border-green-500/50 pl-3 space-y-2">
                        <div>
                            <div className="flex items-center gap-2 font-semibold text-cyan-300">
                                <Sun size={16} /> Star Details
                            </div>
                            <ul className="ml-4 text-gray-300 list-disc list-inside">
                                <li>Type: {activeSystem.starType}</li>
                                <li>Temp: {activeSystem.starTemp}</li>
                            </ul>
                        </div>

                        {activeSystem.starFaction && (
                            <div>
                                <div className="flex items-center gap-2 font-semibold text-cyan-300">
                                    <ShieldCheck size={16} /> Controlling Faction
                                </div>
                                <ul className="ml-4 text-gray-300 list-disc list-inside">
                                    <li>{activeSystem.starFaction.name}</li>
                                    <li className="italic text-gray-400">"{activeSystem.starFaction.alignment}"</li>
                                </ul>
                            </div>
                        )}

                        {activeSystem.spaceStation && (
                            <div>
                                <div className="flex items-center gap-2 font-semibold text-cyan-300">
                                    <Orbit size={16} /> Orbital Station
                                </div>
                                <ul className="ml-4 text-gray-300 list-disc list-inside">
                                    <li>{activeSystem.spaceStation.stationName}</li>
                                    <li className="capitalize text-gray-400">({activeSystem.spaceStation.stationType})</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowSystemMap(true)}
                        className="w-full mb-4 px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors"
                    >
                        View Orbital Map
                    </button>

                    {/* --- PLANET LIST --- */}
                    <h3 className="text-xl font-bold text-green-400 border-t border-gray-700 pt-2 mt-2">Planets</h3>
                    <div className="space-y-2 mt-2">
                        {activeSystem.planets.map(planet => (
                            <ApiPlanetPanel key={planet.planetId} planet={planet} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-gray-500">
                    <h2 className="text-2xl font-bold text-gray-600">No System Selected</h2>
                    <p>Click on a star in the galaxy map to view its details.</p>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
