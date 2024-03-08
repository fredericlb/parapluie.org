import "./globals.css";

import localFont from "next/font/local";

const archivoNarrow = localFont({
	variable: "--font-sans",
	src: [
		{
			path: "./fonts/ArchivoNarrow/ArchivoNarrow-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/ArchivoNarrow/ArchivoNarrow-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "./fonts/ArchivoNarrow/ArchivoNarrow-SemiBold.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "./fonts/ArchivoNarrow/ArchivoNarrow-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
});

const cooperHewitt = localFont({
	variable: "--font-display",
	src: [
		{
			path: "./fonts/CooperHewitt/CooperHewitt-Light.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/CooperHewitt/CooperHewitt-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "./fonts/CooperHewitt/CooperHewitt-Bold.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "./fonts/CooperHewitt/CooperHewitt-Heavy.woff2",
			weight: "700",
			style: "normal",
		},
	],
});

const libreBaskerville = localFont({
	variable: "--font-body",
	src: [
		{
			path: "./fonts/LibreBaskerville/LibreBaskerville-Bold.ttf",
			weight: "600",
			style: "normal",
		},
		{
			path: "./fonts/LibreBaskerville/LibreBaskerville-Regular.ttf",
			weight: "500",
			style: "normal",
		},
	],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div
			style={{ width: "100vw" }}
			className={`${archivoNarrow.variable} ${cooperHewitt.variable} ${libreBaskerville.variable}`}
		>
			{children}
		</div>
	);
}
