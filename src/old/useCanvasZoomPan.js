// useCanvasZoomPan.js
export function getZoomedOffset({ e, canvas, scale, offsetX, offsetY }) {
    const zoomSpeed = 0.1;
    const oldScale = scale;
    const newScale = Math.min(Math.max(scale - e.deltaY * zoomSpeed * 0.001, 0.5), 2);
    const zoomFactor = newScale / oldScale;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const deltaX = (mouseX - canvas.width / 2) / oldScale;
    const deltaY = (mouseY - canvas.height / 2) / oldScale;

    const newOffsetX = offsetX - deltaX * (zoomFactor - 1);
    const newOffsetY = offsetY - deltaY * (zoomFactor - 1);

    return { newScale, newOffsetX, newOffsetY };
}
