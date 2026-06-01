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
    { id: 1, woNumber: 'wo-10', itemNumber: 'A001', itemName: '製品A', orderQuantity: 10 },
    { id: 2, woNumber: 'wo-20', itemNumber: 'B002', itemName: '製品B', orderQuantity: 10 },
    { id: 3, woNumber: 'wo-30', itemNumber: 'C003', itemName: '製品C', orderQuantity: 25 },
    { id: 4, woNumber: 'wo-40', itemNumber: 'D004', itemName: '製品D', orderQuantity: 25 },
    { id: 5, woNumber: 'wo-50', itemNumber: 'E005', itemName: '製品E', orderQuantity: 15 },
    { id: 6, woNumber: 'wo-60', itemNumber: 'F006', itemName: '製品F', orderQuantity: 15 },
    { id: 7, woNumber: 'wo-70', itemNumber: 'G007', itemName: '製品G', orderQuantity: 20 },
]

// Chiba factory data (according to document)
const CHIBA_ROWS: Row[] = [
    { id: 1, woNumber: 'wo-1', itemNumber: 'a', itemName: '製品a', orderQuantity: 10 },
    { id: 2, woNumber: 'wo-2', itemNumber: 'b', itemName: '製品b', orderQuantity: 10 },
    { id: 3, woNumber: 'wo-3', itemNumber: 'c', itemName: '製品c', orderQuantity: 10 },
    { id: 4, woNumber: 'wo-4', itemNumber: 'd', itemName: '製品d', orderQuantity: 15 },
    { id: 5, woNumber: 'wo-5', itemNumber: 'e', itemName: '製品e', orderQuantity: 15 },
    { id: 6, woNumber: 'wo-6', itemNumber: 'f', itemName: '製品f', orderQuantity: 10 },
    { id: 7, woNumber: 'wo-7', itemNumber: 'g', itemName: '製品g', orderQuantity: 20 },
    { id: 8, woNumber: 'wo-8', itemNumber: 'h', itemName: '製品h', orderQuantity: 15 },
]

const WorkOrderTimeRegistrationChoose = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const locationState = location.state as { selectedWoNumbers?: string[]; targetPath?: string } | null
    const targetPath = locationState?.targetPath ?? DEFAULT_TARGET_PATH
    const rows = targetPath === '/factory/work-order-time-registration-chiba' ? CHIBA_ROWS : GOSEN_ROWS
    const [selectedWoNumbers, setSelectedWoNumbers] = useState<string[]>([])
    const [showLoadConfirm, setShowLoadConfirm] = useState(false)

    // Restore selected WO numbers from sessionStorage on mount or when targetPath changes
    useEffect(() => {
        const storageKey = getSessionStorageKey(targetPath)
        const storedSelection = sessionStorage.getItem(storageKey)
        if (storedSelection) {
            try {
                setSelectedWoNumbers(JSON.parse(storedSelection))
            } catch (e) {
                console.error('Failed to parse stored selection:', e)
            }
        }
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
            prev.includes(row.woNumber) ? prev.filter((item) => item !== row.woNumber) : [...prev, row.woNumber]
        )
    }

    const storeSelection = () => {
        const storageKey = getSessionStorageKey(targetPath)
        sessionStorage.setItem(storageKey, JSON.stringify(selectedWoNumbers))
    }

    const isSelectedWoNumber = (woNumber: string) => selectedWoNumbers.includes(woNumber)

    // Table columns: arrow, WoNo, 品番, 品名, オーダー数量
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
        {
            key: 'orderQuantity',
            headClassName: 'col-order-quantity',
            cellClassName: 'col-order-quantity',
            header: 'オーダー数量',
            render: (row) => row.orderQuantity,
        },
    ]

    return (
        <div className='mockup-page'>
            <div className='mockup-stage mockup-stage-dark'>
                <div className='mockup-frame'>
                    <div className='set-header'>WO選択</div>
                    <div className='set-body'>
                        <div className='set-form'>
                            {/* 作業場 filter field - according to document */}
                            <div className='wot-info-grid wot-info-grid-2' style={{ marginBottom: '16px' }}>
                                <label className='wot-grid-label wot-bg-blue'>作業場</label>
                                <select className='wot-grid-value2'>
                                    <option value=''>選択してください</option>
                                    <option value='9005'>研磨班 (9005)</option>
                                    <option value='9003'>組立班 (9003)</option>
                                    <option value='9004'>加工班 (9004)</option>
                                </select>
                            </div>
                        </div>

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