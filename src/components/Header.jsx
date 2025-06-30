
import { useEffect, useState } from 'react';

const Header = ({ stars, factionFilter, setFactionFilter, starTypeFilter, setStarTypeFilter }) => {
    const [uniqueFactions, setUniqueFactions] = useState(['All']);
    const [uniqueStarTypes, setUniqueStarTypes] = useState(['All']);

    useEffect(() => {
        setUniqueFactions(['All', ...new Set(stars.map(star => star.faction?.name).filter(Boolean))]);
        setUniqueStarTypes(['All', ...new Set(stars.map(star => star.type).filter(Boolean))]);
    }, [stars]);

    return (
        <header className="w-full bg-gray-900 p-4 flex items-center justify-between text-xl text-orange-400">
            <h1 className="text-4xl font-baumans tracking-wide" style={{ fontFamily: '"Baumans", cursive' }}>StarWeave '78</h1>
            <div className="flex space-x-4">
                <select
                    className="p-2 bg-gray-800 text-white rounded"
                    value={factionFilter}
                    onChange={(e) => setFactionFilter(e.target.value)}
                >
                    {uniqueFactions.map(faction => (
                        <option key={faction} value={faction}>{faction}</option>
                    ))}
                </select>
                <select
                    className="p-2 bg-gray-800 text-white rounded"
                    value={starTypeFilter}
                    onChange={(e) => setStarTypeFilter(e.target.value)}
                >
                    {uniqueStarTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white">Login</button>
            </div>
        </header>
    );
};

export default Header;