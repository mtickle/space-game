// useCanvasResizer.js
import { useEffect } from 'react';

export function useCanvasResizer(canvasRef, setCanvasSize, triggerRedraw) {
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas?.parentElement;
        if (!canvas || !container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
                setCanvasSize({ width: canvas.width, height: canvas.height });
                triggerRedraw();
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.unobserve(container);
    }, [canvasRef, setCanvasSize, triggerRedraw]);
}
