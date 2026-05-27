import { useNavigate } from 'react-router-dom'

const ButtonWorkOrderTime = () => {
    const navigate = useNavigate()
    const factoryButtons = [
        { label: '五泉工場', path: '/factory/work-order-time-registration-gosen', className: 'mockup-red' },
        { label: '千葉工場', path: '/factory/work-order-time-registration-chiba', className: 'mockup-blue' },
    ] as const

    return (
        <div className='mockup-page'>
            <div className='mockup-stage'>
                <div className='mockup-frame'>
                    <div className='mockup-header'>作業オーダー実績時間登録</div>
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

export { ButtonWorkOrderTime }
