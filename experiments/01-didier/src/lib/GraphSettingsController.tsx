import { useSigma } from "@react-sigma/core";
import { FC, useEffect, useState } from "react";

//import { drawHover } from "../canvas-utils";

const NODE_FADE_COLOR = "#bbb";
const EDGE_FADE_COLOR = "#eee";

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			if (value !== debouncedValue) setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay, debouncedValue]);

	return debouncedValue;
}

const GraphSettingsController: FC<{ hoveredNode: string | null }> = ({
	hoveredNode,
}) => {
	const sigma = useSigma();
	const graph = sigma.getGraph();

	const debouncedHoveredNode = useDebounce(hoveredNode, 40);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const hoveredColor: string = debouncedHoveredNode
			? sigma.getNodeDisplayData(debouncedHoveredNode)?.color ?? ""
			: "";

		sigma.setSetting(
			"nodeReducer",
			debouncedHoveredNode
				? (node, data) =>
						node === debouncedHoveredNode ||
						graph.hasEdge(node, debouncedHoveredNode) ||
						graph.hasEdge(debouncedHoveredNode, node)
							? { ...data, zIndex: 1, highlighted: true }
							: {
									...data,
									zIndex: 0,
									label: "",
									color: NODE_FADE_COLOR,
									image: null,
									highlighted: false,
							  }
				: null,
		);
		sigma.setSetting(
			"edgeReducer",
			debouncedHoveredNode
				? (edge, data) =>
						graph.hasExtremity(edge, debouncedHoveredNode)
							? { ...data, color: hoveredColor, size: 4 }
							: { ...data, color: EDGE_FADE_COLOR, hidden: true }
				: null,
		);
	}, [debouncedHoveredNode]);

	return <div />;
};

export default GraphSettingsController;
