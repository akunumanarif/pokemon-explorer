'use client'

import { Button } from './ui/button'

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Gotta Catch{' '}
          <span className="text-yellow-400">
            'Em All!
          </span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-200">
          Explore the world of Pokemon, build your ultimate team, and discover your favorites.
          Join thousands of trainers on their Pokemon journey.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400">
            Start Exploring
          </Button>
          <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-black">
            View Teams
          </Button>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold">1000+</div>
            <div className="text-sm text-gray-300">Pokemon Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">18</div>
            <div className="text-sm text-gray-300">Pokemon Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">∞</div>
            <div className="text-sm text-gray-300">Team Combinations</div>
          </div>
        </div>
      </div>
    </div>
  )
}