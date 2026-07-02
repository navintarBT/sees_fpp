import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaPlay} from 'react-icons/fa'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number
  source_location: string
  item_no: string
  transfer_qty: string
  product_name: string
  dest_location: string
  lot_serial_no: string
  warehouse: string
}

const initialRows: Row[] = [
  {id: 1, source_location: 'WO-0001', item_no: '1000001', lot_serial_no: '001', transfer_qty: '10', product_name: 'ITE-IR11ZZ', warehouse: '千葉工場：F0200', dest_location: ''},
  {id: 2, source_location: 'WO-0001', item_no: '1000002', lot_serial_no: '002', transfer_qty: '20', product_name: 'ITE-IR12ZZ', warehouse: '千葉工場：F0201', dest_location: ''},
  {id: 3, source_location: 'WO-0002', item_no: '1000003', lot_serial_no: '002', transfer_qty: '30', product_name: 'ITE-IR12ZZ', warehouse: '千葉工場：F0203', dest_location: ''},
  {id: 4, source_location: 'WO-0003', item_no: '1000004', lot_serial_no: '003', transfer_qty: '40', product_name: 'ITE-IR13ZZ', warehouse: '千葉工場：F0204', dest_location: ''},
  {id: 5, source_location: 'WO-0004', item_no: '1000005', lot_serial_no: '004', transfer_qty: '50', product_name: 'ITE-IR14ZZ', warehouse: '千葉工場：F0205', dest_location: ''},
  {id: 6, source_location: 'WO-0005', item_no: '1000006', lot_serial_no: '005', transfer_qty: '60', product_name: 'ITE-IR15ZZ', warehouse: '千葉工場：F0206', dest_location: ''},
  {id: 7, source_location: 'WO-0006', item_no: '1000007', lot_serial_no: '006', transfer_qty: '70', product_name: 'ITE-IR16ZZ', warehouse: '千葉工場：F0207', dest_location: ''},
  {id: 8, source_location: 'WO-0007', item_no: '1000008', lot_serial_no: '007', transfer_qty: '80', product_name: 'ITE-IR17ZZ', warehouse: '千葉工場：F0208', dest_location: ''},
  {id: 9, source_location: 'WO-0008', item_no: '1000009', lot_serial_no: '008', transfer_qty: '90', product_name: 'ITE-IR18ZZ', warehouse: '千葉工場：F0209', dest_location: ''},
  {id: 10, source_location: 'WO-0009', item_no: '1000010', lot_serial_no: '009', transfer_qty: '100', product_name: 'ITE-IR19ZZ', warehouse: '千葉工場：F0200', dest_location: ''},
  {id: 11, source_location: 'WO-0010', item_no: '1000011', lot_serial_no: '010', transfer_qty: '110', product_name: 'ITE-IR20ZZ', warehouse: '千葉工場：F0201', dest_location: ''},
  {id: 12, source_location: 'WO-0011', item_no: '1000012', lot_serial_no: '011', transfer_qty: '120', product_name: 'ITE-IR21ZZ', warehouse: '千葉工場：F0203', dest_location: ''},
  {id: 13, source_location: 'WO-0012', item_no: '1000012', lot_serial_no: '012', transfer_qty: '130', product_name: 'ITE-IR22ZZ', warehouse: '千葉工場：F0204', dest_location: ''},
]

// 画面モード： source = 移動元登録, dest = 移動先登録
type ScreenMode = 'source' | 'dest'

