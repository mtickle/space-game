
import { useEffect, useState } from 'react';

const Sidebar = ({ selectedStar }) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        if (selectedStar) {
            setDisplayText(
                `<div class="flex items-center mb-2">
                    <div class="w-6 h-6 rounded-full mr-3" style="background-color: ${selectedStar.faction?.color || '#FFFFFF'};"></div>
                    <h2 class="text-2xl font-bold text-yellow-400">${selectedStar.name}</h2>
                </div>
                <p class="text-green-400"><strong>Type:</strong> ${selectedStar.type}</p>
                <p class="text-green-400"><strong>Temperature:</strong> ${selectedStar.temp}</p>
                <p class="text-green-400"><strong>Faction:</strong> ${selectedStar.faction?.name || 'Unknown'}</p>
                <p class="text-green-400"><strong>Symbol:</strong> ${selectedStar.faction?.symbol || 'N/A'}</p>
                <p class="mt-2 text-base text-gray-300">${selectedStar.description}</p>
                <div class="mt-4 overflow-y-auto" style="max-height: calc(100vh - 200px);">
                    <h3 class="text-lg font-bold text-yellow-400">Planetary System</h3>
                    ${selectedStar.planets.map((planet, index) => `
                        <div key=${index} class="text-base text-gray-300">
                            <p><strong style="color: ${selectedStar.faction?.color || '#FFFFFF'}">${planet.name}</strong> (${planet.type})</p>
                            <p>Size: ${planet.size > 6 ? 'Large' : planet.size > 3 ? 'Medium' : 'Small'}</p>
                            ${planet.settlements ? `
                                <div class="ml-4 mt-1">
                                    <h4 class="text-md font-bold text-orange-400">Settlements:</h4>
                                    <ul class="list-disc list-inside text-sm text-gray-200">
                                        ${planet.settlements.map((settlement, sIndex) => `
                                            <li key=${sIndex}>${settlement.name}${settlement.isCapital ? ' *' : ''} (Pop: ${settlement.population.toLocaleString()})</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>`
            );
        } else {
            setDisplayText(
                `<h2 class="text-2xl font-bold text-orange-400">Welcome to StarWeave '78</h2>
                <p class="text-gray-300">Click a star to explore its system. Journey through the cosmos and uncover faction secrets!</p>`
            );
        }
    }, [selectedStar]);

    return (
        <div className="w-1/4 bg-gray-900 text-white font-mono p-4 h-screen overflow-y-auto shadow-[0_0-10px_#0f0]">
            <div dangerouslySetInnerHTML={{ __html: displayText }} />
        </div>
    );
};

export default Sidebar;