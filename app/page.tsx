import { Navbar } from "@/app/_components/navbar"
import { Hero } from "@/app/_components/hero"
import { LogoCloud } from "@/app/_components/logo-cloud"
import { HowItWorks } from "@/app/_components/how-it-works"
import { UseCases } from "@/app/_components/use-cases"
import { Integrations } from "@/app/_components/integrations"
import { Testimonials } from "@/app/_components/testimonials"
import { CTA } from "@/app/_components/cta"
import { Footer } from "@/app/_components/footer"

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <Hero />
      <LogoCloud />
      <HowItWorks />
      <UseCases />
      <Integrations />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}
