import {useEffect, useRef, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'
import {FaPlay} from 'react-icons/fa'

type Row = {
  id: number
  error: string
  lot: string
  release: string
  move: string
  moveStorage: string
}

const ShippingRecordDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {
    name?: string
    item?: string
    lot?: string
    release?: string
    moveStorage?: string
    moveWarehouse?: string
  } | null

  const [parentSerial] = useState(state?.name ?? '')
  const [parentItem] = useState(state?.item ?? '')
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      error: '',
      lot: state?.lot ?? '',
      release: state?.release ?? '',
      move: state?.moveWarehouse ?? '',
      moveStorage: state?.moveStorage ?? '',
    },
  ])

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([])
  const isAnyModalOpen = showDeleteConfirm || showNoSelectionConfirm || showBackConfirm

  const handleRowClick = (rowId: number) => {
    setActiveRowId((prev) => (prev === rowId ? null : rowId))
    setCheckedRowIds((prev) => (prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]))
  }

  const deleteCheckedRows = () => {
    setRows((prev) => prev.filter((row) => !checkedRowIds.includes(row.id)))
    setCheckedRowIds([])
    setActiveRowId(null)
    setShowDeleteConfirm(false)
  }

  const isAllChecked = rows.length > 0 && rows.every((row) => checkedRowIds.includes(row.id))

  const toggleAllChecked = (checked: boolean) => {
    setCheckedRowIds(checked ? rows.map((row) => row.id) : [])
  }

  const toggleRowChecked = (rowId: number, checked: boolean) => {
    setCheckedRowIds((prev) => {
      if (checked) return prev.includes(rowId) ? prev : [...prev, rowId]
      return prev.filter((id) => id !== rowId)
    })
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) return
      if (event.key === 'F4') {
        event.preventDefault()
        setShowBackConfirm(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isAnyModalOpen])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null),
    },
    {key: 'error', headClassName: 'col-error', cellClassName: 'col-error', header: '', render: (row) => row.error},
    {key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: 'ロットシリアル', render: (row) => row.lot},
    {key: 'release', headClassName: 'col-num', cellClassName: 'col-num', header: '読込', render: (row) => row.release},
    {key: 'move', headClassName: 'col-move', cellClassName: 'col-move', header: '倉庫', render: (row) => row.move},
    {key: 'moveStorage', headClassName: 'col-moveStorage', cellClassName: 'col-moveStorage', header: '保管場所', render: (row) => row.moveStorage},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>出庫実績登録読込データ参照</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>品名</label>
                <input value={parentSerial} className='set-input-gray' style={{textAlign: 'center'}} readOnly />
              </div>
              <div className='set-row'>
                <label>品目No.</label>
                <input value={parentItem} className='set-input-gray' style={{textAlign: 'center'}} readOnly />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='woPartsIssuanceDetail-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => handleRowClick(Number(rowKey))}
            />

            <ActionFooter columns={4}>
              <button
                className='set-btn set-danger'
                onClick={() => {
                  if (checkedRowIds.length === 0) {
                    setShowNoSelectionConfirm(true)
                  } else {
                    setShowDeleteConfirm(true)
                  }
                }}
              >
                削除
              </button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}></button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}></button>
              <button className='set-btn set-success' onClick={() => setShowBackConfirm(true)}>
                戻る
              </button>
            </ActionFooter>
          </div>

          {showDeleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択した行を削除しますか？</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={deleteCheckedRows}>
                    はい
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={() => setShowDeleteConfirm(false)}>
                    いいえ
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
                  <button className='set-modal-btn set-modal-yes' onClick={() => setShowNoSelectionConfirm(false)}>
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
                <div className='set-modal-body'>読込データ参照画面を閉じますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowBackConfirm(false)
                      navigate('/factory/shipping-records')
                    }}
                  >
                    はい
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={() => setShowBackConfirm(false)}>
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

export {ShippingRecordDetail}
