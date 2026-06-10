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

// Master data - single source of truth for work order details
const MASTER_WORK_ORDERS: Record<string, Partial<Row>> = {
  'WO-001': {
    woNo: 'WO-001',
    itemNo: 'PRD-001',
    itemName: '製品A',
    targetTime: '50',
    acceptedQty: '9',
    defectiveQty: '1',
    opOrder: '10',
    opDesc: '研磨3',
    processStatus: '90',
    remarks: '高品質製品'
  },
  'WO-002': {
    woNo: 'WO-002',
    itemNo: 'PRD-002',
    itemName: '製品B',
    targetTime: '45',
    acceptedQty: '3',
    defectiveQty: '0',
    opOrder: '20',
    opDesc: '組立2',
    processStatus: '50',
    remarks: ''
  },
  'WO-003': {
    woNo: 'WO-003',
    itemNo: 'PRD-003',
    itemName: '製品C',
    targetTime: '60',
    acceptedQty: '',
    defectiveQty: '',
    opOrder: '',
    opDesc: '',
    processStatus: '',
    remarks: ''
  },
  'WO-004': {
    woNo: 'WO-004',
    itemNo: 'PRD-004',
    itemName: '製品D',
    targetTime: '55',
    acceptedQty: '',
    defectiveQty: '',
    opOrder: '',
    opDesc: '',
    processStatus: '',
    remarks: ''
  },
  'WO-005': {
    woNo: 'WO-005',
    itemNo: 'PRD-005',
    itemName: '製品E',
    targetTime: '70',
    acceptedQty: '',
    defectiveQty: '',
    opOrder: '',
    opDesc: '',
    processStatus: '',
    remarks: ''
  },
  'WO-006': {
    woNo: 'WO-006',
    itemNo: 'PRD-006',
    itemName: '製品F',
    targetTime: '40',
    acceptedQty: '',
    defectiveQty: '',
    opOrder: '',
    opDesc: '',
    processStatus: '',
    remarks: ''
  },
  'WO-007': {
    woNo: 'WO-007',
    itemNo: 'PRD-007',
    itemName: '製品G',
    targetTime: '65',
    acceptedQty: '',
    defectiveQty: '',
    opOrder: '',
    opDesc: '',
    processStatus: '',
    remarks: ''
  },
  'WO-008': {
    woNo: 'WO-008',
    itemNo: 'PRD-008',
    itemName: '製品H',
    targetTime: '35',
    acceptedQty: '',
    defectiveQty: '',
    opOrder: '',
    opDesc: '',
    processStatus: '',
    remarks: ''
  }
}

// Function to fetch work order details from master data
const fetchWorkOrderDetails = async (woNo: string): Promise<Partial<Row> | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return MASTER_WORK_ORDERS[woNo] || null
}

