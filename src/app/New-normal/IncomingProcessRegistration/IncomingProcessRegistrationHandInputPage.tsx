import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'

const IncomingProcessRegistrationHandInputPage = () => {
    const navigate = useNavigate()
    const [showBackConfirm, setShowBackConfirm] = useState(false)
    const [showError, setShowError] = useState<{ message: string } | null>(null)
    const [showReadConfirm, setShowReadConfirm] = useState(false)

    const [productName, setProductName] = useState('')
    const [productCode, setProductCode] = useState('')
    const [lotSerial, setLotSerial] = useState('')
    const [receivingQuantity, setReceivingQuantity] = useState<string>('')
    const [goodQuantity, setGoodQuantity] = useState<string>('')
    const [defectQuantity, setDefectQuantity] = useState<string>('')
    const [defectReason, setDefectReason] = useState('')

    const parseNumber = (value: string) => {
        return Math.max(0, parseInt(value) || 0)
    }

    const handleReceivingQuantityChange = (value: string) => {
        setReceivingQuantity(value)
        const receiving = parseNumber(value)
        const good = parseNumber(goodQuantity)
        const defect = parseNumber(defectQuantity)

        if (goodQuantity !== '' && defectQuantity === '') {
            setDefectQuantity(Math.max(receiving - good, 0).toString())
        } else if (defectQuantity !== '' && goodQuantity === '') {
            setGoodQuantity(Math.max(receiving - defect, 0).toString())
        } else if (goodQuantity !== '' && defectQuantity !== '') {
            if (good + defect !== receiving) {
                setDefectQuantity(Math.max(receiving - good, 0).toString())
            }
        }
    }

    const handleGoodQuantityChange = (value: string) => {
        setGoodQuantity(value)
        const receiving = parseNumber(receivingQuantity)
        const good = parseNumber(value)
        setDefectQuantity(Math.max(receiving - good, 0).toString())
    }

    const handleComplete = () => {
        if (!productName) {
            setShowError({ message: '品名が未入力です。' })
            return
        }

        if (!productCode) {
            setShowError({ message: '品番が未入力です。' })
            return
        }

        if (!lotSerial) {
            setShowError({ message: 'ロット／シリアルが未入力です。' })
            return
        }

        if (!receivingQuantity) {
            setShowError({ message: '入荷数量が未入力です。' })
            return
        }

        setShowReadConfirm(true)
    }

    return (
        <div className='mockup-page'>
            <div className='mockup-stage mockup-stage-dark'>
                <div className='mockup-frame'>
                    <div className='set-header'>入荷工程登録</div>
                    <div className='set-body'>
                        <div className='set-form'>
                            <div className='set-row set-row-incomingapge'>
                                <label>品　　 名</label>
                                <input
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className='set-small set-input-gray'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label>品　　 番</label>
                                <input
                                    value={productCode}
                                    onChange={(e) => setProductCode(e.target.value)}
                                    className='set-small set-input-gray'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label className='spax-label-incoming'>ロット／シリアル</label>
                                <input
                                    value={lotSerial}
                                    onChange={(e) => setLotSerial(e.target.value)}
                                    className='set-input-gray'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label>入荷数量</label>
                                <input
                                    value={receivingQuantity}
                                    onChange={(e) => handleReceivingQuantityChange(e.target.value)}
                                    type="number"
                                    className='set-input-gray'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label>良品数量</label>
                                <input
                                    value={goodQuantity}
                                    onChange={(e) => handleGoodQuantityChange(e.target.value)}
                                    type="number"
                                    className='set-input-gray'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label>不良数量</label>
                                <input
                                    type="number"
                                    className='set-input-gray'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label>不良理由</label>
                                <select
                                    value={defectReason}
                                    onChange={(e) => setDefectReason(e.target.value)}
                                    style={{ textAlign: 'center' }}
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
                                className='set-btn set-primary'
                                style={{ visibility: 'hidden' }}
                            >
                                {'\u624b\u5165\u529b'}
                            </button>
                            <button
                                className='set-btn set-primary'
                                onClick={handleComplete}
                            >
                                完了
                            </button>
                            <button
                                className='set-btn set-primary'
                                style={{ visibility: 'hidden' }}
                            >
                                {'\u624b\u5165\u529b'}
                            </button>
                            <button
                                className='set-btn set-success'
                                onClick={() => setShowBackConfirm(true)}
                            >
                                戻る
                            </button>
                        </ActionFooter>
                    </div>

                    {showReadConfirm && (
                        <div className='set-modal-backdrop' role='presentation'>
                            <div className='set-modal' role='dialog' aria-modal='true'>
                                <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                                <div className='set-modal-body'>{'\u5165\u529b\u5185\u5bb9\u3067\u8aad\u8fbc\u3092\n\u5b8c\u4e86\u3057\u307e\u3059\u304b\uff1f'}</div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={() => setShowReadConfirm(false)}
                                    >
                                        はい

                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => setShowReadConfirm(false)}
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
                                <div className='set-modal-header'>確認</div>
                                <div className='set-modal-body'>{'手入力ダイアログを\n閉じますか？'}</div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={() => {
                                            setShowReadConfirm(true)
                                            navigate('/factory/incoming-process-registration')
                                        }}
                                    >
                                        YES
                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => {
                                            setShowBackConfirm(false)
                                        }}
                                    >
                                        No
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}

                    {showError && (
                        <div className='set-modal-backdrop' role='presentation'>
                            <div className='set-modal' role='dialog' aria-modal='true'>
                                <div className='set-modal-header'>エラー</div>
                                <div className='set-modal-body'>{showError.message}</div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={() => setShowError(null)}
                                    >
                                        OK
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

export { IncomingProcessRegistrationHandInputPage }