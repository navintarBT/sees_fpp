import { useNavigate } from 'react-router-dom'
import { GroupSelector } from './GroupSelector'

const Factory = () => {
  const navigate = useNavigate()
  const factoryButtons = [
    { label: '入庫実績登録', path: '/factory/inventory-records', className: 'mockup-red' },
    { label: '入荷工程登録', path: '/factory/incoming-process-registration', className: 'mockup-blue' },
    { label: '棚移動', path: '/factory/shelf-transfer', className: 'mockup-green' },
    { label: 'WO部品払出', path: '/factory/button-access', className: 'mockup-yellow' },
    { label: 'WO作業時間実績登録', path: '/factory/button-work-order-time', className: 'mockup-gray' },
    { label: 'WO完了実績登録', path: '/factory/work-order-completion', className: 'mockup-orange' },
    { label: '出庫実績登録', path: '/factory/shipping-records', className: 'mockup-pink' },
    { label: '庫内バーコード\nラベル印刷', path: '/factory/inventory-label-printing', className: 'mockup-pink' },
  ] as const

  return (
    <div className='mockup-page'>
      <div className='mockup-stage'>
        <div className='mockup-frame'>
          <div className='mockup-header'>メインメニュー</div>
          <div className='mockup-body'>
            <GroupSelector
              value='factory'
              onChange={(value) => {
                if (value === 'warehouse') navigate('/factory/warehouse')
              }}
            />

            <div className='mockup-grid'>
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
    </div>
  )
}

export { Factory }
