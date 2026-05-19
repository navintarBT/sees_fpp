import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { ActionFooter } from "../../components/ActionFooter/ActionFooter";
import {
  TableSection,
  type TableColumn as TFTableColumn,
} from "../../components/TableSection/TableSection";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType = "IF" | "IE"; // IF = 備品振分, IE = 販売セット

type Row = {
  id: number;
  error: string;
  fromToEnqui: string;
  item: string;
  lot: string;
  quantity: number;
  warehouse: string;
  storage: string;
  productName: string;
};

type FormState = {
  parentWarehouse: string;
  parentItemNo: string; // 理由
  moveWarehouse: string;
  moveStorage: string;
  qty: string;
  janCode: string;
};

type GS1ParsedData = {
  janCode?: string;   // AI 01
  lotNo?: string;     // AI 10
  serialNo?: string;  // AI 21
  expiryDate?: string; // AI 17
};

// GS1-128 FNC1 separator (ASCII GS = 0x1D)
const FNC1 = String.fromCharCode(0x1d);

// ─── Error message builder ────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  "HT001-E": "{0}が存在しません。",
  "HT002-E": "{0}が不正です。",
};

const buildErrorMessage = (code: string, field: string): string => {
  const template = ERROR_MESSAGES[code] ?? "{0}でエラーが発生しました。";
  return `[${code}] ${template.replace("{0}", field)}`;
};

// ─── GS1-128 Utilities ────────────────────────────────────────────────────────

/**
 * Parse a GS1-128 barcode string into its Application Identifier components.
 * Supports: AI 01 (GTIN/JAN), AI 10 (Lot), AI 17 (Expiry), AI 21 (Serial).
 */
const parseGS1128 = (barcode: string): GS1ParsedData | null => {
  // Strip symbology identifier if present (e.g. ]C1, ]c1)
  let data = barcode.replace(/^\]([Cc]1|I1)/, "");

  if (!data) return null;

  const result: GS1ParsedData = {};
  let pos = 0;

  while (pos < data.length) {
    // Try 4-digit AI first, then 3-digit, then 2-digit
    const ai2 = data.substring(pos, pos + 2);
    const ai3 = data.substring(pos, pos + 3);

    // ── AI 01: GTIN-14 (fixed 14 digits) ──────────────────────────────────
    if (ai2 === "01") {
      pos += 2;
      const value = data.substring(pos, pos + 14);
      if (value.length !== 14 || !/^\d{14}$/.test(value)) return null;
      result.janCode = value;
      pos += 14;
      continue;
    }

    // ── AI 17: Expiry Date YYMMDD (fixed 6 digits) ────────────────────────
    if (ai2 === "17") {
      pos += 2;
      const value = data.substring(pos, pos + 6);
      if (!/^\d{6}$/.test(value)) return null;
      result.expiryDate = value;
      pos += 6;
      continue;
    }

    // ── AI 10: Lot Number (variable up to 20, terminated by FNC1) ─────────
    if (ai2 === "10") {
      pos += 2;
      const fnc1Pos = data.indexOf(FNC1, pos);
      if (fnc1Pos === -1) {
        result.lotNo = data.substring(pos);
        pos = data.length;
      } else {
        result.lotNo = data.substring(pos, fnc1Pos);
        pos = fnc1Pos + 1;
      }
      continue;
    }

    // ── AI 21: Serial Number (variable up to 20, terminated by FNC1) ──────
    if (ai2 === "21") {
      pos += 2;
      const fnc1Pos = data.indexOf(FNC1, pos);
      if (fnc1Pos === -1) {
        result.serialNo = data.substring(pos);
        pos = data.length;
      } else {
        result.serialNo = data.substring(pos, fnc1Pos);
        pos = fnc1Pos + 1;
      }
      continue;
    }

    // Unknown AI — stop parsing (avoid infinite loop)
    break;
  }

  // At minimum, janCode must be present for a valid GS1-128 scan
  if (!result.janCode) return null;
  return result;
};

/**
 * Validate EAN/GTIN check digit (mod-10 algorithm).
 * Accepts 13-digit EAN-13 or 14-digit GTIN-14.
 */
const validateJanCheckDigit = (janCode: string): boolean => {
  // Normalise to 13-digit EAN (strip leading indicator digit for GTIN-14)
  const code = janCode.length === 14 ? janCode.substring(1) : janCode;
  if (code.length !== 13 || !/^\d{13}$/.test(code)) return false;

  const digits = code.split("").map(Number);
  const checkDigit = digits[12];

  // Sum with alternating weights 1 and 3 over first 12 digits
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const calculated = (10 - (sum % 10)) % 10;
  return calculated === checkDigit;
};

