export function checkForLines(grid, x, y, gridSize) {
    // Horizontal check
    let startX = x, endX = x;
    let count = 1;
    for (let i = x - 1; i >= 0 && grid[y][i] === 1; i--, startX--);
    for (let i = x + 1; i < gridSize && grid[y][i] === 1; i++, endX++);
    if (endX - startX > 4) return { startX, endX, startY: y, endY: y };


    // Vertical check
    let startY = y, endY = y;
    count = 1;
    for (let j = y - 1; j >= 0 && grid[j][x] === 1; j--, startY--);
    for (let j = y + 1; j < gridSize && grid[j][x] === 1; j++, endY++);
    if (endY - startY > 4) return { startX: x, endX: x, startY, endY };

    return null;
}