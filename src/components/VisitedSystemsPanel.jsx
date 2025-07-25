const VisitedSystemsPanel = ({ stars, goToSystem }) => {
    const visitedNames = JSON.parse(localStorage.getItem('visitedStars') || '[]');
    const visited = stars.filter(s => visitedNames.includes(s.name));

    if (visited.length === 0) return null;

    return (
        <div className="absolute bottom-12 left-4 bg-gray-800 bg-opacity-95 border border-green-500 p-4 rounded-md text-sm text-green-300 shadow-xl w-72 max-h-85 overflow-y-auto">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Visited Systems</h3>
            {visited.map(star => (
                <div key={star.name} className="mb-2 border-b border-green-700 pb-2">
                    <div className="font-bold text-green-200">★ {star.name}</div>
                    <div>ID: {star.id}</div>
                    <div>Faction: {star.faction?.name || 'Unknown'}</div>
                    <div>Planets: {star.planets?.length || 0}</div>
                    <button
                        onClick={() => goToSystem(star)}
                        className="mt-1 px-2 py-1 bg-green-700 text-white text-xs rounded hover:bg-green-600"
                    >
                        Go Here
                    </button>
                </div>
            ))}
        </div>
    );
};

export default VisitedSystemsPanel;
