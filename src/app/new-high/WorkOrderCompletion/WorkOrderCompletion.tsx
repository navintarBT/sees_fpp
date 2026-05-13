import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaRegCalendarAlt} from 'react-icons/fa'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'

const WO_MOCKUP_DATA: Record<string, {completed: number; defective: number}> = {
  'WO-001': {completed: 9, defective: 1},
  'WO-002': {completed: 5, defective: 5},
  'WO-003': {completed: 8, defective: 2},
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
  const todayValue = toDateValue(new Date())
  const [woDatePickerValue, setWoDatePickerValue] = useState(todayValue)
  const [showWoCalendar, setShowWoCalendar] = useState(false)
  const [woCalendarMonth, setWoCalendarMonth] = useState(() => parseDateValue(todayValue))
  const [woNumber, setWoNumber] = useState('WO-001')

  const woData = WO_MOCKUP_DATA[woNumber] ?? {completed: 0, defective: 0}

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
                <input value={woNumber} style={{textAlign: 'center'}} onChange={(e) => setWoNumber(e.target.value)} />
              </div>
              <div className='hand-row' style={{marginTop: '11px', fontSize: '30px'}}>
                <label>WO完了数</label>
                <span style={{marginTop: '10px', fontSize: '32px', textAlign: 'center'}}>
                  {woData.completed}
                </span>
              </div>
              <div className='hand-row' style={{marginTop: '22px', fontSize: '30px'}}>
                <label>WO仕損数</label>
                <span style={{color: '#e05555', marginTop: '12px', fontSize: '32px', textAlign: 'center'}}>
                  {woData.defective}
                </span>
              </div>
            </div>

            <ActionFooter columns={4}>
              <button className='set-btn set-danger' style={{visibility: 'hidden'}}>{'\u7834\u68C4'}</button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>{'\u8AAD\u8FBC'}</button>
              <button className='set-btn set-success' style={{visibility: 'hidden'}}>{'\u89E3\u9664'}</button>
              <button className='set-btn set-warning' onClick={() => navigate('/factory/factory')}>{'\u623B\u308B'}</button>
            </ActionFooter>
          </div>
        </div>
      </div>
    </div>
  )
}

export {WorkOrderCompletion}
