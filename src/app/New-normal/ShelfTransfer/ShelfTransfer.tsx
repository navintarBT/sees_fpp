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

// 品目マスタ：品目No. をキーに、庫内ラベル読取（品目No. 入力 → Enter）で展開する値
type ItemMaster = {
  warehouse: string // 倉庫
  storage: string // 保管場所（＝明細の元保管場所）
  product_name: string // 品名
  lot_serial_no: string // ロットシリアル
  transfer_qty: string // 移動数量
}

const ITEM_MASTER: Record<string, ItemMaster> = {
  '1197101': {warehouse: '千葉工場：F0200', storage: 'W0001', product_name: 'ITE-IRIZZ', lot_serial_no: '001', transfer_qty: '2'},
  '1197104': {warehouse: '千葉工場：F0200', storage: 'W0001', product_name: 'ITE-IRIY0', lot_serial_no: '001', transfer_qty: '4'},
  '1197103': {warehouse: '千葉工場：F0200', storage: 'W0001', product_name: 'ITE-IRIY1', lot_serial_no: '001', transfer_qty: '1'},
}

// 画面モード： source = 移動元登録, dest = 移動先登録
type ScreenMode = 'source' | 'dest'

const DEFAULT_FORM = {
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
}

// เก็บ snapshot ของหน้าจอเพื่อให้กด NO / รีเฟรชแล้วข้อมูลยังอยู่เหมือนเดิม
const BACK_STATE_KEY = 'ShelfTransfer:backState'

type PersistedState = {
  form: typeof DEFAULT_FORM
  rows: Row[]
  mode: ScreenMode
  activeRowId: number | null
}

const loadPersistedState = (): PersistedState | null => {
  try {
    const raw = sessionStorage.getItem(BACK_STATE_KEY)
    return raw ? (JSON.parse(raw) as PersistedState) : null
  } catch {
    return null
  }
}

const clearPersistedState = () => {
  try {
    sessionStorage.removeItem(BACK_STATE_KEY)
  } catch {
    /* ignore */
  }
}

