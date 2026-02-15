'use client'

import { useEffect, useState } from 'react'

const WORDS = [
  'Knowledge',
  'Learning',
  'Success',
  'Growth',
  'Innovation'
]

export default function VerticalTicker({
  interval = 5000,
}: {
  interval?: number
}) {
  const [index, setIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Slower visual timing: animation duration set to 1000ms below,
  // so we use half of that (500ms) to swap the word in the middle.
  useEffect(() => {
    const t = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length)
        setIsAnimating(false)
      }, 200) // Half of animation duration (500ms)
    }, interval)
    return () => clearInterval(t)
  }, [interval])

  return (
    <span className="block mt-2">
      <span className="inline-block relative h-[1.05em] overflow-hidden align-middle">
        <div
          className={`block font-bold transition-all duration-1000 ease-out ${
            isAnimating
              ? 'transform -translate-y-4 opacity-0'
              : 'transform translate-y-0 opacity-100'
          }`}
          style={{ color: '#064e3b', transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          {WORDS[index]}
        </div>

        {/* Marigold underline accent */}
        <span
          aria-hidden
          className="absolute left-0 -bottom-2 block h-1 rounded-full"
          style={{ width: '3.5rem', backgroundColor: '#f59e0b' }}
        />
      </span>
    </span>
  )
}
