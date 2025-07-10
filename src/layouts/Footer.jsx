
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

            <div className="space-x-4">

                <button
                    onClick={() => {
                        if (!home || !home.name) {
                            alert("Ya gotta set a home system first, bro.");
                            return;
                        }

                        console.log("Going home to", home.name);
                        if (confirm("Are you sure you want to go home to " + home.name + "?")) {
                            goToSystem(home);
                        }
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
