import { useEffect, useRef, useState } from 'react';

// A pool of sci-fi technobabble for the status display
const statusLines = [
    'CALIBRATING WARP FIELD COILS...',
    'SYNCING GALACTIC DATABASE...',
    'DECOMPRESSING STAR CHARTS...',
    'ROUTING POWER TO SENSORS...',
    'INITIALIZING NAV-COMPUTER...',
    'PURGING CACHED NEBULA DATA...',
    'VERIFYING FACTION ALIGNMENTS...',
    'DECRYPTING ANCIENT STAR LOGS...',
    'ENGAGING LONG-RANGE SCANNERS...',
    'POLISHING THE MAIN VIEWSCREEN...',
];

const LoadingModal = ({ isOpen, message }) => {
    const canvasRef = useRef(null);
    const [statusText, setStatusText] = useState(statusLines[0]);

    // This effect handles the animations for the sine wave and the flickering text
    useEffect(() => {
        if (!isOpen) return;

        // --- Animate the sine wave on the canvas ---
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let frame = 0;
        let animationFrameId;

        const render = () => {
            frame++;
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = '#00ff88'; // A nice green color
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const y = height / 2 + Math.sin(x * 0.05 + frame * 0.1) * (height * 0.4);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        // --- Animate the flickering status text ---
        const textInterval = setInterval(() => {
            setStatusText(statusLines[Math.floor(Math.random() * statusLines.length)]);
        }, 400);

        // --- Cleanup function ---
        // This is crucial to stop the animations when the modal closes
        return () => {
            cancelAnimationFrame(animationFrameId);
            clearInterval(textInterval);
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
            <div className="w-full max-w-lg h-64 bg-gray-900 border-2 border-green-500/50 shadow-2xl shadow-green-500/20 rounded-lg flex flex-col justify-between overflow-hidden p-6 relative">

                {/* Pulsating Top Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 animate-pulse"></div>

                {/* Main Content */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-400" style={{ textShadow: '0 0 5px rgba(52, 211, 153, 0.5)' }}>
                        {message}
                    </h2>
                    <p className="text-sm text-yellow-400 h-4 mt-2">{statusText}</p>
                </div>

                {/* Sine Wave Canvas */}
                <div className="w-full h-24">
                    <canvas ref={canvasRef} className="w-full h-full" />
                </div>

                {/* Pulsating Bottom Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400 animate-pulse"></div>
            </div>
        </div>
    );
};

export default LoadingModal;
