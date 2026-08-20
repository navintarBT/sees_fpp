import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'
import { FaRegCalendarAlt, FaRegClock, FaPlay } from 'react-icons/fa'

type Factory = 'gosen' | 'chiba'

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
    hours: hours > 0 ? hours.toString() : '',
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
  targetTime?: string
  acceptedQty?: string
  defectiveQty?: string
  opOrder?: string
  opDesc?: string
  processStatus?: string
  remarks?: string
  isLocked?: boolean
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

const GOSEN_COLUMN_DEFS: Array<{ key: string; header: string }> = [
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

const CHIBA_COLUMN_DEFS: Array<{ key: string; header: string }> = [
  { key: 'check', header: '' },
  { key: 'woNo', header: 'WoNo' },
  { key: 'itemNo', header: '品番' },
  { key: 'itemName', header: '品名' },
]

const measureColumnWidths = (columnDefs: Array<{ key: string; header: string }>, rows: Row[]): React.CSSProperties | undefined => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  ctx.font = '400 28px sans-serif'
  const cellPadding = 36

  const colWidths = columnDefs.map(({ key, header }) => {
    if (key === 'check') return '56px'

    let maxWidth = ctx.measureText(header).width + cellPadding

    for (const row of rows) {
      const text = getColumnTextValue(key, row)
      const w = ctx.measureText(text).width + cellPadding
      if (w > maxWidth) maxWidth = w
    }

    if (columnDefs === CHIBA_COLUMN_DEFS && (key === 'itemNo' || key === 'itemName')) {
      return `minmax(${Math.ceil(maxWidth)}px, 1fr)`
    }

    return `${Math.ceil(maxWidth)}px`
  })

  return { gridTemplateColumns: colWidths.join(' ') }
}

// Gosen master data
const MASTER_WORK_ORDERS: Record<string, Partial<Row>> = {
  'wo-1': { woNo: 'wo-1', itemNo: 'a', itemName: '製品a', targetTime: '50', acceptedQty: '9', defectiveQty: '1', opDesc: '研磨3', remarks: '' },
  'wo-2': { woNo: 'wo-2', itemNo: 'b', itemName: '製品b', targetTime: '50', acceptedQty: '3', defectiveQty: '', opDesc: '研磨3', remarks: '' },
  'wo-3': { woNo: 'wo-3', itemNo: 'c', itemName: '製品c', targetTime: '', acceptedQty: '', defectiveQty: '', opDesc: '研磨3', remarks: '' },
  'wo-4': { woNo: 'wo-4', itemNo: 'd', itemName: '製品d', targetTime: '9', acceptedQty: '', defectiveQty: '', opDesc: '研磨3', remarks: '' },
  'wo-5': { woNo: 'wo-5', itemNo: 'e', itemName: '製品e', targetTime: '10', acceptedQty: '', defectiveQty: '', opDesc: '研磨3', remarks: '' },
  'wo-6': { woNo: 'wo-6', itemNo: 'f', itemName: '製品f', targetTime: '15', acceptedQty: '', defectiveQty: '', opDesc: '研磨3', remarks: '' },
}

const fetchWorkOrderDetails = async (woNo: string): Promise<Partial<Row> | null> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MASTER_WORK_ORDERS[woNo] || null
}

const calculateTotalTargetTime = (rows: Row[]): { hours: string; minutes: string; totalMinutes: number } => {
  let totalMinutes = 0
  for (const row of rows) {
    if (row.targetTime && row.targetTime !== '') {
      const minutes = parseInt(row.targetTime, 10)
      if (!isNaN(minutes)) {
        totalMinutes += minutes
      }
    }
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return {
    hours: hours > 0 ? hours.toString() : '',
    minutes: minutes > 0 ? minutes.toString() : '',
    totalMinutes: totalMinutes,
  }
}

// Chiba default rows (from WO検索 chooser)
const DEFAULT_ROWS: Row[] = [
  { id: 1, woNo: 'WO-001', itemNo: 'PRD-001', itemName: '製品A' },
  { id: 2, woNo: 'WO-002', itemNo: 'PRD-002', itemName: '製品B' },
  { id: 3, woNo: 'WO-003', itemNo: 'PRD-003', itemName: '製品C' },
  { id: 4, woNo: 'WO-004', itemNo: 'PRD-004', itemName: '製品D' },
  { id: 5, woNo: 'WO-005', itemNo: 'PRD-005', itemName: '製品E' },
]

const createEmptyRow = (id?: number, isLocked: boolean = false, rows: Row[] = []): Row => {
  const maxId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) : 0
  return {
    id: id || maxId + 1,
    woNo: '',
    itemNo: '',
    itemName: '',
    targetTime: '',
    acceptedQty: '',
    defectiveQty: '',
    opOrder: '',
    opDesc: '',
    processStatus: '',
    remarks: '',
    isLocked,
  }
}

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

