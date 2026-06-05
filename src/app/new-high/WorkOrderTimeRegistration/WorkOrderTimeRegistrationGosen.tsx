import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'
import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa'

const formatWoDate = (value: string) => {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return 'yy/mm/dd'
  return `${year}/${month}/${day}`
}

const padDatePart = (value: number) => value.toString().padStart(2, '0')

const toDateValue = (date: Date) => (
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
)

const parseDateValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return year && month && day ? new Date(year, month - 1, day) : new Date()
}

const parseTimeValue = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null
  return hours * 60 + minutes
}

const formatTimeValue = (value: string) => {
  const minutes = parseTimeValue(value)
  return minutes === null ? '' : value
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return {
    hours: hours.toString(),
    minutes: mins.toString().padStart(2, '0'),
  }
}

const calculateDuration = (start: string, end: string) => {
  const startMinutes = parseTimeValue(start)
  const endMinutes = parseTimeValue(end)
  if (startMinutes === null || endMinutes === null) return null
  const diff = endMinutes - startMinutes
  if (diff < 0) return null
  return formatDuration(diff)
}

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const startDate = new Date(year, month, 1 - new Date(year, month, 1).getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)

    return {
      date,
      value: toDateValue(date),
      inMonth: date.getMonth() === month,
    }
  })
}

type Row = {
  id: number
  woNo: string
  itemNo: string
  itemName: string
  targetTime?: string
  acceptedQty?: string
  defectiveQty?: string
  opOrder?: string
  opDesc?: string
  processStatus?: string
  remarks?: string
}

const getColumnTextValue = (key: string, row: Row): string => {
  switch (key) {
    case 'woNo': return row.woNo
    case 'itemNo': return row.itemNo
    case 'itemName': return row.itemName
    case 'targetTime': return row.targetTime ?? ''
    case 'acceptedQty': return row.acceptedQty ?? ''
    case 'defectiveQty': return row.defectiveQty ?? ''
    case 'opOrder': return row.opOrder ?? ''
    case 'opDesc': return row.opDesc ?? ''
    case 'processStatus': return row.processStatus ?? ''
    case 'remarks': return row.remarks ?? ''
    default: return ''
  }
}

const COLUMN_DEFS: Array<{ key: string; header: string }> = [
  { key: 'check', header: '' },
  { key: 'woNo', header: 'WoNo' },
  { key: 'itemNo', header: '品番' },
  { key: 'itemName', header: '品名' },
  { key: 'targetTime', header: '目標時間' },
  { key: 'acceptedQty', header: '合格数' },
  { key: 'defectiveQty', header: '不良数' },
  { key: 'opOrder', header: '作業順序' },
  { key: 'opDesc', header: '作業記述' },
  { key: 'processStatus', header: '工程状況' },
  { key: 'remarks', header: '備考' },
]

const measureColumnWidths = (rows: Row[]): React.CSSProperties | undefined => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  ctx.font = '400 28px sans-serif'
  const cellPadding = 36

  const colWidths = COLUMN_DEFS.map(({ key, header }) => {
    if (key === 'check') return '56px'

    let maxWidth = ctx.measureText(header).width + cellPadding

    for (const row of rows) {
      const text = getColumnTextValue(key, row)
      const w = ctx.measureText(text).width + cellPadding
      if (w > maxWidth) maxWidth = w
    }

    return `${Math.ceil(maxWidth)}px`
  })

  return { gridTemplateColumns: colWidths.join(' ') }
}

