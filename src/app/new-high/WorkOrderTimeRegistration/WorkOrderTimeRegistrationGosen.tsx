import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'
import { FaRegCalendarAlt } from 'react-icons/fa'
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

const SESSION_STORAGE_KEY = 'workOrderTimeRegistrationSelectedWoNumbers'
const SESSION_STORAGE_ROWS_KEY = 'workOrderTimeRegistrationGosenRows'

// Master data
const MASTER_WORK_ORDERS: Record<string, Partial<Row>> = {
  'wo-1': {
    woNo: 'wo-1',
    itemNo: 'a',
    itemName: '製品a',
    targetTime: '50',
    acceptedQty: '9',
    defectiveQty: '1',
    opDesc: '研磨3',
    remarks: ''
  },
  'wo-2': {
    woNo: 'wo-2',
    itemNo: 'b',
    itemName: '製品b',
    targetTime: '50',
    acceptedQty: '3',
    defectiveQty: '',
    opDesc: '研磨3',
    remarks: ''
  },
  'wo-3': {
    woNo: 'wo-3',
    itemNo: 'c',
    itemName: '製品c',
    targetTime: '',
    acceptedQty: '',
    defectiveQty: '',
    opDesc: '研磨3',
    remarks: ''
  },
  'wo-4': {
    woNo: 'wo-4',
    itemNo: 'd',
    itemName: '製品d',
    targetTime: '9',
    acceptedQty: '',
    defectiveQty: '',
    opDesc: '研磨3',
    remarks: ''
  },
  'wo-5': {
    woNo: 'wo-5',
    itemNo: 'e',
    itemName: '製品e',
    targetTime: '10',
    acceptedQty: '',
    defectiveQty: '',
    opDesc: '研磨3',
    remarks: ''
  },
  'wo-6': {
    woNo: 'wo-6',
    itemNo: 'f',
    itemName: '製品f',
    targetTime: '15',
    acceptedQty: '',
    defectiveQty: '',
    opDesc: '研磨3',
    remarks: ''
  }
}

const fetchWorkOrderDetails = async (woNo: string): Promise<Partial<Row> | null> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MASTER_WORK_ORDERS[woNo] || null
}

// Calculate total target time
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
    totalMinutes: totalMinutes
  }
}

