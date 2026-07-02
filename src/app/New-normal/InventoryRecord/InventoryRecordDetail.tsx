import {useEffect, useRef, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'
import {FaPlay} from 'react-icons/fa'

type Row = {
  id: number
  error: string
  lot: string
  release: number
  move: string
  moveStorage: string
  status: string
}

const EXISTING_ROWS: Row[] = [
  {id: 1, error: '', lot: 'L01', release: 1, move: 'W1', moveStorage: 'S1', status: ''},
  {id: 2, error: '', lot: 'L02', release: 0, move: 'W2', moveStorage: 'S2', status: ''},
  {id: 3, error: '', lot: 'L03', release: 2, move: 'W3', moveStorage: 'S3', status: ''},
  {id: 4, error: '', lot: 'L04', release: 1, move: 'W1', moveStorage: 'S4', status: ''},
  {id: 5, error: 'E', lot: 'L05', release: 0, move: 'W2', moveStorage: 'S5', status: ''},
  {id: 6, error: '', lot: 'L06', release: 3, move: 'W3', moveStorage: 'S6', status: ''},
  {id: 7, error: 'E', lot: 'L07', release: 0, move: 'W1', moveStorage: 'S7', status: ''},
  {id: 8, error: '', lot: 'L08', release: 1, move: 'W2', moveStorage: 'S8', status: ''},
  {id: 9, error: '', lot: 'L09', release: 2, move: 'W3', moveStorage: 'S9', status: ''},
  {id: 10, error: 'E', lot: 'L10', release: 2, move: 'W1', moveStorage: 'S10', status: ''},
]

const MOCK_DETAIL: Record<number, {productName: string; itemNo: string; rows: Row[]}> = {
  1: {
    productName: '品名001',
    itemNo: '1001',
    rows: [
      {id: 1, error: '', lot: 'Lot001', release: 3, move: 'A倉庫', moveStorage: 'JDE基本保管場所', status: ''},
    ],
  },
  2: {
    productName: '品名002',
    itemNo: '1002',
    rows: [
      {id: 1, error: '', lot: 'Lot002', release: 1, move: 'A倉庫', moveStorage: 'JDE基本保管場所', status: ''},
      {id: 2, error: '', lot: 'Lot004', release: 1, move: 'A倉庫', moveStorage: 'JDE基本保管場所', status: ''},
    ],
  },
  3: {
    productName: '品名003',
    itemNo: '1003',
    rows: EXISTING_ROWS,
  },
}

const MOCK_DETAIL_OT: Record<number, {productName: string; itemNo: string; rows: Row[]}> = {
  1: {
    productName: '品名001',
    itemNo: '1001',
    rows: [
      {id: 1, error: '', lot: 'Lot001', release: 3, move: 'C事業所', moveStorage: '工場基本保管場所', status: ''},
    ],
  },
  2: {
    productName: '品名002',
    itemNo: '1002',
    rows: [
      {id: 1, error: '', lot: 'Lot002', release: 1, move: 'C事業所', moveStorage: '工場基本保管場所', status: ''},
      {id: 2, error: '', lot: 'Lot004', release: 1, move: 'C事業所', moveStorage: '工場基本保管場所', status: ''},
    ],
  },
  3: {
    productName: '品名003',
    itemNo: '1003',
    rows: EXISTING_ROWS,
  },
}

const MOCK_DETAIL_MB: Record<number, {productName: string; itemNo: string; rows: Row[]}> = {
  1: {
    productName: '品名005',
    itemNo: '1005',
    rows: [
      {id: 1, error: '', lot: '', release: 3, move: 'D事業所', moveStorage: '工場基本保管場所', status: ''},
    ],
  },
}

const InventoryRecordDetail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {activeRowId?: number; orderNo?: string} | null
  const selectedRowId: number = state?.activeRowId ?? 1
  const orderNo: string = state?.orderNo ?? ''
  const detailMap =
    orderNo === 'OT-12345678' ? MOCK_DETAIL_OT :
    orderNo === 'MB-12345678123456' ? MOCK_DETAIL_MB :
    MOCK_DETAIL
  const detailData = detailMap[selectedRowId] ?? detailMap[1]

  const [rows, setRows] = useState<Row[]>(detailData.rows)
  const [parentSerial] = useState(detailData.productName)
  const [parentItem] = useState(detailData.itemNo)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([])
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const isAnyModalOpen = showDeleteConfirm || showNoSelectionConfirm || showBackConfirm

  const deleteCheckedRows = () => {
    setRows((prev) => prev.filter((row) => !checkedRowIds.includes(row.id)))
    setCheckedRowIds([])
    setShowDeleteConfirm(false)
  }

  const handleRowClick = (rowId: number) => {
    setActiveRowId(rowId)
    setCheckedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId],
    )
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
      if (event.key === 'F1') pressedKeysRef.current.f1 = true
      if (event.key === 'F8') pressedKeysRef.current.f8 = true
      if (event.key === 'F4') {
        event.preventDefault()
        setShowBackConfirm(true)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'F1') pressedKeysRef.current.f1 = false
      if (event.key === 'F8') pressedKeysRef.current.f8 = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [isAnyModalOpen])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (checkedRowIds.includes(row.id) ? <FaPlay className='col-row-arrow' /> : null),
    },
    {
      key: 'check',
      headClassName: 'col-check',
      cellClassName: 'col-check',
      header: (
        <input
          type='checkbox'
          className='tf-tableCheckbox'
          checked={isAllChecked}
          onChange={(e) => toggleAllChecked(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label='Select all rows'
        />
      ),
      render: (row) => (
        <input
          type='checkbox'
          className='tf-tableCheckbox'
          checked={checkedRowIds.includes(row.id)}
          onChange={(e) => toggleRowChecked(row.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select row ${row.id}`}
        />
      ),
    },
    {key: 'error', headClassName: 'col-error', cellClassName: 'col-error', header: '', render: (row) => row.error},
    {key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: 'ロットシリアル', render: (row) => row.lot},
    {key: 'release', headClassName: 'col-num', cellClassName: 'col-num', header: '読込', render: (row) => row.release},
    {key: 'move', headClassName: 'col-move', cellClassName: 'col-move', header: '倉庫', render: (row) => row.move},
    {key: 'moveStorage', headClassName: 'col-move', cellClassName: 'col-move', header: '保管場所', render: (row) => row.moveStorage},
    {key: 'status', headClassName: 'col-status', cellClassName: 'col-status', header: 'ロット状況コード', render: (row) => row.status},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>入庫実績登録読込データ参照</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>品名</label>
                <input value={parentSerial} style={{textAlign: 'center'}} readOnly />
              </div>
              <div className='set-row'>
                <label>品目No.</label>
                <input value={parentItem} style={{textAlign: 'center'}} readOnly />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='woPartsIssuanceDetail-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              isRowActive={(rowKey) => checkedRowIds.includes(Number(rowKey))}
              onRowActivate={(rowKey) => handleRowClick(Number(rowKey))}
            />

            <ActionFooter columns={4}>
              <button className='set-btn set-danger' onClick={() => {
                if (checkedRowIds.length === 0) {
                  setShowNoSelectionConfirm(true)
                } else {
                  setShowDeleteConfirm(true)
                }
              }}>
                削除
              </button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>

              </button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>

              </button>
              <button className='set-btn set-warning' onClick={() => setShowBackConfirm(true)}>
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
                    YES
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={() => setShowDeleteConfirm(false)}>
                    NO
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
                <div className='set-modal-header'>{'確認'}</div>
                <div className='set-modal-body'>読込データ参照画面を閉じますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowBackConfirm(false)
                      navigate('/factory/inventory-records')
                    }}
                  >
                    YES
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={() => setShowBackConfirm(false)}>
                    NO
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

export {InventoryRecordDetail}
