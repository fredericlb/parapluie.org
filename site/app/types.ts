import {MDXRemoteSerializeResult} from "next-mdx-remote";

export interface ArticleMetadata {
    publishDate: string;
    title: {
        fr: string;
        en: string;
    }
    paths: {
        fr: string;
        en: string;
    }
    slugs: {
        fr: string;
        en: string;
    }
    summary: {
        fr: string;
        en: string;
    }
    tags: string[];
    cover: string;
}

export interface ArticleProps {
    allArticles: ArticleMetadata[],
    metadata:ArticleMetadata,
    content: MDXRemoteSerializeResult
}

export type MetadataContext = ArticleMetadata & {all: ArticleMetadata[], locale: 'en'|'fr'};
