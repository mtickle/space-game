import { useState } from 'react';
import VisitedSystemsPanel from './VisitedSystemsPanel';



const AdminPanel = ({ stars, goToSystem }) => {
    const [open, setOpen] = useState(false);
    const [showVisited, setShowVisited] = useState(false);


    const home = JSON.parse(localStorage.getItem('homeSystem'));
    
    

    return (
        <>
            {/* Apply dynamic margin to push content */}
            <div
                className={`transition-all duration-300 ${open ? 'mr-80' : 'mr-0'}`}
                style={{ marginRight: open ? '20rem' : '0' }} // 20rem = 320px, matching panel width
            >
                {/* This div wraps the main content in your app */}
                {/* You may need to adjust this based on your app structure */}
            </div>

            <div
                className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 transform ${open ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <button
                    onClick={() => setOpen(!open)}
                    className="absolute -left-10 top-4 bg-green-700 text-white px-2 py-1 rounded-l hover:bg-green-600"
                >
                    {open ? '⯈' : '☰'}
                </button>

                <div className="w-100 h-full bg-gray-900 border-l-2 border-gray-500 p-4 overflow-y-auto text-green-300 font-mono shadow-xl">


                    <div>
                        <h2 className="text-lg text-yellow-400 font-bold mb-4">Galactic Ops</h2>

                        <ul className="relative space-y-4 z-10">
                            <li>
                                <button onClick={() => {
                                    // console.log("Going home to", home.name);
                                    if (confirm("Are you sure you want to go home to " + home.name + "?")) {

                                        goToSystem(home);
                                    }


                                }} className="ml-0.5 px-2 py-2 bg-blue-600 text-white text-xs rounded hover:bg-red-700">

                                    Go Back to Home System
                                </button></li>
                            <li><button
                                onClick={() => {
                                    if (confirm("Are you sure you want to reset the galaxy?")) {
                                        localStorage.clear();
                                        location.reload(); // full reload to regenerate
                                    }
                                }}
                                className="ml-0.5 px-2 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                                Reset Galaxy
                            </button></li>
                        </ul>
                    </div>
                    <VisitedSystemsPanel stars={stars} goToSystem={goToSystem} />
                    {/* Future: Add more panels here */}
                </div>
            </div>


        </>
    );
};

export default AdminPanel;