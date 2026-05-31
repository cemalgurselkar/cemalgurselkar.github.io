import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import ParticleBackground from './ParticleBackground'
import SubscriptionModal from './SubscriptionModal'
import ContactForm from './ContactForm'

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col font-sans relative">
            <ParticleBackground />
            <SubscriptionModal />
            <ContactForm />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl animate-fadeIn">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    )
}

export default Layout
