import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// --- NEW: A recursive component to render the JSON tree ---
const JsonNode = ({ label, data, isInitiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);

    const isObject = typeof data === 'object' && data !== null;
    const isArray = Array.isArray(data);

    const renderValue = () => {
        if (data === null) return <span className="text-gray-500">null</span>;
        if (typeof data === 'string') return <span className="text-green-400">"{data}"</span>;
        if (typeof data === 'number') return <span className="text-blue-400">{data}</span>;
        if (typeof data === 'boolean') return <span className="text-purple-400">{String(data)}</span>;
        return null;
    };

    if (!isObject) {
        return (
            <div className="ml-4">
                <span className="text-pink-400">{label}: </span>
                {renderValue()}
            </div>
        );
    }

    return (
        <div className="ml-4">
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex items-center">
                {isOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                <span className="text-pink-400 ml-1">{label}:</span>
                {!isOpen && <span className="text-gray-500 ml-2">{isArray ? `[${data.length} items]` : '{...}'}</span>}
            </div>
            {isOpen && (
                <div className="border-l border-gray-700 pl-4">
                    {Object.entries(data).map(([key, value]) => (
                        <JsonNode key={key} label={key} data={value} />
                    ))}
                </div>
            )}
        </div>
    );
};


const ApiDataViewer = () => {
    const [systemData, setSystemData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateSystem = async () => {
        setIsLoading(true);
        setError(null);
        setSystemData(null);

        try {
            const dummyStar = {
                id: uuidv4(),
                name: "Test System",
                x: 0, y: 0, z: 0
            };

            const apiKey = import.meta.env.VITE_API_KEY;
            const baseUrl = import.meta.env.VITE_API_BASE_URL;

            const response = await fetch(`${baseUrl}/api/v1/systems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify(dummyStar),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setSystemData(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white font-mono h-screen flex flex-col">
            <h1 className="text-2xl text-cyan-400 border-b border-gray-700 pb-2">API Data Viewer</h1>
            <div className="my-4">
                <button
                    onClick={generateSystem}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded disabled:bg-gray-500 transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Generate New Star System'}
                </button>
            </div>
            <div className="flex-1 bg-black p-4 rounded overflow-auto">
                {error && <pre className="text-red-500">{`Error: ${error}`}</pre>}
                {systemData && (
                    // --- MODIFIED: Use the new JsonNode component ---
                    <JsonNode label="StarSystem" data={systemData} isInitiallyOpen={true} />
                )}
                {!systemData && !isLoading && !error && (
                    <p className="text-gray-500">Click the button to generate a system.</p>
                )}
            </div>
        </div>
    );
};

export default ApiDataViewer;
