// Updated Sidebar.jsx with Home System Button
import { useState } from 'react';
import { useHomeSystem } from '../hooks/useHomeSystem'; // adjust path as needed
import PlanetPanel from './PlanetPanel'; // adjust path as needed


const Sidebar = ({ selectedStar, setActiveSystem, setShowSystemMap }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const home = JSON.parse(localStorage.getItem('homeSystem') || '{}');
    const { homeSystem, setHome, clearHome } = useHomeSystem();

    console.log(selectedStar)

    return (
        <div className="w-1/4 bg-gray-900 text-white font-mono p-4 h-screen overflow-y-auto shadow-[0_0-10px_#0f0] pb-50">
            {selectedStar ? (
                <div>
                    <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: selectedStar.faction?.color || '#FFFFFF' }}></div>
                        <h2 className="text-2xl font-bold text-yellow-400">
                            {selectedStar.name}
                            {selectedStar.name === home.name && (
                                <span className="ml-2 text-green-400 text-sm">(Home)</span>
                            )}
                        </h2>
                    </div>
                    {/* <p className="text-green-400"><strong>Unique ID:</strong> {selectedStar.id}</p> */}
                    <p className="text-green-400"><strong>X:</strong> {selectedStar.x}</p>
                    <p className="text-green-400"><strong>Y:</strong> {selectedStar.y}</p>
                    <p className="text-green-400"><strong>Star Type:</strong> {selectedStar.type}</p>
                    <p className="text-green-400"><strong>Temperature:</strong> {selectedStar.temp}</p>
                    <p className="text-green-400"><strong>Faction:</strong> {selectedStar.faction?.name || 'Unknown'}</p>
                    <p className="text-green-400"><strong>Symbol:</strong> {selectedStar.faction?.symbol || 'N/A'}</p>
                    <p className="mt-2 text-base text-gray-300">{selectedStar.description}</p>

                    <button
                        // *** Use the setShowSystemMap prop received from StarMap ***
                        onClick={() => {
                            setShowSystemMap(true);
                            // Optionally, if activeSystem isn't always set when selectedStar is,
                            // you might want to call setActiveSystem(selectedStar) here
                            // if you haven't already done it in handleClick in StarMap.
                        }}
                        className="mt-2 px-2 py-1 bg-purple-700 text-white text-xs rounded hover:bg-purple-600"
                    >
                        Star System Map
                    </button>&nbsp;


                    {selectedStar.name === homeSystem.name ? (
                        <button
                            onClick={clearHome}
                            className="mt-3 px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                        >
                            Unset Home System
                        </button>
                    ) : (
                        <button
                            onClick={() => setHome({
                                name: selectedStar.name,
                                x: selectedStar.x,
                                y: selectedStar.y
                            })}
                            className="mt-3 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                            Set as Home System
                        </button>
                    )}

                    {Array.isArray(selectedStar.planets) && (
                        <div className="mt-4">
                            <h3 className="text-lg font-bold text-yellow-400">Planetary System</h3>
                            {selectedStar.planets.map((planet, index) => (
                                <PlanetPanel
                                    key={index}
                                    planet={planet}
                                    factionColor={selectedStar.faction?.color || '#FFFFFF'}
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
            {isModalOpen && selectedPlanet && (
                <PlanetMapModal
                    planet={selectedPlanet}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

        </div>
    );
};

export default Sidebar;