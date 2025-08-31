import ApiPlanetPanel from './ApiPlanetPanel'; // Assuming this is where planet details are shown

const Sidebar = ({ activeSystem, setActiveSystem, setShowSystemMap }) => {
    return (
        // --- THIS IS THE LINE TO CHANGE ---
        // I've set an explicit width of w-96 (384px). You can adjust this to your liking.
        // I also added a border and a slightly transparent background for a better look.
        <aside className="w-96 bg-gray-900/80 border-r-2 border-green-500/50 p-4 flex flex-col overflow-y-auto">
            {activeSystem ? (
                <div>
                    <h2 className="text-2xl font-bold text-green-400">{activeSystem.starName}</h2>
                    <p className="text-sm text-gray-400 mb-4">{activeSystem.starDescription}</p>

                    <button
                        onClick={() => setShowSystemMap(true)}
                        className="w-full mb-4 px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors"
                    >
                        View Orbital Map
                    </button>

                    <div className="space-y-2">
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
