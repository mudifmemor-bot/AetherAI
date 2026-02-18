import { useEffect, useState } from 'react'

// CSS-only Earth fallback for environments where WebGL doesn't work
function EarthFallback() {
  const [particles, setParticles] = useState<Array<{x: number, y: number, z: number, size: number, opacity: number}>>([])

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 500 }, () => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 120 + Math.random() * 20
      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7
      }
    })
    setParticles(newParticles)
  }, [])

  return (
    <div className="earth-container">
      <div className="earth-sphere">
        {particles.map((p, i) => (
          <div
            key={i}
            className="earth-particle"
            style={{
              transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity
            }}
          />
        ))}
        <div className="earth-glow" />
        <div className="earth-atmosphere" />
      </div>
      <div className="data-arcs">
        <svg viewBox="0 0 400 400" className="arcs-svg">
          <path d="M100,200 Q200,50 300,200" className="data-arc" />
          <path d="M80,150 Q200,20 320,180" className="data-arc" />
          <path d="M120,250 Q200,100 280,120" className="data-arc" />
          <path d="M60,200 Q200,80 340,220" className="data-arc" />
          <path d="M150,100 Q200,30 250,100" className="data-arc" />
        </svg>
      </div>
      <div className="city-nodes">
        {[
          { x: 35, y: 45 }, { x: 48, y: 38 }, { x: 78, y: 42 }, { x: 85, y: 70 },
          { x: 65, y: 55 }, { x: 72, y: 58 }, { x: 22, y: 52 }, { x: 60, y: 65 }
        ].map((pos, i) => (
          <div
            key={i}
            className="city-node"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [useFallback, setUseFallback] = useState(false)
  const [earthError, setEarthError] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })
    }

    // Check if WebGL is available
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setUseFallback(true)
      }
    } catch {
      setUseFallback(true)
    }

    // Set timeout to show fallback if Three.js takes too long
    const timer = setTimeout(() => {
      setEarthError(true)
      setUseFallback(true)
    }, 5000)

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timer)
    }
  }, [])

  // Dynamic import of Earth component
  const [EarthComponent, setEarthComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    import('./components/Earth.tsx')
      .then(module => {
        setEarthComponent(() => module.default)
      })
      .catch(() => {
        setUseFallback(true)
      })
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0A0A0A]">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* 3D Earth or Fallback */}
      {useFallback || earthError ? (
        <EarthFallback />
      ) : EarthComponent ? (
        <EarthComponent />
      ) : (
        <div className="canvas-container flex items-center justify-center">
          <div className="text-white/30 font-mono text-sm">Loading Earth...</div>
        </div>
      )}

      {/* Custom cursor */}
      <div
        className="fixed w-6 h-6 border border-white/30 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12
        }}
      />
      <div
        className="fixed w-1 h-1 bg-white rounded-full pointer-events-none z-50"
        style={{
          left: mousePosition.x - 2,
          top: mousePosition.y - 2
        }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/5" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight">AETHER</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Mission', 'Solutions', 'Impact', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-mono text-sm text-white/60 hover:text-white transition-colors duration-300"
              >
                {item.toUpperCase()}
              </a>
            ))}
          </div>

          <button className="hidden md:block px-6 py-2 border border-white/20 rounded-full font-mono text-sm hover:bg-white hover:text-black transition-all duration-300">
            GET ACCESS
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-mono text-xs text-white/70 tracking-wider">
              PLANETARY INTELLIGENCE SYSTEM
            </span>
          </div>

          <h1 className="font-outfit text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-none">
            <span className="text-gradient">AI FOR</span>
            <br />
            <span className="text-white">EARTH</span>
          </h1>

          <p className="text-white/50 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Harnessing artificial intelligence to understand, protect, and optimize
            our planet's complex systems.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-white text-black rounded-full font-outfit font-semibold hover:scale-105 transition-transform duration-300">
              Explore Platform
            </button>
            <button className="px-8 py-4 border border-white/20 rounded-full font-outfit font-medium text-white/80 hover:bg-white/10 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="font-mono text-xs text-white/30 tracking-widest">SCROLL</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-mono text-sm text-white/40 tracking-widest">01 / MISSION</span>
              <h2 className="font-outfit text-4xl md:text-6xl font-bold mt-4 mb-8 leading-tight">
                Decoding Earth's
                <br />
                <span className="text-white/60">Complex Systems</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-8">
                We build advanced AI models that process planetary-scale data to solve
                humanity's greatest challenges. From climate modeling to resource
                optimization, our systems understand Earth like never before.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="glass rounded-2xl p-6">
                  <div className="font-outfit text-4xl font-bold text-white mb-2">50B+</div>
                  <div className="font-mono text-xs text-white/40">Data Points Daily</div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="font-outfit text-4xl font-bold text-white mb-2">99.7%</div>
                  <div className="font-mono text-xs text-white/40">Prediction Accuracy</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full border border-white/10 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
                    <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/5" />
                    </div>
                  </div>
                  <div className="font-outfit text-2xl font-bold">Global Coverage</div>
                  <div className="font-mono text-sm text-white/40 mt-2">24/7 Real-time Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="font-mono text-sm text-white/40 tracking-widest">02 / SOLUTIONS</span>
            <h2 className="font-outfit text-4xl md:text-6xl font-bold mt-4">
              AI-Powered Insights
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Climate Modeling', description: 'Advanced simulations predicting climate patterns with unprecedented accuracy.', icon: '◐' },
              { title: 'Resource Optimization', description: 'AI-driven allocation of energy, water, and critical resources worldwide.', icon: '◎' },
              { title: 'Ecosystem Monitoring', description: 'Real-time tracking of biodiversity, deforestation, and ocean health.', icon: '◉' },
              { title: 'Disaster Prediction', description: 'Early warning systems for hurricanes, earthquakes, and floods.', icon: '◈' },
              { title: 'Urban Intelligence', description: 'Smart city solutions for traffic, pollution, and energy efficiency.', icon: '◇' },
              { title: 'Agricultural Analytics', description: 'Precision farming powered by satellite imagery and machine learning.', icon: '◆' }
            ].map((solution, index) => (
              <div
                key={index}
                className="glass glass-hover rounded-2xl p-8 transition-all duration-500 group cursor-pointer"
              >
                <div className="text-4xl mb-6 text-white/60 group-hover:text-white transition-colors">
                  {solution.icon}
                </div>
                <h3 className="font-outfit text-xl font-bold mb-3">{solution.title}</h3>
                <p className="text-white/50 leading-relaxed">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="glass rounded-3xl p-12">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="font-outfit text-5xl font-bold text-white mb-2">2.4M</div>
                    <div className="font-mono text-xs text-white/40">Tons CO2 Reduced</div>
                  </div>
                  <div className="text-center">
                    <div className="font-outfit text-5xl font-bold text-white mb-2">180+</div>
                    <div className="font-mono text-xs text-white/40">Countries Served</div>
                  </div>
                  <div className="text-center">
                    <div className="font-outfit text-5xl font-bold text-white mb-2">$12B</div>
                    <div className="font-mono text-xs text-white/40">Resources Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-outfit text-5xl font-bold text-white mb-2">98%</div>
                    <div className="font-mono text-xs text-white/40">Client Retention</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="font-mono text-sm text-white/40 tracking-widest">03 / IMPACT</span>
              <h2 className="font-outfit text-4xl md:text-5xl font-bold mt-4 mb-8">
                Measurable Results
                <br />
                <span className="text-white/60">At Scale</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-8">
                Our AI solutions have delivered tangible outcomes across industries.
                From reducing carbon emissions to optimizing global supply chains,
                we quantify every impact.
              </p>
              <ul className="space-y-4">
                {['Real-time environmental monitoring', 'Carbon footprint optimization', 'Renewable energy integration', 'Sustainable supply chain management'].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-16 glow">
            <h2 className="font-outfit text-4xl md:text-6xl font-bold mb-6">
              Ready to Transform
              <br />
              <span className="text-white/60">Your Operations?</span>
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
              Join the leading organizations using Aether AI to build a sustainable future.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button className="px-10 py-4 bg-white text-black rounded-full font-outfit font-semibold hover:scale-105 transition-transform duration-300">
                Request Demo
              </button>
              <button className="px-10 py-4 border border-white/20 rounded-full font-outfit font-medium text-white/80 hover:bg-white/10 transition-all duration-300">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/5" />
                </div>
                <span className="font-outfit font-bold text-xl">AETHER</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                AI for Earth. Building intelligent systems to understand, protect,
                and optimize our planet.
              </p>
            </div>

            <div>
              <div className="font-outfit font-semibold mb-4">Solutions</div>
              <ul className="space-y-2 text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Climate</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Energy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Agriculture</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Urban</a></li>
              </ul>
            </div>

            <div>
              <div className="font-outfit font-semibold mb-4">Company</div>
              <ul className="space-y-2 text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>

            <div>
              <div className="font-outfit font-semibold mb-4">Connect</div>
              <ul className="space-y-2 text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
            <div className="font-mono text-xs text-white/30">
              © 2024 Aether Earth AI. All rights reserved.
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="font-mono text-xs text-white/30 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="font-mono text-xs text-white/30 hover:text-white transition-colors">Terms</a>
              <a href="#" className="font-mono text-xs text-white/30 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
