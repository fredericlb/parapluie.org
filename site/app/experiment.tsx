"use client";

import { useTexts } from "@/texts";
import { useRouter } from "next/router";
import { FC, ReactNode, Suspense, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const Loading: FC = () => {
	return (
		<div className="w-full h-full flex justify-center items-center">
			<ClipLoader color="#5555CC" size={120} />
		</div>
	);
};

export default function Experiment({
	height,
	name,
	children,
}: { height: number | "full"; name: string; children: ReactNode }) {
	const router = useRouter();

	const [isMaximized, setMaximized] = useState(height === "full");
	const realHeight = isMaximized ? "calc(100vh - 40px - 20px)" : height;
	const texts = useTexts(router.locale as "fr" | "en");

	return (
		<div
			className={`font-display bg-black ${
				isMaximized ? "fixed inset-0" : "w-full mb-8"
			}`}
			style={{ border: "10px solid #5555CC", zIndex: isMaximized ? 1000 : 0 }}
		>
			<div
				className="w-full flex justify-between items-center"
				style={{ background: "#5555CC", height: 40 }}
			>
				<h3 className="font-bold text-xl">
					// {texts.article.experiment} : {name}
				</h3>
				{height !== "full" && (
					<button
						type="button"
						className="bg-white px-2 text-black mb-2 text-sm py-1 px-2"
						onClick={() => setMaximized((mx) => !mx)}
					>
						{isMaximized ? texts.article.reduce : texts.article.expand}
					</button>
				)}
			</div>

			<div className="w-full" style={{ height: realHeight }}>
				<Suspense fallback={<Loading />}>{children}</Suspense>
			</div>
		</div>
	);
}
