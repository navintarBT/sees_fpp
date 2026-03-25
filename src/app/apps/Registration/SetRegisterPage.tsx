import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './SetRegisterPage.css'
import {FaWifi, FaSignal, FaPlay} from 'react-icons/fa'
import {BsBatteryHalf} from 'react-icons/bs'

const SetRegisterPage = () => {
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
      move: 'W1', // 移動倉
      moveStorage: 'S1', // 移動保管場所
      name: '部品A', // 品名
      moveStorage2: '棚A', // 移動保管場所 (ตัวอย่างใหม่)
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
  const [activeRowId, setActiveRowId] = useState<number | null>(null)

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
          <div className='set-header'>セット構成登録</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>倉庫（親）</label>
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
                <label>JANコード(親)</label>
                <input
                  value={form.parentItemNo}
                  onChange={(e) => setForm({...form, parentItemNo: e.target.value})}
                />
              </div>
              <div className='set-row'>
                <label>移動倉庫</label>
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
              <div className='set-row'>
                <label>移動保管場所</label>
                <input
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
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
                    <span className='col-status'>状態</span>
                    <span className='col-num'>構成数</span>
                    <span className='col-num'>解除数</span>
                    <span className='col-move'>移動倉庫</span>
                    <span className='col-move'>移動保管場所</span>
                    <span className='col-name'>品名</span>
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
                          <span className='col-move'>{row.move}</span>
                          <span className='col-move'>{row.moveStorage}</span>
                          <span className='col-name'>{row.name}</span>
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
                onClick={showHandInput ? () => setShowHandInputConfirm(true) : () => setShowHandInputConfirm(false)}
              >
                {showHandInput ? '手入力' : '解除'}
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => navigate('/apps/mockup/mockups')}
                style={{ visibility: showHandInput ? 'hidden' : 'visible' }}
              >
                戻る
              </button>
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
                        navigate('/factory/set-register-hand')
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

          </div>
        </div>
      </div>
    </div>
  )
}

export {SetRegisterPage}
