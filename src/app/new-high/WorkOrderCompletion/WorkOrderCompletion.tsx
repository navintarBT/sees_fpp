import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'

const WO_MOCKUP_DATA: Record<string, { planned: number; completed: number; defective: number }> = {
  'WO-001': { planned: 10, completed: 9, defective: 1 },
  'WO-002': { planned: 10, completed: 5, defective: 5 },
  'WO-003': { planned: 10, completed: 8, defective: 2 },
  'WO-004': { planned: 7, completed: 2, defective: 5 },
  'WO-005': { planned: 10, completed: 6, defective: 4 },
  'WO-006': { planned: 10, completed: 4, defective: 6 },
  'WO-007': { planned: 10, completed: 9, defective: 1 },
  'WO-008': { planned: 10, completed: 7, defective: 3 },
  'WO-009': { planned: 10, completed: 4, defective: 6 },
  'WO-010': { planned: 10, completed: 5, defective: 5 },
}

// เก็บ snapshot ของหน้าจอเพื่อให้กด NO / รีเฟรชแล้วข้อมูลยังอยู่เหมือนเดิม
const BACK_STATE_KEY = 'WorkOrderCompletion:backState'

type WoData = { planned: number; completed: number; defective: number }

type PersistedState = {
  woNumber: string
  woData: WoData | null
  plannedCount: string
  completedCount: string
  defectiveCount: string
}

const loadPersistedState = (): PersistedState | null => {
  try {
    const raw = sessionStorage.getItem(BACK_STATE_KEY)
    return raw ? (JSON.parse(raw) as PersistedState) : null
  } catch {
    return null
  }
}

const clearPersistedState = () => {
  try {
    sessionStorage.removeItem(BACK_STATE_KEY)
  } catch {
    /* ignore */
  }
}

