import { useNavigate } from 'react-router-dom'

const InventoryRecordsOrientationChoose = () => {
  const navigate = useNavigate()
  const orientationButtons = [
    { label: '縦画面', orientation: 'portrait' as const, className: 'mockup-red' },
    { label: '横画面', orientation: 'landscape' as const, className: 'mockup-blue' },
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage'>
        <div className='mockup-frame'>
          <div className='mockup-header'>入庫実績登録</div>
          <div className='mockup-body'>
            <div className='mockup-grid'>
              {orientationButtons.map((btn) => (
                <button
                  key={btn.label}
                  className={`mockup-btn ${btn.className}`}
                  onClick={() => navigate('/factory/inventory-records', { state: { orientation: btn.orientation } })}
                >
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

export { InventoryRecordsOrientationChoose }
