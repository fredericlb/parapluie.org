import { useEffect, useState } from "react";
import "./App.css";
import {
	SigmaContainer,
	ZoomControl,
	FullScreenControl,
} from "@react-sigma/core";
import Graph from "graphology";
import circular from "graphology-layout/circular";
import forceAtlas2 from "graphology-layout-forceatlas2";

import "@react-sigma/core/lib/react-sigma.min.css";
import GraphEventsController from "./lib/GraphEventsController";
import GraphSettingsController from "./lib/GraphSettingsController";
import NodeProgramGroup from "./nodes/Group";
import SearchField from "./lib/SearchField";
import { NodeDisplayData, PartialButFor } from "sigma/types";
import { Settings } from "sigma/settings";
import NodeFastProgram from "sigma/rendering/webgl/programs/node.fast";
import {
	BsCheckSquareFill,
	BsChevronBarRight,
	BsList,
	BsPlay,
	BsPlayBtnFill,
	BsPlusSquareDotted,
	BsPlusSquareFill,
	BsToggle2Off,
	BsToggle2On,
} from "react-icons/bs";
import MessagesConsole from "./lib/Console";
import { SongData, SongNodeData, getGraph } from "./data";

import { SessionProvider, useSessionContext } from "./store/session";
import { apiGetPlaylist } from "./store/server-mock";

function drawLabel(
	context: CanvasRenderingContext2D,
	data: PartialButFor<NodeDisplayData, "x" | "y" | "size" | "label" | "color">,
	settings: Settings,
): void {
	if (!data.label) return;
	const size = settings.labelSize,
		font = settings.labelFont,
		weight = settings.labelWeight;

	context.font = `${weight} ${size}px ${font}`;

	const lines = [data.label];

	if (data.type === "song" && !data.notFullHighlight) {
		lines.push(data.artist);
		const l = [data.key, ...(data.tags ?? []).map((x: string) => `#${x}`)].join(
			" ",
		);
		if (l.length > 0) {
			lines.push(l);
		}
	}

	const width =
		Math.max.apply(
			null,
			lines.map((x) => context.measureText(x).width),
		) + 8;
	context.fillStyle = data.color;

	if (!data.notFullHighlight || data.type !== "song") {
		context.fillRect(
			data.x + data.size,
			data.y + size / 3 - 15,
			width,
			lines.length * 18,
		);
		context.fillStyle = "#ffffff";
	}

	const spacing = size * 1.2;

	lines.forEach((l, i) => {
		context.fillText(
			l,
			data.x + data.size + 3,
			data.y + size / 3 + spacing * i,
		);
	});
}

