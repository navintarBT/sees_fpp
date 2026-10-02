import { useEffect, useRef, useState } from 'react'
import { FaPlay, FaRegCalendarAlt } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import {
    TableSection,
    type TableColumn as TFTableColumn,
} from '../../components/TableSection/TableSection'
import { ScaleToFit } from '../../components/ScaleToFit/ScaleToFit'
import { useOrientation, orientationState } from '../../hooks/useOrientation'

const ORIENTATION_KEY = 'workOrderTimeRegistrationOrientation'
const TERMINAL_ID = 'ABCDEFGHIJ'

const DEFAULT_TARGET_PATH = '/factory/work-order-time-registration/gosen'

const getSessionStorageKey = (targetPath: string) => {
    const suffix = targetPath === '/factory/work-order-time-registration/chiba' ? 'chiba' : 'gosen'
    return `workOrderTimeRegistrationSelectedWoNumbers_${suffix}`
}

// Row type with all required fields according to document
type Row = {
    id: number
    seiban: string        // 製番
    woNumber: string      // WO番号
    orderType: string     // オーダータイプ
    itemNumber: string    // 品番
    itemName: string      // 品名
    workplace: string     // 作業場
    opOrder: string       // 作業順序
    requestDate: string   // 要求日 (YYYY/MM/DD)
    adjustDate: string    // 調整日 (YYYY/MM/DD)
    orderQuantity: number // オーダー数量 (明細部には表示しないが登録画面へ引き継ぐ)
}

// 明細部の表示項目（WO完了実績登録のWO検索画面と統一）
const DETAIL_COLUMNS: Array<{ key: keyof Row; header: string }> = [
    { key: 'seiban', header: '製番' },
    { key: 'woNumber', header: 'WO番号' },
    { key: 'orderType', header: 'オーダータイプ' },
    { key: 'itemNumber', header: '品番' },
    { key: 'itemName', header: '品名' },
    { key: 'workplace', header: '作業場' },
    { key: 'opOrder', header: '作業順序' },
    { key: 'requestDate', header: '要求日' },
    { key: 'adjustDate', header: '開始日' },
]

// 要求日・開始日は「YYYY/MM/DD」形式
const formatDate = (year: number, month: number, day: number) =>
    `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`

const toDateValue = (date: Date) => formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate())

