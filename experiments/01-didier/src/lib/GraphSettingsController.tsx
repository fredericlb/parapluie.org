import { useSigma } from "@react-sigma/core";
import { FC, useEffect, useState } from "react";

//import { drawHover } from "../canvas-utils";

const NODE_FADE_COLOR = "#bbb";
const EDGE_FADE_COLOR = "#eee";

function useDebounce<T>(value: T, delay: number): T {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(
        () => {
            // Update debounced value after delay
            const handler = setTimeout(() => {
                if (value !== debouncedValue) setDebouncedValue(value);
            }, delay);

            // Cancel the timeout if value changes (also on delay change or unmount)
            // This is how we prevent debounced value from updating if value is changed ...
            // .. within the delay period. Timeout gets cleared and restarted.
            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay], // Only re-call effect if value or delay changes
    );

    return debouncedValue;
}

const GraphSettingsController: FC<{ hoveredNode: string | null }> = ({hoveredNode }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();

    // Here we debounce the value to avoid having too much highlights refresh when
    // moving the mouse over the graph:
    const debouncedHoveredNode = useDebounce(hoveredNode, 40);

    /**
     * Initialize here settings that require to know the graph and/or the sigma
     * instance:
     */
    /*
    useEffect(() => {
        sigma.setSetting("hoverRenderer", (context, data, settings) =>
            drawHover(context, { ...sigma.getNodeDisplayData(data.key), ...data }, settings),
        );
    }, [sigma, graph]);
    */

    /**
     * Update node and edge reducers when a node is hovered, to highlight its
     * neighborhood:
     */
    useEffect(() => {
        const hoveredColor: string = debouncedHoveredNode ? sigma.getNodeDisplayData(debouncedHoveredNode)!.color : "";

        sigma.setSetting(
            "nodeReducer",
            debouncedHoveredNode
                ? (node, data) =>
                    node === debouncedHoveredNode ||
                        graph.hasEdge(node, debouncedHoveredNode) ||
                        graph.hasEdge(debouncedHoveredNode, node)
                        ? { ...data, zIndex: 1, highlighted: true }
                        : { ...data, zIndex: 0, label: "", color: NODE_FADE_COLOR, image: null, highlighted: false }
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

    return <div/>;
};

export default GraphSettingsController;
