import { useNavigate } from 'react-router-dom'
import { GroupSelector } from './GroupSelector'

const Factory = () => {
  const navigate = useNavigate()

  const factoryButtons = [
    { label: '入荷実績登録機能', path: '/factory/inbound', className: 'mockup-red' },
    { label: '入荷工程登録', path: '/factory/delivery-slip-registration', className: 'mockup-blue' },
    { label: '棚移動', path: '/factory/set-miscellaneous-in-and-out-bound', className: 'mockup-green' },
    { label: '作業オーダー部品払出', path: '/factory/WOPartsIssuance', className: 'mockup-yellow' },
    { label: '作業オーダー実績時間登録', path: '/factory/Equipment', className: 'mockup-gray' },
    { label: '作業オーダー完了機', path: '/factory/set-return-configuration', className: 'mockup-orange' },
    { label: '出荷実績登録', path: '/factory/BundlePage', className: 'mockup-pink' },
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

export { Factory }
