import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './Equipment_Distribution.css'
import './Equipment_Distribution_Main.css'
import {FaPlay} from 'react-icons/fa'

const Equipment_Distribution = () => {
  const navigate = useNavigate()
    const [rows, setRows] = useState([
      {
        id: 1,
        error: '',
        item: 'A01',
        lot: 'L01',
        status: '追加',
        build: 2,
        release: 1,
        move: 'W1',
        moveStorage: 'S1',
        name: '部品A',
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
      },   
         {
        id: 11,
        error: 'E',
        item: 'J11',
        lot: 'L11',
        status: '構成中',
        build: 6,
        release: 2,
        move: 'W1',
        moveStorage: 'S10',
        name: '部品J',
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
    const [quantityRange, setQuantityRange] = useState<'from' | 'to'>('from')
    const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
    const tableScrollRef = useRef<HTMLDivElement | null>(null)
  
    const [showBackConfirm, setShowBackConfirm] = useState(false)
  
    const [activeRowId, setActiveRowId] = useState<number | null>(null)
    const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  
    const clearRows = () => setRows([])
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
    }
  
    const handleReleaseClick = () => {
      if (!activeRow) {
        setShowNoSelectionConfirm(true)
        return
      }
      if (activeRow?.status === '追加' || activeRow?.status === 'OV対応htyht要' || activeRow?.status === '解除' || activeRow?.status === '構成中') {
        setShowDeleteConfirm(true)
        return
      }
    }
  
    const handleHandInputClick = () => {
      setShowHandInputConfirm(true)
    }
  
    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'F2') {
          event.preventDefault()
          setShowHandInputConfirm(true)
        }
      }
      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    }, [])
  
    return (
      <div className='mockup-page'>
        <div className='mockup-stage mockup-stage-dark'>
          <div className='mockup-frame'>
            <div className='set-header-eq'>セット構成登録</div>
            <div className='set-body-eq'>
              <div className='set-form-eq'>
              <div className='set-row-eq'>
                <label>FR倉庫</label>
                <select
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                >
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>
              <div className='set-row-eq'>
                <label>TO倉庫</label>
                <select
                  value={form.moveWarehouse}
                  onChange={(e) => setForm({...form, moveWarehouse: e.target.value})}
                >
                  <option value=''></option>
                  <option value='千葉倉庫（WMS）：W002'>千葉倉庫（WMS）：W002</option>
                  <option value='千葉倉庫（WMS）：W003'>千葉倉庫（WMS）：W003</option>
                  <option value='千葉倉庫（WMS）：W004'>千葉倉庫（WMS）：W004</option>
                </select>
              </div>
              <div className='set-row-eq set-row-inline-eq'>
                <label>保管場所</label>
                <input
                  value={form.qty}
                  onChange={(e) => setForm({...form, qty: e.target.value})}
                  className='set-small-eq'
                />
                <span className='set-inline-label-eq'>数量</span>
                <input
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                />
              </div>

              <div className='set-row-eq-1'>
                <div className='set-radio-group-eq bundle-group-eq'>
                  <label className='set-radio-eq'>
                    <input
                      type='radio'
                      name='quantityRange'
                      value='from'
                      checked={quantityRange === 'from'}
                      onChange={() => setQuantityRange('from')}
                    />
                    From
                  </label>
                  <label className='set-radio-eq'>
                    <input
                      type='radio'
                      name='quantityRange'
                      value='to'
                      checked={quantityRange === 'to'}
                      onChange={() => setQuantityRange('to')}
                    />
                    To
                  </label>
                </div>
                <div className='set-row-eq set-row-bundle-eq'>
                <label>JANコード</label>
                <input
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                />
              </div>
              </div>
            
              <div className='set-row-eq'>
                <label> 理由 </label>
                <input
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                />
              </div>
            </div>
  
              <div className='set-table-wrap-eq'>
                <div className='set-table-eq'>
                  <div ref={tableScrollRef} className={rows.length === 0 ? 'set-table-scroll-eq set-table-scroll-empty-eq' : 'set-table-scroll-eq'}>
                    <div className='set-table-grid-equipment'>
                      {/* Header */}
                      <div className='set-table-head-equipment'>
                        <span className='col-arrow-head-eq'></span>
                        <span className='col-error-1-eq'></span>
                        <span className='col-item-eq'>From/To</span>
                        <span className='col-lot-eq'>品名</span>
                        <span className='col-status-1-eq'>品目No</span>
                        <span className='col-num-eq'>ロットシリアル</span>
                        <span className='col-num-eq'>数量</span>
                        <span className='col-move-eq'>倉庫</span>
                        <span className='col-move-eq'>保管場所</span>
                        <span className='col-name-eq'>品名</span>
                      </div>
                      
                      {/* Divider */}
                      <div className='set-table-head-divider-equipment' aria-hidden='true'></div>
                      
                      {/* Body */}
                      <div className='set-table-body-equipment'>
                        {rows.length === 0 ? (
                          <div className='set-empty-equipment'>データがありません</div>
                        ) : (
                          rows.map((row) => (
                            <div
                              className='set-table-row-equipment'
                              key={row.id}
                              role='button'
                              tabIndex={0}
                              onClick={() => handleRowClick(row.id)}
                              onFocus={() => setActiveRowId(row.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  handleRowClick(row.id)
                                }
                              }}
                            >
                              <span className='col-arrow-eq'>
                                {activeRowId === row.id ? (
                                  <FaPlay className='col-row-arrow-eq' />
                                ) : null}
                              </span>
                              <span className='col-error-1-eq'>{row.error}</span>
                              <span className='col-item-eq'>{row.item}</span>
                              <span className='col-lot-eq'>{row.lot}</span>
                              <span className='col-status-1-eq'>{row.status}</span>
                              <span className='col-num-eq'>{row.build}</span>
                              <span className='col-num-eq'>{row.release}</span>
                              <span className='col-move-eq'>{row.move}</span>
                              <span className='col-move-eq'>{row.moveStorage}</span>
                              <span className='col-name-eq'>{row.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div className='set-actions-eq set-actions-row-eq'>
                <button
                  className='set-btn-eq set-danger-eq'
                  onClick={() => setShowClearConfirm(true)}
                >
                  破棄
                </button>
                <button
                  className='set-btn-eq set-primary-eq'
                  onClick={() => setShowCompleteConfirm(true)}
                >
                  完了
                </button>
                <button
                  className='set-btn-eq set-hand-input-btn'
                  onClick={handleHandInputClick}
                >
                  手入力
                </button>
                <button
                  className='set-btn-eq set-warning-eq'
                  onClick={() => setShowBackConfirm(true)}
                >
                  戻る
                </button>
              </div>
  
              {showHandInputConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>確認</div>
                    <div className='set-modal-body-eq'>品目情報を手入力しますか？</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => {
                          setShowHandInputConfirm(false)
                          navigate('/factory/equipment-distribution/manual-input')
                        }}
                      >
                        はい
                      </button>
                      <button
                        className='set-modal-btn-eq set-modal-no-eq'
                        onClick={() => setShowHandInputConfirm(false)}
                      >
                        いいえ
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showDeleteConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>確認</div>
                    <div className='set-modal-body-eq'>{activeRow?.status === '解除' ? (<>選択品目の0を<br />取り消しますか？</>) : activeRow?.status === '構成中' ? (<>選択品目を4個、<br />セット解除しますか？</>) : (<>セット追加品です。<br />削除しますか？</>)}</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => {
                          setShowDeleteConfirm(false)
                        }}
                      >
                        はい
                      </button>
                      <button
                        className='set-modal-btn-eq set-modal-no-eq'
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        いいえ
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showNoSelectionConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>確認</div>
                    <div className='set-modal-body-eq'>選択行がありません。</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => setShowNoSelectionConfirm(false)}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showClearConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>確認</div>
                    <div className='set-modal-body-eq'>読込データを破棄します。<br />宜しいですか？</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => {
                          setShowClearConfirm(false)
                          clearFormAndRows()
                        }}
                      >
                        はい
                      </button>
                      <button
                        className='set-modal-btn-eq set-modal-no-eq'
                        onClick={() => setShowClearConfirm(false)}
                      >
                        いいえ
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showCompleteConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>確認</div>
                    <div className='set-modal-body-eq'>セット構成を登録しました。</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => setShowCompleteConfirm(false)}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showBackConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>確認</div>
                    <div className='set-modal-body-eq'>メニューに戻ります。<br />読込データを破棄しますか？</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => {
                          setShowBackConfirm(false)
                          navigate('/factory')
                        }}
                      >
                        はい
                      </button>
                      <button
                        className='set-modal-btn-eq set-modal-no-eq'
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
      </div>
    )
}

export {Equipment_Distribution}