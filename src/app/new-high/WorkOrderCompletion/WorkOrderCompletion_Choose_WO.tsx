import {useState} from 'react'
import {FaPlay} from 'react-icons/fa'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {
  TableSection,
  type TableColumn as TFTableColumn,
} from '../../components/TableSection/TableSection'

const WO_MOCKUP_DATA: Record<string, {completed: number; defective: number}> = {
  'WO-001': {completed: 9, defective: 1},
  'WO-002': {completed: 5, defective: 5},
  'WO-003': {completed: 8, defective: 2},
  'WO-004': {completed: 2, defective: 5},
  'WO-005': {completed: 6, defective: 4},
  'WO-006': {completed: 4, defective: 6},
  'WO-007': {completed: 9, defective: 1},
  'WO-008': {completed: 7, defective: 3},
  'WO-009': {completed: 4, defective: 6},
  'WO-010': {completed: 5, defective: 5},
}

type Row = {
  id: number
  woNumber: string
}

const WorkOrderCompletion_Choose_WO = () => {
  const navigate = useNavigate()
  const [selectedWoNumber, setSelectedWoNumber] = useState('')
  const [showWoLoadConfirm, setShowWoLoadConfirm] = useState(false)
  const rows: Row[] = Object.keys(WO_MOCKUP_DATA).map((woNumber, index) => ({
    id: index + 1,
    woNumber,
  }))
  const activeRowId = rows.find((row) => row.woNumber === selectedWoNumber)?.id ?? null

  const selectWoNumber = (woNumber: string) => {
    setSelectedWoNumber(woNumber)
  }

  const completeWoSelection = () => {
    navigate('/factory/work-order-completion', {
      state: {selectedWoNumber},
    })
  }

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (
        row.woNumber === selectedWoNumber ? <FaPlay className='col-row-arrow' /> : null
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
              activeRowKey={activeRowId}
              isRowActive={(_rowKey, row) => row.woNumber === selectedWoNumber}
              onRowActivate={(_rowKey, row) => selectWoNumber(row.woNumber)}
            />

            <ActionFooter columns={4}>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>{'\u8AAD\u8FBC'}</button>
              <button
                className='set-btn set-primary'
                disabled={!selectedWoNumber}
                onClick={() => selectedWoNumber && setShowWoLoadConfirm(true)}
              >
                読込
              </button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>{'\u8AAD\u8FBC'}</button>
              <button className='set-btn set-warning' onClick={() => navigate('/factory/work-order-completion')}>
                戻る
              </button>
            </ActionFooter>
          </div>

          {showWoLoadConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>
                  {selectedWoNumber}<br />
                  選択したWO番号で読込を完了しますか？
                </div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={completeWoSelection}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowWoLoadConfirm(false)}
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
  )
}

export {WorkOrderCompletion_Choose_WO}
