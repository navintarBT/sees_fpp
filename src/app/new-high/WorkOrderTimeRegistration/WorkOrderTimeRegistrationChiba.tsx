import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'
import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa'
import { FaPlay } from 'react-icons/fa'

const formatWoDate = (value: string) => {
  if (!value) return 'yy/mm/dd'
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

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return {
    // ถ้าน้อยกว่า 1 ชั่วโมงให้ว่าง
    hours: hours > 0 ? hours.toString() : '',

    // ไม่ต้องเติม 0 ด้านหน้า
    minutes: mins.toString(),
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
}

const getColumnTextValue = (key: string, row: Row): string => {
  switch (key) {
    case 'woNo': return row.woNo
    case 'itemNo': return row.itemNo
    case 'itemName': return row.itemName
    default: return ''
  }
}

const COLUMN_DEFS: Array<{ key: string; header: string }> = [
  { key: 'check', header: '' },
  { key: 'woNo', header: 'WoNo' },
  { key: 'itemNo', header: '品番' },
  { key: 'itemName', header: '品名' },
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

    if (key === 'itemNo' || key === 'itemName') {
      return `minmax(${Math.ceil(maxWidth)}px, 1fr)`
    }

    return `${Math.ceil(maxWidth)}px`
  })

  return { gridTemplateColumns: colWidths.join(' ') }
}

const DEFAULT_ROWS: Row[] = [
  { id: 1, woNo: 'WO-001', itemNo: 'PRD-001', itemName: '製品A' },
  { id: 2, woNo: 'WO-002', itemNo: 'PRD-002', itemName: '製品B' },
  { id: 3, woNo: 'WO-003', itemNo: 'PRD-003', itemName: '製品C' },
  { id: 4, woNo: 'WO-004', itemNo: 'PRD-004', itemName: '製品D' },
  { id: 5, woNo: 'WO-005', itemNo: 'PRD-005', itemName: '製品E' },
]

