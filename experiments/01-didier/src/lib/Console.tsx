import React, { useEffect, useState } from 'react';
import { SongData, filterChildless, filterOrphans } from '../data';

const MessagesConsole: React.FC<{data: SongData[], setSearch: (s:string) => void}> = ({data, setSearch}) => {
    const [messages, setMessages] = useState<(string|{label: string, onClick: () => void})[][]>([]);

    useEffect(() => {
        const msgs = [];

        const orphans = filterOrphans(data);
        const childless = filterChildless(data);
        const songs = new Set(data.map(x => x.file));

        const invalidTransitions: {source: string, target: string}[] = [];
        data.forEach(song => {
            (song.transitions ?? []).forEach(tr => {
                if (!songs.has(`${tr}.mp3`)) {
                    invalidTransitions.push({source: song.file, target: tr});
                }
            })
        })
        
        invalidTransitions.forEach(it => {
            msgs.push(['Le morceau cible de la transition n\'existe pas :', it.source, '->', it.target]);
        })

        if (orphans.length > 0) {
            msgs.push([`${orphans.length} morceaux sont orphelins -> `, {label: "Cliquez ici pour les lister", onClick: () => setSearch("@orphans")}]);
        }

        if (childless.length > 0) {
            msgs.push([`${childless.length} morceaux n'ont pas de descendance -> `, {label: "Cliquez ici pour les lister", onClick: () => setSearch("@childless")}]);
        }

        setMessages(msgs);
    }, [data]);

    return (
        <div style={{position: "absolute", opacity: 0.7, fontFamily: "monospace", bottom: 8, left: 8, overflow: "auto", display: "flex", flexDirection: "column-reverse", gap: 2, fontSize: "min(2.5vw, 12px)"}}>
            {[...messages].reverse().map((xs, i) => {
                return <div key={i} style={{color: "orange"}}>{xs.map(m => {
                    if (typeof m === "string") {
                        return <span key={m} style={{marginRight: 4}}>{m}</span>;
                    } else {
                        return <span key={m.label} style={{textDecoration: "underline", cursor: "pointer",marginRight: 8}} onClick={m.onClick}   >{m.label}</span>;
                    }
                })}</div>
            })}
        </div>
    )
}

export default MessagesConsole;
