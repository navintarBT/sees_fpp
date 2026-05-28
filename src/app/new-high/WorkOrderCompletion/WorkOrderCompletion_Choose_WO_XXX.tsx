import type { ReactNode } from "react";
import { FaPlay } from "react-icons/fa";
import { ActionFooter } from "../../components/ActionFooter/ActionFooter";
import {
  TableSection,
  type TableColumn as TFTableColumn,
} from "../../components/TableSection/TableSection";
import { Link , useNavigate} from "react-router-dom";
type Row = {
  id: number;
  situation: string;
  item: string;
  path: string;
};

const WorkOrderCompletion_Choose_WO = () => {
  const rows: Row[] = [];
  const checkedRowIds: number[] = [];
  const activeRowId: number | null = null;
const navigate = useNavigate();
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
      key: "item",
      headClassName: "col-item-delivery",
      cellClassName: "col-item-delivery",
      header: "WO番号",
      render: (row) => row.item,
    },
  ];

  return (
    <div className="mockup-page">
      <div className="mockup-stage mockup-stage-dark">
        <div className="mockup-frame">
          <div className="set-header">WO選択</div>
          <div className="set-body">
            <div className="set-form">
              {/* input fields removed */}
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName="delivery-table"
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              isRowActive={(rowKey) => checkedRowIds.includes(Number(rowKey))}
              onRowActivate={() => {}}
            />

            <ActionFooter columns={4}>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>{'\u8AAD\u8FBC'}</button>
              <button className="set-btn set-primary">読込</button>
              <button className='set-btn set-primary' style={{visibility: 'hidden'}}>{'\u8AAD\u8FBC'}</button>
             <button className="set-btn set-warning" onClick={() => navigate("/factory/work-order-completion")}>
                戻る
             </button>
            </ActionFooter>
          </div>

          {/* modals removed */}
        </div>
      </div>
    </div>
  );
};

export { WorkOrderCompletion_Choose_WO };