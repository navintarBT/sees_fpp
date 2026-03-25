import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SetRegisterPage-12.css'

type MoveType = 'From' | 'To'

type AllocationForm = {
  fromWarehouse: string
  toWarehouse: string
  storageLocation: string
  quantity: string
  moveType: MoveType
  janCode: string
  reason: string
}

type AllocationRow = {
  id: number
  error: '' | 'E'
  moveType: 'F' | 'T'
  itemName: string
  itemNo: string
  lotSerial: string
  quantity: number
  warehouse: string
  storageLocation: string
}

const warehouseOptions = ['FR-0040', 'FR-0041', 'FR-0042']
const toWarehouseOptions = ['TO-MS-002', 'TO-MS-003', 'TO-MS-004']

const initialRows: AllocationRow[] = [
  {
    id: 1,
    error: '',
    moveType: 'F',
    itemName: 'ハンディ端末',
    itemNo: '0193090',
    lotSerial: 'LS240301',
    quantity: 1,
    warehouse: 'FR-0040',
    storageLocation: 'A-01-01',
  },
  {
    id: 2,
    error: 'E',
    moveType: 'T',
    itemName: '充電器セット',
    itemNo: '0193091',
    lotSerial: 'LS240302',
    quantity: 1,
    warehouse: 'TO-MS-002',
    storageLocation: 'B-02-03',
  },
  {
    id: 3,
    error: '',
    moveType: 'F',
    itemName: 'バッテリー',
    itemNo: '0193092',
    lotSerial: 'LS240303',
    quantity: 2,
    warehouse: 'FR-0041',
    storageLocation: 'C-05-01',
  },
]

const createInitialForm = (): AllocationForm => ({
  fromWarehouse: warehouseOptions[0],
  toWarehouse: toWarehouseOptions[0],
  storageLocation: '',
  quantity: '1',
  moveType: 'From',
  janCode: '',
  reason: '',
})

