
// import { gridSize } from './main.js';


// Grid setup


export function init_grid(grid_Size) {
    var grid = [];
    for (let i = 0; i < grid_Size; i++) {
        grid[i] = new Array(grid_Size).fill(0);
    }
    return grid;
}

export function initialize_starting_road(grid, grid_Size, x, y) {
    var x;
    // initial start from 1/4 of the road to 3/4 of the road
    for (let j = Math.floor(grid.length*1/4); j < Math.floor(grid.length*3/4); j++) { 
        if (x >= grid_Size) break;
        grid[y][x] = 1; 
        x++; 

    } 

    return grid, x, y;
}