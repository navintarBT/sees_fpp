import { useState } from 'react'
import { HandInputModalProps } from './types'
import './HandInputModal-12.css'

const HandInputModal: React.FC<HandInputModalProps> = ({ isOpen, onClose, onAddDeliverySlip }) => {
  const [manualDeliveryNo, setManualDeliveryNo] = useState<string>('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (manualDeliveryNo.trim()) {
      onAddDeliverySlip(manualDeliveryNo.trim())
      setManualDeliveryNo('')
      onClose()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setManualDeliveryNo(e.target.value)
  }

  if (!isOpen) return null

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <div className='modal-header'>
          <h3>手入力 - 配送伝票番号</h3>
          <button className='close-btn' onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className='modal-body'>
            <div className='input-group'>
              <label>配送伝票 No.</label>
              <input
                type='text'
                value={manualDeliveryNo}
                onChange={handleInputChange}
                placeholder='配送伝票番号を入力'
                autoFocus
                maxLength={8}
              />
            </div>
            <p className='hint-text'>I ○2 D 30</p>
          </div>

          <div className='modal-footer'>
            <button 
              type='button' 
              className='btn-secondary' 
              onClick={onClose}
            >
              キャンセル
            </button>
            <button 
              type='submit' 
              className='btn-primary'
              disabled={!manualDeliveryNo.trim()}
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HandInputModal