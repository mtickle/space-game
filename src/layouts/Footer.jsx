const Footer = ({ offsetX, offsetY, scale, stars, setOffsetX, setOffsetY, goToSystem, goToZeroCommaZero, setShowVisited, showVisited }) => {
    const home = JSON.parse(localStorage.getItem('homeSystem'));

    return (
        <div className="bg-black bg-opacity-90 border-t-2 border-green-500 p-3 flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-green-400 max-h-64 overflow-y-auto">
            <div>
                Coordinates: ({Math.round(offsetX)}, {Math.round(offsetY)}) | Zoom: {scale.toFixed(2)}x | Total Systems: {stars.length}
            </div>

            <div className="space-x-4">
                <button
                    className="underline text-green-400 hover:text-green-200 transition-colors"
                    onClick={() => goToZeroCommaZero()}
                >
                    Return to (0,0)
                </button>
                <button
                    className="underline text-green-400 hover:text-green-200 transition-colors"
                    onClick={() => goToSystem(home)}
                >
                    Go to Home System
                </button>
            </div>



        </div>

    );
};

export default Footer;
