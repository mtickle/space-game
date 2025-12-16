import { Building, Database, Globe, Map as MapIcon, Users } from 'lucide-react';
import ApiPlanetPanel from './ApiPlanetPanel';


const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-gray-900/80 p-4 rounded-xl border border-green-500/30 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-green-400 font-mono">{value}</p>
        </div>
        <div className={`p-2 rounded-full bg-black border border-green-500/20 text-green-400`}>
            <Icon size={20} />
        </div>
    </div>
);

const ItemCard = ({ label, value, descriptiveText, icon: Icon, color }) => (
    <div className="bg-gray-900/80 p-4 rounded-xl border border-green-500/30 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-green-400 font-mono">{value}</p>
            <p className="text-xs text-gray-500">{descriptiveText}</p>
        </div>
        <div className={`p-2 rounded-full bg-black border border-green-500/20 text-green-400`}>
            <Icon size={20} />
        </div>
    </div>
);

const Sidebar = ({ activeSystem, setActiveSystem, setShowSystemMap, stats }) => {

    if (!activeSystem) {
        return (
            <aside className="w-1/3 max-w-lg bg-gray-900 bg-opacity-80 border-l-2 border-gray-900 p-6 flex flex-col h-full z-20">
                <div className=" border-green-500/30 pb-4 mb-6">
                    <h2 className="text-3xl font-bold text-green-400" style={{ textShadow: '0 0 5px rgba(52, 211, 153, 0.5)' }}>Database Status</h2>
                    <p className="text-sm text-gray-400 italic mt-1">Select a star system on the viewport to initialize detailed scanning protocols.</p>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                        <StatCard
                            label="Total Systems"
                            value={stats?.starCount?.toLocaleString() || "0"}
                            icon={Database}
                        />
                        <StatCard
                            label="Mapped Planets"
                            value={stats?.planetCount?.toLocaleString() || "0"}
                            icon={MapIcon}
                        />
                    </div>
                </div>
            </aside>
        );
    }

    // --- MODE 2: SYSTEM DETAILS (System Selected) ---
    const { starName, starDescription, starFaction, spaceStation, planets } = activeSystem;

    return (
        <aside className="w-1/3 max-w-lg bg-gray-900 bg-opacity-80 border-l-2 border-gray-900 flex flex-col h-full z-20">
            <div className="p-6 border-b border-green-500/30">
                <h2 className="text-3xl font-bold text-green-400" style={{ textShadow: '0 0 5px rgba(52, 211, 153, 0.5)' }}>{starName}</h2>
                <p className="text-sm text-gray-400 italic mt-1">{starDescription}</p>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3"></div>
                    {starFaction && (
                        <ItemCard
                            label="Controlling Faction"
                            value={starFaction.name}
                            icon={Users}
                            color={starFaction.color}
                            descriptiveText={starFaction.alignment}
                        />
                    )}

                    {spaceStation && (
                        <ItemCard
                            label="Primary Space Station"
                            value={spaceStation.stationName}
                            icon={Building}
                            color={starFaction.color}
                            descriptiveText={spaceStation.stationType}
                        />
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <h3 className="text-xl font-bold text-green-400 mb-2  border-green-500/30 pb-2 flex items-center gap-2">
                    <Globe size={20} /> System Planets
                </h3>
                {planets.map(planet => (
                    <ApiPlanetPanel key={planet.planetId} planet={planet} />
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;