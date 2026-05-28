import {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {FaRegCalendarAlt} from 'react-icons/fa'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'

const WO_MOCKUP_DATA: Record<string, {completed: number; defective: number}> = {
  'WO-001': {completed: 9, defective: 1},
  'WO-002': {completed: 5, defective: 5},
  'WO-003': {completed: 8, defective: 2},
  'WO-004': {completed: 2, defective: 5},
  'WO-005': {completed: 6, defective: 4},
  'WO-006': {completed: 4, defective: 6},
  'WO-007': {completed: 9, defective: 1},
  'WO-008': {completed: 7, defective: 3},
  'WO-009': {completed: 4, defective: 6},
  'WO-010': {completed: 5, defective: 5},
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

  return Array.from({length: 42}, (_, index) => {
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
  const [woData, setWoData] = useState<{completed: number; defective: number} | null>(null)
  const [showWoSelect, setShowWoSelect] = useState(false)
  const [selectedWoNumber, setSelectedWoNumber] = useState('')
  const [showWoLoadConfirm, setShowWoLoadConfirm] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)
  const [showRegisterComplete, setShowRegisterComplete] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  useEffect(() => {
    const selectedWoNumber = (location.state as {selectedWoNumber?: string} | null)?.selectedWoNumber
    if (!selectedWoNumber) return

    setWoNumber(selectedWoNumber)
    setWoData(WO_MOCKUP_DATA[selectedWoNumber] ?? {completed: 0, defective: 0})
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
    setWoData(normalizedWoNumber ? WO_MOCKUP_DATA[normalizedWoNumber] ?? {completed: 0, defective: 0} : null)
  }

  const openWoSelect = () => {
    setSelectedWoNumber(woNumber)
    setShowWoSelect(true)
  }

  const completeWoSelection = () => {
    setWoNumber(selectedWoNumber)
    setWoData(WO_MOCKUP_DATA[selectedWoNumber] ?? {completed: 0, defective: 0})
    setShowWoLoadConfirm(false)
    setShowWoSelect(false)
  }

  const resetInitialDisplay = () => {
    setWoDatePickerValue(todayValue)
    setWoCalendarMonth(parseDateValue(todayValue))
    setShowWoCalendar(false)
    setWoNumber('')
    setWoData(null)
    setShowWoSelect(false)
    setSelectedWoNumber('')
    setShowWoLoadConfirm(false)
  }

  const calendarDays = getCalendarDays(woCalendarMonth)
  const calendarMonthLabel = woCalendarMonth.toLocaleString('en-US', {month: 'long', year: 'numeric'})

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header' style={{textAlign: 'center'}}>WO完了登録</div>
          <div className='hand-body'>
            <div className='hand-form'>
              <div className='hand-row'>
                <label>WO完了日</label>
                <div className='hand-date-field'>
                  <input
                    readOnly
                    value={formatWoDate(woDatePickerValue)}
                    onClick={openWoDatePicker}
                    style={{textAlign: 'center'}}
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
                      style={{left: '50%', transform: 'translateX(-50%)'}}
                    >
                      <div className='hand-calendar-header'>
                        <button type='button' onClick={() => changeWoCalendarMonth(-1)}>{'<'}</button>
                        <span>{calendarMonthLabel}</span>
                        <button type='button' onClick={() => changeWoCalendarMonth(1)}>{'>'}</button>
                      </div>
                      <div className='hand-calendar-weekdays'>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <span key={day}>{day}</span>
                        ))}

                      </div>
                      <div className='hand-calendar-days'>
                        {calendarDays.map(({date, value, inMonth}) => (
                          <button
                            type='button'
                            key={value}
                            className={[
                              'hand-calendar-day',
                              inMonth ? '' : 'hand-calendar-muted',
                              value === woDatePickerValue ? 'hand-calendar-selected' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => selectWoDate(value)}
                          >
                            {date.getDate()}
                          </button>
                        ))}

                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 4px 4px', gap: '6px'}}>
                        <button
                          type='button'
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: '4px',
                            border: '1px solid #4a90d9',
                            background: '#4a90d9',
                            color: '#fff',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                          onClick={selectToday}
                        >
                          Today
                        </button>
                        <button
                          type='button'
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            background: '#f5f5f5',
                            color: '#555',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                          onClick={clearDate}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className='hand-row'>
                <label>WO番号</label>
                <div style={{display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center'}}>
                  <input
                    value={woNumber}
                    onChange={(e) => {
                      setWoNumber(e.target.value)
                      setWoData(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadWoData()
                      }
                    }}
                    style={{textAlign: 'center', width: '540px'}}
                  />
                  <button type='button' className='set-btnnew_high set-primary' onClick={() => navigate("/factory/work-order-completion-select-wo")}>WO選択</button>
                </div>
              </div>
              <div className='hand-row' style={{marginTop: '11px', fontSize: '30px'}}>
                <label>WO完了数</label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center'}}>
                  <input
                    readOnly
                    value={woData ? String(woData.completed) : ''}
                    style={{textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '10px'}}
                    aria-label='WO completed count'
                  />
                </div>
              </div>
              <div className='hand-row' style={{marginTop: '22px', fontSize: '30px'}}>
                <label>WO仕損数</label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center'}}>
                  <input
                    readOnly
                    value={woData ? String(woData.defective) : ''}
                    style={{textAlign: 'center', width: '100%', fontSize: '32px', marginTop: '12px', color: '#e05555'}}
                    aria-label='WO defective count'
                  />
                </div>
              </div>
            </div>

            <ActionFooter columns={4}>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>{'\u8AAD\u8FBC'}</button>
              <button type='button' className='set-btn set-success' onClick={() => setShowRegisterConfirm(true)}>{'登録'}</button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>{'\u8AAD\u8FBC'}</button>
              <button className='set-btn set-warning' onClick={() => setShowBackConfirm(true)}>{'戻る'}</button>
            </ActionFooter>

            {showWoSelect && (
              <div className='set-modal-backdrop' role='presentation'>
                <div
                  className='set-modal'
                  role='dialog'
                  aria-modal='true'
                  aria-label='WO selection'
                  style={{width: '680px', maxWidth: '90vw'}}
                >
                  <div className='set-modal-header'>WO選択</div>
                  <div className='set-modal-body' style={{paddingTop: '8px'}}>
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
                      <div style={{maxHeight: '360px', overflowY: 'auto'}}>
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
                  <div className='set-modal-body'>
                    {selectedWoNumber}<br />
                    選択したWO番号で読込を完了しますか？
                  </div>
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
                      onClick={() => setShowRegisterConfirm(false)}
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
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>メニューに戻ります。<br />読み込みデータを破棄しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/factory')
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
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

export {WorkOrderCompletion}
