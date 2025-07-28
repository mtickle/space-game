// drawUtils.js
export function drawStarMap(ctx, options) {
    const {
        stars,
        hoveredStar,
        selectedStar,
        scale,
        offsetX,
        offsetY,
        homeSystem,
        visitedStars,
        activeSystem
    } = options;

    // includes ctx.save(), ctx.translate(), ctx.scale()
    // loops through stars, renders stars, planets, visited dots
    // shows tooltip via another function (see below)
}

export function drawTooltip(ctx, hoveredStar) {
    const tooltip = getStarTooltip(hoveredStar);
    // draws tooltip box
}


// src/utils/drawUtils.js

export function drawStarMapScene({ canvasRef, stars, hoveredStar, activeSystem, scale, offsetX, offsetY }) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const visited = JSON.parse(localStorage.getItem('visitedStars') || '[]');
    const home = JSON.parse(localStorage.getItem('homeSystem') || '{}');

    ctx.save();
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.scale(scale, scale);

    stars
        .slice()
        .sort((a, b) => (a.z || 0) - (b.z || 0))
        .forEach((star) => {
            const depth = star.z || 0;
            const alpha = 1 - depth * 0.8;
            const blur = 10 * (1 - depth);

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = blur;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            if (home.name === star.name) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size + 4 / scale, 0, Math.PI * 2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1 / scale;
                ctx.stroke();
            }

            if (visited.includes(star.name)) {
                ctx.beginPath();
                ctx.arc(star.x, star.y - star.size - 12 / scale, 2 / scale, 0, Math.PI * 2);
                ctx.fillStyle = '#00FF00';
                ctx.fill();
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${12 / scale}px Courier New, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(star.visualName || star.name, star.x, star.y - star.size - 6 / scale);

            if ((selectedStar?.name === star.name || hoveredStar?.name === star.name) && star.planets) {
                star.planets.forEach((planet) => {
                    planet.angle = (planet.angle ?? Math.random() * Math.PI * 2) + 0.01;

                    const px = star.x + Math.cos(planet.angle) * planet.orbitRadius;
                    const py = star.y + Math.sin(planet.angle) * planet.orbitRadius;

                    ctx.beginPath();
                    ctx.arc(star.x, star.y, planet.orbitRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = planet.color + '33';
                    ctx.lineWidth = 0.5 / scale;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(px, py, Math.min(planet.size ?? 1.5, 4), 0, Math.PI * 2);
                    ctx.fillStyle = planet.color;
                    ctx.fill();
                });
            }
        });

    ctx.restore();

    if (hoveredStar) {
        const text = `★ ${hoveredStar.visualName || hoveredStar.name} | ${hoveredStar.faction?.name || '???'} | ${hoveredStar.planets?.length || 0} planets`;
        const metrics = ctx.measureText(text);
        ctx.save();
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(hoveredStar.clientX + 10, hoveredStar.clientY - 10, metrics.width + 12, 22);
        ctx.fillStyle = '#00ff88';
        ctx.fillText(text, hoveredStar.clientX + 16, hoveredStar.clientY + 5);
        ctx.restore();
    }
}