const WorkOrderTimeRegistration = ({ factory }: { factory: Factory }) => {
  const isGosen = factory === 'gosen'
  const isChiba = factory === 'chiba'

  const navigate = useNavigate()
  const location = useLocation()

  // ---- shared state ----
  const [rows, setRows] = useState<Row[]>([])
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const todayValue = toDateValue(new Date())
  const [woDatePickerValue, setWoDatePickerValue] = useState(todayValue)
  const [showWoCalendar, setShowWoCalendar] = useState(false)
  const [woCalendarMonth, setWoCalendarMonth] = useState(() => parseDateValue(todayValue))
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [workStartTime, setWorkStartTime] = useState('')
  const [workEndTime, setWorkEndTime] = useState('')
  const [workDurationHours, setWorkDurationHours] = useState('')
  const [workDurationMinutes, setWorkDurationMinutes] = useState('')
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
  const [showRegisterSuccessConfirm, setShowRegisterSuccessConfirm] = useState(false)
  const [workerCode, setWorkerCode] = useState('')
  const [workerName, setWorkerName] = useState('')
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const parentJanCodeInputRef = useRef<HTMLInputElement | null>(null)

  // ---- gosen-only state ----
  const [fetchingWoNos, setFetchingWoNos] = useState<Set<string>>(new Set())
  const [totalTargetTimeDisplay, setTotalTargetTimeDisplay] = useState({ hours: '', minutes: '' })
  const [defaultOpOrder, setDefaultOpOrder] = useState('')
  const [defaultProcessStatus, setDefaultProcessStatus] = useState('')
  const [defaultRemarks, setDefaultRemarks] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const showWorkStartButton = false

  // ---- chiba-only state ----
  const storedRowsKeyChiba = 'workOrderTimeRegistrationChibaRows'
  const sessionKeyChiba = 'workOrderTimeRegistrationSelectedWoNumbers_chiba'
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [registrationMode, setRegistrationMode] = useState<'maintain' | 'clear' | null>(null)
  const [workStartStopState, setWorkStartStopState] = useState<'idle' | 'started'>('idle')
  const [workStartStopDisabled, setWorkStartStopDisabled] = useState(false)
  const DATA_CLEARED_FLAG = 'workOrderTimeRegistrationChibaCleared'
  const [isDataCleared, setIsDataCleared] = useState(
    () => sessionStorage.getItem(DATA_CLEARED_FLAG) === '1',
  )
  const WORKER_STORAGE_KEY = 'workOrderTimeRegistrationChiba_worker'
  const WORKPLACE_STORAGE_KEY = 'workOrderTimeRegistrationChiba_workplace'
  const [workplaceCode, setWorkplaceCode] = useState('')
  const [workplaceName, setWorkplaceName] = useState('')
  const [currentSelectedWoNumbers, setCurrentSelectedWoNumbers] = useState<string[]>([])

  // Chiba restores worker/workplace from sessionStorage on mount
  useEffect(() => {
    if (!isChiba) return
    const savedWorker = sessionStorage.getItem(WORKER_STORAGE_KEY)
    if (savedWorker) {
      try {
        const parsed = JSON.parse(savedWorker)
        setWorkerCode(parsed.code || '')
        setWorkerName(parsed.name || '')
      } catch { /* ignore */ }
    }
    const savedWorkplace = sessionStorage.getItem(WORKPLACE_STORAGE_KEY)
    if (savedWorkplace) {
      try {
        const parsed = JSON.parse(savedWorkplace)
        setWorkplaceCode(parsed.code || '')
        setWorkplaceName(parsed.name || '')
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChiba])

  const columnDefs = isGosen ? GOSEN_COLUMN_DEFS : CHIBA_COLUMN_DEFS
  const gridStyle = useMemo(() => measureColumnWidths(columnDefs, rows), [columnDefs, rows])

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

  const getWorkerNameFromCodeGosen = (code: string) => {
    switch (code.trim()) {
      case 'XXXXX': return '作業者X'
      case 'YYYYY': return '作業者Y'
      case 'ZZZZZ': return '作業者Z'
      default: return ''
    }
  }

  const getWorkerNameFromCodeChiba = (code: string) => {
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

  const handleDeleteSelected = () => {
    if (activeRowId === null) {
      setShowNoSelectionConfirm(true)
      return
    }
    setShowDeleteSelectedConfirm(true)
  }

  // ---- gosen: row persistence & clearing ----
  const saveRowsToStorageGosen = (rowsToSave: Row[]) => {
    sessionStorage.setItem('workOrderTimeRegistrationGosenRows', JSON.stringify(rowsToSave))
  }

  const clearAllDataGosen = () => {
    const emptyRow = createEmptyRow(1, false, rows)
    setRows([emptyRow])
    saveRowsToStorageGosen([emptyRow])

    sessionStorage.removeItem('workOrderTimeRegistrationGosenRows')
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers')
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_chiba')
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_gosen')

    setWorkerCode('')
    setWorkerName('')
    setWorkStartTime('')
    setWorkEndTime('')
    setWorkDurationHours('')
    setWorkDurationMinutes('')
    setActiveRowId(null)
    setTotalTargetTimeDisplay({ hours: '', minutes: '' })

    setDefaultOpOrder('')
    setDefaultProcessStatus('')
    setDefaultRemarks('')
  }

  const ensureEmptyRowAtEnd = (currentRows: Row[]): Row[] => {
    if (currentRows.length === 0) {
      return [createEmptyRow(1, false, currentRows)]
    }

    const lastRow = currentRows[currentRows.length - 1]
    const isLastRowEmpty = !lastRow.woNo && !lastRow.itemNo && !lastRow.itemName

    if (!isLastRowEmpty) {
      const nextId = Math.max(...currentRows.map(r => r.id), 0) + 1
      return [...currentRows, createEmptyRow(nextId, false, currentRows)]
    }

    return currentRows
  }

  const confirmDeleteSelectedGosen = () => {
    if (activeRowId === null) return

    const rowToDelete = rows.find(row => row.id === activeRowId)
    const woNumberToDelete = rowToDelete?.woNo

    let nextRows = rows.filter((row) => row.id !== activeRowId)
    nextRows = ensureEmptyRowAtEnd(nextRows)
    setRows(nextRows)
    saveRowsToStorageGosen(nextRows)

    const savedWos = sessionStorage.getItem('workOrderTimeRegistrationSelectedWoNumbers')
    if (savedWos && woNumberToDelete) {
      try {
        const selectedWoNumbers = JSON.parse(savedWos) as string[]
        const remainingWoNumbers = selectedWoNumbers.filter(wo => wo !== woNumberToDelete)
        if (remainingWoNumbers.length > 0) {
          sessionStorage.setItem('workOrderTimeRegistrationSelectedWoNumbers', JSON.stringify(remainingWoNumbers))
        } else {
          sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers')
        }
      } catch { /* ignore */ }
    }

    setActiveRowId(null)
    setShowDeleteSelectedConfirm(false)

    const total = calculateTotalTargetTime(nextRows)
    setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
  }

  const clearAllGosen = () => {
    const emptyRow = createEmptyRow(1, false, rows)
    setRows([emptyRow])
    saveRowsToStorageGosen([emptyRow])
    setActiveRowId(null)
    setTotalTargetTimeDisplay({ hours: '', minutes: '' })
  }

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  const handleRegisterGosen = () => setShowRegisterConfirm(true)

  const confirmRegisterClearGosen = () => {
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  const handleRegisterSuccessGosen = () => {
    clearAllDataGosen()
    setShowRegisterSuccessConfirm(false)
  }

  const applyRemarksToAllRows = () => {
    setRows((prevRows) => {
      const hasDataRow = prevRows.some((row) => row.woNo.trim() !== '')
      if (!hasDataRow) return prevRows

      const nextRows = prevRows.map((row) =>
        row.woNo.trim() !== '' ? { ...row, remarks: defaultRemarks } : row
      )
      saveRowsToStorageGosen(nextRows)
      return nextRows
    })
  }

  const updateEditableField = (rowId: number, field: keyof Row, value: string) => {
    setRows((prevRows) => {
      const nextRows = prevRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
      saveRowsToStorageGosen(nextRows)
      return nextRows
    })
  }

  const handleWoNoKeyDown = async (rowId: number, currentWoNo: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const woNoToFetch = currentWoNo.trim().toLowerCase()

      if (woNoToFetch === '') return

      const currentRow = rows.find(r => r.id === rowId)
      if (currentRow?.isLocked) return

      if (fetchingWoNos.has(woNoToFetch)) return

      setFetchingWoNos(prev => new Set(prev).add(woNoToFetch))

      const details = await fetchWorkOrderDetails(woNoToFetch)

      setFetchingWoNos(prev => {
        const newSet = new Set(prev)
        newSet.delete(woNoToFetch)
        return newSet
      })

      if (details) {
        setRows((prevRows) => {
          const nextRows = prevRows.map((row) =>
            row.id === rowId
              ? {
                ...row,
                ...details,
                woNo: woNoToFetch,
                opOrder: defaultOpOrder || details.opOrder,
                processStatus: defaultProcessStatus || details.processStatus,
                remarks: defaultRemarks || details.remarks,
                isLocked: true,
                id: row.id,
              }
              : row
          )
          const cleanedRows = ensureEmptyRowAtEnd(nextRows)
          saveRowsToStorageGosen(cleanedRows)

          const total = calculateTotalTargetTime(cleanedRows)
          setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })

          return cleanedRows
        })
      }
    }
  }

  const addNewRow = () => {
    const newId = Math.max(...rows.map(r => r.id), 0) + 1
    const newRow = createEmptyRow(newId, false, rows)
    setRows(prev => [...prev, newRow])
  }

  useEffect(() => {
    if (!isGosen) return
    const total = calculateTotalTargetTime(rows)
    setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGosen, rows])

  // Gosen: load data from location.state or sessionStorage
  useEffect(() => {
    if (!isGosen) return

    const state = location.state as {
      selectedWoNumbers?: string[]
      selectedRows?: Array<{ id: number; woNumber: string; itemNumber?: string; itemName?: string }>
    } | null

    const selectedWoNumbers = state?.selectedWoNumbers
    const selectedRows = state?.selectedRows

    if (Array.isArray(selectedRows) && selectedRows.length > 0) {
      const mappedRows: Row[] = selectedRows.map((row, index) => ({
        id: row.id || index + 1,
        woNo: row.woNumber.toLowerCase(),
        itemNo: row.itemNumber ?? '',
        itemName: row.itemName ?? '',
        targetTime: '',
        acceptedQty: '',
        defectiveQty: '',
        opOrder: defaultOpOrder,
        opDesc: '',
        processStatus: defaultProcessStatus,
        remarks: defaultRemarks,
        isLocked: true,
      }))

      const fetchAllDetails = async () => {
        const updatedRows = await Promise.all(
          mappedRows.map(async (row) => {
            if (row.woNo && MASTER_WORK_ORDERS[row.woNo]) {
              return {
                ...row,
                ...MASTER_WORK_ORDERS[row.woNo],
                opOrder: defaultOpOrder || MASTER_WORK_ORDERS[row.woNo]?.opOrder,
                processStatus: defaultProcessStatus || MASTER_WORK_ORDERS[row.woNo]?.processStatus,
                remarks: defaultRemarks || MASTER_WORK_ORDERS[row.woNo]?.remarks,
                id: row.id,
                isLocked: true,
              }
            }
            return row
          })
        )
        const rowsWithEmpty = [...updatedRows, createEmptyRow(updatedRows.length + 1, false, updatedRows)]
        setRows(rowsWithEmpty)
        saveRowsToStorageGosen(rowsWithEmpty)
        const total = calculateTotalTargetTime(rowsWithEmpty)
        setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
      }

      fetchAllDetails()
      if (selectedWoNumbers) {
        sessionStorage.setItem('workOrderTimeRegistrationSelectedWoNumbers', JSON.stringify(selectedWoNumbers))
      }
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
      sessionStorage.setItem('workOrderTimeRegistrationSelectedWoNumbers', JSON.stringify(selectedWoNumbers))

      const mappedRows: Row[] = selectedWoNumbers.map((woNo, index) => {
        const normalizedWoNo = woNo.toLowerCase()
        const masterData = MASTER_WORK_ORDERS[normalizedWoNo]
        if (masterData) {
          return {
            id: index + 1,
            ...masterData,
            opOrder: defaultOpOrder || masterData.opOrder,
            processStatus: defaultProcessStatus || masterData.processStatus,
            remarks: defaultRemarks || masterData.remarks,
            isLocked: true,
          } as Row
        }
        return {
          id: index + 1,
          woNo: normalizedWoNo,
          itemNo: '',
          itemName: '',
          targetTime: '',
          acceptedQty: '',
          defectiveQty: '',
          opOrder: defaultOpOrder,
          opDesc: '',
          processStatus: defaultProcessStatus,
          remarks: defaultRemarks,
          isLocked: true,
        }
      })

      const rowsWithEmpty = [...mappedRows, createEmptyRow(mappedRows.length + 1, false, mappedRows)]
      setRows(rowsWithEmpty)
      saveRowsToStorageGosen(rowsWithEmpty)
      const total = calculateTotalTargetTime(rowsWithEmpty)
      setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    const savedRows = sessionStorage.getItem('workOrderTimeRegistrationGosenRows')
    if (savedRows) {
      try {
        const parsedRows = JSON.parse(savedRows)
        if (Array.isArray(parsedRows) && parsedRows.length > 0) {
          setRows(parsedRows)
          const total = calculateTotalTargetTime(parsedRows)
          setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
          return
        }
      } catch { /* ignore */ }
    }

    setRows([createEmptyRow(1, false, [])])
    setTotalTargetTimeDisplay({ hours: '', minutes: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGosen, location.state, navigate, location.pathname])

  // ---- chiba: row persistence & clearing ----
  const saveRowsToStorageChiba = (rowsToSave: Row[]) => {
    if (rowsToSave.length === 0 || (rowsToSave.length === 1 && !rowsToSave[0].woNo)) {
      sessionStorage.removeItem(storedRowsKeyChiba)
    } else {
      sessionStorage.setItem(storedRowsKeyChiba, JSON.stringify(rowsToSave))
    }
  }

  const clearAllChiba = () => {
    const sessionKeysToClear = [
      storedRowsKeyChiba,
      'workOrderTimeRegistrationSelectedWoNumbers',
      sessionKeyChiba,
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

  const clearAllDataForBackChiba = () => {
    setRows([])
    setActiveRowId(null)

    sessionStorage.removeItem(storedRowsKeyChiba)
    sessionStorage.removeItem(sessionKeyChiba)
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers')
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_gosen')
    sessionStorage.removeItem(DATA_CLEARED_FLAG)
    sessionStorage.removeItem(WORKER_STORAGE_KEY)
    sessionStorage.removeItem(WORKPLACE_STORAGE_KEY)

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
    if (!isChiba) return

    const state = location.state as {
      selectedWoNumbers?: string[]
      selectedRows?: Array<{ id: number; woNumber: string; itemNumber?: string; itemName?: string; orderQuantity?: number }>
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
        sessionStorage.setItem(sessionKeyChiba, JSON.stringify(woNumbers))
        setRows(mappedRows)
        saveRowsToStorageChiba(mappedRows)
        setActiveRowId(null)

        navigate(location.pathname, { replace: true, state: null })
        return
      }

      if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
        setCurrentSelectedWoNumbers(selectedWoNumbers)
        sessionStorage.setItem(sessionKeyChiba, JSON.stringify(selectedWoNumbers))
        const matchedRows = DEFAULT_ROWS.filter((row) => selectedWoNumbers.includes(row.woNo))
        setRows(matchedRows)
        saveRowsToStorageChiba(matchedRows)
        setActiveRowId(null)

        navigate(location.pathname, { replace: true, state: null })
        return
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChiba, location.state, navigate, location.pathname])

  useEffect(() => {
    if (!isChiba) return
    if (location.state && (location.state as { selectedWoNumbers?: string[] })?.selectedWoNumbers) {
      return
    }

    if (isDataCleared) return

    const savedRows = sessionStorage.getItem(storedRowsKeyChiba)
    if (savedRows) {
      try {
        const parsedRows = JSON.parse(savedRows)
        if (Array.isArray(parsedRows) && parsedRows.length > 0) {
          setRows(parsedRows)
          return
        }
      } catch { /* ignore invalid stored rows */ }
    }

    const savedSelection = sessionStorage.getItem(sessionKeyChiba)
    if (savedSelection) {
      try {
        const parsedSelection = JSON.parse(savedSelection)
        if (Array.isArray(parsedSelection) && parsedSelection.length > 0) {
          setCurrentSelectedWoNumbers(parsedSelection)
          const matchedRows = DEFAULT_ROWS.filter((row) => parsedSelection.includes(row.woNo))
          setRows(matchedRows)
          saveRowsToStorageChiba(matchedRows)
          return
        }
      } catch { /* ignore invalid stored selection */ }
    }

    setRows([createEmptyRow(1, false, [])])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChiba, isDataCleared, location.state])

  const confirmDeleteSelectedChiba = () => {
    if (activeRowId === null) return

    const rowToDelete = rows.find((row) => row.id === activeRowId)
    if (!rowToDelete) return

    const woNumberToDelete = rowToDelete.woNo

    const remainingRows = rows.filter((row) => row.id !== activeRowId)
    setRows(remainingRows)

    const updatedWoNumbers = currentSelectedWoNumbers.filter((wo) => wo !== woNumberToDelete)
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
      } catch { /* ignore parse error */ }
    }

    removeWoNumbers(sessionKeyChiba)
    removeWoNumbers('workOrderTimeRegistrationSelectedWoNumbers')
    removeWoNumbers('workOrderTimeRegistrationSelectedWoNumbers_gosen')

    if (remainingRows.length === 0) {
      sessionStorage.removeItem(storedRowsKeyChiba)
      sessionStorage.setItem(DATA_CLEARED_FLAG, '1')
      setIsDataCleared(true)
      setCurrentSelectedWoNumbers([])
    } else {
      saveRowsToStorageChiba(remainingRows)
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

  const handleRegisterChiba = () => setShowRegisterConfirm(true)

  const confirmRegisterMaintainChiba = () => {
    setRegistrationMode('maintain')
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  const confirmRegisterClearChiba = () => {
    setRegistrationMode('clear')
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  const handleRegisterSuccessChiba = () => {
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
      clearAllChiba()
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

  const updateRowField = (rowId: number, field: 'itemNo' | 'itemName', value: string) => {
    setRows((prevRows) => prevRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)))
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
    if (!isChiba) return
    if (workerCode || workerName) {
      sessionStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify({ code: workerCode, name: workerName }))
    } else {
      sessionStorage.removeItem(WORKER_STORAGE_KEY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChiba, workerCode, workerName])

  useEffect(() => {
    if (!isChiba) return
    if (workplaceCode || workplaceName) {
      sessionStorage.setItem(WORKPLACE_STORAGE_KEY, JSON.stringify({ code: workplaceCode, name: workplaceName }))
    } else {
      sessionStorage.removeItem(WORKPLACE_STORAGE_KEY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChiba, workplaceCode, workplaceName])

  useEffect(() => {
    if (!isChiba) return
    updateWorkDuration(workStartTime, workEndTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChiba, workStartTime, workEndTime])

  // ---- table columns ----
  const gosenTableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'check', headClassName: 'col-arrow-head', cellClassName: 'col-arrow', header: '',
      render: (row) => (
        <div className='row-selector' onClick={() => setActiveRowId(row.id)} style={{ cursor: 'pointer' }}>
          {activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null}
        </div>
      ),
    },
    {
      key: 'woNo', headClassName: 'col-wo', cellClassName: 'col-wo', header: 'WoNo',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.woNo}
          readOnly={row.isLocked === true}
          style={row.isLocked ? { backgroundColor: '#d9d9d9' } : {}}
          onChange={(e) => {
            if (!row.isLocked) {
              setRows((prevRows) => prevRows.map((r) => (r.id === row.id ? { ...r, woNo: e.target.value } : r)))
            }
          }}
          onKeyDown={(e) => {
            if (!row.isLocked) handleWoNoKeyDown(row.id, e.currentTarget.value, e)
          }}
          onBlur={() => {
            const lastRow = rows[rows.length - 1]
            if (lastRow.woNo && lastRow.id === row.id && !lastRow.isLocked) addNewRow()
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'itemNo', headClassName: 'col-item-no', cellClassName: 'col-item-no', header: '品番',
      render: (row) => <input type='text' className='table-cell-input' value={row.itemNo} readOnly onClick={(e) => e.stopPropagation()} />,
    },
    {
      key: 'itemName', headClassName: 'col-item-name', cellClassName: 'col-item-name', header: '品名',
      render: (row) => <input type='text' className='table-cell-input' value={row.itemName} readOnly onClick={(e) => e.stopPropagation()} />,
    },
    {
      key: 'targetTime', headClassName: 'col-target-time', cellClassName: 'col-target-time col-text-purple', header: '目標時間',
      render: (row) => <input type='text' className='table-cell-input' value={row.targetTime ?? ''} readOnly onClick={(e) => e.stopPropagation()} />,
    },
    {
      key: 'acceptedQty', headClassName: 'col-qty', cellClassName: 'col-qty', header: '合格数',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.acceptedQty ?? ''} onChange={(e) => updateEditableField(row.id, 'acceptedQty', e.target.value)} onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      key: 'defectiveQty', headClassName: 'col-qty', cellClassName: 'col-qty', header: '不良数',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.defectiveQty ?? ''} onChange={(e) => updateEditableField(row.id, 'defectiveQty', e.target.value)} onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      key: 'opOrder', headClassName: 'col-op', cellClassName: 'col-op', header: '作業順序',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.opOrder ?? ''} onChange={(e) => updateEditableField(row.id, 'opOrder', e.target.value)} onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      key: 'opDesc', headClassName: 'col-op', cellClassName: 'col-op', header: '作業記述',
      render: (row) => <input type='text' className='table-cell-input' value={row.opDesc ?? ''} readOnly onClick={(e) => e.stopPropagation()} />,
    },
    {
      key: 'processStatus', headClassName: 'col-process', cellClassName: 'col-process', header: '工程状況',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.processStatus ?? ''} onChange={(e) => updateEditableField(row.id, 'processStatus', e.target.value)} onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      key: 'remarks', headClassName: 'col-remarks', cellClassName: 'col-remarks', header: '備考',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.remarks ?? ''} onChange={(e) => updateEditableField(row.id, 'remarks', e.target.value)} onClick={(e) => e.stopPropagation()} />
      ),
    },
  ]

  const chibaTableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'check', headClassName: 'col-arrow-head', cellClassName: 'col-arrow', header: '',
      render: (row) => (
        <div className='row-selector' onClick={() => setActiveRowId(row.id)} style={{ cursor: 'pointer' }}>
          {activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null}
        </div>
      ),
    },
    { key: 'woNo', headClassName: 'col-wo', cellClassName: 'col-wo', header: 'WoNo', render: (row) => row.woNo },
    {
      key: 'itemNo', headClassName: 'col-item-no', cellClassName: 'col-item-no', header: '品番',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.itemNo} onChange={(e) => updateRowField(row.id, 'itemNo', e.target.value)} onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      key: 'itemName', headClassName: 'col-item-name', cellClassName: 'col-item-name', header: '品名',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.itemName} onChange={(e) => updateRowField(row.id, 'itemName', e.target.value)} onClick={(e) => e.stopPropagation()} />
      ),
    },
  ]

  const tableColumns = isGosen ? gosenTableColumns : chibaTableColumns

  const handleDeleteSelected_ = handleDeleteSelected
  const confirmDeleteSelected = isGosen ? confirmDeleteSelectedGosen : confirmDeleteSelectedChiba
  const handleRegister = isGosen ? handleRegisterGosen : handleRegisterChiba
  const handleBackYes = () => {
    if (isGosen) clearAllDataGosen()
    else clearAllDataForBackChiba()
    setShowBackConfirm(false)
    navigate('/factory/factory')
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>WO作業時間実績登録</div>
          <div className='set-body'>
            <div className='set-formnew_high '>
              <div className='wot-header-container '>
                <div className='wot-info-soll box-padding-innput'>
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className={`wot-grid-label${isGosen ? ' wot-bg-blue' : ' '}`}>日付</label>
                    <div className='hand-date-field-register'>
                      <input
                        readOnly
                        className='wot-grid-value1'
                        value={formatWoDate(woDatePickerValue)}
                        onClick={openWoDatePicker}
                        style={{ cursor: 'pointer' }}
                      />
                      <button type='button' className='hand-date-btn2' aria-label='Choose date' onClick={openWoDatePicker}>
                        <FaRegCalendarAlt />
                      </button>
                      {showWoCalendar && (
                        <div className='hand-calendar hand-calendar-gosen' role='dialog' aria-label='Choose date'>
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
                                className={['hand-calendar-day', inMonth ? '' : 'hand-calendar-muted', value === woDatePickerValue ? 'hand-calendar-selected' : ''].filter(Boolean).join(' ')}
                                onClick={() => selectWoDate(value)}
                              >
                                {date.getDate()}
                              </button>
                            ))}
                          </div>
                          <div className='hand-calendar-footer'>
                            <button type='button' className='hand-calendar-btn-today' onClick={() => selectWoDate(toDateValue(new Date()))}>今日</button>
                            <button type='button' className='hand-calendar-btn-clear' onClick={() => selectWoDate('')}>クリア</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className={`wot-grid-label${isGosen ? ' wot-bg-blue' : ' '}`}>人</label>
                    <input
                      className='wot-grid-value1'
                      autoFocus
                      ref={parentJanCodeInputRef}
                      value={workerCode}
                      onChange={(e) => setWorkerCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          setWorkerName(isGosen ? getWorkerNameFromCodeGosen(e.currentTarget.value) : getWorkerNameFromCodeChiba(e.currentTarget.value))
                        }
                      }}
                    />
                    <input className='wot-grid-value1' style={{ backgroundColor: '#d9d9d9', outline: 'none' }} value={workerName} readOnly />
                  </div>

                  {isGosen ? (
                    <>
                      <div className='wot-info-grid wot-info-grid-2'>
                        <label className='wot-grid-label wot-bg-red'>工程状況初期値</label>
                        <input className='wot-grid-value1 wot-text-red' value={defaultProcessStatus} onChange={(e) => setDefaultProcessStatus(e.target.value)} />
                      </div>
                      <div className='wot-info-grid wot-info-grid-2'>
                        <label className='wot-grid-label wot-bg-red'>作業順序</label>
                        <input className='wot-grid-value1 wot-text-red' value={defaultOpOrder} onChange={(e) => setDefaultOpOrder(e.target.value)} />
                      </div>
                      <div className='wot-info-grid wot-info-grid-2'>
                        <label className='wot-grid-label wot-bg-red'>備考</label>
                        <input className='wot-grid-value1 wot-text-red' value={defaultRemarks} onChange={(e) => setDefaultRemarks(e.target.value)} />
                        <button type='button' className='set-btnnew_high set-primary wot-bulk-apply-btn' onClick={applyRemarksToAllRows}>一括反映</button>
                      </div>
                    </>
                  ) : (
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
                      <input className='wot-grid-value1' readOnly value={workplaceName} style={{ backgroundColor: '#d9d9d9', outline: 'none' }} />
                    </div>
                  )}
                </div>

                {isGosen ? (
                  <div className='wot-header-actions'>
                    <div className='wot-radio-container'>
                      <div className='wot-radio-group'>
                        <div className='wot-radio-title'>登録時間種類</div>
                        <div className='wot-radio-items-box'>
                          <label className='wot-radio-item'><input type='radio' name='timeType' defaultChecked /><span>労務</span></label>
                          <label className='wot-radio-item'><input type='radio' name='timeType' /><span>段取</span></label>
                          <label className='wot-radio-item'><input type='radio' name='timeType' /><span>機械</span></label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='wot-radio-container'>
                    <div className='wot-radio-group'>
                      <div className='wot-radio-title'>登録時間種類</div>
                      <div className='wot-radio-items-box'>
                        <label className='wot-radio-item'><input type='radio' name='timeType' defaultChecked /><span>労務</span></label>
                        <label className='wot-radio-item'><input type='radio' name='timeType' /><span>段取</span></label>
                        <label className='wot-radio-item'><input type='radio' name='timeType' /><span>機械</span></label>
                      </div>
                      <div className='wot-top-row'>
                        <button
                          className='set-btnnew_high set-primary'
                          onClick={() => navigate('/factory/work-order-time-registration-choose', {
                            state: { targetPath: '/factory/work-order-time-registration-chiba' },
                          })}
                        >
                          WO検索
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName={isGosen ? 'delivery-table' : 'WorkOrderTimeRegistrationChiba-table'}
              gridStyle={gridStyle}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              isRowActive={(rowKey) => activeRowId === Number(rowKey)}
              onRowActivate={(rowKey) => setActiveRowId(Number(rowKey))}
            />

            {isGosen ? (
              <div className='wot-footer-summary wot-radio-container'>
                <div className='wot-footer-row'>
                  <div className='wot-footer-item'>
                    <label className='wot-footer-label '>作業時間</label>
                    <input className='wot-grid-value2 ' />
                  </div>
                  <div className='wot-footer-item'>
                    <label className='wot-footer-label wot-bg-span2'>時間</label>
                    <input className='wot-grid-value2 wot-grid-value3' />
                    <label className='wot-footer-label wot-bg-span'>分</label>
                  </div>
                  <div className='wot-footer-item'>
                    <label className='wot-footer-label'>目標時間計</label>
                    <input className='wot-grid-value2' style={{ backgroundColor: '#d9d9d9', outline: 'none' }} value={totalTargetTimeDisplay.hours} readOnly />
                  </div>
                  <div className='wot-footer-item'>
                    <label className='wot-footer-label wot-bg-span2'>時間</label>
                    <input className='wot-grid-value2 wot-grid-value3' style={{ backgroundColor: '#d9d9d9', outline: 'none' }} value={totalTargetTimeDisplay.minutes} readOnly />
                    <label className='wot-footer-label wot-bg-span'>分</label>
                  </div>
                </div>
              </div>
            ) : (
              <div className='wot-footer-summary wot-radio-container'>
                <div className='wot-footer-row'>
                  <div className='wot-footer-item'>
                    <label className='wot-footer-label '>開始</label>
                    <input
                      className='wot-grid-value2'
                      type='text'
                      maxLength={5}
                      value={workStartTime}
                      onChange={(e) => setWorkStartTime(e.target.value.replace(/[^0-9:]/g, ''))}
                      onClick={() => setShowStartTimePicker(true)}
                      placeholder='--:--'
                    />
                    <button type='button' className='hand-date-btn2' aria-label='Choose time' onClick={() => setShowStartTimePicker(!showStartTimePicker)}>
                      <FaRegClock />
                    </button>
                    {showStartTimePicker && (
                      <TimePickerDropdown value={workStartTime} onChange={setWorkStartTime} onClose={() => setShowStartTimePicker(false)} />
                    )}
                  </div>

                  <div className='wot-footer-item'>
                    <label className='wot-footer-label wot-bg-span-chiba'>終了</label>
                    <input
                      className='wot-grid-value2 wot-grid-value-chiba'
                      type='text'
                      maxLength={5}
                      value={workEndTime}
                      onChange={(e) => setWorkEndTime(e.target.value.replace(/[^0-9:]/g, ''))}
                      onClick={() => setShowEndTimePicker(true)}
                      placeholder='--:--'
                    />
                    <label className='wot-footer-label wot-bg-span' style={{ visibility: 'hidden' }}>分</label>
                    <button type='button' className='hand-date-btn' aria-label='Choose time' onClick={() => setShowEndTimePicker(!showEndTimePicker)}>
                      <FaRegClock />
                    </button>
                    {showEndTimePicker && (
                      <TimePickerDropdown value={workEndTime} onChange={setWorkEndTime} onClose={() => setShowEndTimePicker(false)} />
                    )}
                  </div>

                  <div className='wot-footer-item'>
                    <label className='wot-footer-label'>作業時間</label>
                    <input className='wot-grid-value2' value={workDurationHours} readOnly />
                  </div>

                  <div className='wot-footer-item'>
                    <label className='wot-footer-label wot-bg-span-chiba'>時間</label>
                    <input className='wot-grid-value2 wot-grid-value-chiba' value={workDurationMinutes} />
                    <label className='wot-footer-label wot-bg-span'>分</label>
                  </div>
                </div>
              </div>
            )}

            <ActionFooter columns={5}>
              <button className='set-btn set-danger set-delete-btn-size' onClick={handleDeleteSelected_}>選択行削除</button>
              <button className='set-btn set-primary' onClick={handleRegister}>登録</button>
              <button className='set-btn-footer set-primary' style={{ visibility: 'hidden' }}>手入力</button>

              {isGosen ? (
                <div>
                  <button className='set-btn set-hand-input-btn' onClick={() => { }} style={{ display: showWorkStartButton ? undefined : 'none' }}>作業開始</button>
                </div>
              ) : (
                <button
                  className='set-btn set-hand-input-btn'
                  onClick={handleWorkStartStop}
                  disabled={workStartStopDisabled}
                  style={{ opacity: workStartStopDisabled ? 0.5 : 1, cursor: workStartStopDisabled ? 'not-allowed' : 'pointer' }}
                >
                  {workStartStopState === 'idle' && '作業開始'}
                  {workStartStopState === 'started' && '作業終了'}
                </button>
              )}

              <button className='set-btn set-warning' onClick={() => setShowBackConfirm(true)}>戻る</button>
            </ActionFooter>
          </div>

          {showDeleteSelectedConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択行を削除しますか？</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmDeleteSelected}>OK</button>
                  <button className='set-modal-btn set-modal-no' onClick={() => setShowDeleteSelectedConfirm(false)}>Cancel</button>
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
                  <button className='set-modal-btn set-modal-yes' onClick={() => setShowNoSelectionConfirm(false)}>OK</button>
                </div>
              </div>
            </div>
          )}

          {isGosen && showClearConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'読み込みデータを破棄します。\n宜しいですか？'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={() => { setShowClearConfirm(false); clearAllGosen(); resetTableScroll(); }}>はい</button>
                  <button className='set-modal-btn set-modal-no' onClick={() => setShowClearConfirm(false)}>いいえ</button>
                </div>
              </div>
            </div>
          )}

          {showRegisterConfirm && (
            isGosen ? (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>作業実績を登録しますか？</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={confirmRegisterClearGosen}>YES</button>
                    <button className='set-modal-btn set-modal-no' onClick={() => { setShowRegisterConfirm(false); parentJanCodeInputRef.current?.focus(); }}>NO</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>{'作業実績を登録します。\nWOは維持しますか？'}</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={confirmRegisterMaintainChiba}>YES</button>
                    <button className='set-modal-btn set-modal-no' onClick={confirmRegisterClearChiba}>NO</button>
                    <button className='set-modal-btn set-modal-no' onClick={() => { setShowRegisterConfirm(false); parentJanCodeInputRef.current?.focus(); }}>取消</button>
                  </div>
                </div>
              </div>
            )
          )}

          {showRegisterSuccessConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{isGosen ? '登録しました' : '作業実績を登録しました。'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={isGosen ? handleRegisterSuccessGosen : handleRegisterSuccessChiba}>OK</button>
                </div>
              </div>
            </div>
          )}

          {isChiba && showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>作業実績を登録しました。</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={() => setShowCompleteConfirm(false)}>OK</button>
                </div>
              </div>
            </div>
          )}

          {showBackConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'メニューに戻ります。\n読込データを破棄しますか？'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={handleBackYes}>YES</button>
                  <button className='set-modal-btn set-modal-no' onClick={() => { setShowBackConfirm(false); navigate('/factory/factory'); }}>NO</button>
                  <button className='set-modal-btn set-modal-no' onClick={() => { setShowBackConfirm(false); parentJanCodeInputRef.current?.focus(); }}>取消</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { WorkOrderTimeRegistration }
