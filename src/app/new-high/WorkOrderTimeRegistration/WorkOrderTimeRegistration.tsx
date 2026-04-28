import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'
import './WorkOrderTimeRegistration.css'


type Row = {
  id: number
  woNo: string
  itemNo: string
  itemName: string
}

const WorkOrderTimeRegistration = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      woNo: 'wo-20',
      itemNo: '202603310',
      itemName: '製品A',
    },
    {
      id: 2,
      woNo: 'wo-20',
      itemNo: 'a',
      itemName: '製品B',
    },
    {
      id: 3,
      woNo: 'wo-20',
      itemNo: 'b',
      itemName: '製品C',
    },
    {
      id: 4,
      woNo: 'wo-20',
      itemNo: 'c',
      itemName: '製品D',
    },
    {
      id: 5,
      woNo: 'wo-20',
      itemNo: 'd',
      itemName: '製品E',
    },
    {
      id: 6,
      woNo: 'wo-20',
      itemNo: 'e',
      itemName: '製品F',
    },
    {
      id: 7,
      woNo: 'wo-20',
      itemNo: 'f',
      itemName: '製品G',
    },
    {
      id: 8,
      woNo: 'wo-20',
      itemNo: 'g',
      itemName: '製品H',
    },
    {
      id: 9,
      woNo: 'wo-20',
      itemNo: 'h',
      itemName: '製品I',
    },
    {
      id: 10,
      woNo: 'wo-20',
      itemNo: 'i',
      itemName: '製品J',
    },
  ])

  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([])

  const isAnyModalOpen =
    showDeleteSelectedConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowDeleteSelectedConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowBackConfirm(false)
  }

  const handleDeleteSelected = () => {
    if (checkedRowIds.length === 0) {
      setShowNoSelectionConfirm(true)
      return
    }
    setShowDeleteSelectedConfirm(true)
  }

  const confirmDeleteSelected = () => {
    setRows((prev) => prev.filter((row) => !checkedRowIds.includes(row.id)))
    setCheckedRowIds([])
    setShowDeleteSelectedConfirm(false)
  }

  const clearAll = () => {
    setRows([])
    setCheckedRowIds([])
    setActiveRowId(null)
  }

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  const handleRowClick = (rowId: number) => {
    setActiveRowId(rowId)
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) return

      if (event.key === 'F1') {
        event.preventDefault()
        handleDeleteSelected()
        return
      }

      if (event.key === 'F2') {
        event.preventDefault()
        setShowCompleteConfirm(true)
        return
      }

      if (event.key === 'F4') {
        event.preventDefault()
        setShowBackConfirm(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [checkedRowIds, isAnyModalOpen])

  const tableColumns: Array<TFTableColumn<Row>> = [
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
    { key: 'woNo', headClassName: 'col-wo', cellClassName: 'col-wo', header: 'WoNo', render: (row) => row.woNo },
    { key: 'itemNo', headClassName: 'col-item-no', cellClassName: 'col-item-no', header: '品番', render: (row) => row.itemNo },
    { key: 'itemName', headClassName: 'col-item-name', cellClassName: 'col-item-name', header: '品名', render: (row) => row.itemName },
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>作業実績入力</div>
          <div className='set-body'>
            <div className='set-formnew_high'>
              <div className='wot-header-container'>
                {/* Left side: Info Grid */}
                <div className='wot-info-scroll'>
                  <div className='wot-info-grid'>
                    <label className='wot-grid-label wot-bg-blue'>人</label>
                    <input className='wot-grid-value' defaultValue='XXXXX' />
                    <input className='wot-grid-value wot-bg-gray' defaultValue='作業者X' />
                  </div>

                  <div className='wot-info-grid'>
                    <label className='wot-grid-label wot-bg-blue'>日付</label>
                    <input className='wot-grid-value' defaultValue='2026/02/19' />
                    <div className='wot-grid-value'></div>
                  </div>

                  <div className='wot-info-grid'>
                    <label className='wot-grid-label wot-bg-red'>作業場</label>
                    <input className='wot-grid-value wot-text-red' defaultValue='9005' />
                    <input className='wot-grid-value wot-bg-pink wot-text-red' defaultValue='研磨班' />
                  </div>
                </div>

                {/* Right side: Actions */}
                <div className='wot-header-actions'>
                  <div className='wot-top-row'>
                    <button className='set-btnnew_high set-primary'>WO選択</button>
                  </div>
                </div>
              </div>

              <div className='wot-radio-container'>
                <div className='wot-radio-title'>登録時間種類</div>
                <div className='wot-radio-group'>
                  <label className='wot-radio-item'>
                    <input type='radio' name='timeType' defaultChecked />
                    <span>労務</span>
                  </label>
                  <label className='wot-radio-item'>
                    <input type='radio' name='timeType' />
                    <span>段取</span>
                  </label>
                  <label className='wot-radio-item'>
                    <input type='radio' name='timeType' />
                    <span>機械</span>
                  </label>
                </div>
              </div>

              <div className='wot-main-actions'>
                <button className='wot-btn-large'>作業開始</button>
                <button className='wot-btn-large'>作業終了</button>
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='delivery-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => handleRowClick(Number(rowKey))}
            />

            <ActionFooter columns={3}>
              <button
                className='set-btn set-primary'
                onClick={handleDeleteSelected}
              >
                選択行削除
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => setShowCompleteConfirm(true)}
              >
                実績登録
              </button>

              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                戻る
              </button>
            </ActionFooter>
          </div>

          {showDeleteSelectedConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択された行を削除しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={confirmDeleteSelected}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowDeleteSelectedConfirm(false)}
                  >
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
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowNoSelectionConfirm(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showClearConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>読み込みデータを破棄します。<br />宜しいですか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowClearConfirm(false)
                      clearAll()
                      resetTableScroll()
                    }}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowClearConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>実績を登録しました。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowCompleteConfirm(false)}
                  >
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
                <div className='set-modal-body'>メニューに戻ります。<br />読み込みデータを破棄しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowBackConfirm(false)
                      navigate('/factory')
                    }}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowBackConfirm(false)}
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

export { WorkOrderTimeRegistration }

