import { useEffect, useState } from 'react'
import { FaPlay } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import {
    TableSection,
    type TableColumn as TFTableColumn,
} from '../../components/TableSection/TableSection'

const DEFAULT_TARGET_PATH = '/factory/work-order-time-registration-gosen'

const getSessionStorageKey = (targetPath: string) => {
    const suffix = targetPath === '/factory/work-order-time-registration-chiba' ? 'chiba' : 'gosen'
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
    { key: 'adjustDate', header: '調整日' },
]

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
    const locationState = location.state as { selectedWoNumbers?: string[]; targetPath?: string } | null
    const targetPath = locationState?.targetPath ?? DEFAULT_TARGET_PATH
    const rows = targetPath === '/factory/work-order-time-registration-chiba' ? CHIBA_ROWS : GOSEN_ROWS

    // Initialize directly from sessionStorage (changed from localStorage)
    const [selectedWoNumbers, setSelectedWoNumbers] = useState<string[]>(() =>
        readStoredSelection(targetPath)
    )
    const [showLoadConfirm, setShowLoadConfirm] = useState(false)

    // Re-sync selection when the page becomes visible again
    useEffect(() => {
        const syncFromStorage = () => {
            setSelectedWoNumbers(readStoredSelection(targetPath))
        }

        syncFromStorage()
        window.addEventListener('focus', syncFromStorage)
        return () => window.removeEventListener('focus', syncFromStorage)
    }, [targetPath])

    const handleLoad = () => {
        if (selectedWoNumbers.length === 0) return
        setShowLoadConfirm(true)
    }

    const confirmLoad = () => {
        storeSelection()
        setShowLoadConfirm(false)
        const selectedRows = rows.filter((row) => selectedWoNumbers.includes(row.woNumber))
        navigate(targetPath, {
            state: { selectedWoNumbers, selectedRows },
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
            <div className='mockup-stage mockup-stage-dark'>
                <div className='mockup-frame'>
                    <div className='set-header'>WO選択</div>
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
            </div>
        </div>
    )
}

export { WorkOrderTimeRegistrationChoose }