import React from 'react'
import { FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa'

const Footer = () => {
    return (
        <footer className="border-t border-white/5 mt-auto bg-primary-dark py-8">
            <div className="container mx-auto px-4 max-w-4xl text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Cemal. Built with Next.js & Tailwind.</p>
                <div className="flex justify-center space-x-6 mt-4">
                    <a
                        href="https://x.com/cemalgursell"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl text-slate-400 hover:text-[#1DA1F2] transition-colors hover:scale-110 transform"
                        aria-label="Twitter"
                    >
                        <FaTwitter />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/cemal-g%C3%BCrsel-kar-85498425a/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl text-slate-400 hover:text-[#0A66C2] transition-colors hover:scale-110 transform"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedinIn />
                    </a>
                    <a
                        href="https://www.instagram.com/cemalgurselphoto/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl text-slate-400 hover:text-[#E4405F] transition-colors hover:scale-110 transform"
                        aria-label="Instagram"
                    >
                        <FaInstagram />
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
