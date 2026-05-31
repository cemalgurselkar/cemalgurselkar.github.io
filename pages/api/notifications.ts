import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { type, data } = req.body

    try {
        // Replace 'YOUR_FORMSPREE_ID' with the actual ID from Formspree
        const FORMSPREE_URL = 'https://formspree.io/f/xvzzovnv'

        const response = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                subject: type === 'contact' ? 'New Message' : type === 'subscription' ? 'New Subscriber!' : 'Engagement Update',
                ...data
            })
        })

        if (response.ok) {
            return res.status(200).json({ message: 'Notification sent' })
        } else {
            console.error('Formspree error:', await response.text())
            // Even if Formspree fails (e.g. no ID), we return 200 for now to keep the UI smooth 
            // but log the error. In production, you'd want better error handling.
            return res.status(200).json({ message: 'Logged (Placeholder mode)' })
        }
    } catch (error) {
        console.error('Notification error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
