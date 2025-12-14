export class BoardGrid {

    constructor(gridElement) {
        this.gridElement = gridElement;
        this.N = 0;
    }

    drawGrid(N) {
        this.N = N;

        this.gridElement.innerHTML = "";

        // CSS Grid Styles 
        this.gridElement.style.display = "grid"; 
        this.gridElement.style.gridTemplateRows = `repeat(${N}, 1fr)`;
        this.gridElement.style.gridTemplateColumns = `repeat(${N}, 1fr)`;

        //  Grid Logic
        const cellsArray = new Array(N);
        for (let i = 0; i < N; i++) {
            cellsArray[i] = new Array(N);
        }

        let count = 1;
        for (let row = 0; row < N; row++) {
            if (row % 2 === 0) {
                for (let col = 0; col < N; col++) {
                    cellsArray[row][col] = count++;
                }
            } else {
                for (let col = N - 1; col >= 0; col--) {
                    cellsArray[row][col] = count++;
                }
            }
        }

        for (let row = N - 1; row >= 0; row--) {
            for (let col = 0; col < N; col++) {
                const cellNum = cellsArray[row][col];
                const cell = document.createElement("div");

                // Set base class
                cell.className = "grid-cell";

                // Set color class
                if (cellNum % 2 === 0) {
                    cell.classList.add("cell-even");
                } else {
                    cell.classList.add("cell-odd");
                }

                cell.id = `cell-${cellNum}`;

                cell.textContent = cellNum;
                cell.classList.add("cell-numbered");

                this.gridElement.appendChild(cell);
            }
        }
    }

    getCellCenterCoordinates(cellNumber) {

        const cellElement = document.getElementById(`cell-${cellNumber}`);
        
        if (!cellElement) {
            return null;
        }

        // Get the position and size of the cell
        const rect = cellElement.getBoundingClientRect();
        // Get the position and size of the grid container
        const gridRect = this.gridElement.getBoundingClientRect();

        // Calculate the center (x, y) relative to the grid container
        const x = (rect.left + rect.width / 2) - gridRect.left;
        const y = (rect.top + rect.height / 2) - gridRect.top;

        return { x, y };
    }
}