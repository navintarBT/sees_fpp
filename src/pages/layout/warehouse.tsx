import { useNavigate } from 'react-router-dom'
import { GroupSelector } from './GroupSelector'

const Warehouse = () => {
  const navigate = useNavigate()

  const warehouseButtons = [
    // { label: '出庫', path: '/factory/dispatch', className: 'mockup-red' },
    // { label: '入庫', path: '/factory/inbound', className: 'mockup-blue' },
    { label: '配送伝票', path: '/factory/delivery-slip-registration', className: 'mockup-green' },
    { label: '戻り構成', path: '/factory/set-return-configuration', className: 'mockup-yellow' },
    { label: 'セット登録', path: '/factory/set-register', className: 'mockup-gray' },
    { label: '雑入出庫', path: '/factory/set-miscellaneous-in-and-out-bound', className: 'mockup-gray' },
    { label: '備品振分', path: '/factory/equipment', className: 'mockup-orange' },
    { label: '販売セット', path: '/factory/bundle-page', className: 'mockup-pink' },
  ] as const

  return (
    <div className='mockup-page'>
      <div className='mockup-stage'>
        <div className='mockup-frame'>
          <div className='mockup-header'>メインメニュー</div>
          <div className='mockup-body'>
            <GroupSelector
              value='warehouse'
              onChange={(value) => {
                if (value === 'factory') navigate('/factory/factory')
              }}
            />

            <div className='mockup-grid'>
              {warehouseButtons.map((btn) => (
                <button key={btn.label} className={`mockup-btn ${btn.className}`} onClick={() => navigate(btn.path)}>
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

export { Warehouse }
