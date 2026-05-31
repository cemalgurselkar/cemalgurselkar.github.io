import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ThemeSwitcher from './ThemeSwitcher'

const Navbar = () => {
    const router = useRouter()

    const isActive = (path: string) => router.pathname === path

    return (
        <nav className="bg-primary-light border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
            <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
                <ThemeSwitcher />

                <Link href="/">
                    <a className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-blue-400 hover:opacity-80 transition-opacity">
                        Cemal Gürsel
                    </a>
                </Link>

                <div className="flex items-center space-x-6">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-subscription-modal'))}
                        className="text-sm font-semibold text-accent hover:opacity-80 transition-opacity flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Subscribe
                    </button>
                    <Link href="/">
                        <a className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>Home</a>
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
