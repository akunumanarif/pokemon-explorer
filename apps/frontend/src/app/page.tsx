import { Hero } from '@/components/hero'
import { PokemonList } from '@/components/pokemon-list'
import { Navbar } from '@/components/navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <div className="container mx-auto px-4 py-8">
          <PokemonList />
        </div>
      </main>
    </div>
  )
}