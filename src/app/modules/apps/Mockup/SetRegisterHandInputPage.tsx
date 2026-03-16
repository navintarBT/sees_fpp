import {useNavigate} from 'react-router-dom'
import {FaWifi, FaSignal} from 'react-icons/fa'
import {BsBatteryHalf} from 'react-icons/bs'
import './SetRegisterHandInputPage.scss'

const SetRegisterHandInputPage = () => {
  const navigate = useNavigate()

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='hand-header'>セット構成登録手入力</div>
          <div className='hand-body'>
            <div className='hand-form'>
              <div className='hand-row'>
                <label>倉庫（親）</label>
                <select defaultValue='羽田製品倉庫：W0040'>
                  <option>羽田製品倉庫：W0040</option>
                </select>
              </div>
              <div className='hand-row'>
                <label>品目No.(親)</label>
                <input value='0193090' readOnly />
              </div>
              <div className='hand-row'>
                <label>シリアル(親)</label>
                <input value='2NY21038' readOnly />
              </div>
              <div className='hand-row'>
                <label>移動倉庫</label>
                <select defaultValue='千葉倉庫（WMS）：W002'>
                  <option>千葉倉庫（WMS）：W002</option>
                </select>
              </div>
              <div className='hand-row'>
                <label>移動保管場所</label>
                <input value='' readOnly />
              </div>
              <div className='hand-row'>
                <label>数量</label>
                <input value='1' readOnly className='hand-right' />
              </div>
              <div className='hand-row'>
                <label>品目No.</label>
                <input defaultValue='' placeholder=' ' />
              </div>
              <div className='hand-row'>
                <label>ロット</label>
                <input defaultValue='' placeholder=' ' />
              </div>
              <div className='hand-row'>
                <label>シリアル</label>
                <input defaultValue='' placeholder=' ' />
              </div>
            </div>

            <div className='hand-actions'>
              <button className='hand-btn hand-primary'>読込</button>
              <button className='hand-btn hand-warning' onClick={() => navigate('/apps/mockup/set-register')}>
                戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {SetRegisterHandInputPage}
