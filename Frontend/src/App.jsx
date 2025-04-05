import { RFPUploader } from "./components/Upload"
import { LandingHero } from "./components/LandingHero"
import Dashboard from './dashboard/Dashboard.jsx' // Create this if it doesn't exist


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full">
        <LandingHero />
        <RFPUploader />
      </div>
    </main>
  )
}

