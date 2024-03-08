import { ReactNode } from "react";
import RootLayout from "@/app/layout";
import Head from "next/head";
import { MetadataContext } from "@/app/types";
import Menu from "@/app/menu";
import "./article.css";

const MdxPost: React.FC<{ metadata: MetadataContext; children: ReactNode }> = ({
	metadata,
	children,
}) => {
	const { locale, title, cover } = metadata;
	return (
		<RootLayout>
			<Head>
				<title>{title[locale]}</title>
			</Head>
			<Menu all={metadata.all} current={metadata} locale={metadata.locale} />
			<article className="w-full pt-24 lg:pt-0 lg:pl-80">
				<div className="w-full">
					<header>
						<h1 className="font-display bg-white text-black uppercase font-bold m-0 text-xl w-full pb-3 pt-5 pl-2 flex items-center sticky top-0">
							{title[locale] ?? "???"}
						</h1>
						<figure style={{ height: 400 }}>
							<img
								src={cover}
								alt="Illustration"
								className="object-cover h-full w-full"
							/>
						</figure>
					</header>
					<div className="article-body font-body lg:border-l-8 border-gray-800 pl-4 pt-2 pb-2 my-8 text-md lg:text-lg ml-2 mr-6 lg:mx-32">
						{children}
					</div>
				</div>
			</article>
		</RootLayout>
	);
};

export default MdxPost;
