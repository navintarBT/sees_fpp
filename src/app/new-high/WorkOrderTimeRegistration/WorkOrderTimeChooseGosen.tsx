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

type Row = {
    id: number
    woNumber: string
    orderQuantity: number
}

const GOSEN_ROWS: Row[] = [
  { id: 1, woNumber: 'wo-10', orderQuantity: 10 },
  { id: 2, woNumber: 'wo-20', orderQuantity: 10 },
  { id: 3, woNumber: 'wo-30', orderQuantity: 25 },
  { id: 4, woNumber: 'wo-40', orderQuantity: 25 },
  { id: 5, woNumber: 'wo-50', orderQuantity: 15 },
  { id: 6, woNumber: 'wo-60', orderQuantity: 15 },
  { id: 7, woNumber: 'wo-70', orderQuantity: 20 },
]

const CHIBA_ROWS: Row[] = [
  { id: 1, woNumber: 'wo-1', orderQuantity: 10 },
  { id: 2, woNumber: 'wo-2', orderQuantity: 10 },
  { id: 3, woNumber: 'wo-3', orderQuantity: 10 },
  { id: 4, woNumber: 'wo-4', orderQuantity: 15 },
  { id: 5, woNumber: 'wo-5', orderQuantity: 15 },
  { id: 6, woNumber: 'wo-6', orderQuantity: 10 },
  { id: 7, woNumber: 'wo-7', orderQuantity: 20 },
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
                            {/* input fields removed */}
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
                            <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
                            <button
                                className='set-btn set-primary'
                                disabled={selectedWoNumbers.length === 0}
                                onClick={handleLoad}
                            >
                                読込
                            </button>
                            <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
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