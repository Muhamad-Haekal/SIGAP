import Header from './components/Header'
import Hero from './components/Hero'
import Showcase from './components/Showcase'
import Services from './components/Services'
import ProcessSteps from './components/ProcessSteps'
import WhyUs from './components/WhyUs'
import CtaBanner from './components/CtaBanner'
import Footer from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Showcase />
        <Services />
        <ProcessSteps />
        <WhyUs />
        <CtaBanner />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}