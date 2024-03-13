import Color from 'colorjs.io';
import Graph from "graphology";

const c1 = new Color("p3", [0, 0, 1]);
const c2 = new Color("p3", [0, 1, 0]);

const g1 = c1.range("#00ff00", {
    space: "lch", // interpolation space
    outputSpace: "srgb"
});

const g2 = c2.range("#ff0000", {
    space: "lch", // interpolation space
    outputSpace: "srgb"
});


export interface SongData {
    "albumart": string,
    "artist": string,
    "bpm": number,
    "duration": number,
    "energylevel": number,
    "file": string,
    "genres": string[],
    "id": string,
    "key": string,
    "language": string,
    "title": string,
    "transitions": string[],
    "year": number,
    "universe": string,
    "tags": string[]
}

export interface SongNodeData extends SongData {
    allTags: string[];
    notFullHighlight?: boolean;
    size: number;
    label: string;
    color: string;
    nodeLabelColor: string;
    hidden?: boolean;
    type: string;
}

export function getGraph(dataset: SongData[], options: { showTransitions: boolean, tagsUniversesRatio: number }) {

    const graph = new Graph({});
    const maxDuration = Math.max.apply(null, dataset.map((x) => x.duration));

    const universes = dataset.reduce<Record<string, number>>((prev, n) => {
        if (!n.universe) {
            return prev;
        }
        if (prev[n.universe]) {
            return {
                ...prev, 
                [n.universe] : prev[n.universe] + 1
            }
        } else {
            return {
                ...prev, 
                [n.universe] : 1
            }
        }
    }, {});

    const r = options.tagsUniversesRatio / 100;

    if (r > 0) {
        Object.entries(universes).forEach(([name, count]) => {
            graph.addNode(name, { type: "group", label: `${name} (${count})`, color: "#AA5555", size: r >= 0.5 ? 6 : r * 6 });
        });
    }
    

    dataset.forEach((d) => {
        const color = (d.bpm > 120 ? g2(Math.min((d.bpm - 120) / 60, 1)) : g1(Math.max(0, d.bpm - 60) / 60)).toString({ format: "hex" });
        const size = 2 + (d.duration / maxDuration * 2);
        graph.addNode(d.file, {
            type: "song",
            ...d,
            transitions: d.transitions ?? [],
            size,
            _size: size,
            color,
            _color: color,
            allTags: [...(d.tags ?? []), ...(d.genres ?? []), d.language, d.key],
            label: `${d.title} [${d.bpm}]`,
            nodeLabelColor: "white"
        } as SongNodeData);

        if (r < 1) {
            d.genres.forEach((genre) => {
                if (!graph.hasNode(`g_${genre}`)) graph.addNode(`g_${genre}`, { type: "group", label: `g_${genre}`, color: "#880088", size: (1 - r) * 6 });
                graph.addEdge(d.file, `g_${genre}`, { weight: (1 - r) * 6, color: !options.showTransitions ? "#770077" :"#552255" });
            });
        }


        const y = +d.year, mdY = y % 10;
        const roundYear = mdY > 8 ? y - mdY + 10 : (y - mdY);

        if (r < 1) {
            if (!graph.hasNode(roundYear)) graph.addNode(roundYear, { type: "group", label: roundYear, color: "#008888", size: (1 - r) * 3 });
            graph.addEdge(d.file, roundYear, { weight: (1 - r) * 3, color: !options.showTransitions ? "#005555" : "#003333", });

            if (!graph.hasNode(d.energylevel)) graph.addNode(d.energylevel, { type: "group", label: `Énergie : ${d.energylevel}`, color: "#888800", size: (1 - r) * 5 });
            graph.addEdge(d.file, d.energylevel, { weight: (1 - r) * 5, color: !options.showTransitions ? "#555500" : "#333300" });
        }

        if (r > 0 && d.universe) {
            graph.addEdge(d.file, d.universe, { weight: 5, color: "#ff9999" });
        }


    })

    if (options.showTransitions) {
        dataset.forEach((d) => {
            (d.transitions ?? []).forEach((transition) => {
                const name = `${transition}.mp3`;
                if (!graph.hasNode(name)) {
                    return;
                }
                graph.addEdge(d.file, name, { weight: r * 2, color: "#777", type: "arrow", size: .5 });
            })
        });
    }

    return graph;
}

export function filterOrphans<T extends SongData>(data: T[]): T[] {
    const transitionsToFrom = data.reduce((prev, acc) => {
        (acc.transitions ?? []).forEach(tr => {
            const id = `${tr}.mp3`;
            if (!prev[id]) {
                prev[id] = [];
            }
            prev[id].push(acc.file);
        });
        return {
            ...prev,
            [acc.file]: (acc.transitions ?? []).map(x => `${x}.mp3`)
        }
    }, {} as Record<string, string[]>);

    return Object.entries(transitionsToFrom).filter(([, target]) => target.length === 0).map(x => data.find(d => d.file === x[0])!)
}

export function filterChildless<T extends SongData>(data: T[]): T[] {

    const transitionsFromTo = data.reduce((prev, acc) => {
        return {
            ...prev,
            [acc.file]: (acc.transitions ?? []).map(x => `${x}.mp3`)
        }
    }, {} as Record<string, string[]>);

    return Object.entries(transitionsFromTo).filter(([, target]) => target.length === 0).map(x => data.find(d => d.file === x[0])!);
}

export function filterSearch(search: string, graph: Graph): SongNodeData[] {
    const lcSearch = search.toLowerCase();
    const nodes = Array.from(graph.nodeEntries()).map(x => x.attributes).filter(x => x.type === "song" && !x.hidden) as SongNodeData[];

    if (search.length === 0) {
        return nodes;
    }
    if (search === "@orphans") {
        return filterOrphans(nodes);
    }
    if (search === "@childless") {
        return filterChildless(nodes);
    }
    if (search.startsWith("#")) {
        const tag = search.substring(1);
        return nodes.filter(({ allTags }) => allTags.includes(tag));
    }
    return nodes.filter((data) => {
        const { label, artist } = data;
        const fields = [`${label}`.toLowerCase(), `${artist}`.toLowerCase()];
        return (fields.some(x => x.includes(lcSearch)));
    })
}