const ShelfTransfer = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState({
    parentWarehouse: '',
    parentStorage: '',
    parentItemNo: '0193090',
    moveWarehouse: '千葉倉庫（WMS）：W002',
    source_location: '',
    internalLabel: '',
    shipmentQty: '',
    lot_serial_no: '',
    office: '',
    transfer_qty: '',
    janCode: '',
    dest_location: '',
  })

  // 画面モード（移動元 / 移動先）
  const [mode, setMode] = useState<ScreenMode>('source')

  // 確認・警告モーダルの表示状態
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [showSourceCompleteConfirm, setShowSourceCompleteConfirm] = useState(false)
  const [showSourceErrorWarning, setShowSourceErrorWarning] = useState(false)
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  // 戻る：2段階確認（Step1=中止確認 / Step2=データ保持確認）
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showBackKeepConfirm, setShowBackKeepConfirm] = useState(false)

  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const itemNoInputRef = useRef<HTMLInputElement | null>(null)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const sourceRowsRef = useRef<Row[]>(initialRows)

  const isAnyModalOpen =
    showDiscardConfirm ||
    showSourceCompleteConfirm ||
    showSourceErrorWarning ||
    showIncompleteWarning ||
    showCompleteConfirm ||
    showBackConfirm ||
    showBackKeepConfirm

  // 初回表示：テーブルは空のまま、品目No. 入力にフォーカスする
  useEffect(() => {
    itemNoInputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // テーブルを初期状態（空）に戻し、品目No. 入力へフォーカスを戻す
  const loadSourceRows = () => {
    setRows([])
    requestAnimationFrame(() => itemNoInputRef.current?.focus())
  }

  // 品目No. を入力して Enter：該当する移動元データをテーブルに追加する
  const handleItemNoEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (mode !== 'source') return

    const itemNo = form.internalLabel.trim()
    if (!itemNo) return

    const matches = sourceRowsRef.current.filter((row) => row.item_no === itemNo)
    if (matches.length === 0) return

    setRows((prev) => {
      const existingIds = new Set(prev.map((row) => row.id))
      const added = matches
        .filter((row) => !existingIds.has(row.id))
        .map((row) => ({...row, dest_location: ''}))
      return [...prev, ...added]
    })
    // 次の入力に備えて品目No. をクリア
    setForm((prev) => ({...prev, internalLabel: ''}))
  }

  const clearForm = () =>
    setForm({
      parentWarehouse: '',
      parentStorage: '',
      parentItemNo: '',
      moveWarehouse: '',
      source_location: '',
      internalLabel: '',
      shipmentQty: '',
      lot_serial_no: '',
      office: '',
      janCode: '',
      dest_location: '',
      transfer_qty: '',
    })

  // 行選択で表示される項目だけを空にする（保管場所などの選択は保持）
  const clearRowFields = () =>
    setForm((prev) => ({
      ...prev,
      internalLabel: '',
      shipmentQty: '',
      lot_serial_no: '',
      transfer_qty: '',
      dest_location: '',
      parentWarehouse: '',
    }))

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
      requestAnimationFrame(() => {
        el.scrollTop = 0
        el.scrollLeft = 0
      })
    })
  }

  // 一括：選択中の保管場所をすべての行の移動先に適用する
  const handleSearchsource_location = () => {
    const selectedLocation = form.parentStorage
    setRows((prevRows) => prevRows.map((row) => ({...row, dest_location: selectedLocation})))
  }

  const handleRowActivate = (rowKey: string | number) => {
    const selectedRow = rows.find((row) => row.id === Number(rowKey))
    if (!selectedRow) return
    setActiveRowId(selectedRow.id)
    setForm((prev) => ({
      ...prev,
      internalLabel: selectedRow.item_no,
      shipmentQty: selectedRow.product_name,
      lot_serial_no: selectedRow.lot_serial_no,
      transfer_qty: selectedRow.transfer_qty,
      dest_location: selectedRow.dest_location,
      parentWarehouse: selectedRow.warehouse,
    }))
  }

  // ① 破棄：入力をキャンセルし、メモリ上のデータを破棄する
  const handleDiscard = () => {
    if (isAnyModalOpen) return
    setShowDiscardConfirm(true)
  }

  const confirmDiscard = () => {
    // テーブルのデータ・フォーム入力をすべて破棄する
    setRows([])
    clearForm()
    setActiveRowId(null)
    resetTableScroll()
    setShowDiscardConfirm(false)
    requestAnimationFrame(() => itemNoInputRef.current?.focus())
  }

  // ② 移動元登録完了：エラーが無ければ移動先登録モードへ遷移
  const handleSourceComplete = () => {
    if (isAnyModalOpen) return
    // 数量などのデータにエラーが無いか確認
    const hasError = rows.length === 0 || rows.some((row) => {
      const qty = Number(row.transfer_qty)
      return !row.transfer_qty || Number.isNaN(qty) || qty <= 0
    })
    if (hasError) {
      setShowSourceErrorWarning(true)
      return
    }
    setShowSourceCompleteConfirm(true)
  }

  const confirmSourceComplete = () => {
    setShowSourceCompleteConfirm(false)
    setMode('dest')
    // 移動先登録は先頭行から開始（行未選択なので入力欄はクリア）
    setActiveRowId(null)
    clearRowFields()
    resetTableScroll()
  }

  // ④ 登録：選択中の行に移動先（保管場所）を確定し、次の行へ進む
  const handleRegister = () => {
    if (isAnyModalOpen) return
    // 行が未選択なら先頭行を選択
    if (activeRowId === null) {
      if (rows.length > 0) handleRowActivate(rows[0].id)
      return
    }

    const destLocation = form.parentStorage
    const currentIndex = rows.findIndex((row) => row.id === activeRowId)

    // 選択中の行に移動先を保存
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === activeRowId ? {...row, dest_location: destLocation} : row
      )
    )

    // 次の行へ進む
    const nextRow = rows[currentIndex + 1]
    if (nextRow) {
      handleRowActivate(nextRow.id)
    }
  }

  // ⑤ 完了：全データを検証し、問題なければ JDE へ送信して移動元登録に戻る
  const handleComplete = () => {
    if (isAnyModalOpen) return
    // 移動先が未設定の行が無いか確認
    const hasUnregistered = rows.length === 0 || rows.some((row) => !row.dest_location)
    if (hasUnregistered) {
      setShowIncompleteWarning(true)
      return
    }
    setShowCompleteConfirm(true)
  }

  const confirmComplete = () => {
    // ここで JDE への送信処理を行う（モックアップでは省略）
    setShowCompleteConfirm(false)
    // 移動元登録（開始画面）に戻り、新しい作業を開始
    setMode('source')
    setActiveRowId(null)
    clearForm()
    loadSourceRows()
    resetTableScroll()
  }

  // ③ 戻る
  // 移動先登録（dest）中の場合は、移動元登録（source）へ戻す
  // 移動元登録（source）中の場合は、2段階確認（中止 → データ保持）へ進む
  const handleBack = () => {
    if (isAnyModalOpen) return
    if (mode === 'dest') {
      setMode('source')
      setActiveRowId(null)
      clearRowFields()
      resetTableScroll()
      return
    }
    // Step1：棚移動登録を中止するか確認
    setShowBackConfirm(true)
  }

  // Step1 [はい]：中止 → Step2 へ進む
  const handleBackConfirmYes = () => {
    setShowBackConfirm(false)
    setShowBackKeepConfirm(true)
  }

  // Step2 [はい]：編集中のデータを保持（ロック）してメインメニューへ戻る
  const handleBackKeepData = () => {
    setShowBackKeepConfirm(false)
    // 編集中のデータを保持（他端末・JDE からは一時的にロック）
    navigate('/factory/factory')
  }

  // Step2 [いいえ]：入力データを破棄してメインメニューへ戻る
  const handleBackDiscardData = () => {
    setShowBackKeepConfirm(false)
    clearForm()
    loadSourceRows()
    setMode('source')
    setActiveRowId(null)
    navigate('/factory/factory')
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) return

      if (event.key === 'F1') {
        event.preventDefault()
        handleDiscard()
        return
      }
      if (event.key === 'F2') {
        event.preventDefault()
        if (mode === 'source') handleSourceComplete()
        else handleRegister()
        return
      }
      if (event.key === 'F3') {
        event.preventDefault()
        if (mode === 'dest') handleComplete()
        return
      }
      if (event.key === 'F4') {
        event.preventDefault()
        handleBack()
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnyModalOpen, mode, rows, activeRowId, form.parentStorage])

  // グレー表示（入力不可）の共通スタイル。disabled 要素のブラウザ既定の薄表示を
  // 打ち消し、入力・セレクト・ボタンの文字色を完全に揃える。
  const grayFieldStyle: React.CSSProperties = {
    textAlign: 'center',
    background: '#d9d9d9',
    color: '#666',
    WebkitTextFillColor: '#666',
    opacity: 1,
    pointerEvents: 'none',
    cursor: 'not-allowed',
  }

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head col-arrow-head-shelftransfer',
      cellClassName: 'col-arrow col-arrow-head-shelftransfer',
      header: '',
      render: (row) => (activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null),
    },
    {key: 'source_location', headClassName: 'col-woNumber', cellClassName: 'col-woNumber', header: '元保管場所', render: (row) => row.source_location},
    {key: 'item_no', headClassName: 'col-item_no', cellClassName: 'col-partNumber', header: '品目No', render: (row) => row.item_no},
    {key: 'lot_serial_no', headClassName: 'col-reqNumber', cellClassName: 'col-reqNumber', header: 'ロットシリアル', render: (row) => row.lot_serial_no},
    {key: 'transfer_qty', headClassName: 'col-storage', cellClassName: 'col-storage', header: '移動数', render: (row) => row.transfer_qty},
    {key: 'product_name', headClassName: 'col-lot-shelf', cellClassName: 'col-lot-shelf', header: '品名', render: (row) => row.product_name},
    {key: 'dest_location', headClassName: 'col-dest_location', cellClassName: 'col-dest_location', header: '先保管場所', render: (row) => row.dest_location || ''},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>
            棚移動登録{mode === 'source' ? '（移動元）' : '（移動先）'}
          </div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>品目No.</label>
                <input
                  ref={itemNoInputRef}
                  autoFocus
                  style={{textAlign: 'center'}}
                  value={form.internalLabel}
                  onChange={(e) => setForm({...form, internalLabel: e.target.value})}
                  onKeyDown={handleItemNoEnter}
                />
              </div>

              <div className='set-row'>
                <label>倉庫</label>
                <select
                  style={mode === 'dest' ? grayFieldStyle : {textAlign: 'center'}}
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                  disabled={mode === 'dest'}
                >
                  <option value=''></option>
                  <option value='千葉工場：F0200'>千葉工場：F0200</option>
                  <option value='千葉工場：F0201'>千葉工場：F0201</option>
                  <option value='千葉工場：F0203'>千葉工場：F0203</option>
                  <option value='千葉工場：F0204'>千葉工場：F0204</option>
                  <option value='千葉工場：F0205'>千葉工場：F0205</option>
                  <option value='千葉工場：F0206'>千葉工場：F0206</option>
                  <option value='千葉工場：F0207'>千葉工場：F0207</option>
                  <option value='千葉工場：F0208'>千葉工場：F0208</option>
                  <option value='千葉工場：F0209'>千葉工場：F0209</option>
                </select>
              </div>

              <div className='set-row set-row-wo'>
                <label>保管場所</label>
                <select
                  style={{textAlign: 'center'}}
                  value={form.parentStorage}
                  onChange={(e) => setForm({...form, parentStorage: e.target.value})}
                >
                  <option value=''></option>
                  <option value='W0040'>W0040</option>
                  <option value='W0041'>W0041</option>
                  <option value='W0042'>W0042</option>
                  <option value='W0043'>W0043</option>
                  <option value='W0044'>W0044</option>
                  <option value='W0045'>W0045</option>
                  <option value='W0046'>W0046</option>
                </select>
                <button
                  className='set-search-btn set-success'
                  onClick={handleSearchsource_location}
                  disabled={mode === 'source'}
                  style={mode === 'source' ? grayFieldStyle : undefined}
                >
                  一括
                </button>
              </div>

              <div className='set-row'>
                <label>品名</label>
                <input
                  readOnly
                  style={grayFieldStyle}
                  value={form.shipmentQty}
                />
              </div>
              <div className='set-row'>
                <label>ロットシリアル</label>
                <input
                  readOnly
                  style={grayFieldStyle}
                  value={form.lot_serial_no}
                />
              </div>
              <div className='set-row set-row-wo'>
                <label>移動数量</label>
                <input
                  readOnly={mode === 'dest'}
                  style={mode === 'dest' ? grayFieldStyle : {textAlign: 'center'}}
                  value={form.transfer_qty}
                  onChange={(e) => setForm({...form, transfer_qty: e.target.value})}
                />
                <button className='set-search-btn set-primary' style={grayFieldStyle} disabled>
                  EA
                </button>
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              gridClassName='ShelfTransfer-table'
              onRowActivate={handleRowActivate}
            />

            <ActionFooter columns={4}>
              <button className='set-btn set-danger' onClick={handleDiscard}>
                破棄
              </button>

              {mode === 'source' ? (
                <button className='set-btn set-warning' onClick={handleSourceComplete}>
                  移動元登録完了
                </button>
              ) : (
           
                   <button className='set-btn set-warning' onClick={handleComplete}>
                  完了
                </button>
              )}

              {mode === 'source' ? (
                <div style={{width: '100%'}}></div>
              ) : (
                  <button
                  className='set-btn set-primary'
                  onClick={handleRegister}
                  style={{fontSize: '35px'}}
                >
                  登録
                </button>
              )}

              <button className='set-btn set-success' onClick={handleBack}>
                戻る
              </button>
            </ActionFooter>
          </div>

          {/* ① 破棄の確認 */}
          {showDiscardConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'
                style={{ whiteSpace: "pre-line" }}
                >
                   {"読込データを破棄します。\n 宜しいですか？"}
                  </div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmDiscard}>
                    OK
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowDiscardConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ② 移動元登録完了の確認 */}
          {showSourceCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'移動元の登録を完了し、\n移動先の登録に進みますか？'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmSourceComplete}>
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowSourceCompleteConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ② 移動元データのエラー警告 */}
          {showSourceErrorWarning && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>{'移動数量に誤りがあります。\nデータを確認してください。'}</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowSourceErrorWarning(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ⑤ 完了：移動先未設定の警告 */}
          {showIncompleteWarning && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>{'移動先が未設定の項目があります。\nすべての移動先を登録してください。'}</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowIncompleteWarning(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ⑤ 完了の確認 */}
          {showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'作業結果を JDE に送信します。\nよろしいですか？'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={confirmComplete}>
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowCompleteConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ③ 戻る Step1：棚移動登録を中止するか確認 */}
          {showBackConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">{"\u78ba\u8a8d"}</div>
                <div className="set-modal-body"
                style={{ whiteSpace: "pre-line" }}
                >
                  {
                    "メニューに戻ります。\n 読込データを破棄しますか？"
                  }
                </div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => {
                      setShowBackConfirm(false);
                      navigate("/factory/factory");
                    }}
                  >
                  YES
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() =>{ setShowBackConfirm(false);
                    navigate("/factory/factory");
                    }}
                  >
                    NO
                  </button>   
                   <button
  className="set-modal-btn set-m"
  onClick={() => {
    setShowBackConfirm(false);
    
  }}
>
  取消
</button>
                </div>
              </div>
            </div>
          )}

          {/* ③ 戻る Step2：編集中のデータを保持するか確認 */}
          {showBackKeepConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>編集中のデータは保持しますか？</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={handleBackKeepData}>
                    はい
                  </button>
                  <button className='set-modal-btn set-modal-no' onClick={handleBackDiscardData}>
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

export {ShelfTransfer}
