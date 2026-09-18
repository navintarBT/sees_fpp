import {useState} from 'react'
import {useLocation} from 'react-router-dom'

type Orientation = 'portrait' | 'landscape'

const useOrientation = (storageKey: string) => {
  const location = useLocation()
  const [isLandscape] = useState(() => {
    const navOrientation = (location.state as {orientation?: Orientation} | null)?.orientation
    if (navOrientation) {
      sessionStorage.setItem(storageKey, navOrientation)
      return navOrientation === 'landscape'
    }
    return sessionStorage.getItem(storageKey) === 'landscape'
  })
  return isLandscape
}

const orientationState = (isLandscape: boolean) => ({
  state: {orientation: (isLandscape ? 'landscape' : 'portrait') as Orientation},
})

export {useOrientation, orientationState}
