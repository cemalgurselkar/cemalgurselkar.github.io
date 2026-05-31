import React, { useState } from 'react'

const EngagementButtons = () => {
    const [likes, setLikes] = useState(0)
    const [dislikes, setDislikes] = useState(0)
    const [userAction, setUserAction] = useState<'like' | 'dislike' | null>(null)

    const handleLike = () => {
        if (userAction === 'like') {
            setLikes(l => l - 1)
            setUserAction(null)
        } else {
            if (userAction === 'dislike') setDislikes(d => d - 1)
            setLikes(l => l + 1)
            setUserAction('like')
        }
    }

    const handleDislike = () => {
        if (userAction === 'dislike') {
            setDislikes(d => d - 1)
            setUserAction(null)
        } else {
            if (userAction === 'like') setLikes(l => l - 1)
            setDislikes(d => d + 1)
            setUserAction('dislike')
        }
    }

    const sendNotification = async (type: 'like' | 'dislike') => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'engagement',
                    data: { action: type, post: window.location.pathname }
                })
            })
        } catch (error) {
            console.error('Engagement notification failed')
        }
    }

    return (
        <div className="flex items-center space-x-6 py-8 border-t border-white/10 mt-12">
            <span className="text-sm font-medium text-text-secondary">Was this helpful?</span>
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${userAction === 'like'
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'
                        }`}
                >
                    <svg className="w-5 h-5" fill={userAction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                    </svg>
                    <span className="text-sm font-bold">{likes}</span>
                </button>

                <button
                    onClick={handleDislike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${userAction === 'dislike'
                        ? 'bg-red-500/20 border-red-500/50 text-red-500'
                        : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'
                        }`}
                >
                    <svg className="w-5 h-5" fill={userAction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zM17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
                    </svg>
                    <span className="text-sm font-bold">{dislikes}</span>
                </button>
            </div>
        </div>
    )
}

export default EngagementButtons
