import RootLayout from "@/app/layout";
import Head from "next/head";
import { ArticleMetadata } from "@/app/types";
import Menu from "@/app/menu";
import { useTexts } from "@/texts";
import Link from "next/link";

const PostsList: React.FC<{
	title: string;
	locale: "en" | "fr";
	allArticles: ArticleMetadata[];
	selectedArticles: ArticleMetadata[];
}> = ({ allArticles, locale, title, selectedArticles }) => {
	const texts = useTexts(locale);
	return (
		<RootLayout>
			<Head>
				<title>{title}</title>
			</Head>
			<Menu all={allArticles} locale={locale} />
			<div className="w-full pt-24 lg:pt-0 lg:pl-80">
				<div>
					<h1 className="sticky top-0 mb-8 font-display bg-white text-black uppercase font-bold m-0 text-xl w-full pb-3 pt-5 pl-2 flex items-center">
						{title}
					</h1>
					<div>
						{selectedArticles.map((mtd) => (
							<div className="w-full p-4" key={mtd.slugs[locale]}>
								<h2 className="font-display font-bold inline-block text-2xl border-b-8 border-white">
									{mtd.title[locale]}
								</h2>
								<div className="pt-4 mb-8 font-body text-md ">
									{mtd.summary[locale]}
								</div>
								<div className="flex justify-center lg:justify-end lg:pr-8 w-full relative">
									<div
										className="hidden lg:block absolute"
										style={{
											height: 1,
											background: "linear-gradient(to right, black, white)",
											inset: 0,
											top: "50%",
											right: 200,
										}}
									/>
									<Link href={`/articles/${mtd.slugs[locale]}`}>
										<button
											type="button"
											className="bg-white text-black font-display py-1"
											style={{ width: 200 }}
										>
											{texts.readmore}
										</button>
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</RootLayout>
	);
};

export default PostsList;
