import { Building, Database, Globe, Map, Users, Zap } from 'lucide-react';
import ApiPlanetPanel from './ApiPlanetPanel';

// --- StatCard Helper (Styled for Dark/Retro Theme) ---
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

const Sidebar = ({ activeSystem, setActiveSystem, setShowSystemMap, stats }) => {
    // --- MODE 1: DASHBOARD (No System Selected) ---
    if (!activeSystem) {
        return (
            <aside className="w-1/3 max-w-lg bg-black bg-opacity-80 border-l-2 border-green-500/50 p-6 flex flex-col h-full z-20">
                <div className="border-b border-green-500/30 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-green-400 tracking-wider">SYSTEM SCAN</h2>
                    <p className="text-sm text-green-600 mt-1 font-mono">Galactic Cartography Mainframe</p>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-green-700 uppercase">Database Status</h3>
                        <span className="flex items-center gap-2 text-xs font-medium text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-500/30">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ONLINE
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        <StatCard label="Total Systems" value={stats?.totalSystems || "0"} icon={Database} />
                        <StatCard label="Mapped Planets" value={stats?.totalPlanets || "0"} icon={Map} />
                        <StatCard label="Anomalies" value="142" icon={Zap} />
                    </div>

                    <div className="mt-8 p-4 bg-green-900/10 border border-green-500/30 rounded-lg text-sm text-green-300 font-mono">
                        <strong className="text-green-400">Ready for Input:</strong> Select a star system on the viewport to initialize detailed scanning protocols.
                    </div>
                </div>
            </aside>
        );
    }

    // --- MODE 2: SYSTEM DETAILS (System Selected) ---
    const { starName, starDescription, starFaction, spaceStation, planets } = activeSystem;

    return (
        <aside className="w-1/3 max-w-lg bg-black bg-opacity-80 border-l-2 border-green-500/50 flex flex-col h-full z-20">
            <div className="p-6 border-b border-green-500/30 bg-black/40">
                <h2 className="text-3xl font-bold text-green-400" style={{ textShadow: '0 0 5px rgba(52, 211, 153, 0.5)' }}>{starName}</h2>
                <p className="text-sm text-gray-400 italic mt-1">{starDescription}</p>

                {starFaction && (
                    <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-lg text-green-300 flex items-center gap-2">
                            <Users size={18} /> Controlling Faction
                        </h3>
                        <p className="text-base" style={{ color: starFaction.color }}>{starFaction.name}</p>
                        <p className="text-xs text-gray-500">{starFaction.alignment}</p>
                    </div>
                )}
                {spaceStation && (
                    <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-lg text-green-300 flex items-center gap-2">
                            <Building size={18} /> Major Installation
                        </h3>
                        <p className="text-base" style={{ color: spaceStation.factionColor }}>{spaceStation.stationName}</p>
                        <p className="text-xs text-gray-500">Type: {spaceStation.stationType}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <h3 className="text-xl font-bold text-green-400 mb-2 border-b border-green-500/30 pb-2 flex items-center gap-2">
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