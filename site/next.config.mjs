import withMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

    i18n: {
        locales: ['en', 'fr'],
        defaultLocale: 'fr',
    },
}

export default withMDX()(nextConfig)