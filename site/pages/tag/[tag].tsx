import { ArticleMetadata } from "@/app/types";
import { getAllArticles } from "@/lib/fetch-articles";
import PostsList from "@/app/list";
import { getUniqueTags, paginate } from "@/lib/articles";
import { useRouter } from "next/router";
import { useTexts } from "@/texts";

export async function getStaticProps({
	params,
}: { params: { tag: string }; locale: "fr" | "en" }): Promise<{
	props: { metadata: ArticleMetadata[]; tag: string };
}> {
	const allArticles = await getAllArticles();

	return {
		props: {
			metadata: allArticles.filter((mtd) => mtd.tags.includes(params.tag)),
			tag: params.tag,
		},
	};
}

export async function getStaticPaths() {
	const allArticles = await getAllArticles();
	const tags = getUniqueTags(allArticles);
	const paths = tags.reduce<string[]>((acc, cur) => {
		acc.push(`/fr/tag/${cur}`);
		acc.push(`/en/tag/${cur}`);
		return acc;
	}, []);
	return {
		paths,
		fallback: false,
	};
}

export default function Page({
	metadata,
	tag,
}: { metadata: ArticleMetadata[]; tag: string }) {
	const router = useRouter();
	const articles = paginate(metadata);
	const locale = router.locale as "fr" | "en";
	const texts = useTexts(locale);

	return (
		<PostsList
			title={texts.tag.title + tag}
			locale={locale}
			allArticles={metadata}
			selectedArticles={articles}
		/>
	);
}