const parseDateValue = (value: string) => {
    const [year, month, day] = value.split('/').map(Number)
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

const DateField = ({
    value,
    onChange,
    isOpen,
    onToggle,
}: {
    value: string
    onChange: (value: string) => void
    isOpen: boolean
    onToggle: (open: boolean) => void
}) => {
    const [calendarMonth, setCalendarMonth] = useState(() => parseDateValue(value || toDateValue(new Date())))
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                onToggle(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onToggle])

    const openPicker = () => {
        setCalendarMonth(parseDateValue(value || toDateValue(new Date())))
        onToggle(!isOpen)
    }

    const changeMonth = (amount: number) => {
        setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
    }

    const selectDate = (nextValue: string) => {
        onChange(nextValue)
        onToggle(false)
    }

    const calendarDays = getCalendarDays(calendarMonth)
    const monthLabel = calendarMonth.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })

    return (
        <div ref={wrapperRef} className='hand-date-field-register' style={{ flex: 1, minWidth: 0 }}>
            <input
                readOnly
                style={{ width: '100%', height: 50, fontSize: 25, borderRadius: 14, border: '2px solid #5b6d86', padding: '0 22px', cursor: 'pointer' }}
                value={value}
                onClick={openPicker}
                placeholder='yyyy/mm/dd'
            />
            <button type='button' className='hand-date-btn2' aria-label='Choose date' onClick={openPicker}>
                <FaRegCalendarAlt />
            </button>
            {isOpen && (
                <div className='hand-calendar hand-calendar-gosen' role='dialog' aria-label='Choose date'>
                    <div className='hand-calendar-header'>
                        <button type='button' onClick={() => changeMonth(-1)}>{'<'}</button>
                        <span>{monthLabel}</span>
                        <button type='button' onClick={() => changeMonth(1)}>{'>'}</button>
                    </div>
                    <div className='hand-calendar-weekdays'>
                        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>
                    <div className='hand-calendar-days'>
                        {calendarDays.map(({ date, value: dayValue, inMonth }) => (
                            <button
                                type='button'
                                key={dayValue}
                                className={[
                                    'hand-calendar-day',
                                    inMonth ? '' : 'hand-calendar-muted',
                                    dayValue === value ? 'hand-calendar-selected' : '',
                                ].filter(Boolean).join(' ')}
                                onClick={() => selectDate(dayValue)}
                            >
                                {date.getDate()}
                            </button>
                        ))}
                    </div>
                    <div className='hand-calendar-footer'>
                        <button type='button' className='hand-calendar-btn-today' onClick={() => selectDate(toDateValue(new Date()))}>今日</button>
                        <button type='button' className='hand-calendar-btn-clear' onClick={() => selectDate('')}>クリア</button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Gosen factory data (from document example)
const GOSEN_ROWS: Row[] = [
    { id: 1, seiban: '製番001', woNumber: 'WO-001', orderType: '製造', itemNumber: 'PRD-001', itemName: '製品A', workplace: '作業場001', opOrder: '10', requestDate: '2026/06/01', adjustDate: '2026/06/03', orderQuantity: 10 },
    { id: 2, seiban: '製番002', woNumber: 'WO-002', orderType: '外注', itemNumber: 'PRD-002', itemName: '製品B', workplace: '作業場002', opOrder: '20', requestDate: '2026/06/02', adjustDate: '2026/06/04', orderQuantity: 10 },
    { id: 3, seiban: '製番003', woNumber: 'WO-003', orderType: '製造', itemNumber: 'PRD-003', itemName: '製品C', workplace: '作業場003', opOrder: '30', requestDate: '2026/06/03', adjustDate: '2026/06/05', orderQuantity: 25 },
    { id: 4, seiban: '製番004', woNumber: 'WO-004', orderType: '外注', itemNumber: 'PRD-004', itemName: '製品D', workplace: '作業場001', opOrder: '10', requestDate: '2026/06/04', adjustDate: '2026/06/06', orderQuantity: 25 },
    { id: 5, seiban: '製番005', woNumber: 'WO-005', orderType: '製造', itemNumber: 'PRD-005', itemName: '製品E', workplace: '作業場002', opOrder: '20', requestDate: '2026/06/05', adjustDate: '2026/06/07', orderQuantity: 15 },
]

// Chiba factory data (according to document)
const CHIBA_ROWS: Row[] = [
    { id: 1, seiban: '製番001', woNumber: 'WO-001', orderType: '製造', itemNumber: 'PRD-001', itemName: '製品A', workplace: '作業場001', opOrder: '10', requestDate: '2026/06/01', adjustDate: '2026/06/03', orderQuantity: 10 },
    { id: 2, seiban: '製番002', woNumber: 'WO-002', orderType: '外注', itemNumber: 'PRD-002', itemName: '製品B', workplace: '作業場002', opOrder: '20', requestDate: '2026/06/02', adjustDate: '2026/06/04', orderQuantity: 10 },
    { id: 3, seiban: '製番003', woNumber: 'WO-003', orderType: '製造', itemNumber: 'PRD-003', itemName: '製品C', workplace: '作業場003', opOrder: '30', requestDate: '2026/06/03', adjustDate: '2026/06/05', orderQuantity: 10 },
    { id: 4, seiban: '製番004', woNumber: 'WO-004', orderType: '外注', itemNumber: 'PRD-004', itemName: '製品D', workplace: '作業場001', opOrder: '10', requestDate: '2026/06/04', adjustDate: '2026/06/06', orderQuantity: 15 },
    { id: 5, seiban: '製番005', woNumber: 'WO-005', orderType: '製造', itemNumber: 'PRD-005', itemName: '製品E', workplace: '作業場002', opOrder: '20', requestDate: '2026/06/05', adjustDate: '2026/06/07', orderQuantity: 15 },
]

// Helper to read current selection from sessionStorage (changed from localStorage)
const readStoredSelection = (targetPath: string): string[] => {
    const storageKey = getSessionStorageKey(targetPath)
    const storedSelection = sessionStorage.getItem(storageKey) // Changed to sessionStorage
    if (!storedSelection) return []
    try {
        const parsed = JSON.parse(storedSelection)
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
    } catch {
        return []
    }
}

const WorkOrderTimeRegistrationChoose = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isLandscape = useOrientation(ORIENTATION_KEY)
    const locationState = location.state as { selectedWoNumbers?: string[]; targetPath?: string } | null
    const targetPath = locationState?.targetPath ?? DEFAULT_TARGET_PATH
    const rows = targetPath === '/factory/work-order-time-registration/chiba' ? CHIBA_ROWS : GOSEN_ROWS

    // Initialize directly from sessionStorage (changed from localStorage)
    const [selectedWoNumbers, setSelectedWoNumbers] = useState<string[]>(() =>
        readStoredSelection(targetPath)
    )
    const [showLoadConfirm, setShowLoadConfirm] = useState(false)
    const [workplaceFilter, setWorkplaceFilter] = useState('')
    const [requestDateFrom, setRequestDateFrom] = useState('')
    const [requestDateTo, setRequestDateTo] = useState('')
    const [startDateFrom, setStartDateFrom] = useState('')
    const [startDateTo, setStartDateTo] = useState('')
    const [filteredRows, setFilteredRows] = useState<Row[] | null>(null)
    const [openDateField, setOpenDateField] = useState<string | null>(null)

    // Re-sync selection when the page becomes visible again
    useEffect(() => {
        const syncFromStorage = () => {
            setSelectedWoNumbers(readStoredSelection(targetPath))
        }

        syncFromStorage()
        window.addEventListener('focus', syncFromStorage)
        return () => window.removeEventListener('focus', syncFromStorage)
    }, [targetPath])

    const displayRows = filteredRows ?? rows

    const handleSearch = () => {
        const filtered = rows.filter((row) => {
            if (workplaceFilter && !row.workplace.includes(workplaceFilter)) return false
            if (requestDateFrom && row.requestDate < requestDateFrom) return false
            if (requestDateTo && row.requestDate > requestDateTo) return false
            if (startDateFrom && row.adjustDate < startDateFrom) return false
            if (startDateTo && row.adjustDate > startDateTo) return false
            return true
        })
        setFilteredRows(filtered)
    }

    const handleLoad = () => {
        if (selectedWoNumbers.length === 0) return
        setShowLoadConfirm(true)
    }

    const confirmLoad = () => {
        storeSelection()
        setShowLoadConfirm(false)
        const selectedRows = rows.filter((row) => selectedWoNumbers.includes(row.woNumber))
        navigate(targetPath, {
            state: { selectedWoNumbers, selectedRows, orientation: isLandscape ? 'landscape' : 'portrait' },
        })
    }

    const toggleWoSelection = (row: Row) => {
        setSelectedWoNumbers((prev) =>
            prev.includes(row.woNumber)
                ? prev.filter((item) => item !== row.woNumber)
                : [...prev, row.woNumber]
        )
    }

    const storeSelection = () => {
        const storageKey = getSessionStorageKey(targetPath)
        sessionStorage.setItem(storageKey, JSON.stringify(selectedWoNumbers)) // Changed to sessionStorage
    }

    const clearSelection = () => {
        const storageKey = getSessionStorageKey(targetPath)
        sessionStorage.removeItem(storageKey)
        setSelectedWoNumbers([])
    }

    const isSelectedWoNumber = (woNumber: string) => selectedWoNumbers.includes(woNumber)

    // Table columns: arrow + 製番/WO番号/オーダータイプ/品番/品名/作業場/作業順序/要求日/調整日
    const tableColumns: Array<TFTableColumn<Row>> = [
        {
            key: 'arrow',
            headClassName: 'col-arrow-head',
            cellClassName: 'col-arrow',
            header: '',
            render: (row) => (
                isSelectedWoNumber(row.woNumber) ? <FaPlay className='col-row-arrow' /> : null
            ),
        },
        ...DETAIL_COLUMNS.map(({ key, header }) => ({
            key,
            headClassName: 'col-wo-search',
            cellClassName: 'col-wo-search',
            header,
            render: (row: Row) => row[key],
        })),
    ]

    return (
        <div className='mockup-page'>
            <ScaleToFit active={isLandscape} designWidth={1920} designHeight={1200}>
            <div className={isLandscape ? 'mockup-stage mockup-stage-dark mockup-stage-landscape' : 'mockup-stage mockup-stage-dark'}>
                <div className='mockup-frame'>
                    {isLandscape ? (
                        <>
                            <div className='set-header-landscape'>
                                <span className='set-header-title'>WO検索</span>
                                <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
                            </div>
                            <div className='set-body-landscape set-body-landscape-3row'>
                                <div className='set-form-landscape'>
                                    <div className='set-form-landscape-row'>
                                        <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                                            <label style={{width: 150, flexShrink: 0}}>作業場</label>
                                            <input
                                                style={{flex: 1, minWidth: 0}}
                                                value={workplaceFilter}
                                                onChange={(e) => setWorkplaceFilter(e.target.value)}
                                            />
                                            <input disabled readOnly style={{flex: 1, minWidth: 0, backgroundColor: '#d9d9d9', outline: 'none'}} value='' />
                                        </div>
                                        <div style={{flex: '1 1 0', minWidth: 0}} />
                                    </div>
                                    <div className='set-form-landscape-row'>
                                        <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                                            <label style={{width: 150, flexShrink: 0}}>要求日</label>
                                            <DateField
                                                value={requestDateFrom}
                                                onChange={setRequestDateFrom}
                                                isOpen={openDateField === 'requestFrom'}
                                                onToggle={(open) => setOpenDateField(open ? 'requestFrom' : null)}
                                            />
                                            <span style={{fontSize: 25, flexShrink: 0}}>～</span>
                                            <DateField
                                                value={requestDateTo}
                                                onChange={setRequestDateTo}
                                                isOpen={openDateField === 'requestTo'}
                                                onToggle={(open) => setOpenDateField(open ? 'requestTo' : null)}
                                            />
                                        </div>
                                        <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                                            <label style={{width: 150, flexShrink: 0}}>開始日</label>
                                            <DateField
                                                value={startDateFrom}
                                                onChange={setStartDateFrom}
                                                isOpen={openDateField === 'startFrom'}
                                                onToggle={(open) => setOpenDateField(open ? 'startFrom' : null)}
                                            />
                                            <span style={{fontSize: 25, flexShrink: 0}}>～</span>
                                            <DateField
                                                value={startDateTo}
                                                onChange={setStartDateTo}
                                                isOpen={openDateField === 'startTo'}
                                                onToggle={(open) => setOpenDateField(open ? 'startTo' : null)}
                                            />
                                        </div>
                                        <button
                                            type='button'
                                            className='set-search-btn set-primary'
                                            style={{height: 50, fontSize: 25, flexShrink: 0, width: 160}}
                                            onClick={handleSearch}
                                        >
                                            検索
                                        </button>
                                    </div>
                                </div>

                                <TableSection
                                    columns={tableColumns}
                                    rows={displayRows}
                                    className='inbound-table-landscape-wrap'
                                    gridClassName='work-order-choose-table inbound-table-landscape'
                                    getRowKey={(row) => row.id}
                                    isRowActive={(_rowKey, row) => isSelectedWoNumber(row.woNumber)}
                                    onRowActivate={(_rowKey, row) => toggleWoSelection(row)}
                                />

                                <ActionFooter columns={5} gapX={50} className='set-actionfooter-landscape-offset'>
                                    <button className='set-btn set-btn-landscape set-success' onClick={() => navigate(targetPath, orientationState(isLandscape))}>
                                        戻る
                                    </button>
                                    <div aria-hidden='true' />
                                    <div aria-hidden='true' />
                                    <div aria-hidden='true' />
                                    <button
                                        className='set-btn set-btn-landscape set-primary'
                                        disabled={selectedWoNumbers.length === 0}
                                        onClick={handleLoad}
                                    >
                                        読込
                                    </button>
                                </ActionFooter>
                            </div>
                        </>
                    ) : (
                        <>
                    <div className='set-header'>WO検索</div>
                    <div className='set-body'>
                        <TableSection
                            columns={tableColumns}
                            rows={rows}
                            gridClassName='work-order-choose-table'
                            getRowKey={(row) => row.id}
                            isRowActive={(_rowKey, row) => isSelectedWoNumber(row.woNumber)}
                            onRowActivate={(_rowKey, row) => toggleWoSelection(row)}
                        />

                        <ActionFooter columns={4}>
                            <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>
                                読込
                            </button>
                            <button
                                className='set-btn set-primary'
                                disabled={selectedWoNumbers.length === 0}
                                onClick={handleLoad}
                            >
                                読込
                            </button>
                            <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>
                                読込
                            </button>
                            <button className='set-btn set-warning' onClick={() => navigate(targetPath)}>
                                戻る
                            </button>
                        </ActionFooter>
                    </div>
                        </>
                    )}

                    {showLoadConfirm && (
                        <div className='set-modal-backdrop' role='presentation'>
                            <div className='set-modal' role='dialog' aria-modal='true'>
                                <div className='set-modal-header'>確認</div>
                                <div className='set-modal-body'>
                                    選択したWO番号で読込を完了しますか？
                                </div>
                                <div className='set-modal-actions'>
                                    <button
                                        type='button'
                                        className='set-modal-btn set-modal-yes'
                                        onClick={confirmLoad}
                                    >
                                        はい
                                    </button>
                                    <button
                                        type='button'
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => setShowLoadConfirm(false)}
                                    >
                                        いいえ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </ScaleToFit>
        </div>
    )
}

export { WorkOrderTimeRegistrationChoose }