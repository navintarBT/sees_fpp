import { useNavigate } from 'react-router-dom'
import { GroupSelector } from './GroupSelector'

const Factory = () => {
  const navigate = useNavigate()
  const factoryButtons = [
    { label: '入荷実績登録機能', path: '', className: 'mockup-red' },
    { label: '入荷工程登録', path: '', className: 'mockup-blue' },
    { label: '棚移動', path: '/factory/shelf-transfer', className: 'mockup-green' },
    { label: '作業オーダー\n部品払出', path: '/factory/button-access', className: 'mockup-yellow' },
    { label: '作業オーダー\n実績時間登録', path: '/factory/work-order-time-registration', className: 'mockup-gray' },
    { label: '作業オーダー完了', path: '/factory/work-order-completion', className: 'mockup-orange' },
    { label: '出荷実績登録', path: '', className: 'mockup-pink' },

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
