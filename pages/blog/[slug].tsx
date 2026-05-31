import type { NextPage, GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { getAllPostIds, getPostData } from '../../lib/posts'
import EngagementButtons from '../../components/EngagementButtons'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
// import rehypePrism from '@mapbox/rehype-prism'

// Import styles for Prism and Katex in _app or global css, but for now we rely on simple styles
// Note: You might need to install these plugins if you want them. 
// For this MVP, let's stick to basic serialization or ensure packages are installed.

interface PostProps {
    postData: {
        id: string
        title: string
        date: string
        tags: string[]
        // content: string // No longer needed for direct render
        [key: string]: any
    }
    mdxSource: any
}

const Post: NextPage<PostProps> = ({ postData, mdxSource }) => {
    return (
        <>
            <Head>
                <title>{postData.title} - Cemal</title>
            </Head>

            <article className="prose prose-lg max-w-none prose-a:text-accent prose-code:text-accent font-sans animate-slideUp">
                <div className="mb-8 border-b border-white/10 pb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{postData.title}</h1>
                    <div className="flex items-center text-slate-400 text-sm space-x-4">
                        <time>{postData.date}</time>
                        <div className="flex gap-2">
                            {postData.tags && postData.tags.map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-xs border border-white/5">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <MDXRemote {...mdxSource} />
                <EngagementButtons />
            </article>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = getAllPostIds()
    return {
        paths,
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const postData = await getPostData(params?.slug as string)

    const mdxSource = await serialize(postData.content, {
        mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
        },
    })

    return {
        props: {
            postData,
            mdxSource
        },
    }
}

export default Post
