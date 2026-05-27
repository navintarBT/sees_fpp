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
}

const WOPartsIssuanceHandInputPage = () => {
  const navigate = useNavigate()
  const [rows] = useState<Row[]>([])
  const [parentItem, setParentItem] = useState('')
  const [parentSerial] = useState('')
  const [moveStorage] = useState('')
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const itemInputRef = useRef<HTMLInputElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)

  useEffect(() => {
    itemInputRef.current?.focus()
  }, [])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (activeRowId === row.id ? '\u25b6' : ''),
    },
    {key: 'Interior', headClassName: 'col-Interior', cellClassName: 'col-Interior', header: '\u5eab\u5185\uff97\uff8d\uff9e\uff99', render: (row) => row.Interior},
    {key: 'numOfShipments', headClassName: 'col-numOfShipments', cellClassName: 'col-numOfShipments', header: '\u51fa\u5eab\u6570', render: (row) => row.numOfShipments},
    {key: 'storage', headClassName: 'col-storage', cellClassName: 'col-storage', header: '\u4fdd\u7ba1\u5834\u6240', render: (row) => row.storage},
    {key: 'office', headClassName: 'col-office', cellClassName: 'col-office', header: '\u4e8b\u696d\u6240', render: (row) => row.office},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>{'WO\u90e8\u54c1\u51fa\u5eab \u54c1\u756a\u5225'}</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>{'\u54c1\u756a'}</label>
                <input
                  ref={itemInputRef}
                  style={{textAlign: 'center'}}
                  value={parentItem}
                  onChange={(e) => setParentItem(e.target.value)}
                />
              </div>
              <div className='set-row'>
                <label>{'WO\u756a\u53f7'}</label>
                <input
                  style={{textAlign: 'center'}}
                  value={parentSerial}
                  disabled
                />
              </div>
              <div className='set-row'>
                <label>{'\u5fc5\u8981\u6570'}</label>
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
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => {
                const nextRowId = Number(rowKey)
                setActiveRowId((prev) => (prev === nextRowId ? null : nextRowId))
              }}
            />

            <ActionFooter columns={3}>
              <button
                className='set-btn set-success'
                onClick={() => setShowHandInputConfirm(true)}
              >
                {'\u51fa\u5eab\u767b\u9332'}
              </button>
              <button
                className='set-btn set-success'
                style={{visibility: 'hidden'}}
              >
                {'\u51fa\u5eab\u767b\u9332'}
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                {'\u623b\u308b'}
              </button>
            </ActionFooter>
          </div>

          {showHandInputConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                <div className='set-modal-body'>{'\u5909\u66f4\u3092\u78ba\u8a8d\u3057\u307e\u3059\u304b\uff1f'}</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowHandInputConfirm(false)
                      navigate('')
                    }}
                  >
                    {'\u306f\u3044'}
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => {
                      setShowHandInputConfirm(false)
                    }}
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
                      navigate('/factory/button-access')
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
  )
}

export {WOPartsIssuanceHandInputPage}