// ─── Mock Work-Table API ───────────────────────────────────────────────────────
// Replace these stubs with real API calls in production.

type WorkTableResult = {
  rows: Row[];
  latestWarehouse: string;
} | null;

const fetchWorkTable = async (_docType: DocType): Promise<WorkTableResult> => {
  // TODO: replace with real API call
  // e.g. GET /api/work-table?docType=IF
  return null; // null means no pending data
};

// ─── Component ────────────────────────────────────────────────────────────────

const Equipment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Mode ──────────────────────────────────────────────────────────────────
  const [docType, setDocType] = useState<DocType>("IF");

  // ── Rows & edit state ─────────────────────────────────────────────────────
  const [rows, setRows] = useState<Row[]>([]);
  const [isDetailEditable, setIsDetailEditable] = useState(false);

  // ── Form ──────────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    parentWarehouse: "羽田製品倉庫：W0040",
    parentItemNo: "",
    moveWarehouse: "羽田製品倉庫：W0043",
    moveStorage: "",
    qty: "1",
    janCode: "",
  });

  // ── Modal visibility ──────────────────────────────────────────────────────
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Table / selection state ────────────────────────────────────────────────
  const [quantityRange, setQuantityRange] = useState<"from" | "to">("from");
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const activeRow = rows.find((r) => r.id === activeRowId) ?? null;

  // ── Refs ──────────────────────────────────────────────────────────────────
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const pressedKeysRef = useRef<{ f1: boolean; f8: boolean }>({
    f1: false,
    f8: false,
  });

  // Tab-order refs: Warehouse → Storage → Qty → FromTo → JAN Code → Reason → Grid
  const warehouseRef  = useRef<HTMLSelectElement | null>(null);
  const storageRef    = useRef<HTMLInputElement | null>(null);
  const qtyRef        = useRef<HTMLInputElement | null>(null);
  const fromToFromRef = useRef<HTMLInputElement | null>(null); // radio "From"
  const janCodeRef    = useRef<HTMLInputElement | null>(null);
  const reasonRef     = useRef<HTMLInputElement | null>(null);
  const gridRef       = useRef<HTMLDivElement | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const isAnyModalOpen =
    showHandInputConfirm ||
    showDeleteConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showBackConfirm ||
    !!errorMessage;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const closeAllModals = () => {
    setShowHandInputConfirm(false);
    setShowDeleteConfirm(false);
    setShowNoSelectionConfirm(false);
    setShowClearConfirm(false);
    setShowCompleteConfirm(false);
    setShowBackConfirm(false);
    setErrorMessage(null);
  };

  const showErrorModal = (code: string, field: string) => {
    setErrorMessage(buildErrorMessage(code, field));
  };

  const clearRows = () => setRows([]);
  const clearForm = () =>
    setForm({
      parentWarehouse: "",
      parentItemNo: "",
      moveWarehouse: "",
      moveStorage: "",
      qty: "",
      janCode: "",
    });

  const resetTableScroll = () => {
    const el = tableScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });
  };

  const clearFormAndRows = () => {
    clearForm();
    clearRows();
    resetTableScroll();
  };

  // ── [1] Mode Check & Initial Load ─────────────────────────────────────────
  useEffect(() => {
    // ── 1a. Resolve docType from navigation state or query param ────────────
    const stateMode = (location.state as Record<string, unknown> | null)?.mode;
    const queryMode = new URLSearchParams(location.search).get("mode");
    const resolvedMode = (stateMode ?? queryMode ?? "IF") as string;
    const resolvedDocType: DocType =
      resolvedMode.toUpperCase() === "IE" ? "IE" : "IF";
    setDocType(resolvedDocType);

    // ── 1b. Check Work Table for pending data ───────────────────────────────
    (async () => {
      const workData = await fetchWorkTable(resolvedDocType);

      if (workData && workData.rows.length > 0) {
        // Restore pending rows and select the last-used warehouse
        setRows(workData.rows);
        setIsDetailEditable(true);
        if (workData.latestWarehouse) {
          setForm((prev) => ({
            ...prev,
            parentWarehouse: workData.latestWarehouse,
          }));
        }
      } else {
        // No pending data → detail rows are non-editable
        setIsDetailEditable(false);
      }

      // ── 1c. Focus on Warehouse when screen opens ─────────────────────────
      warehouseRef.current?.focus();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // ── [2] Tab-Index sequential focus management ──────────────────────────────
  //
  // Order: Warehouse(1) → Storage(2) → Qty(3) → FromTo(4) → JAN(5) → Reason(6) → Grid(7)
  //
  // We rely on tabIndex props on each element (defined inline in JSX below).
  // Keyboard trap is handled natively by the browser following tabIndex order.

  // ── [3] Keyboard shortcuts ────────────────────────────────────────────────
  const handleReleaseClick = useCallback(
    (options?: { forceRelease?: boolean; forceHandInput?: boolean }) => {
      if (isAnyModalOpen) return;
      if (options?.forceHandInput) {
        closeAllModals();
        setShowHandInputConfirm(true);
      }
    },
    [isAnyModalOpen]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) return;

      if (event.key === "F1") pressedKeysRef.current.f1 = true;
      if (event.key === "F8") pressedKeysRef.current.f8 = true;

      if (pressedKeysRef.current.f1 && pressedKeysRef.current.f8) {
        event.preventDefault();
        handleReleaseClick({ forceHandInput: true });
        return;
      }

      if (event.key === "F1") { event.preventDefault(); closeAllModals(); setShowClearConfirm(true); return; }
      if (event.key === "F2") { event.preventDefault(); closeAllModals(); setShowCompleteConfirm(true); return; }
      if (event.key === "F3") { event.preventDefault(); handleReleaseClick({ forceRelease: true }); return; }
      if (event.key === "F4") { event.preventDefault(); closeAllModals(); setShowBackConfirm(true); return; }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "F1") pressedKeysRef.current.f1 = false;
      if (event.key === "F8") pressedKeysRef.current.f8 = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [activeRow, isAnyModalOpen, handleReleaseClick]);

  // ── [4] GS1-128 Barcode Scan Handler ─────────────────────────────────────

  /**
   * handleBarcodeScan
   *
   * Parses a GS1-128 barcode string and:
   *  - Validates JAN check digit          → HT002-E on failure
   *  - Combines Lot + Serial with a space → HT001-E if both absent
   *    (exception: docType IE + fromToEnqui "T" allows empty Lot/Serial)
   *  - Enforces Lot/Serial combined length ≤ 30
   *  - Updates form state with parsed values
   */
  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      // ── Step 1: Parse GS1-128 ──────────────────────────────────────────
      const parsed = parseGS1128(barcode.trim());

      if (!parsed || !parsed.janCode) {
        // Could not extract a GTIN → barcode is malformed
        showErrorModal("HT002-E", "JANコード");
        return;
      }

      const { janCode, lotNo, serialNo, expiryDate } = parsed;

      // ── Step 2: JAN check-digit validation ────────────────────────────
      if (!validateJanCheckDigit(janCode)) {
        showErrorModal("HT002-E", "JANコード");
        return;
      }

      // ── Step 3: Lot / Serial combination logic ────────────────────────
      let lotSerial = "";
      if (lotNo && serialNo) {
        lotSerial = `${lotNo} ${serialNo}`;
      } else if (lotNo) {
        lotSerial = lotNo;
      } else if (serialNo) {
        lotSerial = serialNo;
      }

      // ── Step 4: Combined length check (max 30 chars) ──────────────────
      if (lotSerial.length > 30) {
        showErrorModal("HT002-E", "ロット/シリアル");
        return;
      }

      // ── Step 5: Required check ────────────────────────────────────────
      // Lot/Serial must be present UNLESS: Mode IE AND the current side is "To"
      const isIEToSide = docType === "IE" && quantityRange === "to";
      if (!lotSerial && !isIEToSide) {
        showErrorModal("HT001-E", "ロット/シリアル");
        return;
      }

      // ── Step 6: Apply parsed values to form ───────────────────────────
      setForm((prev) => ({
        ...prev,
        janCode,
        // Persist expiryDate if your form model ever needs it:
        // expiryDate: expiryDate ?? prev.expiryDate,
      }));

      // If you maintain lot/serial as a standalone field, set it here:
      // setLotSerial(lotSerial);

      console.debug("[GS1-128]", { janCode, lotNo, serialNo, expiryDate, lotSerial });
    },
    [docType, quantityRange]
  );

  // ── Table columns ─────────────────────────────────────────────────────────
  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: "arrow",
      headClassName: "col-arrow-head",
      cellClassName: "col-arrow",
      header: "",
      render: (row) =>
        activeRowId === row.id ? <FaPlay className="col-row-arrow" /> : null,
    },
    { key: "error",       headClassName: "col-error",       cellClassName: "col-error",       header: "",             render: (row) => row.error },
    { key: "fromToEnqui", headClassName: "col-fromToEnqui", cellClassName: "col-fromToEnqui", header: "From/To",      render: (row) => row.fromToEnqui },
    { key: "item",        headClassName: "col-item",        cellClassName: "col-item",        header: "品目No.",       render: (row) => row.item },
    { key: "lot",         headClassName: "col-lot",         cellClassName: "col-lot",         header: "ロットシリアル", render: (row) => row.lot },
    { key: "Quantity",    headClassName: "col-quantity",    cellClassName: "col-quantity",    header: "数量",           render: (row) => row.quantity },
    { key: "Warehouse",   headClassName: "col-warehouse",   cellClassName: "col-warehouse",   header: "倉庫",           render: (row) => row.warehouse },
    { key: "storage",     headClassName: "col-storage",     cellClassName: "col-storage",     header: "保管場所",       render: (row) => row.storage },
    { key: "productName", headClassName: "col-productName", cellClassName: "col-productName", header: "品名",           render: (row) => row.productName },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mockup-page">
      <div className="mockup-stage mockup-stage-dark">
        <div className="mockup-frame">
          <div className="set-header">
            備品振分登録
            {/* Show current docType for debugging — remove in production */}
            <span style={{ fontSize: "0.75rem", marginLeft: 8, opacity: 0.6 }}>
              [{docType}]
            </span>
          </div>

          <div className="set-body">
            <div className="set-form">

              {/* FR倉庫 — tabIndex 1, auto-focused on mount */}
              <div className="set-row">
                <label htmlFor="parentWarehouse">FR倉庫</label>
                <select
                  id="parentWarehouse"
                  ref={warehouseRef}
                  tabIndex={1}
                  value={form.parentWarehouse}
                  onChange={(e) =>
                    setForm({ ...form, parentWarehouse: e.target.value })
                  }
                >
                  <option value=""></option>
                  <option value="羽田製品倉庫：W0040">羽田製品倉庫：W0040</option>
                  <option value="羽田製品倉庫：W0041">羽田製品倉庫：W0041</option>
                  <option value="羽田製品倉庫：W0042">羽田製品倉庫：W0042</option>
                </select>
              </div>

              {/* TO倉庫 */}
              <div className="set-row">
                <label htmlFor="moveWarehouse">TO倉庫</label>
                <select
                  id="moveWarehouse"
                  tabIndex={2}
                  value={form.moveWarehouse}
                  onChange={(e) =>
                    setForm({ ...form, moveWarehouse: e.target.value })
                  }
                >
                  <option value=""></option>
                  <option value="羽田製品倉庫：W0043">羽田製品倉庫：W0043</option>
                  <option value="羽田製品倉庫：W0044">羽田製品倉庫：W0044</option>
                  <option value="羽田製品倉庫：W0045">羽田製品倉庫：W0045</option>
                  <option value="羽田製品倉庫：W0046">羽田製品倉庫：W0046</option>
                </select>
              </div>

              {/* 保管場所 (tabIndex 2) & 数量 (tabIndex 3) */}
              <div className="set-row set-row-inline">
                <label htmlFor="moveStorage">保管場所</label>
                <input
                  id="moveStorage"
                  ref={storageRef}
                  tabIndex={2}
                  value={form.moveStorage}
                  onChange={(e) => setForm({ ...form, moveStorage: e.target.value })}
                  className="set-small"
                />
                <span className="set-inline-label">数量</span>
                <input
                  ref={qtyRef}
                  tabIndex={3}
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value })}
                />
              </div>

              {/* From / To radios (tabIndex 4) & JANコード (tabIndex 5) */}
              <div className="set-row">
                <div className="set-radio-group">
                  <label className="set-radio">
                    <input
                      ref={fromToFromRef}
                      type="radio"
                      name="quantityRange"
                      value="from"
                      tabIndex={4}
                      checked={quantityRange === "from"}
                      onChange={() => setQuantityRange("from")}
                    />
                    From
                  </label>
                  <label className="set-radio">
                    <input
                      type="radio"
                      name="quantityRange"
                      value="to"
                      tabIndex={4}
                      checked={quantityRange === "to"}
                      onChange={() => setQuantityRange("to")}
                    />
                    To
                  </label>
                </div>

                <div className="set-row set-row-bundle">
                  <label htmlFor="janCode">JANコード</label>
                  <input
                    id="janCode"
                    ref={janCodeRef}
                    tabIndex={5}
                    value={form.janCode}
                    onChange={(e) => setForm({ ...form, janCode: e.target.value })}
                    // Trigger scan handler on Enter (simulates barcode reader)
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleBarcodeScan(form.janCode);
                      }
                    }}
                  />
                </div>
              </div>

              {/* 理由 (tabIndex 6) */}
              <div className="set-row">
                <label htmlFor="parentItemNo">理由</label>
                <input
                  id="parentItemNo"
                  ref={reasonRef}
                  tabIndex={6}
                  value={form.parentItemNo}
                  onChange={(e) => setForm({ ...form, parentItemNo: e.target.value })}
                />
              </div>
            </div>

            {/* Grid (tabIndex 7) */}
            <div ref={gridRef} tabIndex={7} style={{ outline: "none" }}>
              <TableSection
                columns={tableColumns}
                rows={rows}
                gridClassName={`equipment-table${!isDetailEditable ? " equipment-table--readonly" : ""}`}
                scrollRef={tableScrollRef}
                getRowKey={(row) => row.id}
                activeRowKey={activeRowId}
                onRowActivate={(rowKey) => {
                  if (isDetailEditable) setActiveRowId(Number(rowKey));
                }}
              />
            </div>

            <ActionFooter columns={4}>
              <button className="set-btn set-danger"   onClick={() => setShowClearConfirm(true)}>破棄</button>
              <button className="set-btn set-primary"  onClick={() => setShowCompleteConfirm(true)}>完了</button>
              <button className="set-btn set-primary set-success" onClick={() => handleReleaseClick({ forceHandInput: true })}>手入力</button>
              <button className="set-btn set-warning"  onClick={() => setShowBackConfirm(true)}>戻る</button>
            </ActionFooter>
          </div>

          {/* ── Modals ────────────────────────────────────────────────────────── */}

          {/* Error modal (HT001-E / HT002-E) */}
          {errorMessage && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">エラー</div>
                <div className="set-modal-body">{errorMessage}</div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => setErrorMessage(null)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showHandInputConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">品目情報を手入力しますか？</div>
                <div className="set-modal-actions">
                  <button className="set-modal-btn set-modal-yes" onClick={() => { setShowHandInputConfirm(false); navigate("/factory/equipment-hand-input"); }}>はい</button>
                  <button className="set-modal-btn set-modal-no"  onClick={() => setShowHandInputConfirm(false)}>いいえ</button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-actions">
                  <button className="set-modal-btn set-modal-yes" onClick={() => setShowDeleteConfirm(false)}>はい</button>
                  <button className="set-modal-btn set-modal-no"  onClick={() => setShowDeleteConfirm(false)}>いいえ</button>
                </div>
              </div>
            </div>
          )}

          {showNoSelectionConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">選択行がありません。</div>
                <div className="set-modal-actions">
                  <button className="set-modal-btn set-modal-yes" onClick={() => setShowNoSelectionConfirm(false)}>OK</button>
                </div>
              </div>
            </div>
          )}

          {showClearConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">
                  読込データを破棄します。<br />宜しいですか？
                </div>
                <div className="set-modal-actions">
                  <button className="set-modal-btn set-modal-yes" onClick={() => { setShowClearConfirm(false); clearFormAndRows(); }}>はい</button>
                  <button className="set-modal-btn set-modal-no"  onClick={() => setShowClearConfirm(false)}>いいえ</button>
                </div>
              </div>
            </div>
          )}

          {showCompleteConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">セット構成を登録しました。</div>
                <div className="set-modal-actions">
                  <button className="set-modal-btn set-modal-yes" onClick={() => setShowCompleteConfirm(false)}>OK</button>
                </div>
              </div>
            </div>
          )}

          {showBackConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">
                  メニューに戻ります。<br />読込データを破棄しますか？
                </div>
                <div className="set-modal-actions">
                  <button className="set-modal-btn set-modal-yes" onClick={() => { setShowBackConfirm(false); navigate("/factory"); }}>はい</button>
                  <button className="set-modal-btn set-modal-no"  onClick={() => setShowBackConfirm(false)}>いいえ</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Equipment };