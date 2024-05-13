import * as THREE from 'three';





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


// this function make sures that no roads can spawn adjacent to each other. 
// however some roads still does that
function calculateAdjacentRoadsForVerticalLines(grid, x, y, direction, gridSize,line_segment_size) {
    let adjacentCount = 0; // Counter for adjacent road cells

    for (let j = 1; j < line_segment_size; j++) {
        if (direction == 0) { // Moving downwards!!
            if (y - j < 0 || y - j >= gridSize) break;
            // Check both left and right sides of the proposed line
            if (x + 1 < gridSize && grid[y - j][x + 1] == 1) adjacentCount++;
            if (x - 1 >= 0 && grid[y - j][x - 1] == 1) adjacentCount++;

            // Stop if overwriting another road or out of bounds
            if (!(y - j < gridSize && y - j >= 0) && grid[y - j][x] == 1) break;

        } else { // Moving upwards!!
            if (y + j >= gridSize || y + j < 0) break;

            // Check both left and right sides of the proposed line
            if (x + 1 < gridSize && grid[y + j][x + 1] == 1) adjacentCount++;
            if (x - 1 >= 0 && grid[y + j][x - 1] == 1) adjacentCount++;

            // Stop if overwriting another road or out of bounds
            if (!(y + j < gridSize && y + j >= 0) && grid[y + j][x] == 1) break;
        }
    }

    return adjacentCount;
}

// this function make sures that no roads can spawn adjacent to each other. 
// however some roads still does that
function calculateAdjacentRoadsForHorisontalLines(grid, x, y, direction, gridSize,line_segment_size) {
    let adjacentCount = 0; // To keep track of adjacent road cells

    for (let j = 1; j < line_segment_size; j++) {
        if (direction == 0) { // Checks backward direction along x-axis
            if (x - j < 0 || x - j >= gridSize) break;
            if (y + 1 < gridSize && grid[y + 1][x - j] == 1) adjacentCount++;
            if (y - 1 >= 0 && grid[y - 1][x - j] == 1) adjacentCount++;

            if (!(x - j >= gridSize || x - j < 0) && grid[y][x - j] == 1) break; // Stop if overwriting another road
        } else { // Checks forward direction along x-axis
            if (x + j >= gridSize || x + j < 0) break;
            if (y + 1 < gridSize && grid[y + 1][x + j] == 1) adjacentCount++;
            if (y - 1 >= 0 && grid[y - 1][x + j] == 1) adjacentCount++;

            // console.log("x:",x,"y:",y)
            if (!(x + j >= gridSize || x + j < 0) && grid[y][x + j] == 1) break; // Stop if overwriting another road

        }
    }
    return adjacentCount;
}

function populateArray(grid, x, y, gridSize, line_segment_size, direction, axis) {

    for (let j = 1; j < line_segment_size; j++) {
        // Check if we are out of grid bounds and break if so.
        if ((axis === 'x' && (x >= gridSize || x < 0)) || (axis === 'y' && (y >= gridSize || y < 0))) {
            break;
        }

        grid[y][x] = 1; // Place the road

        // Update the position based on direction and axis.
        if (axis === 'x') {
            direction === 0 ? x-- : x++;
        } else {
            direction === 0 ? y-- : y++;
        }

        // Check if the next position is out of bounds or if it would overwrite another road.
        if (((axis === 'x' && (x < 0 || x >= gridSize)) || (axis === 'y' && (y < 0 || y >= gridSize))) || grid[y][x] === 1) {
            break;
        }
    }
    return [grid, x, y]
}

export function populateGridWithRoadsRecursively(grid, x, y, x_prev, y_prev, depth, gridSize, line_segment_size, weight_bias, bias_half_life) {
    placeVerticalRoad(grid, x, y, x_prev, y_prev, depth, 0, gridSize, line_segment_size, weight_bias, bias_half_life); //  0 means making a line downwards
    placeVerticalRoad(grid, x, y, x_prev, y_prev, depth, 1, gridSize, line_segment_size, weight_bias, bias_half_life); // 1 means making a line upwards
    return grid;
}



