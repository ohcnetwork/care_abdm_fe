import { AppRoutes } from "@core/Routers/AppRouter";
import HealthInformation from "./pages/HealthInformation";
import ABDMFacilityRecords from "./pages/ABDMFacilityRecords";

const routes: AppRoutes = {
  "/abdm/health-information/:id": ({ id }) => (
    <HealthInformation artefactId={id} />
  ),
  "/facility/:facilityId/abdm": ({ facilityId }) => (
    <ABDMFacilityRecords facilityId={facilityId} />
  ),
};

export default routes;
