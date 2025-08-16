import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // You'll need to run `npm install uuid`

const ApiDataViewer = () => {
    const [systemData, setSystemData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateSystem = async () => {
        setIsLoading(true);
        setError(null);
        setSystemData(null);

        try {
            // Create a dummy star object to send to the synthesis endpoint
            const dummyStar = {
                id: uuidv4(),
                name: "Test System",
                x: 0,
                y: 0,
                z: 0
            };

            const apiKey = import.meta.env.VITE_API_KEY;
            const baseUrl = import.meta.env.VITE_API_BASE_URL;

            // We POST to the /api/v1/systems endpoint to create a new system
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
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded disabled:bg-gray-500"
                >
                    {isLoading ? 'Generating...' : 'Generate New Star System'}
                </button>
            </div>
            <div className="flex-1 bg-black p-4 rounded overflow-auto">
                {error && <pre className="text-red-500">{`Error: ${error}`}</pre>}
                {systemData && (
                    <pre className="text-sm">
                        {JSON.stringify(systemData, null, 2)}
                    </pre>
                )}
                {!systemData && !isLoading && !error && (
                    <p className="text-gray-500">Click the button to generate a system.</p>
                )}
            </div>
        </div>
    );
};

export default ApiDataViewer;
