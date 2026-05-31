import React from 'react'
import Link from 'next/link'

interface PostProps {
    id: string
    title: string
    excerpt: string
    date: string
    tags?: string[]
}

const PostCard: React.FC<PostProps> = ({ id, title, excerpt, date, tags }) => {
    return (
        <Link href={`/blog/${id}`}>
            <a className="block p-6 rounded-2xl bg-primary-light border border-white/5 hover:bg-accent/10 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{title}</h3>
                    <span className="text-xs text-text-secondary whitespace-nowrap ml-4">{date}</span>
                </div>
                <p className="text-text-secondary mb-4 line-clamp-2">{excerpt}</p>
                <div className="flex flex-wrap gap-2">
                    {tags && tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-primary text-xs rounded-md text-text-secondary border border-white/5">
                            {tag}
                        </span>
                    ))}
                </div>
            </a>
        </Link>
    )
}

export default PostCard
