"use client";

export function RadarChart({
  labels,
  values,
  size = 200,
  color = "#111111",
}: {
  labels: string[];
  values: number[];
  size?: number;
  color?: string;
}) {
  const cx = 100;
  const cy = 104;
  const r = 70;
  const n = labels.length;

  const point = (i: number, ratio: number) => {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      x: cx + r * ratio * Math.cos(a),
      y: cy - r * ratio * Math.sin(a),
    };
  };

  const labelPos = (i: number) => {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / n;
    const x = cx + (r + 16) * Math.cos(a);
    const y = cy - (r + 16) * Math.sin(a);
    let anchor: "start" | "end" | "middle" = "middle";
    if (Math.cos(a) > 0.3) anchor = "start";
    else if (Math.cos(a) < -0.3) anchor = "end";
    return { x, y, anchor };
  };

  const rings = [1, 2, 3, 4].map((ring) => {
    const ratio = ring / 4;
    const pts = Array.from({ length: n }, (_, i) => {
      const p = point(i, ratio);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");
    return (
      <polygon
        key={ring}
        points={pts}
        fill="none"
        stroke="#E8E8E8"
        strokeWidth={0.75}
      />
    );
  });

  const spokes = labels.map((_, i) => {
    const p = point(i, 1);
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={p.x.toFixed(1)}
        y2={p.y.toFixed(1)}
        stroke="#E8E8E8"
        strokeWidth={0.75}
      />
    );
  });

  const valuePoly = Array.from({ length: n }, (_, i) => {
    const p = point(i, values[i]);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Performance radar"
    >
      {rings}
      {spokes}
      {labels.map((label, i) => {
        const lp = labelPos(i);
        return (
          <text
            key={label}
            x={lp.x.toFixed(1)}
            y={lp.y.toFixed(1)}
            textAnchor={lp.anchor}
            dominantBaseline="middle"
            fontSize={9}
            fill="#AAAAAA"
            fontFamily="-apple-system,sans-serif"
          >
            {label}
          </text>
        );
      })}
      <polygon
        points={valuePoly}
        fill="rgba(0,0,0,0.06)"
        stroke={color}
        strokeWidth={1.75}
      />
      {values.map((v, i) => {
        const p = point(i, v);
        return (
          <circle
            key={i}
            cx={p.x.toFixed(1)}
            cy={p.y.toFixed(1)}
            r={3}
            fill={color}
          />
        );
      })}
    </svg>
  );
}
