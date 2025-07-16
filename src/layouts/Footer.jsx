
import { RotateCcw } from 'lucide-react';
const Footer = ({ offsetX, offsetY, scale, stars, setOffsetX, setOffsetY, goToSystem, goToZeroCommaZero, setShowVisited, showVisited, setScale }) => {

    const home = JSON.parse(localStorage.getItem('homeSystem'));

    return (
        <div className="bg-black bg-opacity-90 border-t-2 border-green-500 p-3 flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-green-400 max-h-64 overflow-y-auto">
            <div className="flex flex-wrap items-center gap-2">
                <span>
                    Total Systems: {stars.length} |
                    Coordinates: ({Math.round(offsetX)}, {Math.round(offsetY)})&nbsp;
                    <button onClick={() => goToZeroCommaZero()} > <RotateCcw className="inline w-4 h-4 mr-1 text-pink-400" data-tooltip="Reset zoom to 1x" />
                    </button> |
                    Zoom: {scale.toFixed(2)}x <button
                        onClick={() => {

                            if (typeof scale !== "undefined" && typeof setScale === "function") {
                                setScale(1);
                            }
                        }}
                        className=" pl-1 text-green-400 hover:text-blue-200 transition-colors text-sm"
                    >
                        <RotateCcw className="inline w-4 h-4 mr-1 text-pink-400" data-tooltip="Reset zoom to 1x" />
                    </button>
                    <button
                        onClick={() => goToZeroCommaZero()}
                    >
                    </button>
                </span>

            </div>
            <div className="flex gap-4">
                <div>
                    <span className="text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.7)]">SYS TEMP:</span>{' '}
                    <span className="text-amber-400 animate-[colorPulse_3s_ease-in-out_infinite] [text-shadow:0_0_8px_rgba(255,191,0,0.8)]">237K</span>
                </div>
                <div className="animate-pulse text-red-400">
                    COMMS: UPLINK LOST
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    <div>SCANNER SWEEP ACTIVE</div>
                </div>
            </div>

            <div className="space-x-4">

                <button
                    onClick={() => {
                        if (!home || !home.name) {
                            alert("Set a home system first.");
                            return;
                        }

                        goToSystem(home);
                        // if (confirm("Are you sure you want to go home to " + home.name + "?")) {
                        //     goToSystem(home);
                        // }
                    }}
                    className={`underline transition-colors relative group ${home && home.name
                        ? "text-green-400 hover:text-green-200"
                        : "text-gray-500 cursor-not-allowed"
                        }`}
                    disabled={!home || !home.name}
                >
                    Go to Home System

                </button>


                <button
                    className="underline text-red-400 hover:text-green-200 transition-colors"
                    onClick={() => {
                        if (confirm("Are you sure you want to reset the galaxy?")) {
                            localStorage.clear();
                            location.reload(); // full reload to regenerate
                        }
                    }}
                >
                    Reset Galaxy
                </button>
            </div>
        </div>

    );
};

export default Footer;
