
import { gridSize } from './main.js';


// Grid setup


export function init_grid () {
    const grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = new Array(gridSize).fill(0);
}
}

