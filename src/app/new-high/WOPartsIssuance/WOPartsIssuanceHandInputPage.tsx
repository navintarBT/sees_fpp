import {useRef, useState, type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number
  office: string
  storage: string
  numOfShipments: string
  Interior: string
  lot: string
}

const WOPartsIssuanceHandInputPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      Interior: '部品001',
      office:'Fxxxxx', 
      storage: 'LOC-012',
      numOfShipments: '8',
      lot: 'LOT-012', // ロット
    },
    {
      id: 2,
      Interior: '部品002',
      office:'Fxxxxx', 
      storage: 'LOC-013',
      numOfShipments: '2',
      lot: 'LOT-013', // ロット
    },
  ])
  const [parentItem, setParentItem] = useState('部品001')
  const [parentSerial, setParentSerial] = useState('WO-001')
  const [moveStorage, setMoveStorage] = useState('10')
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  
  const tableColumns: Array<TFTableColumn<Row>> = [
    {key: 'Interior', headClassName: 'col-Interior', cellClassName: 'col-Interior', header: '庫内ﾗﾍﾞﾙ', render: (row) => row.Interior},
    {key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: 'ロット', render: (row) => row.lot},
    {key: 'numOfShipments', headClassName: 'col-numOfShipments', cellClassName: 'col-numOfShipments', header: '出庫数', render: (row) => row.numOfShipments},
    {key: 'storage', headClassName: 'col-storage', cellClassName: 'col-storage', header: '保管場所', render: (row) => row.storage},
    {key: 'office', headClassName: 'col-office', cellClassName: 'col-office', header: '事業所', render: (row) => row.office},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>WO部品出庫　品番別</div>
          <div className='set-body'>
                <div className='set-form'>
                  <div className='set-row'>
                    <label>品番</label>
                    <input
                    style={{textAlign: 'center'}}
                      value={parentItem}
                    />
                  </div>
                    <div className='set-row'>
                    <label>WO番号</label>
                    <input
                    style={{textAlign: 'center'}}
                      value={parentSerial}
                    />
                  </div>
                  <div className='set-row'>
                    <label>必要数</label>
                    <input
                    style={{textAlign: 'center'}}
                      value={moveStorage}
                    />
                  </div>
                </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='wOHandInputPage-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
            />

            <ActionFooter columns={3}>
              <button
                className='set-btn set-success'
                onClick={() => setShowHandInputConfirm(true)}

              >
                出庫登録
              </button>
              <button
                className='set-btn set-success'
                style={{ visibility: 'hidden' }}
              >
                {'\u51FA\u5EAB\u767B\u9332'}
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                {'\u623B\u308B'}
              </button>
            </ActionFooter>
       </div>

            {showHandInputConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>変更を確認しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowHandInputConfirm(false)
                        navigate('')
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
