import type { NextPage, GetStaticProps } from 'next'
import Head from 'next/head'
import { getSortedPostsData } from '../lib/posts'
import PostCard from '../components/PostCard'
import AboutCard from '../components/AboutCard'

interface HomeProps {
    allPostsData: {
        id: string
        date: string
        title: string
        excerpt: string
        tags: string[]
    }[]
}

const Home: NextPage<HomeProps> = ({ allPostsData }) => {
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <Head>
                <title>Cemal Gürsel - Blog</title>
                <meta name="description" content="Personal blog of Cemal Gürsel - Computer Vision & ML Engineer" />
            </Head>

            {/* Main Content: Blog Posts */}
            <div className="lg:w-2/3">
                <section className="animate-slideUp mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        Blog Posts
                    </h1>

                    <div className="grid gap-6 animate-stagger">
                        {allPostsData.map((post) => (
                            <PostCard key={post.id} {...post} />
                        ))}
                    </div>
                </section>
            </div>

            {/* Sidebar: About Card & Contact */}
            <aside className="lg:w-1/3 animate-fadeIn space-y-8 sticky top-24 h-fit">
                <AboutCard />
            </aside>
        </div>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const allPostsData = getSortedPostsData()
    return {
        props: {
            allPostsData,
        },
    }
}

export default Home
