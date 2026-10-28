import { useRef } from 'react'
import '@fontsource-variable/archivo/wdth.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedProperties from './components/FeaturedProperties'
import CinematicJourney from './components/CinematicJourney'
import Services from './components/Services'
import PortfolioShowcase from './components/PortfolioShowcase'
import Process from './components/Process'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import AreasAndCTA from './components/AreasAndCTA'
import Footer from './components/Footer'
import { useReveal } from './hooks/useReveal'

export default function App() {
  const root = useRef(null)
  useReveal(root)
  return (
    <div ref={root}>
      <Navbar />
      <main>
        <Hero />
        <FeaturedProperties />
        <CinematicJourney />
        <Services />
        <PortfolioShowcase />
        <Process />
        <Pricing />
        <Testimonials />
        <AreasAndCTA />
      </main>
      <Footer />
    </div>
  )
}