const Mockup_12_Page: React.FC = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<AllocationRow[]>(initialRows)
  const [form, setForm] = useState<AllocationForm>(createInitialForm)
  const [showHandInputButton, setShowHandInputButton] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault()
        setShowHandInputButton((prev) => !prev)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const hasInput = useMemo(() => {
    return (
      rows.length > 0 ||
      form.storageLocation !== '' ||
      form.quantity !== '1' ||
      form.janCode !== '' ||
      form.reason !== '' ||
      form.fromWarehouse !== warehouseOptions[0] ||
      form.toWarehouse !== toWarehouseOptions[0] ||
      form.moveType !== 'From'
    )
  }, [form, rows])

  const handleFieldChange = <K extends keyof AllocationForm>(key: K, value: AllocationForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleDiscard = () => {
    setForm(createInitialForm())
    setRows([])
  }

  const handleComplete = () => {
    window.alert(`備品振分登録を実行します。\n件数: ${rows.length}件`)
  }

  const handleBack = () => {
    if (!hasInput) {
      navigate('/apps/mockup/mockups')
      return
    }

    setShowBackConfirm(true)
  }

  return (
    <div className='mockup-page set-register-12-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>販売セット登録</div>

          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label htmlFor='fromWarehouse'>FR倉庫</label>
                <select
                  id='fromWarehouse'
                  value={form.fromWarehouse}
                  onChange={(event) => handleFieldChange('fromWarehouse', event.target.value)}
                >
                  {warehouseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className='set-row'>
                <label htmlFor='toWarehouse'>TO倉庫</label>
                <select
                  id='toWarehouse'
                  value={form.toWarehouse}
                  onChange={(event) => handleFieldChange('toWarehouse', event.target.value)}
                >
                  {toWarehouseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className='set-grid-two'>
                <div className='set-row set-row-compact'>
                  <label htmlFor='storageLocation'>保管場所</label>
                  <input
                    id='storageLocation'
                    value={form.storageLocation}
                    onChange={(event) => handleFieldChange('storageLocation', event.target.value)}
                    placeholder='例: A-01-01'
                  />
                </div>

                <div className='set-row set-row-compact'>
                  <label htmlFor='quantity'>数量</label>
                  <input
                    id='quantity'
                    value={form.quantity}
                    onChange={(event) => handleFieldChange('quantity', event.target.value)}
                    inputMode='numeric'
                  />
                </div>
              </div>

              <div className='set-grid-two'>
                <div className='set-row set-row-compact'>
                  
                  <div className='set-radio-group' role='radiogroup' aria-label='From To'>
                    <label className='set-radio-option'>
                      <input
                        className='set-radio-input'
                        type='radio'
                        name='moveType'
                        value='From'
                        checked={form.moveType === 'From'}
                        onChange={() => handleFieldChange('moveType', 'From')}
                      />
                      <span className='set-radio-label'>From</span>
                    </label>
                    <label className='set-radio-option'>
                      <input
                        className='set-radio-input'
                        type='radio'
                        name='moveType'
                        value='To'
                        checked={form.moveType === 'To'}
                        onChange={() => handleFieldChange('moveType', 'To')}
                      />
                      <span className='set-radio-label'>To</span>
                    </label>
                  </div>
                </div>

                <div className='set-row set-row-compact'>
                  <label htmlFor='janCode'>JANコード</label>
                  <input
                    id='janCode'
                    value={form.janCode}
                    onChange={(event) => handleFieldChange('janCode', event.target.value)}
                    placeholder='スキャンまたは入力'
                  />
                </div>
              </div>

              <div className='set-row'>
                <label htmlFor='reason'>理由</label>
                <input
                  id='reason'
                  value={form.reason}
                  onChange={(event) => handleFieldChange('reason', event.target.value)}
                  placeholder='登録理由を入力'
                />
              </div>
            </div>

            <div className='set-table-wrap'>
              
              <div className='set-table'>
                <div className='set-table-scroll'>
                  <div className='set-table-head'>
                    <span className='col-error' />
                    <span className='col-moveType'>From/To</span>
                    <span className='col-name'>品名</span>
                    <span className='col-itemNo'>品目No.</span>
                    <span className='col-lot'>ロットシリアル</span>
                    <span className='col-qty'>数量</span>
                    <span className='col-warehouse'>倉庫</span>
                    <span className='col-storage'>保管場所</span>
                  </div>

                  <div className='set-table-body'>
                    {rows.length === 0 ? (
                      <div className='set-empty'>読込データはありません</div>
                    ) : (
                      rows.map((row) => (
                        <div className='set-table-row' key={row.id}>
                          <span className={`col-error ${row.error === 'E' ? 'set-error' : ''}`}>{row.error}</span>
                          <span className='col-moveType'>{row.moveType}</span>
                          <span className='col-name'>{row.itemName}</span>
                          <span className='col-itemNo'>{row.itemNo}</span>
                          <span className='col-lot'>{row.lotSerial}</span>
                          <span className='col-qty'>{row.quantity}</span>
                          <span className='col-warehouse'>{row.warehouse}</span>
                          <span className='col-storage'>{row.storageLocation}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='set-actions set-actions-row'>
              <button className='set-btn set-danger' onClick={handleDiscard}>
                破棄
              </button>

              <button className='set-btn set-primary' onClick={handleComplete}>
                完了
              </button>

              {showHandInputButton ? (
                <button className='set-btn set-success' onClick={() => setShowHandInputConfirm(true)}>
                  手入力
                </button>
              ) : (
                <div className='set-handinput-hint'>F2で手入力ボタン表示</div>
              )}

              <button className='set-btn set-warning' onClick={handleBack}>
                戻る
              </button>
            </div>
          </div>

          {showHandInputConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>手入力画面へ遷移しますか。</div>
                <div className='set-modal-actions'>
                  <button
                    type='button'
                    className='set-modal-btn'
                    onClick={() => {
                      setShowHandInputConfirm(false)
                      navigate('/factory/mockup-12-hand', {
                        state: { allocationForm: form },
                      })
                    }}
                  >
                    はい
                  </button>
                  <button
                    type='button'
                    className='set-modal-btn'
                    onClick={() => setShowHandInputConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBackConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>
                  <span>確認</span>
                  <button
                    type='button'
                    className='set-modal-close'
                    aria-label='閉じる'
                    onClick={() => setShowBackConfirm(false)}
                  >
                    ×
                  </button>
                </div>
                <div className='set-modal-body'>読込データをクリアするか残すか選択してください。</div>
                <div className='set-modal-actions'>
                  <button
                    type='button'
                    className='set-modal-btn'
                    onClick={() => {
                      setShowBackConfirm(false)
                      handleDiscard()
                      navigate('/apps/mockup/mockups')
                    }}
                  >
                    はい
                  </button>
                  <button
                    type='button'
                    className='set-modal-btn'
                    onClick={() => {
                      setShowBackConfirm(false)
                      navigate('/apps/mockup/mockups')
                    }}
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

export { Mockup_12_Page }