const TimePickerDropdown = ({
  value,
  onChange,
  onClose,
}: {
  value: string
  onChange: (val: string) => void
  onClose: () => void
}) => {
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

const WorkOrderTimeRegistrationChiba = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rows, setRows] = useState<Row[]>([])
  const storedRowsKey = 'workOrderTimeRegistrationChibaRows'
  const sessionKey = 'workOrderTimeRegistrationSelectedWoNumbers_chiba'
  const [activeRowId, setActiveRowId] = useState<number | null>(null)

  const saveRowsToStorage = (rowsToSave: Row[]) => {
    if (rowsToSave.length === 0 || (rowsToSave.length === 1 && !rowsToSave[0].woNo)) {
      sessionStorage.removeItem(storedRowsKey)
    } else {
      sessionStorage.setItem(storedRowsKey, JSON.stringify(rowsToSave))
    }
  }

  const todayValue = toDateValue(new Date())
  const [woDatePickerValue, setWoDatePickerValue] = useState(todayValue)
  const [showWoCalendar, setShowWoCalendar] = useState(false)
  const [woCalendarMonth, setWoCalendarMonth] = useState(() => parseDateValue(todayValue))
  const parentJanCodeInputRef = useRef<HTMLInputElement | null>(null)

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
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [workStartTime, setWorkStartTime] = useState('')
  const [workEndTime, setWorkEndTime] = useState('')
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [workDurationHours, setWorkDurationHours] = useState('')
  const [workDurationMinutes, setWorkDurationMinutes] = useState('')
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
  const [showRegisterSuccessConfirm, setShowRegisterSuccessConfirm] = useState(false)
  const [registrationMode, setRegistrationMode] = useState<'maintain' | 'clear' | null>(null)
  const [workStartStopState, setWorkStartStopState] = useState<'idle' | 'started'>('idle')
  const [workStartStopDisabled, setWorkStartStopDisabled] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const DATA_CLEARED_FLAG = 'workOrderTimeRegistrationChibaCleared'
  const [isDataCleared, setIsDataCleared] = useState(
    () => sessionStorage.getItem(DATA_CLEARED_FLAG) === '1',
  )
  const WORKER_STORAGE_KEY = 'workOrderTimeRegistrationChiba_worker'
  const WORKPLACE_STORAGE_KEY = 'workOrderTimeRegistrationChiba_workplace'
  const [workerCode, setWorkerCode] = useState(() => {
    const saved = sessionStorage.getItem(WORKER_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.code || ''
      } catch {
        return ''
      }
    }
    return ''
  })

  const [workerName, setWorkerName] = useState(() => {
    const saved = sessionStorage.getItem(WORKER_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.name || ''
      } catch {
        return ''
      }
    }
    return ''
  })

  const [workplaceCode, setWorkplaceCode] = useState(() => {
    const saved = sessionStorage.getItem(WORKPLACE_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.code || ''
      } catch {
        return ''
      }
    }
    return ''
  })

  const [workplaceName, setWorkplaceName] = useState(() => {
    const saved = sessionStorage.getItem(WORKPLACE_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.name || ''
      } catch {
        return ''
      }
    }
    return ''
  })

  const [currentSelectedWoNumbers, setCurrentSelectedWoNumbers] = useState<string[]>([])

  const getWorkerNameFromCode = (code: string) => {
    const name = (() => {
      switch (code.trim()) {
        case 'XXXXX': return '作業者X'
        case 'YYYYY': return '作業者Y'
        case 'ZZZZZ': return '作業者Z'
        default: return ''
      }
    })()

    if (code && name) {
      sessionStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify({ code, name }))
    } else if (code && !name) {
      sessionStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify({ code, name: '' }))
    }

    return name
  }

  const getWorkplaceNameFromCode = (code: string) => {
    const name = code.trim() === '9005' ? '研磨班' : ''

    if (code && name) {
      sessionStorage.setItem(WORKPLACE_STORAGE_KEY, JSON.stringify({ code, name }))
    } else if (code && !name) {
      sessionStorage.setItem(WORKPLACE_STORAGE_KEY, JSON.stringify({ code, name: '' }))
    }

    return name
  }

  const gridStyle = useMemo(() => measureColumnWidths(rows), [rows])

  const handleDeleteSelected = () => {
    if (activeRowId === null) {
      setShowNoSelectionConfirm(true)
      return
    }
    setShowDeleteSelectedConfirm(true)
  }

  const clearAll = () => {
    const sessionKeysToClear = [
      storedRowsKey,
      'workOrderTimeRegistrationSelectedWoNumbers',
      sessionKey,
      'workOrderTimeRegistrationSelectedWoNumbers_gosen',
    ]
    sessionKeysToClear.forEach((key) => sessionStorage.removeItem(key))

    sessionStorage.setItem(DATA_CLEARED_FLAG, '1')
    sessionStorage.removeItem(WORKER_STORAGE_KEY)
    sessionStorage.removeItem(WORKPLACE_STORAGE_KEY)
    setRows([])
    setActiveRowId(null)
    setIsDataCleared(true)
    setCurrentSelectedWoNumbers([])
  }

  const clearAllDataForBack = () => {
    // Clear table data
    setRows([])
    setActiveRowId(null)

    // Clear all session storage keys
    sessionStorage.removeItem(storedRowsKey)
    sessionStorage.removeItem(sessionKey)
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers')
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_gosen')
    sessionStorage.removeItem(DATA_CLEARED_FLAG)
    sessionStorage.removeItem(WORKER_STORAGE_KEY)
    sessionStorage.removeItem(WORKPLACE_STORAGE_KEY)

    // Clear worker and time fields
    setWorkerCode('')
    setWorkerName('')
    setWorkplaceCode('')
    setWorkplaceName('')
    setWorkStartTime('')
    setWorkEndTime('')
    setWorkDurationHours('')
    setWorkDurationMinutes('')
    setCurrentSelectedWoNumbers([])
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

    if ((Array.isArray(selectedRows) && selectedRows.length > 0) ||
      (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0)) {

      sessionStorage.removeItem(DATA_CLEARED_FLAG)
      setIsDataCleared(false)

      if (Array.isArray(selectedRows) && selectedRows.length > 0) {
        const mappedRows = selectedRows.map((row) => ({
          id: row.id,
          woNo: row.woNumber,
          itemNo: row.itemNumber ?? '',
          itemName: row.itemName ?? '',
        }))

        const woNumbers = selectedWoNumbers ?? mappedRows.map(r => r.woNo)
        setCurrentSelectedWoNumbers(woNumbers)
        sessionStorage.setItem(sessionKey, JSON.stringify(woNumbers))
        setRows(mappedRows)
        saveRowsToStorage(mappedRows)
        setActiveRowId(null)

        navigate(location.pathname, { replace: true, state: null })
        return
      }

      if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
        setCurrentSelectedWoNumbers(selectedWoNumbers)
        sessionStorage.setItem(sessionKey, JSON.stringify(selectedWoNumbers))
        const matchedRows = DEFAULT_ROWS.filter((row) => selectedWoNumbers.includes(row.woNo))
        setRows(matchedRows)
        saveRowsToStorage(matchedRows)
        setActiveRowId(null)

        navigate(location.pathname, { replace: true, state: null })
        return
      }
    }
  }, [location.state, navigate, location.pathname])

  useEffect(() => {
    if (location.state && (location.state as any)?.selectedWoNumbers) {
      return
    }

    if (isDataCleared) return

    const savedRows = sessionStorage.getItem(storedRowsKey)
    if (savedRows) {
      try {
        const parsedRows = JSON.parse(savedRows)
        if (Array.isArray(parsedRows) && parsedRows.length > 0) {
          setRows(parsedRows)
          return
        }
      } catch {
        // ignore invalid stored rows
      }
    }

    const savedSelection = sessionStorage.getItem(sessionKey)
    if (savedSelection) {
      try {
        const parsedSelection = JSON.parse(savedSelection)
        if (Array.isArray(parsedSelection) && parsedSelection.length > 0) {
          setCurrentSelectedWoNumbers(parsedSelection)
          const matchedRows = DEFAULT_ROWS.filter((row) => parsedSelection.includes(row.woNo))
          setRows(matchedRows)
          saveRowsToStorage(matchedRows)
        }
      } catch {
        // ignore invalid stored selection
      }
    }
  }, [isDataCleared, location.state])

  const confirmDeleteSelected = () => {
    if (activeRowId === null) return

    const rowToDelete = rows.find((row) => row.id === activeRowId)
    if (!rowToDelete) return

    const woNumberToDelete = rowToDelete.woNo

    const remainingRows = rows.filter((row) => row.id !== activeRowId)
    setRows(remainingRows)

    const updatedWoNumbers = currentSelectedWoNumbers.filter(
      (wo) => wo !== woNumberToDelete
    )
    setCurrentSelectedWoNumbers(updatedWoNumbers)

    const removeWoNumbers = (storageKey: string) => {
      const saved = sessionStorage.getItem(storageKey)
      if (!saved) return
      try {
        const selected = JSON.parse(saved) as string[]
        const remaining = selected.filter((wo) => wo !== woNumberToDelete)
        if (remaining.length > 0) {
          sessionStorage.setItem(storageKey, JSON.stringify(remaining))
        } else {
          sessionStorage.removeItem(storageKey)
        }
      } catch {
        // ignore parse error
      }
    }

    removeWoNumbers(sessionKey)
    removeWoNumbers('workOrderTimeRegistrationSelectedWoNumbers')
    removeWoNumbers('workOrderTimeRegistrationSelectedWoNumbers_gosen')

    if (remainingRows.length === 0) {
      sessionStorage.removeItem(storedRowsKey)
      sessionStorage.setItem(DATA_CLEARED_FLAG, '1')
      setIsDataCleared(true)
      setCurrentSelectedWoNumbers([])
    } else {
      saveRowsToStorage(remainingRows)
    }

    setActiveRowId(null)
    setShowDeleteSelectedConfirm(false)
  }

  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const handleWorkStartStop = () => {
    if (workStartStopDisabled) return

    setWorkStartStopDisabled(true)
    setTimeout(() => setWorkStartStopDisabled(false), 1200)

    if (workStartStopState === 'idle') {
      const currentTime = getCurrentTime()
      setWorkStartTime(currentTime)
      setWorkStartStopState('started')
    } else if (workStartStopState === 'started') {
      const currentTime = getCurrentTime()
      setWorkEndTime(currentTime)
      updateWorkDuration(workStartTime, currentTime)
      setWorkStartStopState('idle')
    }
  }

  const handleRegister = () => {
    setShowRegisterConfirm(true)
  }

  const confirmRegisterMaintain = () => {
    setRegistrationMode('maintain')
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  const confirmRegisterClear = () => {
    setRegistrationMode('clear')
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  const handleRegisterSuccess = () => {
    if (registrationMode === 'maintain') {
      setWorkerCode('')
      setWorkerName('')
      setWorkplaceCode('')
      setWorkplaceName('')
      setWorkStartTime('')
      setWorkEndTime('')
      setWorkDurationHours('')
      setWorkDurationMinutes('')
      sessionStorage.removeItem(WORKER_STORAGE_KEY)
      sessionStorage.removeItem(WORKPLACE_STORAGE_KEY)
    } else if (registrationMode === 'clear') {
      clearAll()
      setWorkerCode('')
      setWorkerName('')
      setWorkplaceCode('')
      setWorkplaceName('')
      setWorkStartTime('')
      setWorkEndTime('')
      setWorkDurationHours('')
      setWorkDurationMinutes('')
      setActiveRowId(null)
    }
    setShowRegisterSuccessConfirm(false)
    setRegistrationMode(null)
  }

  const updateRowField = (rowId: number, field: keyof Omit<Row, 'id' | 'woNo'>, value: string) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    )
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

  useEffect(() => {
    if (workerCode || workerName) {
      sessionStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify({
        code: workerCode,
        name: workerName
      }))
    } else {
      sessionStorage.removeItem(WORKER_STORAGE_KEY)
    }
  }, [workerCode, workerName])

  useEffect(() => {
    if (workplaceCode || workplaceName) {
      sessionStorage.setItem(WORKPLACE_STORAGE_KEY, JSON.stringify({
        code: workplaceCode,
        name: workplaceName
      }))
    } else {
      sessionStorage.removeItem(WORKPLACE_STORAGE_KEY)
    }
  }, [workplaceCode, workplaceName])

  useEffect(() => {
    updateWorkDuration(workStartTime, workEndTime)
  }, [workStartTime, workEndTime])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'check',
      headClassName: 'col-check',
      cellClassName: 'col-check',
      header: '',
      render: (row) => (
        <div
          className="row-selector"
          onClick={() => setActiveRowId(row.id)}
          style={{ cursor: 'pointer' }}
        >
          {activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null}
        </div>
      ),
    },
    {
      key: 'woNo',
      headClassName: 'col-wo',
      cellClassName: 'col-wo',
      header: 'WoNo',
      render: (row) => row.woNo,
    },
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
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>WO作業時間実績登録</div>
          <div className='set-body'>
            <div className='set-formnew_high '>
              <div className='wot-header-container '>
                {/* Left side: Info Grid */}
                <div className='wot-info-soll box-padding-innput'>
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label '>人</label>
                    <input
                      className='wot-grid-value1'
                      autoFocus
                      ref={parentJanCodeInputRef}
                      value={workerCode}
                      onChange={(e) => setWorkerCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          setWorkerName(getWorkerNameFromCode(e.currentTarget.value))
                        }
                      }}
                    />
                    <input
                      className='wot-grid-value1'
                      readOnly
                      value={workerName}
                      style={{ backgroundColor: '#e5e7eb' }}
                    />
                  </div>

                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label '>日付</label>
                    <div className='hand-date-field-register'>
                      <input
                        readOnly
                        className='wot-grid-value1'
                        value={formatWoDate(woDatePickerValue)}
                        onClick={openWoDatePicker}
                        style={{ cursor: 'pointer' }}
                      />
                      <button
                        type='button'
                        className='hand-date-btn2'
                        aria-label='Choose date'
                        onClick={openWoDatePicker}
                      >
                        <FaRegCalendarAlt />
                      </button>
                      {showWoCalendar && (
                        <div className='hand-calendar' role='dialog' aria-label='Choose date'>
                          <div className='hand-calendar-header'>
                            <button type='button' onClick={() => changeWoCalendarMonth(-1)}>
                              {'<'}
                            </button>
                            <span>{calendarMonthLabel}</span>
                            <button type='button' onClick={() => changeWoCalendarMonth(1)}>
                              {'>'}
                            </button>
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
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
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
                    <label className='wot-grid-label wot-bg-red'>作業場</label>
                    <input
                      className='wot-grid-value1 wot-text-red'
                      value={workplaceCode}
                      onChange={(e) => setWorkplaceCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          setWorkplaceName(getWorkplaceNameFromCode(e.currentTarget.value))
                        }
                      }}
                    />
                    <input
                      className='wot-grid-value1'
                      readOnly
                      value={workplaceName}
                      style={{ backgroundColor: '#e5e7eb' }}
                    />
                  </div>
                </div>

                <div className='wot-radio-container'>
                  <div className='wot-radio-group'>
                    <div className='wot-radio-title'>登録時間種類</div>
                    <div className='wot-radio-items-box'>
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
                    </div>
                    <div className='wot-top-row'>
                      <button
                        className='set-btnnew_high set-primary'
                        onClick={() =>
                          navigate('/factory/work-order-time-registration-choose', {
                            state: {
                              targetPath: '/factory/work-order-time-registration-chiba',
                            },
                          })
                        }
                      >
                        WO選択
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='WorkOrderTimeRegistrationChiba-table'
              gridStyle={gridStyle}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              isRowActive={(rowKey) => activeRowId === Number(rowKey)}
              onRowActivate={(rowKey) => setActiveRowId(Number(rowKey))}
            />

            <div className='wot-footer-summary wot-radio-container'>
              <div className='wot-footer-row'>
                <div className='wot-footer-item'>
                  <label className='wot-footer-label '>開始</label>
                  <input
                    className='wot-grid-value2'
                    type='text'
                    maxLength={5}
                    value={workStartTime}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9:]/g, '')
                      setWorkStartTime(v)
                    }}
                    onClick={() => setShowStartTimePicker(true)}
                    placeholder='--:--'
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
                  <label className='wot-footer-label wot-bg-span-chiba'>終了</label>
                  <input
                    className='wot-grid-value2 wot-grid-value-chiba'
                    type='text'
                    maxLength={5}
                    value={workEndTime}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9:]/g, '')
                      setWorkEndTime(v)
                    }}
                    onClick={() => setShowEndTimePicker(true)}
                    placeholder='--:--'
                  />
                  <label className='wot-footer-label wot-bg-span' style={{ visibility: 'hidden' }}>分</label>

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
                  <label className='wot-footer-label'>作業時間</label>
                  <input
                    className='wot-grid-value2'
                    value={workDurationHours}
                    readOnly
                  />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-span-chiba'>時間</label>
                  <input
                    className='wot-grid-value2 wot-grid-value-chiba'
                    value={workDurationMinutes}
                  />
                  <label className='wot-footer-label wot-bg-span'>分</label>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <ActionFooter columns={5}>
              <button
                className='set-btn set-danger set-delete-btn-size'
                onClick={handleDeleteSelected}
              >
                選択行削除
              </button>

              <button className='set-btn set-primary' onClick={handleRegister}>
                登録
              </button>

              <button
                className='set-btn-footer set-primary'
                style={{ visibility: 'hidden' }}
              >
                {'\u624b\u5165\u529b'}
              </button>

              <button
                className='set-btn set-hand-input-btn'
                onClick={handleWorkStartStop}
                disabled={workStartStopDisabled}
                style={{
                  opacity: workStartStopDisabled ? 0.5 : 1,
                  cursor: workStartStopDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {workStartStopState === 'idle' && '作業開始'}
                {workStartStopState === 'started' && '作業終了'}
              </button>

              <button className='set-btn set-warning' onClick={() => setShowBackConfirm(true)}>
                戻る
              </button>
            </ActionFooter>
          </div>

          {/* Modals */}
          {showDeleteSelectedConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>
                  選択行を削除しますか？
                </div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmDeleteSelected}>
                    OK
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowDeleteSelectedConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRegisterSuccessConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>作業実績を登録しました。</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={handleRegisterSuccess}>
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRegisterConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>
                  作業実績を登録します。<br />WOは維持しますか？
                </div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmRegisterMaintain}>
                    YES
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={confirmRegisterClear}>
                    NO
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={() => {
                    setShowRegisterConfirm(false)
                    parentJanCodeInputRef.current?.focus()
                  }}>
                    取消
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

          {showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>作業実績を登録しました。</div>
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

          {/* Fixed Back Button Modal - Clears ALL data when YES */}
          {showBackConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>
                  メニューに戻ります。
                  <br />
                  読み込みデータを破棄しますか？
                </div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      clearAllDataForBack()
                      setShowBackConfirm(false)
                      navigate('/factory/factory')
                    }}
                  >
                    YES
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => {
                      setShowBackConfirm(false)
                      navigate('/factory/factory')
                    }}
                  >
                    NO
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => {
                      setShowBackConfirm(false)
                      parentJanCodeInputRef.current?.focus()
                    }}
                  >
                    取消
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

export { WorkOrderTimeRegistrationChiba }