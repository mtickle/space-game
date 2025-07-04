// VisitedSystemsPanel.jsx

const VisitedSystemsPanel = ({ stars }) => {
    const visitedNames = JSON.parse(localStorage.getItem('visitedStars') || '[]');
    const visited = stars.filter(s => visitedNames.includes(s.name));

    if (visited.length === 0) return null;

    return (
        <div className="absolute bottom-24 left-4 bg-gray-800 bg-opacity-95 border border-green-500 p-4 rounded-md text-sm text-green-300 shadow-xl w-72 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Visited Systems</h3>
            {visited.map(star => (
                <div key={star.name} className="mb-2 border-b border-green-700 pb-1">
                    <div className="font-bold text-green-200">★ {star.name}</div>
                    <div>Faction: {star.faction?.name || 'Unknown'}</div>
                    <div>Planets: {star.planets?.length || 0}</div>
                </div>
            ))}
        </div>
    );
};

export default VisitedSystemsPanel;