function GraphContainer() {
	const [dataset, setDataset] = useState<SongData[] | null>(null);
	const [dataReady, setDataReady] = useState(false);
	const [graph, setGraph] = useState<Graph | null>(null);
	const [hoveredNode, setHoveredNode] = useState<string | null>(null);
	const [showDataPanel, setShowDataPanel] = useState(false);
	const [search, setSearch] = useState<string>("");
	const [showTransitions, setShowTransitions] = useState(true);
	const [tagsUniversesRatio, setTagsUniversesRatio] = useState(50);
	const {
		isConnected,
		startSesh,
		addSongToSesh,
		playedSongsIds,
		currentSongId,
	} = useSessionContext();

	useEffect(() => {
		if (graph) {
			graph.forEachNode((n) => {
				const attrs = graph.getNodeAttributes(n);
				if (attrs.type !== "song") {
					return;
				}
				if (currentSongId === n) {
					attrs.color = "#ff7500";
					attrs.size = attrs._size * 2;
				} else if (playedSongsIds.includes(n)) {
					attrs.color = "#555555";
					attrs.size = attrs._size;
				} else {
					attrs.color = attrs._color;
					attrs.size = attrs._size;
				}
			});
		}
	}, [graph, playedSongsIds, currentSongId]);

	// Load data on mount:
	useEffect(() => {
		apiGetPlaylist().then((dataset: SongData[]) => {
			setDataset(dataset);
			requestAnimationFrame(() => setDataReady(true));

			const graph = getGraph(dataset, { showTransitions, tagsUniversesRatio });
			circular.assign(graph);
			const settings = forceAtlas2.inferSettings(graph);
			forceAtlas2.assign(graph, { settings, iterations: 600 });

			setGraph(graph);
		});
	}, [showTransitions, tagsUniversesRatio]);

	if (!dataset || !graph) return null;

	const hoveredAttributes = hoveredNode
		? graph.getNodeAttributes(hoveredNode)
		: null;

	let hoveredSongStatus: "not_added" | "playing" | "played" = "not_added";

	if (hoveredAttributes && currentSongId === hoveredAttributes.file) {
		hoveredSongStatus = "playing";
	}

	if (hoveredAttributes && playedSongsIds.includes(hoveredAttributes.file)) {
		hoveredSongStatus = "played";
	}

	const currentSongAttributes = currentSongId
		? (graph.getNodeAttributes(currentSongId) as SongNodeData)
		: null;

	return (
		<div id="app-root" style={{ width: "100%", height: "100%" }}>
			<SigmaContainer
				settings={{
					minCameraRatio: 0.1,
					maxCameraRatio: 10,
					labelColor: { attribute: "color", color: "black" },
					nodeProgramClasses: {
						group: NodeProgramGroup,
						song: NodeFastProgram,
					},
					hoverRenderer: drawLabel,
				}}
				graph={graph}
				className="react-sigma"
			>
				<GraphEventsController setHoveredNode={setHoveredNode} />
				<GraphSettingsController hoveredNode={hoveredNode} />
				{dataReady && (
					<>
						{/*<div className="controls" style={{ position: "absolute", left: 0, top: 0 }}>
              <FullScreenControl
                className="ico"
              />
              <ZoomControl
                className="ico"
              />
        </div>*/}
						<div
							style={{
								position: "absolute",
								top: 8,
								left: 12,
								color: "#ddd",
								fontSize: 12,
							}}
						>
							{currentSongAttributes && !hoveredAttributes && (
								<h1>
									<BsPlayBtnFill
										color="lightgreen"
										style={{
											position: "relative",
											top: "4px",
											fontDecoration: "underline",
											marginRight: 8,
										}}
									/>

									{currentSongAttributes.title}
								</h1>
							)}
							{isConnected &&
								hoveredAttributes &&
								hoveredAttributes.type === "song" && (
									<h1
										onClick={
											hoveredSongStatus === "not_added"
												? () => addSongToSesh(hoveredAttributes.file)
												: undefined
										}
										style={{
											cursor:
												hoveredSongStatus === "not_added"
													? "pointer"
													: undefined,
										}}
									>
										{hoveredSongStatus === "played" && (
											<BsCheckSquareFill
												color="lightgreen"
												style={{
													position: "relative",
													top: "4px",
													fontDecoration: "underline",
													marginRight: 8,
												}}
											/>
										)}
										{hoveredSongStatus === "playing" && (
											<BsPlayBtnFill
												color="lightgreen"
												style={{
													position: "relative",
													top: "4px",
													fontDecoration: "underline",
													marginRight: 8,
												}}
											/>
										)}
										{hoveredSongStatus === "not_added" && (
											<BsPlusSquareFill
												color="lightblue"
												style={{
													position: "relative",
													top: "4px",
													fontDecoration: "underline",
													marginRight: 8,
												}}
											/>
										)}
										{hoveredAttributes.title}
									</h1>
								)}
							{isConnected && currentSongAttributes && (
								<div
									style={{
										background: "#555",
										padding: 2,
										marginLeft: 32,
										cursor: "pointer",
									}}
									onClick={() => setHoveredNode(currentSongAttributes.file)}
								>
									En cours de lecture : {currentSongAttributes.title}
								</div>
							)}
							<div
								style={{
									display: "flex",
									gap: 12,
									alignItems: "center",
									marginTop: 12,
								}}
								onClick={() => setShowTransitions(!showTransitions)}
							>
								<div
									style={{
										fontSize: 18,
										position: "relative",
										top: 3,
										color: showTransitions ? "lightgreen" : "#ccc",
										cursor: "pointer",
									}}
								>
									{showTransitions ? <BsToggle2On /> : <BsToggle2Off />}
								</div>
								<div>Afficher les transitions</div>
							</div>
							<div
								style={{
									display: "flex",
									gap: 12,
									alignItems: "center",
									cursor: "pointer",
								}}
							>
								<div>Tags</div>
								<input
									type="range"
									min={0}
									max={100}
									value={tagsUniversesRatio}
									onInput={(e) =>
										setTagsUniversesRatio(
											(e.target as HTMLInputElement).value as unknown as number,
										)
									}
								/>
								<div>Univers</div>
							</div>
						</div>
						{!showDataPanel && (
							<div
								style={{
									position: "absolute",
									right: 16,
									top: 16,
									fontSize: 30,
									color: "white",
									cursor: "pointer",
								}}
								onClick={() => setShowDataPanel(true)}
							>
								<BsList />
							</div>
						)}
						{showDataPanel && (
							<div
								className="panel"
								style={{
									position: "absolute",
									right: 0,
									top: 0,
									bottom: 0,
									width: "var(--panel-width)",
									background: "#444",
									opacity: 0.9,
								}}
							>
								<SearchField
									search={search}
									setSearch={setSearch}
									currentSongAttributes={currentSongAttributes}
									setHoveredNode={setHoveredNode}
								/>
								<div
									style={{
										position: "absolute",
										right: 8,
										top: 8,
										fontSize: 30,
										color: "white",
										cursor: "pointer",
									}}
									onClick={() => setShowDataPanel(false)}
								>
									<BsChevronBarRight />
								</div>
							</div>
						)}
						{!showDataPanel && (
							<MessagesConsole
								data={dataset}
								setSearch={(s: string) => {
									setSearch(s);
									setShowDataPanel(true);
								}}
							/>
						)}
					</>
				)}
			</SigmaContainer>
		</div>
	);
}

function App() {
	return (
		<SessionProvider>
			<GraphContainer />
		</SessionProvider>
	);
}

export default App;
