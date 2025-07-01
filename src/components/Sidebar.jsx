
import { useEffect, useState } from 'react';

const Sidebar = ({ selectedStar, onMapClick }) => {
    const [content, setContent] = useState(null);

    useEffect(() => {
        if (selectedStar) {
            console.log('Selected Star Planets:', selectedStar.planets); // Debug log
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
                                        {planet.type === 'Gas Giant' && [
                                            <li key="h">Hydrogen (Abundant)</li>,
                                            <li key="he">Helium (Moderate)</li>,
                                            <li key="ch4">Methane (Moderate)</li>,
                                            <li key="nh3">Ammonia (Trace)</li>,
                                        ]}
                                        {planet.type === 'Rocky' && [
                                            <li key="fe">Iron (Abundant)</li>,
                                            <li key="al">Aluminum (Moderate)</li>,
                                            <li key="si">Silicon (Moderate)</li>,
                                            <li key="o">Oxygen (Abundant)</li>,
                                        ]}
                                        {planet.type === 'Radioactive' && [
                                            <li key="u">Uranium (Moderate)</li>,
                                            <li key="th">Thorium (Trace)</li>,
                                            <li key="k40">Potassium-40 (Trace)</li>,
                                        ]}
                                        {planet.type === 'Ice World' && [
                                            <li key="h2o">Water Ice (Abundant)</li>,
                                            <li key="co2">Carbon Dioxide (Moderate)</li>,
                                            <li key="n">Nitrogen (Moderate)</li>,
                                            <li key="mg">Magnesium (Trace)</li>,
                                        ]}
                                        {(planet.type !== 'Gas Giant' && planet.type !== 'Rocky' && planet.type !== 'Radioactive' && planet.type !== 'Ice World') && [
                                            <li key="gen1">Titanium (Moderate)</li>,
                                            <li key="gen2">Nickel (Moderate)</li>,
                                            <li key="gen3">Sulfur (Trace)</li>,
                                            <li key="gen4">Calcium (Abundant)</li>,
                                        ]}
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
                                        {planet.type === 'Gas Giant' && [
                                            <li key="weather">Typical Weather: Stormy</li>,
                                            <li key="air">Air Temp: Variable</li>,
                                            <li key="night">Night Temp: Extreme Drop</li>,
                                            <li key="wind">Winds: Hurricane-force</li>,
                                            <li key="tox">Toxicity Levels: High</li>,
                                            <li key="rad">Radiation Levels: Elevated</li>,
                                        ]}
                                        {planet.type === 'Rocky' && [
                                            <li key="weather">Typical Weather: Arid</li>,
                                            <li key="air">Air Temp: Temperate</li>,
                                            <li key="night">Night Temp: Mild</li>,
                                            <li key="wind">Winds: Gentle</li>,
                                            <li key="tox">Toxicity Levels: Low</li>,
                                            <li key="rad">Radiation Levels: Safe</li>,
                                        ]}
                                        {planet.type === 'Radioactive' && [
                                            <li key="weather">Typical Weather: Harsh</li>,
                                            <li key="air">Air Temp: Hot</li>,
                                            <li key="night">Night Temp: Warm</li>,
                                            <li key="wind">Winds: Strong</li>,
                                            <li key="tox">Toxicity Levels: High</li>,
                                            <li key="rad">Radiation Levels: Hazardous</li>,
                                        ]}
                                        {planet.type === 'Ice World' && [
                                            <li key="weather">Typical Weather: Icy Blizzards</li>,
                                            <li key="air">Air Temp: Cold</li>,
                                            <li key="night">Night Temp: Freezing</li>,
                                            <li key="wind">Winds: Gentle</li>,
                                            <li key="tox">Toxicity Levels: Low</li>,
                                            <li key="rad">Radiation Levels: Safe</li>,
                                        ]}
                                        {(planet.type !== 'Gas Giant' && planet.type !== 'Rocky' && planet.type !== 'Radioactive' && planet.type !== 'Ice World') && [
                                            <li key="weather">Typical Weather: Calm</li>,
                                            <li key="air">Air Temp: Temperate</li>,
                                            <li key="night">Night Temp: Stable</li>,
                                            <li key="wind">Winds: Moderate</li>,
                                            <li key="tox">Toxicity Levels: Low</li>,
                                            <li key="rad">Radiation Levels: Safe</li>,
                                        ]}
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