const WorkOrderTimeRegistrationGosen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rows, setRows] = useState<Row[]>([])
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [fetchingWoNos, setFetchingWoNos] = useState<Set<string>>(new Set())
  const [totalTargetTimeDisplay, setTotalTargetTimeDisplay] = useState({ hours: '', minutes: '' })

  // Header default values
  const [defaultOpOrder, setDefaultOpOrder] = useState('')
  const [defaultProcessStatus, setDefaultProcessStatus] = useState('')
  const [defaultRemarks, setDefaultRemarks] = useState('')

  const createEmptyRow = (id?: number, isLocked: boolean = false): Row => {
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
      isLocked: isLocked,
    }
  }

  const clearAllData = () => {
    const emptyRow = createEmptyRow(1, false)
    setRows([emptyRow])
    saveRowsToStorage([emptyRow])

    sessionStorage.removeItem(SESSION_STORAGE_ROWS_KEY)
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
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

    // Reset default values
    setDefaultOpOrder('')
    setDefaultProcessStatus('')
    setDefaultRemarks('')
  }

  const ensureEmptyRowAtEnd = (currentRows: Row[]): Row[] => {
    if (currentRows.length === 0) {
      return [createEmptyRow(1, false)]
    }

    const lastRow = currentRows[currentRows.length - 1]
    const isLastRowEmpty = !lastRow.woNo && !lastRow.itemNo && !lastRow.itemName

    if (!isLastRowEmpty) {
      const nextId = Math.max(...currentRows.map(r => r.id), 0) + 1
      return [...currentRows, createEmptyRow(nextId, false)]
    }

    return currentRows
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
  const [workDurationHours, setWorkDurationHours] = useState('')
  const [workDurationMinutes, setWorkDurationMinutes] = useState('')
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
  const [showRegisterSuccessConfirm, setShowRegisterSuccessConfirm] = useState(false)
  const [workerCode, setWorkerCode] = useState('')
  const [workerName, setWorkerName] = useState('')
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const parentJanCodeInputRef = useRef<HTMLInputElement | null>(null)

  const showWorkStartButton = false

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
    nextRows = ensureEmptyRowAtEnd(nextRows)
    setRows(nextRows)
    saveRowsToStorage(nextRows)

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

    const total = calculateTotalTargetTime(nextRows)
    setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
  }

  const clearAll = () => {
    const emptyRow = createEmptyRow(1, false)
    setRows([emptyRow])
    saveRowsToStorage([emptyRow])
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

  const handleRegister = () => {
    setShowRegisterConfirm(true)
  }

  const confirmRegisterClear = () => {
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  const handleRegisterSuccess = () => {
    clearAllData()
    setShowRegisterSuccessConfirm(false)
  }

  // 「一括反映」: ヘッダー部の備考を明細部に表示されている全行（データ行のみ）の備考へ反映する
  // 明細部にデータが表示されていない場合は何もしない（メッセージ表示は不要）
  const applyRemarksToAllRows = () => {
    setRows((prevRows) => {
      const hasDataRow = prevRows.some((row) => row.woNo.trim() !== '')
      if (!hasDataRow) return prevRows

      const nextRows = prevRows.map((row) =>
        row.woNo.trim() !== '' ? { ...row, remarks: defaultRemarks } : row
      )
      saveRowsToStorage(nextRows)
      return nextRows
    })
  }

  const updateEditableField = (rowId: number, field: keyof Row, value: string) => {
    setRows((prevRows) => {
      const nextRows = prevRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
      saveRowsToStorage(nextRows)
      return nextRows
    })
  }

  const handleWoNoKeyDown = async (rowId: number, currentWoNo: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const woNoToFetch = currentWoNo.trim().toLowerCase()

      if (woNoToFetch === '') {
        return
      }

      const currentRow = rows.find(r => r.id === rowId)
      if (currentRow?.isLocked) {
        return
      }

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
          saveRowsToStorage(cleanedRows)

          const total = calculateTotalTargetTime(cleanedRows)
          setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })

          return cleanedRows
        })
      }
    }
  }

  const addNewRow = () => {
    const newId = Math.max(...rows.map(r => r.id), 0) + 1
    const newRow = createEmptyRow(newId, false)
    setRows(prev => [...prev, newRow])
  }

  useEffect(() => {
    const total = calculateTotalTargetTime(rows)
    setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
  }, [rows])

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
                isLocked: true
              }
            }
            return row
          })
        )
        const rowsWithEmpty = [...updatedRows, createEmptyRow(updatedRows.length + 1, false)]
        setRows(rowsWithEmpty)
        saveRowsToStorage(rowsWithEmpty)
        const total = calculateTotalTargetTime(rowsWithEmpty)
        setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
      }

      fetchAllDetails()
      if (selectedWoNumbers) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedWoNumbers))
      }
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedWoNumbers))

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

      const rowsWithEmpty = [...mappedRows, createEmptyRow(mappedRows.length + 1, false)]
      setRows(rowsWithEmpty)
      saveRowsToStorage(rowsWithEmpty)
      const total = calculateTotalTargetTime(rowsWithEmpty)
      setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    const savedRows = sessionStorage.getItem(SESSION_STORAGE_ROWS_KEY)
    if (savedRows) {
      try {
        const parsedRows = JSON.parse(savedRows)
        if (Array.isArray(parsedRows) && parsedRows.length > 0) {
          setRows(parsedRows)
          const total = calculateTotalTargetTime(parsedRows)
          setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
          return
        }
      } catch {
        // ignore
      }
    }

    setRows([createEmptyRow(1, false)])
    setTotalTargetTimeDisplay({ hours: '', minutes: '' })
  }, [location.state, navigate, location.pathname])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'check',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      // headClassName: 'col-check',
      // cellClassName: 'col-check',
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
          readOnly={row.isLocked === true}
          style={row.isLocked ? { backgroundColor: '#d9d9d9' } : {}}
          onChange={(e) => {
            if (!row.isLocked) {
              setRows((prevRows) => {
                const nextRows = prevRows.map((r) =>
                  r.id === row.id ? { ...r, woNo: e.target.value } : r
                )
                return nextRows
              })
            }
          }}
          onKeyDown={(e) => {
            if (!row.isLocked) {
              handleWoNoKeyDown(row.id, e.currentTarget.value, e)
            }
          }}
          onBlur={() => {
            const lastRow = rows[rows.length - 1]
            if (lastRow.woNo && lastRow.id === row.id && !lastRow.isLocked) {
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
          readOnly
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
          readOnly
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
          readOnly
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
          onChange={(e) => updateEditableField(row.id, 'acceptedQty', e.target.value)}
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
          onChange={(e) => updateEditableField(row.id, 'defectiveQty', e.target.value)}
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
          onChange={(e) => updateEditableField(row.id, 'opOrder', e.target.value)}
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
          readOnly
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
          onChange={(e) => updateEditableField(row.id, 'processStatus', e.target.value)}
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
          onChange={(e) => updateEditableField(row.id, 'remarks', e.target.value)}
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
                <div className='wot-info-soll box-padding-innput'>
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
                        className='hand-date-btn2'
                        aria-label='Choose date'
                        onClick={openWoDatePicker}
                      >
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
                      style={{ backgroundColor: '#d9d9d9', outline: 'none' }}
                      value={workerName}
                      readOnly
                    />
                  </div>

                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-red'>工程状況初期値</label>
                    <input
                      className='wot-grid-value1 wot-text-red'
                      value={defaultProcessStatus}
                      onChange={(e) => setDefaultProcessStatus(e.target.value)}
                    />
                  </div>
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-red'>作業順序</label>
                    <input
                      className='wot-grid-value1 wot-text-red'
                      value={defaultOpOrder}
                      onChange={(e) => setDefaultOpOrder(e.target.value)}
                    />
                  </div>
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className='wot-grid-label wot-bg-red'>備考</label>
                    <input
                      className='wot-grid-value1 wot-text-red'
                      value={defaultRemarks}
                      onChange={(e) => setDefaultRemarks(e.target.value)}
                    />
                    <button
                      type='button'
                      className='set-btnnew_high set-primary wot-bulk-apply-btn'
                      onClick={applyRemarksToAllRows}
                    >
                      一括反映
                    </button>
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
                  {/* 目標時間計は手入力をしないためグレー表示 */}
                  <input
                    className='wot-grid-value2'
                    style={{ backgroundColor: '#d9d9d9', outline: 'none' }}
                    value={totalTargetTimeDisplay.hours}
                    readOnly
                  />
                </div>
                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-span2'>時間</label>

                  <input
                    className='wot-grid-value2 wot-grid-value3'
                    style={{ backgroundColor: '#d9d9d9', outline: 'none' }}
                    value={totalTargetTimeDisplay.minutes}
                    readOnly
                  />
                  <label className='wot-footer-label wot-bg-span'>分</label>
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

          {/* Modals - same as before */}
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

          {showClearConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'読み込みデータを破棄します。\n宜しいですか？'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={() => { setShowClearConfirm(false); clearAll(); resetTableScroll(); }}>はい</button>
                  <button className='set-modal-btn set-modal-no' onClick={() => setShowClearConfirm(false)}>いいえ</button>
                </div>
              </div>
            </div>
          )}

          {showRegisterConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>
                  作業実績を登録しますか？
                </div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmRegisterClear}>
                    YES
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={() => {
                    setShowRegisterConfirm(false)
                    parentJanCodeInputRef.current?.focus()
                  }}>
                    NO
                  </button>
                </div>
              </div>
            </div>
          )}
          {showRegisterSuccessConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>登録しました</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={handleRegisterSuccess}>OK</button>
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
                  <button className='set-modal-btn set-modal-yes' onClick={() => { clearAllData(); setShowBackConfirm(false); navigate('/factory/factory'); }}>YES</button>
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

export { WorkOrderTimeRegistrationGosen }