import { useState } from 'react'
import { FaPlay, FaRegCalendarAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import {
  TableSection,
  type TableColumn as TFTableColumn,
} from '../../components/TableSection/TableSection'
import { ScaleToFit } from '../../components/ScaleToFit/ScaleToFit'
import { useOrientation, orientationState } from '../../hooks/useOrientation'

const ORIENTATION_KEY = 'workOrderCompletionOrientation'
const TERMINAL_ID = 'ABCDEFGHIJ'

const WO_MOCKUP_DATA: Record<string, { completed: number; defective: number }> = {
  'WO-001': { completed: 9, defective: 1 },
  'WO-002': { completed: 5, defective: 5 },
  'WO-003': { completed: 8, defective: 2 },
  'WO-004': { completed: 2, defective: 5 },
  'WO-005': { completed: 6, defective: 4 },
  'WO-006': { completed: 4, defective: 6 },
  'WO-007': { completed: 9, defective: 1 },
  'WO-008': { completed: 7, defective: 3 },
  'WO-009': { completed: 4, defective: 6 },
  'WO-010': { completed: 5, defective: 5 },
}

type Row = {
  id: number
  seiban: string        // 製番
  woNumber: string      // WO番号
  orderType: string     // オーダータイプ
  itemNumber: string    // 品番
  itemName: string      // 品名
  workplace: string     // 作業場
  opOrder: string       // 作業順序
  requestDate: string   // 要求日 (YYYY/MM/DD)
  adjustDate: string    // 調整日 (YYYY/MM/DD)
}

// 要求日・調整日は「YYYY/MM/DD」形式
const formatDate = (year: number, month: number, day: number) =>
  `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`

const toDateValue = (date: Date) => formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate())

