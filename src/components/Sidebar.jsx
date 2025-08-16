import ApiPlanetPanel from './ApiPlanetPanel'; // Use the new, API-aware panel

const Sidebar = ({ activeSystem, setActiveSystem, setShowSystemMap }) => {

    // --- Helper function to get a unique list of factions from the planets ---
    const getSystemFactions = () => {
        if (!activeSystem || !activeSystem.planets) return [];
        const factions = activeSystem.planets.map(p => p.starFaction?.name).filter(Boolean);
        return [...new Set(factions)];
    };

    return (
        <div className="w-80 bg-black bg-opacity-80 border-r-2 border-green-500 text-white font-mono flex flex-col h-full">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-green-400">
                    {activeSystem ? activeSystem.starName : 'No System Selected'}
                </h2>
                {activeSystem && (
                    <p className="text-sm text-gray-400">{activeSystem.starDescription}</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeSystem ? (
                    activeSystem.planets.map(planet => (
                        <ApiPlanetPanel
                            key={planet.planetId}
                            planet={planet} // Pass the full planet object
                            factionColor={activeSystem.starFaction?.color || '#FFFFFF'}
                        />
                    ))
                ) : (
                    <div className="p-4 text-gray-500">
                        <p>Select a star system to view planetary details.</p>
                    </div>
                )}
            </div>

            {activeSystem && (
                <div className="p-4 border-t border-gray-700">
                    <button
                        className="w-full py-3 px-4 bg-green-600/80 text-white rounded-lg hover:bg-green-500 transition-colors"
                        onClick={() => setShowSystemMap(true)}
                    >
                        View System Map
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
