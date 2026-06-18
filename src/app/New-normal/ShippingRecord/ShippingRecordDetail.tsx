import {useEffect, useRef, useState, type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'
import {FaPlay} from 'react-icons/fa'


type Row = {
  id: number
  error: string
  item: string
  lot: string
  status: string
  build: number
  release: number
  move: string
  moveStorage: string
  name: string
  moveStorage2?: string
}

const ShippingRecordDetail = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      error: '',
      item: 'A01', // 品目No.
      lot: 'L01', // ロットシリアル
      status: '追加', // 状態
      build: 2, // 構成数
      release: 1, // 解除数
      move: 'W1', // 移動倉
      moveStorage: 'S1', // 移動保管場所
      name: '部品A', // 品名
      moveStorage2: '棚A', // 移動保管場所 (ตัวอย่างใหม่)
    },
    {
      id: 2,
      error: '',
      item: 'B02',
      lot: 'L02',
      status: '解除',
      build: 1,
      release: 0,
      move: 'W2',
      moveStorage: 'S2',
      name: '部品B',
      moveStorage2: '棚B',
    },
    {
      id: 3,
      error: '',
      item: 'C03',
      lot: 'L03',
      status: 'OV対応要',
      build: 3,
      release: 2,
      move: 'W3',
      moveStorage: 'S3',
      name: '部品C',
      moveStorage2: '棚C',
    },
    {
      id: 4,
      error: '',
      item: 'D04',
      lot: 'L04',
      status: '構成中',
      build: 4,
      release: 1,
      move: 'W1',
      moveStorage: 'S4',
      name: '部品D',
      moveStorage2: '棚D',
    },
    {
      id: 5,
      error: 'E',
      item: 'E05',
      lot: 'L05',
      status: '構成中',
      build: 2,
      release: 0,
      move: 'W2',
      moveStorage: 'S5',
      name: '部品E',
      moveStorage2: '棚E',
    },
    {
      id: 6,
      error: '',
      item: 'F06',
      lot: 'L06',
      status: '構成中',
      build: 5,
      release: 3,
      move: 'W3',
      moveStorage: 'S6',
      name: '部品F',
      moveStorage2: '棚F',
    },
    {
      id: 7,
      error: 'E',
      item: 'G07',
      lot: 'L07',
      status: '構成中',
      build: 1,
      release: 0,
      move: 'W1',
      moveStorage: 'S7',
      name: '部品G',
      moveStorage2: '棚G',
    },
    {
      id: 8,
      error: '',
      item: 'H08',
      lot: 'L08',
      status: '構成中',
      build: 3,
      release: 1,
      move: 'W2',
      moveStorage: 'S8',
      name: '部品H',
      moveStorage2: '棚H',
    },
    {
      id: 9,
      error: '',
      item: 'I09',
      lot: 'L09',
      status: '構成中',
      build: 2,
      release: 2,
      move: 'W3',
      moveStorage: 'S9',
      name: '部品I',
      moveStorage2: '棚I',
    },
    {
      id: 10,
      error: 'E',
      item: 'J10',
      lot: 'L10',
      status: '構成中',
      build: 6,
      release: 2,
      move: 'W1',
      moveStorage: 'S10',
      name: '部品J',
      moveStorage2: '棚J',
    },
    {
      id: 11,
      error: 'E',
      item: 'J10',
      lot: 'L10',
      status: '構成中',
      build: 6,
      release: 2,
      move: 'W1',
      moveStorage: 'S10',
      name: '部品J',
      moveStorage2: '棚J',
    },
    {
      id: 12,
      error: 'E',
      item: 'J10',
      lot: 'L10',
      status: '構成中',
      build: 6,
      release: 2,
      move: 'W1',
      moveStorage: 'S10',
      name: '部品J',
      moveStorage2: '棚J',
    },
    {
      id: 13,
      error: 'E',
      item: 'J10',
      lot: 'L10',
      status: '構成中',
      build: 6,
      release: 2,
      move: 'W1',
      moveStorage: 'S10',
      name: '部品J',
      moveStorage2: '棚J',
    },
        {
      id: 14,
      error: 'E',
      item: 'J10',
      lot: 'L10',
      status: '構成中',
      build: 6,
      release: 2,
      move: 'W1',
      moveStorage: 'S10',
      name: '部品J',
      moveStorage2: '棚J',
    },
        {
      id: 15,
      error: 'E',
      item: 'J10',
      lot: 'L10',
      status: '構成中',
      build: 6,
      release: 2,
      move: 'W1',
      moveStorage: 'S10',
      name: '部品J',
      moveStorage2: '棚J',
    },
  ])
  const [form, setForm] = useState({
    parentWarehouse: '羽田製品倉庫：W0040',
    parentItemNo: '0193090',
    moveWarehouse: '千葉倉庫（WMS）：W002',
    moveStorage: '',
    qty: '1',
    janCode: '',
  })
  const [parentItem, setParentItem] = useState('1197101')
  const [parentSerial, setParentSerial] = useState('ITEM0001')
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showDetailConfirm, setShowDetailConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([])
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const isAnyModalOpen =
    showHandInputConfirm ||
    showDeleteConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showDetailConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowDeleteConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowDetailConfirm(false)
    setShowBackConfirm(false)
  }

  const clearRows = () => {
    setRows([])
    setCheckedRowIds([])
  }

  const deleteCheckedRows = () => {
    setRows((prev) => prev.filter((row) => !checkedRowIds.includes(row.id)))
    setCheckedRowIds([])
  }
  const clearForm = () =>
    setForm({
      parentWarehouse: '',
      parentItemNo: '',
      moveWarehouse: '',
      moveStorage: '',
      qty: '',
      janCode: '',
    })

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
      requestAnimationFrame(() => {
        el.scrollTop = 0
        el.scrollLeft = 0
      })
    })
  }

  const clearFormAndRows = () => {
    clearForm()
    clearRows()
    resetTableScroll()
  }

  const handleRowClick = (rowId: number) => {
    setActiveRowId(rowId)
    setCheckedRowIds((prev) => (prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]))
  }

  const isAllChecked = rows.length > 0 && rows.every((row) => checkedRowIds.includes(row.id))

  const toggleAllChecked = (checked: boolean) => {
    if (checked) {
      setCheckedRowIds(rows.map((row) => row.id))
      return
    }
    setCheckedRowIds([])
  }

  const toggleRowChecked = (rowId: number, checked: boolean) => {
    setCheckedRowIds((prev) => {
      if (checked) {
        return prev.includes(rowId) ? prev : [...prev, rowId]
      }
      return prev.filter((id) => id !== rowId)
    })
  }

  const handleReleaseClick = (options?: {forceRelease?: boolean; forceHandInput?: boolean}) => {
    if (isAnyModalOpen) return
    if (options?.forceHandInput) {
      closeAllModals()
      setShowHandInputConfirm(true)
      return
    }
    if (!activeRow) {
      closeAllModals()
      setShowNoSelectionConfirm(true)
      return
    }
  }


  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) {
        return
      }
      if (event.key === 'F1') {
        pressedKeysRef.current.f1 = true
      }
      if (event.key === 'F8') {
        pressedKeysRef.current.f8 = true
      }
      if (pressedKeysRef.current.f1 && pressedKeysRef.current.f8) {
        event.preventDefault()
        handleReleaseClick({forceHandInput: true})
        return
      }

      if (event.key === 'F1') {
        event.preventDefault()
        closeAllModals()
        setShowClearConfirm(true)
        return
      }

      if (event.key === 'F2') {
        event.preventDefault()
        closeAllModals()
        setShowCompleteConfirm(true)
        return
      }

      if (event.key === 'F3') {
        event.preventDefault()
        handleReleaseClick({forceRelease: true})
        return
      }

      if (event.key === 'F4') {
        event.preventDefault()
        closeAllModals()
        setShowBackConfirm(true)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        pressedKeysRef.current.f1 = false
      }
      if (event.key === 'F8') {
        pressedKeysRef.current.f8 = false
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [activeRow, isAnyModalOpen])

  const tableColumns: Array<TFTableColumn<Row>> = [
        {
          key: 'arrow',
          headClassName: 'col-arrow-head',
          cellClassName: 'col-arrow',
          header: '',
          render: (row) => (activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null),
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
    {key: 'error', headClassName: 'col-error', cellClassName: 'col-error', header: 'E', render: (row) => row.error},
    {key: 'item', headClassName: 'col-item', cellClassName: 'col-item', header: 'ロットシリアル', render: (row) => row.item},
    {key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: '読込', render: (row) => row.lot},
    {key: 'status', headClassName: 'col-status', cellClassName: 'col-status', header: 'エラー', render: (row) => row.status},
    {key: 'build', headClassName: 'col-num', cellClassName: 'col-num', header: 'ロットシリアル', render: (row) => row.build},
    {key: 'release', headClassName: 'col-num', cellClassName: 'col-num', header: '読込', render: (row) => row.release},
    {key: 'move', headClassName: 'col-move', cellClassName: 'col-move', header: '倉庫', render: (row) => row.move},
    {key: 'move', headClassName: 'col-move', cellClassName: 'col-move', header: '保管場所', render: (row) => row.move},
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
                    <input
                    style={{textAlign: 'center'}}
                      value={parentSerial}
                      readOnly
                    />
                  </div>
                    <div className='set-row'>
                    <label>品目No.</label>
                    <input
                      value={parentItem}
                      style={{textAlign: 'center'}}
                      readOnly
                    />
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
               <button
                className='set-btn set-primary'
                onClick={() => setShowCompleteConfirm(true)}
                style={{ visibility: 'hidden' }}
              >
                削除
              </button> 
              <button
                className='set-btn set-primary set-success'
                onClick={() => handleReleaseClick({forceHandInput: true})}
                style={{ visibility: 'hidden' }}
              >
                出庫票印刷
              </button>

              <button
                className='set-btn set-success'
                onClick={() => setShowBackConfirm(true)}
              >
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
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        deleteCheckedRows()
                      }}
                    >
                      OK
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>投入明細確認を閉じますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/shipping-records')
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowBackConfirm(false)}
                    >
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

export {ShippingRecordDetail}
