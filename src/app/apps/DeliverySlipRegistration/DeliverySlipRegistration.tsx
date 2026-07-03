import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { ActionFooter } from "../../components/ActionFooter/ActionFooter";
import {
  TableSection,
  type TableColumn as TFTableColumn,
} from "../../components/TableSection/TableSection";

type Row = {
  id: number;
  situation: string;
  item: string;
};

// ── mock data store ──────────────────────────────────────────────────────────
const ITEM_DATA_MAP: Record<string, Row[]> = {
  "12345678": [
    { id: 1, situation: "", item: "202603310000000000000000000001" },
    { id: 2, situation: "", item: "202603310000000000000000000002" },
    { id: 3, situation: "", item: "202603310000000000000000000003" },
    { id: 4, situation: "", item: "202603310000000000000000000004" },
    { id: 5, situation: "", item: "202603310000000000000000000005" },
    { id: 6, situation: "", item: "202603310000000000000000000006" },
    { id: 7, situation: "", item: "202603310000000000000000000007" },
    { id: 8, situation: "", item: "202603310000000000000000000008" },
    { id: 9, situation: "", item: "202603310000000000000000000009" },
    { id: 10, situation: "", item: "202603310000000000000000000011" },

  ],
  "10000002": [
    { id: 16, situation: "", item: "202603310000000000000000000137" },
    { id: 17, situation: "", item: "202603310000000000000000000487" },
    { id: 18, situation: "", item: "202603310000000000000000000428" },
    { id: 19, situation: "", item: "202603310000000000000000000135" },
    { id: 20, situation: "", item: "202603310000000000000000000754" },
    { id: 21, situation: "", item: "202603310000000000000000000193" },
    { id: 22, situation: "", item: "202603310000000000000000000457" },
    { id: 23, situation: "", item: "202603310000000000000000000123" },
    { id: 24, situation: "", item: "202603310000000000000000000124" },
    { id: 25, situation: "", item: "202603310000000000000000000012" },
    { id: 26, situation: "", item: "202603310000000000000000000012" },
    { id: 27, situation: "", item: "202603310000000000000000000098" },
    { id: 28, situation: "", item: "202603310000000000000000000041" },
    { id: 29, situation: "", item: "202603310000000000000000000045" },
    { id: 30, situation: "", item: "202603310000000000000000000032" },
  ],
};

const SHIPPING_INFO_MAP: Record<
  string,
  {
    exclusiveLocked: boolean;
  }
> = {
  "12345678": { exclusiveLocked: false },

  "10000002": { exclusiveLocked: true },
};

const WORK_TABLE_REGISTRATION = new Set<string>();
let nextRowId = 1000;

const DEFAULT_FORM = {
  parentWarehouse: "羽田製品倉庫：W0040",
  parentItemNo: "",
  deliverySlipNo: "",
  moveWarehouse: "千葉倉庫（WMS）：W002",
  moveStorage: "",
  qty: "1",
  janCode: "",
};

// เก็บ snapshot ของหน้าจอไว้ตอนกด NO เพื่อกลับมาแล้วข้อมูลยังอยู่เหมือนเดิม
const BACK_STATE_KEY = "DeliverySlipRegistration:backState";

type PersistedState = {
  form: typeof DEFAULT_FORM;
  rows: Row[];
  checkedRowIds: number[];
  activeRowId: number | null;
};