const WorkOrderCompletion = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // โหลด snapshot (ถ้ามี) แค่ครั้งเดียวตอน mount
  const [persistedState] = useState(loadPersistedState)
  const [woNumber, setWoNumber] = useState(persistedState?.woNumber ?? '')
  const [woData, setWoData] = useState<WoData | null>(persistedState?.woData ?? null)
  const [plannedCount, setPlannedCount] = useState(persistedState?.plannedCount ?? '')
  const [completedCount, setCompletedCount] = useState(persistedState?.completedCount ?? '')
  const [defectiveCount, setDefectiveCount] = useState(persistedState?.defectiveCount ?? '')
  // WO読込後に入力可能となる項目（読込前は入力不可・グレー表示）
  const [officeCode, setOfficeCode] = useState('')
  const [storageLocation, setStorageLocation] = useState('')
  const [showWoSelect, setShowWoSelect] = useState(false)
  const [selectedWoNumber, setSelectedWoNumber] = useState('')
  const [showWoLoadConfirm, setShowWoLoadConfirm] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
  const [showRegisterComplete, setShowRegisterComplete] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showOverPlanConfirm, setShowOverPlanConfirm] = useState(false)
  const [showUnderPlanConfirm, setShowUnderPlanConfirm] = useState(false)
  const completedCountInputRef = useRef<HTMLInputElement>(null)

  const focusCompletedCount = () => {
    window.requestAnimationFrame(() => completedCountInputRef.current?.focus())
  }

  const toCountNumber = (value: string) => {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : 0
  }

  const applyWoData = (selectedNumber: string) => {
    const nextWoData = WO_MOCKUP_DATA[selectedNumber] ?? { planned: 0, completed: 0, defective: 0 }
    setWoData(nextWoData)
    setPlannedCount(String(nextWoData.planned))
    setCompletedCount(String(nextWoData.completed))
    setDefectiveCount(String(nextWoData.defective))
    focusCompletedCount()
  }

  const clearWoData = () => {
    setWoData(null)
    setPlannedCount('')
    setCompletedCount('')
    setDefectiveCount('')
    setOfficeCode('')
    setStorageLocation('')
  }

  useEffect(() => {
    const selectedWoNumber = (location.state as { selectedWoNumber?: string } | null)?.selectedWoNumber
    if (!selectedWoNumber) return

    setWoNumber(selectedWoNumber)
    applyWoData(selectedWoNumber)
  }, [location.state])

  // เก็บ snapshot ต่อเนื่องทุกครั้งที่ข้อมูลเปลี่ยน เพื่อให้รีเฟรช/กลับมาแล้วข้อมูลยังอยู่
  useEffect(() => {
    try {
      sessionStorage.setItem(
        BACK_STATE_KEY,
        JSON.stringify({ woNumber, woData, plannedCount, completedCount, defectiveCount }),
      )
    } catch {
      /* ignore */
    }
  }, [woNumber, woData, plannedCount, completedCount, defectiveCount])

  const loadWoData = () => {
    const normalizedWoNumber = woNumber.trim()
    setWoNumber(normalizedWoNumber)
    if (normalizedWoNumber) {
      applyWoData(normalizedWoNumber)
    } else {
      clearWoData()
    }
  }

  const openWoSelect = () => {
    setSelectedWoNumber(woNumber)
    setShowWoSelect(true)
  }

  const completeWoSelection = () => {
    setWoNumber(selectedWoNumber)
    applyWoData(selectedWoNumber)
    setShowWoLoadConfirm(false)
    setShowWoSelect(false)
  }

  const handleRegisterClick = () => {
    if (!woData || !plannedCount || !completedCount || !defectiveCount) return

    const planned = toCountNumber(plannedCount)
    const totalResult = toCountNumber(completedCount) + toCountNumber(defectiveCount)

    if (totalResult > planned) {
      setShowOverPlanConfirm(true)
      return
    }

    if (totalResult < planned) {
      setShowUnderPlanConfirm(true)
      return
    }

    setShowRegisterConfirm(true)
  }

  const cancelUnderPlanRegister = () => {
    setShowUnderPlanConfirm(false)
    focusCompletedCount()
  }

  const cancelRegisterConfirm = () => {
    setShowRegisterConfirm(false)
    focusCompletedCount()
  }

  const closeOverPlanConfirm = () => {
    setShowOverPlanConfirm(false)
    focusCompletedCount()
  }

  const resetInitialDisplay = () => {
    setWoNumber('')
    clearWoData()
    setShowWoSelect(false)
    setSelectedWoNumber('')
    setShowWoLoadConfirm(false)
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header' style={{ textAlign: 'center' }}>WO完了実績登録</div>
          <div className='hand-body'>
            <div className='hand-form'>
              <div className='hand-row'>
                <label>WO番号</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    value={woNumber}
                    onChange={(e) => {
                      setWoNumber(e.target.value)
                      clearWoData()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadWoData()
                      }
                    }}
                    style={{ textAlign: 'center', width: '540px' }}
                  />
                  <button type='button' className='set-btnnew_high set-primary' onClick={() => navigate("/factory/work-order-completion-select-wo")}>WO検索</button>
                </div>
              </div>
              <div className='hand-row' style={{ marginTop: '-2px', fontSize: '30px' }}>
                <label>WO計画数</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    disabled
                    value={plannedCount}
                    style={{ textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '12px' }}
                    aria-label='WO planned count'
                  />
                </div>

              </div>
              <div className='hand-row' style={{ marginTop: '-2px', fontSize: '30px' }}>
                <label>WO完了済数</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    disabled
                    value={woData ? String(toCountNumber(plannedCount) - toCountNumber(completedCount)) : ''}
                    style={{ textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '12px' }}
                    aria-label='WO completed remaining count'
                  />
                </div>

              </div>
              <div className='hand-row' style={{ marginTop: '-2px', fontSize: '30px' }}>
                <label>WO完了数</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    ref={completedCountInputRef}
                    disabled={!woData}
                    value={completedCount}
                    onChange={(e) => setCompletedCount(e.target.value)}
                    style={{ textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '10px' }}
                    aria-label='WO completed count'
                  />
                </div>
              </div>
              <div className='hand-row' style={{ marginTop: '-2px', fontSize: '30px' }}>
                <label>WO仕損数</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    disabled={!woData}
                    value={defectiveCount}
                    onChange={(e) => setDefectiveCount(e.target.value)}
                    style={{ textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '12px' }}
                    aria-label='WO defective count'
                  />
                </div>

              </div>

              {/* WO読込後の動作が未決のため、製番は常に入力不可（グレー表示）とする */}
              <div className='hand-row' style={{ marginTop: '-2px', fontSize: '30px' }}>
                <label>製番</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    disabled
                    value=''
                    readOnly
                    style={{ textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '12px' }}
                    aria-label='Seiban'
                  />
                </div>

              </div>

              {/* 事業所・保管場所は画面初期表示時は入力不可、WO読込後に入力可能とする */}
              <div className='hand-row' style={{ marginTop: '-2px', fontSize: '30px' }}>
                <label>事業所</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    disabled={!woData}
                    value={officeCode}
                    onChange={(e) => setOfficeCode(e.target.value)}
                    style={{ textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '12px' }}
                    aria-label='Office'
                  />
                </div>

              </div>

              <div className='hand-row' style={{ marginTop: '-2px', fontSize: '30px' }}>
                <label>保管場所</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    disabled={!woData}
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    style={{ textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '12px' }}
                    aria-label='Storage location'
                  />
                </div>

              </div>

            </div>

            <ActionFooter columns={5}>
              <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
              <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
              <button type='button' className='set-btn set-success' onClick={handleRegisterClick}>{'登録'}</button>
              <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
              <button className='set-btn set-warning' onClick={() => setShowBackConfirm(true)}>{'戻る'}</button>
            </ActionFooter>

            {showWoSelect && (
              <div className='set-modal-backdrop' role='presentation'>
                <div
                  className='set-modal'
                  role='dialog'
                  aria-modal='true'
                  aria-label='WO selection'
                  style={{ width: '680px', maxWidth: '90vw' }}
                >
                  <div className='set-modal-header'>WO選択</div>
                  <div className='set-modal-body' style={{ paddingTop: '8px' }}>
                    <div
                      style={{
                        border: '2px solid #5b6d86',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#fff',
                      }}
                    >
                      {/* <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          background: '#dbeafe',
                          borderBottom: '2px solid #5b6d86',
                          color: '#111827',
                          fontSize: '26px',
                          fontWeight: 600,
                          minHeight: '56px',
                          alignItems: 'center',
                        }}
                      >
                        <span>WO番号</span>
                      </div> */}
                      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {Object.keys(WO_MOCKUP_DATA).map((selectableWoNumber) => (
                          <button
                            key={selectableWoNumber}
                            type='button'
                            onClick={() => {
                              setSelectedWoNumber(selectableWoNumber)
                              setShowWoLoadConfirm(true)
                            }}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr',
                              width: '100%',
                              minHeight: '56px',
                              alignItems: 'center',
                              border: 0,
                              borderBottom: '1px solid #cbd5e1',
                              background: selectableWoNumber === selectedWoNumber ? '#fff7d6' : '#fff',
                              color: '#111827',
                              fontSize: '25px',
                              cursor: 'pointer',
                            }}
                          >
                            <span>{selectableWoNumber}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => {
                        setShowWoSelect(false)
                        setSelectedWoNumber('')
                      }}
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showWoLoadConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>{`${selectedWoNumber}\n選択したWO番号で読込を完了しますか？`}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={completeWoSelection}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowWoLoadConfirm(false)}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRegisterConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>登録しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowRegisterConfirm(false)
                        setShowRegisterComplete(true)
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={cancelRegisterConfirm}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showOverPlanConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>{'WO完了数とWO仕損数の合計が\nWO計画数を超えています。'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={closeOverPlanConfirm}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showUnderPlanConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>{'WO完了数とWO仕損数の合計が\nWO計画数に足りません。\n登録しますか？'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowUnderPlanConfirm(false)
                        setShowRegisterComplete(true)
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={cancelUnderPlanRegister}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRegisterComplete && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>完了</div>
                  <div className='set-modal-body'>登録しました。</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowRegisterComplete(false)
                        resetInitialDisplay()
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          {showBackConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">{"\u78ba\u8a8d"}</div>
                <div className="set-modal-body"

                >
                  {
                    "メニューに戻ります。\n よろしいですか？"
                  }
                </div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => {
                      setShowBackConfirm(false);
                      // はい = ล้างข้อมูลในฟอร์ม + snapshot แล้วกลับเมนู
                      resetInitialDisplay();
                      clearPersistedState();
                      navigate("/factory/factory");
                    }}
                  >
                    はい
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() => setShowBackConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { WorkOrderCompletion }
