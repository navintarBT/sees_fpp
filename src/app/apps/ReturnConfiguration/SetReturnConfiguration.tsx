import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './SetReturnConfiguration.css'

const SetReturnConfiguration = () => {
  const navigate = useNavigate()
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [qty, setQty] = useState(1);


  const isEnabled = parentWarehouse && parentItem && parentSerial

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='hand-header set-header'>セット構成登録手入力</div>
          <div className='hand-body'>
            <div className={`hand-form ${isEnabled ? '' : 'hand-form-disabled'}`}>
              <div className='hand-row'>
                <label>品目No.(親)</label>
                <input className='nocolorbackground' readOnly={!isEnabled} placeholder=' ' />
              </div>
              <div className='hand-row'>
                <label>シリアル(親)</label>
                <input className='nocolorbackground' readOnly={!isEnabled} placeholder=' '/>
              </div>
              <div className='hand-row'>
                <label>数量</label>
                <input />
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
              <div className='hand-row2 last-nocolorbackground'>
                <label>品目No.</label>
                <input />
              </div>
              <div className='hand-row2 last-nocolorbackground'>
                <label>ロット</label>
                <input />
              </div>
              <div className='hand-row2 last-nocolorbackground'>
                <label>シリアル</label>
                <input />
              </div>
             
            </div>

            <div className='set-actions set-actions-row'>
              <button
                className='set-btn set-danger'
                style={{ visibility: 'hidden' }}
              >
                {'\u7834\u68C4'}
              </button>
              <button className='set-btn set-primary' onClick={() => setShowReadConfirm(true)}>{'\u8AAD\u8FBC'}</button>
              <button
                className='set-btn set-success'
                style={{ visibility: 'hidden' }}
              >
                {'\u89E3\u9664'}
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                {'\u623B\u308B'}
              </button>
            </div>

            {showReadConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u5165\u529b\u5185\u5bb9\u3067\u8aad\u8fbc\u3092'}<br />{'\u5b8c\u4e86\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u624b\u5165\u529b\u30c0\u30a4\u30a2\u30ed\u30b0\u3092'}<br />{'\u9589\u3058\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/return-configuration')
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
    </div>
  )
}

export {SetReturnConfiguration}
