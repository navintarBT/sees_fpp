import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'

const YymmDatePicker = ({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) => {
  const [open, setOpen] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => {
    const y = currentYear - 2 + i
    return { yy: String(y).slice(-2) }
  })
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

  const selectedYY = value.slice(0, 2)
  const selectedMM = value.slice(2, 4)

  const handleSelectYear = (yy: string) => {
    const mm = selectedMM || '01'
    onChange(yy + mm)
  }

  const handleSelectMonth = (mm: string) => {
    const yy = selectedYY || years[2].yy
    onChange(yy + mm)
    setOpen(false)
  }

  const display = value.length === 4 ? `${value.slice(0, 2)}/${value.slice(2, 4)}` : ''
    
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input
        readOnly
        placeholder='YY/MM'
        value={display}
        onClick={() => setOpen((o) => !o)}
        style={{ cursor: 'pointer', width: '100%' }}
      />
      {open && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
            }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              zIndex: 100,
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '8px',
              display: 'flex',
              gap: '4px',
              minWidth: '180px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  paddingBottom: '4px',
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                YY
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {years.map(({ yy }) => (
                  <button
                    key={yy}
                    onClick={() => handleSelectYear(yy)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '5px 8px',
                      fontSize: '13px',
                      border: 'none',
                      borderRadius: 'var(--border-radius-md)',
                      cursor: 'pointer',
                      background:
                        selectedYY === yy ? 'var(--color-background-info)' : 'transparent',
                      color:
                        selectedYY === yy
                          ? 'var(--color-text-info)'
                          : 'var(--color-text-primary)',
                      textAlign: 'center',
                    }}
                  >
                    {yy}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                width: '0.5px',
                background: 'var(--color-border-tertiary)',
                margin: '0 4px',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  paddingBottom: '4px',
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                MM
              </div>
              {months.map((mm) => (
                <button
                  key={mm}
                  onClick={() => handleSelectMonth(mm)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '5px 8px',
                    fontSize: '13px',
                    border: 'none',
                    borderRadius: 'var(--border-radius-md)',
                    cursor: 'pointer',
                    background:
                      selectedMM === mm ? 'var(--color-background-info)' : 'transparent',
                    color:
                      selectedMM === mm
                        ? 'var(--color-text-info)'
                        : 'var(--color-text-primary)',
                    textAlign: 'center',
                  }}
                >
                  {mm}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const EquipmentHandInputPage = () => {
  const navigate = useNavigate()
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [lotSerial, setLotSerial] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [quantityRange, setQuantityRange] = useState<'from' | 'to'>('from')
  const itemNoInputRef = useRef<HTMLInputElement | null>(null)
  const isEnabled = parentWarehouse && parentItem && parentSerial

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>備品振分手入力</div>
          <div className='hand-body'>
            <div className={`hand-form ${isEnabled ? '' : 'hand-form-disabled'}`}>

              <div className='hand-row'>
                <label>FR倉庫</label>
                <select value={parentWarehouse} onChange={(e) => setParentWarehouse(e.target.value)}>
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>

              <div className='hand-row'>
                <label>TO倉庫</label>
                {/* <input value={parentItem} onChange={(e) => setParentItem(e.target.value)} /> */}
                 <select value={parentItem} onChange={(e) => setParentItem(e.target.value)}>
                  <option value=''></option>
                  <option value='羽田製品補充倉庫：W0041'>羽田製品倉庫：AA001</option>
                  <option value='羽田製品補充倉庫：W0042'>羽田製品倉庫：AA002</option>
                  <option value='羽田製品補充倉庫：W0043'>羽田製品倉庫：AA003</option>
                  <option value='羽田製品補充倉庫：W0044'>羽田製品倉庫：AA004</option>
      
                </select>
              </div>

              <div className='hand-row'>
                <label>保管場所</label>
                <input value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} />
              </div>
              <div className='hand-row hand-row-always'>
                <label>数量</label>
                <input value={quantity}  onChange={(e) => setQuantity(e.target.value)} />
              </div>

       <div className='hand-row hand-row-always'>
  <label>品目No.</label>
  <input ref={itemNoInputRef} value={moveStorage} onChange={(e) => setMoveStorage(e.target.value)} />
</div>

              <div className='hand-row hand-row-always'>
                <label>ロットシリアル</label>
                <input
                  value={lotSerial}
                  onChange={(e) => setLotSerial(e.target.value)}
                  placeholder=' '
                />
              </div>

              <div className='set-row'>
                <div className='set-radio-group bundle-group'>
                  <label className='set-radio'>
                    <input
                      type='radio'
                      name='quantityRange'
                      value='from'
                      checked={quantityRange === 'from'}
                      onChange={() => setQuantityRange('from')}
                    />
                    From
                  </label>
                  <label className='set-radio'>
                    <input
                      type='radio'
                      name='quantityRange-1'
                      value='to'
                      checked={quantityRange === 'to'}
                      onChange={() => setQuantityRange('to')}
                    />
                    To
                  </label>
                </div>
              </div>


              <div className='hand-row hand-row-always'>
                <label>有効日付(yymm)</label>
                <input placeholder=' ' type=''/>
              </div>
              {/* <div className='hand-row hand-row-always'>
                <label>有効日付(yymm)</label>
                <YymmDatePicker value={expiryDate} onChange={setExpiryDate} />
              </div> */}

            </div>

            <ActionFooter columns={4}>
              <button className='set-btn set-danger' style={{ visibility: 'hidden' }}>
                {'\u7834\u68C4'}
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => setShowReadConfirm(true)}
              >
                {'\u8AAD\u8FBC'}
              </button>
              <button className='set-btn set-success' style={{ visibility: 'hidden' }}>
                {'\u89E3\u9664'}
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
                  <div className='set-modal-body'>
                    {'\u5165\u529b\u5185\u5bb9\u3067\u8aad\u8fbc\u3092'}
                    <br />
                    {'\u5b8c\u4e86\u3057\u307e\u3059\u304b\uff1f'}
                  </div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowReadConfirm(false)}
                    >
                     YES
                    </button>
      <button
  className='set-modal-btn set-modal-no'
  onClick={() => {
    setShowReadConfirm(false)
    requestAnimationFrame(() => {
      itemNoInputRef.current?.focus()
    })
  }}
>
  NO
</button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>
                    {'\u624b\u5165\u529b\u30c0\u30a4\u30a2\u30ed\u30b0\u3092'}
                    <br />
                    {'\u9589\u3058\u307e\u3059\u304b\uff1f'}
                  </div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/equipment')
                      }}
                    >
                     YES
                    </button>
              <button
  className='set-modal-btn set-modal-no'
  onClick={() => {
    setShowBackConfirm(false)
    requestAnimationFrame(() => {
      itemNoInputRef.current?.focus()
    })
  }}
>
  NO
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

export { EquipmentHandInputPage }