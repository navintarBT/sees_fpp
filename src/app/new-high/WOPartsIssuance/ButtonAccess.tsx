import { useNavigate } from 'react-router-dom'

const ButtonAccess = () => {
  const navigate = useNavigate()
  const factoryButtons = [
    { label: 'WO別', path: '/factory/wo-parts-issuance', className: 'mockup-red' },
    { label: '品番別', path: '/factory/wo-parts-issuance-hand-input', className: 'mockup-blue' },
  ] as const

  return (
    <div className='mockup-page'>
      <div className='mockup-stage'>
        <div className='mockup-frame'>
          <div className='mockup-header'>WO部品払出</div>
          <div className='mockup-body'>
            <div className='mockup-grid'>
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
    </div>
  )
}

export { ButtonAccess }
