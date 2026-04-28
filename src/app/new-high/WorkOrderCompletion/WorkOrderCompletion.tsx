import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'

const WorkOrderCompletion = () => {
  const navigate = useNavigate()
  const [woDate, setWoDate] = useState('28/2/16')
  const [woNumber, setWoNumber] = useState('123001')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header' style={{textAlign: 'center'}}>WO完了登録画面</div>
          <div className='hand-body'>
            <div className='hand-form'>
              <div className='hand-row'>
                <label>WO完了日</label>
                <input value={woDate} onChange={(e) => setWoDate(e.target.value)} />
              </div>
              <div className='hand-row'>
                <label>WO番号</label>
                <input value={woNumber} onChange={(e) => setWoNumber(e.target.value)} />
              </div>
              <div className='hand-row' style={{marginTop: '10px' , fontSize: '30px'}}>
                <label>WO完了数</label>
                <span style={{marginTop: '10px',fontSize: '30px', textAlign: 'center'}}>9</span>
              </div>
       <div className='hand-row' style={{ marginTop: '20px', fontSize: '30px' }}>
  <label>WO仕損数</label>
  <span style={{ color: '#e05555',marginTop: '10px',fontSize: '30px', textAlign: 'center'  }}>1</span>
</div>
            </div>

            <ActionFooter columns={4}>
              <button className='set-btn set-danger' style={{visibility: 'hidden'}}>{'\u7834\u68C4'}</button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}} onClick={() => setShowReadConfirm(true)}>{'\u8AAD\u8FBC'}</button>
              <button className='set-btn set-success' style={{visibility: 'hidden'}}>{'\u89E3\u9664'}</button>
              <button className='set-btn set-warning' onClick={() => setShowBackConfirm(true)}>{'\u623B\u308B'}</button>
            </ActionFooter>

            {showReadConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u5165\u529b\u5185\u5bb9\u3067\u8aad\u8fbc\u3092'}<br />{'\u5b8c\u4e86\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'></div>
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
                        navigate('/factory/factory')
                      }}
                    >
                      {'\u306f\u3044'}
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

export {WorkOrderCompletion}