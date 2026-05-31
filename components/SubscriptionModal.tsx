import React, { useEffect, useState } from 'react'

const SubscriptionModal = () => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleManualOpen = () => setIsOpen(true)
        window.addEventListener('open-subscription-modal', handleManualOpen)

        const hasSubscribed = localStorage.getItem('subscribed')
        if (hasSubscribed) return

        const timer = setTimeout(() => {
            setIsOpen(true)
        }, 120000)

        return () => {
            window.removeEventListener('open-subscription-modal', handleManualOpen)
            clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        // Optionally prevent popup from showing again in this session
        // sessionStorage.setItem('popupClosed', 'true')
    }

    const handleGoogleLogin = async () => {
        // Placeholder for NextAuth signIn('google')
        console.log('Google Login Clicked')

        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'subscription',
                    data: { event: 'New Google Subscriber', timestamp: new Date().toISOString() }
                })
            })
        } catch (error) {
            console.error('Subscription notification failed')
        }

        localStorage.setItem('subscribed', 'true')
        setIsOpen(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-primary-light border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl animate-slideUp">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Never Miss a Post!</h2>
                    <p className="text-text-secondary mb-8">
                        Join the community and get notified when I publish new articles about Computer Vision and Deep Learning.
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center space-x-3 bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors mb-4"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <p className="text-xs text-text-secondary">
                        Secure login via Google. No password required.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SubscriptionModal
