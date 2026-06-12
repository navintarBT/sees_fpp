import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number
  office: string
  storage: string
  numOfShipments: string
  Interior: string
  locked?: boolean
}

const INTERIOR_LABEL_DATA: Record<string, Omit<Row, 'id'>> = {
  '部品001 LOT-0130': {
    Interior: '部品001 LOT-0130',
    numOfShipments: '8',
    storage: 'LOC-001',
    office: 'Fxxx',
  },
  '部品001 LOT-0202': {
    Interior: '部品001 LOT-0202',
    numOfShipments: '2',
    storage: 'LOC-001',
    office: 'Fxxx',
  },
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 0,
  height: '100%',
  border: 0,
  outline: 'none',
  boxShadow: 'none',
  background: 'transparent',
  font: 'inherit',
  textAlign: 'center',
}

const WOPartsIssuanceHandInputPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const itemInputRef = useRef<HTMLInputElement | null>(null)
  const interiorInputRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showRegisteredComplete, setShowRegisteredComplete] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([])
  const [pendingFocusRowId, setPendingFocusRowId] = useState<number | null>(null)

  useEffect(() => {
    itemInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (pendingFocusRowId == null) return
    requestAnimationFrame(() => {
      interiorInputRefs.current[pendingFocusRowId]?.focus()
      setPendingFocusRowId(null)
    })
  }, [pendingFocusRowId, rows])

  const handleItemScan = () => {
    const scannedItem = parentItem.trim()

    if (scannedItem !== '部品001') return

    const emptyRow = {
      id: 1,
      office: '',
      storage: '',
      numOfShipments: '',
      Interior: '',
    }

    setParentItem(scannedItem)
    setParentSerial('WO-001')
    setMoveStorage('10')
    setRows([emptyRow])
    setSelectedRowIds([])
    setPendingFocusRowId(emptyRow.id)
  }

  const updateRow = (rowId: number, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? {...row, ...patch} : row)),
    )
  }

  const handleInteriorScan = (rowId: number) => {
    const currentRow = rows.find((row) => row.id === rowId)
    if (!currentRow) return

    const scannedLabel = currentRow.Interior.trim()
    const scannedData = INTERIOR_LABEL_DATA[scannedLabel]
    if (!scannedData) return

    const nextRowId = Math.max(...rows.map((row) => row.id), 0) + 1

    setRows((prev) => {
      const hasNextEmptyRow = prev.some((row) => row.id > rowId && row.Interior === '')
      const updatedRows = prev.map((row) =>
        row.id === rowId ? {...row, ...scannedData, locked: true} : row,
      )

      if (hasNextEmptyRow) return updatedRows

      return [
        ...updatedRows,
        {
          id: nextRowId,
          office: '',
          storage: '',
          numOfShipments: '',
          Interior: '',
        },
      ]
    })
    setPendingFocusRowId(nextRowId)
  }

  const handleRowClick = (rowId: number) => {
    setSelectedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId],
    )
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const deleteSelectedRows = () => {
    setRows((prev) => prev.filter((row) => !selectedRowIds.includes(row.id)))
    setSelectedRowIds([])
    setShowDeleteConfirm(false)
  }

  const resetPage = () => {
    setRows([])
    setParentItem('')
    setParentSerial('')
    setMoveStorage('')
    setSelectedRowIds([])
    setPendingFocusRowId(null)
    requestAnimationFrame(() => {
      itemInputRef.current?.focus()
    })
  }

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (selectedRowIds.includes(row.id) ? '▶' : ''),
    },
    {
      key: 'Interior',
      headClassName: 'col-Interior',
      cellClassName: 'col-Interior',
      header: '庫内ラベル',
      render: (row) => {
        const isLocked = !!row.locked
        return (
          <input
            ref={(el) => {
              interiorInputRefs.current[row.id] = el
            }}
            style={{
              ...inputStyle,
              background: 'transparent',
              cursor: isLocked ? 'default' : 'text',
            }}
            value={row.Interior}
            disabled={isLocked}
            onChange={(e) => updateRow(row.id, {Interior: e.target.value})}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.stopPropagation()
                handleInteriorScan(row.id)
              }
            }}
          />
        )
      },
    },
    {
      key: 'numOfShipments',
      headClassName: 'col-numOfShipments',
      cellClassName: 'col-numOfShipments',
      header: '出庫数',
      render: (row) => (
        <input
          style={{...inputStyle, width: '120px'}}
          value={row.numOfShipments}
          onChange={(e) => updateRow(row.id, {numOfShipments: e.target.value})}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'storage',
      headClassName: 'col-storage',
      cellClassName: 'col-storage',
      header: '保管場所',
      render: (row) => (
        <input
          style={{...inputStyle, width: '240px'}}
          value={row.storage}
          onChange={(e) => updateRow(row.id, {storage: e.target.value})}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'office',
      headClassName: 'col-office',
      cellClassName: 'col-office',
      header: '事業所',
      render: (row) => (
        <input
          style={{...inputStyle, width: '236px'}}
          value={row.office}
          onChange={(e) => updateRow(row.id, {office: e.target.value})}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>{'WO部品出庫 品番別'}</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>{'品番'}</label>
                <input
                  ref={itemInputRef}
                  style={{textAlign: 'center', outline: 'none', boxShadow: 'none'}}
                  value={parentItem}
                  onChange={(e) => setParentItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleItemScan()
                    }
                  }}
                />
              </div>
              <div className='set-row'>
                <label>{'WO番号'}</label>
                <input
                  style={{textAlign: 'center'}}
                  value={parentSerial}
                  disabled
                />
              </div>
              <div className='set-row'>
                <label>{'必要数'}</label>
                <input
                  style={{textAlign: 'center'}}
                  value={moveStorage}
                  disabled
                />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='wOHandInputPage-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              isRowActive={(rowKey) => selectedRowIds.includes(Number(rowKey))}
              onRowActivate={(rowKey) => handleRowClick(Number(rowKey))}
            />

            <ActionFooter columns={5}>
              <button
                className='set-btn set-success'
                onClick={() => setShowHandInputConfirm(true)}
                style={{visibility: 'hidden'}}
              >
                {'出庫登録'}
              </button>
              <button
                className='set-btn set-danger'
                onClick={() => setShowHandInputConfirm(true)}
              >
                {'出庫登録'}
              </button>
              <button
                className='set-btn set-success'
                onClick={() => setShowHandInputConfirm(true)}
                style={{visibility: 'hidden'}}
              >
                {'出庫登録'}
              </button>
              <button
                className='set-btn set-hand-input-btn'
                onClick={handleDeleteClick}
              >
                削除
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                {'戻る'}
              </button>

            </ActionFooter>
          </div>

          {showHandInputConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>{'確認'}</div>
                <div className='set-modal-body'>登録しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowHandInputConfirm(false)
                      setShowRegisteredComplete(true)
                    }}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => {
                      setShowHandInputConfirm(false)
                    }}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRegisteredComplete && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>{'確認'}</div>
                <div className='set-modal-body'>登録しました。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowRegisteredComplete(false)
                      resetPage()
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
                <div className='set-modal-header'>{'確認'}</div>
                <div className='set-modal-body'>メニューに戻ります。<br /> 読込データを破棄しますか？</div>
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
                    NO
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowBackConfirm(false)}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {showNoSelectionConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>{'確認'}</div>
                <div className='set-modal-body'>行が選択されていません。</div>
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

          {showDeleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>{'確認'}</div>
                <div className='set-modal-body'>選択行を削除しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={deleteSelectedRows}
                  >
                    OK
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
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

export {WOPartsIssuanceHandInputPage}
