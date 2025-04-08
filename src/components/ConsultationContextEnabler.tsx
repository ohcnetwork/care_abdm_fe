import { useConsultation } from "@/components/Facility/ConsultationDetails/ConsultationContext";

import useQuery from "@/Utils/request/useQuery";

import routes from "../api";
import { AbhaNumberModel, HealthFacilityModel } from "../types";
import EnforceAbhaLinking from "./EnforceAbhaLinking";

const ConsultationContextEnabler = () => {
  const { patient, setValue } = useConsultation<{
    abhaNumber?: AbhaNumberModel;
    healthFacility?: HealthFacilityModel;
  }>();

  const { loading } = useQuery(routes.abhaNumber.get, {
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

  if (loading) {
    return null;
  }

  return <EnforceAbhaLinking />;
};

export default ConsultationContextEnabler;
