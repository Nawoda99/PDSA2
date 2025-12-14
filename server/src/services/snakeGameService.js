
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

// generate boad functions
const generateBoard = (n) => {
    const boardSize = n * n;
    const board = {};

    for (let i = 1; i <= boardSize; i++) {
        board[i] = i;
    }

    // Generate Snakes (N-2)
    let snakesCount = n - 2;
    let s = 0;
    while (s < snakesCount) {
        const snakeHead = getRandomInt(2, boardSize); // 2 to boardSize-1
        const snakeTail = getRandomInt(1, snakeHead); // 1 to snakeHead-1

        if (board[snakeHead] === snakeHead && board[snakeTail] === snakeTail) {
            board[snakeHead] = snakeTail;
            s++;
        } else {

        }
    }

    // Generate Ladders (N-2) 
    let laddersCount = n - 2;
    let l = 0;
    while (l < laddersCount) {
        const ladderStart = getRandomInt(2, boardSize);
        const ladderEnd = getRandomInt(ladderStart + 1, boardSize + 1);

        if (board[ladderStart] === ladderStart && board[ladderEnd] === ladderEnd) {
            board[ladderStart] = ladderEnd;
            l++;
        } else {
            
        }
    }

    return board;
};

// BFS Algorithm
const solveWithBFS = (board, boardSize) => {
    // Queue for BFS: Stores arrays [position, rolls]
    const queue = [];
    
    // Visited array (Index 0 unused to match board numbers 1..100)
    const visited = new Array(boardSize + 1).fill(false);

    // Start at position 1 with 0 rolls
    queue.push([1, 0]);
    visited[1] = true;

    while (queue.length > 0) {
        // Dequeue 
        const [currentPosition, currentRolls] = queue.shift();

        // Try all 6 dice possibilities
        for (let i = 1; i <= 6; i++) {
            let nextPosition = currentPosition + i;

            if (nextPosition > boardSize) {
                continue;
            }

            // Check snake or ladder destination
            let finalDestination = board[nextPosition];
            
            // Safety check if board config works as expected
            if (finalDestination === undefined) finalDestination = nextPosition;

            if (finalDestination === boardSize) {
                return currentRolls + 1;
            }

            if (!visited[finalDestination]) {
                visited[finalDestination] = true;
                queue.push([finalDestination, currentRolls + 1]);
            }
        }
    }
    return -1;
};

// DIJKSTRA ALGORITHM
class MinPriorityQueue {
    constructor() {
        this.collection = [];
    }

    enqueue(position, rolls) {
        const node = { position, rolls };
        
        if (this.isEmpty()) {
            this.collection.push(node);
        } else {
            let added = false;
            // Find the correct spot to keep array sorted by 'rolls' (distance)
            for (let i = 0; i < this.collection.length; i++) {
                if (node.rolls < this.collection[i].rolls) {
                    this.collection.splice(i, 0, node);
                    added = true;
                    break;
                }
            }
            if (!added) {
                this.collection.push(node);
            }
        }
    }

    dequeue() {
        return this.collection.shift();
    }

    isEmpty() {
        return this.collection.length === 0;
    }
}

const solveWithDijkstra = (board, boardSize) => {
    // PriorityQueue
    const pq = new MinPriorityQueue();

    //  MinRolls Array
    const minRolls = new Array(boardSize + 1).fill(Infinity);

    // Start at square 1
    minRolls[1] = 0;
    pq.enqueue(1, 0);

    while (!pq.isEmpty()) {
        // Get node with smallest rolls
        const current = pq.dequeue();
        const currentPosition = current.position;
        const currentRolls = current.rolls;

        // Optimization check
        if (currentRolls > minRolls[currentPosition]) {
            continue;
        }

        // Reached End
        if (currentPosition === boardSize) {
            return currentRolls;
        }

        // Check Dice Rolls
        for (let i = 1; i <= 6; i++) {
            let nextPosition = currentPosition + i;

            if (nextPosition > boardSize) {
                continue;
            }

            // Find destination (Snake/Ladder)
            let finalDestination = board[nextPosition];
            if (finalDestination === undefined) finalDestination = nextPosition;

            // Cost is 1 move
            const newRolls = currentRolls + 1;

            // Relaxation
            if (newRolls < minRolls[finalDestination]) {
                minRolls[finalDestination] = newRolls;
                pq.enqueue(finalDestination, newRolls);
            }
        }
    }
    return -1;
};

module.exports = {
    generateBoard,
    solveWithBFS,
    solveWithDijkstra
};