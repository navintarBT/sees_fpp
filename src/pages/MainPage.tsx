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
import { InventoryRecordsHandInputPage } from '../app/New-normal/InventoryRecord/InventoryRecordsHandInputPage'
import { InventoryRecordDetail } from '../app/New-normal/InventoryRecord/InventoryRecordDetail'
import { ShippingRecordPage } from '../app/New-normal/ShippingRecord/ShippingRecordPage'
import { ShippingRecordHandInputPage } from '../app/New-normal/ShippingRecord/ShippingRecordHandInputPage'
import { ShippingRecordDetail } from '../app/New-normal/ShippingRecord/ShippingRecordDetail'
import { ShelfTransfer } from '../app/New-normal/ShelfTransfer/ShelfTransfer'
import { IncomingProcessRegistration } from '../app/New-normal/IncomingProcessRegistration/IncomingProcessRegistration'

const MainPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Warehouse />} />
        <Route path='warehouse' element={<Warehouse />} />
        <Route path='factory' element={<Factory />} />
        <Route path='set-register' element={<SetRegisterPage />} />
        <Route path='set-register/hand-input' element={<SetRegisterHandInputPage />} />
        <Route path='dispatch' element={<DispatchPage />} />
        <Route path='dispatch/hand-input' element={<DispatchHandInputPage />} />
        <Route path='inbound' element={<VehicleInboundPage />} />
        <Route path='inbound/hand-input' element={<VehicleInboundHandInputPage />} />
        <Route path='delivery-slip-registration' element={<DeliverySlipRegistration />} />
        <Route path='return-configuration' element={<ReturnConfiguration />} />
        <Route path='set-return-configuration' element={<SetReturnConfiguration />} />
        <Route path='miscellaneous-in-and-out-bound' element={<MiscellaneousInAndOutBound />} />
        <Route path='set-miscellaneous-in-and-out-bound' element={<SetMiscellaneousInAndOutBound />} />
        <Route path='bundle-page' element={<BundlePage />} />
        <Route path='bundle-hand-input' element={<BundleHandInputPage />} />
        <Route path='equipment' element={<Equipment />} />
        <Route path='equipment-hand-input' element={<EquipmentHandInputPage />} />
        <Route path='wo-parts-issuance' element={<WOPartsIssuance />} />
        <Route path='wo-parts-issuance-hand-input' element={<WOPartsIssuanceHandInputPage />} />
        <Route path='button-access' element={<ButtonAccess />} />
        <Route path='wo-parts-issuance-detail' element={<WOPartsIssuanceDetail />} />
        <Route path='work-order-completion' element={<WorkOrderCompletion />} />
        <Route path='work-order-time-registration' element={<WorkOrderTimeRegistration />} />
        <Route path='inventory-records' element={<InventoryRecordsPage />} />
        <Route path='inventory-hand-input' element={<InventoryRecordsHandInputPage />} />
        <Route path='inventory-detail' element={<InventoryRecordDetail />} />
        <Route path='shipping-records' element={<ShippingRecordPage />} />
        <Route path='shipping-hand-input' element={<ShippingRecordHandInputPage />} />
        <Route path='shipping-detail' element={<ShippingRecordDetail />} />
        <Route path='shelf-transfer' element={<ShelfTransfer />} />
        <Route path='incoming-process-registration' element={<IncomingProcessRegistration />} />
      </Route>
    </Routes>
  )
}

export default MainPage
