import { Database, Map, Orbit, Zap } from 'lucide-react';
import ModernPlanetCard from './ModernPlanetCard.jsx';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            <Icon size={20} />
        </div>
    </div>
);

const ModernSidebar = ({ activeSystem, setShowSystemMap, stats }) => {
    // --- MODE 1: DASHBOARD (No System Selected) ---
    if (!activeSystem) {
        return (
            <aside className="w-1/3 min-w-[350px] max-w-md h-full bg-slate-50 border-r border-slate-200 flex flex-col shadow-2xl z-20 overflow-hidden">
                <div className="p-8 border-b border-slate-200 bg-white">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">ATLAS <span className="text-indigo-600">OS</span></h1>
                    <p className="text-sm text-slate-500 mt-1">Galactic Cartography & Analysis Tool</p>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto bg-slate-50 flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase">Database Status</h3>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                        </span>
                    </div>

                    {/* Stats Grid - You can pass real props here later */}
                    <div className="grid grid-cols-1 gap-3">
                        <StatCard label="Total Systems" value={stats?.totalSystems || "10,402"} icon={Database} color="bg-indigo-500" />
                        <StatCard label="Mapped Planets" value={stats?.totalPlanets || "52,190"} icon={Map} color="bg-emerald-500" />
                        <StatCard label="Anomalies" value="142" icon={Zap} color="bg-amber-500" />
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                        <strong>Ready for Input:</strong> Select a star system on the viewport to initialize detailed scanning protocols.
                    </div>
                </div>
            </aside>
        );
    }

    // --- MODE 2: SYSTEM DETAILS (System Selected) ---
    return (
        <aside className="w-1/3 min-w-[350px] max-w-md h-full bg-slate-50 border-r border-slate-200 flex flex-col shadow-2xl z-20 overflow-hidden">
            {/* Header */}
            <div className="bg-white p-6 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">{activeSystem.starName}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                                Class {activeSystem.starType}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                                {activeSystem.starX?.toFixed(2)}, {activeSystem.starY?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    {/* Faction Icon Placeholder */}
                    <div
                        className="w-12 h-12 rounded-lg border border-slate-200 flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: activeSystem.starFaction?.color ? `${activeSystem.starFaction.color}20` : '#f1f5f9' }}
                    >
                        {activeSystem.starFaction?.symbol || 'Unknown'}
                    </div>
                </div>

                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                    {activeSystem.starDescription}
                </p>

                <button
                    onClick={() => setShowSystemMap(true)}
                    className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Orbit size={18} /> Enter Orbital View
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
                <div className="flex items-center justify-between px-2 py-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planetary Bodies</h3>
                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{activeSystem.planets.length}</span>
                </div>

                {activeSystem.planets.map(planet => (
                    <ModernPlanetCard key={planet.planetId} planet={planet} />
                ))}
            </div>
        </aside>
    );
};

export default ModernSidebar;