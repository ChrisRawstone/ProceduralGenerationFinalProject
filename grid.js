
// import { gridSize, line_segment_size } from './main.js';

// import { LineSegments } from "three";


// Grid setup

var x_prev, y_prev;
var gridSize = 160;

var line_segment_size = 10
var iterations_of_Lsystem = 20;
var weight_bias = 1000;
var bias_half_life = 0.5;

var x = Math.floor(gridSize * 1 / 4);
var y = Math.floor(gridSize / 2);


export function init_grid(grid_Size) {
    var grid = [];
    for (let i = 0; i < grid_Size; i++) {
        grid[i] = new Array(grid_Size).fill(0);
    }
    return grid;
}

export function initialize_starting_road(grid, grid_Size, x, y) {
    var x_prev = x;
    var y_prev = y;
    // initial start from 1/4 of the road to 3/4 of the road
    for (let j = Math.floor(grid.length*1/4); j < Math.floor(grid.length*3/4); j++) { 
        if (x >= grid_Size) break;
        grid[y][x] = 1; 
        x++; 

    } 

    return [grid, x, x_prev, y, y_prev];
}



class Grid {
    constructor(grid, x, y, x_prev, y_prev, iterations_of_Lsystem,line_segment_size, gridSize, weight_bias, bias_half_life) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.x_prev = x_prev;
        this.y_prev = y_prev;
        this.iterations_of_Lsystem = iterations_of_Lsystem;
        this.line_segment_size = line_segment_size;
        this.gridSize = gridSize;
        this.weight_bias = weight_bias;
        this.bias_half_life = bias_half_life;
    }

    populateGridWithRoadsRecursively(x, y, x_prev, y_prev, depth, weight_bias) {
        // console.log("x:",x,"y:",y)
        this.placeVerticalRoad(x, y, x_prev, y_prev, depth, 0, weight_bias); //  0 means making a line downwards
        this.placeVerticalRoad(x, y, x_prev, y_prev, depth, 1, weight_bias); // 1 means making a line upwards
    }


    populateArray( x, y, gridSize, line_segment_size, direction, axis) {
        // console.log("hit1","x:",x,"y:",y)
        
        for (let j = 1; j < line_segment_size; j++) {
            // Check if we are out of grid bounds and break if so.
            if ((axis === 'x' && (x >= gridSize || x < 0)) || (axis === 'y' && (y >= gridSize || y < 0))) {
                break;
            }

            this.grid[y][x] = 1; // Place the road

            // Update the position based on direction and axis.
            if (axis === 'x') {
                direction === 0 ? x-- : x++;
            } else {
                direction === 0 ? y-- : y++;
            }

            // Check if the next position is out of bounds or if it would overwrite another road.
            // console.log("x:",x,"y:",y)
            if (((axis === 'x' && (x < 0 || x >= gridSize)) || (axis === 'y' && (y < 0 || y >= gridSize))) || this.grid[y][x] === 1) {
                break;
            }
        }
    }





    biasedRandomPlacement(prev, current, bias) {
        if ((prev > current) && (current + 2 < prev - 2)) {
            return this.biasedRandom(current + 2, prev - 2, bias);
        } else if ((prev < current) && (current - 2 > prev + 2)) {
            return this.biasedRandom(prev + 2, current - 2, bias);
        } else {
            return current;
        }
    }

    placeVerticalRoad(x, y, x_prev, y_prev, depth, direction = 0, bias = weight_bias) {
        if (depth === 0) return; // base case
        // check if out of bounds
        if (x >= gridSize || x < 0) return;
        if (x >= gridSize || x < 0) return;

        // this decides randomly where we place the vertical road on the horisontal road
        let localX = this.biasedRandomPlacement(x_prev, x, bias)

        // making sure we are within the grid still.
        x = Math.max(0, Math.min(x, gridSize - 1));
        x_prev = x;

        console.log("x:",x,"y:",y)
        let adjacentCount = this.calculateAdjacentRoadsForVerticalLines(x,y,grid,direction, gridSize);

        if (adjacentCount > 3) {
            return; // Exit the function if there are more than 3 adjacent road cells
        }
        // console.log("after adjacency","x:",x,"y:",y)
        // this draws the line
        this.populateArray(x, y, gridSize, line_segment_size, direction, "y")
        
        // Recursion
        this.placeHorisontalRoad(localX, y, x_prev, y_prev, depth - 1, direction = 0, bias = Math.ceil(bias * bias_half_life));
        this.placeHorisontalRoad(localX, y, x_prev, y_prev, depth - 1, direction = 1, bias = Math.ceil(bias * bias_half_life));
    }

    placeHorisontalRoad(x, y, x_prev, y_prev, depth, direction = 0, bias = weight_bias) {
        if (depth == 0) return; // base case - recursive algorithm

        // check if out of bounds
        if (y >= gridSize || y < 0) return;
        if (x >= gridSize || x < 0) return;

        // this decides randomly where we place the horisontal road on the vertical road
        y = this.biasedRandomPlacement(y_prev, y, bias)

        // making sure we are within the grid still.
        y = Math.max(0, Math.min(y, gridSize - 1));
        y_prev = y;

        let adjacentCount = this.calculateAdjacentRoadsForHorisontalLines(x,y,grid,direction, gridSize);

        if (adjacentCount > 3) {
            return; // Exit the function if there are more than 3 adjacent road cells
        }

        // this draws the line
        this.populateArray(x, y, gridSize, line_segment_size, direction, "x")

        // Recursion
        this.placeVerticalRoad(x, y, x_prev, y_prev, depth - 1, direction = 0, bias = Math.ceil(bias * bias_half_life));
        this.placeVerticalRoad(x, y, x_prev, y_prev, depth - 1, direction = 1, bias = Math.ceil(bias * bias_half_life));
    }




    biasedRandom(lowerBound, upperBound, biasFactor = 2) {
        // Validate the input to ensure lowerBound is less than upperBound
        if (lowerBound >= upperBound) {
            throw new Error("Lower bound must be less than upper bound.");
        }

        let sum = 0;
        // Summing up 'biasFactor' amount of random numbers to skew the distribution towards the middle
        for (let i = 0; i < biasFactor; i++) {
            sum += Math.random();
        }

        // Average the sum to get a skewed random number
        let avgRandom = sum / biasFactor;

        // Scale and adjust the random number to fit within the bounds
        let biasedRandomNumber = lowerBound + avgRandom * (upperBound - lowerBound);

        return Math.floor(biasedRandomNumber);
    }

    // this function make sures that no roads can spawn adjacent to each other. 
    // however some roads still does that
    calculateAdjacentRoadsForVerticalLines(x,y,direction, gridSize) {
        let adjacentCount = 0; // Counter for adjacent road cells

        // console.log("x:",x,"y:",y)
        for (let j = 1; j < line_segment_size; j++) {
            if (direction == 0) { // Moving downwards!!
                if (y - j < 0 || y - j >= gridSize) break;
                // Check both left and right sides of the proposed line
                if (x + 1 < gridSize && this.grid[y - j][x + 1] == 1) adjacentCount++;
                if (x - 1 >= 0 && this.grid[y - j][x - 1] == 1) adjacentCount++;

                // Stop if overwriting another road or out of bounds
                if (!(y - j < gridSize && y - j >= 0) && this.grid[y - j][x] == 1) break;

            } else { // Moving upwards!!
                if (y + j >= gridSize || y + j < 0) break;

                // Check both left and right sides of the proposed line
                if (x + 1 < gridSize && this.grid[y + j][x + 1] == 1) adjacentCount++;
                if (x - 1 >= 0 && this.grid[y + j][x - 1] == 1) adjacentCount++;

                // Stop if overwriting another road or out of bounds
                if (!(y + j < gridSize && y + j >= 0) && this.grid[y + j][x] == 1) break;
            }
        }

        return adjacentCount;
    }

    // this function make sures that no roads can spawn adjacent to each other. 
    // however some roads still does that
    calculateAdjacentRoadsForHorisontalLines(x,y,grid,direction, gridSize) {
        let adjacentCount = 0; // To keep track of adjacent road cells

        for (let j = 1; j < line_segment_size; j++) {
            if (direction == 0) { // Checks backward direction along x-axis
                if (x - j < 0 || x - j >= gridSize) break;
                if (y + 1 < gridSize && this.grid[y + 1][x - j] == 1) adjacentCount++;
                if (y - 1 >= 0 && this.grid[y - 1][x - j] == 1) adjacentCount++;

                if (!(x - j >= gridSize || x - j < 0) && this.grid[y][x - j] == 1) break; // Stop if overwriting another road
            } else { // Checks forward direction along x-axis
                if (x + j >= gridSize || x + j < 0) break;
                if (y + 1 < gridSize && this.grid[y + 1][x + j] == 1) adjacentCount++;
                if (y - 1 >= 0 && this.grid[y - 1][x + j] == 1) adjacentCount++;

                // console.log("x:",x,"y:",y)
                if (!(x + j >= gridSize || x + j < 0) && this.grid[y][x + j] == 1) break; // Stop if overwriting another road

            }
        }
        return adjacentCount;
    }


}




export function generateGridwithRoadsFinal(x, y, x_prev, y_prev, iterations_of_Lsystem,line_segment_size, gridSize, weight_bias, bias_half_life) {

    var grid = init_grid(gridSize);
    var weight_bias=weight_bias;
    var gridSize=gridSize;

    [grid, x, x_prev, y, y_prev] = initialize_starting_road(grid, gridSize, x, y);

    // console.log("x:",x,"y:",y)

    var gridClass = new Grid(grid, x, y, x_prev, y_prev, iterations_of_Lsystem,line_segment_size, gridSize, weight_bias, bias_half_life);
    gridClass.populateGridWithRoadsRecursively(x, y, x_prev, y_prev, iterations_of_Lsystem, weight_bias);
    // populateGridWithRoadsRecursively(x, y, x_prev, y_prev, iterations_of_Lsystem, weight_bias);
    
    return grid;
}

var grid = generateGridwithRoadsFinal(x, y, x_prev, y_prev, iterations_of_Lsystem,line_segment_size, gridSize, weight_bias, bias_half_life);

