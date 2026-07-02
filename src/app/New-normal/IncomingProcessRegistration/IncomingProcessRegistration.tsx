import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'

const IncomingProcessRegistration = () => {
    const navigate = useNavigate()
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
    const [showBackConfirm, setShowBackConfirm] = useState(false)
    const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
    const [showError, setShowError] = useState<{ message: string } | null>(null)
    const barcodeInputRef = useRef<HTMLInputElement | null>(null)

    const [productTicketNo, setProductTicketNo] = useState('')
    const [productName, setProductName] = useState('')
    const [productCode, setProductCode] = useState('')
    const [lotSerial, setLotSerial] = useState('')
    const [orderQuantity, setOrderQuantity] = useState<number | null>(null)
    const [receivingQuantity, setReceivingQuantity] = useState<string>('')
    const [goodQuantity, setGoodQuantity] = useState<string>('')
    const [defectQuantity, setDefectQuantity] = useState<string>('')
    const [defectReason, setDefectReason] = useState('')

    const clearFormAndRows = () => {
        setProductTicketNo('')
        setProductName('')
        setProductCode('')
        setLotSerial('')
        setOrderQuantity(null)
        setReceivingQuantity('')
        setGoodQuantity('')
        setDefectQuantity('')
        setDefectReason('')

        setTimeout(() => {
            barcodeInputRef.current?.focus()
        }, 100)
    }

    const fetchProductInfo = async (ticketNo: string) => {
        // TODO: API call to JDE
        // This is mock data - replace with actual API
        console.log(`Fetching product info for: ${ticketNo}`)

        // Mock response
        if (ticketNo === 'MB10147843001') {
            setProductName('ブレーキシリンダー（硬）')
            setProductCode('001R566B11')
            setLotSerial('2026012001')
            setOrderQuantity(null)
            setReceivingQuantity('180')
        } else {
            setProductName('')
            setProductCode('')
            setLotSerial('')
            setOrderQuantity(null)
            setReceivingQuantity('')
        }
    }

    const handleBarcodeScan = (value: string) => {
        setProductTicketNo(value)
    }

    const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchProductInfo(productTicketNo)
        }
    }


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

    const handleDefectQuantityChange = (value: string) => {
        setDefectQuantity(value)
        const receiving = parseNumber(receivingQuantity)
        const defect = parseNumber(value)
        setGoodQuantity(Math.max(receiving - defect, 0).toString())
    }

    const handleComplete = () => {
        if (!productTicketNo) {
            setShowError({ message: '現品票№が未入力です。' })
            return
        }

        if (!receivingQuantity || parseInt(receivingQuantity) <= 0) {
            setShowError({ message: '入荷数量が未入力です。' })
            return
        }

        if (orderQuantity && parseInt(receivingQuantity) !== orderQuantity) {
            setShowError({ message: '入荷数量と発注数量が一致しません。' })
            return
        }

        if (!lotSerial) {
            setShowError({ message: 'ロット／シリアルが未入力です。' })
            return
        }

        setShowCompleteConfirm(true)
    }

    const sendDataToJDE = async () => {
        try {
            const payload = {
                productTicketNo,
                productName,
                productCode,
                lotSerial,
                orderQuantity,
                receivingQuantity: parseInt(receivingQuantity),
                goodQuantity: parseInt(goodQuantity) || 0,
                defectQuantity: parseInt(defectQuantity) || 0,
                defectReason: defectReason || null,
            }
            console.log('Sending to JDE:', payload)

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500))

            clearFormAndRows()
            setShowCompleteConfirm(false)

        } catch (error) {
            setShowError({ message: 'サーバとの通信中にエラーが発生しました。再実行しても解消されない場合は管理者へ連絡してください。' })
        }
    }

    return (
        <div className='mockup-page'>
            <div className='mockup-stage mockup-stage-dark'>
                <div className='mockup-frame'>
                    <div className='set-header'>入荷工程登録</div>
                    <div className='set-body'>
                        <div className='set-form'>
                            <div className='set-row set-row-incomingapge'>
                                <label>現品票No.</label>
                                <input
                                    ref={barcodeInputRef}
                                    value={productTicketNo}
                                    onChange={(e) => handleBarcodeScan(e.target.value)}
                                    onKeyDown={handleBarcodeKeyDown}
                                    className='set-small set-input-gray'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label>品　　 名</label>
                                <input
                                    value={productName}
                                    readOnly={true}
                                    required
                                    className='set-small set-input-gray'
                                    style={{ textAlign: 'center', backgroundColor: '#e5e7eb', outline: 'none' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label>品　　 番 </label>
                                <input
                                    value={productCode}
                                    readOnly={true}
                                    required
                                    className='set-small set-input-gray'
                                    style={{ textAlign: 'center', backgroundColor: '#e5e7eb', outline: 'none' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label className='spax-label-incoming'>ロット／シリアル </label>
                                <input
                                    value={lotSerial}
                                    onChange={(e) => setLotSerial(e.target.value)}
                                    required
                                    className='set-input-gray'
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            <div className='set-row set-row-incomingapge'>
                                <label>入荷数量 </label>
                                <input
                                    value={receivingQuantity}
                                    onChange={(e) => handleReceivingQuantityChange(e.target.value)}
                                    readOnly={true}
                                    required
                                    className='set-input-gray'
                                    style={{ textAlign: 'center', backgroundColor: '#e5e7eb', outline: 'none' }}
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
                                    value={defectQuantity}
                                    onChange={(e) => handleDefectQuantityChange(e.target.value)}
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
                                className='set-btn set-danger'
                                onClick={() => setShowClearConfirm(true)}
                            >
                                破棄
                            </button>
                            <button
                                className='set-btn set-warning'
                                onClick={handleComplete}
                            >
                                完了
                            </button>
                            <button
                                className='set-btn set-primary'
                                onClick={() => setShowHandInputConfirm(true)}
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
                                <div className='set-modal-header'>確認</div>
                                <div className='set-modal-body'>{'読込データを破棄します。\n宜しいですか？'}</div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={() => {
                                            setShowClearConfirm(false)
                                            clearFormAndRows()
                                        }}
                                    >
                                        OK
                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => setShowClearConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showCompleteConfirm && (
                        <div className='set-modal-backdrop' role='presentation'>
                            <div className='set-modal' role='dialog' aria-modal='true'>
                                <div className='set-modal-header'>確認</div>
                                <div className='set-modal-body' style={{ whiteSpace: 'pre-line' }}>
                                    {'入荷データを送信します。\n 宜しいですか？'}

                                </div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={sendDataToJDE}
                                    >
                                        はい
                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => setShowCompleteConfirm(false)}
                                    >
                                        いいえ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showBackConfirm && (
                        <div className='set-modal-backdrop' role='presentation'>
                            <div className='set-modal' role='dialog' aria-modal='true'>
                                <div className='set-modal-header'>確認</div>
                                <div className='set-modal-body' style={{ whiteSpace: 'pre-line' }}>
                                    {'メニューに戻ります。\n 読込データを破棄しますか？'}
                                </div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={() => {
                                            setShowBackConfirm(false)
                                            navigate('/factory/factory')
                                        }}
                                    >
                                        YES
                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => {
                                            setShowBackConfirm(false)
                                            navigate('/factory/factory')
                                        }}
                                    >
                                        No
                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => {
                                            setShowBackConfirm(false)
                                            setTimeout(() => barcodeInputRef.current?.focus(), 100)
                                        }}
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showHandInputConfirm && (
                        <div className='set-modal-backdrop' role='presentation'>
                            <div className='set-modal' role='dialog' aria-modal='true'>
                                <div className='set-modal-header'>確認</div>
                                <div className='set-modal-body'>
                                    品目情報を手入力しますか？
                                </div>
                                <div className='set-modal-actions'>
                                    <button
                                        className='set-modal-btn set-modal-yes'
                                        onClick={() => {
                                            setShowHandInputConfirm(false)
                                            navigate('/factory/incoming-process-registration-hand-input')
                                        }}
                                    >
                                        はい
                                    </button>
                                    <button
                                        className='set-modal-btn set-modal-no'
                                        onClick={() => setShowHandInputConfirm(false)}
                                    >
                                        いいえ
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
                                        閉じる
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