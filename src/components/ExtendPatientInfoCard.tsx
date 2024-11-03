import ABHAProfileModal from "@/components/ABDM/ABHAProfileModal";
import FetchRecordsModal from "@/components/ABDM/FetchRecordsModal";
import * as Notification from "@/Utils/Notifications";
import routes from "../api";
import LinkAbhaNumber from "@/components/ABDM/LinkAbhaNumber";
import request from "@/Utils/request/request";
import { useQueryParams } from "raviger";
import { ExtendPatientInfoCardComponentType } from "@/pluginTypes";
import { useTranslation } from "react-i18next";
import { useConsultation } from "@/components/Facility/ConsultationDetails/ConsultationContext";
import { AbhaNumberModel } from "../types";

const ExtendPatientInfoCard: ExtendPatientInfoCardComponentType = ({
  patient,
  fetchPatientData,
}) => {
  const { t } = useTranslation();
  const [qParams, setQParams] = useQueryParams();
  const { abhaNumber } = useConsultation<{
    abhaNumber?: AbhaNumberModel;
  }>();

  return (
    <>
      <LinkAbhaNumber
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
