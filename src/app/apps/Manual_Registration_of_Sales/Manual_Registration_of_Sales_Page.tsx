import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DeliveryRow, FormData, RowStatus } from './types'
import './Manual_Registration_of_Sales_Page.css'

type ModalAction = {
  label: string
  onClick: () => void
}

type ModalState = {
  title: string
  body: string
  actions: ModalAction[]
  showCloseButton?: boolean
}

const initialRows: DeliveryRow[] = [
  { id: 1, deliveryNo: 'D00001', status: ' ' },
  { id: 2, deliveryNo: 'D00002', status: ' ' },
  { id: 3, deliveryNo: 'D00003', status: ' ' },
  { id: 4, deliveryNo: 'D00004', status: ' ' },
  { id: 5, deliveryNo: 'D00005', status: ' ' },
  { id: 6, deliveryNo: 'D00006', status: ' ' },
  { id: 7, deliveryNo: 'D00007', status: ' ' },
  { id: 8, deliveryNo: 'D00008', status: ' ' },
  { id: 9, deliveryNo: 'D00009', status: ' ' },
  { id: 10, deliveryNo: 'D00010', status: ' ' },
]

const createInitialForm = (): FormData => ({
  shipmentNo: '',
  deliverySlipNo: '',
})

const Mockup_11_Page: React.FC = () => {
  const navigate = useNavigate()
  const modalTimerRef = useRef<number | null>(null)

  const [rows, setRows] = useState<DeliveryRow[]>(initialRows)
  const [form, setForm] = useState<FormData>(createInitialForm)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showHandInput, setShowHandInput] = useState<boolean>(false)
  const [modalState, setModalState] = useState<ModalState | null>(null)

  const closeModal = (): void => {
    if (modalTimerRef.current !== null) {
      window.clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }
    setModalState(null)
  }

  const openModal = (modal: ModalState, autoCloseMs?: number): void => {
    if (modalTimerRef.current !== null) {
      window.clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }

    setModalState(modal)

    if (autoCloseMs) {
      modalTimerRef.current = window.setTimeout(() => {
        setModalState(null)
        modalTimerRef.current = null
      }, autoCloseMs)
    }
  }

  useEffect(() => {
    return () => {
      if (modalTimerRef.current !== null) {
        window.clearTimeout(modalTimerRef.current)
      }
    }
  }, [])

  const handleShipmentNoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, shipmentNo: value }))

    if (value.length === 8) {
      openModal(
        {
          title: '確認',
          body: `出荷No. ${value} をスキャンしました。`,
          actions: [],
        },
        1500,
      )
    }
  }

  const handleDeliverySlipNoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, deliverySlipNo: value }))

    if (value.length === 8) {
      addDeliverySlip(value)
      openModal(
        {
          title: '確認',
          body: `納品書 ${value} を追加しました。`,
          actions: [],
        },
        1500,
      )
    }
  }

  const addDeliverySlip = (deliveryNo: string): void => {
    const newRow: DeliveryRow = {
      id: Date.now(),
      deliveryNo,
      status: 'Add',
    }

    setRows((prev) => [...prev, newRow])
    setForm((prev) => ({ ...prev, deliverySlipNo: '' }))
  }

  const handleRowSelect = (rowId: number): void => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId],
    )
  }

  const handleSelectAll = (): void => {
    if (selectedRows.length === rows.length) {
      setSelectedRows([])
      return
    }

    setSelectedRows(rows.map((row) => row.id))
  }

  const deleteSelectedRows = (): void => {
    if (selectedRows.length === 0) {
      openModal({
        title: '確認',
        body: '削除する行を選択してください。',
        actions: [{ label: 'OK', onClick: closeModal }],
      })
      return
    }

    openModal({
      title: '確認',
      body: `選択した${selectedRows.length}件を削除対象にしますか。`,
      actions: [
        {
          label: 'はい',
          onClick: () => {
            setRows((prev) =>
              prev.map((row) => (selectedRows.includes(row.id) ? { ...row, status: 'Delete' } : row)),
            )
            setSelectedRows([])
            openModal(
              {
                title: '確認',
                body: '選択した行を削除対象に設定しました。',
                actions: [],
              },
              1500,
            )
          },
        },
        { label: 'いいえ', onClick: closeModal },
      ],
    })
  }

  const clearAllData = (): void => {
    openModal({
      title: '確認',
      body: '入力済みデータをすべてクリアしますか。',
      actions: [
        {
          label: 'はい',
          onClick: () => {
            setForm(createInitialForm())
            setRows([])
            setSelectedRows([])
            openModal(
              {
                title: '確認',
                body: 'データをクリアしました。',
                actions: [],
              },
              1500,
            )
          },
        },
        { label: 'いいえ', onClick: closeModal },
      ],
    })
  }

  const handleComplete = (): void => {
    const rowsToRegister = rows.filter((row) => row.status !== 'Delete')

    if (rowsToRegister.length === 0) {
      openModal({
        title: '確認',
        body: '登録するデータがありません。',
        actions: [{ label: 'OK', onClick: closeModal }],
      })
      return
    }

    openModal({
      title: '確認',
      body: `${rowsToRegister.length}件の納品書を登録しますか。`,
      actions: [
        {
          label: 'はい',
          onClick: () => {
            console.log('Registering delivery slips:', rowsToRegister)
            console.log('Shipment No.:', form.shipmentNo)

            setRows((prev) =>
              prev.map((row) => (row.status === 'Add' ? { ...row, status: ' ' } : row)),
            )

            openModal(
              {
                title: '確認',
                body: '納品書を登録しました。',
                actions: [],
              },
              2000,
            )
          },
        },
        { label: 'いいえ', onClick: closeModal },
      ],
    })
  }

