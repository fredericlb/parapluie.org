import MdxPost from "@/app/mdx-post";
import { MDXRemote } from "next-mdx-remote";
import { ArticleProps } from "@/app/types";
import { getAllArticles, getArticlesContent } from "@/lib/fetch-articles";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import Experiment from "@/app/experiment";

const Exp01 = dynamic(() => import('exp-01-didier'), {
	ssr: false,
})

export async function getStaticProps({
	params,
	locale,
}: { params: { slug: string }; locale: "fr" | "en" }): Promise<{
	props: ArticleProps;
}> {
	const allArticles = await getAllArticles();
	const [metadata] = allArticles.filter(
		(mtd) => mtd.slugs[locale] === params.slug,
	);
	if (!metadata) {
		throw new Error("404");
	}

	const [content] = await getArticlesContent([metadata], locale);

	return {
		props: {
			allArticles,
			metadata,
			content,
		},
	};
}

export async function getStaticPaths() {
	const allArticles = await getAllArticles();
	const paths = allArticles.reduce<string[]>((acc, cur) => {
		acc.push(`/fr/articles/${cur.slugs.fr}`);
		acc.push(`/en/articles/${cur.slugs.en}`);
		return acc;
	}, []);
	return {
		paths,
		fallback: false,
	};
}

export default function Page({ allArticles, metadata, content }: ArticleProps) {
	const router = useRouter();
	
	if (!metadata) {
		throw new Error("404");
	}
	
	return (
		<MdxPost
			metadata={{
				...metadata,
				all: allArticles,
				locale: router.locale as "fr" | "en",
			}}
		>
			<MDXRemote {...content} components={{
				Experiment,
				Exp01
			}} />
		</MdxPost>
	);
}
