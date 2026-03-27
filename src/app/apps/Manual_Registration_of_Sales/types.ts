// Row status types
export type RowStatus = ' ' | 'Add' | 'Delete';

export interface DeliveryRow {
  id: number;
  deliveryNo: string; // 配送伝票 No.
  status: RowStatus;
}

export interface FormData {
  shipmentNo: string; // 出荷No.
  deliverySlipNo: string; // 配送伝票No.
}

export interface HandInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDeliverySlip: (deliveryNo: string) => void;
}