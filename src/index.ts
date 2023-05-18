import {astar} from './astar'

const canvas = document.getElementById('myCanvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')

const belowCanvas = document.getElementById('belowCanvas')

const toggleButton = document.getElementById('toggleButton')
const toggleInfo = document.getElementById('toggleInfo')

const clearButton = document.getElementById('clearButton') // Clear path, endpoints, and obstacles.

const diagonalCheckbox = document.getElementById('diagonalCheckbox') as HTMLInputElement

const pathInfo = document.getElementById('pathInfo')

const COLS = 30
const ROWS = 20

const layout = {
    padding: {
        window: 10,
        canvas: 10
    },
    cellSize: 30
}

export enum CellType {
    Nothing,
    Obstacle,
    Endpoint,
    Path
}

export class Vector2 {
    x: number
    y: number
    
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    plus(other: Vector2) {
        return new Vector2(this.x + other.x, this.y + other.y)
    }

    map(f: (n: number) => number) {
        return new Vector2(f(this.x), f(this.y))
    }

    isValidCellCoor() {
        return this.x >= 0 && this.x < COLS && this.y >= 0 && this.y < ROWS
    }

    isEqual(other: Vector2) {
        return this.x == other.x && this.y == other.y
    }
}

class Cell {
    type: CellType
    distance: number
    parent: Vector2

    constructor(type: CellType, distance: number, parent: Vector2) {
        this.type = type

        // Used by astar
        this.distance = distance
        this.parent = parent
    }
}

export class Grid {
    cols: number
    rows: number
    data: Array<Array<Cell>>
    constructor(cols: number, rows: number) {
        this.cols = cols
        this.rows = rows
        this.data = Array(this.rows) // 2D character array.
        for (let i = 0; i < this.rows; i++) {
            this.data[i] = Array(this.cols)
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = new Cell(CellType.Nothing, Infinity, null)
            }
        }

        // Graphics init
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 1000, 1000)
        
        ctx.beginPath()

        // Vertical lines.
        for (let x = layout.padding.canvas; x <= this.cols * layout.cellSize + layout.padding.canvas; x += layout.cellSize) {
            ctx.moveTo(x, layout.padding.canvas)
            ctx.lineTo(x, rows * layout.cellSize + layout.padding.canvas)
        }

        // Horizontal lines.
        for (let y = layout.padding.canvas; y <= rows * layout.cellSize + layout.padding.canvas; y += layout.cellSize) {
            ctx.moveTo(layout.padding.canvas, y)
            ctx.lineTo(this.cols * layout.cellSize + layout.padding.canvas, y)
        }
        
        ctx.stroke()
    }

    get(cellCoor: Vector2) {
        return this.data[cellCoor.y][cellCoor.x]
    }

    set(cellCoor: Vector2, type: CellType) {
        this.get(cellCoor).type = type
        
        const left = cellCoor.x * layout.cellSize + layout.padding.canvas + 1
        const top = cellCoor.y * layout.cellSize + layout.padding.canvas + 1
        const edgeLen = layout.cellSize - 2
        ctx.fillStyle = cellColors.get(type)
        ctx.fillRect(left, top, edgeLen, edgeLen)
    }

    coorToN(coor: Vector2) {
        return coor.y * this.cols + coor.x
    }

    NToCoor(N: number) {
        const y = Math.floor(N / this.cols)
        const x = N - y * this.cols 
        return new Vector2(x, y)
    }

    // Translate mousePos Vector2 into cell Vector2.
    mousePosToCellCoor(mousePos: Vector2) {
        return mousePos.map(
            (mouse) => Math.floor((mouse - layout.padding.canvas - layout.padding.window) / layout.cellSize)
        )
    }

    // Count number of cells of a certain type on grid.
    countCell(type: CellType) {
        return this.data.flat().filter(cell => cell.type == type).length
    }

    clickCell(cellCoor: Vector2) {
        const typeClicked = this.get(cellCoor).type

        if (typeClicked == CellType.Nothing) { // Toggle empty cell.
            const endpointCount = this.countCell(CellType.Endpoint)
            if (endpointCount < 2 || userAction.cellType == CellType.Obstacle) { // Can paint.
                this.set(cellCoor, userAction.cellType)
                if (userAction.cellType == CellType.Endpoint && endpointCount == 1) { // There are actually two endpoints now.
                    this.drawPath()
                }
            }
        }

        else { // Toggle filled cell, it could be path (do nothing), endpoint, or obstacle.
            if (typeClicked == CellType.Endpoint) {
                this.clearPath()
                const endpoints = this.typeCoorArray(CellType.Endpoint)
                endpoints.forEach(e => this.set(e, CellType.Nothing))
            }

            else if (typeClicked == CellType.Obstacle) {
                this.set(cellCoor, CellType.Nothing)
                if (this.countCell(CellType.Endpoint) == 2) {
                    this.clearPath()
                    this.drawPath()
                }
            }
        }
    }

    drawPath() {
        console.log('drawing path')
        if (astar(this, diagonalCheckbox.checked)) {
            pathInfo.textContent = ''
        } else {
            pathInfo.textContent = 'No path'
        }
    }

    clearPath() {
        console.log('clearing path')
        this.typeCoorArray(CellType.Path).forEach(cell => this.set(cell, CellType.Nothing))
    }

    typeCoorArray(type: CellType) {
        const ar = Array() // Cell contents.
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.data[y][x].type == type) {
                    ar.push(new Vector2(x, y))
                }
            }
        }
        return ar
    }

    typeMask(type: CellType) {
        const mask = Array(this.rows)
        for (let y = 0; y < this.rows; y++) {
            mask[y] = Array(this.cols)
            for (let x = 0; x < this.cols; x++) {
                if (this.data[y][x].type == type) {
                    mask[y][x] = true
                } else {
                    mask[y][x] = false
                }
            }
        }
        return mask
    }
}

