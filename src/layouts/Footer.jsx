const Footer = ({ offsetX, offsetY, scale, stars, setOffsetX, setOffsetY, goToSystem }) => {

    const home = JSON.parse(localStorage.getItem('homeSystem'));

    return (
        <div className="bg-black bg-opacity-90 border-t-2 border-green-500 p-2 flex justify-between items-center text-sm text-green-400">
            <div>
                Coordinates: ({Math.round(offsetX)}, {Math.round(offsetY)}) | Zoom: {scale.toFixed(2)}x | Total Systems: {stars.length}
            </div>
            <div className="space-x-4">
                <button
                    className="underline text-green-400 hover:text-green-200 transition-colors"
                    onClick={() => {
                        setOffsetX(0);
                        setOffsetY(0);
                    }}
                >
                    Return to (0,0)
                </button>
                <button
                    className="underline text-green-400 hover:text-green-200 transition-colors"
                    //onClick={handleGoHome}
                    onClick={() => goToSystem(home)}
                >
                    GO HOME
                </button>
            </div>
        </div>
    );
};

export default Footer;
