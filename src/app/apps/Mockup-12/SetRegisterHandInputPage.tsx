import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './SetRegisterHandInputPage-12.css'

type MoveType = 'From' | 'To'

type AllocationFormState = {
  allocationForm?: {
    fromWarehouse?: string
    toWarehouse?: string
    storageLocation?: string
  }
}

const fromWarehouseOptions = ['FR-0040', 'FR-0041', 'FR-0042']
const toWarehouseOptions = ['TO-MS-002', 'TO-MS-003', 'TO-MS-004']

const SetRegister_12_HandInputPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as AllocationFormState | null)?.allocationForm

  const [fromWarehouse, setFromWarehouse] = useState(state?.fromWarehouse ?? fromWarehouseOptions[0])
  const [toWarehouse, setToWarehouse] = useState(state?.toWarehouse ?? toWarehouseOptions[0])
  const [storageLocation, setStorageLocation] = useState(state?.storageLocation ?? '')
  const [quantity, setQuantity] = useState('1')
  const [moveType, setMoveType] = useState<MoveType>('From')
  const [itemNo, setItemNo] = useState('')
  const [lotSerial, setLotSerial] = useState('')
  const [expiryYymm, setExpiryYymm] = useState('')

  const canRead = fromWarehouse !== '' && toWarehouse !== '' && itemNo !== '' && lotSerial !== ''
  const expiryEnabled = moveType === 'To'

  const handleRead = () => {
    window.alert(
      `手入力読込を実行します。\n品目No.: ${itemNo}\nロットシリアル: ${lotSerial}\n数量: ${quantity}`
    )
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='hand-header'>販売セット登録 手入力</div>

          <div className='hand-body'>
            <div className='hand-form'>
              <div className='hand-row'>
                <label htmlFor='handFromWarehouse'>FR倉庫</label>
                <select
                  id='handFromWarehouse'
                  value={fromWarehouse}
                  onChange={(event) => setFromWarehouse(event.target.value)}
                >
                  {fromWarehouseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className='hand-row'>
                <label htmlFor='handToWarehouse'>TO倉庫</label>
                <select
                  id='handToWarehouse'
                  value={toWarehouse}
                  onChange={(event) => setToWarehouse(event.target.value)}
                >
                  {toWarehouseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className='hand-grid-two'>
                <div className='hand-row hand-row-compact'>
                  <label htmlFor='handStorage'>保管場所</label>
                  <input
                    id='handStorage'
                    className='hand-input-storage'
                    value={storageLocation}
                    onChange={(event) => setStorageLocation(event.target.value)}
                    placeholder='例: A-01-01'
                  />
                </div>


              </div>

                        <div className='hand-row hand-row-compact'>
                  <label htmlFor='handQuantity'>数量</label>
                  <input
                    id='handQuantity'
                    className='hand-input-quantity'
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    inputMode='numeric'
                  />
                </div>

              <div className='hand-row'>
                <label htmlFor='handItemNo'>品目No.</label>
                <input
                  id='handItemNo'
                  className='hand-input-item-no'
                  value={itemNo}
                  onChange={(event) => setItemNo(event.target.value)}
                />
              </div>

              <div className='hand-row'>
                <label htmlFor='handLotSerial'>ロットシリアル</label>
                <input
                  id='handLotSerial'
                  className='hand-input-lot-serial'
                  value={lotSerial}
                  onChange={(event) => setLotSerial(event.target.value)}
                />
              </div>

              <div className='hand-radio-row'>
                <div className='hand-radio-group' role='radiogroup' aria-label='From To'>
                  <label className='hand-radio-option'>
                    <input
                      className='hand-radio-input'
                      type='radio'
                      name='handMoveType'
                      value='From'
                      checked={moveType === 'From'}
                      onChange={() => setMoveType('From')}
                    />
                    <span className='hand-radio-label'>From</span>
                  </label>
                  <label className='hand-radio-option'>
                    <input
                      className='hand-radio-input'
                      type='radio'
                      name='handMoveType'
                      value='To'
                      checked={moveType === 'To'}
                      onChange={() => setMoveType('To')}
                    />
                    <span className='hand-radio-label'>To</span>
                  </label>
                </div>
              </div>

              <div className='hand-row'>
                <label htmlFor='handExpiry'>有効期限(yymm)</label>
                <input
                  id='handExpiry'
                  value={expiryYymm}
                  onChange={(event) => setExpiryYymm(event.target.value)}
                  disabled={!expiryEnabled}
                  placeholder={expiryEnabled ? '例: 2704' : 'To選択時のみ入力可'}
                />
              </div>
            </div>

            <div className='hand-actions'>
              <div className='hand-action-placeholder' aria-hidden='true' />
              
              <button className='hand-btn hand-primary' onClick={handleRead} disabled={!canRead}>
                読込
              </button>
              <div className='hand-action-placeholder' aria-hidden='true' />
              <button className='hand-btn hand-warning' onClick={() => navigate('/factory/mockup-12')}>
                戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { SetRegister_12_HandInputPage }
