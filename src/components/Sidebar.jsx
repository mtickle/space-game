import React from 'react';
import ApiPlanetPanel from './ApiPlanetPanel';
import { Sun, Building, Users, Globe, Gem } from 'lucide-react';

const Sidebar = ({ activeSystem, setActiveSystem, setShowSystemMap }) => {
    if (!activeSystem) {
        return (
            <aside className="w-1/3 max-w-lg bg-black bg-opacity-80 border-l-2 border-green-500/50 p-6 flex flex-col text-gray-400">
                <h2 className="text-2xl font-bold text-green-400 mb-4 border-b border-green-500/30 pb-2">SYSTEM SCAN</h2>
                <div className="flex-1 flex items-center justify-center">
                    <p className="italic">No system selected. Click a star on the map to view details.</p>
                </div>
            </aside>
        );
    }

    const { starName, starDescription, starFaction, spaceStation, planets } = activeSystem;

    return (
        <aside className="w-1/3 max-w-lg bg-black bg-opacity-80 border-l-2 border-green-500/50 flex flex-col">
            <div className="p-6 border-b border-green-500/30">
                <h2 className="text-3xl font-bold text-green-400" style={{ textShadow: '0 0 5px rgba(52, 211, 153, 0.5)' }}>{starName}</h2>
                <p className="text-sm text-gray-400 italic mt-1">{starDescription}</p>

                {starFaction && (
                    <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-lg text-green-300 flex items-center gap-2">
                            <Users size={18} /> Controlling Faction
                        </h3>
                        <p className="text-base" style={{ color: starFaction.color }}>{starFaction.name}</p>
                        <p className="text-xs text-gray-500">{starFaction.alignment}</p>
                    </div>
                )}
                {spaceStation && (
                    <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                         <h3 className="font-bold text-lg text-green-300 flex items-center gap-2">
                            <Building size={18} /> Major Installation
                        </h3>
                        <p className="text-base" style={{ color: spaceStation.factionColor }}>{spaceStation.stationName}</p>
                        <p className="text-xs text-gray-500">Type: {spaceStation.stationType}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                 <h3 className="text-xl font-bold text-green-400 mb-2 border-b border-green-500/30 pb-2 flex items-center gap-2"><Globe size={20}/> System Planets</h3>
                {planets.map(planet => (
                    <ApiPlanetPanel key={planet.planetId} planet={planet} />
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
