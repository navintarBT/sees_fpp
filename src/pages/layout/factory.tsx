import { useNavigate } from 'react-router-dom'
import { ScaleToFit } from '../../app/components/ScaleToFit/ScaleToFit'

const TERMINAL_ID = 'ABCDEFGHIJ'

const Factory = () => {
  const navigate = useNavigate()
  const factoryButtons = [
    { label: '入荷・入庫実績登録', path: '/factory/inventory-records-choose', className: 'mockup-blue' },
    { label: '入荷工程登録', path: '/factory/incoming-process-registration-choose', className: 'mockup-blue' },
    { label: '棚移動', path: '/factory/shelf-transfer-choose', className: 'mockup-blue' },
    { label: '出荷・出庫実績登録', path: '/factory/shipping-records-choose', className: 'mockup-blue' },
    { label: 'WO部品払出', path: '/factory/wo-parts-issuance-choose', className: 'mockup-green' },
    { label: 'WO作業時間実績登録', path: '/factory/button-work-order-time', className: 'mockup-green' },
    { label: 'WO完了実績登録', path: '/factory/work-order-completion-choose', className: 'mockup-green' },
    { label: '庫内ラベル印刷', path: '/factory/inventory-label-printing-choose', className: 'mockup-purple' },
    { label: '予定なし入出庫', path: '/factory/set-miscellaneous-in-and-out-bound-choose', className: 'mockup-yellow' },
    { label: 'セット構成登録', path: '/factory/set-register-choose', className: 'mockup-yellow' },
    { label: 'セット戻り構成登録', path: '/factory/set-return-configuration-choose', className: 'mockup-yellow' },
    { label: '配送伝票登録', path: '/factory/delivery-slip-registration-choose', className: 'mockup-yellow' },
    { label: '備品振分登録', path: '/factory/equipment-choose', className: 'mockup-yellow' },
    { label: '販売セット登録', path: '/factory/bundle-page-choose', className: 'mockup-yellow' },
  ] as const

  return (
    <div className='mockup-page'>
      <ScaleToFit active designWidth={1920} designHeight={1200}>
      <div className='mockup-stage mockup-stage-landscape'>
        <div className='mockup-frame'>
          <div className='mockup-header'>
            メインメニュー
            <span className='mockup-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
          </div>
          <div className='mockup-body-landscape'>
            <div className='mockup-grid-landscape' style={{gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 170}}>
              {factoryButtons.map((btn) => (
                <button
                  key={btn.label}
                  className={`mockup-btn ${btn.className}`}
                  onClick={() => navigate(btn.path)}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <button className='mockup-exit' onClick={() => navigate('/factory/warehouse')}>
              終了
            </button>
          </div>
        </div>
      </div>
      </ScaleToFit>
    </div>
  )
}

export { Factory }
