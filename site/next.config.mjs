import withMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
	transpilePackages: ["exp-01-didier", "@react-sigma/core"],
	i18n: {
		locales: ["en", "fr"],
		defaultLocale: "fr",
	},
};

export default withMDX()(nextConfig);
