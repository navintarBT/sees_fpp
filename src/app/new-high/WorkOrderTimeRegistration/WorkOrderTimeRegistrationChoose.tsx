import { useEffect, useState } from 'react'
import { FaPlay } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import {
    TableSection,
    type TableColumn as TFTableColumn,
} from '../../components/TableSection/TableSection'

const SESSION_STORAGE_KEY = 'workOrderTimeRegistrationSelectedWoNumbers'

const WO_MOCKUP_DATA: Record<string, { completed: number; defective: number }> = {
    'WO-001': { completed: 9, defective: 1 },
    'WO-002': { completed: 5, defective: 5 },
    'WO-003': { completed: 8, defective: 2 },
    'WO-004': { completed: 2, defective: 5 },
    'WO-005': { completed: 6, defective: 4 },
    'WO-006': { completed: 4, defective: 6 },
    'WO-007': { completed: 9, defective: 1 },
    'WO-008': { completed: 7, defective: 3 },
    'WO-009': { completed: 4, defective: 6 },
    'WO-010': { completed: 5, defective: 5 },
}

type Row = {
    id: number
    woNumber: string
}

const WorkOrderTimeRegistrationChoose = () => {
    const navigate = useNavigate()
    const [selectedWoNumbers, setSelectedWoNumbers] = useState<string[]>([])
    const [showWoLoadConfirm, setShowWoLoadConfirm] = useState(false)
    const rows: Row[] = Object.keys(WO_MOCKUP_DATA).map((woNumber, index) => ({
        id: index + 1,
        woNumber,
    }))

    useEffect(() => {
        const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
        if (!saved) return

        try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) {
                setSelectedWoNumbers(parsed.filter((item): item is string => typeof item === 'string'))
            }
        } catch {
            // ignore invalid storage data
        }
    }, [])

    const toggleWoSelection = (woNumber: string) => {
        setSelectedWoNumbers((prev) =>
            prev.includes(woNumber) ? prev.filter((item) => item !== woNumber) : [...prev, woNumber]
        )
    }

    const storeSelection = () => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedWoNumbers))
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
            key: 'item',
            headClassName: 'col-item-delivery-wo',
            cellClassName: 'col-item-delivery-wo',
            header: 'WO番号',
            render: (row) => row.woNumber,
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
                            gridClassName='delivery-table'
                            getRowKey={(row) => row.id}
                            isRowActive={(_rowKey, row) => isSelectedWoNumber(row.woNumber)}
                            onRowActivate={(_rowKey, row) => toggleWoSelection(row.woNumber)}
                        />

                        <ActionFooter columns={4}>
                            <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
                            <button
                                className='set-btn set-primary'
                                disabled={selectedWoNumbers.length === 0}
                                onClick={() => selectedWoNumbers.length > 0 && setShowWoLoadConfirm(true)}
                            >
                                読込
                            </button>
                            <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
                            <button className='set-btn set-warning' onClick={() => navigate('/factory/work-order-time-registration-gosen')}>
                                戻る
                            </button>
                        </ActionFooter>
                    </div>

                </div>
            </div>
        </div>
    )
}

export { WorkOrderTimeRegistrationChoose }