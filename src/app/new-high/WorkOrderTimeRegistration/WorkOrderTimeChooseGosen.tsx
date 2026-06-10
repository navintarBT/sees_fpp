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
    woNumber: string      // WoNo
    itemNumber: string    // 品番
    itemName: string      // 品名
    orderQuantity: number // オーダー数量
}

// Gosen factory data (from document example)
const GOSEN_ROWS: Row[] = [
    { id: 1, woNumber: 'WO-001', itemNumber: 'PRD-001', itemName: '製品A', orderQuantity: 10 },
    { id: 2, woNumber: 'WO-002', itemNumber: 'PRD-002', itemName: '製品B', orderQuantity: 10 },
    { id: 3, woNumber: 'WO-003', itemNumber: 'PRD-003', itemName: '製品C', orderQuantity: 25 },
    { id: 4, woNumber: 'WO-004', itemNumber: 'PRD-004', itemName: '製品D', orderQuantity: 25 },
    { id: 5, woNumber: 'WO-005', itemNumber: 'PRD-005', itemName: '製品E', orderQuantity: 15 },
]

// Chiba factory data (according to document)
const CHIBA_ROWS: Row[] = [
    { id: 1, woNumber: 'WO-001', itemNumber: 'PRD-001', itemName: '製品A', orderQuantity: 10 },
    { id: 2, woNumber: 'WO-002', itemNumber: 'PRD-002', itemName: '製品B', orderQuantity: 10 },
    { id: 3, woNumber: 'WO-003', itemNumber: 'PRD-003', itemName: '製品C', orderQuantity: 10 },
    { id: 4, woNumber: 'WO-004', itemNumber: 'PRD-004', itemName: '製品D', orderQuantity: 15 },
    { id: 5, woNumber: 'WO-005', itemNumber: 'PRD-005', itemName: '製品E', orderQuantity: 15 },
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

    // Table columns: arrow, WoNo, 品番, 品名
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
        {
            key: 'woNumber',
            headClassName: 'col-wo-number',
            cellClassName: 'col-wo-number',
            header: 'WoNo',
            render: (row) => row.woNumber,
        },
        {
            key: 'itemNumber',
            headClassName: 'col-item-number',
            cellClassName: 'col-item-number',
            header: '品番',
            render: (row) => row.itemNumber,
        },
        {
            key: 'itemName',
            headClassName: 'col-item-name',
            cellClassName: 'col-item-name',
            header: '品名',
            render: (row) => row.itemName,
        },
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