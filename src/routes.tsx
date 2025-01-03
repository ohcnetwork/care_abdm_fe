import HealthInformation from "./pages/HealthInformation";
import ABDMFacilityRecords from "./pages/ABDMFacilityRecords";

const routes = {
  "/abdm/health-information/:id": ({ id }: { id: string }) => (
    <HealthInformation artefactId={id} />
  ),
  "/facility/:facilityId/abdm": ({ facilityId }: { facilityId: string }) => (
    <ABDMFacilityRecords facilityId={facilityId} />
  ),
};

export default routes;
