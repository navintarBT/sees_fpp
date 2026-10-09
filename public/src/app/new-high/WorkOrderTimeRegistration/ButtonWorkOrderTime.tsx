import { useNavigate } from 'react-router-dom'
import { ScaleToFit } from '../../components/ScaleToFit/ScaleToFit'

const ButtonWorkOrderTime = () => {
    const navigate = useNavigate()
    const factoryButtons = [
        { label: '五泉工場', path: '/factory/work-order-time-registration-gosen-choose', className: 'mockup-red' },
        { label: '千葉工場', path: '/factory/work-order-time-registration-chiba-choose', className: 'mockup-blue' },
        // 設計書用：工場による表示制御を行わず、全項目を表示するレイアウト確認画面
        { label: '共通', path: '/factory/work-order-time-registration-common-choose', className: 'mockup-green' },
    ] as const

    return (
        <div className='mockup-page'>
            <ScaleToFit active designWidth={1920} designHeight={1200}>
            <div className='mockup-stage mockup-stage-landscape'>
                <div className='mockup-frame'>
                    <div className='mockup-header'>WO作業時間実績登録</div>
                    <div className='mockup-body-landscape'>
                        <div className='mockup-grid-landscape' style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
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

export { ButtonWorkOrderTime }
