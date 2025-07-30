// Updated Sidebar.jsx with Home System Button
import { useState } from 'react';
import { useHomeSystem } from '../hooks/useHomeSystem'; // adjust path as needed
import PlanetPanel from './PlanetPanel'; // adjust path as needed


const Sidebar = ({ activeSystem, setActiveSystem, setShowSystemMap, setShowOrbitalSystemMap }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const home = JSON.parse(localStorage.getItem('homeSystem') || '{}');
    const { homeSystem, setHome, clearHome } = useHomeSystem();

    return (
        <div className="w-1/4 bg-gray-900 text-white font-mono p-4 h-screen overflow-y-auto shadow-[0_0-10px_#0f0] pb-50">
            {activeSystem && activeSystem.starId ? (
                <div>
                    <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: activeSystem.faction?.color || '#FFFFFF' }}></div>
                        <h2 className="text-2xl font-bold text-yellow-400">
                            {activeSystem.starName}
                            {activeSystem.starName === home.name && (
                                <span className="ml-2 text-green-400 text-sm">(Home)</span>
                            )}
                        </h2>
                    </div>
                    <p className="text-green-400"><strong>X:</strong> {activeSystem.starX}</p>
                    <p className="text-green-400"><strong>Y:</strong> {activeSystem.starY}</p>
                    <p className="text-green-400"><strong>Star Type:</strong> {activeSystem.starType}</p>
                    <p className="text-green-400"><strong>Temperature:</strong> {activeSystem.starTemp}</p>
                    <p className="text-green-400"><strong>Faction:</strong> {activeSystem.faction?.name || 'Unknown'}</p>
                    <p className="text-green-400"><strong>Faction Presence:</strong> {activeSystem.spaceStation?.stationName || 'Unknown'}</p>
                    <p className="text-green-400"><strong>Symbol:</strong> {activeSystem.faction?.symbol || 'N/A'}</p>
                    <p className="mt-2 text-base text-gray-300">{activeSystem.starDescription}</p>


                    <button
                        // *** Use the setShowSystemMap prop received from StarMap ***
                        onClick={() => {
                            setShowSystemMap(true);
                        }}
                        className="mt-2 px-2 py-1 bg-purple-700 text-white text-xs rounded hover:bg-purple-600"
                    >
                        Star System Map
                    </button>&nbsp;



                    {activeSystem.starName === homeSystem.name ? (
                        <button
                            onClick={clearHome}
                            className="mt-3 px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                        >
                            Unset Home System
                        </button>
                    ) : (
                        <button
                            onClick={() => setHome({
                                name: activeSystem.starName,
                                x: activeSystem.starX,
                                y: activeSystem.starY
                            })}
                            className="mt-3 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                            Set as Home System
                        </button>
                    )}

                    {Array.isArray(activeSystem.planets) && (
                        <div className="mt-4">
                            <h3 className="text-lg font-bold text-yellow-400">Planetary System</h3>
                            {activeSystem.planets.map((planet, index) => (
                                <PlanetPanel
                                    key={index}
                                    planet={planet}
                                    factionColor={activeSystem.faction?.color || '#FFFFFF'}
                                //onMapClick={handleMapClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold text-orange-400">Welcome</h2>
                    <p className="text-gray-300">Click a star to explore its system. Journey through the cosmos and uncover faction secrets!</p>
                </div>
            )}
            {
                isModalOpen && selectedPlanet && (
                    <PlanetMapModal
                        planet={selectedPlanet}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}

        </div>
    );
};

export default Sidebar;