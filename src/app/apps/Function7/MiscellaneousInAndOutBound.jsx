import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './MiscellaneousInAndOutBound.css'
import {FaPlay} from 'react-icons/fa'

const MiscellaneousInAndOutBound = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([
    { id: 1, error: '', item: 'A01', lot: 'L01', status: '中', build: 2, release: 1, move: 'W1', moveStorage: 'S1', name: '部品A', moveStorage2: '棚A' },
    { id: 2, error: 'E', item: 'B02', lot: 'L02', status: '済', build: 1, release: 0, move: 'W2', moveStorage: 'S2', name: '部品B', moveStorage2: '棚B' },
    { id: 3, error: '', item: 'C03', lot: 'L03', status: '中', build: 3, release: 2, move: 'W3', moveStorage: 'S3', name: '部品C', moveStorage2: '棚C' },
    { id: 4, error: 'E', item: 'D04', lot: 'L04', status: '済', build: 4, release: 1, move: 'W1', moveStorage: 'S4', name: '部品D', moveStorage2: '棚D' },
    { id: 5, error: 'E', item: 'E05', lot: 'L05', status: '中', build: 2, release: 0, move: 'W2', moveStorage: 'S5', name: '部品E', moveStorage2: '棚E' },
    { id: 6, error: '', item: 'F06', lot: 'L06', status: '済', build: 5, release: 3, move: 'W3', moveStorage: 'S6', name: '部品F', moveStorage2: '棚F' },
    { id: 7, error: 'E', item: 'G07', lot: 'L07', status: '中', build: 1, release: 0, move: 'W1', moveStorage: 'S7', name: '部品G', moveStorage2: '棚G' },
    { id: 8, error: '', item: 'H08', lot: 'L08', status: '済', build: 3, release: 1, move: 'W2', moveStorage: 'S8', name: '部品H', moveStorage2: '棚H' },
    { id: 9, error: '', item: 'I09', lot: 'L09', status: '中', build: 2, release: 2, move: 'W3', moveStorage: 'S9', name: '部品I', moveStorage2: '棚I' },
    { id: 10, error: 'E', item: 'J10', lot: 'L10', status: '済', build: 6, release: 2, move: 'W1', moveStorage: 'S10', name: '部品J', moveStorage2: '棚J' },
  ])
  const [form, setForm] = useState({
    parentWarehouse: '羽田製品倉庫：W0040',
    moveWarehouse: '千葉倉庫（WMS）：W002',
    moveStorage: '',
    qty: '1',
    janCode: '',
  })
  const [showHandInput, setShowHandInput] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [activeRowId, setActiveRowId] = useState(null)

  const clearRows = () => setRows([])
  const clearForm = () =>
    setForm({ parentWarehouse: '', parentItemNo: '', moveWarehouse: '', moveStorage: '', qty: '', janCode: '' })

  const clearFormAndRows = () => { clearForm(); clearRows() }
  const handleRowClick = (rowId) => setActiveRowId(rowId)

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
    <div className='pg-root'>
      <div className='pg-stage pg-stage-light'>
        <div className='pg-frame'>
          <div className='pg-title-bar'>予定なし入出庫</div>
          <div className='pg-content'>
            <div className='pg-form'>
              <div className='pg-field-row'>
                <label>倉庫</label>
                <select
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                >
                  <option value=''>-----</option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>
              <div className='pg-field-row'>
                <label>保管場所</label>
                <input />
              </div>
              <div className='pg-field-row'>
                <label>引当数</label>
                <div className='pg-sign-group'>
                  <select className='pg-sign-select'>
                    <option value='+'>+</option>
                    <option value='-'>-</option>
                  </select>
                  <input />
                </div>
              </div>
              <div className='pg-field-row'>
                <label>JANコード</label>
                <input
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                />
              </div>
            </div>

            <div className='pg-grid-wrap'>
              <div className='pg-grid-toolbar'>
              </div>
              <div className='pg-grid'>
                <div className='pg-grid-scroll'>
                  <div className='pg-grid-head'>
                    <span className='gc-arrow-head'></span>
                    <span className='gc-error'>エラー</span>
                    <span className='gc-item'>品目No.</span>
                    <span className='gc-lot'>ロットシリアル</span>
                    <span className='gc-warehouse'>倉庫</span>
                    <span className='gc-storage'>保管場所</span>
                    <span className='gc-alloc'>引当数</span>
                    <span className='gc-partname'>品名</span>
                  </div>
                  <div className='pg-grid-body'>
                    {rows.length === 0 ? (
                      <div className='pg-empty-msg'>No Data</div>
                    ) : (
                      rows.map((row) => (
                        <div
                          className='pg-grid-row'
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
                          <span className='gc-error'>{row.error}</span>
                          <span className='gc-item'>{row.item}</span>
                          <span className='gc-lot'>{row.lot}</span>
                          <span className='gc-status'>{row.status}</span>
                          <span className='gc-num'>{row.build}</span>
                          <span className='gc-num'>{row.release}</span>
                          <span className='gc-move'>{row.move}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='pg-action-bar pg-action-bar-row'>
              <button
                className='pg-btn pg-btn-danger'
                onClick={clearFormAndRows}
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                破棄
              </button>
              <button
                className='pg-btn pg-btn-primary'
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                完了
              </button>
              <button
                className='pg-btn pg-btn-success'
                onClick={showHandInput ? () => setShowHandInputConfirm(true) : () => setShowHandInputConfirm(false)}
              >
                {showHandInput ? '手入力' : '解除'}
              </button>
              <button
                className='pg-btn pg-btn-warning'
                onClick={() => navigate('/apps/mockup/mockups')}
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                戻る
              </button>
            </div>

            {showHandInputConfirm && (
              <div className='pg-dialog-overlay' role='presentation'>
                <div className='pg-dialog' role='dialog' aria-modal='true'>
                  <div className='pg-dialog-header'>確認</div>
                  <div className='pg-dialog-body'>品目情報を手入力しますか？</div>
                  <div className='pg-dialog-footer'>
                    <button
                      className='pg-dialog-btn pg-dialog-btn-yes'
                      onClick={() => {
                        setShowHandInputConfirm(false)
                        navigate('/factory/SetMiscellaneousInAndOutBound7')
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='pg-dialog-btn pg-dialog-btn-no'
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