function biasedRandomPlacement(prev, current, bias) {
    if ((prev > current) && (current + 2 < prev - 2)) {
        return biasedRandom(current + 2, prev - 2, bias);
    } else if ((prev < current) && (current - 2 > prev + 2)) {
        return biasedRandom(prev + 2, current - 2, bias);
    } else {
        return current;
    }
}

function placeVerticalRoad(grid, x, y, x_prev, y_prev, depth, direction, gridSize, line_segment_size, weight_bias, bias_half_life) {
    if (depth === 0) return grid; // base case
    // check if out of bounds
    if (x >= gridSize || x < 0) return grid;
    if (x >= gridSize || x < 0) return grid;

    // this decides randomly where we place the vertical road on the horisontal road
    x = biasedRandomPlacement(x_prev, x, weight_bias)

    // making sure we are within the grid still.
    x = Math.max(0, Math.min(x, gridSize - 1));
    x_prev = x;

    let adjacentCount = calculateAdjacentRoadsForVerticalLines(grid, x, y, direction, gridSize,line_segment_size);

    if (adjacentCount > 3) {
        return grid; // Exit the function if there are more than 3 adjacent road cells
    }

    // this draws the line
    [grid, x, y] = populateArray(grid, x, y, gridSize, line_segment_size, direction, "y")

    // Recursion
    placeHorisontalRoad(grid, x, y, x_prev, y_prev, depth - 1, direction = 0, gridSize, line_segment_size, Math.ceil(weight_bias * bias_half_life), bias_half_life);
    placeHorisontalRoad(grid, x, y, x_prev, y_prev, depth - 1, direction = 1, gridSize, line_segment_size, Math.ceil(weight_bias * bias_half_life), bias_half_life);
}

function placeHorisontalRoad(grid, x, y, x_prev, y_prev, depth, direction, gridSize, line_segment_size, weight_bias, bias_half_life) {
    if (depth == 0) return grid; // base case - recursive algorithm

    // check if out of bounds
    if (y >= gridSize || y < 0) return grid;
    if (x >= gridSize || x < 0) return grid;

    // this decides randomly where we place the horisontal road on the vertical road
    y = biasedRandomPlacement(y_prev, y, weight_bias)

    // making sure we are within the grid still.
    y = Math.max(0, Math.min(y, gridSize - 1));
    y_prev = y;

    let adjacentCount = calculateAdjacentRoadsForHorisontalLines(grid, x, y, direction, gridSize,line_segment_size);

    if (adjacentCount > 3) {
        return grid; // Exit the function if there are more than 3 adjacent road cells
    }

    // this draws the line
    [grid, x, y] = populateArray(grid, x, y, gridSize, line_segment_size, direction, "x")

    // Recursion
    placeVerticalRoad(grid, x, y, x_prev, y_prev, depth - 1, direction = 0, gridSize, line_segment_size, Math.ceil(weight_bias * bias_half_life), bias_half_life);
    placeVerticalRoad(grid, x, y, x_prev, y_prev, depth - 1, direction = 1, gridSize, line_segment_size, Math.ceil(weight_bias * bias_half_life), bias_half_life);
}




