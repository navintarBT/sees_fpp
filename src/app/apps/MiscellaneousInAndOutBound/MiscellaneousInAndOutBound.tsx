import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { FaRegCalendarAlt } from 'react-icons/fa'

const formatExpirationDate = (value: string) => {
  if (!value) return ''
  const [year, month] = value.split('-')
  if (!year || !month) return ''
  return `${year}/${month}`
}
const padDatePart = (value: number) => value.toString().padStart(2, '0')

const toDateValue = (date: Date) => (
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
)

const parseDateValue = (value: string) => {
  if (!value) return new Date()
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

const MiscellaneousInAndOutBound = () => {
  const navigate = useNavigate()
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [qty, setQty] = useState(1);

  const todayValue = toDateValue(new Date())
  const [datePickerValue, setDatePickerValue] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => parseDateValue(todayValue))

  const openDatePicker = () => {
    setCalendarMonth(parseDateValue(datePickerValue))
    setShowCalendar((current) => !current)
  }

  const changeCalendarMonth = (amount: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  const selectDate = (value: string) => {
    setDatePickerValue(value)
    if (value) {
      setCalendarMonth(parseDateValue(value))
    }
    setShowCalendar(false)
  }

  const calendarDays = getCalendarDays(calendarMonth)
  const calendarMonthLabel = calendarMonth.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })

  const isEnabled = parentWarehouse && parentItem && parentSerial

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>予定なし入出庫登録手入力</div>
          <div className='hand-body'>
            <div className={`hand-form ${isEnabled ? '' : 'hand-form-disabled'}`}>
              <div className='hand-row'>
                <label>倉庫</label>
                <select>
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>
              <div className='hand-row'>
                <label>保管場所</label>
                <input placeholder=' ' />
              </div>
              <div className='hand-row'>
                <label >引当数</label>
                <div className='pg-sign-group'>
                  <select className='pg-sign-select' style={{ backgroundColor: 'transparent' }} >
                    <option value='+'>+</option>
                    <option value='-'>-</option>
                  </select>
                  <input style={{ backgroundColor: 'transparent' }} />
                </div>
              </div>

              <div className='hand-row'>
                <label>品目No.</label>
                <input style={{ backgroundColor: 'transparent' }} />
              </div>

              <div className='hand-row'>
                <label>ロット</label>
                <input value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} style={{ backgroundColor: 'transparent' }} />
              </div>
              <div className='hand-row'>
                <label>シリアル</label>
                <input style={{ backgroundColor: 'transparent' }} />
              </div>
              <div className='hand-row' >
                <label>有効期限</label>
                <div className='hand-date-field'>
                  <input
                    type='text'
                    style={{ backgroundColor: 'transparent', cursor: 'pointer', width: '100%' }}
                  />
                  {/* <button
                    type='button'
                    className='hand-date-btn'
                    aria-label='Choose date'
                    onClick={openDatePicker}
                  >
                    <FaRegCalendarAlt />
                  </button>
                  {showCalendar && (
                    <div className='hand-calendar' role='dialog' aria-label='Choose date'>
                      <div className='hand-calendar-header'>
                        <button type='button' onClick={() => changeCalendarMonth(-1)}>{'<'}</button>
                        <span>{calendarMonthLabel}</span>
                        <button type='button' onClick={() => changeCalendarMonth(1)}>{'>'}</button>
                      </div>
                      <div className='hand-calendar-weekdays'>
                        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                      <div className='hand-calendar-days'>
                        {calendarDays.map(({ date, value, inMonth }) => (
                          <button
                            type='button'
                            key={value}
                            className={[
                              'hand-calendar-day',
                              inMonth ? '' : 'hand-calendar-muted',
                              value === datePickerValue ? 'hand-calendar-selected' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => selectDate(value)}
                          >
                            {date.getDate()}
                          </button>
                        ))}
                      </div>
                      <div className='hand-calendar-footer' style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          type='button'
                          className='set-pill'
                          style={{ flex: 1, cursor: 'pointer', color: 'blue' }}
                          onClick={() => selectDate(toDateValue(new Date()))}
                        >
                          今日
                        </button>
                        <button
                          type='button'
                          className='set-pill'
                          style={{ flex: 1, cursor: 'pointer', color: 'red' }}
                          onClick={() => selectDate('')}
                        >
                          クリア
                        </button>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            <ActionFooter columns={5}>
              <button
                className='set-btn set-danger'
                style={{ visibility: 'hidden' }}
              >
                {'\u7834\u68C4'}
              </button>
              <button className='set-btn set-primary' onClick={() => setShowReadConfirm(true)}>{'\u8AAD\u8FBC'}</button>
              <button
                className='set-btn set-success'
                style={{ visibility: 'hidden' }}
              >
                {'\u89E3\u9664'}
              </button>
              <button
                className='set-btn set-primary'
                style={{ visibility: 'hidden' }}
              >
                {'\u624b\u5165\u529b'}
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                {'\u623B\u308B'}
              </button>
            </ActionFooter>

            {showReadConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u5165\u529b\u5185\u5bb9\u3067\u8aad\u8fbc\u3092'}<br />{'\u5b8c\u4e86\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      {'\u306f\u3044'}
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
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u624b\u5165\u529b\u30c0\u30a4\u30a2\u30ed\u30b0\u3092'}<br />{'\u9589\u3058\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/set-miscellaneous-in-and-out-bound')
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
    </div>
  )
}

export { MiscellaneousInAndOutBound }
