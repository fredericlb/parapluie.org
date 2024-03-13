import React, { useEffect, useState } from "react";
import { useSigma } from "@react-sigma/core";
import { BsCheck, BsSearch, BsX } from "react-icons/bs";
import BarCharts from "../charts/BarCharts";
import { SongData, SongNodeData, filterSearch } from "../data";
import { useSessionContext } from "../store/session";

const SearchField: React.FC<{ search: string, setSearch: (s: string) => void, currentSongAttributes: SongNodeData | null; setHoveredNode: (n:string) => void }> = ({ search, setSearch, currentSongAttributes, setHoveredNode }) => {
    const sigma = useSigma();

    const [values, setValues] = useState<Array<SongNodeData>>([]);
    const {playedSongsIds, resetSesh} = useSessionContext();

    const refreshValues = () => {
        const graph = sigma.getGraph();
        setValues(filterSearch(search, graph));
    };

    // Refresh values when search is updated:
    useEffect(() => refreshValues(), [search]);

    /*
    useEffect(() => {
        if (!selected) return;

        sigma.getGraph().setNodeAttribute(selected, "highlighted", true);
        const nodeDisplayData = sigma.getNodeDisplayData(selected);

        if (nodeDisplayData)
            sigma.getCamera().animate(
                { ...nodeDisplayData, ratio: .5 },
                {
                    duration: 600,
                },
            );

        return () => {
            sigma.getGraph().setNodeAttribute(selected, "highlighted", false);
        };
    }, [selected]);
    */

    
    const lngs = (values ?? []).reduce((prev, acc) => {
        const count = prev[acc.language] ?? 0;
        prev[acc.language] = count + 1;
        return prev;
    }, {} as Record<string, number>);

    const genres = (values ?? []).reduce((prev, acc) => {
        (acc.genres ?? []).forEach((genre: string) => {
            const count = prev[genre] ?? 0;
            prev[genre] = count + 1;
        })
        return prev;
    }, {} as Record<string, number>);

    const transitions:SongNodeData[] = [];
    const sameUniverse:SongNodeData[] = [];
    const playlist:SongNodeData[] = currentSongAttributes ? [] : values;

    if (currentSongAttributes) {
        values.forEach(song => {
            if (song.id === currentSongAttributes.id) {
                return;
            }
            if (currentSongAttributes.transitions.map(t => `${t}.mp3`).includes(song.file)) {
                transitions.push(song);
            } else if (currentSongAttributes.universe && song.universe === currentSongAttributes.universe) {
                sameUniverse.push(song);
            } else {
                playlist.push(song);
            }
        })  
    }
    
    const getSongLine = ({title, artist, allTags, id, file}: SongNodeData, i: number) => {
        return (
            <div key={id} onClick={() => {setHoveredNode(file); setSearch("")}} style={{ display: "flex", cursor: "pointer", width: "100%", justifyContent: "space-between", marginBottom: 4, background: i % 2 === 1 ? "#444" : "#666", padding: "0 3px 0 3px", boxSizing: "border-box", opacity : playedSongsIds.includes(id) ? 0.5 :1 }}>
                {
                    playedSongsIds.includes(id) && <div style={{alignSelf: "center"}}><BsCheck color="lightgreen"/></div>
                }
                <div>
                    <div>{title}</div>
                    <div>{artist}</div>
                </div>
                <div style={{ paddingRight: 8, display: "flex", flexWrap: "wrap", justifyContent: "end", }}>
                    {allTags.map((tag: string) => (
                        <div style={{ fontSize: 11, margin: 2, background: "#AAA", height: "14px", gap: 2, color: "black", padding: 1, borderRadius: 4, cursor: "pointer" }} onClick={() => {
                            setSearch(`#${tag}`);
                        }}>#{tag}</div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", width: "100%" }}>
            <div className="search-wrapper" style={{
                display: 'flex',
                gap: 16,
                background: "#888"
            }}>
                <div style={{ fontSize: 30, position: "relative", top: "8px", left: "5px" }}>
                    {search.length > 0 ? (
                        <BsX className="icon" color="white" onClick={() => setSearch("")}/>
                    ): <BsSearch className="icon" color="white" />}
                </div>
                <input
                    placeholder="Rechercher"
                    value={search}
                    onInput={x => setSearch((x.target as HTMLInputElement).value)}
                    style={{
                        background: "#00000000",
                        border: 0,
                        fontSize: 40,
                        width: "calc(100vw - 100px)",
                        color: "white",
                        outline: "none"
                    }}
                />
            </div>
            <div style={{ paddingLeft: 8, background: "#333", paddingBottom: 12 }}>
                <div style={{color: "#AAA", textAlign: "right", fontSize: 12, paddingTop: 4, paddingRight: 4}}>
                    {values.length} morceaux
                </div>
                <div style={{display: "flex", justifyContent: "space-between", paddingTop: 16 }}>
                    <BarCharts data={lngs} />
                    <BarCharts data={genres} />
                </div>
            </div>
            <div style={{ overflow: "auto", width: "100%", fontSize: 14, color: '#CCC', paddingBottom: 100 }}>
                {currentSongAttributes && (
                    <div>
                        <h2>--- transitions</h2>
                        {transitions.length === 0 ? 
                            <div className="no-match">pas de transitions</div> : 
                            transitions.sort((a, b) => a.title > b.title ? 1 : -1).map((song, i) => getSongLine(song, i))}
                    </div>
                )}

                {currentSongAttributes && (
                    <div>
                        <h2>--- même univers</h2>
                        {sameUniverse.length === 0 ? 
                            <div className="no-match">pas d'univers</div> : 
                            sameUniverse.sort((a, b) => a.title > b.title ? 1 : -1).map((song, i) => getSongLine(song, i))}
                    </div>
                )}
                
                <h2>--- playlist</h2>
                {playlist.sort((a, b) => a.title > b.title ? 1 : -1).map((song, i) => getSongLine(song, i))}
                {currentSongAttributes && <div onClick={() => {
                    if (confirm("Etes vous sûr ?")) {
                        resetSesh();
                    }
                }} className="new-sesh">nouvelle session</div>}
            </div>


        </div>
    );
};

export default SearchField;
