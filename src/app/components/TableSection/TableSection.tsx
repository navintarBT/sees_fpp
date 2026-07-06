import {useRef, type CSSProperties, type ReactNode, type Ref} from 'react'

export type TableColumn<Row> = {
  key: string
  header: ReactNode
  headClassName?: string
  cellClassName?: string
  render: (row: Row) => ReactNode
}

type TableSectionProps<Row> = {
  columns: Array<TableColumn<Row>>
  rows: Row[]
  getRowKey: (row: Row) => string | number
  activeRowKey?: string | number | null
  isRowActive?: (rowKey: string | number, row: Row) => boolean
  onRowActivate?: (rowKey: string | number, row: Row) => void
  onRowLongPress?: (rowKey: string | number, row: Row) => void
  longPressDelay?: number
  tools?: ReactNode
  empty?: ReactNode
  className?: string
  gridClassName?: string
  gridStyle?: CSSProperties
  scrollRef?: Ref<HTMLDivElement>
  rowTabIndex?: number
}

function TableSection<Row>({
  columns,
  rows,
  getRowKey,
  activeRowKey = null,
  isRowActive,
  onRowActivate,
  onRowLongPress,
  longPressDelay = 500,
  tools,
  empty,
  className,
  gridClassName,
  gridStyle,
  scrollRef,
  rowTabIndex = 0,
}: TableSectionProps<Row>) {
  const pressTimerRef = useRef<number | null>(null)
  const isLongPressRef = useRef(false)

  const handlePointerDown = (rowKey: string | number, row: Row) => {
    isLongPressRef.current = false
    pressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true
      onRowLongPress?.(rowKey, row)
    }, longPressDelay)
  }

  const cancelPress = () => {
    if (pressTimerRef.current !== null) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  const handlePointerUp = (rowKey: string | number, row: Row) => {
    const wasLongPress = isLongPressRef.current
    cancelPress()
    if (!wasLongPress) {
      onRowActivate?.(rowKey, row)
    }
  }
  const style: CSSProperties = {
    ['--tf-table-cols' as any]: columns.length,
    ...gridStyle,
  }
  const isEmpty = rows.length === 0
  const wrapClassName = [
    'tf-tableWrap',
    isEmpty ? 'tf-tableWrapEmpty' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapClassName}>
      <div className='tf-tableTools'>{tools}</div>
      <div className='tf-tableBox'>
        <div className='tf-tableScroll' ref={scrollRef}>
          <div className={gridClassName ? `tf-tableGrid ${gridClassName}` : 'tf-tableGrid'} style={style}>
            <div className='tf-tableHead'>
              {columns.map((col) => (
                <span key={col.key} className={col.headClassName ? `tf-tableCell ${col.headClassName}` : 'tf-tableCell'}>
                  {col.header}
                </span>
              ))}
            </div>
            <div className='tf-tableHeadDivider' aria-hidden='true'></div>
            <div className='tf-tableBody'>
              {rows.length === 0 ? (
                <div className='tf-tableEmpty'>{empty ?? null}</div>
              ) : (
                rows.map((row) => {
                  const rowKey = getRowKey(row)
                  const isActiveByKey = activeRowKey != null && rowKey === activeRowKey
                  const isActive = isRowActive ? isRowActive(rowKey, row) : isActiveByKey
                  return (
                    <div
                      className={isActive ? 'tf-tableRow tf-tableRowActive' : 'tf-tableRow'}
                      key={rowKey}
                    >
                      {columns.map((col, colIndex) => (
                        <span
                          key={col.key}
                          className={col.cellClassName ? `tf-tableCell ${col.cellClassName}` : 'tf-tableCell'}
                          role={onRowActivate && colIndex === 0 ? 'button' : undefined}
                          tabIndex={onRowActivate && colIndex === 0 ? rowTabIndex : undefined}
                          onClick={onRowActivate && !onRowLongPress ? () => onRowActivate(rowKey, row) : undefined}
                          onPointerDown={onRowLongPress ? () => handlePointerDown(rowKey, row) : undefined}
                          onPointerUp={onRowLongPress ? () => handlePointerUp(rowKey, row) : undefined}
                          onPointerLeave={onRowLongPress ? cancelPress : undefined}
                          onPointerCancel={onRowLongPress ? cancelPress : undefined}
                          onKeyDown={
                            onRowActivate && colIndex === 0
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    onRowActivate(rowKey, row)
                                  }
                                }
                              : undefined
                          }
                        >
                          {col.render(row)}
                        </span>
                      ))}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {TableSection}
