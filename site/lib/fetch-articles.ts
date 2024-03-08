import { ArticleMetadata } from "@/app/types";
import { glob } from "glob";
import yaml from "yaml";
import fs from "fs";
import path from "path";
import slug from "slug";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

export async function getAllArticles(): Promise<ArticleMetadata[]> {
	const allMetadata = await glob("./articles/**/metadata.yaml");
	return allMetadata
		.map((mtdPath) => {
			const mtd = yaml.parse(fs.readFileSync(mtdPath).toString());
			const folder = path.dirname(mtdPath);
			const parts = mtd.publishDate.split("-");
			const publishDate = new Date(parts[0], parts[1] - 1, parts[2]);
			return {
				data: {
					...mtd,
					paths: {
						fr: `${folder}/fr.mdx`,
						en: `${folder}/en.mdx`,
					},
					slugs: {
						fr: slug(mtd.title.fr),
						en: slug(mtd.title.en),
					},
				},
				publishDate,
			};
		})
		.sort((a, b) => {
			return a.publishDate < b.publishDate ? 1 : -1;
		})
		.map((x) => x.data);
}

export async function getArticlesContent(
	mtds: ArticleMetadata[],
): Promise<MDXRemoteSerializeResult[]> {
	const content: MDXRemoteSerializeResult[] = [];
	for (const mtd of mtds) {
		content.push(await serialize(fs.readFileSync(mtd.paths.fr)));
	}
	return content;
}
