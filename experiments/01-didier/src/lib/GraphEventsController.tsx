import { useCamera, useRegisterEvents, useSigma } from "@react-sigma/core";
import { circular } from "graphology-layout";
import { subgraph } from "graphology-operators";
import { FC, useEffect } from "react";

function getMouseLayer() {
	return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<{
	setHoveredNode: (node: string | null) => void;
}> = ({ setHoveredNode }) => {
	const sigma = useSigma();
	const { reset } = useCamera();
	const graph = sigma.getGraph();
	const registerEvents = useRegisterEvents();

	useEffect(() => {
		const container = sigma.getContainer();
		const obs = new ResizeObserver(() => {
			sigma.refresh();
		})
		obs.observe(container);
		
		return () => {
			obs.disconnect();
		}
	}, [sigma]);

	const animateNode = (
		n: string,
		targetX: number,
		targetY: number,
		targetSize: number,
		back = false,
	) => {
		const { x: origX, y: origY, size: origSize } = graph.getNodeAttributes(n);

		let i = 1;
		const to = back ? 40 : 20;
		const incrementX = (targetX - origX) / to;
		const incrementY = (targetY - origY) / to;
		const incrementSize = (targetSize - origSize) / to;
		const go = () => {
			if (i <= to) {
				requestAnimationFrame(() => {
					i += 1;
					const { x, y, size } = graph.getNodeAttributes(n);
					graph.setNodeAttribute(n, "x", x + incrementX);
					graph.setNodeAttribute(n, "y", y + incrementY);
					graph.setNodeAttribute(n, "size", size + incrementSize);
					go();
				});
			}
		};
		go();
	};

	let PREVIOUS_POSITIONS: { n: string; x: number; y: number; size: number }[] =
		[];

	const backToPreviousPositions = () => {
		PREVIOUS_POSITIONS.forEach(({ n, x, y, size }) => {
			graph.setNodeAttribute(n, "notFullHighlight", false);
			animateNode(n, x, y, size, true);
		});
		PREVIOUS_POSITIONS = [];
	};
	
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		registerEvents({
			mousemove() {},

			doubleClickNode({ node: debouncedHoveredNode }) {
				if (PREVIOUS_POSITIONS.length > 0) {
					return;
				}
				const nodesToKeep = graph.filterNodes(
					(node) =>
						graph.hasEdge(node, debouncedHoveredNode) ||
						graph.hasEdge(debouncedHoveredNode, node),
				);
				const sub = subgraph(graph, nodesToKeep);

				circular.assign(sub, {
					scale: sigma.getCamera().ratio * 200,
				});

				const { x: centerX, y: centerY } =
					graph.getNodeAttributes(debouncedHoveredNode);

				sub.nodes().forEach((n, i) => {
					const { x, y } = sub.getNodeAttributes(n);
					const {
						x: origX,
						y: origY,
						size: origSize,
					} = graph.getNodeAttributes(n);
					PREVIOUS_POSITIONS.push({ n, x: origX, y: origY, size: origSize });

					graph.setNodeAttribute(n, "notFullHighlight", true);

					let divider = 1;

					if (nodesToKeep.length < 5) {
						divider = 2;
					} else if (nodesToKeep.length >= 15 && nodesToKeep.length < 20) {
						if (i % 3 === 0) {
							divider = 2;
						}
					} else if (nodesToKeep.length >= 20 && nodesToKeep.length < 25) {
						if (i % 3 === 0) {
							divider = 2;
						} else if (i % 3 === 1) {
							divider = 1.5;
						}
					} else if (nodesToKeep.length >= 25) {
						if (i % 4 === 0) {
							divider = 2;
						} else if (i % 4 === 2) {
							divider = 1.35;
						}
					}

					animateNode(
						n,
						x / divider + centerX,
						y / divider + centerY,
						origSize * 3,
					);
				});
			},

			clickStage() {
				setHoveredNode(null);
				const mouseLayer = getMouseLayer();
				if (mouseLayer && !mouseLayer.classList.contains("mouse-pointer")) {
					backToPreviousPositions();
				}
			},

			clickNode({ node: debouncedHoveredNode }) {
				setHoveredNode(debouncedHoveredNode);
			},
			enterNode() {},
			leaveNode() {},
		});
	}, [reset]);

	return <div />;
};

export default GraphEventsController;
