import { useNavigate } from 'react-router-dom'
import { GroupSelector } from './GroupSelector'
import { ScaleToFit } from '../../app/components/ScaleToFit/ScaleToFit'

const Warehouse = () => {
  const navigate = useNavigate()

  const warehouseButtons = [
    // { label: '出庫', path: '/factory/dispatch', className: 'mockup-red' },
    // { label: '入庫', path: '/factory/inbound', className: 'mockup-blue' },
    { label: '配送伝票登録', path: '/factory/delivery-slip-registration-choose', className: 'mockup-green' },
    { label: 'セット戻り構成登録', path: '/factory/set-return-configuration-choose', className: 'mockup-yellow' },
    { label: 'セット構成登録', path: '/factory/set-register-choose', className: 'mockup-gray' },
    { label: '予定なし入出庫', path: '/factory/set-miscellaneous-in-and-out-bound-choose', className: 'mockup-gray' },
    { label: '備品振分登録', path: '/factory/equipment-choose', className: 'mockup-orange' },
    { label: '販売セット登録', path: '/factory/bundle-page-choose', className: 'mockup-pink' },
  ] as const

  return (
    <div className='mockup-page'>
      <ScaleToFit active designWidth={1920} designHeight={1200}>
      <div className='mockup-stage mockup-stage-landscape'>
        <div className='mockup-frame'>
          <div className='mockup-header'>メインメニュー</div>
          <div className='mockup-body-landscape'>
            <GroupSelector
              value='warehouse'
              onChange={(value) => {
                if (value === 'factory') navigate('/factory/factory')
              }}
            />

            <div className='mockup-grid-landscape'>
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
      </ScaleToFit>
    </div>
  )
}
export { Warehouse }
