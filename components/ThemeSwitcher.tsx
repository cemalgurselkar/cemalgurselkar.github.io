import React, { useEffect, useState } from 'react'

const themes = [
    { name: 'Navy', id: 'navy', color: 'bg-[#020617]' },
    { name: 'Black', id: 'black', color: 'bg-black' },
    { name: 'White', id: 'white', color: 'bg-white border-slate-200' },
]

const ThemeSwitcher = () => {
    const [currentTheme, setCurrentTheme] = useState('navy')

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'navy'
        setCurrentTheme(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)
    }, [])

    const changeTheme = (themeId: string) => {
        setCurrentTheme(themeId)
        document.documentElement.setAttribute('data-theme', themeId)
        localStorage.setItem('theme', themeId)
    }

    return (
        <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-full border border-white/10">
            {themes.map((theme) => (
                <button
                    key={theme.id}
                    onClick={() => changeTheme(theme.id)}
                    title={theme.name}
                    className={`w-5 h-5 rounded-full border ${theme.color} transition-transform hover:scale-125 ${currentTheme === theme.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-primary' : ''
                        }`}
                />
            ))}
        </div>
    )
}

export default ThemeSwitcher
