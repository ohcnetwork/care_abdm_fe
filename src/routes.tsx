import HealthInformation from "@/components/pages/HealthInformation";

const routes = {
  "/abdm/health-information/:id": ({ id }: { id: string }) => (
    <HealthInformation artefactId={id} />
  ),
};

export default routes;