const ShelfTransfer = () => {
  const navigate = useNavigate()

  // โหลด snapshot (ถ้ามี) แค่ครั้งเดียวตอน mount
  const [persistedState] = useState(loadPersistedState)

  const [rows, setRows] = useState<Row[]>(persistedState?.rows ?? [])
  const [form, setForm] = useState(persistedState?.form ?? {...DEFAULT_FORM})

  // 画面モード（移動元 / 移動先）
  const [mode, setMode] = useState<ScreenMode>(persistedState?.mode ?? 'source')

  // 確認・警告モーダルの表示状態
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [showSourceCompleteConfirm, setShowSourceCompleteConfirm] = useState(false)
  // 登録完了：品目No. 未入力エラー／移動元 完了メッセージ
  const [showItemNoRequired, setShowItemNoRequired] = useState(false)
  const [showSourceCompleteDone, setShowSourceCompleteDone] = useState(false)
  // 移動先：登録（選択行なし）エラー／先保管場所 未設定エラー／完了確認・完了メッセージ
  const [showNoRowSelected, setShowNoRowSelected] = useState(false)
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showCompleteDone, setShowCompleteDone] = useState(false)
  // 戻る：2段階確認（Step1=中止確認 / Step2=データ保持確認）
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showBackKeepConfirm, setShowBackKeepConfirm] = useState(false)
  // 品目No. 重複エラー（すでに明細に存在する品目No. を再入力した場合）
  const [showDuplicateItemNo, setShowDuplicateItemNo] = useState(false)

  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const itemNoInputRef = useRef<HTMLInputElement | null>(null)
  const [activeRowId, setActiveRowId] = useState<number | null>(
    persistedState?.activeRowId ?? null,
  )
  const isAnyModalOpen =
    showDiscardConfirm ||
    showSourceCompleteConfirm ||
    showItemNoRequired ||
    showSourceCompleteDone ||
    showNoRowSelected ||
    showIncompleteWarning ||
    showCompleteConfirm ||
    showCompleteDone ||
    showBackConfirm ||
    showBackKeepConfirm ||
    showDuplicateItemNo

  // 初回表示：テーブルは空のまま、品目No. 入力にフォーカスする
  useEffect(() => {
    itemNoInputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // เก็บ snapshot ต่อเนื่องทุกครั้งที่ข้อมูลเปลี่ยน เพื่อให้รีเฟรช/กลับมาแล้วข้อมูลยังอยู่
  useEffect(() => {
    try {
      sessionStorage.setItem(
        BACK_STATE_KEY,
        JSON.stringify({form, rows, mode, activeRowId}),
      )
    } catch {
      /* ignore */
    }
  }, [form, rows, mode, activeRowId])

  // テーブルを初期状態（空）に戻し、品目No. 入力へフォーカスを戻す
  const loadSourceRows = () => {
    setRows([])
    requestAnimationFrame(() => itemNoInputRef.current?.focus())
  }

  // 品目No. を入力して Enter（庫内ラベル読取）：移動元・移動先の両方で使用。
  // 品目マスタから該当データを展開し、明細に１行追加しつつ入力欄へ反映する。
  const handleItemNoEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()

    const itemNo = form.internalLabel.trim()
    if (!itemNo) return

    const master = ITEM_MASTER[itemNo]
    if (!master) return // マスタに存在しない品目No. は無視

    // すでに明細に存在する品目No. は追加せず、編集中である旨を通知する
    if (rows.some((row) => row.item_no === itemNo)) {
      setShowDuplicateItemNo(true)
      return
    }

    // 明細部に１行追加（先保管場所は移動先登録で設定するため空）
    const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
    const newRow: Row = {
      id: nextId,
      source_location: master.storage,
      item_no: itemNo,
      lot_serial_no: master.lot_serial_no,
      transfer_qty: master.transfer_qty,
      product_name: master.product_name,
      warehouse: master.warehouse,
      dest_location: '',
    }
    setRows((prev) => [...prev, newRow])

    // 入力欄へ反映（品目No. は表示したまま入力待ち：次のラベル読取で上書き）
    // 移動先：保管場所はブランク（入力待ち）とし、追加行を選択状態にする。
    // 移動元：保管場所はマスタの値を表示（編集不可）。
    setForm((prev) => ({
      ...prev,
      internalLabel: itemNo,
      parentWarehouse: master.warehouse,
      parentStorage: mode === 'dest' ? '' : master.storage,
      shipmentQty: master.product_name,
      lot_serial_no: master.lot_serial_no,
      transfer_qty: master.transfer_qty,
    }))
    if (mode === 'dest') setActiveRowId(nextId)

    // 次のラベル読取に備え、品目No. にフォーカスだけ戻す（全選択はしない：単純に入力待ち）
    requestAnimationFrame(() => {
      itemNoInputRef.current?.focus()
    })
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

  // 一括：選択中の保管場所をすべての行の先保管場所に適用し、選択状態を解除する
  const handleSearchsource_location = () => {
    const selectedLocation = form.parentStorage
    setRows((prevRows) => prevRows.map((row) => ({...row, dest_location: selectedLocation})))
    setActiveRowId(null)
  }

  const handleRowActivate = (rowKey: string | number) => {
    const selectedRow = rows.find((row) => row.id === Number(rowKey))
    if (!selectedRow) return
    // すでに選択中の行を再クリックしたら選択解除する
    // ※ヘッダ部の表示データは残したまま、行の選択（矢印）だけを解除する
    if (activeRowId === selectedRow.id) {
      setActiveRowId(null)
      return
    }
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
    // ※ 画面モード（移動元／移動先）は変更しない。
    //   破棄後は「現在のモードのまま」初期表示に戻す。
    setRows([])
    clearForm()
    setActiveRowId(null)
    resetTableScroll()
    setShowDiscardConfirm(false)
    requestAnimationFrame(() => itemNoInputRef.current?.focus())
  }

  // ② 移動元登録完了
  // 品目No. 未入力ならエラー、入力済みなら完了確認へ
  const handleSourceComplete = () => {
    if (isAnyModalOpen) return
    if (!form.internalLabel.trim()) {
      setShowItemNoRequired(true)
      return
    }
    setShowSourceCompleteConfirm(true)
  }

  // 「はい」：完了メッセージを表示（この時点ではまだ画面遷移しない）
  const confirmSourceComplete = () => {
    setShowSourceCompleteConfirm(false)
    setShowSourceCompleteDone(true)
  }

  // 完了メッセージ「OK」：移動先登録モードへ遷移
  // 移動先は庫内ラベル読取で明細を作り直すため、明細・入力欄を初期化する。
  const finishSourceComplete = () => {
    setShowSourceCompleteDone(false)
    setMode('dest')
    setActiveRowId(null)
    setRows([])
    clearForm()
    resetTableScroll()
    requestAnimationFrame(() => itemNoInputRef.current?.focus())
  }

  // ④ 登録：選択中の行の先保管場所に保管場所を確定し、品目No. の入力待ちに戻す
  const handleRegister = () => {
    if (isAnyModalOpen) return
    // 行が未選択なら「選択行がありません。」を表示
    if (activeRowId === null) {
      setShowNoRowSelected(true)
      return
    }

    const destLocation = form.parentStorage

    // 選択中の行に先保管場所を保存
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === activeRowId ? {...row, dest_location: destLocation} : row
      )
    )

    // 次のラベル読取に備え、品目No. にフォーカスだけ戻す（全選択はしない：単純に入力待ち）
    requestAnimationFrame(() => {
      itemNoInputRef.current?.focus()
    })
  }

  // ⑤ 完了：品目No. 未入力／先保管場所 未設定をチェックし、問題なければ完了確認へ
  const handleComplete = () => {
    if (isAnyModalOpen) return
    if (!form.internalLabel.trim()) {
      setShowItemNoRequired(true)
      return
    }
    // 先保管場所（移動先）が未設定の行が残っていないか確認
    if (rows.some((row) => !row.dest_location)) {
      setShowIncompleteWarning(true)
      return
    }
    setShowCompleteConfirm(true)
  }

  // 「はい」：完了メッセージを表示（この時点ではまだ画面遷移しない）
  const confirmComplete = () => {
    setShowCompleteConfirm(false)
    setShowCompleteDone(true)
  }

  // 完了メッセージ「OK」：JDE へ送信し、移動元登録（開始画面）に戻る
  const finishComplete = () => {
    // ここで JDE への送信処理を行う（モックアップでは省略）
    setShowCompleteDone(false)
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
    clearPersistedState()
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

  // 画面初期表示：データ未読込（明細が空）の状態。
  // このとき 倉庫／保管場所／移動数量／一括ボタン はブランク＆編集不可にする。
  const isInitialDisplay = rows.length === 0

  // 明細部：初期表示では空行を１行だけ表示させておく
  const EMPTY_ROW: Row = {
    id: 0,
    source_location: '',
    item_no: '',
    transfer_qty: '',
    product_name: '',
    dest_location: '',
    lot_serial_no: '',
    warehouse: '',
  }
  const displayRows = isInitialDisplay ? [EMPTY_ROW] : rows

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
                  style={isInitialDisplay || mode === 'dest' ? grayFieldStyle : {textAlign: 'center'}}
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                  disabled={isInitialDisplay || mode === 'dest'}
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
                  style={isInitialDisplay ? grayFieldStyle : {textAlign: 'center'}}
                  value={form.parentStorage}
                  onChange={(e) => setForm({...form, parentStorage: e.target.value})}
                  disabled={isInitialDisplay}
                >
                  <option value=''></option>
                  <option value='W0001'>W0001</option>
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
                  disabled={isInitialDisplay || mode === 'source'}
                  style={isInitialDisplay || mode === 'source' ? grayFieldStyle : undefined}
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
                  readOnly={isInitialDisplay || mode === 'dest'}
                  style={isInitialDisplay || mode === 'dest' ? grayFieldStyle : {textAlign: 'center'}}
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
              rows={displayRows}
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
                <div className='set-modal-body'>{'移動元の登録を完了しますか？'}</div>
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

          {/* ② 移動元登録完了：品目No. 未入力エラー */}
          {showItemNoRequired && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'品目No.が入力されていません。'}</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowItemNoRequired(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 品目No. 重複：すでに明細にある品目No. を再入力した場合 */}
          {showDuplicateItemNo && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'入力した品目Noは編集中です。'}</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowDuplicateItemNo(false)
                      requestAnimationFrame(() => itemNoInputRef.current?.focus())
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ② 移動元登録完了：完了メッセージ（OK で移動先登録へ） */}
          {showSourceCompleteDone && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'移動元の登録を完了しました。'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={finishSourceComplete}>
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ④ 登録：選択行なしエラー */}
          {showNoRowSelected && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'選択行がありません。'}</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowNoRowSelected(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ⑤ 完了：先保管場所 未設定の警告 */}
          {showIncompleteWarning && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
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

          {/* ⑤ 移動先登録完了の確認 */}
          {showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'移動先の登録を完了しますか？'}</div>
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

          {/* ⑤ 移動先登録完了：完了メッセージ（OK で移動元登録へ） */}
          {showCompleteDone && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'移動先の登録を完了しました。'}</div>
                <div className='set-modal-actions'>
                  <button className='set-modal-btn set-modal-yes' onClick={finishComplete}>
                    OK
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
                      // YES = ทิ้งข้อมูล: ล้าง snapshot แล้วกลับเมนู
                      clearPersistedState();
                      navigate("/factory/factory");
                    }}
                  >
                  YES
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() => {
                      setShowBackConfirm(false);
                      // NO = เก็บข้อมูลไว้ (snapshot ถูกบันทึกต่อเนื่องอยู่แล้ว) กลับมาข้อมูลยังอยู่
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
