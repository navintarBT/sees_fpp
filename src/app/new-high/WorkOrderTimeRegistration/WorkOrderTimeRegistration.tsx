import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'
import { FaPlay, FaRegCalendarAlt, FaRegClock } from 'react-icons/fa'

/* ============================================================================
 * WO作業時間実績登録（五泉工場・千葉工場 共通1画面）
 * 工場による差異は FACTORY_CONFIG に集約し、画面内では isGosen / isChiba で制御する
 * ========================================================================== */

// common = 設計書用のレイアウト確認画面（工場による表示制御を行わず全項目を表示する）
type Factory = 'gosen' | 'chiba' | 'common'

const isFactoryValue = (value: string | undefined): value is Factory =>
  value === 'gosen' || value === 'chiba' || value === 'common'

const getFactoryPath = (factory: Factory) => `/factory/work-order-time-registration/${factory}`

/* ---------------------------------- 共通ヘルパー ---------------------------------- */

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
    // 1時間未満は空欄
    hours: hours > 0 ? hours.toString() : '',
    // 先頭に0を付けない
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

const readStoredPair = (storageKey: string, field: 'code' | 'name') => {
  const saved = sessionStorage.getItem(storageKey)
  if (!saved) return ''
  try {
    const parsed = JSON.parse(saved)
    return parsed?.[field] || ''
  } catch {
    return ''
  }
}

/* ------------------------------------ 明細部 ------------------------------------- */

type Row = {
  id: number
  woNo: string
  itemNo: string
  itemName: string
  targetTime?: string
  plannedQty?: string
  acceptedQty?: string
  defectiveQty?: string
  opOrder?: string
  opDesc?: string
  processStatus?: string
  remarks?: string
  isLocked?: boolean
}

type ColumnDef = { key: string; header: string; flex?: boolean }

// 五泉工場：実績を明細部へ直接入力するため項目が多い
const GOSEN_COLUMN_DEFS: ColumnDef[] = [
  { key: 'check', header: '' },
  { key: 'woNo', header: 'WoNo' },
  { key: 'itemNo', header: '品番' },
  { key: 'itemName', header: '品名' },
  { key: 'targetTime', header: '目標時間' },
  { key: 'plannedQty', header: '計画数' },
  { key: 'acceptedQty', header: '合格数' },
  { key: 'defectiveQty', header: '不良数' },
  { key: 'opOrder', header: '作業順序' },
  { key: 'opDesc', header: '作業記述' },
  { key: 'processStatus', header: '工程状況' },
  { key: 'remarks', header: '備考' },
]

// 千葉工場：WO検索で選択したWOを表示するのみ
const CHIBA_COLUMN_DEFS: ColumnDef[] = [
  { key: 'check', header: '' },
  { key: 'woNo', header: 'WoNo' },
  { key: 'itemNo', header: '品番', flex: true },
  { key: 'itemName', header: '品名', flex: true },
]

const getColumnTextValue = (key: string, row: Row): string => {
  switch (key) {
    case 'woNo': return row.woNo
    case 'itemNo': return row.itemNo
    case 'itemName': return row.itemName
    case 'targetTime': return row.targetTime ?? ''
    case 'plannedQty': return row.plannedQty ?? ''
    case 'acceptedQty': return row.acceptedQty ?? ''
    case 'defectiveQty': return row.defectiveQty ?? ''
    case 'opOrder': return row.opOrder ?? ''
    case 'opDesc': return row.opDesc ?? ''
    case 'processStatus': return row.processStatus ?? ''
    case 'remarks': return row.remarks ?? ''
    default: return ''
  }
}

const measureColumnWidths = (rows: Row[], columnDefs: ColumnDef[]): React.CSSProperties | undefined => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  ctx.font = '400 28px sans-serif'
  const cellPadding = 36

  const colWidths = columnDefs.map(({ key, header, flex }) => {
    if (key === 'check') return '56px'

    let maxWidth = ctx.measureText(header).width + cellPadding

    for (const row of rows) {
      const text = getColumnTextValue(key, row)
      const w = ctx.measureText(text).width + cellPadding
      if (w > maxWidth) maxWidth = w
    }

    if (flex) return `minmax(${Math.ceil(maxWidth)}px, 1fr)`

    return `${Math.ceil(maxWidth)}px`
  })

  return { gridTemplateColumns: colWidths.join(' ') }
}

/* --------------------------------- 工場別の設定 ---------------------------------- */

