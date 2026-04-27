import {Children, type CSSProperties, type ReactNode} from 'react'
import './ActionFooter.css'

type ActionFooterProps = {
  children: ReactNode
  columns?: number
  maxColumns?: number
  gapX?: number
  gapY?: number
  className?: string
}

function ActionFooter({children, columns, maxColumns = 5, gapX, gapY, className}: ActionFooterProps) {
  const count = Children.count(children)
  const cols = columns ?? Math.min(count || 1, maxColumns)

  const style: CSSProperties = {
    ['--tf-cols' as any]: cols,
    ...(gapX != null ? {['--tf-gap-x' as any]: `${gapX}px`} : null),
    ...(gapY != null ? {['--tf-gap-y' as any]: `${gapY}px`} : null),
  }

  return <div className={className ? `tf-actionFooter ${className}` : 'tf-actionFooter'} style={style}>{children}</div>
}

export {ActionFooter}