const parseDateValue = (value: string) => {
  const [year, month, day] = value.split('/').map(Number)
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

const DateField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => parseDateValue(value || toDateValue(new Date())))

  const openPicker = () => {
    setCalendarMonth(parseDateValue(value || toDateValue(new Date())))
    setIsOpen((prev) => !prev)
  }

  const changeMonth = (amount: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  const selectDate = (nextValue: string) => {
    onChange(nextValue)
    setIsOpen(false)
  }

  const calendarDays = getCalendarDays(calendarMonth)
  const monthLabel = calendarMonth.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        readOnly
        style={{ width: '100%', height: 50, fontSize: 25, borderRadius: 14, border: '2px solid #5b6d86', padding: '0 16px', cursor: 'pointer' }}
        value={value}
        onClick={openPicker}
        placeholder='yyyy/mm/dd'
      />
      <button type='button' className='hand-date-btn' aria-label='Choose date' onClick={openPicker}>
        <FaRegCalendarAlt />
      </button>
      {isOpen && (
        <div className='hand-calendar hand-calendar-gosen' role='dialog' aria-label='Choose date'>
          <div className='hand-calendar-header'>
            <button type='button' onClick={() => changeMonth(-1)}>{'<'}</button>
            <span>{monthLabel}</span>
            <button type='button' onClick={() => changeMonth(1)}>{'>'}</button>
          </div>
          <div className='hand-calendar-weekdays'>
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className='hand-calendar-days'>
            {calendarDays.map(({ date, value: dayValue, inMonth }) => (
              <button
                type='button'
                key={dayValue}
                className={[
                  'hand-calendar-day',
                  inMonth ? '' : 'hand-calendar-muted',
                  dayValue === value ? 'hand-calendar-selected' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => selectDate(dayValue)}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
          <div className='hand-calendar-footer'>
            <button type='button' className='hand-calendar-btn-today' onClick={() => selectDate(toDateValue(new Date()))}>今日</button>
            <button type='button' className='hand-calendar-btn-clear' onClick={() => selectDate('')}>クリア</button>
          </div>
        </div>
      )}
    </div>
  )
}

// 明細部の表示項目（WO作業時間実績登録のWO検索画面と統一）
const DETAIL_COLUMNS: Array<{ key: keyof Row; header: string }> = [
  { key: 'seiban', header: '製番' },
  { key: 'woNumber', header: 'WO番号' },
  { key: 'orderType', header: 'オーダータイプ' },
  { key: 'itemNumber', header: '品番' },
  { key: 'itemName', header: '品名' },
  { key: 'workplace', header: '作業場' },
  { key: 'opOrder', header: '作業順序' },
  { key: 'requestDate', header: '要求日' },
  { key: 'adjustDate', header: '開始日' },
]

const WorkOrderCompletion_Choose_WO = () => {
  const navigate = useNavigate()
  const isLandscape = useOrientation(ORIENTATION_KEY)
  const [selectedWoNumber, setSelectedWoNumber] = useState('')
  const [showWoLoadConfirm, setShowWoLoadConfirm] = useState(false)
  const [workplaceFilter, setWorkplaceFilter] = useState('')
  const [requestDateFrom, setRequestDateFrom] = useState('')
  const [requestDateTo, setRequestDateTo] = useState('')
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')
  const [filteredRows, setFilteredRows] = useState<Row[] | null>(null)
  const rows: Row[] = Object.keys(WO_MOCKUP_DATA).map((woNumber, index) => {
    const sequence = String(index + 1).padStart(3, '0')
    return {
      id: index + 1,
      seiban: `製番${sequence}`,
      woNumber,
      orderType: index % 2 === 0 ? '製造' : '外注',
      itemNumber: `品番${sequence}`,
      itemName: `品名${sequence}`,
      workplace: `作業場${String((index % 3) + 1).padStart(3, '0')}`,
      opOrder: String(((index % 3) + 1) * 10),
      requestDate: formatDate(2026, 6, index + 1),
      adjustDate: formatDate(2026, 6, index + 3),
    }
  })
  const activeRowId = rows.find((row) => row.woNumber === selectedWoNumber)?.id ?? null
  const displayRows = filteredRows ?? rows

  const selectWoNumber = (woNumber: string) => {
    setSelectedWoNumber(woNumber)
  }

  const handleSearch = () => {
    const filtered = rows.filter((row) => {
      if (workplaceFilter && !row.workplace.includes(workplaceFilter)) return false
      if (requestDateFrom && row.requestDate < requestDateFrom) return false
      if (requestDateTo && row.requestDate > requestDateTo) return false
      if (startDateFrom && row.adjustDate < startDateFrom) return false
      if (startDateTo && row.adjustDate > startDateTo) return false
      return true
    })
    setFilteredRows(filtered)
  }

  const completeWoSelection = () => {
    navigate('/factory/work-order-completion', {
      state: { selectedWoNumber, orientation: isLandscape ? 'landscape' : 'portrait' },
    })
  }

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (
        row.woNumber === selectedWoNumber ? <FaPlay className='col-row-arrow' /> : null
      ),
    },
    ...DETAIL_COLUMNS.map(({ key, header }) => ({
      key,
      headClassName: key === 'opOrder' ? 'col-op-order-search' : 'col-wo-search',
      cellClassName: key === 'opOrder' ? 'col-op-order-search' : 'col-wo-search',
      header,
      render: (row: Row) => row[key],
    })),
  ]

  return (
    <div className='mockup-page'>
      <ScaleToFit active={isLandscape} designWidth={1920} designHeight={1200}>
      <div className={isLandscape ? 'mockup-stage mockup-stage-dark mockup-stage-landscape' : 'mockup-stage mockup-stage-dark'}>
        <div className='mockup-frame'>
          {isLandscape ? (
            <>
              <div className='set-header-landscape'>
                <span className='set-header-title'>WO検索</span>
                <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
              </div>
              <div className='set-body-landscape set-body-landscape-3row'>
                <div className='set-form-landscape'>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                      <label style={{width: 150, flexShrink: 0}}>作業場</label>
                      <input
                        style={{flex: 1, minWidth: 0}}
                        value={workplaceFilter}
                        onChange={(e) => setWorkplaceFilter(e.target.value)}
                      />
                      <input disabled readOnly style={{flex: 1, minWidth: 0, backgroundColor: '#d9d9d9', outline: 'none'}} value='' />
                    </div>
                    <div style={{flex: '1 1 0', minWidth: 0}} />
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                      <label style={{width: 150, flexShrink: 0}}>要求日</label>
                      <DateField value={requestDateFrom} onChange={setRequestDateFrom} />
                      <span style={{fontSize: 25, flexShrink: 0}}>～</span>
                      <DateField value={requestDateTo} onChange={setRequestDateTo} />
                    </div>
                    <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                      <label style={{width: 150, flexShrink: 0}}>開始日</label>
                      <DateField value={startDateFrom} onChange={setStartDateFrom} />
                      <span style={{fontSize: 25, flexShrink: 0}}>～</span>
                      <DateField value={startDateTo} onChange={setStartDateTo} />
                    </div>
                    <button
                      type='button'
                      className='set-search-btn set-primary'
                      style={{height: 50, fontSize: 25, flexShrink: 0}}
                      onClick={handleSearch}
                    >
                      検索
                    </button>
                  </div>
                </div>

                <TableSection
                  columns={tableColumns}
                  rows={displayRows}
                  className='inbound-table-landscape-wrap'
                  gridClassName='delivery-table inbound-table-landscape'
                  gridStyle={{gridTemplateColumns: '50px repeat(9, minmax(120px, 1fr))'}}
                  getRowKey={(row) => row.id}
                  activeRowKey={activeRowId}
                  isRowActive={(_rowKey, row) => row.woNumber === selectedWoNumber}
                  onRowActivate={(_rowKey, row) => selectWoNumber(row.woNumber)}
                />

                <ActionFooter columns={5} gapX={50} className='set-actionfooter-landscape-offset'>
                  <button
                    className='set-btn set-btn-landscape set-success'
                    onClick={() => navigate('/factory/work-order-completion', orientationState(isLandscape))}
                  >
                    戻る
                  </button>
                  <div aria-hidden='true' />
                  <div aria-hidden='true' />
                  <div aria-hidden='true' />
                  <button
                    className='set-btn set-btn-landscape set-primary'
                    disabled={!selectedWoNumber}
                    onClick={() => selectedWoNumber && setShowWoLoadConfirm(true)}
                  >
                    読込
                  </button>
                </ActionFooter>
              </div>
            </>
          ) : (
            <>
          <div className='set-header'>WO検索</div>
          <div className='set-body'>
            <div className='set-form'>
              {/* input fields removed */}
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='delivery-table'
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              isRowActive={(_rowKey, row) => row.woNumber === selectedWoNumber}
              onRowActivate={(_rowKey, row) => selectWoNumber(row.woNumber)}
            />

            <ActionFooter columns={5}>
              <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
              <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
              <button
                className='set-btn set-primary'
                disabled={!selectedWoNumber}
                onClick={() => selectedWoNumber && setShowWoLoadConfirm(true)}
              >
                読込
              </button>
              <button className='set-btn set-primary' style={{ visibility: 'hidden' }}>{'\u8AAD\u8FBC'}</button>
              <button className='set-btn set-warning' onClick={() => navigate('/factory/work-order-completion', orientationState(isLandscape))}>
                戻る
              </button>
            </ActionFooter>
          </div>
            </>
          )}

          {showWoLoadConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>
                  {/* {selectedWoNumber}<br /> */}
                  選択したWO番号を読込みますか？
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
        </div>
      </div>
      </ScaleToFit>
    </div>
  )
}

export { WorkOrderCompletion_Choose_WO }