type FactoryConfig = {
  columnDefs: ColumnDef[]
  gridClassName: string
  rowsStorageKey: string
  woStorageKey: string
  labelClassName: string
  showProcessDefaults: boolean   // 工程状況初期値／作業順序／備考（＋一括反映）
  showWorkplace: boolean         // 作業場
  showWoSearchButton: boolean    // WO検索ボタン
  showStartStopButton: boolean   // 作業開始／作業終了ボタン
  footerLayout: 'gosen' | 'chiba' | 'common' // フッター部の構成
  layoutOnly: boolean            // レイアウト確認のみ（データの読込・取得は行わない）
}

const FACTORY_CONFIG: Record<Factory, FactoryConfig> = {
  gosen: {
    columnDefs: GOSEN_COLUMN_DEFS,
    gridClassName: 'delivery-table',
    rowsStorageKey: 'workOrderTimeRegistrationGosenRows',
    woStorageKey: 'workOrderTimeRegistrationSelectedWoNumbers',
    labelClassName: 'wot-grid-label wot-bg-blue',
    showProcessDefaults: true,
    showWorkplace: false,
    showWoSearchButton: false,
    showStartStopButton: false,
    footerLayout: 'gosen',
    layoutOnly: false,
  },
  chiba: {
    columnDefs: CHIBA_COLUMN_DEFS,
    gridClassName: 'WorkOrderTimeRegistrationChiba-table',
    rowsStorageKey: 'workOrderTimeRegistrationChibaRows',
    woStorageKey: 'workOrderTimeRegistrationSelectedWoNumbers_chiba',
    labelClassName: 'wot-grid-label ',
    showProcessDefaults: false,
    showWorkplace: true,
    showWoSearchButton: true,
    showStartStopButton: true,
    footerLayout: 'chiba',
    layoutOnly: false,
  },
  // 設計書用：全項目を表示するレイアウト確認画面（入力しても明細部にデータは表示しない）
  common: {
    columnDefs: GOSEN_COLUMN_DEFS,
    gridClassName: 'delivery-table',
    rowsStorageKey: 'workOrderTimeRegistrationCommonRows',
    woStorageKey: 'workOrderTimeRegistrationSelectedWoNumbers_common',
    labelClassName: 'wot-grid-label wot-bg-blue',
    showProcessDefaults: true,
    showWorkplace: true,
    showWoSearchButton: true,
    showStartStopButton: true,
    footerLayout: 'common',
    layoutOnly: true,
  },
}

// 千葉工場のみで使用するセッションキー
const CHIBA_DATA_CLEARED_FLAG = 'workOrderTimeRegistrationChibaCleared'
const CHIBA_WORKER_STORAGE_KEY = 'workOrderTimeRegistrationChiba_worker'
const CHIBA_WORKPLACE_STORAGE_KEY = 'workOrderTimeRegistrationChiba_workplace'

/* ------------------------- 五泉工場：WoNo入力時に取得するマスタ ------------------------- */

const MASTER_WORK_ORDERS: Record<string, Partial<Row>> = {
  'wo-1': { woNo: 'wo-1', itemNo: 'a', itemName: '製品a', targetTime: '50', plannedQty: '10', acceptedQty: '9', defectiveQty: '1', opDesc: '研磨3', remarks: '' },
  'wo-2': { woNo: 'wo-2', itemNo: 'b', itemName: '製品b', targetTime: '50', plannedQty: '20', acceptedQty: '3', defectiveQty: '', opDesc: '研磨3', remarks: '' },
  'wo-3': { woNo: 'wo-3', itemNo: 'c', itemName: '製品c', targetTime: '', plannedQty: '30', acceptedQty: '', defectiveQty: '', opDesc: '研磨3', remarks: '' },
  'wo-4': { woNo: 'wo-4', itemNo: 'd', itemName: '製品d', targetTime: '9', plannedQty: '40', acceptedQty: '', defectiveQty: '', opDesc: '研磨3', remarks: '' },
  'wo-5': { woNo: 'wo-5', itemNo: 'e', itemName: '製品e', targetTime: '10', plannedQty: '50', acceptedQty: '', defectiveQty: '', opDesc: '研磨3', remarks: '' },
  'wo-6': { woNo: 'wo-6', itemNo: 'f', itemName: '製品f', targetTime: '15', plannedQty: '60', acceptedQty: '', defectiveQty: '', opDesc: '研磨3', remarks: '' },
}

const fetchWorkOrderDetails = async (woNo: string): Promise<Partial<Row> | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
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
    totalMinutes,
  }
}

/* ----------------------------- 千葉工場：初期表示データ ----------------------------- */

const CHIBA_DEFAULT_ROWS: Row[] = [
  { id: 1, woNo: 'WO-001', itemNo: 'PRD-001', itemName: '製品A' },
  { id: 2, woNo: 'WO-002', itemNo: 'PRD-002', itemName: '製品B' },
  { id: 3, woNo: 'WO-003', itemNo: 'PRD-003', itemName: '製品C' },
  { id: 4, woNo: 'WO-004', itemNo: 'PRD-004', itemName: '製品D' },
  { id: 5, woNo: 'WO-005', itemNo: 'PRD-005', itemName: '製品E' },
]

