import React from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleLinear, scaleBand } from "@visx/scale";
import { AxisBottom } from "@visx/axis";

// Define the graph dimensions and margins

const COLORS = ["#ff3333", "#33ff33", "#3333ff"];

const BarCharts: React.FC<{ data: Record<string, number> }> = ({ data }) => {
	const nb = Object.values(data).length;
	const width = nb * 12;
	const height = 100;
	const margin = { top: 20, bottom: 40, left: 2, right: 2 };

	const entries = Object.entries(data).sort((a, b) => (a[1] > b[1] ? -1 : 1));

	// Then we'll create some bounds
	const xMax = width - margin.left - margin.right;
	const yMax = height - margin.top - margin.bottom;

	// We'll make some helpers to get at the data we want
	const x = (d: (typeof entries)[0]) => d[0];
	const y = (d: (typeof entries)[0]) => d[1];

	// And then scale the graph by our data
	const xScale = scaleBand({
		range: [0, xMax],
		round: true,
		domain: entries.map(x),
		padding: 0,
	});
	const yScale = scaleLinear({
		range: [yMax, 0],
		round: true,
		domain: [0, Math.max(...entries.map(y))],
	});

	// Compose together the scale and accessor functions to get point functions
	const compose =
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(scale: any, accessor: (d: (typeof entries)[0]) => any) =>
			(data: (typeof entries)[0]) =>
				scale(accessor(data));
	const xPoint = compose(xScale, x);
	const yPoint = compose(yScale, y);

	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg width={width} height={height}>
			{entries.map((d, i) => {
				const barHeight = yMax - yPoint(d);
				return (
					<Group
						key={`bar-${
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							i
						}`}
					>
						<Bar
							x={xPoint(d)}
							y={yMax - barHeight}
							height={barHeight}
							width={xScale.bandwidth()}
							fill={COLORS[i % COLORS.length]}
						/>
						<div>{d[0]}</div>
					</Group>
				);
			})}
			<AxisBottom
				top={yMax}
				scale={xScale}
				hideTicks={true}
				hideAxisLine={true}
				numTicks={nb}
				tickLabelProps={{
					fontSize: 11,
					textAnchor: "start",
					fill: "#CCC",
					angle: 90,
					dx: -4,
					dy: -12,
				}}
			/>
		</svg>
	);
};

export default BarCharts;
