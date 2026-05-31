import React, { useEffect, useRef, useState } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    targetX: number | null
    targetY: number | null
    radius: number
    alpha: number
    clusterId: number | null
}

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const animationRef = useRef<number>()
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [theme, setTheme] = useState('navy')

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }
        handleResize()
        window.addEventListener('resize', handleResize)

        // Theme Detection
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'navy'
        setTheme(currentTheme)

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme') || 'navy'
                    setTheme(newTheme)
                }
            })
        })

        observer.observe(document.documentElement, { attributes: true })

        return () => {
            window.removeEventListener('resize', handleResize)
            observer.disconnect()
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || dimensions.width === 0) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Theme-based colors
        const getColors = () => {
            switch (theme) {
                case 'white':
                    return { dot: 'rgba(30, 64, 175, 0.8)', line: 'rgba(30, 64, 175, 0.2)' }
                case 'black':
                    return { dot: 'rgba(255, 255, 255, 0.8)', line: 'rgba(255, 255, 255, 0.2)' }
                default: // navy
                    return { dot: 'rgba(96, 165, 250, 0.8)', line: 'rgba(96, 165, 250, 0.2)' }
            }
        }

        const colors = getColors()

        // Initialize particles if not already done or on major resize
        if (particlesRef.current.length === 0) {
            const particleCount = Math.floor((dimensions.width * dimensions.height) / 10000)
            particlesRef.current = Array.from({ length: particleCount }, () => ({
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                targetX: null,
                targetY: null,
                radius: Math.random() * 2.5 + 1.2,
                alpha: Math.random() * 0.4 + 0.3,
                clusterId: null
            }))
        }

        const animate = () => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height)

            particlesRef.current.forEach((particle, i) => {
                // Move towards target or float freely
                if (particle.targetX !== null && particle.targetY !== null) {
                    const dx = particle.targetX - particle.x
                    const dy = particle.targetY - particle.y
                    particle.x += dx * 0.05
                    particle.y += dy * 0.05

                    // Reset target when close
                    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
                        // After reaching target, stay there for a bit
                        if (Math.random() < 0.005) {
                            particle.targetX = null
                            particle.targetY = null
                            particle.clusterId = null
                        }
                    }
                } else {
                    // Floating motion
                    particle.x += particle.vx
                    particle.y += particle.vy

                    // Bounce off edges
                    if (particle.x < 0 || particle.x > dimensions.width) particle.vx *= -1
                    if (particle.y < 0 || particle.y > dimensions.height) particle.vy *= -1
                }

                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
                ctx.fillStyle = colors.dot
                ctx.fill()

                // Draw connections
                particlesRef.current.slice(i + 1).forEach(other => {
                    const dist = Math.hypot(other.x - particle.x, other.y - particle.y)
                    const isCluster = (particle.clusterId !== null && particle.clusterId === other.clusterId)
                    const maxDist = isCluster ? 150 : 100

                    if (dist < maxDist) {
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(other.x, other.y)
                        const opacity = isCluster
                            ? 0.4 * (1 - dist / maxDist)
                            : 0.15 * (1 - dist / maxDist)

                        // Use the correct color based on theme
                        ctx.strokeStyle = colors.line.replace('0.2', opacity.toFixed(2))
                        ctx.lineWidth = isCluster ? 1.2 : 0.6
                        ctx.stroke()
                    }
                })
            })

            animationRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [dimensions, theme])

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top
        const clusterId = Math.floor(Math.random() * 1000000)

        // Affect particles nearby
        const nearbyParticles = particlesRef.current
            .filter(p => Math.hypot(p.x - clickX, p.y - clickY) < 250)
            .sort((a, b) => Math.hypot(a.x - clickX, a.y - clickY) - Math.hypot(b.x - clickX, b.y - clickY))

        if (nearbyParticles.length === 0) return

        // Root node
        nearbyParticles[0].targetX = clickX
        nearbyParticles[0].targetY = clickY
        nearbyParticles[0].clusterId = clusterId

        // Create a branching structure (Graph/Tree)
        for (let i = 1; i < nearbyParticles.length; i++) {
            // Pick a parent from already assigned particles in this cluster
            const parentIdx = Math.floor(Math.random() * i)
            const parent = nearbyParticles[parentIdx]

            if (parent.targetX !== null && parent.targetY !== null) {
                const angle = (Math.random() * Math.PI * 2)
                const distance = 30 + Math.random() * 50
                nearbyParticles[i].targetX = parent.targetX + Math.cos(angle) * distance
                nearbyParticles[i].targetY = parent.targetY + Math.sin(angle) * distance
                nearbyParticles[i].clusterId = clusterId
            }
        }
    }

    return (
        <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            onClick={handleClick}
            className="fixed inset-0 pointer-events-auto z-0"
            style={{ background: 'transparent' }}
        />
    )
}

export default ParticleBackground
