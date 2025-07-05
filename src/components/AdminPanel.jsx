import { useState } from 'react';
import VisitedSystemsPanel from './VisitedSystemsPanel';

const AdminPanel = ({ stars, goToSystem }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed top-0 right-0 h-full z-40">
            <button
                onClick={() => setOpen(!open)}
                className="absolute -left-10 top-4 bg-green-700 text-white px-2 py-1 rounded-l hover:bg-green-600"
            >
                {open ? '⯈' : '☰'}
            </button>

            {open && (
                <div className="w-80 h-full bg-gray-900 border-l-2 border-green-500 p-4 overflow-y-auto text-green-300 font-mono shadow-xl">
                    <h2 className="text-lg text-yellow-400 font-bold mb-4">Galactic Ops</h2>
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to reset the galaxy?")) {
                                localStorage.clear();
                                location.reload(); // full reload to regenerate
                            }
                        }}
                        className="ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                        Reset Galaxy
                    </button>
                    <VisitedSystemsPanel stars={stars} goToSystem={goToSystem} />

                    {/* Future: Add more panels here */}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
