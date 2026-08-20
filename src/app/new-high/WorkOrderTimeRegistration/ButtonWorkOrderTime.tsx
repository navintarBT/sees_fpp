import { useNavigate } from 'react-router-dom'

const ButtonWorkOrderTime = () => {
    const navigate = useNavigate()
    const factoryButtons = [
        { label: '五泉工場', path: '/factory/work-order-time-registration/gosen', className: 'mockup-red' },
        { label: '千葉工場', path: '/factory/work-order-time-registration/chiba', className: 'mockup-blue' },
        // 設計書用：工場による表示制御を行わず、全項目を表示するレイアウト確認画面
        { label: '共通', path: '/factory/work-order-time-registration/common', className: 'mockup-green' },
    ] as const

    return (
        <div className='mockup-page'>
            <div className='mockup-stage'>
                <div className='mockup-frame'>
                    <div className='mockup-header'>WO作業時間実績登録</div>
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
