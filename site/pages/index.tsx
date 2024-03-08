import {ArticleMetadata} from "@/app/types";
import {getAllArticles} from "@/lib/fetch-articles";
import PostsList from "@/app/list";
import {paginate} from "@/lib/articles";
import {useTexts} from "@/texts";

export async function getStaticProps({locale}: {locale: 'fr'|'en'}): Promise<{props: {metadata: ArticleMetadata[], locale: 'fr'|'en'}}> {
    const allArticles = await getAllArticles();

    return {
        props: {
            metadata: allArticles,
            locale
        },
    };
}

export default function Page({metadata, locale}: {metadata: ArticleMetadata[], locale: 'en'|'fr'}) {
    const articles = paginate(metadata);
    const texts = useTexts(locale);

    return (
        <PostsList title={texts.home.title}
                   locale={locale}
                   allArticles={metadata}
                   selectedArticles={articles}/>
    )
}