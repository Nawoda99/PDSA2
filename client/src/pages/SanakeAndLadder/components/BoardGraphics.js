export class BoardGraphics {

    constructor(svgElement) {
        this.svgElement = svgElement;
        this.xmlns = "http://www.w3.org/2000/svg";
        this.LADDER_WIDTH = 12;
        this.NUM_RUNGS = 5;
    }

    clear() {
        while (this.svgElement.firstChild) {
            this.svgElement.removeChild(this.svgElement.firstChild);
        }
    }

    drawLadder(x1, y1, x2, y2) {
        // Calculate Geometry

        // Vector (direction) of the ladder
        const dx = x2 - x1;
        const dy = y2 - y1;

        // Perpendicular vector (rotated 90 degrees)
        const pdx = -dy;
        const pdy = dx;

        // Normalize the perpendicular vector (make its length 1)
        const pLength = Math.sqrt(pdx * pdx + pdy * pdy);
        const nx = pdx / pLength; // Normalized X
        const ny = pdy / pLength; // Normalized Y

        // Half-width offset
        const w_dx = nx * (this.LADDER_WIDTH / 2);
        const w_dy = ny * (this.LADDER_WIDTH / 2);

        // Rail 1 (Left)
        const rail1_x1 = x1 - w_dx;
        const rail1_y1 = y1 - w_dy;
        const rail1_x2 = x2 - w_dx;
        const rail1_y2 = y2 - w_dy;
        this.drawSVGLine(rail1_x1, rail1_y1, rail1_x2, rail1_y2, "ladder-rail");

        // Rail 2 (Right)
        const rail2_x1 = x1 + w_dx;
        const rail2_y1 = y1 + w_dy;
        const rail2_x2 = x2 + w_dx;
        const rail2_y2 = y2 + w_dy;
        this.drawSVGLine(rail2_x1, rail2_y1, rail2_x2, rail2_y2, "ladder-rail");

        // Loop to create rungs
        for (let i = 1; i <= this.NUM_RUNGS; i++) {
            // Calculate position along the ladder
            const fraction = i / (this.NUM_RUNGS + 1);

            // Point on Rail 1
            const rung_x1 = rail1_x1 + (rail1_x2 - rail1_x1) * fraction;
            const rung_y1 = rail1_y1 + (rail1_y2 - rail1_y1) * fraction;

            // Point on Rail 2
            const rung_x2 = rail2_x1 + (rail2_x2 - rail2_x1) * fraction;
            const rung_y2 = rail2_y1 + (rail2_y2 - rail2_y1) * fraction;

            this.drawSVGLine(rung_x1, rung_y1, rung_x2, rung_y2, "ladder-rung");
        }
    }


    drawSnake(x1, y1, x2, y2) {

        // Define Color Palette & Pick a Random Color
        const colorPalette = [
            { body: "#d946ef", head: "#a21caf" }, // Fuchsia
            { body: "#10b981", head: "#047857" }, // Emerald
            { body: "#f59e0b", head: "#b45309" }, // Amber
            { body: "#3b82f6", head: "#1d4ed8" }, // Blue
            { body: "#ef4444", head: "#b91c1c" },  // Red
        ];
        const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        // Create a group for the entire snake.
        const snakeGroup = document.createElementNS(this.xmlns, "g");
        snakeGroup.setAttribute("class", "snake-group");

        // Calculate the main "S" curve points
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const curveAmount = length * 0.3; // How much the "S" curve bulges
        const nx = -dy / length; // Perpendicular vector (normalized)
        const ny = dx / length;
        const control1X = (x1 + dx * 0.25) + nx * curveAmount;
        const control1Y = (y1 + dy * 0.25) + ny * curveAmount;
        const control2X = (x1 + dx * 0.75) - nx * curveAmount;
        const control2Y = (y1 + dy * 0.75) - ny * curveAmount;

        // Build the Tapering Body
        const points = []; // This will store our spine points
        const segments = 20; // More segments for a smoother shape
        const maxBodyWidth = 14; // Max width of the snake's body

        for (let i = 0; i <= segments; i++) {
            const t = i / segments; // t goes from 0.0 (head) to 1.0 (tail)

            // curve formula to find a point on the "spine"
            const cx = (1 - t) ** 3 * x1 + 3 * (1 - t) ** 2 * t * control1X + 3 * (1 - t) * t ** 2 * control2X + t ** 3 * x2;
            const cy = (1 - t) ** 3 * y1 + 3 * (1 - t) ** 2 * t * control1Y + 3 * (1 - t) * t ** 2 * control2Y + t ** 3 * y2;

            // Find the tangent (direction) at this point
            const tx = (3 * (1 - t) ** 2 * (control1X - x1) + 6 * (1 - t) * t * (control2X - control1X) + 3 * t ** 2 * (x2 - control2X));
            const ty = (3 * (1 - t) ** 2 * (control1Y - y1) + 6 * (1 - t) * t * (control2Y - control1Y) + 3 * t ** 2 * (y2 - control2Y));
            const tangentLength = Math.sqrt(tx * tx + ty * ty);
            const tnx = -ty / tangentLength; // Perpendicular vector (normalized)
            const tny = tx / tangentLength;

            // Tapering Logic: Use Math.sin(t * PI) for a "thick in middle" shape
            const width = Math.sin(t * Math.PI) * maxBodyWidth + 2; // +2 so it's never 0

            points.push({
                x: cx, y: cy,
                nx: tnx, ny: tny,
                width: width
            });
        }

        // Construct the path for the body outline
        let pathData = `M ${points[0].x + points[0].nx * points[0].width / 2} ${points[0].y + points[0].ny * points[0].width / 2}`; // Start point (right side of head)
        for (let i = 1; i < points.length; i++) { // Go down the "right" side
            pathData += ` L ${points[i].x + points[i].nx * points[i].width / 2} ${points[i].y + points[i].ny * points[i].width / 2}`;
        }
        for (let i = points.length - 1; i >= 0; i--) { // Go back up the "left" side
            pathData += ` L ${points[i].x - points[i].nx * points[i].width / 2} ${points[i].y - points[i].ny * points[i].width / 2}`;
        }
        pathData += " Z";

        const body = document.createElementNS(this.xmlns, "path");
        body.setAttribute("d", pathData);
        body.setAttribute("class", "snake-body-fill");
        body.style.fill = randomColor.body; // Apply random color
        snakeGroup.appendChild(body);

        // Calculate the angle of the head based on the first segment
        const headAngleDegrees = Math.atan2(control1Y - y1, control1X - x1) * 180 / Math.PI;

        const headGroup = document.createElementNS(this.xmlns, "g");
        // Apply rotation to the entire head group around the starting point (x1, y1)
        headGroup.setAttribute("transform", `translate(${x1}, ${y1}) rotate(${headAngleDegrees})`);

        // Head shape (Flipped 180 degrees)
        const headShape = document.createElementNS(this.xmlns, "path");
        headShape.setAttribute("d", "M 10, -8 C -5, -9, -15, 0, -5, 9 C 10, 8, 10, -8, 10, -8 Z");
        headShape.setAttribute("class", "snake-head-fill");
        headShape.style.fill = randomColor.head; // Apply matching random color
        headGroup.appendChild(headShape);

        // Eyes (Flipped 180 degrees)
        const eye1 = document.createElementNS(this.xmlns, "circle");
        eye1.setAttribute("cx", "-7"); eye1.setAttribute("cy", "-4"); eye1.setAttribute("r", "3");
        eye1.setAttribute("class", "snake-eye-fill");
        headGroup.appendChild(eye1);

        const eye2 = document.createElementNS(this.xmlns, "circle");
        eye2.setAttribute("cx", "-7"); eye2.setAttribute("cy", "4"); eye2.setAttribute("r", "3");
        eye2.setAttribute("class", "snake-eye-fill");
        headGroup.appendChild(eye2);

        // Tongue (Flipped 180 degrees and fixed)
        const tongue = document.createElementNS(this.xmlns, "path");
        tongue.setAttribute("d", "M -15,0 L -22,0 M -22,0 L -20,-2 M -22,0 L -20,2");
        tongue.setAttribute("class", "snake-tongue-line");
        headGroup.appendChild(tongue);

        snakeGroup.appendChild(headGroup);
        this.svgElement.appendChild(snakeGroup);
    }

    drawSVGLine(x1, y1, x2, y2, cssClass) {
        const line = document.createElementNS(this.xmlns, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("class", cssClass);
        this.svgElement.appendChild(line);
    }
}