const loadPersistedState = (): PersistedState | null => {
  try {
    const raw = sessionStorage.getItem(BACK_STATE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
};

const clearPersistedState = () => {
  try {
    sessionStorage.removeItem(BACK_STATE_KEY);
  } catch {
    /* ignore */
  }
};

const DeliverySlipRegistration = () => {
  const navigate = useNavigate();

  // โหลด snapshot (ถ้ามี) แค่ครั้งเดียวตอน mount
  const [persistedState] = useState(loadPersistedState);

  // ── ① เริ่มต้น rows ว่าง ────────────────────────────────────────────────
  const [rows, setRows] = useState<Row[]>(persistedState?.rows ?? []);

  const [form, setForm] = useState(persistedState?.form ?? { ...DEFAULT_FORM });

  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteRowConfirm, setShowDeleteRowConfirm] = useState(false);
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCompleteRegistrationConfirm, setShowCompleteRegistrationConfirm] =
    useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showErrorConfirm, setShowErrorConfirm] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [completeMessage, setCompleteMessage] = useState("");
  const parentItemNoInputRef = useRef<HTMLInputElement | null>(null);
  const deliverySlipNoInputRef = useRef<HTMLInputElement | null>(null);
  const errorFocusTargetRef = useRef<"parentItemNo" | "deliverySlipNo" | null>(
    null,
  );
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const isEnabled = !!form.parentItemNo.trim();
  const [activeRowId, setActiveRowId] = useState<number | null>(
    persistedState?.activeRowId ?? null,
  );
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>(
    persistedState?.checkedRowIds ?? [],
  );
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null;
  const pressedKeysRef = useRef<{ f1: boolean; f8: boolean }>({
    f1: false,
    f8: false,
  });
  const lastRowActivationRef = useRef<{ rowId: number; time: number } | null>(
    null,
  );

  const isAnyModalOpen =
    showHandInputConfirm ||
    showDeleteConfirm ||
    showDeleteRowConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteRegistrationConfirm ||
    showCompleteConfirm ||
    showBackConfirm ||
    showErrorConfirm;

  const closeAllModals = () => {
    setShowHandInputConfirm(false);
    setShowDeleteConfirm(false);
    setShowDeleteRowConfirm(false);
    setShowNoSelectionConfirm(false);
    setShowClearConfirm(false);
    setShowCompleteRegistrationConfirm(false);
    setShowCompleteConfirm(false);
    setShowBackConfirm(false);
    setShowErrorConfirm(false);
  };

  const clearRows = () => {
    setRows([]);
    setCheckedRowIds([]);
    setActiveRowId(null);
  };

  const clearForm = () =>
    setForm({
      parentWarehouse: "",
      parentItemNo: "",
      deliverySlipNo: "",
      moveWarehouse: "",
      moveStorage: "",
      qty: "",
      janCode: "",
    });

  // บันทึก snapshot ปัจจุบันไว้ก่อนกลับเมนู (ใช้ตอนกด NO)
  const saveStateForBack = () => {
    try {
      sessionStorage.setItem(
        BACK_STATE_KEY,
        JSON.stringify({ form, rows, checkedRowIds, activeRowId }),
      );
    } catch {
      /* ignore */
    }
  };

  const resetTableScroll = () => {
    const el = tableScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
      requestAnimationFrame(() => {
        el.scrollTop = 0;
        el.scrollLeft = 0;
      });
    });
  };

  const clearFormAndRows = () => {
    clearForm();
    clearRows();
    resetTableScroll();
  };

  const setError = (code: string, message: string) => {
    setErrorCode(code);
    setErrorMessage(message);
    setShowErrorConfirm(true);
  };

  const setInputError = (
    target: "parentItemNo" | "deliverySlipNo",
    code: string,
    message: string,
  ) => {
    errorFocusTargetRef.current = target;
    setError(code, message);
  };

  const closeErrorConfirm = () => {
    setShowErrorConfirm(false);
    requestAnimationFrame(() => {
      const focusTarget = errorFocusTargetRef.current;
      errorFocusTargetRef.current = null;
      if (!focusTarget) return;
      const target =
        focusTarget === "deliverySlipNo"
          ? deliverySlipNoInputRef.current
          : parentItemNoInputRef.current;
      if (!target) return;
      target.focus();
      const cursorPosition = target.value.length;
      target.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const delay = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const isHalfWidthDigits = (value: string) => /^[0-9]+$/.test(value);

  const fetchShippingRows = async (shippingNo: string) => {
    if (!shippingNo) {
      setInputError("parentItemNo", "", "");
      return;
    }

    if (!isHalfWidthDigits(shippingNo)) {
      setInputError("parentItemNo", "HT006-E", "");
      return;
    }

    try {
      await delay(250);
      if (shippingNo === "00000000") {
        throw new Error("HT998-E");
      }

      const status = SHIPPING_INFO_MAP[shippingNo];
      const data = ITEM_DATA_MAP[shippingNo] ?? [];
      if (!status || data.length === 0) {
        setError("", "入力した出荷No.が不正です。");
        return;
      }

      if (status.exclusiveLocked) {
        setError("", "他の端末で変更されています。再度読み込みを行って下さい。"
        );
        return;
      }

      setRows(data);
      setCheckedRowIds([]);
      setActiveRowId(null);
      resetTableScroll();
    } catch (err) {
      const code = err instanceof Error && err.message === "" ? "" : "";
      const message =
        code === ""
          ? "ネットワークに接続出来ません。電波の届く場所で再度実行して下さい。"
          : "ネットワークエラーが発生しました。再度実行して下さい。";
      setError(code, message);
    }
  };

  const saveDeliverySlip = async (slipNo: string) => {
    if (!slipNo) {
      setInputError("deliverySlipNo", "", "配送伝票番号が半角数字でない。正しい番号を入力して下さい。");
      return false;
    }

    if (!isHalfWidthDigits(slipNo)) {
      setInputError("deliverySlipNo", "", "配送伝票番号が半角数字でない。正しい番号を入力して下さい。");
      return false;
    }

    if (rows.some((row) => row.item === slipNo)) {
      setError("", "配送伝票Noが重複しています。");
      return false;
    }

    if (WORK_TABLE_REGISTRATION.has(slipNo)) {
      setError("", "既にワークテーブルに登録済みの配送伝票番号です。重複登録できません。");
      return false;
    }

    try {
      await delay(200);
      if (slipNo === "99999999") {
        throw new Error("");
      }
      WORK_TABLE_REGISTRATION.add(slipNo);
      const nextId = nextRowId++;
      setRows((prev) => [...prev, { id: nextId, situation: "", item: slipNo }]);
      setForm((prev) => ({ ...prev, deliverySlipNo: "" }));
      return true;
    } catch (err) {
      setError("", "ネットワークに接続出来ません。電波の届く場所で再度実行して下さい。");
      return false;
    }
  };

  const completeRegistration = async () => {
    if (form.deliverySlipNo.trim()) {
      const saved = await saveDeliverySlip(form.deliverySlipNo.trim());
      if (!saved) {
        return;
      }
    }

    if (rows.length === 0) {
      setError("", "配送伝票番号を入力して下さい。登録するデータがありません。");
      return;
    }

    try {
      await delay(200);
      setCompleteMessage("配送伝票Noを登録しました。");
      setShowCompleteConfirm(true);
      WORK_TABLE_REGISTRATION.clear();
      clearFormAndRows();
    } catch {
      setError("", "ネットワークに接続出来ません。電波の届く場所で再度実行して下さい。");
    }
  };

  const deleteSelectedRows = async () => {
    const willDelete = rows.filter((row) => checkedRowIds.includes(row.id));
    willDelete.forEach((row) => WORK_TABLE_REGISTRATION.delete(row.item));
    setRows((prev) => prev.filter((row) => !checkedRowIds.includes(row.id)));
    setCheckedRowIds([]);
    setActiveRowId(null);
  };

  const handleParentItemNoKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "Enter") {
      return;
    }

    e.preventDefault();
    const shippingNo = form.parentItemNo.trim();
    if (!shippingNo) {
      return;
    }

    await fetchShippingRows(shippingNo);
  };

  const handleRowClick = (rowId: number) => {
    const now = Date.now();
    const lastActivation = lastRowActivationRef.current;
    if (
      lastActivation?.rowId === rowId &&
      now - lastActivation.time < 100
    ) {
      return;
    }
    lastRowActivationRef.current = { rowId, time: now };

    setActiveRowId(rowId);
    setCheckedRowIds((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId],
    );
  };

  const handleReleaseClick = (options?: {
    forceRelease?: boolean;
    forceHandInput?: boolean;
  }) => {
    if (isAnyModalOpen) return;
    if (options?.forceHandInput) {
      closeAllModals();
      setShowHandInputConfirm(true);
      return;
    }
    if (!activeRow) {
      closeAllModals();
      setShowNoSelectionConfirm(true);
      return;
    }
  };

  // เก็บ snapshot ต่อเนื่องทุกครั้งที่ข้อมูลเปลี่ยน เพื่อให้รีเฟรช/กลับมาแล้วข้อมูลยังอยู่
  useEffect(() => {
    saveStateForBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, rows, checkedRowIds, activeRowId]);

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

      if (event.key === "F1") {
        event.preventDefault();
        closeAllModals();
        setShowClearConfirm(true);
        return;
      }
      if (event.key === "F2") {
        event.preventDefault();
        closeAllModals();
        setShowCompleteRegistrationConfirm(true);
        return;
      }
      if (event.key === "F3") {
        event.preventDefault();
        handleReleaseClick({ forceRelease: true });
        return;
      }
      if (event.key === "F4") {
        event.preventDefault();
        closeAllModals();
        setShowBackConfirm(true);
      }
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
  }, [activeRow, isAnyModalOpen]);

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: "arrow",
      headClassName: "col-arrow-head",
      cellClassName: "col-arrow",
      header: "",
      render: (row) =>
        checkedRowIds.includes(row.id) ? (
          <FaPlay className="col-row-arrow" />
        ) : null,
    },
    {
      key: "situation",
      headClassName: "col-situation",
      cellClassName: "col-situation",
      header: "状態",
      render: (row) => row.situation,
    },
    {
      key: "item",
      headClassName: "col-item-delivery",
      cellClassName: "col-item-delivery",
      header: "配送伝票No.",
      render: (row) => row.item,
    },
  ];

  return (
    <div className="mockup-page">
      <div className="mockup-stage mockup-stage-dark">
        <div className="mockup-frame">
          <div className="set-header">配送伝票登録</div>
          <div className="set-body">
            <div className="set-form">
              <div className="set-row">
                <label>出荷No.</label>
                <input
                  ref={parentItemNoInputRef}
                  autoFocus
                  value={form.parentItemNo}
                  maxLength={8}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={showErrorConfirm}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                if (/[^0-9]/.test(rawValue)) {
  setInputError(
    "parentItemNo",
    "",
    `出荷No.は半角数字を
入力してください。`, // ເຄາະເອັນເຕີລົງມາເລີຍ
  );
  return;
}

                    setForm({ ...form, parentItemNo: rawValue });
                    if (rawValue.trim() === "") {
                      clearRows();
                    }
                  }}
                  onKeyDown={handleParentItemNoKeyDown}
                />
              </div>
              <div className="set-row">
                <label>配送伝票No.</label>
                <input
                  ref={deliverySlipNoInputRef}
                  readOnly={!isEnabled}
                  disabled={showErrorConfirm}
                  value={form.deliverySlipNo}
                  style={{ backgroundColor: isEnabled ? "white" : "rgb(229, 231, 235)" }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={30}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (/[^0-9]/.test(rawValue)) {
                      setInputError(
                        "deliverySlipNo",
                        "",
                        "配送伝票No.は半角数字を入力してください。",
                      );
                      return;
                    }

                    setForm({ ...form, deliverySlipNo: rawValue });
                  }}
                  onKeyDown={async (e) => {
                    if (e.key !== "Enter" || !isEnabled) {
                      return;
                    }

                    const slipNo = form.deliverySlipNo.trim();
                    if (!slipNo) {
                      e.preventDefault();
                      return;
                    }

                    e.preventDefault();
                    await saveDeliverySlip(slipNo);
                  }}
                />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName="delivery-table"
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              isRowActive={(rowKey) => checkedRowIds.includes(Number(rowKey))}
              onRowActivate={(rowKey) => handleRowClick(Number(rowKey))}
            />

            {/* ── buttons & modals ยังคงเดิมทุกอย่าง ── */}
            <ActionFooter columns={4}>
              <button
                className="set-btn set-danger"
                onClick={() => setShowClearConfirm(true)}
              >
                破棄
              </button>
              <button
                className="set-btn set-primary"
                onClick={() => setShowCompleteRegistrationConfirm(true)}
              >
                完了
              </button>
              <button
                className="set-btn set-primary set-success"
                onClick={() => {
                  if (checkedRowIds.length === 0) {
                    setShowNoSelectionConfirm(true);
                    return;
                  }
                  setShowDeleteRowConfirm(true);
                }}
              >
                削除
              </button>
              <button
                className="set-btn set-warning"
                onClick={() => setShowBackConfirm(true)}
              >
                戻る
              </button>
            </ActionFooter>
          </div>
          {showHandInputConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">品目情報を手入力しますか？</div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => {
                      setShowHandInputConfirm(false);
                      navigate("");
                    }}
                  >
                    はい
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() => setShowHandInputConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteRowConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">選択行を削除しますか？</div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={async () => {
                      setShowDeleteRowConfirm(false);
                      await deleteSelectedRows();
                    }}
                  >
                    OK
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() => setShowDeleteRowConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    はい
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    いいえ
                  </button>
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
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => setShowNoSelectionConfirm(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showClearConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">{"読込データを破棄します。\n 宜しいですか？"}</div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => {
                      setShowClearConfirm(false);
                      clearFormAndRows();
                    }}
                  >
                    OK
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCompleteRegistrationConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">確認</div>
                <div className="set-modal-body">{"配送伝票登録を\n完了しますか？"}</div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={async () => {
                      setShowCompleteRegistrationConfirm(false);
                      await completeRegistration();
                    }}
                  >
                    OK
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() => setShowCompleteRegistrationConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCompleteConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">完了</div>
                <div className="set-modal-body">{completeMessage || "配送伝票Noを登録しました。"}</div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={() => setShowCompleteConfirm(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showErrorConfirm && (
            <div className="set-modal-backdrop" role="presentation">
              <div className="set-modal" role="dialog" aria-modal="true">
                <div className="set-modal-header">エラー {errorCode || ""}</div>
                <div className="set-modal-body">{errorMessage}</div>
                <div className="set-modal-actions">
                  <button
                    className="set-modal-btn set-modal-yes"
                    onClick={closeErrorConfirm}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

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
                      navigate("/factory");
                    }}
                  >
                  YES
                  </button>
                  <button
                    className="set-modal-btn set-modal-no"
                    onClick={() => {
                      setShowBackConfirm(false);
                      // NO = เก็บข้อมูลไว้: บันทึก snapshot แล้วกลับเมนู กลับมาข้อมูลยังอยู่
                      saveStateForBack();
                      navigate("/factory");
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
        </div>
      </div>
    </div>
  );
};

export { DeliverySlipRegistration };
