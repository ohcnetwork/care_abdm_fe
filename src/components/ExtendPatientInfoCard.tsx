import { useQueryParams } from "raviger";
import { useTranslation } from "react-i18next";

import { useConsultation } from "@/components/Facility/ConsultationDetails/ConsultationContext";

import * as Notification from "@/Utils/Notifications";
import request from "@/Utils/request/request";
import useQuery from "@/Utils/request/useQuery";
import { ExtendPatientInfoCardComponentType } from "@/pluginTypes";

import routes from "../api";
import { AbhaNumberModel } from "../types";
import ABHAProfileModal from "./ABHAProfileModal";
import FetchRecordsModal from "./FetchRecordsModal";
import LinkAbhaNumber from "./LinkAbhaNumber";

const ExtendPatientInfoCard: ExtendPatientInfoCardComponentType = ({
  patient,
  fetchPatientData,
}) => {
  const { t } = useTranslation();
  const [qParams, setQParams] = useQueryParams();
  const { abhaNumber } = useConsultation<{
    abhaNumber?: AbhaNumberModel;
  }>();

  const { data: healthFacility } = useQuery(routes.healthFacility.get, {
    pathParams: { facility_id: patient.facility! },
    silent: true,
  });

  return (
    <>
      <LinkAbhaNumber
        healthFacility={healthFacility}
        show={qParams.show_link_abha_number === "true"}
        onClose={() => {
          setQParams({ ...qParams, show_link_abha_number: undefined });
        }}
        onSuccess={async (abhaProfile) => {
          const { res, data } = await request(
            routes.healthId.linkAbhaNumberAndPatient,
            {
              body: {
                patient: patient.id,
                abha_number: abhaProfile.external_id,
              },
            },
          );

          if (res?.status === 200 && data) {
            Notification.Success({
              msg: t("abha_number_linked_successfully"),
            });

            fetchPatientData?.({ aborted: false });
            setQParams({
              ...qParams,
              show_link_abha_number: undefined,
              show_abha_profile: "true",
            });
          } else {
            Notification.Error({
              msg: t("failed_to_link_abha_number"),
            });
          }
        }}
      />
      <ABHAProfileModal
        patientId={patient.id}
        abha={abhaNumber}
        show={qParams.show_abha_profile === "true"}
        onClose={() => {
          setQParams({ ...qParams, show_abha_profile: undefined });
        }}
      />
      <FetchRecordsModal
        abha={abhaNumber}
        show={qParams.show_fetch_records === "true"}
        onClose={() => {
          setQParams({ ...qParams, show_fetch_records: undefined });
        }}
      />
    </>
  );
};

export default ExtendPatientInfoCard;