const TimePickerDropdown = ({ value, onChange, onClose }: { value: string; onChange: (val: string) => void; onClose: () => void }) => {
  const currentHour = value && value.includes(':') ? value.split(':')[0] : '00'
  const currentMinute = value && value.includes(':') ? value.split(':')[1] : '00'

  return (
    <div className='hand-timepicker'>
      <div className='hand-timepicker-col'>
        {Array.from({ length: 24 }).map((_, i) => {
          const h = i.toString().padStart(2, '0')
          return (
            <div
              key={`h-${h}`}
              className={`hand-timepicker-item ${currentHour === h ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onChange(`${h}:${currentMinute}`)
              }}
            >
              {h}
            </div>
          )
        })}
      </div>
      <div className='hand-timepicker-col'>
        {Array.from({ length: 60 }).map((_, i) => {
          const m = i.toString().padStart(2, '0')
          return (
            <div
              key={`m-${m}`}
              className={`hand-timepicker-item ${currentMinute === m ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onChange(`${currentHour}:${m}`)
                onClose()
              }}
            >
              {m}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SESSION_STORAGE_KEY = 'workOrderTimeRegistrationSelectedWoNumbers'
const SESSION_STORAGE_ROWS_KEY = 'workOrderTimeRegistrationGosenRows'

const DEFAULT_ROWS: Row[] = [
  {
    id: 1,
    woNo: 'WO-001',
    itemNo: 'a',
    itemName: '製品a',
    targetTime: '50',
    acceptedQty: '9',
    defectiveQty: '1',
    opOrder: '10',
    opDesc: '研磨3',
    processStatus: '90',
    remarks: 'xxxxx',
  },
  {
    id: 2,
    woNo: 'WO-002',
    itemNo: 'b',
    itemName: '製品b',
    targetTime: '50',
    acceptedQty: '3',
    defectiveQty: '',
    opOrder: '10',
    opDesc: '研磨3',
    processStatus: '',
    remarks: '',
  },
  {
    id: 3,
    woNo: 'WO-003',
    itemNo: 'c',
    itemName: '製品c',
  },
  {
    id: 4,
    woNo: 'WO-004',
    itemNo: 'd',
    itemName: '製品d',
  },
  {
    id: 5,
    woNo: 'WO-005',
    itemNo: 'e',
    itemName: '製品e',
  },
  {
    id: 6,
    woNo: 'WO-006',
    itemNo: 'f',
    itemName: '製品f',
  },
  {
    id: 7,
    woNo: 'WO-007',
    itemNo: 'g',
    itemName: '製品g',
  },
  {
    id: 8,
    woNo: 'WO-008',
    itemNo: 'h',
    itemName: '製品h',
  },
  {
    id: 9,
    woNo: 'wo-10',
    itemNo: 'a',
    itemName: '製品a',
    targetTime: '50',
    acceptedQty: '9',
    defectiveQty: '1',
    opOrder: '10',
    opDesc: '研磨3',
    processStatus: '90',
    remarks: 'xxxxx',
  },
  {
    id: 10,
    woNo: 'wo-20',
    itemNo: 'b',
    itemName: '製品b',
    targetTime: '50',
    acceptedQty: '3',
    defectiveQty: '',
    opOrder: '10',
    opDesc: '研磨3',
    processStatus: '',
    remarks: '',
  },
  {
    id: 11,
    woNo: 'wo-30',
    itemNo: 'c',
    itemName: '製品c',
  },
]

const WorkOrderTimeRegistrationGosen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rows, setRows] = useState<Row[]>([])

  const saveRowsToStorage = (rowsToSave: Row[]) => {
    sessionStorage.setItem(SESSION_STORAGE_ROWS_KEY, JSON.stringify(rowsToSave))
  }

  const gridStyle = useMemo(() => measureColumnWidths(rows), [rows])

  const todayValue = toDateValue(new Date())
  const [woDatePickerValue, setWoDatePickerValue] = useState(todayValue)
  const [showWoCalendar, setShowWoCalendar] = useState(false)
  const [woCalendarMonth, setWoCalendarMonth] = useState(() => parseDateValue(todayValue))

  const openWoDatePicker = () => {
    setWoCalendarMonth(parseDateValue(woDatePickerValue))
    setShowWoCalendar((current) => !current)
  }

  const changeWoCalendarMonth = (amount: number) => {
    setWoCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  const selectWoDate = (value: string) => {
    setWoDatePickerValue(value)
    setWoCalendarMonth(parseDateValue(value))
    setShowWoCalendar(false)
  }

  const calendarDays = getCalendarDays(woCalendarMonth)
  const calendarMonthLabel = woCalendarMonth.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })

  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [workStartTime, setWorkStartTime] = useState('')
  const [workEndTime, setWorkEndTime] = useState('')
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [workDurationHours, setWorkDurationHours] = useState('')
  const [workDurationMinutes, setWorkDurationMinutes] = useState('')
  const [showRegisterKeepConfirm, setShowRegisterKeepConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([])

  const isAnyModalOpen =
    showDeleteSelectedConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowDeleteSelectedConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowRegisterKeepConfirm(false)
    setShowBackConfirm(false)
  }

  const handleDeleteSelected = () => {
    if (checkedRowIds.length === 0) {
      setShowNoSelectionConfirm(true)
      return
    }
    setShowDeleteSelectedConfirm(true)
  }

  const confirmDeleteSelected = () => {
    setRows((prev) => {
      const nextRows = prev.filter((row) => !checkedRowIds.includes(row.id))
      saveRowsToStorage(nextRows)
      return nextRows
    })
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers')
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_gosen')
    setCheckedRowIds([])
    setShowDeleteSelectedConfirm(false)
  }

  const clearAll = () => {
    setRows([])
    saveRowsToStorage([])
    setCheckedRowIds([])
  }

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  const isAllChecked = rows.length > 0 && rows.every((row) => checkedRowIds.includes(row.id))

  const toggleAllChecked = (checked: boolean) => {
    if (checked) {
      setCheckedRowIds(rows.map((row) => row.id))
      return
    }
    setCheckedRowIds([])
  }

  const toggleRowChecked = (rowId: number, checked: boolean) => {
    setCheckedRowIds((prev) => {
      if (checked) {
        return prev.includes(rowId) ? prev : [...prev, rowId]
      }
      return prev.filter((id) => id !== rowId)
    })
  }

  const updateWorkDuration = (start: string, end: string) => {
    const duration = calculateDuration(start, end)
    if (duration) {
      setWorkDurationHours(duration.hours)
      setWorkDurationMinutes(duration.minutes)
      return
    }
    setWorkDurationHours('')
    setWorkDurationMinutes('')
  }

  // 登録(WO維持) - Register and keep WO data
  const handleRegisterKeep = () => {
    setWorkStartTime('')
    setWorkEndTime('')
    setWorkDurationHours('')
    setWorkDurationMinutes('')
  }

  useEffect(() => {
    const duration = calculateDuration(workStartTime, workEndTime)
    if (duration) {
      setWorkDurationHours(duration.hours)
      setWorkDurationMinutes(duration.minutes)
      return
    }
    setWorkDurationHours('')
    setWorkDurationMinutes('')
  }, [workStartTime, workEndTime])

  const updateRowField = (
    rowId: number,
    field: keyof Omit<Row, 'id' | 'woNo'>,
    value: string,
  ) => {
    setRows((prevRows) => {
      const nextRows = prevRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      )
      saveRowsToStorage(nextRows)
      return nextRows
    })
  }

  useEffect(() => {
    const state = location.state as {
      selectedWoNumbers?: string[]
      selectedRows?: Array<{
        id: number
        woNumber: string
        itemNumber?: string
        itemName?: string
        orderQuantity?: number
      }>
    } | null
    const selectedWoNumbers = state?.selectedWoNumbers
    const selectedRows = state?.selectedRows

    if (Array.isArray(selectedRows) && selectedRows.length > 0) {
      const mappedRows: Row[] = selectedRows.map((row) => ({
        id: row.id,
        woNo: row.woNumber,
        itemNo: row.itemNumber ?? '',
        itemName: row.itemName ?? '',
        targetTime: '',
        acceptedQty: '',
        defectiveQty: '',
        opOrder: '',
        opDesc: '',
        processStatus: '',
        remarks: '',
      }))
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedWoNumbers ?? []))
      setRows(mappedRows)
      saveRowsToStorage(mappedRows)
      return
    }

    if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedWoNumbers))
      const matchedRows = DEFAULT_ROWS.filter((row) => selectedWoNumbers.includes(row.woNo))
      const missingRows = selectedWoNumbers
        .filter((woNo) => !matchedRows.some((row) => row.woNo === woNo))
        .map((woNo, index) => ({
          id: Date.now() + index,
          woNo,
          itemNo: '',
          itemName: '',
          targetTime: '',
          acceptedQty: '',
          defectiveQty: '',
          opOrder: '',
          opDesc: '',
          processStatus: '',
          remarks: '',
        }))
      const allRows = [...matchedRows, ...missingRows]
      setRows(allRows)
      saveRowsToStorage(allRows)
    } else {
      const savedRows = sessionStorage.getItem(SESSION_STORAGE_ROWS_KEY)
      if (savedRows) {
        try {
          const parsedRows = JSON.parse(savedRows)
          if (Array.isArray(parsedRows)) {
            setRows(parsedRows.filter((item): item is Row => item && typeof item === 'object' && typeof item.id === 'number'))
            return
          }
        } catch {
          // ignore invalid stored rows
        }
      }

      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            const validSelection = parsed.filter((item): item is string => typeof item === 'string')
            if (validSelection.length > 0) {
              const matchedRows = DEFAULT_ROWS.filter((row) => validSelection.includes(row.woNo))
              const missingRows = validSelection
                .filter((woNo) => !matchedRows.some((row) => row.woNo === woNo))
                .map((woNo, index) => ({
                  id: Date.now() + index,
                  woNo,
                  itemNo: '',
                  itemName: '',
                  targetTime: '',
                  acceptedQty: '',
                  defectiveQty: '',
                  opOrder: '',
                  opDesc: '',
                  processStatus: '',
                  remarks: '',
                }))
              const allRows = [...matchedRows, ...missingRows]
              setRows(allRows)
              saveRowsToStorage(allRows)
            }
          }
        } catch {
          // ignore invalid storage data
        }
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) return

      if (event.key === 'F1') {
        event.preventDefault()
        handleDeleteSelected()
        return
      }

      if (event.key === 'F2') {
        event.preventDefault()
        setShowCompleteConfirm(true)
        return
      }

      if (event.key === 'F4') {
        event.preventDefault()
        setShowBackConfirm(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [checkedRowIds, isAnyModalOpen, location.state])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'check',
      headClassName: 'col-check',
      cellClassName: 'col-check',
      header: (
        <input
          type='checkbox'
          className='tf-tableCheckbox'
          checked={isAllChecked}
          onChange={(e) => toggleAllChecked(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label='Select all rows'
        />
      ),
      render: (row) => (
        <input
          type='checkbox'
          className='tf-tableCheckbox'
          checked={checkedRowIds.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation()
            toggleRowChecked(row.id, e.target.checked)
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select row ${row.id}`}
        />
      ),
    },
    { key: 'woNo', headClassName: 'col-wo', cellClassName: 'col-wo', header: 'WoNo', render: (row) => row.woNo },
    {
      key: 'itemNo',
      headClassName: 'col-item-no',
      cellClassName: 'col-item-no',
      header: '品番',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.itemNo}
          onChange={(e) => updateRowField(row.id, 'itemNo', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'itemName',
      headClassName: 'col-item-name',
      cellClassName: 'col-item-name',
      header: '品名',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.itemName}
          onChange={(e) => updateRowField(row.id, 'itemName', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'targetTime',
      headClassName: 'col-target-time',
      cellClassName: 'col-target-time col-text-purple',
      header: '目標時間',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.targetTime ?? ''}
          onChange={(e) => updateRowField(row.id, 'targetTime', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'acceptedQty',
      headClassName: 'col-qty',
      cellClassName: 'col-qty',
      header: '合格数',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.acceptedQty ?? ''}
          onChange={(e) => updateRowField(row.id, 'acceptedQty', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'defectiveQty',
      headClassName: 'col-qty',
      cellClassName: 'col-qty',
      header: '不良数',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.defectiveQty ?? ''}
          onChange={(e) => updateRowField(row.id, 'defectiveQty', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'opOrder',
      headClassName: 'col-op',
      cellClassName: 'col-op',
      header: '作業順序',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.opOrder ?? ''}
          onChange={(e) => updateRowField(row.id, 'opOrder', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'opDesc',
      headClassName: 'col-op',
      cellClassName: 'col-op',
      header: '作業記述',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.opDesc ?? ''}
          onChange={(e) => updateRowField(row.id, 'opDesc', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'processStatus',
      headClassName: 'col-process',
      cellClassName: 'col-process',
      header: '工程状況',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.processStatus ?? ''}
          onChange={(e) => updateRowField(row.id, 'processStatus', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'remarks',
      headClassName: 'col-remarks',
      cellClassName: 'col-remarks',
      header: '備考',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.remarks ?? ''}
          onChange={(e) => updateRowField(row.id, 'remarks', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>作業オーダー実績時間登録</div>
          <div className='set-body'>
            <div className='set-formnew_high '>
              <div className='wot-header-container '>
                {/* Left side: Info Grid */}
                <div className='wot-info-soll box-padding-innput'>
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-blue'>人</label>
                    <input className='wot-grid-value1' autoFocus />
                    <input className='wot-grid-value1' style={{ backgroundColor: '#e5e7eb' }} />
                  </div>

                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-blue'>日付</label>
                    <div className='hand-date-field'>
                      <input
                        readOnly
                        className='wot-grid-value1'
                        value={formatWoDate(woDatePickerValue)}
                        onClick={openWoDatePicker}
                        style={{ cursor: 'pointer' }}
                      />
                      <button
                        type='button'
                        className='hand-date-btn'
                        aria-label='Choose date'
                        onClick={openWoDatePicker}
                      >
                        <FaRegCalendarAlt />
                      </button>
                      {showWoCalendar && (
                        <div className='hand-calendar' role='dialog' aria-label='Choose date'>
                          <div className='hand-calendar-header'>
                            <button type='button' onClick={() => changeWoCalendarMonth(-1)}>{'<'}</button>
                            <span>{calendarMonthLabel}</span>
                            <button type='button' onClick={() => changeWoCalendarMonth(1)}>{'>'}</button>
                          </div>
                          <div className='hand-calendar-weekdays'>
                            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                              <span key={day}>{day}</span>
                            ))}
                          </div>
                          <div className='hand-calendar-days'>
                            {calendarDays.map(({ date, value, inMonth }) => (
                              <button
                                type='button'
                                key={value}
                                className={[
                                  'hand-calendar-day',
                                  inMonth ? '' : 'hand-calendar-muted',
                                  value === woDatePickerValue ? 'hand-calendar-selected' : '',
                                ].filter(Boolean).join(' ')}
                                onClick={() => selectWoDate(value)}
                              >
                                {date.getDate()}
                              </button>
                            ))}
                          </div>
                          <div className='hand-calendar-footer'>
                            <button
                              type='button'
                              className='hand-calendar-btn-today'
                              onClick={() => selectWoDate(toDateValue(new Date()))}
                            >
                              今日
                            </button>
                            <button
                              type='button'
                              className='hand-calendar-btn-clear'
                              onClick={() => selectWoDate('')}
                            >
                              クリア
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-red'>工程状況初期値</label>
                    <input className='wot-grid-value1 wot-text-red' />
                  </div>
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-red'>作業順序</label>
                    <input className='wot-grid-value1 wot-text-red' />
                  </div>
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-red'>備考</label>
                    <input className='wot-grid-value1 wot-text-red' />
                  </div>

                </div>

                <div className='wot-header-actions'>

                  <div className='wot-radio-container'>
                    <div className='wot-radio-group'>
                      <div className='wot-radio-title'>登録時間種類</div>
                      <label className='wot-radio-item'>
                        <input type='radio' name='timeType' defaultChecked />
                        <span>労務</span>
                      </label>
                      <label className='wot-radio-item'>
                        <input type='radio' name='timeType' />
                        <span>段取</span>
                      </label>
                      <label className='wot-radio-item'>
                        <input type='radio' name='timeType' />
                        <span>機械</span>
                      </label>
                      <div className='wot-top-row'>
                        <button className='set-btnnew_high set-primary' onClick={() => navigate('/factory/work-order-time-registration-choose')}>
                          WO選択
                        </button>
                      </div>
                    </div>

                    {/* <ActionFooter columns={2}>
                      <button
                        className='set-btnnew_high set-primary'
                        type='button'
                        onClick={() => {
                          const now = new Date()
                          const hours = now.getHours().toString().padStart(2, '0')
                          const minutes = now.getMinutes().toString().padStart(2, '0')
                          const value = `${hours}:${minutes}`
                          setWorkStartTime(value)
                          updateWorkDuration(value, workEndTime)
                        }}
                      >
                        作業開始
                      </button>
                      <button
                        className='set-btnnew_high set-success'
                        type='button'
                        onClick={() => {
                          const now = new Date()
                          const hours = now.getHours().toString().padStart(2, '0')
                          const minutes = now.getMinutes().toString().padStart(2, '0')
                          const value = `${hours}:${minutes}`
                          setWorkEndTime(value)
                          updateWorkDuration(workStartTime, value)
                        }}
                      >
                        作業終了
                      </button>
                    </ActionFooter> */}
                  </div>
                </div>
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='delivery-table'
              gridStyle={gridStyle}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              isRowActive={(rowKey) => checkedRowIds.includes(Number(rowKey))}
            />

            <div className='wot-footer-summary wot-radio-container'>
              <div className='wot-footer-row'>
                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-blue'>開始</label>
                  <input
                    className='wot-grid-value2'
                    type='text'
                    placeholder='--:--'
                    maxLength={5}
                    value={workStartTime}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9:]/g, '')
                      setWorkStartTime(v)
                    }}
                    onClick={() => setShowStartTimePicker(true)}
                  />
                  <button
                    type='button'
                    className='hand-date-btn'
                    aria-label='Choose time'
                    onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                  >
                    <FaRegClock />
                  </button>
                  {showStartTimePicker && (
                    <TimePickerDropdown
                      value={workStartTime}
                      onChange={setWorkStartTime}
                      onClose={() => setShowStartTimePicker(false)}
                    />
                  )}
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-span'>終了</label>
                  <input
                    className='wot-grid-value2'
                    type='text'
                    placeholder='--:--'
                    maxLength={5}
                    value={workEndTime}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9:]/g, '')
                      setWorkEndTime(v)
                    }}
                    onClick={() => setShowEndTimePicker(true)}
                  />
                  <button
                    type='button'
                    className='hand-date-btn'
                    aria-label='Choose time'
                    onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                  >
                    <FaRegClock />
                  </button>
                  {showEndTimePicker && (
                    <TimePickerDropdown
                      value={workEndTime}
                      onChange={setWorkEndTime}
                      onClose={() => setShowEndTimePicker(false)}
                    />
                  )}
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label '>作業時間</label>
                  <input className='wot-grid-value2' value={workDurationHours} />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-span'>時間</label>
                  <input className='wot-grid-value2' value={workDurationMinutes} placeholder='分' />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label'>目標時間計</label>
                  <input className='wot-grid-value2' />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-span'>時間</label>
                  <input className='wot-grid-value2 addspanto' placeholder='分' />
                </div>
              </div>
            </div>

            <ActionFooter columns={5}>
              <button
                className='set-btn set-danger set-delete-btn-size'
                onClick={handleDeleteSelected}
              >
                選択行削除
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => setShowCompleteConfirm(true)}
              >
                実績登録
              </button>
              <button
                className='set-btn-footer set-primary'
                style={{ visibility: 'hidden' }}
              >
                {'\u624b\u5165\u529b'}
              </button>

              <button
                className='set-btn set-hand-input-btn'
                onClick={handleRegisterKeep}
              >
                作業開始
              </button>

              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                戻る
              </button>
            </ActionFooter>
          </div>

          {showDeleteSelectedConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択された行を削除しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={confirmDeleteSelected}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowDeleteSelectedConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showNoSelectionConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択行がありません。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowNoSelectionConfirm(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showClearConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>読み込みデータを破棄します。<br />宜しいですか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowClearConfirm(false)
                      clearAll()
                      resetTableScroll()
                    }}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowClearConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>実績を登録しました。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowCompleteConfirm(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBackConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>メニューに戻ります。<br />読み込みデータを破棄しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowBackConfirm(false)
                      navigate('/factory/button-work-order-time')
                    }}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowBackConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { WorkOrderTimeRegistrationGosen }