function biasedRandom(lowerBound, upperBound, biasFactor = 2) {
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



export function placeBuildings(grid, gridSize, probability, maxBuildingSize) {
    const center = gridSize / 2; // Calculate center of the grid

    for (let i = 0; i < gridSize; i++) {
        
        for (let j = 0; j < gridSize; j++) {

            if (grid[i][j] === 0) {
                if (Math.random() < probability) {
                    // Start with the smallest building size
                    let buildingSize = 1;
                    let distanceFromCenter = Math.sqrt((center - i) ** 2 + (center - j) ** 2); // Euclidean distance from the center

                    // Modify probability based on distance from center
                    // Closer to center has a higher chance to increase building size
                    let buildingSizeProbability = 0.5 * (1 - distanceFromCenter / center);

                    while (buildingSize < maxBuildingSize && Math.random() < buildingSizeProbability) {
                        buildingSize++;
                    }
                    
                    // Check if the building can be placed
                    if (canPlaceBuilding(grid, gridSize, i, j, buildingSize)) {
                        for (let k = 0; k < buildingSize; k++) {
                            for (let l = 0; l < buildingSize; l++) {
                                if ((i + k < gridSize) && (j + l < gridSize)) {
                                    grid[i + k][j + l] = 2; // Mark the grid cell as occupied by the building
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return grid;
}


// Function to check if a building can be placed
function canPlaceBuilding(grid, gridSize, x, y, size) {
    // Check grid boundaries
    if (x + size > gridSize || y + size > gridSize) {
        return false;
    }

    // Check if adjacent to a road
    let adjacentRoad = false;
    const checkPositions = [
        [x - 1, y], [x + size, y], [x, y - 1], [x, y + size],  // Check edges
        [x - 1, y - 1], [x + size, y - 1], [x - 1, y + size], [x + size, y + size]  // Check corners
    ];

    for (const [checkX, checkY] of checkPositions) {
        if (checkX >= 0 && checkX < gridSize && checkY >= 0 && checkY < gridSize && grid[checkX][checkY] === 1) {
            adjacentRoad = true;
            break;
        }
    }

    if (!adjacentRoad) {
        return false;
    }

    // Ensure the space is available and has at least one empty space or road around it
    for (let i = Math.max(x - 1, 0); i <= Math.min(x + size, gridSize - 1); i++) {
        for (let j = Math.max(y - 1, 0); j <= Math.min(y + size, gridSize - 1); j++) {
            if (i < x || i >= x + size || j < y || j >= y + size) { // Only check the buffer zone
                if (grid[i][j] === 2) { // If there is another building in the buffer
                    return false;
                }
            } else if (grid[i][j] !== 0) { // Check the building area
                return false;
            }
        }
    }

    return true; // Valid position for a building
}

export function placeTrees(grid, gridSize, treeProbability) {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0 && Math.random() < treeProbability) { // Check if the space is empty and random chance
                // Check adjacent cells
                if (canPlaceTree(i, j)) {
                    grid[i][j] = 4; // Place a tree
                }
            }
        }
    }
    return grid;
}

function canPlaceTree(grid, gridSize, x, y) {
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0], // Horizontal and vertical
        [1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonal
    ];

    for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[nx][ny] === 4) {
            return false; // There's a tree in an adjacent cell, so cannot place another one here
        }
    }
    return true; // No trees adjacent, can place a tree
}

export function placeSupermarkets(grid, gridSize, baseProbability) {
    for (let i = 0; i <= gridSize - 4; i++) {
        for (let j = 0; j <= gridSize - 4; j++) {
            if (canPlaceSupermarket(grid, gridSize,i, j)) {
                let roadCount = countAdjacentRoads(grid, gridSize, i, j); // Count roads adjacent to the 4x4 block
                let adjustedProbability = baseProbability * (1 + roadCount / 8); // Increase probability with more roads
                if (Math.random() < adjustedProbability) {
                    for (let k = 0; k < 4; k++) {
                        for (let l = 0; l < 4; l++) {
                            grid[i + k][j + l] = 3; // Mark these cells as occupied by a supermarket
                        }
                    }
                }
            }
        }
    }
    return grid;
}

function canPlaceSupermarket(grid, gridSize, x, y) {
    // Ensure the 4x4 block is completely free
    for (let dx = 0; dx < 4; dx++) {
        for (let dy = 0; dy < 4; dy++) {
            if (grid[x + dx][y + dy] !== 0) {
                return false;
            }
        }
    }
    // Check if there is at least one road adjacent to the 4x4 block
    return countAdjacentRoads(grid, gridSize, x, y) > 0;
}

function countAdjacentRoads(grid, gridSize, x, y) {
    let count = 0;
    // Check horizontal and vertical roads adjacent to all sides
    for (let dx = -1; dx <= 4; dx++) {
        for (let dy = -1; dy <= 4; dy++) {
            if (dx === -1 || dx === 4 || dy === -1 || dy === 4) {
                let nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[nx][ny] === 1) {
                    count++;
                }
            }
        }
    }
    return count;
}


