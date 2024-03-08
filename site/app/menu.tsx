import { FC, useState } from "react";
import { ArticleMetadata, MetadataContext } from "@/app/types";
import { useRouter } from "next/router";
import { getSmallProjects, getUniqueTags } from "@/lib/articles";
import Link from "next/link";
import { useTexts } from "@/texts";
import { VscClose, VscMenu } from "react-icons/vsc";
import { MdHome } from "react-icons/md";

enum LocaleButtonVariants {
	Active = "bg-white w-full h-8 text-black",
	Inactive = "w-full",
}

const HighlightLink = ({
	href,
	locale,
	children,
}: { href: string; locale: "fr" | "en"; children: string }) => {
	const router = useRouter();
	const LI_CLASSES = " list-square text-sm ml-2 pl-2 my-1";
	if (router.asPath === href) {
		return (
			<li className={LI_CLASSES}>
				<span className="bg-white text-black py-1 px-1 font-medium">
					{children}
				</span>
			</li>
		);
	}

	return (
		<Link href={href}>
			<li className={LI_CLASSES}>{children}</li>
		</Link>
	);
};

const Menu: FC<{
	all: ArticleMetadata[];
	locale: "fr" | "en";
	current?: MetadataContext;
}> = ({ all, locale, current }) => {
	const router = useRouter();
	const texts = useTexts(locale);
	const [menuIsVisible, setMenuIsVisible] = useState(false);

	const changeLanguage = (target: "en" | "fr") => () => {
		if (locale === target) {
			return;
		}

		let targetUrl = router.asPath;
		if (current) {
			targetUrl = `/articles/${current.slugs[target]}`;
		}
		router.push(targetUrl, targetUrl, { locale: target });
	};

	const tags = getUniqueTags(all);
	const projects = getSmallProjects(all);

	const toggleMenuVisibility = () => {
		setMenuIsVisible((mv) => !mv);
	};

	const categories = {
		[texts.menu.last_posts]: all.map((mtd) => (
			<HighlightLink
				key={mtd.slugs[locale]}
				href={`/articles/${mtd.slugs[locale]}`}
				locale={locale}
			>
				{mtd.title[locale]}
			</HighlightLink>
		)),
		[texts.menu.small_projects]: projects.map((mtd) => (
			<HighlightLink
				key={mtd.slugs[locale]}
				href={`/articles/${mtd.slugs[locale]}`}
				locale={locale}
			>
				{mtd.title[locale]}
			</HighlightLink>
		)),
		[texts.menu.topics]: tags.map((t) => (
			<HighlightLink key={t} href={`/tag/${t}`} locale={locale}>
				{`#${t}`}
			</HighlightLink>
		)),
	};
	const isHome = router.asPath === "/";
	return (
		<nav
			className={`font-display z-10 p-4 pt-3 lg:pt-4 pb-2 ${
				menuIsVisible ? "h-full" : "lg:h-full"
			} fixed lg:w-80 w-full overflow-hidden`}
		>
			<div className="flex flex-col justify-between lg:justify-start h-full">
				<div className="flex">
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
					<div
						className="text-black p-2 pl-10 ml-8 prpl-logo bg-white relative lg:pr-4 lg:w-full"
						style={{ width: "calc(100vw - 130px)" }}
						onClick={toggleMenuVisibility}
					>
						<h1 className="font-bold text-2xl uppercase">{texts.site.title}</h1>
						<h2 className="font-medium">{texts.site.subtitle}</h2>
					</div>
					<div
						className={`bg-white ml-2 p-1 cursor-pointer lg:hidden`}
						onClick={toggleMenuVisibility}
					>
						{!menuIsVisible ? (
							<VscMenu size={45} color="black" />
						) : (
							<VscClose size={45} color="black" />
						)}
						<div className="text-black text-center uppercase">
							{menuIsVisible ? texts.menu.close : texts.menu.menu}
						</div>
					</div>
				</div>
				<div
					className={`mt-8 ml-4 h-full  ${
						menuIsVisible ? "" : "hidden"
					} lg:flex`}
				>
					<div className="flex flex-col lg:h-3/4 h-full justify-evenly">
						<ul>
							<Link href={"/"}>
								<li
									className={`inline-flex pr-4 py-0.5 gap-2 ${
										isHome ? "bg-white text-black" : ""
									}`}
								>
									<MdHome size={20} className="relative" style={{ top: -1 }} />
									{texts.menu.home}
								</li>
							</Link>
						</ul>

						{...Object.entries(categories).map(([label, content]) => {
							return (
								<div key="label">
									<h3 className="font-medium mb-1 text-lg">{label}</h3>
									<ul className="ml-1">{content}</ul>
								</div>
							);
						})}
					</div>
				</div>
				<div className={`${menuIsVisible ? "" : "hidden"} lg:block`}>
					<div className="flex justify-around text-sm">
						<button
							type={"button"}
							className={
								locale === "fr"
									? LocaleButtonVariants.Active
									: LocaleButtonVariants.Inactive
							}
							onClick={changeLanguage("fr")}
						>
							{texts.locales.fr}
						</button>
						<button
							type="button"
							className={
								locale === "en"
									? LocaleButtonVariants.Active
									: LocaleButtonVariants.Inactive
							}
							onClick={changeLanguage("en")}
						>
							{texts.locales.en}
						</button>
					</div>
					<div className="text-xs mt-2 text-center">{texts.menu.footer}</div>
				</div>
			</div>
		</nav>
	);
};

export default Menu;
