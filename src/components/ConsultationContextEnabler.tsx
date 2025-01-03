import { AbhaNumberModel, HealthFacilityModel } from "../types";
import { useQuery } from "@tanstack/react-query";
import apis from "../api";
import { useEffect, useState } from "react";

const ConsultationContextEnabler = () => {
  const [{ patient, setValue }] = useState<any>(); // FIXME: CONTEXT

  const { data: abhaNumber } = useQuery({
    queryKey: ["abha_number", patient?.id],
    queryFn: () => apis.abhaNumber.get(patient?.id ?? ""),
    enabled: !!patient?.id,
  });

  useEffect(() => {
    if (abhaNumber) {
      setValue("abhaNumber", abhaNumber);
    }
  }, [abhaNumber]);

  const { data: healthFacility } = useQuery({
    queryKey: ["health_facility", patient?.facility],
    queryFn: () => apis.healthFacility.get(patient?.facility ?? ""),
    enabled: !!patient?.facility,
  });

  useEffect(() => {
    if (healthFacility) {
      setValue("healthFacility", healthFacility);
    }
  }, [healthFacility]);

  return <></>;
};

export default ConsultationContextEnabler;
