import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Navbar />
      <main className="flex-1">
        <Hero />
      </main>
       <Footer />
    </div>
  )
}