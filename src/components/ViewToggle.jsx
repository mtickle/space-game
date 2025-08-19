import React from 'react';
import { Map, Database } from 'lucide-react'; // Using icons for a nice touch

const ViewToggle = ({ viewMode, setViewMode }) => {
    const toggleView = () => {
        setViewMode(currentMode => (currentMode === 'map' ? 'data' : 'map'));
    };

    const isMapView = viewMode === 'map';

    return (
        <button
            onClick={toggleView}
            className="absolute top-4 right-4 z-50 px-4 py-2 bg-gray-800/80 text-white font-mono border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            title={`Switch to ${isMapView ? 'Data Viewer' : 'Star Map'}`}
        >
            {isMapView ? <Database size={18} /> : <Map size={18} />}
            <span>{isMapView ? 'Data View' : 'Map View'}</span>
        </button>
    );
};

export default ViewToggle;
