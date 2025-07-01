import { generateMineral, mineableElements } from '@utils/mineralUtils'; // Import mineral utils
import { useEffect, useState } from 'react';

const Sidebar = ({ selectedStar, onMapClick }) => {
    const [content, setContent] = useState(null);

    useEffect(() => {
        if (selectedStar) {

            setContent(
                <div>
                    <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: selectedStar.faction?.color || '#FFFFFF' }}></div>
                        <h2 className="text-2xl font-bold text-yellow-400">{selectedStar.name}</h2>
                    </div>
                    <p className="text-green-400"><strong>Type:</strong> {selectedStar.type}</p>
                    <p className="text-green-400"><strong>Temperature:</strong> {selectedStar.temp}</p>
                    <p className="text-green-400"><strong>Faction:</strong> {selectedStar.faction?.name || 'Unknown'}</p>
                    <p className="text-green-400"><strong>Symbol:</strong> {selectedStar.faction?.symbol || 'N/A'}</p>
                    <p className="mt-2 text-base text-gray-300">{selectedStar.description}</p>
                    <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        <h3 className="text-lg font-bold text-yellow-400">Planetary System</h3>
                        {selectedStar.planets.map((planet, index) => (
                            <div key={index} className="text-base text-gray-300">
                                <p>
                                    <strong style={{ color: selectedStar.faction?.color || '#FFFFFF' }}>{planet.name}</strong> ({planet.type})
                                    {planet.settlements && (
                                        <span
                                            className="text-green-400 hover:text-green-300 cursor-pointer ml-2"
                                            onClick={() => onMapClick(planet)}
                                        >
                                            [map]
                                        </span>
                                    )}
                                </p>
                                <p>Size: {planet.size > 6 ? 'Large' : planet.size > 3 ? 'Medium' : 'Small'}</p>
                                {planet.settlements && (
                                    <div className="ml-4 mt-1">
                                        <h4 className="text-md font-bold text-orange-400">Settlements:</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-200">
                                            {planet.settlements.map((settlement, sIndex) => (
                                                <li key={sIndex}>{settlement.name}{settlement.isCapital ? ' *' : ''} (Pop: {settlement.population.toLocaleString()})</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="ml-4 mt-1">
                                    <h4 className="text-md font-bold text-orange-400">Resources:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-200">
                                        {(() => {
                                            const resources = [];
                                            const resourceCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 resources
                                            for (let i = 0; i < resourceCount; i++) {
                                                const mineral = generateMineral(planet.type);
                                                resources.push(
                                                    <li key={i}>
                                                        {mineral.mineralName} ({mineral.elements.join(', ')})
                                                        {mineral.unknownElements && (
                                                            <span> + {mineral.unknownElements.map(ue => ue.symbol).join(', ')} (Unknown)</span>
                                                        )}
                                                    </li>
                                                );
                                            }
                                            // Fallback to hardcoded resources if no valid minerals
                                            if (resources.length === 0) {
                                                const fallback = Object.values(mineableElements[0])
                                                    .find(category => category.planetTypes.includes(planet.type));
                                                if (fallback) {
                                                    fallback.elements.forEach((el, idx) => {
                                                        resources.push(
                                                            <li key={`fallback-${idx}`}>
                                                                {el.name} ({el.symbol})
                                                            </li>
                                                        );
                                                    });
                                                }
                                            }
                                            return resources;
                                        })()}
                                    </ul>
                                </div>
                                <div className="ml-4 mt-1">
                                    <h4 className="text-md font-bold text-orange-400">Compound Minerals:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-200">
                                        {planet.minerals && planet.minerals.length > 0 ? (
                                            planet.minerals.map((mineral, mIndex) => (
                                                <li key={mIndex}>
                                                    {mineral.mineralName} - {mineral.elements.join(', ')}
                                                    {mineral.unknownElements && (
                                                        <span> + {mineral.unknownElements.map(ue => ue.symbol).join(', ')} (Unknown)</span>
                                                    )}
                                                </li>
                                            ))
                                        ) : (
                                            <li>Currently empty</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="ml-4 mt-1">
                                    <h4 className="text-md font-bold text-orange-400">Conditions:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-200">
                                        <li>Typical Weather: {planet.weather || (planet.type === 'Gas Giant' && 'Stormy') || (planet.type === 'Rocky' && 'Arid') || (planet.type === 'Radiated' && 'Harsh') || (planet.type === 'Ice World' && 'Icy Blizzards') || 'Calm'}</li>
                                        <li>Air Temp: {planet.temperature || (planet.type === 'Gas Giant' && 'Variable') || (planet.type === 'Rocky' && 'Temperate') || (planet.type === 'Radiated' && 'Hot') || (planet.type === 'Ice World' && 'Cold') || 'Temperate'}</li>
                                        <li>Night Temp: {planet.nightTemperature || (planet.type === 'Gas Giant' && 'Extreme Drop') || (planet.type === 'Rocky' && 'Mild') || (planet.type === 'Radiated' && 'Warm') || (planet.type === 'Ice World' && 'Freezing') || 'Stable'}</li>
                                        <li>Winds: {planet.wind || (planet.type === 'Gas Giant' && 'Hurricane-force') || (planet.type === 'Rocky' && 'Gentle') || (planet.type === 'Radiated' && 'Strong') || (planet.type === 'Ice World' && 'Gentle') || 'Moderate'}</li>
                                        <li>Toxicity Levels: {planet.toxicity || (planet.type === 'Gas Giant' && 'High') || (planet.type === 'Rocky' && 'Low') || (planet.type === 'Radiated' && 'High') || (planet.type === 'Ice World' && 'Low') || 'Low'}</li>
                                        <li>Radiation Levels: {planet.radiation || (planet.type === 'Gas Giant' && 'Elevated') || (planet.type === 'Rocky' && 'Safe') || (planet.type === 'Radiated' && 'Hazardous') || (planet.type === 'Ice World' && 'Safe') || 'Safe'}</li>
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            setContent(
                <div>
                    <h2 className="text-2xl font-bold text-orange-400">Welcome to StarWeave '78</h2>
                    <p className="text-gray-300">Click a star to explore its system. Journey through the cosmos and uncover faction secrets!</p>
                </div>
            );
        }
    }, [selectedStar]);

    return (
        <div className="w-1/4 bg-gray-900 text-white font-mono p-4 h-screen overflow-y-auto shadow-[0_0-10px_#0f0]">
            {content}
        </div>
    );
};

export default Sidebar;