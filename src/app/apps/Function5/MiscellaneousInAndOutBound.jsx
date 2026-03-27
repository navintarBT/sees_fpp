import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MiscellaneousInAndOutBound.css'
import { FaPlay } from 'react-icons/fa'

const MiscellaneousInAndOutBound = () => {
  const navigate = useNavigate()
  const [qty, setQty] = useState(1);
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const isEnabled = parentItem && parentSerial

  const [rows, setRows] = useState([
    {
      id: 1,
      error: '',
      item: 'A01', // 品目No.
      lot: 'L01', // ロットシリアル
      status: '中', // 状態
      build: 2, // 構成数
      release: 1, // 解除数
      move: 'W1', // 移動倉
      moveStorage: 'S1', // 移動保管場所
      name: '部品A', // 品名
      moveStorage2: '棚A', // 移動保管場所
    },
    {
      id: 2,
      error: 'E',
      item: 'B02',
      lot: 'L02',
      status: '済',
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
      status: '中',
      build: 3,
      release: 2,
      move: 'W3',
      moveStorage: 'S3',
      name: '部品C',
      moveStorage2: '棚C',
    },
    {
      id: 4,
      error: 'E',
      item: 'D04',
      lot: 'L04',
      status: '済',
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
      status: '中',
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
      status: '済',
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
      status: '中',
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
      status: '済',
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
      status: '中',
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
      status: '済',
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
  const [showHandInput, setShowHandInput] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [activeRowId, setActiveRowId] = useState(null)
  const handleRowClick = (rowId) => {
    setActiveRowId(rowId)
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

  const clearFormAndRows = () => {
    clearForm()
    clearRows()
  }

  useEffect(() => {
    const onKeyDown = (event) => {
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
      <div className='mockup-stage rlr-stage-light'>
        <div className='rlr-frame'>
          <div className='rlr-header'>レンタル戻り構成登録</div>
          <div className='rlr-body'>
            <div className='rlr-form'>
              <div className='rlr-row'>
                <label>JANコード(親)</label>
                <select
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({ ...form, parentWarehouse: e.target.value })}
                >
                  <option value=''>-----</option>
                  <option value='羽田製品倉庫：W0040'>倉庫A : W0040</option>
                  <option value='羽田製品倉庫：W0041'>倉庫A : W0041</option>
                  <option value='羽田製品倉庫：W0042'>倉庫A : W0042</option>
                </select>
              </div>

              <div className='rlr-row2'>
                <label>状態</label>
                <div className="rlr-qty-group badioBtnFun10">
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="中"
                      checked={qty === 1}
                      onChange={() => setQty(1)}
                    />
                    正常
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="済"
                      checked={qty === 2}
                      onChange={() => setQty(2)}
                    />
                    調査中
                  </label>
                </div>
              </div>

              <div className='rlr-row rlr-row-inline'>
                <label>数量</label>
                <input className='inputlinefirst'
                  readOnly={!isEnabled} placeholder=' '
                />
                <label className='labelserxore'>JANコード</label>
                <input
                  readOnly={!isEnabled} placeholder=' '
                />
              </div>
            </div>

            <div className='rlr-grid-wrap'>
              <div className='rlr-grid-toolbar'>
              </div>
              <div className='rlr-grid'>
                <div className='rlr-grid-scroll'>
                  <div className='rlr-grid-head'>
                    <span className='col-arrow-head'></span>
                    <span className='col-item'>品目No.</span>
                    <span className='col-lots'>ロットシリアル</span>
                    <span className='col-lots'>構成</span>
                    <span className='col-lots'>戻り</span>
                    <span className='col-lots'>状態</span>
                    <span className='col-lots'>品名</span>
                  </div>
                  <div className='rlr-grid-body'>
                    {rows.length === 0 ? (
                      <div className='rlr-no-data'>No Data</div>
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
                          <span className='col-lots'>{row.lot}</span>
                          <span className='col-statuss'>{row.status}</span>
                          <span className='col-num'>{row.build}</span>
                          <span className='col-num'>{row.release}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='rlr-action-bar rlr-action-bar-inline'>
              <button
                className='rlr-btn rlr-btn-danger'
                onClick={clearFormAndRows}
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                破棄
              </button>
              <button
                className='rlr-btn rlr-btn-primary'
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                完了
              </button>

              <button
                className='rlr-btn rlr-btn-success'
                onClick={showHandInput ? () => setShowHandInputConfirm(true) : clearRows}
              >
                {showHandInput ? '手入力' : '解除'}
              </button>

              <button
                className='rlr-btn rlr-btn-warning'
                onClick={() => navigate('/apps/mockup/mockups')}
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                戻る
              </button>
            </div>

            {showHandInputConfirm && (
              <div className='rlr-overlay' role='presentation'>
                <div className='rlr-dialog' role='dialog' aria-modal='true'>
                  <div className='rlr-dialog-title'>確認</div>
                  <div className='rlr-dialog-content'>品目情報を手入力しますか？</div>
                  <div className='rlr-dialog-actions'>
                    <button
                      className='rlr-dialog-btn rlr-dialog-btn-yes'
                      onClick={() => {
                        setShowHandInputConfirm(false)
                        navigate('/factory/SetMiscellaneousInAndOutBound5')
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='rlr-dialog-btn'
                      onClick={() => setShowHandInputConfirm(false)}
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

export default MiscellaneousInAndOutBound