const handleBack = (): void => {
  openModal({
    title: '確認',
    body: '入力内容を残したまま画面を終了しますか。',
    actions: [
      {
        label: 'はい',
        onClick: () => {
          closeModal();
          navigate('/apps/mockup/mockups');
        },
      },
      {
        label: 'いいえ',
        onClick: () => {
          closeModal();
          navigate('/apps/mockup/mockups');
        },
      },
    ],
    showCloseButton: true,
  });
};
  const getStatusIndicator = (status: RowStatus): string => {
    switch (status) {
      case ' ':
        return ''
      case 'Add':
        return ''
      case 'Delete':
        return ''
      default:
        return ''
    }
  }

  return (
    <div className='mockup-page set-register-11-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>納品書登録</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>
                  出荷No. <span className='input-hint'></span>
                </label>
                <input
                  value={form.shipmentNo}
                  onChange={handleShipmentNoChange}
                  placeholder='スキャン'
                  maxLength={8}
                />
              </div>

              <div className='set-row'>
                <label>
                  納品書No. <span className='input-hint'></span>
                </label>
                <input
                  value={form.deliverySlipNo}
                  onChange={handleDeliverySlipNoChange}
                  placeholder='スキャン'
                  maxLength={8}
                />
              </div>
            </div>

            <div className='set-table-wrap'>
              <div className='set-table'>
                <div className='set-table-scroll'>
                  <div className='set-table-head'>
                    <span className='col-select'>
                      <input
                        className='set-checkbox'
                        type='checkbox'
                        checked={selectedRows.length === rows.length && rows.length > 0}
                        onChange={handleSelectAll}
                      />
                    </span>
                    <span className='col-status'>
                      状態 <span className='hint'></span>
                    </span>
                    <span className='col-delivery-no'>
                      納品書No. <span className='hint'></span>
                    </span>
                  </div>
                  <div className='set-table-body'>
                    {rows.length === 0 ? (
                      <div className='set-empty'>読込データはありません</div>
                    ) : (
                      rows.map((row) => (
                        <div
                          className={`set-table-row ${selectedRows.includes(row.id) ? 'selected' : ''} status-${row.status.toLowerCase()}`}
                          key={row.id}
                        >
                          <span className='col-select'>
                            <input
                              className='set-checkbox'
                              type='checkbox'
                              checked={selectedRows.includes(row.id)}
                              onChange={() => handleRowSelect(row.id)}
                              disabled={row.status === 'Delete'}
                            />
                          </span>
                          <span className='col-status'>
                            {row.status}
                            <span className='status-indicator'>{getStatusIndicator(row.status)}</span>
                          </span>
                          <span className='col-delivery-no'>{row.deliveryNo}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='set-actions set-actions-row'>
              <button className='set-btn set-danger' onClick={clearAllData}>
                破棄<span className='btn-hint'></span>
              </button>

              <button className='set-btn set-primary' onClick={handleComplete}>
                完了<span className='btn-hint'></span>
              </button>

              <button
                className='set-btn set-success'
                onClick={deleteSelectedRows}
                disabled={selectedRows.length === 0}
              >
                削除 <span className='btn-hint'></span>
              </button>

              <button className='set-btn set-warning' onClick={handleBack}>
                戻る<span className='btn-hint'></span>
              </button>
            </div>

            {/* <HandInputModal
              isOpen={showHandInput}
              onClose={() => setShowHandInput(false)}
              onAddDeliverySlip={addDeliverySlip}
            /> */}

            {modalState && (
              <div className='set-modal-backdrop' role='presentation'>
                <div
                  className={`set-modal ${modalState.actions.length === 3 ? 'set-modal-wide' : ''}`}
                  role='dialog'
                  aria-modal='true'
                  onMouseDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                >
                  <div className='set-modal-header'>
                    <span>{modalState.title}</span>
                    {modalState.showCloseButton && (
                      <button
                        type='button'
                        className='set-modal-close'
                        aria-label='閉じる'
                        onClick={closeModal}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className='set-modal-body'>{modalState.body}</div>
                  {modalState.actions.length > 0 && (
                    <div className='set-modal-actions'>
                      {modalState.actions.map((action) => (
                        <button
                          key={action.label}
                          type='button'
                          className='set-modal-btn'
                          onMouseDown={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            action.onClick()
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Mockup_11_Page }