const cellColors: Map<CellType, string> = new Map()
cellColors.set(CellType.Nothing, 'white')
cellColors.set(CellType.Obstacle, 'black')
cellColors.set(CellType.Endpoint, 'red')
cellColors.set(CellType.Path, 'yellow')

const userAction = {
    cellType: CellType.Obstacle, // What type of cell user is placing on grid.
    lastCell: new Vector2(-1, -1), // Last cellCoor user interacted with (to avoid retrigerring).
    isMousePressed: false // Variable updated by mousedown and mouseup event listeners.
}

let grid = new Grid(COLS, ROWS)

canvas.style.top = `${layout.padding.window}px`
canvas.style.left = `${layout.padding.window}px`
belowCanvas.style.top = `${layout.padding.window + grid.rows * layout.cellSize + 20}px` // 20px looks good.
belowCanvas.style.left = `${layout.padding.window + layout.padding.canvas}px`

// Called when mouse is clicked or dragged.
function cellClickHandler(event: MouseEvent, checkDifferent: boolean) {
    const mousePos = new Vector2(event.x, event.y)
    const cellCoor = grid.mousePosToCellCoor(mousePos)
    if (cellCoor.isValidCellCoor() && (!checkDifferent || !cellCoor.isEqual(userAction.lastCell))) {
        // User mouseover new cell - cell triggered.
        userAction.lastCell = cellCoor
        grid.clickCell(cellCoor)
    }
}

clearButton.addEventListener('click', () => {grid = new Grid(COLS, ROWS)})

document.addEventListener('mousedown', (event) => {
    userAction.isMousePressed = true
    cellClickHandler(event, false)
})

document.addEventListener('mouseup', () => {userAction.isMousePressed = false})

document.addEventListener('mousemove', (event) => {
    if (userAction.isMousePressed) {
        cellClickHandler(event, true)
    }
})

toggleButton.addEventListener('click', () => {
    if (userAction.cellType == CellType.Obstacle) {
        userAction.cellType = CellType.Endpoint
        toggleInfo.textContent = 'Endpoints'
    } else {
        userAction.cellType = CellType.Obstacle
        toggleInfo.textContent = 'Obstacles'
    }
})
