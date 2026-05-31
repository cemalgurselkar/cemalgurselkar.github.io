import React, { useState } from 'react'

const ContactForm = () => {
    const [status, setStatus] = useState<'' | 'sending' | 'success' | 'error'>('')
    const [isOpen, setIsOpen] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus('sending')

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        }

        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'contact', data })
            })
            setStatus('success')
        } catch (error) {
            setStatus('error')
        }
    }

    const toggleForm = () => setIsOpen(!isOpen)

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Pop-up Form */}
            {isOpen && (
                <div className="mb-4 w-[320px] md:w-[400px] bg-primary-light/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl animate-slideUp overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-text-primary flex items-center">
                            <span className="w-2 h-6 bg-accent rounded-full mr-3"></span>
                            Get in Touch
                        </h3>
                        <button
                            onClick={toggleForm}
                            className="text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {status === 'success' ? (
                        <div className="py-8 text-center animate-fadeIn">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-accent mb-2">Message Sent!</h3>
                            <p className="text-sm text-text-secondary">I'll get back to you soon.</p>
                            <button
                                onClick={() => setStatus('')}
                                className="mt-4 text-xs text-accent hover:underline"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full bg-white/5 text-text-primary border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-text-secondary"
                                />
                            </div>
                            <div>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full bg-white/5 text-text-primary border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-text-secondary"
                                />
                            </div>
                            <div>
                                <textarea
                                    required
                                    name="message"
                                    rows={4}
                                    placeholder="Your Message"
                                    className="w-full bg-white/5 text-text-primary border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none placeholder:text-text-secondary"
                                ></textarea>
                            </div>
                            <button
                                disabled={status === 'sending'}
                                className="w-full py-3 bg-accent hover:opacity-90 text-primary-dark rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}

                    {!status && (
                        <div className="mt-6 pt-4 border-t border-white/5 text-xs text-text-secondary">
                            <p>📧 cemalgurselkar@gmail.com</p>
                        </div>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleForm}
                className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-lg transition-all duration-300 ${isOpen
                        ? 'bg-primary-light text-text-primary border border-white/10'
                        : 'bg-accent text-primary-dark hover:scale-110 active:scale-95'
                    }`}
            >
                {isOpen ? (
                    <span className="font-bold">Close</span>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="font-bold">Get in Touch</span>
                    </>
                )}
            </button>
        </div>
    )
}

export default ContactForm
