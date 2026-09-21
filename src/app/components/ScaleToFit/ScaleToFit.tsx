import {useEffect, useState, type ReactNode} from 'react'

const SCALE_FLOOR = 0.6
// When the width/height fit ratios are close enough (within this threshold),
// stretch each axis independently to fill the viewport with no letterbox
// margin. When they diverge more than this, fall back to a single uniform
// scale (preserves proportions, leaves margin on the more generous axis)
// to avoid visibly distorting the layout.
const FILL_MISMATCH_THRESHOLD = 0.85

type ScaleToFitProps = {
  active: boolean
  designWidth: number
  designHeight: number
  children: ReactNode
}

type FitState = {
  scaleX: number
  scaleY: number
  scrollFallback: boolean
}

const computeFit = (designWidth: number, designHeight: number): FitState => {
  const rawX = Math.min(1, window.innerWidth / designWidth)
  const rawY = Math.min(1, window.innerHeight / designHeight)
  const minScale = Math.min(rawX, rawY)
  const maxScale = Math.max(rawX, rawY)
  const mismatch = maxScale === 0 ? 1 : minScale / maxScale

  if (minScale < SCALE_FLOOR) {
    return {scaleX: SCALE_FLOOR, scaleY: SCALE_FLOOR, scrollFallback: true}
  }
  if (mismatch >= FILL_MISMATCH_THRESHOLD) {
    return {scaleX: rawX, scaleY: rawY, scrollFallback: false}
  }
  return {scaleX: minScale, scaleY: minScale, scrollFallback: false}
}

const ScaleToFit = ({active, designWidth, designHeight, children}: ScaleToFitProps) => {
  // Lazy-initialized so the very first paint already uses the correct scale —
  // avoids a flash of full-size (scale=1) content snapping down a frame later.
  const [fit, setFit] = useState<FitState>(() =>
    active ? computeFit(designWidth, designHeight) : {scaleX: 1, scaleY: 1, scrollFallback: false},
  )

  useEffect(() => {
    if (!active) return

    const onResize = () => setFit(computeFit(designWidth, designHeight))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active, designWidth, designHeight])

  if (!active) return <>{children}</>

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: fit.scrollFallback ? 'flex-start' : 'center',
        justifyContent: fit.scrollFallback ? 'flex-start' : 'center',
        overflow: fit.scrollFallback ? 'auto' : 'hidden',
      }}
    >
      <div
        style={{
          width: designWidth,
          height: designHeight,
          flexShrink: 0,
          transform: `scale(${fit.scaleX}, ${fit.scaleY})`,
          transformOrigin: fit.scrollFallback ? 'top left' : 'center center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export {ScaleToFit}
