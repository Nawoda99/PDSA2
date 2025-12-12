import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../Providers/ThemeProvider";

const TrafficNetworkGraph = ({ network }) => {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const nodePositions = {
    A: { x: 120, y: 300 },
    B: { x: 300, y: 150 },
    C: { x: 300, y: 300 },
    D: { x: 300, y: 450 },
    E: { x: 500, y: 150 },
    F: { x: 500, y: 380 },
    G: { x: 700, y: 150 },
    H: { x: 700, y: 380 },
    T: { x: 880, y: 265 },
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!network || !canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    const graphWidth = 1000;
    const graphHeight = 600;
    const padding = 60;

    const scaleX = (dimensions.width - padding * 2) / graphWidth;
    const scaleY = (dimensions.height - padding * 2) / graphHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (dimensions.width - graphWidth * scale) / 2;
    const offsetY = (dimensions.height - graphHeight * scale) / 2;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const baseLineWidth = 4 * scale;
    const baseArrowSize = 18 * scale;
    const baseRadius = 40 * scale;
    const baseLargeRadius = 45 * scale;
    const baseBoxWidth = 50 * scale;
    const baseBoxHeight = 35 * scale;
    const baseFontSize = Math.max(12, 20 * scale);
    const baseNodeFontSize = Math.max(16, 28 * scale);

    ctx.lineWidth = baseLineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    network.forEach(({ from, to, capacity }) => {
      const fromPos = nodePositions[from];
      const toPos = nodePositions[to];

      if (!fromPos || !toPos) return;

      const x1 = fromPos.x * scale + offsetX;
      const y1 = fromPos.y * scale + offsetY;
      const x2 = toPos.x * scale + offsetX;
      const y2 = toPos.y * scale + offsetY;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, theme.textSecondary);
      gradient.addColorStop(1, theme.primary);

      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const arrowX = x2 - 40 * scale * Math.cos(angle);
      const arrowY = y2 - 40 * scale * Math.sin(angle);

      ctx.fillStyle = theme.primary;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - baseArrowSize * Math.cos(angle - Math.PI / 6),
        arrowY - baseArrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - baseArrowSize * Math.cos(angle + Math.PI / 6),
        arrowY - baseArrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      ctx.fillStyle = theme.surface;
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 2 * scale;

      ctx.beginPath();
      const radius = 8 * scale;
      ctx.moveTo(midX - baseBoxWidth / 2 + radius, midY - baseBoxHeight / 2);
      ctx.lineTo(midX + baseBoxWidth / 2 - radius, midY - baseBoxHeight / 2);
      ctx.quadraticCurveTo(
        midX + baseBoxWidth / 2,
        midY - baseBoxHeight / 2,
        midX + baseBoxWidth / 2,
        midY - baseBoxHeight / 2 + radius
      );
      ctx.lineTo(midX + baseBoxWidth / 2, midY + baseBoxHeight / 2 - radius);
      ctx.quadraticCurveTo(
        midX + baseBoxWidth / 2,
        midY + baseBoxHeight / 2,
        midX + baseBoxWidth / 2 - radius,
        midY + baseBoxHeight / 2
      );
      ctx.lineTo(midX - baseBoxWidth / 2 + radius, midY + baseBoxHeight / 2);
      ctx.quadraticCurveTo(
        midX - baseBoxWidth / 2,
        midY + baseBoxHeight / 2,
        midX - baseBoxWidth / 2,
        midY + baseBoxHeight / 2 - radius
      );
      ctx.lineTo(midX - baseBoxWidth / 2, midY - baseBoxHeight / 2 + radius);
      ctx.quadraticCurveTo(
        midX - baseBoxWidth / 2,
        midY - baseBoxHeight / 2,
        midX - baseBoxWidth / 2 + radius,
        midY - baseBoxHeight / 2
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.primary;
      ctx.font = `bold ${baseFontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(capacity, midX, midY);
    });

    Object.entries(nodePositions).forEach(([node, pos]) => {
      const x = pos.x * scale + offsetX;
      const y = pos.y * scale + offsetY;
      const radius =
        node === "A" || node === "T" ? baseLargeRadius : baseRadius;

      const glowGradient = ctx.createRadialGradient(
        x,
        y,
        radius - 5 * scale,
        x,
        y,
        radius + 15 * scale
      );
      if (node === "A") {
        glowGradient.addColorStop(0, "rgba(76, 175, 80, 0)");
        glowGradient.addColorStop(1, "rgba(76, 175, 80, 0.4)");
      } else if (node === "T") {
        glowGradient.addColorStop(0, "rgba(244, 67, 54, 0)");
        glowGradient.addColorStop(1, "rgba(244, 67, 54, 0.4)");
      } else {
        glowGradient.addColorStop(0, `${theme.primary}00`);
        glowGradient.addColorStop(1, `${theme.primary}50`);
      }

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius + 15 * scale, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);

      if (node === "A") {
        ctx.fillStyle = "#4CAF50";
      } else if (node === "T") {
        ctx.fillStyle = "#F44336";
      } else {
        ctx.fillStyle = theme.primary;
      }
      ctx.fill();

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 5 * scale;
      ctx.stroke();

      ctx.strokeStyle =
        node === "A" ? "#2E7D32" : node === "T" ? "#C62828" : theme.primary;
      ctx.lineWidth = 3 * scale;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${baseNodeFontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 6 * scale;
      ctx.shadowOffsetX = 2 * scale;
      ctx.shadowOffsetY = 2 * scale;
      ctx.fillText(node, x, y);
      ctx.shadowColor = "transparent";
    });
  }, [network, theme, dimensions]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full"
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full border-2 shadow-2xl rounded-xl"
        style={{
          borderColor: theme.primary,
          backgroundColor: `${theme.surface}`,
        }}
      />
    </div>
  );
};

export default TrafficNetworkGraph;
