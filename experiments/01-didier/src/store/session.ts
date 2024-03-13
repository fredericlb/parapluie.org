import constate from "constate";
import { useCallback, useEffect, useState } from "react";
import { apiDeleteSesh, apiPingSesh, apiPushSesh } from "./server-mock";

export interface Session {
	session_content: string[];
	bpm: number;
}

function useSesh() {
	const [sessionStarted, setSessionStarted] = useState(true);
	const [session, setSession] = useState<Session | null>();

	const startSesh = useCallback(() => {
		setSessionStarted(true);
	}, []);

	useEffect(() => {
		if (sessionStarted) {
			let timer: NodeJS.Timeout | null = null;
			const f = async () => {
				const data = await apiPingSesh();
				setSession(data);
				timer = setTimeout(f, 2000);
			};
			f();
			return () => {
				if (timer !== null) {
					clearTimeout(timer);
				}
			};
		}
		return () => {};
	}, [sessionStarted]);

	const resetSesh = useCallback(async () => {
		return apiDeleteSesh().then((sesh) => {
			setSession(sesh as Session);
		});
	}, []);

	const addSongToSesh = useCallback((songId: string) => {
		return apiPushSesh(songId).then((sesh) => {
			setSession(sesh as Session);
		});
	}, []);

	return {
		addSongToSesh,
		resetSesh,
		startSesh,
		bpm: session ? session.bpm : NaN,
		currentSongId:
			session && session.session_content.length > 0
				? session.session_content[0]
				: null,
		playedSongsIds: session?.session_content ?? [],
		isConnected: session ? true : false,
	};
}

export const [SessionProvider, useSessionContext] = constate(useSesh);
