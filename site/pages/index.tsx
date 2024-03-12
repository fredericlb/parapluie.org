import { ArticleMetadata } from "@/app/types";
import { getAllArticles } from "@/lib/fetch-articles";
import PostsList from "@/app/list";
import { paginate } from "@/lib/articles";
import { useTexts } from "@/texts";
import { serialize } from "next-mdx-remote/serialize";
import fs from "fs";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

export async function getStaticProps({
	locale,
}: { locale: "fr" | "en" }): Promise<{
	props: {
		metadata: ArticleMetadata[];
		locale: "fr" | "en";
		intro: MDXRemoteSerializeResult;
	};
}> {
	const allArticles = await getAllArticles();
	const intro = await serialize(
		fs.readFileSync(`./pages/_intro.${locale}.mdx`),
	);
	return {
		props: {
			metadata: allArticles,
			locale,
			intro,
		},
	};
}

export default function Page({
	metadata,
	locale,
	intro,
}: {
	metadata: ArticleMetadata[];
	locale: "en" | "fr";
	intro: MDXRemoteSerializeResult;
}) {
	const articles = paginate(metadata);
	const texts = useTexts(locale);

	return (
		<div>
			<PostsList
				intro={<MDXRemote {...intro} />}
				title={texts.home.title}
				locale={locale}
				allArticles={metadata}
				selectedArticles={articles}
			/>
		</div>
	);
}
