import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'
import { FaRegCalendarAlt } from 'react-icons/fa'

const formatWoDate = (value: string) => {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return 'yy/mm/dd'
  return `${year}/${month}/${day}`
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

type Row = {
  id: number
  woNo: string
  itemNo: string
  itemName: string
  targetTime?: string
  acceptedQty?: string
  defectiveQty?: string
  opOrder?: string
  opDesc?: string
  processStatus?: string
  remarks?: string
}

const SESSION_STORAGE_KEY = 'workOrderTimeRegistrationSelectedWoNumbers'
const SESSION_STORAGE_ROWS_KEY = 'workOrderTimeRegistrationGosenRows'

const DEFAULT_ROWS: Row[] = [
  {
    id: 1,
    woNo: 'WO-001',
    itemNo: 'a',
    itemName: '製品a',
    targetTime: '50',
    acceptedQty: '9',
    defectiveQty: '1',
    opOrder: '10',
    opDesc: '研磨3',
    processStatus: '90',
    remarks: 'xxxxx',
  },
  {
    id: 2,
    woNo: 'WO-002',
    itemNo: 'b',
    itemName: '製品b',
    targetTime: '50',
    acceptedQty: '3',
    defectiveQty: '',
    opOrder: '10',
    opDesc: '研磨3',
    processStatus: '',
    remarks: '',
  },
  {
    id: 3,
    woNo: 'WO-003',
    itemNo: 'c',
    itemName: '製品c',
  },
  {
    id: 4,
    woNo: 'WO-004',
    itemNo: 'd',
    itemName: '製品d',
  },
  {
    id: 5,
    woNo: 'WO-005',
    itemNo: 'e',
    itemName: '製品e',
  },
  {
    id: 6,
    woNo: 'WO-006',
    itemNo: 'f',
    itemName: '製品f',
  },
  {
    id: 7,
    woNo: 'WO-007',
    itemNo: 'g',
    itemName: '製品g',
  },
  {
    id: 8,
    woNo: 'WO-008',
    itemNo: 'h',
    itemName: '製品h',
  },
]

const WorkOrderTimeRegistrationGosen = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rows, setRows] = useState<Row[]>([])

  const saveRowsToStorage = (rowsToSave: Row[]) => {
    sessionStorage.setItem(SESSION_STORAGE_ROWS_KEY, JSON.stringify(rowsToSave))
  }

  const todayValue = toDateValue(new Date())
  const [woDatePickerValue, setWoDatePickerValue] = useState(todayValue)
  const [showWoCalendar, setShowWoCalendar] = useState(false)
  const [woCalendarMonth, setWoCalendarMonth] = useState(() => parseDateValue(todayValue))

  const openWoDatePicker = () => {
    setWoCalendarMonth(parseDateValue(woDatePickerValue))
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

  const calendarDays = getCalendarDays(woCalendarMonth)
  const calendarMonthLabel = woCalendarMonth.toLocaleString('ja-JP', { month: 'long', year: 'numeric' })

  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([])

  const isAnyModalOpen =
    showDeleteSelectedConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowDeleteSelectedConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowBackConfirm(false)
  }

  const handleDeleteSelected = () => {
    if (checkedRowIds.length === 0) {
      setShowNoSelectionConfirm(true)
      return
    }
    setShowDeleteSelectedConfirm(true)
  }

  const confirmDeleteSelected = () => {
    setRows((prev) => {
      const nextRows = prev.filter((row) => !checkedRowIds.includes(row.id))
      saveRowsToStorage(nextRows)
      return nextRows
    })
    setCheckedRowIds([])
    setShowDeleteSelectedConfirm(false)
  }

  const clearAll = () => {
    setRows([])
    saveRowsToStorage([])
    setCheckedRowIds([])
  }

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  const isAllChecked = rows.length > 0 && rows.every((row) => checkedRowIds.includes(row.id))

  const toggleAllChecked = (checked: boolean) => {
    if (checked) {
      setCheckedRowIds(rows.map((row) => row.id))
      return
    }
    setCheckedRowIds([])
  }

  const toggleRowChecked = (rowId: number, checked: boolean) => {
    setCheckedRowIds((prev) => {
      if (checked) {
        return prev.includes(rowId) ? prev : [...prev, rowId]
      }
      return prev.filter((id) => id !== rowId)
    })
  }

  const updateRowField = (
    rowId: number,
    field: keyof Omit<Row, 'id' | 'woNo'>,
    value: string,
  ) => {
    setRows((prevRows) => {
      const nextRows = prevRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      )
      saveRowsToStorage(nextRows)
      return nextRows
    })
  }

  useEffect(() => {
    const state = location.state as { selectedWoNumbers?: string[] } | null
    const selectedWoNumbers = state?.selectedWoNumbers

    if (Array.isArray(selectedWoNumbers) && selectedWoNumbers.length > 0) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedWoNumbers))
      const matchedRows = DEFAULT_ROWS.filter((row) => selectedWoNumbers.includes(row.woNo))
      setRows(matchedRows)
      saveRowsToStorage(matchedRows)
    } else {
      const savedRows = sessionStorage.getItem(SESSION_STORAGE_ROWS_KEY)
      if (savedRows) {
        try {
          const parsedRows = JSON.parse(savedRows)
          if (Array.isArray(parsedRows)) {
            setRows(parsedRows.filter((item): item is Row => item && typeof item === 'object' && typeof item.id === 'number'))
            return
          }
        } catch {
          // ignore invalid stored rows
        }
      }

      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            const validSelection = parsed.filter((item): item is string => typeof item === 'string')
            if (validSelection.length > 0) {
              const matchedRows = DEFAULT_ROWS.filter((row) => validSelection.includes(row.woNo))
              setRows(matchedRows)
              saveRowsToStorage(matchedRows)
            }
          }
        } catch {
          // ignore invalid storage data
        }
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) return

      if (event.key === 'F1') {
        event.preventDefault()
        handleDeleteSelected()
        return
      }

      if (event.key === 'F2') {
        event.preventDefault()
        setShowCompleteConfirm(true)
        return
      }

      if (event.key === 'F4') {
        event.preventDefault()
        setShowBackConfirm(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [checkedRowIds, isAnyModalOpen, location.state])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'check',
      headClassName: 'col-check',
      cellClassName: 'col-check',
      header: (
        <input
          type='checkbox'
          className='tf-tableCheckbox'
          checked={isAllChecked}
          onChange={(e) => toggleAllChecked(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label='Select all rows'
        />
      ),
      render: (row) => (
        <input
          type='checkbox'
          className='tf-tableCheckbox'
          checked={checkedRowIds.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation()
            toggleRowChecked(row.id, e.target.checked)
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select row ${row.id}`}
        />
      ),
    },
    { key: 'woNo', headClassName: 'col-wo', cellClassName: 'col-wo', header: 'WoNo', render: (row) => row.woNo },
    {
      key: 'itemNo',
      headClassName: 'col-item-no',
      cellClassName: 'col-item-no',
      header: '品番',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.itemNo}
          onChange={(e) => updateRowField(row.id, 'itemNo', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'itemName',
      headClassName: 'col-item-name',
      cellClassName: 'col-item-name',
      header: '品名',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.itemName}
          onChange={(e) => updateRowField(row.id, 'itemName', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'targetTime',
      headClassName: 'col-target-time',
      cellClassName: 'col-target-time col-text-purple',
      header: '目標時間',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.targetTime ?? ''}
          onChange={(e) => updateRowField(row.id, 'targetTime', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'acceptedQty',
      headClassName: 'col-qty',
      cellClassName: 'col-qty',
      header: '合格数',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.acceptedQty ?? ''}
          onChange={(e) => updateRowField(row.id, 'acceptedQty', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'defectiveQty',
      headClassName: 'col-qty',
      cellClassName: 'col-qty',
      header: '不良数',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.defectiveQty ?? ''}
          onChange={(e) => updateRowField(row.id, 'defectiveQty', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'opOrder',
      headClassName: 'col-op',
      cellClassName: 'col-op',
      header: '作業順序',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.opOrder ?? ''}
          onChange={(e) => updateRowField(row.id, 'opOrder', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'opDesc',
      headClassName: 'col-op',
      cellClassName: 'col-op',
      header: '作業記述',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.opDesc ?? ''}
          onChange={(e) => updateRowField(row.id, 'opDesc', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'processStatus',
      headClassName: 'col-process',
      cellClassName: 'col-process',
      header: '工程状況',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.processStatus ?? ''}
          onChange={(e) => updateRowField(row.id, 'processStatus', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'remarks',
      headClassName: 'col-remarks',
      cellClassName: 'col-remarks',
      header: '備考',
      render: (row) => (
        <input
          type='text'
          className='table-cell-input'
          value={row.remarks ?? ''}
          onChange={(e) => updateRowField(row.id, 'remarks', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>作業オーダー実績時間登録</div>
          <div className='set-body'>
            <div className='set-formnew_high '>
              <div className='wot-header-container '>
                {/* Left side: Info Grid */}
                <div className='wot-info-soll'>
                  <div className='wot-info-grid'>
                    <label className='wot-grid-label wot-bg-blue' >人</label>
                    <input className='wot-grid-value' autoFocus />
                  </div>

                  <div className='wot-info-grid'>
                    <label className='wot-grid-label wot-bg-blue'>日付</label>
                    <div className='hand-date-field'>
                      <input
                        readOnly
                        className='wot-grid-value'
                        value={formatWoDate(woDatePickerValue)}
                        onClick={openWoDatePicker}
                        style={{ cursor: 'pointer' }}
                      />
                      <button
                        type='button'
                        className='hand-date-btn'
                        aria-label='Choose date'
                        onClick={openWoDatePicker}
                      >
                        <FaRegCalendarAlt />
                      </button>
                      {showWoCalendar && (
                        <div className='hand-calendar' role='dialog' aria-label='Choose date'>
                          <div className='hand-calendar-header'>
                            <button type='button' onClick={() => changeWoCalendarMonth(-1)}>{'<'}</button>
                            <span>{calendarMonthLabel}</span>
                            <button type='button' onClick={() => changeWoCalendarMonth(1)}>{'>'}</button>
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
                                  value === woDatePickerValue ? 'hand-calendar-selected' : '',
                                ].filter(Boolean).join(' ')}
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
                              onClick={() => selectWoDate(toDateValue(new Date()))}
                            >
                              今日
                            </button>
                            <button
                              type='button'
                              className='hand-calendar-btn-clear'
                              onClick={() => selectWoDate('')}
                            >
                              クリア
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='wot-info-grid'>
                    <label className='wot-grid-label wot-bg-red'>工程状況初期値</label>
                    <input className='wot-grid-value wot-text-red' />
                  </div>
                  <div className='wot-info-grid'>
                    <label className='wot-grid-label wot-bg-red'>作業順序</label>
                    <input className='wot-grid-value wot-text-red' />
                  </div>
                  <div className='wot-info-grid'>
                    <label className='wot-grid-label wot-bg-red'>備考</label>
                    <input className='wot-grid-value wot-text-red' />
                  </div>
                </div>

                <div className='wot-header-actions'>
                  <div className='wot-top-row'>
                    <button className='set-btnnew_high set-primary' onClick={() => navigate('/factory/work-order-time-registration-choose')}>
                      WO選択
                    </button>
                  </div>
                  <div className='wot-radio-container'>
                    <div className='wot-radio-title'>登録時間種類</div>
                    <div className='wot-radio-group'>
                      <label className='wot-radio-item'>
                        <input type='radio' name='timeType' defaultChecked />
                        <span>労務</span>
                      </label>
                      <label className='wot-radio-item'>
                        <input type='radio' name='timeType' />
                        <span>段取</span>
                      </label>
                      <label className='wot-radio-item'>
                        <input type='radio' name='timeType' />
                        <span>機械</span>
                      </label>
                    </div>
                    <ActionFooter columns={2}>
                      <button className='set-btnnew_high set-primary'>作業開始</button>
                      <button className='set-btnnew_high set-success'>作業終了</button>
                    </ActionFooter>
                  </div>
                </div>
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='delivery-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              isRowActive={(rowKey) => checkedRowIds.includes(Number(rowKey))}
            />

            <div className='wot-footer-summary wot-radio-container'>
              <div className='wot-footer-row'>
                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-blue'>開始</label>
                  <input className='wot-grid-value' type='time' />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-blue'>終了</label>
                  <input className='wot-grid-value' type='time' />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-blue'>作業時間</label>
                  <input className='wot-grid-value' placeholder='時間' />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-blue'></label>
                  <input className='wot-grid-value addspanto' placeholder='分' />
                </div>

                <div className='wot-footer-item'>
                  <label className='wot-footer-label wot-bg-blue'>目標時間計</label>
                  <input className='wot-grid-value' placeholder='時間' />
                </div>

                <div className='wot-footer-item'>
                  <input className='wot-grid-value addspanto' placeholder='分' />
                </div>
              </div>
            </div>

            <ActionFooter columns={4}>
              <button
                className='set-btn set-danger'
                onClick={handleDeleteSelected}
              >
                選択行削除
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => setShowCompleteConfirm(true)}
              >
                実績登録
              </button>
              <button
                className='set-btn-footer set-primary'
                style={{ visibility: 'hidden' }}
              >
                {'\u624b\u5165\u529b'}
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                戻る
              </button>
            </ActionFooter>
          </div>

          {showDeleteSelectedConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択された行を削除しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={confirmDeleteSelected}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowDeleteSelectedConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showNoSelectionConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択行がありません。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowNoSelectionConfirm(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showClearConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>読み込みデータを破棄します。<br />宜しいですか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowClearConfirm(false)
                      clearAll()
                      resetTableScroll()
                    }}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowClearConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>実績を登録しました。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowCompleteConfirm(false)}
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
                      navigate('/factory/button-work-order-time')
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
  )
}

export { WorkOrderTimeRegistrationGosen }
