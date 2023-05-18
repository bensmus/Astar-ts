import { Vector2, CellType, Grid } from "./index"

// 1:1 correspondence: N (number) <-> coor (Vector2) <-> cell (Cell)
export function astar(grid: Grid, diagonalFlag: boolean) {
    const [[startCoor, targetCoor], isPathFound] = updateGrid(grid, diagonalFlag)
    let pathCoor = targetCoor
    while (pathCoor) {
        console.log(pathCoor)
        if (!pathCoor.isEqual(startCoor) && !pathCoor.isEqual(targetCoor)) {
            grid.set(pathCoor, CellType.Path)
        }
        pathCoor = grid.get(pathCoor).parent
    }
    return isPathFound
}

// Update the grid cell 'parent' and 'distance' properties.
function updateGrid(grid: Grid, diagonalFlag: boolean): [Vector2[], boolean] {
    
    // Reset astar distance and parent to default.
    for (let i = 0; i < grid.rows; i++) {
        for (let j = 0; j < grid.cols; j++) {
            grid.data[i][j].distance = Infinity
            grid.data[i][j].parent = null
        }
    }

    const endpoints = grid.typeCoorArray(CellType.Endpoint)
    const startCoor = endpoints[0]
    const targetCoor = endpoints[1]
    grid.get(startCoor).distance = 0 // Distance is how far from start.
    
    let current = grid.coorToN(startCoor)
    const target = grid.coorToN(targetCoor)
    const unvisited = new Set<number>([current])
    const visited = new Set<number>()
    
    while (current != target) {
        const currentCoor = grid.NToCoor(current)

        // Get unvisited neighbours.
        const nextCoors = getNextCoors(currentCoor, visited, grid, diagonalFlag)
        
        // Update unvisited neighbours.
        const distanceNextPotential = grid.get(currentCoor).distance + 1
        nextCoors.forEach(nextCoor => {
            const nextCell = grid.get(nextCoor)
            unvisited.add(grid.coorToN(nextCoor))
            if (distanceNextPotential < nextCell.distance) {
                nextCell.distance = distanceNextPotential
                nextCell.parent = currentCoor
            }
        })

        // Update unvisited and visited. Update current.
        unvisited.delete(current)
        visited.add(current)
        const bestUnvisitedCoor = getBestUnvisitedCoor(
            grid,
            Array.from(unvisited).map(N => grid.NToCoor(N)), 
            targetCoor,
            diagonalFlag
        )
        
        if (bestUnvisitedCoor) {
            current = grid.coorToN(bestUnvisitedCoor)
        } 
        else { // Unable to find path.
            return [endpoints, false]
        }
    }
    
    // Return target coordinates, going to need it to jump via parent to start.
    return [endpoints, true]
}

// E.g: getNextCoors(new Vector2(0, 0), new Set([1]), grid, true) 
function getNextCoors(currentCoor: Vector2, visited: Set<number>, grid: Grid, diagonalFlag: boolean) {
    const neighbourCoors = getNeighbourCoors(currentCoor, grid.typeMask(CellType.Obstacle), diagonalFlag)
    return neighbourCoors.filter(neighbourCoor => !visited.has(grid.coorToN(neighbourCoor)))
}

// E.g: getNeighbours(new Vector2(1, 1), grid.getCellMask(CellType.Obstacle), true)
function getNeighbourCoors(cellCoor: Vector2, mask: Array<Array<boolean>>, diagonalFlag: boolean) {
    const neighbours = Array()
    const predBase = (coor: Vector2) => coor.isValidCellCoor() && !mask[coor.y][coor.x]

    // -- Cardinals:
    
    // Which cardinal cells are available, rotating clockwise starting from right direction. 
    // Used to determine if diagonal cells are reachable.
    const cardinalBools = Array(4)
    cardinalBools.fill(false)
    for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2
        const diffVect = new Vector2(Math.cos(angle), Math.sin(angle)).map(component => Math.round(component))
        const cardinal = cellCoor.plus(diffVect)
        if (predBase(cardinal)) {
            neighbours.push(cardinal)
            cardinalBools[i] = true
        }
    }

    // -- Diagonals:

    if (diagonalFlag) {
        const circInc = (val: number, bound: number) => (val + 1 == bound) ? 0 : val + 1
        for (let i = 0; i < 4; i++) {
            const angle = i * Math.PI / 2 + Math.PI / 4
            const diffVect = new Vector2(Math.cos(angle), Math.sin(angle)).map(component => Math.round(component))
            const diagonal = cellCoor.plus(diffVect)
            const diagonalIsReachable = cardinalBools[i] || cardinalBools[circInc(i, 4)]
            if (predBase(diagonal) && diagonalIsReachable) {
                neighbours.push(diagonal)
            }
        }
    }
    
    return neighbours
}

// E.g: getBestUnvisitedCoor([new Vector2(0, 1), new Vector2(1, 0)], new Vector2(2, 0))
function getBestUnvisitedCoor(grid: Grid, unvisitedCoors: Array<Vector2>, targetCoor: Vector2, diagonalFlag: boolean): Vector2 | null {
    let bestUnvisitedCoor = null
    let minScore = Infinity
    unvisitedCoors.forEach(unvisitedCoor => {
        const unvisitedCell = grid.get(unvisitedCoor)
        const score = coorDist(unvisitedCoor, targetCoor, diagonalFlag) + unvisitedCell.distance
        if (score < minScore) {
            minScore = score
            bestUnvisitedCoor = unvisitedCoor
        }
    })
    return bestUnvisitedCoor
}

function coorDist(A: Vector2, B: Vector2, diagonalFlag: boolean) {
    const dx = Math.abs(A.x - B.x)
    const dy = Math.abs(A.y - B.y)
    const cardinalDistance = dx + dy
    return diagonalFlag ? cardinalDistance - Math.min(dx, dy) : cardinalDistance
}
