import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './DispatchPage.css'
import {FaPlay} from 'react-icons/fa'

const DispatchPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([
    {
      id: 1,
      error: '',
      item: 'A01', // 品目No.
      lot: 'L01', // ロットシリアル
      status: '中', // 状態
      build: 2, // 構成数
      release: 1, // 解除数
    },
    {
      id: 2,
      error: 'E',
      item: 'B02',
      lot: 'L02',
      status: '済',
      build: 1,
      release: 0,
    },
    {
      id: 3,
      error: '',
      item: 'C03',
      lot: 'L03',
      status: '中',
      build: 3,
      release: 2,
    },
    {
      id: 4,
      error: 'E',
      item: 'D04',
      lot: 'L04',
      status: '済',
      build: 4,
      release: 1,
    },
    {
      id: 5,
      error: 'E',
      item: 'E05',
      lot: 'L05',
      status: '中',
      build: 2,
      release: 0,
    },
    {
      id: 6,
      error: '',
      item: 'F06',
      lot: 'L06',
      status: '済',
      build: 5,
      release: 3,
    },
    {
      id: 7,
      error: 'E',
      item: 'G07',
      lot: 'L07',
      status: '中',
      build: 1,
      release: 0,
    },
    {
      id: 8,
      error: '',
      item: 'H08',
      lot: 'L08',
      status: '済',
      build: 3,
      release: 1,
    },
    {
      id: 9,
      error: '',
      item: 'I09',
      lot: 'L09',
      status: '中',
      build: 2,
      release: 2,
    },
    {
      id: 10,
      error: 'E',
      item: 'J10',
      lot: 'L10',
      status: '済',
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
  const [showHandInput, setShowHandInput] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [showRowConfirm, setShowRowConfirm] = useState(false)

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

  const clearFormAndRows = () => {
    clearForm()
    clearRows()
  }

  const handleRowClick = (rowId: number) => {
    setActiveRowId(rowId)
  }

  const handleHandInputClick = () => {
    setShowHandInputConfirm(true)
  }

  const handleRowConfirm = (rowId: number) => {
    setSelectedRowId(rowId)
    setShowRowConfirm(true)
  }

  const selectedRow = rows.find((row) => row.id === selectedRowId) ?? null

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault()
        setShowHandInput((prev) => !prev)

      }
      if (event.key === 'Enter' && activeRowId !== null && !showDetail && !showRowConfirm) {
        event.preventDefault()
        handleRowConfirm(activeRowId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeRowId, showDetail, showRowConfirm])

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>セット構成登録</div>

          <div className='set-body'>
            {showDetail ? (
              <>
                <div className='set-form'>
                  <div className='set-row'>
                    <label>品名</label>
                    <input value={selectedRow?.item ?? ''} readOnly />
                  </div>
                  <div className='set-row'>
                    <label>品目No.</label>
                    <input value={selectedRow?.item ?? ''} readOnly />
                  </div>
                </div>

                <div className='set-table-wrap'>
                  <div className='set-table-tools'></div>
                  <div className='set-table'>
                    <div className='set-table-scroll'>
                      <div className='set-table-head set-table-head-detail'>
                        <span className='col-check'>削除</span>
                        <span className='col-lot'>ロットシリアル</span>
                        <span className='col-num'>読込</span>
                        <span className='col-move'>倉庫</span>
                        <span className='col-move'>保管場所</span>
                        <span className='col-name'> </span>
                      </div>
                      <div className='set-table-body'>
                        {rows.length === 0 ? (
                          <div className='set-empty'>No Data</div>
                        ) : (
                          rows.map((row) => (
                            <div className='set-table-row set-table-row-detail' key={row.id}>
                              <span className='col-check'>
                                <input type='checkbox' />
                              </span>
                              <span className='col-lot'>{row.lot}</span>
                              <span className='col-num'>{row.release}</span>
                              <span className='col-move'>{row.item}</span>
                              <span className='col-move'>{row.item}</span>
                              <span className='col-name'> </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='set-actions set-actions-row'>
                  <button
                    className='set-btn set-danger'
                    style={{ visibility: 'hidden' }}
                  >
                    破棄
                  </button>
                  <button
                    className='set-btn set-primary'
                  >
                    完了
                  </button>
                  <button
                    className='set-btn set-success'
                    style={{ visibility: 'hidden' }}
                  >
                    手入力
                  </button>
                  <button
                    className='set-btn set-warning'
                    onClick={() => setShowDetail(false)}
                  >
                    戻る
                  </button>
                </div>
              </>
            ) : (
              <>
            <div className='set-form'>
              <div className='set-row'>
                <label>出荷No.</label>
                <input
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                />
              </div>
              <div className='set-row'>
                <label>倉庫</label>
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
                <label>保管場所</label>
                <input
                  value={form.parentItemNo}
                  onChange={(e) => setForm({...form, parentItemNo: e.target.value})}
                />
              </div>
                <div className='set-row set-row-inline'>
                <label>数量</label>
                <input
                  value={form.qty}
                  onChange={(e) => setForm({...form, qty: e.target.value})}
                  className='set-small'
                />
                <span className='set-inline-label'>JANコード</span>
                <input
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                />
              </div>
              <div className='set-row'>
                <label>移動先</label>
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
                <div className='set-table-scroll'>
                  <div className='set-table-head'>
                    <span className='col-arrow-head'></span>
                    <span className='col-error'>エラー</span>
                    <span className='col-item'>品目No.</span>
                    <span className='col-lot'>ロットシリアル</span>
                    <span className='col-status'>指示</span>
                    <span className='col-num'>読込</span>
                    <span className='col-num'>品名</span> 
                  </div>
                  <div className='set-table-body'>
                    {rows.length === 0 ? (
                      <div className='set-empty'>No Data</div>
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
                              if (e.key === 'Enter') {
                                handleRowConfirm(row.id)
                              }
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

            <div className='set-actions set-actions-row'>
              <button
                className='set-btn set-danger'
                onClick={clearFormAndRows}
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                破棄
              </button>
              <button
                className='set-btn set-primary'
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                完了
              </button>
              <button
                className='set-btn set-success'
                onClick={handleHandInputClick}
              >
                手入力
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => navigate('/apps/mockup/mockups')}
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                戻る
              </button>
            </div>
              </>
            )}

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
                        navigate('hand-input')
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowHandInputConfirm(false)}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRowConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>選択行の読込内容を表示しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowRowConfirm(false)
                        setShowDetail(true)
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowRowConfirm(false)}
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

export {DispatchPage}
