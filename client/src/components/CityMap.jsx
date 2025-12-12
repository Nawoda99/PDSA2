import React, { useMemo } from "react";

function polarPositions(n, radius = 120, cx = 150, cy = 150) {
  const res = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    res.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return res;
}

export default function CityMap({
  cityNames,
  matrix,
  home,
  selected,
  results,
}) {
  const n = cityNames.length;
  const size = 320;

  const pos = useMemo(() => polarPositions(n, 120, size / 2, size / 2), [n]);

  const routeToDraw = useMemo(() => {
    if (!results) return null;
    if (results.bruteforce && !results.bruteforce.error)
      return results.bruteforce.route;
    if (results.simulatedAnnealing && results.simulatedAnnealing.route)
      return results.simulatedAnnealing.route;
    if (results.nearestNeighbor && results.nearestNeighbor.route)
      return results.nearestNeighbor.route;
    return null;
  }, [results]);

  const nodesSet = new Set([home, ...(selected || [])]);
  const selectedNodes = Array.from(nodesSet);

  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  return (
    <div className="w-full flex justify-center">
      <svg width={size} height={size} className="rounded bg-white border">
        {selectedNodes.map((i) =>
          selectedNodes.map((j) => {
            if (i >= j) return null;
            const a = pos[i],
              b = pos[j];
            return (
              <line
                key={`ctx-${i}-${j}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#e6e6e6"
                strokeWidth={1}
              />
            );
          })
        )}

        {routeToDraw && routeToDraw.length > 1 && (
          <>
            {routeToDraw.slice(0, -1).map((from, idx) => {
              const to = routeToDraw[idx + 1];
              const a = pos[from],
                b = pos[to];
              const dist = matrix[from][to];
              return (
                <g key={`route-${idx}`}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#0ea5a4"
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="transparent"
                    strokeWidth={12}
                    style={{ cursor: "pointer" }}
                  >
                    <title>{`Distance ${cityNames[from]} → ${cityNames[to]}: ${dist} km`}</title>
                  </line>
                  <text
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2 - 6}
                    fontSize="10"
                    textAnchor="middle"
                    fill="#0f172a"
                    style={{ pointerEvents: "none" }}
                  >
                    {dist} km
                  </text>
                </g>
              );
            })}
          </>
        )}

        {pos.map((p, i) => {
          const isHome = i === home;
          const isSelected = selected.includes(i);
          return (
            <g key={`city-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHome ? 14 : isSelected ? 10 : 8}
                fill={isHome ? "#f59e0b" : isSelected ? "#0369a1" : "#ffffff"}
                stroke={isHome ? "#b45309" : "#cbd5e1"}
                strokeWidth={isHome ? 3 : 1}
              />
              <text
                x={p.x}
                y={p.y + (isHome ? 5 : 4)}
                fontSize={isHome ? 12 : 10}
                textAnchor="middle"
                fill={isHome ? "#fff" : isSelected ? "#fff" : "#0f172a"}
                fontWeight={700}
              >
                {cityNames[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
