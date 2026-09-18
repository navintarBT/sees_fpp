import { Route, Routes, Outlet } from 'react-router-dom'
import './mainPage.scss'
import { SetRegisterPage } from '../app/apps/Registration/SetRegisterPage'
import { SetRegisterHandInputPage } from '../app/apps/Registration/SetRegisterHandInputPage'
import { DispatchPage } from '../app/apps/VehicleDispatch/DispatchPage'
import { DispatchHandInputPage } from '../app/apps/VehicleDispatch/DispatchHandInputPage'
import { VehicleInboundPage } from '../app/apps/VehicleInbound/VehicleInboundPage'
import { VehicleInboundHandInputPage } from '../app/apps/VehicleInbound/VehicleInboundHandInputPage'
import { DeliverySlipRegistration } from '../app/apps/DeliverySlipRegistration/DeliverySlipRegistration'
import { ReturnConfiguration } from '../app/apps/ReturnConfiguration/ReturnConfiguration'
import { SetReturnConfiguration } from '../app/apps/ReturnConfiguration/SetReturnConfiguration'
import { MiscellaneousInAndOutBound } from '../app/apps/MiscellaneousInAndOutBound/MiscellaneousInAndOutBound'
import { SetMiscellaneousInAndOutBound } from '../app/apps/MiscellaneousInAndOutBound/SetMiscellaneousInAndOutBound'
import { BundlePage } from '../app/apps/BundleRegistration/BundlePage'
import { BundleHandInputPage } from '../app/apps/BundleRegistration/BundleHandInputPage'
import { Equipment } from '../app/apps/EquipmentDistribution/Equipment'
import { EquipmentHandInputPage } from '../app/apps/EquipmentDistribution/EquipmentHandInputPage'
import { WorkOrderCompletion } from '../app/new-high/WorkOrderCompletion/WorkOrderCompletion'
import { Factory } from './layout/factory'
import { Warehouse } from './layout/warehouse'
import { WOPartsIssuance } from '../app/new-high/WOPartsIssuance/WOPartsIssuance'
import { WOPartsIssuanceHandInputPage } from '../app/new-high/WOPartsIssuance/WOPartsIssuanceHandInputPage'
import { WOPartsIssuanceDetail } from '../app/new-high/WOPartsIssuance/WOPartsIssuanceDetail'
import { ButtonAccess } from '../app/new-high/WOPartsIssuance/ButtonAccess'
import { WorkOrderTimeRegistration } from '../app/new-high/WorkOrderTimeRegistration/WorkOrderTimeRegistration'
import { InventoryRecordsPage } from '../app/New-normal/InventoryRecord/InventoryRecordsPage'
import { OrientationChoose } from '../app/components/OrientationChoose/OrientationChoose'
import { InventoryRecordsHandInputPage } from '../app/New-normal/InventoryRecord/InventoryRecordsHandInputPage'
import { InventoryRecordDetail } from '../app/New-normal/InventoryRecord/InventoryRecordDetail'
import { ShippingRecordPage } from '../app/New-normal/ShippingRecord/ShippingRecordPage'
import { ShippingRecordHandInputPage } from '../app/New-normal/ShippingRecord/ShippingRecordHandInputPage'
import { ShippingRecordDetail } from '../app/New-normal/ShippingRecord/ShippingRecordDetail'
import { ShelfTransfer } from '../app/New-normal/ShelfTransfer/ShelfTransfer'
import { IncomingProcessRegistration } from '../app/New-normal/IncomingProcessRegistration/IncomingProcessRegistration'
import { IncomingProcessRegistrationHandInputPage } from '../app/New-normal/IncomingProcessRegistration/IncomingProcessRegistrationHandInputPage'
import { ButtonWorkOrderTime } from '../app/new-high/WorkOrderTimeRegistration/ButtonWorkOrderTime'
import { WorkOrderCompletion_Choose_WO } from '../app/new-high/WorkOrderCompletion/WorkOrderCompletion_Choose_WO'
import { WorkOrderTimeRegistrationChoose } from '../app/new-high/WorkOrderTimeRegistration/WorkOrderTimeChooseGosen'
import { InventoryPrinting } from '../app/New-normal/InventoryLabelPrinting/InventoryPrinting'

const MainPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Warehouse />} />
        <Route path='warehouse' element={<Warehouse />} />
        <Route path='factory' element={<Factory />} />
        <Route path='set-register-choose' element={<OrientationChoose title='セット構成登録' targetPath='/factory/set-register' backPath='/factory/warehouse' />} />
        <Route path='set-register' element={<SetRegisterPage />} />
        <Route path='set-register/hand-input' element={<SetRegisterHandInputPage />} />
        <Route path='dispatch' element={<DispatchPage />} />
        <Route path='dispatch/hand-input' element={<DispatchHandInputPage />} />
        <Route path='inbound' element={<VehicleInboundPage />} />
        <Route path='inbound/hand-input' element={<VehicleInboundHandInputPage />} />
        <Route path='delivery-slip-registration-choose' element={<OrientationChoose title='配送伝票登録' targetPath='/factory/delivery-slip-registration' backPath='/factory/warehouse' />} />
        <Route path='delivery-slip-registration' element={<DeliverySlipRegistration />} />
        <Route path='set-return-configuration-choose' element={<OrientationChoose title='セット戻り構成登録' targetPath='/factory/set-return-configuration' backPath='/factory/warehouse' />} />
        <Route path='return-configuration' element={<ReturnConfiguration />} />
        <Route path='set-return-configuration' element={<SetReturnConfiguration />} />
        <Route path='set-miscellaneous-in-and-out-bound-choose' element={<OrientationChoose title='予定なし入出庫' targetPath='/factory/set-miscellaneous-in-and-out-bound' backPath='/factory/warehouse' />} />
        <Route path='miscellaneous-in-and-out-bound' element={<MiscellaneousInAndOutBound />} />
        <Route path='set-miscellaneous-in-and-out-bound' element={<SetMiscellaneousInAndOutBound />} />
        <Route path='bundle-page-choose' element={<OrientationChoose title='販売セット登録' targetPath='/factory/bundle-page' backPath='/factory/warehouse' />} />
        <Route path='bundle-page' element={<BundlePage />} />
        <Route path='bundle-hand-input' element={<BundleHandInputPage />} />
        <Route path='equipment-choose' element={<OrientationChoose title='備品振分登録' targetPath='/factory/equipment' backPath='/factory/warehouse' />} />
        <Route path='equipment' element={<Equipment />} />
        <Route path='equipment-hand-input' element={<EquipmentHandInputPage />} />
        <Route path='wo-parts-issuance-choose' element={<OrientationChoose title='WO部品出庫　WO別' targetPath='/factory/wo-parts-issuance' backPath='/factory/button-access' />} />
        <Route path='wo-parts-issuance-hand-input-choose' element={<OrientationChoose title='WO部品出庫 品番別' targetPath='/factory/wo-parts-issuance-hand-input' backPath='/factory/button-access' />} />
        <Route path='wo-parts-issuance' element={<WOPartsIssuance />} />
        <Route path='wo-parts-issuance-hand-input' element={<WOPartsIssuanceHandInputPage />} />
        <Route path='button-access' element={<ButtonAccess />} />
        <Route path='button-work-order-time' element={<ButtonWorkOrderTime />} />
        <Route path='wo-parts-issuance-detail' element={<WOPartsIssuanceDetail />} />
        <Route path='work-order-completion-choose' element={<OrientationChoose title='WO完了実績登録' targetPath='/factory/work-order-completion' backPath='/factory/factory' />} />
        <Route path='work-order-completion' element={<WorkOrderCompletion />} />
        <Route path='work-order-time-registration-gosen-choose' element={<OrientationChoose title='WO作業時間実績登録' targetPath='/factory/work-order-time-registration/gosen' backPath='/factory/button-work-order-time' />} />
        <Route path='work-order-time-registration-chiba-choose' element={<OrientationChoose title='WO作業時間実績登録' targetPath='/factory/work-order-time-registration/chiba' backPath='/factory/button-work-order-time' />} />
        <Route path='work-order-time-registration-common-choose' element={<OrientationChoose title='WO作業時間実績登録' targetPath='/factory/work-order-time-registration/common' backPath='/factory/button-work-order-time' />} />
        <Route path='work-order-time-registration/:factory' element={<WorkOrderTimeRegistration />} />
        <Route path='inventory-records-choose' element={<OrientationChoose title='入庫実績登録' targetPath='/factory/inventory-records' backPath='/factory/factory' />} />
        <Route path='inventory-records' element={<InventoryRecordsPage />} />
        <Route path='inventory-hand-input' element={<InventoryRecordsHandInputPage />} />
        <Route path='inventory-detail' element={<InventoryRecordDetail />} />
        <Route path='shipping-records-choose' element={<OrientationChoose title='出庫実績登録' targetPath='/factory/shipping-records' backPath='/factory/factory' />} />
        <Route path='shipping-records' element={<ShippingRecordPage />} />
        <Route path='shipping-hand-input' element={<ShippingRecordHandInputPage />} />
        <Route path='shipping-detail' element={<ShippingRecordDetail />} />
        <Route path='shelf-transfer-choose' element={<OrientationChoose title='棚移動' targetPath='/factory/shelf-transfer' backPath='/factory/factory' />} />
        <Route path='shelf-transfer' element={<ShelfTransfer />} />
        <Route path='incoming-process-registration-choose' element={<OrientationChoose title='入荷工程登録' targetPath='/factory/incoming-process-registration' backPath='/factory/factory' />} />
        <Route path='incoming-process-registration' element={<IncomingProcessRegistration />} />
        <Route path='incoming-process-registration-hand-input' element={<IncomingProcessRegistrationHandInputPage />} />
        <Route path='work-order-completion-select-wo' element={<WorkOrderCompletion_Choose_WO />} />
        <Route path='work-order-time-registration-choose' element={<WorkOrderTimeRegistrationChoose />} />
        <Route path='inventory-label-printing-choose' element={<OrientationChoose title='庫内バーコードラベル印刷' targetPath='/factory/inventory-label-printing' backPath='/factory/factory' />} />
        <Route path='inventory-label-printing' element={<InventoryPrinting />} />
      </Route>
    </Routes>
  )
}

export default MainPage