const WorkOrderTimeRegistrationGosen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rows, setRows] = useState<Row[]>([])
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [fetchingWoNos, setFetchingWoNos] = useState<Set<string>>(new Set())

  // Create an empty row
  const createEmptyRow = (id?: number): Row => {
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
    }
  }

  const clearAllData = () => {
    // Clear table data
    const emptyRow = createEmptyRow(1)
    setRows([emptyRow])
    saveRowsToStorage([emptyRow])

    // Clear all session storage keys
    sessionStorage.removeItem(SESSION_STORAGE_ROWS_KEY)
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_chiba')
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_gosen')

    // Clear worker and time fields
    setWorkerCode('')
    setWorkerName('')
    setWorkStartTime('')
    setWorkEndTime('')
    setWorkDurationHours('')
    setWorkDurationMinutes('')
    setActiveRowId(null)
  }

  // Clean up consecutive empty rows - keep only one empty row at the end
  const cleanupConsecutiveEmptyRows = (currentRows: Row[]): Row[] => {
    if (currentRows.length === 0) {
      return [createEmptyRow(1)]
    }

    // Find last non-empty row
    let lastNonEmptyIndex = -1
    for (let i = 0; i < currentRows.length; i++) {
      const row = currentRows[i]
      const isEmpty = !row.woNo && !row.itemNo && !row.itemName
      if (!isEmpty) {
        lastNonEmptyIndex = i
      }
    }

    // If no non-empty rows, return single empty row
    if (lastNonEmptyIndex === -1) {
      return [createEmptyRow(1)]
    }

    // Keep rows up to last non-empty row
    const rowsWithData = currentRows.slice(0, lastNonEmptyIndex + 1)

    // Add empty row at the end if last row is not empty
    const lastRow = rowsWithData[rowsWithData.length - 1]
    const isLastRowEmpty = !lastRow.woNo && !lastRow.itemNo && !lastRow.itemName

    if (!isLastRowEmpty) {
      const nextId = Math.max(...rowsWithData.map(r => r.id), 0) + 1
      return [...rowsWithData, createEmptyRow(nextId)]
    }

    return rowsWithData
  }

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
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [workStartTime, setWorkStartTime] = useState('')
  const [workEndTime, setWorkEndTime] = useState('')
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [workDurationHours, setWorkDurationHours] = useState('')
  const [workDurationMinutes, setWorkDurationMinutes] = useState('')
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
  const [showRegisterSuccessConfirm, setShowRegisterSuccessConfirm] = useState(false)
  const [registrationMode, setRegistrationMode] = useState<'maintain' | 'clear' | null>(null)
  const [workerCode, setWorkerCode] = useState('')
  const [workerName, setWorkerName] = useState('')
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const parentJanCodeInputRef = useRef<HTMLInputElement | null>(null)

  const showWorkPlaceSection = false
  const showWoSelectButton = false
  const showWorkTimeFields = false
  const showWorkStartButton = false

  const isAnyModalOpen =
    showDeleteSelectedConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showBackConfirm ||
    showRegisterConfirm ||
    showRegisterSuccessConfirm

  const getWorkerNameFromCode = (code: string) => {
    switch (code.trim()) {
      case 'XXXXX': return '作業者X'
      case 'YYYYY': return '作業者Y'
      case 'ZZZZZ': return '作業者Z'
      default: return ''
    }
  }

  const handleDeleteSelected = () => {
    if (activeRowId === null) {
      setShowNoSelectionConfirm(true)
      return
    }
    setShowDeleteSelectedConfirm(true)
  }

  const confirmDeleteSelected = () => {
    if (activeRowId === null) return

    const rowToDelete = rows.find(row => row.id === activeRowId)
    const woNumberToDelete = rowToDelete?.woNo

    let nextRows = rows.filter((row) => row.id !== activeRowId)
    nextRows = cleanupConsecutiveEmptyRows(nextRows)
    setRows(nextRows)
    saveRowsToStorage(nextRows)

    // Delete from session storage
    const savedWos_chiba = sessionStorage.getItem('workOrderTimeRegistrationSelectedWoNumbers_chiba')
    if (savedWos_chiba && woNumberToDelete) {
      try {
        const selectedWoNumbers = JSON.parse(savedWos_chiba) as string[]
        const remainingWoNumbers = selectedWoNumbers.filter(wo => wo !== woNumberToDelete)
        if (remainingWoNumbers.length > 0) {
          sessionStorage.setItem('workOrderTimeRegistrationSelectedWoNumbers_chiba', JSON.stringify(remainingWoNumbers))
        } else {
          sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_chiba')
        }
      } catch {
        // ignore
      }
    }

    const savedWos = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (savedWos && woNumberToDelete) {
      try {
        const selectedWoNumbers = JSON.parse(savedWos) as string[]
        const remainingWoNumbers = selectedWoNumbers.filter(wo => wo !== woNumberToDelete)
        if (remainingWoNumbers.length > 0) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(remainingWoNumbers))
        } else {
          sessionStorage.removeItem(SESSION_STORAGE_KEY)
        }
      } catch {
        // ignore
      }
    }

    setActiveRowId(null)
    setShowDeleteSelectedConfirm(false)
  }

  const clearAll = () => {
    const emptyRow = createEmptyRow(1)
    setRows([emptyRow])
    saveRowsToStorage([emptyRow])
    setActiveRowId(null)
  }

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  // Handle register button click - shows confirmation modal
  const handleRegister = () => {
    if (rows.length === 0 || (rows.length === 1 && !rows[0].woNo)) {
      setShowRegisterSuccessConfirm(true)
      return
    }
    setShowRegisterConfirm(true)
  }

  // Confirm register and maintain WO data
  const confirmRegisterMaintain = () => {
    setRegistrationMode('maintain')
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  // Confirm register and clear WO data
  const confirmRegisterClear = () => {
    setRegistrationMode('clear')
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  // Handle register success - clear fields based on mode
  const handleRegisterSuccess = () => {
    if (registrationMode === 'maintain') {
      // Maintain WO data - only clear time and worker fields
      setWorkerCode('')
      setWorkerName('')
      setWorkStartTime('')
      setWorkEndTime('')
      setWorkDurationHours('')
      setWorkDurationMinutes('')
    } else if (registrationMode === 'clear') {
      // Clear all data
      clearAll()
      setWorkerCode('')
      setWorkerName('')
      setWorkStartTime('')
      setWorkEndTime('')
      setWorkDurationHours('')
      setWorkDurationMinutes('')
      setActiveRowId(null)
    }
    setShowRegisterSuccessConfirm(false)
    setRegistrationMode(null)
  }

  // Check if WoNo has 6 or more characters (excluding hyphen)
  const hasMinWoNoLength = (woNo: string): boolean => {
    return woNo.length >= 6
  }

  // Update row field with auto-fetch for woNo when length >= 6 chars
  const updateRowField = async (
    rowId: number,
    field: keyof Omit<Row, 'id'>,
    value: string,
  ) => {
    // If updating woNo and value has 6+ characters (excluding hyphens), fetch details
    if (field === 'woNo' && value.trim() !== '' && hasMinWoNoLength(value)) {
      // Prevent multiple simultaneous fetches for the same woNo
      if (fetchingWoNos.has(value)) return

      setFetchingWoNos(prev => new Set(prev).add(value))

      const details = await fetchWorkOrderDetails(value.trim())

      setFetchingWoNos(prev => {
        const newSet = new Set(prev)
        newSet.delete(value)
        return newSet
      })

      if (details) {
        // Update with fetched data, but preserve user-editable fields
        setRows((prevRows) => {
          const nextRows = prevRows.map((row) =>
            row.id === rowId
              ? {
                ...row,
                ...details,
                id: row.id,
                // Preserve any user-edited values that might have been set
                acceptedQty: row.acceptedQty || details.acceptedQty,
                defectiveQty: row.defectiveQty || details.defectiveQty,
              }
              : row,
          )
          const cleanedRows = cleanupConsecutiveEmptyRows(nextRows)
          saveRowsToStorage(cleanedRows)
          return cleanedRows
        })
      } else {
        // WO not found, just update woNo
        setRows((prevRows) => {
          const nextRows = prevRows.map((row) =>
            row.id === rowId ? { ...row, woNo: value } : row,
          )
          const cleanedRows = cleanupConsecutiveEmptyRows(nextRows)
          saveRowsToStorage(cleanedRows)
          return cleanedRows
        })
      }
    }
    else if (field === 'woNo' && value.trim() === '') {
      // Clear woNo and all related fields
      setRows((prevRows) => {
        const nextRows = prevRows.map((row) =>
          row.id === rowId
            ? {
              ...row,
              woNo: '',
              itemNo: '',
              itemName: '',
              targetTime: '',
              acceptedQty: '',
              defectiveQty: '',
              opOrder: '',
              opDesc: '',
              processStatus: '',
              remarks: ''
            }
            : row,
        )
        const cleanedRows = cleanupConsecutiveEmptyRows(nextRows)
        saveRowsToStorage(cleanedRows)
        return cleanedRows
      })
    }
    else if (field === 'woNo' && value.trim() !== '' && !hasMinWoNoLength(value)) {
      // WoNo is too short, just update woNo without fetching
      setRows((prevRows) => {
        const nextRows = prevRows.map((row) =>
          row.id === rowId ? { ...row, woNo: value } : row,
        )
        const cleanedRows = cleanupConsecutiveEmptyRows(nextRows)
        saveRowsToStorage(cleanedRows)
        return cleanedRows
      })
    }
    else {
      // Update other fields normally (itemNo and itemName are now editable)
      setRows((prevRows) => {
        const nextRows = prevRows.map((row) =>
          row.id === rowId ? { ...row, [field]: value } : row,
        )
        saveRowsToStorage(nextRows)
        return nextRows
      })
    }
  }

  // Add a new empty row at the end
  const addNewRow = () => {
    const newId = Math.max(...rows.map(r => r.id), 0) + 1
    const newRow = createEmptyRow(newId)
    setRows(prev => [...prev, newRow])
  }

  useEffect(() => {
    const duration = calculateDuration(workStartTime, workEndTime)
    if (duration) {
      setWorkDurationHours(duration.hours)
      setWorkDurationMinutes(duration.minutes)
    } else {
      setWorkDurationHours('')
      setWorkDurationMinutes('')
    }
  }, [workStartTime, workEndTime])

  // Load data from location.state or sessionStorage
  useEffect(() => {
    const state = location.state as {
      selectedWoNumbers?: string[]
      selectedRows?: Array<{
        id: number
        woNumber: string
        itemNumber?: string
        itemName?: string
      }>
    } | null

    const selectedWoNumbers = state?.selectedWoNumbers
    const selectedRows = state?.selectedRows

    // Load from location.state (WO selection page)
    if (Array.isArray(selectedRows) && selectedRows.length > 0) {
      const mappedRows: Row[] = selectedRows.map((row, index) => ({
        id: row.id || index + 1,
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

      // Fetch details for each WO that has 6+ characters
      const fetchAllDetails = async () => {
        const updatedRows = await Promise.all(
          mappedRows.map(async (row) => {
            if (row.woNo && hasMinWoNoLength(row.woNo) && MASTER_WORK_ORDERS[row.woNo]) {
              return { ...row, ...MASTER_WORK_ORDERS[row.woNo], id: row.id }
            }
            return row
          })
        )
        const rowsWithEmpty = [...updatedRows, createEmptyRow(updatedRows.length + 1)]
        setRows(rowsWithEmpty)
        saveRowsToStorage(rowsWithEmpty)
      }

      fetchAllDetails()
      if (selectedWoNumbers) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedWoNumbers))
      }
      // Clear location state
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedWoNumbers))

      const mappedRows: Row[] = selectedWoNumbers.map((woNo, index) => {
        const masterData = MASTER_WORK_ORDERS[woNo]
        if (masterData && hasMinWoNoLength(woNo)) {
          return {
            id: index + 1,
            ...masterData,
          } as Row
        }
        return {
          id: index + 1,
          woNo: woNo,
          itemNo: '',
          itemName: '',
          targetTime: '',
          acceptedQty: '',
          defectiveQty: '',
          opOrder: '',
          opDesc: '',
          processStatus: '',
          remarks: '',
        }
      })

      const rowsWithEmpty = [...mappedRows, createEmptyRow(mappedRows.length + 1)]
      setRows(rowsWithEmpty)
      saveRowsToStorage(rowsWithEmpty)
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    // Load from sessionStorage
    const savedRows = sessionStorage.getItem(SESSION_STORAGE_ROWS_KEY)
    if (savedRows) {
      try {
        const parsedRows = JSON.parse(savedRows)
        if (Array.isArray(parsedRows) && parsedRows.length > 0) {
          setRows(parsedRows)
          return
        }
      } catch {
        // ignore
      }
    }

    // Initialize with empty row
    setRows([createEmptyRow(1)])
  }, [location.state, navigate, location.pathname])

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
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.woNo}
          onChange={(e) => updateRowField(row.id, 'woNo', e.target.value)}
          onBlur={() => {
            // Check if we need to add a new row when user finishes editing the last row
            const lastRow = rows[rows.length - 1]
            if (lastRow.woNo && lastRow.id === row.id) {
              addNewRow()
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
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
        // 品番 can now be edited freely
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
        // 品名 can now be edited freely
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
                      style={{ backgroundColor: '#e5e7eb' }}
                      value={workerName}
                      readOnly
                    />
                  </div>

                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-blue'>日付</label>
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

                  <div>
                    <div className='wot-info-grid wot-info-grid-2' style={{ display: showWorkPlaceSection ? undefined : 'none' }}>
                      <label className='wot-grid-label wot-bg-red'>作業場</label>
                      <input className='wot-grid-value1 wot-text-red' />
                      <input className='wot-grid-value1' style={{ backgroundColor: '#e5e7eb' }} />
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
                      <div className='wot-top-row' style={{ display: showWoSelectButton ? undefined : 'none' }}>
                        <button className='set-btnnew_high set-primary' onClick={() => navigate('/factory/work-order-time-registration-choose')}>
                          WO選択
                        </button>
                      </div>
                    </div>
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
              activeRowKey={activeRowId}
              isRowActive={(rowKey) => activeRowId === Number(rowKey)}
              onRowActivate={(rowKey) => setActiveRowId(Number(rowKey))}
            />

            <div className='wot-footer-summary wot-radio-container'>
              <div className='wot-footer-row'>
                <div className='wot-footer-item' style={{ display: showWorkTimeFields ? undefined : 'none' }}>
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

                <div className='wot-footer-item' style={{ display: showWorkTimeFields ? undefined : 'none' }}>
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
                  <input
                    className='wot-grid-value2'
                    placeholder='時間'
                  />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-span'>時間</label>
                  <input
                    className='wot-grid-value2'
                    placeholder='分'
                  />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label'>目標時間計</label>
                  <input className='wot-grid-value2' />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-span'>時間</label>
                  <input className='wot-grid-value2 ' placeholder='分' />
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
                onClick={handleRegister}
              >
                登録
              </button>
              <button
                className='set-btn-footer set-primary'
                style={{ visibility: 'hidden' }}
              >
                手入力
              </button>

              <div>
                <button
                  className='set-btn set-hand-input-btn'
                  onClick={() => { }}
                  style={{ display: showWorkStartButton ? undefined : 'none' }}
                >
                  作業開始
                </button>
              </div>

              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
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
                  読込データを破棄します。<br />
                  宜しいですか？
                </div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmDeleteSelected}>
                    YES
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={() => setShowDeleteSelectedConfirm(false)}>
                    NO
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

          {/* Register Confirmation Modal - WO維持しますか？ */}
          {showRegisterConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>
                  作業実績を登録します。
                  <br />
                  WOは維持しますか？
                </div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmRegisterMaintain}>
                    YES
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={confirmRegisterClear}>
                    NO
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowRegisterConfirm(false)}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Register Success Modal */}
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
                      clearAllData() // ใช้ฟังก์ชันใหม่
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

export { WorkOrderTimeRegistrationGosen }