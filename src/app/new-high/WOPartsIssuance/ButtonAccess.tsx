import { useNavigate } from 'react-router-dom'
import { ScaleToFit } from '../../components/ScaleToFit/ScaleToFit'

const ButtonAccess = () => {
  const navigate = useNavigate()
  const factoryButtons = [
    { label: 'WO別', path: '/factory/wo-parts-issuance-choose', className: 'mockup-red' },
    { label: '品番別', path: '/factory/wo-parts-issuance-hand-input-choose', className: 'mockup-blue' },
  ] as const

  return (
    <div className='mockup-page'>
      <ScaleToFit active designWidth={1920} designHeight={1200}>
      <div className='mockup-stage mockup-stage-landscape'>
        <div className='mockup-frame'>
          <div className='mockup-header'>WO部品払出</div>
          <div className='mockup-body-landscape'>
            <div className='mockup-grid-landscape' style={{gridTemplateColumns: 'repeat(2, 1fr)'}}>
              {factoryButtons.map((btn) => (
                <button key={btn.label} className={`mockup-btn ${btn.className}`} onClick={() => navigate(btn.path)}>
                  {btn.label}
                </button>
              ))}
            </div>
            <button className='mockup-exit' onClick={() => navigate('/factory/factory')}>
              戻る
            </button>
          </div>
        </div>
      </div>
      </ScaleToFit>
    </div>
  )
}

export { ButtonAccess }
