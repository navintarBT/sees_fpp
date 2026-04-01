import {useEffect,useRef, useState} from 'react'
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
        status: 'OV対応htyht要',
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
    const [showHandInput, setShowHandInput] = useState(false)
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
      if (showHandInput) {
        setShowHandInputConfirm(true)
        return
      }
      if (!activeRow) {
        setShowNoSelectionConfirm(true)
        return
      }
      if (activeRow?.status === '\u8ffd\u52a0' || activeRow?.status === '\u004f\u0056\u5bfe\u5fdc\u8981' || activeRow?.status === '\u89e3\u9664' || activeRow?.status === '\u69cb\u6210\u4e2d') {
        setShowDeleteConfirm(true)
        return
      }
    }
  
    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'F2') {
          event.preventDefault()
          setShowHandInput((prev) => !prev)
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
                <div className='set-table-tools-eq'>
                </div>
                <div className='set-table-eq'>
                  <div ref={tableScrollRef} className={rows.length === 0 ? 'set-table-scroll-eq set-table-scroll-empty-eq' : 'set-table-scroll-eq'}>
                    <div className='set-table-head-eq equipment-distribution-table-head-eq'>
                      <span className='col-arrow-head-eq'></span>
                      <span className='col-error-1-eq'></span>
                      <span className='col-item-eq'>From/To</span>
                      <span className='col-lot-eq'>品名</span>
                      <span className='col-status-1-eq'>品目No</span>
                      <span className='col-num-eq'>ロットシリアル</span>
                      <span className='col-num-eq'>数量</span>
                      <span className='col-move-eq'>	倉庫</span>
                      <span className='col-move-eq'>	保管場所</span>
                      <span className='col-name-eq'>品名</span>
                    </div>
                    <div className='set-table-body-eq'>
                      {rows.length === 0 ? (
                        <div className='set-empty-eq'></div>
                      ) : (
                        rows.map((row) => (
                          <div
                            className='set-table-row-eq bundle-row-eq equipment-distribution-row-eq'
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
                  className='set-btn-eq set-success-eq'
                  onClick={handleReleaseClick}
                  style={{ visibility: showHandInput ? 'visible' : 'hidden' }}
                  disabled={!showHandInput}
                  aria-hidden={!showHandInput}
                >
                  {showHandInput ? '手入力' : ''}
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
                    <div className='set-modal-header-eq'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body-eq'>{activeRow?.status === '\u89e3\u9664' ? (<>{'\u9078\u629e\u54c1\u76ee\u306e0\u3092'}<br />{'\u53d6\u308a\u6d88\u3057\u307e\u3059\u304b\uff1f'}</>) : activeRow?.status === '\u69cb\u6210\u4e2d' ? (<>{'\u9078\u629e\u54c1\u76ee\u30924\u500b\u3001'}<br />{'\u30bb\u30c3\u30c8\u89e3\u9664\u3057\u307e\u3059\u304b\uff1f'}</>) : (<>{'\u30bb\u30c3\u30c8\u8ffd\u52a0\u54c1\u3067\u3059\u3002'}<br />{'\u524a\u9664\u3057\u307e\u3059\u304b\uff1f'}</>)}</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => {
                          setShowDeleteConfirm(false)
                        }}
                      >
                        {'\u306f\u3044'}
                      </button>
                      <button
                        className='set-modal-btn-eq set-modal-no-eq'
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        {'\u3044\u3044\u3048'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showNoSelectionConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body-eq'>{'\u9078\u629e\u884c\u304c\u3042\u308a\u307e\u305b\u3093\u3002'}</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => setShowNoSelectionConfirm(false)}
                      >
                        {'\u004f\u004b'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showClearConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body-eq'>{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u3002'}<br />{'\u5b9c\u3057\u3044\u3067\u3059\u304b\uff1f'}</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => {
                          setShowClearConfirm(false)
                          clearFormAndRows()
                        }}
                      >
                        {'\u306f\u3044'}
                      </button>
                      <button
                        className='set-modal-btn-eq set-modal-no-eq'
                        onClick={() => setShowClearConfirm(false)}
                      >
                        {'\u3044\u3044\u3048'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showCompleteConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body-eq'>{'\u30bb\u30c3\u30c8\u69cb\u6210\u3092\u767b\u9332\u3057\u307e\u3057\u305f\u3002'}</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => setShowCompleteConfirm(false)}
                      >
                        {'\u004f\u004b'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
  
              {showBackConfirm && (
                <div className='set-modal-backdrop-eq' role='presentation'>
                  <div className='set-modal-eq' role='dialog' aria-modal='true'>
                    <div className='set-modal-header-eq'>{'\u78ba\u8a8d'}</div>
                    <div className='set-modal-body-eq'>{'\u30e1\u30cb\u30e5\u30fc\u306b\u623b\u308a\u307e\u3059\u3002'}<br />{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u304b\uff1f'}</div>
                    <div className='set-modal-actions-eq'>
                      <button
                        className='set-modal-btn-eq set-modal-yes-eq'
                        onClick={() => {
                          setShowBackConfirm(false)
                          navigate('/factory')
                        }}
                      >
                        {'\u306f\u3044'}
                      </button>
                      <button
                        className='set-modal-btn-eq set-modal-no-eq'
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
      </div>
    )
}

export {Equipment_Distribution }