import { ChevronLeft, ChevronRight, MapPin, Rocket } from 'lucide-react';
import { useState } from 'react';

const VisitedSystemsPanel = ({ stars, goToSystem }) => {
    // Let's default it to open so you can immediately see the new layout!
    const [isOpen, setIsOpen] = useState(true);

    // 1. Safely parse local storage to prevent JSON crash if data is corrupted
    let visitedIds = [];
    try {
        visitedIds = JSON.parse(localStorage.getItem('visitedStars') || '[]');
    } catch (e) {
        console.error("Failed to parse visited stars:", e);
    }

    // 2. Ensure stars array exists before filtering
    if (!stars || !Array.isArray(stars)) return null;

    // THE FIX: We must check s?.id because ApiStarMap saves fullSystem.starId to local storage!
    // AND we sort it so the newest additions (highest index in local storage) are at the top.
    const visited = stars
        .filter(s => visitedIds.includes(s?.id))
        .sort((a, b) => visitedIds.indexOf(b?.id) - visitedIds.indexOf(a?.id));

    // If you haven't visited any systems yet, keep the panel hidden
    if (visited.length === 0) return null;

    return (
        // Fixed positioning perfectly wedges it between your h-16 Header and h-8 Footer on the right side
        <aside
            className={`fixed top-16 bottom-8 right-0 w-80 bg-gray-900 bg-opacity-95 border-l-2 border-green-500/50 shadow-[-15px_0_30px_rgba(0,0,0,0.6)] z-40 flex flex-col transition-transform duration-300 ease-in-out backdrop-blur-md ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
        >
            {/* Toggle Tab (Attached to the outside left edge of the sidebar) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-6 -left-10 w-10 h-14 bg-gray-900 bg-opacity-95 border-y-2 border-l-2 border-green-500/50 rounded-l-md flex items-center justify-center text-green-400 hover:text-green-300 hover:bg-gray-800 transition-colors backdrop-blur-md shadow-[-5px_0_10px_rgba(0,0,0,0.3)]"
            >
                {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>

            {/* Sidebar Header */}
            <div className="p-5 border-b border-green-500/30 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2 text-green-400 font-bold tracking-wider" style={{ textShadow: '0 0 5px rgba(52, 211, 153, 0.3)' }}>
                    <MapPin size={18} className="text-yellow-500" />
                    VISITED SYSTEMS
                </div>
                <div className="text-xs font-mono text-green-600 bg-green-900/20 px-2 py-1 rounded border border-green-800/50">
                    {visited.length} LOGGED
                </div>
            </div>

            {/* Scrollable Systems List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {visited.map((star, index) => {
                    // --- SAFE FALLBACKS ---
                    const factionName = typeof star?.faction === 'string'
                        ? star.faction
                        : (star?.faction?.allianceName || star?.faction?.name || 'Unaligned System');

                    return (
                        <div
                            key={star?.id || index}
                            className="bg-black/60 border border-green-700/40 p-4 rounded-lg hover:border-green-500/80 hover:bg-green-900/10 transition-all group shadow-sm"
                        >
                            <div className="font-bold text-green-300 text-base mb-1 flex items-center gap-2">
                                <span className="text-yellow-500 text-sm">★</span>
                                {star?.name || 'Unknown Star'}
                            </div>
                            <div className="text-[10px] text-green-600/80 font-mono mb-3 uppercase tracking-wider pb-2 border-b border-green-800/30">
                                ID: {star?.id || 'N/A'}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div>
                                    <div className="text-[9px] text-green-600 uppercase tracking-widest font-bold">Faction</div>
                                    <div className="text-xs text-gray-300 truncate" title={factionName}>
                                        {factionName}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-green-600 uppercase tracking-widest font-bold">Planets</div>
                                    <div className="text-xs text-gray-300">
                                        {star?.planets?.length || 'Scanning...'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => goToSystem && goToSystem(star)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-900/30 border border-green-500/40 text-green-400 font-bold tracking-widest text-xs rounded hover:bg-green-700/60 hover:text-white transition-all duration-200"
                            >
                                <Rocket size={14} />
                                INITIALIZE WARP
                            </button>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default VisitedSystemsPanel;