
import { useAuth0 } from '@auth0/auth0-react';
import { synthesizeStarSystem } from '@utils/synthesisUtils';
import { useEffect, useState } from 'react';

const Header = ({ stars, factionFilter, setFactionFilter, starTypeFilter, setStarTypeFilter }) => {
    const [uniqueFactions, setUniqueFactions] = useState(['All']);
    const [uniqueStarTypes, setUniqueStarTypes] = useState(['All']);
    const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

    //--- Testing Star System Synthesis
    function handleSynthesizeTest() {
        const mockStar = {
            name: 'Testarion',
            id: 'a3a6cb76-0b1d-4f42-aa88-274d2b9ea40d',
            type: 'Yellow Dwarf',
            x: 0,
            y: 0,
            z: 0,
            faction: { name: 'Test Faction', symbol: '🧪' }
        };

        const fullSystem = synthesizeStarSystem(mockStar);


        // const existing = JSON.parse(localStorage.getItem('savedStarSystems')) || [];
        // existing.push(fullSystem);
        // localStorage.setItem('savedStarSystems', JSON.stringify(existing));
        // alert(`System "${fullSystem.name}" saved with ${fullSystem.planets.length} planets.`);
    }



    useEffect(() => {
        setUniqueFactions(['All', ...new Set(stars.map(star => star.faction?.name).filter(Boolean))]);
        setUniqueStarTypes(['All', ...new Set(stars.map(star => star.type).filter(Boolean))]);
    }, [stars]);

    return (
        <header className="w-full bg-gray-900 p-4 flex items-center justify-between text-xl text-orange-400">
            <h1 className="text-4xl font-baumans tracking-wide" style={{ fontFamily: '"Baumans", cursive' }}>Starweave 2478</h1>
            <div className="flex space-x-4">
                <div>
                    {/* <button
                        onClick={handleSynthesizeTest}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm shadow-md transition-all"
                    >
                        Test Synthesis
                    </button>&nbsp; */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">
                                Welcome, {user.name || user.email}
                            </span>
                            <button
                                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm shadow-md transition-all"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => loginWithRedirect()}
                            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white text-sm shadow-md transition-all"
                        >
                            Log In
                        </button>
                    )}
                </div>
                <select
                    className="p-1 bg-gray-800 text-white rounded font-semibold text-sm"
                    value={factionFilter}
                    onChange={(e) => setFactionFilter(e.target.value)}
                >
                    {uniqueFactions.map(faction => (
                        <option key={faction} value={faction}>{faction}</option>
                    ))}
                </select>

            </div>
        </header>
    );
};

export default Header;