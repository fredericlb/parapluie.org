/* These functions replaces calls made to the API
   Since we are in "demo" mode the server is not available
*/

import { Session } from "./session";

const INITIAL_SESSION: Session = {
	session_content: [],
	bpm: 120 // mocked as without server we won't connect to ableton link
}

let state = {
	...INITIAL_SESSION
} as Session;

export async function apiGetPlaylist() {
	const resp = await fetch('/songsdata/data.json');
	return await resp.json();
}

export async function apiPingSesh() {
	return state;
}

export async function apiDeleteSesh() {
	state = {...INITIAL_SESSION};
	return state;
}

export async function apiPushSesh(songId: string) {
	state = {
		...state,
		session_content: [...state.session_content, songId]
	}
	state.session_content.push(songId);
	return state;
}