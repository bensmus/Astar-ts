import { astar } from './astar.js';
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const belowCanvas = document.getElementById('belowCanvas');
const drawObstacleButton = document.getElementById('drawObstacleButton');
const drawEndpointButton = document.getElementById('drawEndpointButton');
const eraseButton = document.getElementById('eraseButton');
const gridEditButtons = [drawObstacleButton, drawEndpointButton, eraseButton];
function updateButtonHighlight(button, buttons) {
    buttons.forEach(b => {
        if (b == button) {
            b.style.borderColor = 'aqua';
        }
        else {
            b.style.borderColor = 'lightgray';
        }
    });
}
const clearAllButton = document.getElementById('clearAllButton'); // Clear path, endpoints, and obstacles.
const clearPathAndEndpointsButton = document.getElementById('clearPathAndEndpointsButton'); // Clear path, endpoints, and obstacles.
const diagonalCheckbox = document.getElementById('diagonalCheckbox');
const pathInfo = document.getElementById('pathInfo');
const COLS = 30;
const ROWS = 20;
const layout = {
    padding: 10,
    cellSize: 30
};
const totalWidth = COLS * layout.cellSize + layout.padding;
const totalHeight = ROWS * layout.cellSize + layout.padding;
const canvasRect = canvas.getBoundingClientRect();
canvas.width = totalWidth;
belowCanvas.style.width = `${totalWidth - 10}px`;
canvas.height = totalHeight;
belowCanvas.style.height = `${totalHeight}px`;
export var CellType;
(function (CellType) {
    CellType[CellType["Nothing"] = 0] = "Nothing";
    CellType[CellType["Obstacle"] = 1] = "Obstacle";
    CellType[CellType["Endpoint"] = 2] = "Endpoint";
    CellType[CellType["Path"] = 3] = "Path";
})(CellType || (CellType = {}));
export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    plus(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    map(f) {
        return new Vector2(f(this.x), f(this.y));
    }
    isValidCellCoor() {
        return this.x >= 0 && this.x < COLS && this.y >= 0 && this.y < ROWS;
    }
    isEqual(other) {
        return this.x == other.x && this.y == other.y;
    }
}
class Cell {
    constructor(type, distance, parent) {
        this.type = type;
        // Used by astar
        this.distance = distance;
        this.parent = parent;
    }
}
export class Grid {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.data = Array(this.rows); // 2D character array.
        for (let i = 0; i < this.rows; i++) {
            this.data[i] = Array(this.cols);
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = new Cell(CellType.Nothing, Infinity, null);
            }
        }
        // Graphics init
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.beginPath();
        // Vertical lines.
        for (let x = layout.padding; x <= this.cols * layout.cellSize + layout.padding; x += layout.cellSize) {
            ctx.moveTo(x, layout.padding);
            ctx.lineTo(x, rows * layout.cellSize + layout.padding);
        }
        // Horizontal lines.
        for (let y = layout.padding; y <= rows * layout.cellSize + layout.padding; y += layout.cellSize) {
            ctx.moveTo(layout.padding, y);
            ctx.lineTo(this.cols * layout.cellSize + layout.padding, y);
        }
        ctx.stroke();
    }
    get(cellCoor) {
        return this.data[cellCoor.y][cellCoor.x];
    }
    set(cellCoor, type) {
        this.get(cellCoor).type = type;
        const left = cellCoor.x * layout.cellSize + layout.padding + 1;
        const top = cellCoor.y * layout.cellSize + layout.padding + 1;
        const edgeLen = layout.cellSize - 2;
        ctx.fillStyle = cellColors.get(type);
        ctx.fillRect(left, top, edgeLen, edgeLen);
    }
    coorToN(coor) {
        return coor.y * this.cols + coor.x;
    }
    NToCoor(N) {
        const y = Math.floor(N / this.cols);
        const x = N - y * this.cols;
        return new Vector2(x, y);
    }
    // Translate mousePos Vector2 into cell Vector2.
    mousePosToCellCoor(mousePos) {
        // return mousePos.map(
        //     (mouse) => Math.floor((mouse - layout.padding) / layout.cellSize) // !
        // )
        const x = Math.floor((mousePos.x - layout.padding - canvasRect.left) / layout.cellSize);
        const y = Math.floor((mousePos.y - layout.padding - canvasRect.top) / layout.cellSize);
        return new Vector2(x, y);
    }
    // Count number of cells of a certain type on grid.
    countCell(type) {
        return this.data.flat().filter(cell => cell.type == type).length;
    }
    clickCell(cellCoor) {
        if (userAction.cellType == CellType.Endpoint && this.countCell(CellType.Endpoint) < 2 || userAction.cellType != CellType.Endpoint) {
            this.set(cellCoor, userAction.cellType);
        }
        if (this.countCell(CellType.Endpoint) == 2) {
            this.clearPath();
            this.drawPath();
        }
        else {
            this.clearPath();
        }
    }
    drawPath() {
        console.log('drawing path');
        if (astar(this, diagonalCheckbox.checked)) {
            pathInfo.textContent = '';
        }
        else {
            pathInfo.textContent = 'No path';
        }
    }
    clearPath() {
        console.log('clearing path');
        pathInfo.textContent = '';
        this.typeCoorArray(CellType.Path).forEach(cell => this.set(cell, CellType.Nothing));
    }
    typeCoorArray(type) {
        const ar = Array(); // Cell contents.
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.data[y][x].type == type) {
                    ar.push(new Vector2(x, y));
                }
            }
        }
        return ar;
    }
    typeMask(type) {
        const mask = Array(this.rows);
        for (let y = 0; y < this.rows; y++) {
            mask[y] = Array(this.cols);
            for (let x = 0; x < this.cols; x++) {
                if (this.data[y][x].type == type) {
                    mask[y][x] = true;
                }
                else {
                    mask[y][x] = false;
                }
            }
        }
        return mask;
    }
}
const cellColors = new Map();
cellColors.set(CellType.Nothing, 'white');
cellColors.set(CellType.Obstacle, 'black');
cellColors.set(CellType.Endpoint, 'red');
cellColors.set(CellType.Path, 'yellow');
const userAction = {
    cellType: CellType.Obstacle,
    lastCell: new Vector2(-1, -1),
    isMousePressed: false // Variable updated by mousedown and mouseup event listeners.
};
let grid = new Grid(COLS, ROWS);
// Called when mouse is clicked or dragged.
function cellClickHandler(event, checkDifferent) {
    const mousePos = new Vector2(event.x, event.y);
    const cellCoor = grid.mousePosToCellCoor(mousePos);
    if (cellCoor.isValidCellCoor() && (!checkDifferent || !cellCoor.isEqual(userAction.lastCell))) {
        // User mouseover new cell - cell triggered.
        userAction.lastCell = cellCoor;
        grid.clickCell(cellCoor);
    }
}
clearAllButton.addEventListener('click', () => { grid = new Grid(COLS, ROWS); });
clearPathAndEndpointsButton.addEventListener('click', () => {
    const endpoints = grid.typeCoorArray(CellType.Endpoint);
    grid.clearPath();
    endpoints.forEach(coor => grid.set(coor, CellType.Nothing));
});
document.addEventListener('mousedown', (event) => {
    userAction.isMousePressed = true;
    cellClickHandler(event, false);
});
document.addEventListener('mouseup', () => { userAction.isMousePressed = false; });
document.addEventListener('mousemove', (event) => {
    if (userAction.isMousePressed) {
        cellClickHandler(event, true);
    }
});
drawObstacleButton.addEventListener('click', () => {
    userAction.cellType = CellType.Obstacle;
    canvas.style.cursor = "url('img/brush.png'), default";
    updateButtonHighlight(drawObstacleButton, gridEditButtons);
});
drawEndpointButton.addEventListener('click', () => {
    userAction.cellType = CellType.Endpoint;
    canvas.style.cursor = "url('img/brush.png'), default";
    updateButtonHighlight(drawEndpointButton, gridEditButtons);
});
eraseButton.addEventListener('click', () => {
    userAction.cellType = CellType.Nothing;
    canvas.style.cursor = "url('img/eraser.png'), default";
    updateButtonHighlight(eraseButton, gridEditButtons);
});
