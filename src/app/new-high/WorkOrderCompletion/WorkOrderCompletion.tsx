import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaRegCalendarAlt } from 'react-icons/fa'
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

const formatWoDate = (value: string) => {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return ''
  return `${year.slice(-2)}/${month}/${day}`
}

const padDatePart = (value: number) => value.toString().padStart(2, '0')

const toDateValue = (date: Date) => (
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
)

const parseDateValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return year && month && day ? new Date(year, month - 1, day) : new Date()
}

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const startDate = new Date(year, month, 1 - new Date(year, month, 1).getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)

    return {
      date,
      value: toDateValue(date),
      inMonth: date.getMonth() === month,
    }
  })
}

const WorkOrderCompletion = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const todayValue = toDateValue(new Date())
  const [woDatePickerValue, setWoDatePickerValue] = useState(todayValue)
  const [showWoCalendar, setShowWoCalendar] = useState(false)
  const [woCalendarMonth, setWoCalendarMonth] = useState(() => parseDateValue(todayValue))
  const [woNumber, setWoNumber] = useState('')
  const [woData, setWoData] = useState<{ planned: number; completed: number; defective: number } | null>(null)
  const [plannedCount, setPlannedCount] = useState('')
  const [completedCount, setCompletedCount] = useState('')
  const [defectiveCount, setDefectiveCount] = useState('')
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
  }

  useEffect(() => {
    const selectedWoNumber = (location.state as { selectedWoNumber?: string } | null)?.selectedWoNumber
    if (!selectedWoNumber) return

    setWoNumber(selectedWoNumber)
    applyWoData(selectedWoNumber)
  }, [location.state])

  const openWoDatePicker = () => {
    setWoCalendarMonth(parseDateValue(woDatePickerValue || todayValue))
    setShowWoCalendar((current) => !current)
  }

  const changeWoCalendarMonth = (amount: number) => {
    setWoCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  const selectWoDate = (value: string) => {
    setWoDatePickerValue(value)
    setWoCalendarMonth(parseDateValue(value))
    setShowWoCalendar(false)
  }

  const selectToday = () => {
    setWoDatePickerValue(todayValue)
    setWoCalendarMonth(parseDateValue(todayValue))
    setShowWoCalendar(false)
  }

  const clearDate = () => {
    setWoDatePickerValue('')
    setShowWoCalendar(false)
  }

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
    setWoDatePickerValue(todayValue)
    setWoCalendarMonth(parseDateValue(todayValue))
    setShowWoCalendar(false)
    setWoNumber('')
    clearWoData()
    setShowWoSelect(false)
    setSelectedWoNumber('')
    setShowWoLoadConfirm(false)
  }

  const calendarDays = getCalendarDays(woCalendarMonth)
  const calendarMonthLabel = woCalendarMonth.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header' style={{ textAlign: 'center' }}>WO完了実績登録</div>
          <div className='hand-body'>
            <div className='hand-form'>
              <div className='hand-row'>
                <label>WO完了日</label>
                <div className='hand-date-field'>
                  <input
                    readOnly
                    value={formatWoDate(woDatePickerValue)}
                    onClick={openWoDatePicker}
                    style={{ textAlign: 'center' }}
                  />
                  <button
                    type='button'
                    className='hand-date-btn'
                    aria-label='Choose WO completion date'
                    onClick={openWoDatePicker}
                  >
                    <FaRegCalendarAlt />
                  </button>
                  {showWoCalendar && (
                    <div
                      className='hand-calendar'
                      role='dialog'
                      aria-label='Choose WO completion date'
                      style={{ left: '50%', transform: 'translateX(-50%)', width: '520px', padding: '24px' }}
                    >
                      <div className='hand-calendar-header' style={{ gridTemplateColumns: '60px 1fr 60px', marginBottom: '14px', fontSize: '32px' }}>
                        <button type='button' style={{ width: '60px', height: '48px', fontSize: '43px' }} onClick={() => changeWoCalendarMonth(-1)}>{'<'}</button>
                        <span>{calendarMonthLabel}</span>
                        <button type='button' style={{ width: '60px', height: '48px', fontSize: '43px' }} onClick={() => changeWoCalendarMonth(1)}>{'>'}</button>
                      </div>
                      <div className='hand-calendar-weekdays' style={{ fontSize: '29px', marginBottom: '10px', gap: '8px' }}>
                        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                      <div className='hand-calendar-days' style={{ gap: '8px' }}>
                        {calendarDays.map(({ date, value, inMonth }) => (
                          <button
                            type='button'
                            key={value}
                            className={[
                              'hand-calendar-day',
                              inMonth ? '' : 'hand-calendar-muted',
                              value === woDatePickerValue ? 'hand-calendar-selected' : '',
                            ].filter(Boolean).join(' ')}
                            style={{ width: '60px', height: '55px', fontSize: '30px' }}
                            onClick={() => selectWoDate(value)}
                          >
                            {date.getDate()}
                          </button>
                        ))}
                      </div>
                      <div className='hand-calendar-footer'>
                        <button
                          type='button'
                          className='hand-calendar-btn-today'
                          style={{ padding: '10px 18px', fontSize: '29px' }}
                          onClick={selectToday}
                        >
                          今日
                        </button>
                        <button
                          type='button'
                          className='hand-calendar-btn-clear'
                          style={{ padding: '10px 18px', fontSize: '29px' }}
                          onClick={clearDate}
                        >
                          クリア
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                  <button type='button' className='set-btnnew_high set-primary' onClick={() => navigate("/factory/work-order-completion-select-wo")}>WO選択</button>
                </div>
              </div>
              <div className='hand-row' style={{ marginTop: '-2px', fontSize: '30px' }}>
                <label>WO計画数</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    disabled={!woData}
                    value={plannedCount}
                    onChange={(e) => setPlannedCount(e.target.value)}
                    style={{ textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '12px' }}
                    aria-label='WO planned count'
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
                    "メニューに戻ります。\n 読込データを破棄しますか？"
                  }
                </div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => {
                      setShowBackConfirm(false);
                      navigate("/factory/factory");
                    }}
                  >
                  YES
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() =>{ setShowBackConfirm(false);
                    navigate("/factory/factory");
                    }}
                  >
                    NO
                  </button>   
                   <button
  className="set-modal-btn set-m"
  onClick={() => {
    setShowBackConfirm(false);
    
  }}
>
  取消
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
