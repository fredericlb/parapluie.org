import { ArticleMetadata } from "@/app/types";

export const getUniqueTags = (articlesMtd: ArticleMetadata[]): string[] => {
	const tags = new Set();

	for (const a of articlesMtd) {
		for (const t of a.tags) {
			tags.add(t);
		}
	}

	tags.delete("smallproject");
	return Array.from(tags) as string[];
};

export const getSmallProjects = (articlesMtd: ArticleMetadata[]) => {
	return articlesMtd.filter((mtd) => mtd.tags.includes("smallproject"));
};

export const paginate = (articlesMtd: ArticleMetadata[]) => {
	let page = 0;
	if (typeof window !== "undefined") {
		const query = new URLSearchParams(window.location.search);
		page = +(query.get("page") ?? 1) - 1;
	}
	return articlesMtd.slice(page * 10, (page + 1) * 10);
};