/* --------------------------- 千葉工場：時刻選択ドロップダウン --------------------------- */

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

/* ================================== 画面本体 ================================== */

const WorkOrderTimeRegistrationScreen = ({ factory }: { factory: Factory }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const config = FACTORY_CONFIG[factory]
  const isGosen = factory === 'gosen'
  const isChiba = factory === 'chiba'
  const isCommon = factory === 'common'

  /* ------------------------------ state ------------------------------ */

  const [rows, setRows] = useState<Row[]>([])
  const [activeRowId, setActiveRowId] = useState<number | null>(null)

  // 五泉工場用
  const [fetchingWoNos, setFetchingWoNos] = useState<Set<string>>(new Set())
  const [totalTargetTimeDisplay, setTotalTargetTimeDisplay] = useState({ hours: '', minutes: '' })
  const [defaultOpOrder, setDefaultOpOrder] = useState('')
  const [defaultProcessStatus, setDefaultProcessStatus] = useState('')
  const [defaultRemarks, setDefaultRemarks] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // 千葉工場用
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [registrationMode, setRegistrationMode] = useState<'maintain' | 'clear' | null>(null)
  const [workStartStopState, setWorkStartStopState] = useState<'idle' | 'started'>('idle')
  const [workStartStopDisabled, setWorkStartStopDisabled] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [isDataCleared, setIsDataCleared] = useState(
    () => isChiba && sessionStorage.getItem(CHIBA_DATA_CLEARED_FLAG) === '1',
  )
  const [workplaceCode, setWorkplaceCode] = useState(
    () => (isChiba ? readStoredPair(CHIBA_WORKPLACE_STORAGE_KEY, 'code') : ''),
  )
  const [workplaceName, setWorkplaceName] = useState(
    () => (isChiba ? readStoredPair(CHIBA_WORKPLACE_STORAGE_KEY, 'name') : ''),
  )
  const [currentSelectedWoNumbers, setCurrentSelectedWoNumbers] = useState<string[]>([])

  // 共通
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
  const [showRegisterSuccessConfirm, setShowRegisterSuccessConfirm] = useState(false)
  const [workStartTime, setWorkStartTime] = useState('')
  const [workEndTime, setWorkEndTime] = useState('')
  const [workDurationHours, setWorkDurationHours] = useState('')
  const [workDurationMinutes, setWorkDurationMinutes] = useState('')
  const [workerCode, setWorkerCode] = useState(
    () => (isChiba ? readStoredPair(CHIBA_WORKER_STORAGE_KEY, 'code') : ''),
  )
  const [workerName, setWorkerName] = useState(
    () => (isChiba ? readStoredPair(CHIBA_WORKER_STORAGE_KEY, 'name') : ''),
  )

  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const parentJanCodeInputRef = useRef<HTMLInputElement | null>(null)

  const todayValue = toDateValue(new Date())
  const [woDatePickerValue, setWoDatePickerValue] = useState(todayValue)
  const [showWoCalendar, setShowWoCalendar] = useState(false)
  const [woCalendarMonth, setWoCalendarMonth] = useState(() => parseDateValue(todayValue))

  const gridStyle = useMemo(() => measureColumnWidths(rows, config.columnDefs), [rows, config.columnDefs])

  /* ------------------------------ 日付 ------------------------------ */

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

  /* ------------------------------ 人・作業場 ------------------------------ */

  const getWorkerNameFromCode = (code: string) => {
    const name = (() => {
      switch (code.trim()) {
        case 'XXXXX': return '作業者X'
        case 'YYYYY': return '作業者Y'
        case 'ZZZZZ': return '作業者Z'
        default: return ''
      }
    })()

    // 千葉工場は画面遷移後も保持するためセッションに保存する
    if (isChiba && code) {
      sessionStorage.setItem(CHIBA_WORKER_STORAGE_KEY, JSON.stringify({ code, name }))
    }

    return name
  }

  const getWorkplaceNameFromCode = (code: string) => {
    const name = code.trim() === '9005' ? '研磨班' : ''

    if (code) {
      sessionStorage.setItem(CHIBA_WORKPLACE_STORAGE_KEY, JSON.stringify({ code, name }))
    }

    return name
  }

  /* ------------------------------ 明細行の操作 ------------------------------ */

  const createEmptyRow = (id?: number, isLocked: boolean = false): Row => {
    const maxId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) : 0
    return {
      id: id || maxId + 1,
      woNo: '',
      itemNo: '',
      itemName: '',
      targetTime: '',
      plannedQty: '',
      acceptedQty: '',
      defectiveQty: '',
      opOrder: '',
      opDesc: '',
      processStatus: '',
      remarks: '',
      isLocked,
    }
  }

  const saveRowsToStorage = (rowsToSave: Row[]) => {
    // 千葉工場：空行のみの場合は保存しない
    if (isChiba && (rowsToSave.length === 0 || (rowsToSave.length === 1 && !rowsToSave[0].woNo))) {
      sessionStorage.removeItem(config.rowsStorageKey)
      return
    }
    sessionStorage.setItem(config.rowsStorageKey, JSON.stringify(rowsToSave))
  }

  const ensureEmptyRowAtEnd = (currentRows: Row[]): Row[] => {
    if (currentRows.length === 0) {
      return [createEmptyRow(1, false)]
    }

    const lastRow = currentRows[currentRows.length - 1]
    const isLastRowEmpty = !lastRow.woNo && !lastRow.itemNo && !lastRow.itemName

    if (!isLastRowEmpty) {
      const nextId = Math.max(...currentRows.map((r) => r.id), 0) + 1
      return [...currentRows, createEmptyRow(nextId, false)]
    }

    return currentRows
  }

  const updateRowField = (rowId: number, field: keyof Row, value: string) => {
    setRows((prevRows) => {
      const nextRows = prevRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
      if (isGosen) saveRowsToStorage(nextRows)
      return nextRows
    })
  }

  const addNewRow = () => {
    const newId = Math.max(...rows.map((r) => r.id), 0) + 1
    setRows((prev) => [...prev, createEmptyRow(newId, false)])
  }

  // 五泉工場：WoNo入力＋Enterでマスタから明細を取得する
  const handleWoNoKeyDown = async (rowId: number, currentWoNo: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    // レイアウト確認用の画面ではデータ取得を行わない
    if (config.layoutOnly) return

    const woNoToFetch = currentWoNo.trim().toLowerCase()
    if (woNoToFetch === '') return

    const currentRow = rows.find((r) => r.id === rowId)
    if (currentRow?.isLocked) return
    if (fetchingWoNos.has(woNoToFetch)) return

    setFetchingWoNos((prev) => new Set(prev).add(woNoToFetch))

    const details = await fetchWorkOrderDetails(woNoToFetch)

    setFetchingWoNos((prev) => {
      const newSet = new Set(prev)
      newSet.delete(woNoToFetch)
      return newSet
    })

    if (!details) return

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
          : row,
      )
      const cleanedRows = ensureEmptyRowAtEnd(nextRows)
      saveRowsToStorage(cleanedRows)

      const total = calculateTotalTargetTime(cleanedRows)
      setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })

      return cleanedRows
    })
  }

  // 五泉工場「一括反映」：ヘッダー部の備考を明細部のデータ行すべてへ反映する
  // 明細部にデータが表示されていない場合は何もしない（メッセージ表示は不要）
  const applyRemarksToAllRows = () => {
    setRows((prevRows) => {
      const hasDataRow = prevRows.some((row) => row.woNo.trim() !== '')
      if (!hasDataRow) return prevRows

      const nextRows = prevRows.map((row) =>
        row.woNo.trim() !== '' ? { ...row, remarks: defaultRemarks } : row,
      )
      saveRowsToStorage(nextRows)
      return nextRows
    })
  }

  /* ------------------------------ データクリア ------------------------------ */

  const clearAllDataGosen = () => {
    const emptyRow = createEmptyRow(1, false)
    setRows([emptyRow])
    saveRowsToStorage([emptyRow])

    sessionStorage.removeItem(config.rowsStorageKey)
    sessionStorage.removeItem(config.woStorageKey)
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

  // 五泉工場：読み込みデータの破棄のみ
  const clearLoadedRowsGosen = () => {
    const emptyRow = createEmptyRow(1, false)
    setRows([emptyRow])
    saveRowsToStorage([emptyRow])
    setActiveRowId(null)
    setTotalTargetTimeDisplay({ hours: '', minutes: '' })
  }

  const clearAllChiba = () => {
    const sessionKeysToClear = [
      config.rowsStorageKey,
      'workOrderTimeRegistrationSelectedWoNumbers',
      config.woStorageKey,
      'workOrderTimeRegistrationSelectedWoNumbers_gosen',
    ]
    sessionKeysToClear.forEach((key) => sessionStorage.removeItem(key))

    sessionStorage.setItem(CHIBA_DATA_CLEARED_FLAG, '1')
    sessionStorage.removeItem(CHIBA_WORKER_STORAGE_KEY)
    sessionStorage.removeItem(CHIBA_WORKPLACE_STORAGE_KEY)
    setRows([])
    setActiveRowId(null)
    setIsDataCleared(true)
    setCurrentSelectedWoNumbers([])
  }

  const clearAllDataForBackChiba = () => {
    setRows([])
    setActiveRowId(null)

    sessionStorage.removeItem(config.rowsStorageKey)
    sessionStorage.removeItem(config.woStorageKey)
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers')
    sessionStorage.removeItem('workOrderTimeRegistrationSelectedWoNumbers_gosen')
    sessionStorage.removeItem(CHIBA_DATA_CLEARED_FLAG)
    sessionStorage.removeItem(CHIBA_WORKER_STORAGE_KEY)
    sessionStorage.removeItem(CHIBA_WORKPLACE_STORAGE_KEY)

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

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  /* ------------------------------ 選択行削除 ------------------------------ */

  const handleDeleteSelected = () => {
    if (activeRowId === null) {
      setShowNoSelectionConfirm(true)
      return
    }
    setShowDeleteSelectedConfirm(true)
  }

  const confirmDeleteSelectedGosen = () => {
    if (activeRowId === null) return

    const rowToDelete = rows.find((row) => row.id === activeRowId)
    const woNumberToDelete = rowToDelete?.woNo

    let nextRows = rows.filter((row) => row.id !== activeRowId)
    nextRows = ensureEmptyRowAtEnd(nextRows)
    setRows(nextRows)
    saveRowsToStorage(nextRows)

    const savedWos = sessionStorage.getItem(config.woStorageKey)
    if (savedWos && woNumberToDelete) {
      try {
        const selectedWoNumbers = JSON.parse(savedWos) as string[]
        const remainingWoNumbers = selectedWoNumbers.filter((wo) => wo !== woNumberToDelete)
        if (remainingWoNumbers.length > 0) {
          sessionStorage.setItem(config.woStorageKey, JSON.stringify(remainingWoNumbers))
        } else {
          sessionStorage.removeItem(config.woStorageKey)
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
      } catch {
        // ignore parse error
      }
    }

    removeWoNumbers(config.woStorageKey)
    removeWoNumbers('workOrderTimeRegistrationSelectedWoNumbers')
    removeWoNumbers('workOrderTimeRegistrationSelectedWoNumbers_gosen')

    if (remainingRows.length === 0) {
      sessionStorage.removeItem(config.rowsStorageKey)
      sessionStorage.setItem(CHIBA_DATA_CLEARED_FLAG, '1')
      setIsDataCleared(true)
      setCurrentSelectedWoNumbers([])
    } else {
      saveRowsToStorage(remainingRows)
    }

    setActiveRowId(null)
    setShowDeleteSelectedConfirm(false)
  }

  const confirmDeleteSelected = () => {
    if (isGosen) {
      confirmDeleteSelectedGosen()
      return
    }
    confirmDeleteSelectedChiba()
  }

  /* ------------------------------ 作業開始／終了（千葉） ------------------------------ */

  const getCurrentTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
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

  const handleWorkStartStop = () => {
    if (workStartStopDisabled) return

    setWorkStartStopDisabled(true)
    setTimeout(() => setWorkStartStopDisabled(false), 1200)

    if (workStartStopState === 'idle') {
      const currentTime = getCurrentTime()
      setWorkStartTime(currentTime)
      setWorkStartStopState('started')
      return
    }

    const currentTime = getCurrentTime()
    setWorkEndTime(currentTime)
    updateWorkDuration(workStartTime, currentTime)
    setWorkStartStopState('idle')
  }

  /* ------------------------------ 登録 ------------------------------ */

  const handleRegister = () => {
    setShowRegisterConfirm(true)
  }

  const confirmRegisterMaintain = () => {
    setRegistrationMode('maintain')
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  const confirmRegisterClear = () => {
    if (isChiba) setRegistrationMode('clear')
    setShowRegisterConfirm(false)
    setShowRegisterSuccessConfirm(true)
  }

  const handleRegisterSuccess = () => {
    if (isGosen) {
      clearAllDataGosen()
      setShowRegisterSuccessConfirm(false)
      return
    }

    if (registrationMode === 'maintain') {
      setWorkerCode('')
      setWorkerName('')
      setWorkplaceCode('')
      setWorkplaceName('')
      setWorkStartTime('')
      setWorkEndTime('')
      setWorkDurationHours('')
      setWorkDurationMinutes('')
      sessionStorage.removeItem(CHIBA_WORKER_STORAGE_KEY)
      sessionStorage.removeItem(CHIBA_WORKPLACE_STORAGE_KEY)
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

  const handleBackYes = () => {
    if (isGosen) {
      clearAllDataGosen()
    } else {
      clearAllDataForBackChiba()
    }
    setShowBackConfirm(false)
    navigate('/factory/factory')
  }

  /* ------------------------------ effects ------------------------------ */

  // 共通（レイアウト確認用）：明細部の枠だけ表示するため空行を1行用意する
  useEffect(() => {
    if (!isCommon) return
    setRows([{
      id: 1,
      woNo: '',
      itemNo: '',
      itemName: '',
      targetTime: '',
      plannedQty: '',
      acceptedQty: '',
      defectiveQty: '',
      opOrder: '',
      opDesc: '',
      processStatus: '',
      remarks: '',
      isLocked: false,
    }])
  }, [isCommon])

  // 五泉工場：目標時間計を再計算
  useEffect(() => {
    if (!isGosen) return
    const total = calculateTotalTargetTime(rows)
    setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
  }, [rows, isGosen])

  // 五泉工場：WO検索からの受け取り／セッションからの復元
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
        plannedQty: '',
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
          }),
        )
        const rowsWithEmpty = [...updatedRows, createEmptyRow(updatedRows.length + 1, false)]
        setRows(rowsWithEmpty)
        saveRowsToStorage(rowsWithEmpty)
        const total = calculateTotalTargetTime(rowsWithEmpty)
        setTotalTargetTimeDisplay({ hours: total.hours, minutes: total.minutes })
      }

      fetchAllDetails()
      if (selectedWoNumbers) {
        sessionStorage.setItem(config.woStorageKey, JSON.stringify(selectedWoNumbers))
      }
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
      sessionStorage.setItem(config.woStorageKey, JSON.stringify(selectedWoNumbers))

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
          plannedQty: '',
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

    const savedRows = sessionStorage.getItem(config.rowsStorageKey)
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
  }, [isGosen, location.state, navigate, location.pathname])

  // 千葉工場：WO検索からの受け取り
  useEffect(() => {
    if (!isChiba) return

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

    if (!(Array.isArray(selectedRows) && selectedRows.length > 0)
      && !(Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0)) {
      return
    }

    sessionStorage.removeItem(CHIBA_DATA_CLEARED_FLAG)
    setIsDataCleared(false)

    if (Array.isArray(selectedRows) && selectedRows.length > 0) {
      const mappedRows: Row[] = selectedRows.map((row) => ({
        id: row.id,
        woNo: row.woNumber,
        itemNo: row.itemNumber ?? '',
        itemName: row.itemName ?? '',
      }))

      const woNumbers = selectedWoNumbers ?? mappedRows.map((r) => r.woNo)
      setCurrentSelectedWoNumbers(woNumbers)
      sessionStorage.setItem(config.woStorageKey, JSON.stringify(woNumbers))
      setRows(mappedRows)
      saveRowsToStorage(mappedRows)
      setActiveRowId(null)

      navigate(location.pathname, { replace: true, state: null })
      return
    }

    if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
      setCurrentSelectedWoNumbers(selectedWoNumbers)
      sessionStorage.setItem(config.woStorageKey, JSON.stringify(selectedWoNumbers))
      const matchedRows = CHIBA_DEFAULT_ROWS.filter((row) => selectedWoNumbers.includes(row.woNo))
      setRows(matchedRows)
      saveRowsToStorage(matchedRows)
      setActiveRowId(null)

      navigate(location.pathname, { replace: true, state: null })
    }
  }, [isChiba, location.state, navigate, location.pathname])

  // 千葉工場：セッションからの復元
  useEffect(() => {
    if (!isChiba) return
    if (location.state && (location.state as { selectedWoNumbers?: string[] })?.selectedWoNumbers) return
    if (isDataCleared) return

    const savedRows = sessionStorage.getItem(config.rowsStorageKey)
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

    const savedSelection = sessionStorage.getItem(config.woStorageKey)
    if (savedSelection) {
      try {
        const parsedSelection = JSON.parse(savedSelection)
        if (Array.isArray(parsedSelection) && parsedSelection.length > 0) {
          setCurrentSelectedWoNumbers(parsedSelection)
          const matchedRows = CHIBA_DEFAULT_ROWS.filter((row) => parsedSelection.includes(row.woNo))
          setRows(matchedRows)
          saveRowsToStorage(matchedRows)
          return
        }
      } catch {
        // ignore invalid stored selection
      }
    }

    setRows([createEmptyRow(1)])
  }, [isChiba, isDataCleared, location.state])

  // 千葉工場：人・作業場をセッションへ保持
  useEffect(() => {
    if (!isChiba) return
    if (workerCode || workerName) {
      sessionStorage.setItem(CHIBA_WORKER_STORAGE_KEY, JSON.stringify({ code: workerCode, name: workerName }))
    } else {
      sessionStorage.removeItem(CHIBA_WORKER_STORAGE_KEY)
    }
  }, [isChiba, workerCode, workerName])

  useEffect(() => {
    if (!isChiba) return
    if (workplaceCode || workplaceName) {
      sessionStorage.setItem(CHIBA_WORKPLACE_STORAGE_KEY, JSON.stringify({ code: workplaceCode, name: workplaceName }))
    } else {
      sessionStorage.removeItem(CHIBA_WORKPLACE_STORAGE_KEY)
    }
  }, [isChiba, workplaceCode, workplaceName])

  // 千葉工場：開始・終了から作業時間を算出
  useEffect(() => {
    if (!isChiba) return
    updateWorkDuration(workStartTime, workEndTime)
  }, [isChiba, workStartTime, workEndTime])

  /* ------------------------------ 明細部の列 ------------------------------ */

  const selectorColumn: TFTableColumn<Row> = {
    key: 'check',
    headClassName: 'col-arrow-head',
    cellClassName: 'col-arrow',
    header: '',
    render: (row) => (
      <div
        className='row-selector'
        onClick={() => setActiveRowId(row.id)}
        style={{ cursor: 'pointer' }}
      >
        {activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null}
      </div>
    ),
  }

  const gosenTableColumns: Array<TFTableColumn<Row>> = [
    selectorColumn,
    {
      key: 'woNo',
      headClassName: 'col-wo',
      cellClassName: 'col-wo',
      header: 'WoNo',
      render: (row) => (
        <input
          type='text'
          className={row.isLocked ? 'table-cell-input table-cell-input-locked' : 'table-cell-input'}
          value={row.woNo}
          readOnly={row.isLocked === true}
          onChange={(e) => {
            if (row.isLocked) return
            setRows((prevRows) => prevRows.map((r) => (r.id === row.id ? { ...r, woNo: e.target.value } : r)))
          }}
          onKeyDown={(e) => {
            if (!row.isLocked) {
              handleWoNoKeyDown(row.id, e.currentTarget.value, e)
            }
          }}
          onBlur={() => {
            if (config.layoutOnly) return
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
        <input type='text' className='table-cell-input' value={row.itemNo} readOnly onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      key: 'itemName',
      headClassName: 'col-item-name',
      cellClassName: 'col-item-name',
      header: '品名',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.itemName} readOnly onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      key: 'targetTime',
      headClassName: 'col-target-time',
      cellClassName: 'col-target-time col-text-purple',
      header: '目標時間',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.targetTime ?? ''} readOnly onClick={(e) => e.stopPropagation()} />
      ),
    },
    {
      key: 'plannedQty',
      headClassName: 'col-qty',
      cellClassName: 'col-qty',
      header: '計画数',
      render: (row) => (
        <input type='text' className='table-cell-input' value={row.plannedQty ?? ''} readOnly onClick={(e) => e.stopPropagation()} />
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
        <input type='text' className='table-cell-input' value={row.opDesc ?? ''} readOnly onClick={(e) => e.stopPropagation()} />
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

  const chibaTableColumns: Array<TFTableColumn<Row>> = [
    selectorColumn,
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

  // 千葉工場のみ簡易表示。五泉工場・共通は全項目を表示する
  const tableColumns = isChiba ? chibaTableColumns : gosenTableColumns

  /* ------------------------------ 登録時間種類 ------------------------------ */

  const registrationTypeGroup = (
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
      {config.showWoSearchButton && (
        <div className='wot-top-row'>
          <button
            className='set-btnnew_high set-primary'
            // レイアウト確認用の画面では表示のみ（遷移しない）
            onClick={() => {
              if (config.layoutOnly) return
              navigate('/factory/work-order-time-registration-choose', {
                state: { targetPath: getFactoryPath(factory) },
              })
            }}
          >
            WO検索
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>WO作業時間実績登録</div>
          <div className='set-body'>
            <div className='set-formnew_high '>
              <div className='wot-header-container '>
                <div className='wot-info-soll box-padding-innput'>
                  {/* 日付 */}
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className={config.labelClassName}>日付</label>
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

                  {/* 人 */}
                  <div className='wot-info-grid wot-info-grid-2'>
                    <label className={config.labelClassName}>人</label>
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

                  {/* 千葉工場：作業場 */}
                  {config.showWorkplace && (
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
                        style={{ backgroundColor: '#d9d9d9', outline: 'none' }}
                      />
                    </div>
                  )}

                  {/* 五泉工場：工程状況初期値／作業順序／備考 */}
                  {config.showProcessDefaults && (
                    <>
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
                    </>
                  )}

                </div>

                {isGosen ? (
                  <div className='wot-header-actions'>
                    <div className='wot-radio-container'>{registrationTypeGroup}</div>
                  </div>
                ) : (
                  <div className='wot-radio-container'>{registrationTypeGroup}</div>
                )}
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName={config.gridClassName}
              gridStyle={gridStyle}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              isRowActive={(rowKey) => activeRowId === Number(rowKey)}
              onRowActivate={(rowKey) => setActiveRowId(Number(rowKey))}
            />

            {/* フッター部 */}
            <div className='wot-footer-summary wot-radio-container'>
              {/* 開始・終了（千葉工場／共通） */}
              {config.footerLayout !== 'gosen' && (
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
                    <button
                      type='button'
                      className='hand-date-btn2'
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
                      onChange={(e) => setWorkEndTime(e.target.value.replace(/[^0-9:]/g, ''))}
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

                  {/* 千葉工場は同じ行に作業時間を表示する */}
                  {config.footerLayout === 'chiba' && (
                    <>
                      <div className='wot-footer-item'>
                        <label className='wot-footer-label'>作業時間</label>
                        <input className='wot-grid-value2' value={workDurationHours} readOnly />
                      </div>

                      <div className='wot-footer-item'>
                        <label className='wot-footer-label wot-bg-span-chiba'>時間</label>
                        <input className='wot-grid-value2 wot-grid-value-chiba' value={workDurationMinutes} readOnly />
                        <label className='wot-footer-label wot-bg-span'>分</label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 作業時間・目標時間計（五泉工場／共通） */}
              {config.footerLayout !== 'chiba' && (
                <div className={config.footerLayout === 'common' ? 'wot-footer-row wot-footer-row-common' : 'wot-footer-row'}>
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
              )}
            </div>

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
                手入力
              </button>

              {config.showStartStopButton ? (
                <button
                  className='set-btn set-hand-input-btn'
                  // レイアウト確認用の画面では表示のみ
                  onClick={config.layoutOnly ? undefined : handleWorkStartStop}
                  disabled={workStartStopDisabled}
                  style={{
                    opacity: workStartStopDisabled ? 0.5 : 1,
                    cursor: workStartStopDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {workStartStopState === 'idle' ? '作業開始' : '作業終了'}
                </button>
              ) : (
                <div>
                  <button className='set-btn set-hand-input-btn' onClick={() => { }} style={{ display: 'none' }}>
                    作業開始
                  </button>
                </div>
              )}

              <button className='set-btn set-warning' onClick={() => setShowBackConfirm(true)}>
                戻る
              </button>
            </ActionFooter>
          </div>

          {/* ------------------------------ モーダル ------------------------------ */}

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
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => { setShowClearConfirm(false); clearLoadedRowsGosen(); resetTableScroll() }}
                  >
                    はい
                  </button>
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
                  {isGosen ? '作業実績を登録しますか？' : '作業実績を登録します。\nWOは維持しますか？'}
                </div>
                <div className='set-modal-actions'>
                  {isGosen ? (
                    <>
                      <button className='set-modal-btn set-modal-yes' onClick={confirmRegisterClear}>YES</button>
                      <button
                        className='set-modal-btn set-modal-no'
                        onClick={() => {
                          setShowRegisterConfirm(false)
                          parentJanCodeInputRef.current?.focus()
                        }}
                      >
                        NO
                      </button>
                    </>
                  ) : (
                    <>
                      <button className='set-modal-btn set-modal-yes' onClick={confirmRegisterMaintain}>YES</button>
                      <button className='set-modal-btn set-modal-no' onClick={confirmRegisterClear}>NO</button>
                      <button
                        className='set-modal-btn set-modal-no'
                        onClick={() => {
                          setShowRegisterConfirm(false)
                          parentJanCodeInputRef.current?.focus()
                        }}
                      >
                        取消
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {showRegisterSuccessConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{isGosen ? '登録しました' : '作業実績を登録しました。'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={handleRegisterSuccess}>OK</button>
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
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => { setShowBackConfirm(false); navigate('/factory/factory') }}
                  >
                    NO
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => { setShowBackConfirm(false); parentJanCodeInputRef.current?.focus() }}
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

/* URLパラメータ（:factory）で工場を判別する。工場が変わったら状態を持ち越さないよう key を付ける */
const WorkOrderTimeRegistration = () => {
  const { factory } = useParams()
  const resolvedFactory: Factory = isFactoryValue(factory) ? factory : 'gosen'

  return <WorkOrderTimeRegistrationScreen key={resolvedFactory} factory={resolvedFactory} />
}

export { WorkOrderTimeRegistration }
