// Updated Sidebar.jsx with Home System Button
import { generateMineral } from '@utils/mineralUtils';
import { Crown, Diameter, Droplet, Earth, Factory, FlaskConical, LandPlot, MapPin, MapPlus, Radiation, ThermometerSnowflake, ThermometerSun, Wind } from 'lucide-react';
import { useMemo, useState } from 'react';
import PlanetMapModal from './PlanetMapModal';

const PlanetPanel = ({ planet, factionColor, onMapClick }) => {
    const [open, setOpen] = useState(false);

    const resourceList = useMemo(() => {
        const resources = [];
        const count = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < count; i++) {
            const mineral = generateMineral(planet.type);
            resources.push(
                <li key={i} className="text-sm text-gray-200">
                    <FlaskConical className="inline w-4 h-4 mr-1 text-pink-400" />
                    {mineral.mineralName} ({mineral.elements.join(', ')})
                    {mineral.unknownElements && (
                        <span className="text-purple-400"> + {mineral.unknownElements.map(e => e.symbol).join(', ')} (Unknown)</span>
                    )}
                </li>
            );
        }
        return resources;
    }, [planet.type]);

    return (
        <div className="border-t border-gray-700 py-2">
            <button
                className="w-full text-left text-lg text-yellow-300 font-semibold hover:text-yellow-200"
                onClick={() => setOpen(!open)}
            >
                {open ? '▼' : '▶'} <span style={{ color: factionColor }}>{planet.name}</span> <span className="text-sm text-gray-400">({planet.type})</span>
            </button>

            {open && (
                <div className="ml-4 mt-1 space-y-2 pb-5">
                    <div>
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                            <Earth className="w-4 h-4" /> Planetary Details
                        </div>
                        <ul className="ml-4 list-disc text-gray-200 text-sm">
                            <li><LandPlot className="inline w-4 h-4 mr-1 text-gray-400" /><strong>Type:</strong> {planet.type}</li>
                            <li><Diameter className="inline w-4 h-4 mr-1 text-gray-400" /><strong>Size:</strong> {planet.size > 6 ? 'Large' : planet.size > 3 ? 'Medium' : 'Small'}</li>
                            <li><MapPlus className="inline w-4 h-4 mr-1 text-gray-400" /><strong>Map:</strong><button onClick={() => onMapClick(planet)} className="ml-2 text-green-400 hover:text-green-300">
                                Open Map
                            </button></li>
                        </ul>
                    </div>

                    {planet.economy && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <Factory className="w-4 h-4" /> Economy
                            </div>
                            <p className="ml-4 text-sm text-gray-200"><strong>{planet.economy.name}</strong></p>
                            <p className="ml-4 text-xs text-gray-400 italic">{planet.economy.description}</p>
                        </div>
                    )}

                    {planet.settlements && (
                        <div>
                            <div className="flex items-center gap-1 text-orange-400 font-bold">
                                <Factory className="w-4 h-4" /> Settlements
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
                    )}

                    <div>
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                            <FlaskConical className="w-4 h-4" /> Resources
                        </div>
                        <ul className="ml-4 list-disc text-gray-200">
                            {resourceList}
                        </ul>
                    </div>

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

const Sidebar = ({ selectedStar }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const home = JSON.parse(localStorage.getItem('homeSystem') || '{}');

    const handleMapClick = (planet) => {
        setSelectedPlanet(planet);
        setIsModalOpen(true);
    };

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
                    <p className="text-green-400"><strong>Type:</strong> {selectedStar.type}</p>
                    <p className="text-green-400"><strong>Temperature:</strong> {selectedStar.temp}</p>
                    <p className="text-green-400"><strong>Faction:</strong> {selectedStar.faction?.name || 'Unknown'}</p>
                    <p className="text-green-400"><strong>Symbol:</strong> {selectedStar.faction?.symbol || 'N/A'}</p>
                    <p className="mt-2 text-base text-gray-300">{selectedStar.description}</p>

                    {selectedStar.name === home.name ? (
                        <button
                            onClick={() => {
                                localStorage.removeItem('homeSystem');
                                alert(`Home system cleared.`);
                            }}
                            className="mt-3 px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                        >
                            Unset Home System
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                localStorage.setItem('homeSystem', JSON.stringify({
                                    name: selectedStar.name,
                                    x: selectedStar.x,
                                    y: selectedStar.y
                                }));
                                alert(`${selectedStar.name} is now your home system.`);
                            }}
                            className="mt-3 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                            Set as Home System
                        </button>
                    )}


                    <div className="mt-4">
                        <h3 className="text-lg font-bold text-yellow-400">Planetary System</h3>
                        {selectedStar.planets.map((planet, index) => (
                            <PlanetPanel
                                key={index}
                                planet={planet}
                                factionColor={selectedStar.faction?.color || '#FFFFFF'}
                                onMapClick={handleMapClick}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold text-orange-400">Welcome to StarWeave '78</h2>
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