import {useEffect,useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './BundlePage.css'
import {FaPlay} from 'react-icons/fa'

const BundlePage = () => {
      const navigate = useNavigate()
    const [rows, setRows] = useState([
      {
        id: 1,
        error: '',
        item: 'A01', // 品目No.
        lot: 'L01', // ロットシリアル
        status: '追加', // 状態
        build: 2, // 構成数
        release: 1, // 解除数
      },
      {
        id: 2,
        error: '',
        item: 'B02',
        lot: 'L02',
        status: '解除',
        build: 1,
        release: 0,
      },
      {
        id: 3,
        error: '',
        item: 'C03',
        lot: 'L03',
        status: 'OV対応要',
        build: 3,
        release: 2,
      },
      {
        id: 4,
        error: '',
        item: 'D04',
        lot: 'L04',
        status: '構成中',
        build: 4,
        release: 1,
      },
      {
        id: 5,
        error: 'E',
        item: 'E05',
        lot: 'L05',
        status: '構成中',
        build: 2,
        release: 0,
      },
      {
        id: 6,
        error: '',
        item: 'F06',
        lot: 'L06',
        status: '構成中',
        build: 5,
        release: 3,
      },
      {
        id: 7,
        error: 'E',
        item: 'G07',
        lot: 'L07',
        status: '構成中',
        build: 1,
        release: 0,
      },
      {
        id: 8,
        error: '',
        item: 'H08',
        lot: 'L08',
        status: '構成中',
        build: 3,
        release: 1,
      },
      {
        id: 9,
        error: '',
        item: 'I09',
        lot: 'L09',
        status: '構成中',
        build: 2,
        release: 2,
      },
      {
        id: 10,
        error: 'E',
        item: 'J10',
        lot: 'L10',
        status: '構成中',
        build: 6,
        release: 2,
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
    const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
    const isAnyModalOpen =
      showHandInputConfirm ||
      showDeleteConfirm ||
      showNoSelectionConfirm ||
      showClearConfirm ||
      showCompleteConfirm ||
      showBackConfirm
  
    const closeAllModals = () => {
      setShowHandInputConfirm(false)
      setShowDeleteConfirm(false)
      setShowNoSelectionConfirm(false)
      setShowClearConfirm(false)
      setShowCompleteConfirm(false)
      setShowBackConfirm(false)
    }
  
  
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
      if (activeRow?.status === '\u8ffd\u52a0' || activeRow?.status === '\u004f\u0056\u5bfe\u5fdc\u8981' || activeRow?.status === '\u89e3\u9664' || activeRow?.status === '\u69cb\u6210\u4e2d') {
        closeAllModals()
        setShowDeleteConfirm(true)
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
  
    return (
      <div className='mockup-page'>
        <div className='mockup-stage mockup-stage-dark'>
          <div className='mockup-frame'>
            <div className='set-header'>セット構成登録</div>
            <div className='set-body'>
              <div className='set-form'>
              <div className='set-row'>
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
              <div className='set-row'>
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
              <div className='set-row set-row-inline'>
                <label>保管場所</label>
                <input
                  value={form.qty}
                  onChange={(e) => setForm({...form, qty: e.target.value})}
                  className='set-small'
                />
                <span className='set-inline-label'>数量</span>
                <input
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                />
              </div>

              <div className='set-row'>
                {/* <label>数量</label> */}
                <div className='set-radio-group bundle-group'>
                  <label className='set-radio'>
                    <input
                      type='radio'
                      name='quantityRange'
                      value='from'
                      checked={quantityRange === 'from'}
                      onChange={() => setQuantityRange('from')}
                    />
                    From
                  </label>
                  <label className='set-radio'>
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
                <div className='set-row set-row-bundle'>
                <label>JANコード</label>
                <input
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                />
              </div>
              </div>
            
              <div className='set-row'>
                <label>移動保管場所</label>
                <input
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                />
              </div>
            </div>
  
              <div className='set-table-wrap'>
                <div className='set-table-tools'>
                </div>
                <div className='set-table'>
                  <div ref={tableScrollRef} className={rows.length === 0 ? 'set-table-scroll set-table-scroll-empty' : 'set-table-scroll'}>
                    <div className='set-table-grid-dispatch set-table-register'>
                      <div className='set-table-head'>
                        <span className='col-arrow-head'></span>
                        <span className='col-error'></span>
                        <span className='col-item'>品目No.</span>
                        <span className='col-lot'>ロットシリアル</span>
                        <span className='col-status'>指示</span>
                        <span className='col-num'>読込</span>
                        <span className='col-num'>品名</span>
                      </div>
                      <div className='set-table-head-divider' aria-hidden='true'></div>
                      <div className='set-table-body'>
                        {rows.length === 0 ? (
                          <div className='set-empty'></div>
                        ) : (
                          rows.map((row) => (
                            <div
                              className='set-table-row'
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
                              <span className='col-arrow'>
                                {activeRowId === row.id ? (
                                  <FaPlay className='col-row-arrow' />
                                ) : null}
                              </span>
                              <span className='col-error'>{row.error}</span>
                              <span className='col-item'>{row.item}</span>
                              <span className='col-lot'>{row.lot}</span>
                              <span className='col-status'>{row.status}</span>
                              <span className='col-num'>{row.build}</span>
                              <span className='col-num'>{row.release}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <div className='set-actions set-actions-row'>
                <button
                  className='set-btn set-danger'
                  onClick={() => setShowClearConfirm(true)}
                >
                  破棄
                </button>
                <button
                  className='set-btn set-primary'
                  onClick={() => setShowCompleteConfirm(true)}
                >
                  完了
                </button>
                <button
                  className='set-btn set-primary set-success'
                  onClick={() => handleReleaseClick({forceHandInput: true})}
                >
                  手入力
                </button>
                <button
                  className='set-btn set-warning'
                  onClick={() => setShowBackConfirm(true)}
                >
                  戻る
                </button>
              </div>
            </div>
              {showHandInputConfirm && (
                <div className='set-modal-backdrop' role='presentation'>
                  <div className='set-modal' role='dialog' aria-modal='true'>
                    <div className='set-modal-header'>確認</div>
                    <div className='set-modal-body'>品目情報を手入力しますか？</div>
                    <div className='set-modal-actions'>
                      <button
                        className='set-modal-btn set-modal-yes'
                        onClick={() => {
                          setShowHandInputConfirm(false)
                          navigate('/factory/bundle/hand-input')
                        }}
                      >
                        はい
                      </button>
                      <button
                        className='set-modal-btn set-modal-no'
                        onClick={() => {
                          setShowHandInputConfirm(false)
                        }}
                      >
                        いいえ
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
  
              {showDeleteConfirm && (
                <div className='set-modal-backdrop' role='presentation'>
                  <div className='set-modal' role='dialog' aria-modal='true'>
                    <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body'>{activeRow?.status === '\u89e3\u9664' ? (<>{'\u9078\u629e\u54c1\u76ee\u306e0\u3092'}<br />{'\u53d6\u308a\u6d88\u3057\u307e\u3059\u304b\uff1f'}</>) : activeRow?.status === '\u69cb\u6210\u4e2d' ? (<>{'\u9078\u629e\u54c1\u76ee\u30924\u500b\u3001'}<br />{'\u30bb\u30c3\u30c8\u89e3\u9664\u3057\u307e\u3059\u304b\uff1f'}</>) : (<>{'\u30bb\u30c3\u30c8\u8ffd\u52a0\u54c1\u3067\u3059\u3002'}<br />{'\u524a\u9664\u3057\u307e\u3059\u304b\uff1f'}</>)}</div>
                    <div className='set-modal-actions'>
                      <button
                        className='set-modal-btn set-modal-yes'
                        onClick={() => {
                          setShowDeleteConfirm(false)
                        }}
                      >
                        {'\u306f\u3044'}
                      </button>
                      <button
                        className='set-modal-btn set-modal-no'
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        {'\u3044\u3044\u3048'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showNoSelectionConfirm && (
                <div className='set-modal-backdrop' role='presentation'>
                  <div className='set-modal' role='dialog' aria-modal='true'>
                    <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body'>{'\u9078\u629e\u884c\u304c\u3042\u308a\u307e\u305b\u3093\u3002'}</div>
                    <div className='set-modal-actions'>
                      <button
                        className='set-modal-btn set-modal-yes'
                        onClick={() => setShowNoSelectionConfirm(false)}
                      >
                        {'\u004f\u004b'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showClearConfirm && (
                <div className='set-modal-backdrop' role='presentation'>
                  <div className='set-modal' role='dialog' aria-modal='true'>
                    <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body'>{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u3002'}<br />{'\u5b9c\u3057\u3044\u3067\u3059\u304b\uff1f'}</div>
                    <div className='set-modal-actions'>
                      <button
                        className='set-modal-btn set-modal-yes'
                        onClick={() => {
                          setShowClearConfirm(false)
                          clearFormAndRows()
                        }}
                      >
                        {'\u306f\u3044'}
                      </button>
                      <button
                        className='set-modal-btn set-modal-no'
                        onClick={() => setShowClearConfirm(false)}
                      >
                        {'\u3044\u3044\u3048'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showCompleteConfirm && (
                <div className='set-modal-backdrop' role='presentation'>
                  <div className='set-modal' role='dialog' aria-modal='true'>
                    <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body'>{'\u30bb\u30c3\u30c8\u69cb\u6210\u3092\u767b\u9332\u3057\u307e\u3057\u305f\u3002'}</div>
                    <div className='set-modal-actions'>
                      <button
                        className='set-modal-btn set-modal-yes'
                        onClick={() => setShowCompleteConfirm(false)}
                      >
                        {'\u004f\u004b'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showBackConfirm && (
                <div className='set-modal-backdrop' role='presentation'>
                  <div className='set-modal' role='dialog' aria-modal='true'>
                    <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body'>{'\u30e1\u30cb\u30e5\u30fc\u306b\u623b\u308a\u307e\u3059\u3002'}<br />{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u304b\uff1f'}</div>
                    <div className='set-modal-actions'>
                      <button
                        className='set-modal-btn set-modal-yes'
                        onClick={() => {
                          setShowBackConfirm(false)
                          navigate('/factory')
                        }}
                      >
                        {'\u306f\u3044'}
                      </button>
                      <button
                        className='set-modal-btn set-modal-no'
                        onClick={() => setShowBackConfirm(false)}
                      >
                        {'\u3044\u3044\u3048'}
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

export {BundlePage}
