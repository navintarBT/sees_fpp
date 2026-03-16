import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './SetRegisterPage.scss'
import {FaWifi, FaSignal} from 'react-icons/fa'
import {BsBatteryHalf} from 'react-icons/bs'

const SetRegisterPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState(
    Array.from({length: 12}).map((_, i) => ({
      id: i + 1,
      status: '構成中',
      build: 1,
      release: 0,
      move: 'W1041',
      item: `ITM-${(i + 1).toString().padStart(3, '0')}`,
      lot: `LOT-${(100 + i).toString()}`,
      serial: `SR-${(9000 + i).toString()}`,
    }))
  )
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
                </select>
              </div>
              <div className='set-row'>
                <label>品目No.(親)</label>
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
                    <span className='col-icon'></span>
                    <span className='col-status'>状態</span>
                    <span className='col-num'>構成数</span>
                    <span className='col-num'>解除数</span>
                    <span className='col-move'>移動倉</span>
                    <span className='col-item'>品目</span>
                    <span className='col-lot'>ロット</span>
                    <span className='col-serial'>シリアル</span>
                  </div>
                  <div className='set-table-body'>
                    {rows.length === 0 ? (
                      <div className='set-empty'>No Data</div>
                    ) : (
                      rows.map((row) => (
                        <div className='set-table-row' key={row.id}>
                          <span className='col-icon'>{'>'}</span>
                          <span className='col-status'>{row.status}</span>
                          <span className='col-num'>{row.build}</span>
                          <span className='col-num'>{row.release}</span>
                          <span className='col-move'>{row.move}</span>
                          <span className='col-item'>{row.item}</span>
                          <span className='col-lot'>{row.lot}</span>
                          <span className='col-serial'>{row.serial}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {showHandInput ? (
              <div className='set-actions set-actions-hand'>
                <button
                  className='set-btn set-success'
                  onClick={() => setShowHandInputConfirm(true)}
                >
                  手入力
                </button>
              </div>
            ) : (
              <div className='set-actions set-actions-row'>
                <button className='set-btn set-danger' onClick={clearFormAndRows}>
                  クリア
                </button>
                <button className='set-btn set-primary'>完了</button>
                <button className='set-btn set-success' onClick={clearRows}>
                  解除
                </button>
                <button
                  className='set-btn set-warning'
                  onClick={() => navigate('/apps/mockup/mockups')}
                >
                  戻る
                </button>
              </div>
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
                        navigate('/apps/mockup/set-register-hand')
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
