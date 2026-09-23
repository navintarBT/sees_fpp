import { useNavigate } from 'react-router-dom'
import { GroupSelector } from './GroupSelector'
import { ScaleToFit } from '../../app/components/ScaleToFit/ScaleToFit'

const Factory = () => {
  const navigate = useNavigate()
  const factoryButtons = [
    { label: '入庫実績登録', path: '/factory/inventory-records-choose', className: 'mockup-red' },
    { label: '入荷工程登録', path: '/factory/incoming-process-registration-choose', className: 'mockup-blue' },
    { label: '棚移動', path: '/factory/shelf-transfer-choose', className: 'mockup-green' },
    { label: 'WO部品払出', path: '/factory/button-access', className: 'mockup-yellow' },
    { label: 'WO作業時間実績登録', path: '/factory/button-work-order-time', className: 'mockup-gray' },
    { label: 'WO完了実績登録', path: '/factory/work-order-completion-choose', className: 'mockup-orange' },
    { label: '出庫実績登録', path: '/factory/shipping-records-choose', className: 'mockup-pink' },
    { label: '庫内バーコード\nラベル印刷', path: '/factory/inventory-label-printing-choose', className: 'mockup-pink' },
  ] as const

  return (
    <div className='mockup-page'>
      <ScaleToFit active designWidth={1920} designHeight={1200}>
      <div className='mockup-stage mockup-stage-landscape'>
        <div className='mockup-frame'>
          <div className='mockup-header'>メインメニュー</div>
          <div className='mockup-body-landscape'>
            <GroupSelector
              value='factory'
              onChange={(value) => {
                if (value === 'warehouse') navigate('/factory/warehouse')
              }}
            />

            <div className='mockup-grid-landscape'>
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
