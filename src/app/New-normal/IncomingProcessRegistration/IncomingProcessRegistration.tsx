import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import './IncomingProcessRegistration.css'

type Row = {
    id: number
    error: string
    item: string
    lot: string
    status: string
    build: number
    release: number
    move: string
    moveStorage: string
    name: string
    moveStorage2?: string
}

const IncomingProcessRegistration = () => {
    const navigate = useNavigate()
    const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
    const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
    const tableScrollRef = useRef<HTMLDivElement | null>(null)
    const formRef = useRef<HTMLDivElement | null>(null)
    const [showBackConfirm, setShowBackConfirm] = useState(false)

    const resetTableScroll = () => {
        const el = tableScrollRef.current
        if (!el) return
        requestAnimationFrame(() => {
            el.scrollTop = 0
            el.scrollLeft = 0
            requestAnimationFrame(() => {
                el.scrollTop = 0
                el.scrollLeft = 0
            })
        })
    }

    const clearFormAndRows = () => {
        if (formRef.current) {
            const elements = formRef.current.querySelectorAll('input, select') as NodeListOf<HTMLInputElement | HTMLSelectElement>
            elements.forEach(el => el.value = '')
        }
        resetTableScroll()
    }

    return (
        <div className='mockup-page'>
            <div className='mockup-stage mockup-stage-dark'>
                <div className='mockup-frame'>
                    <div className='set-header'>入荷工程登録</div>
                    <div className='set-body'>
                        <div className='set-form' ref={formRef}>
                            <div className='set-row'>
                                <label>現品票№</label>
                                <input
                                    placeholder=' '
                                    className='set-small set-input-gray'
                                />
                            </div>
                            <div className='set-row'>
                                <label>品　　 名</label>
                                <input
                                    readOnly={true} placeholder=' '
                                    className='set-small set-input-gray nocolorbackground'
                                />
                            </div>

                            <div className='set-row'>
                                <label>品　　 番</label>
                                <input
                                    readOnly={true} placeholder=' '
                                    className='set-small set-input-gray nocolorbackground'
                                />
                            </div>

                            <div className='set-row '>
                                <label>ロット/ｼﾘｱﾙ</label>
                                <input
                                    className='set-input-gray '
                                />
                            </div>
                            <div className='set-row '>
                                <label>入荷数量</label>
                                <input
                                    readOnly={true} placeholder=' '
                                    className='set-input-gray nocolorbackground'
                                />
                            </div>
                            <div className='set-row '>
                                <label>良品数量</label>
                                <input
                                    placeholder=' '
                                    className='set-input-gray'
                                />
                            </div>
                            <div className='set-row '>
                                <label>不良数量</label>
                                <input
                                    placeholder=' '
                                    className='set-input-gray'
                                />
                            </div>
                            <div className='set-row'>
                                <label>不良理由</label>
                                <select
                                >
                                    <option value=''></option>
                                    <option value='キズ'>キズ</option>
                                    <option value='汚れ・異物付着'>汚れ・異物付着</option>
                                    <option value='メッキ不良'>メッキ不良</option>
                                    <option value='寸法不良'>寸法不良</option>
                                    <option value='穴位置ズレ'>穴位置ズレ</option>
                                </select>
                            </div>
                        </div>

                        <ActionFooter columns={4}>
                            <button
                                className='set-btn set-danger'
                                onClick={() => setShowClearConfirm(true)}
                            >
                                破棄
                            </button>
                            <button
                                className='set-btn set-warning'
                            >
                                完了
                            </button>
                            <button
                                className='set-btn set-primary'
                            >
                                手入力
                            </button>
                            <button
                                className='set-btn set-success'
                                onClick={() => setShowBackConfirm(true)}
                            >
                                戻る
                            </button>
                        </ActionFooter>
                    </div>

                    {showClearConfirm && (
                        <div className='set-modal-backdrop' role='presentation'>
                            <div className='set-modal' role='dialog' aria-modal='true'>
                                <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                                <div className='set-modal-body'>{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u3002'}<br />{'\u5b9c\u3057\u3044\u3067\u3059\u304b\uff1f'}</div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={() => {
                                            setShowClearConfirm(false)
                                            clearFormAndRows()
                                        }}
                                    >
                                        {'\u306f\u3044'}
                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => setShowClearConfirm(false)}
                                    >
                                        {'\u3044\u3044\u3048'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}



                    {showBackConfirm && (
                        <div className='set-modal-backdrop' role='presentation'>
                            <div className='set-modal' role='dialog' aria-modal='true'>
                                <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                                <div className='set-modal-body'>{'\u30e1\u30cb\u30e5\u30fc\u306b\u623b\u308a\u307e\u3059\u3002'}<br />{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u304b\uff1f'}</div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={() => {
                                            setShowBackConfirm(false)
                                            navigate('/factory/factory')
                                        }}
                                    >
                                        {'\u306f\u3044'}
                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => setShowBackConfirm(false)}
                                    >
                                        {'\u3044\u3044\u3048'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export { IncomingProcessRegistration }


