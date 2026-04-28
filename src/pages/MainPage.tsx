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
import  { WorkOrderCompletion } from '../app/new-high/WorkOrderCompletion/WorkOrderCompletion'
import { Factory } from './layout/factory'
import { Warehouse } from './layout/warehouse'
import { WOPartsIssuance } from '../app/new-high/WOPartsIssuance/WOPartsIssuance'
import { WOPartsIssuanceHandInputPage } from '../app/new-high/WOPartsIssuance/WOPartsIssuanceHandInputPage'

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
        <Route path='BundlePage' element={<BundlePage />} />
        <Route path='BundleHandInputPage' element={<BundleHandInputPage />} />
        <Route path='Equipment' element={<Equipment/>} />
        <Route path='EquipmentHandInputPage' element={<EquipmentHandInputPage/>} />
        <Route path='WorkOrderCompletion' element={<WorkOrderCompletion/>} />
        <Route path='WOPartsIssuance' element={<WOPartsIssuance />} />
        <Route path='WOPartsIssuanceHandInputPage' element={<WOPartsIssuanceHandInputPage />} />
      </Route>
    </Routes>
  )
}

export default MainPage
