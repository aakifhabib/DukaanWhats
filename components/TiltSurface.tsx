'use client'

import { useRef, type PointerEvent, type ReactNode } from 'react'

type TiltSurfaceProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  maxTilt?: number
}

export function TiltSurface({ children, className = '', contentClassName = '', maxTilt = 7 }: TiltSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null)

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const element = ref.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    element.style.setProperty('--tilt-x', `${((0.5 - y) * maxTilt).toFixed(2)}deg`)
    element.style.setProperty('--tilt-y', `${((x - 0.5) * maxTilt).toFixed(2)}deg`)
    element.style.setProperty('--shine-x', `${(x * 100).toFixed(1)}%`)
    element.style.setProperty('--shine-y', `${(y * 100).toFixed(1)}%`)
    element.style.setProperty('--shine-opacity', '1')
  }

  const reset = () => {
    const element = ref.current
    if (!element) return
    element.style.setProperty('--tilt-x', '0deg')
    element.style.setProperty('--tilt-y', '0deg')
    element.style.setProperty('--shine-opacity', '0')
  }

  return (
    <div ref={ref} className={`dw-tilt-surface ${className}`} onPointerMove={move} onPointerLeave={reset}>
      <div className={`dw-tilt-surface__content ${contentClassName}`}>{children}</div>
    </div>
  )
}
