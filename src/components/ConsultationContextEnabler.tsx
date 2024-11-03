import { useConsultation } from "@/components/Facility/ConsultationDetails/ConsultationContext";
import useQuery from "@/Utils/request/useQuery";
import routes from "../api";
import { AbhaNumberModel, HealthFacilityModel } from "../types";

const ConsultationContextEnabler = () => {
  const { patient, setValue } = useConsultation<{
    abhaNumber?: AbhaNumberModel;
    healthFacility?: HealthFacilityModel;
  }>();

  useQuery(routes.abhaNumber.get, {
    pathParams: { abhaNumberId: patient?.id ?? "" },
    silent: true,
    onResponse(res) {
      setValue("abhaNumber", res.data);
    },
  });

  useQuery(routes.healthFacility.get, {
    pathParams: { facility_id: patient?.facility ?? "" },
    silent: true,
    onResponse(res) {
      setValue("healthFacility", res.data);
    },
  });

  return <></>;
};

export default ConsultationContextEnabler;
