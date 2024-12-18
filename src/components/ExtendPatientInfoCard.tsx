import * as Notification from "@/lib/notify";
import { useQueryParams } from "raviger";
import { useTranslation } from "react-i18next";
import { useConsultation } from "@/components/Facility/ConsultationDetails/ConsultationContext";
import { AbhaNumberModel } from "../types";
import LinkAbhaNumber from "./LinkAbhaNumber";
import ABHAProfileModal from "./ABHAProfileModal";
import FetchRecordsModal from "./FetchRecordsModal";
import { useMutation } from "@tanstack/react-query";
import apis from "../api";
import { ExtendPatientInfoCardComponentType } from "@/types/plugable-props";

const ExtendPatientInfoCard: ExtendPatientInfoCardComponentType = ({
  patient,
  fetchPatientData,
}) => {
  const { t } = useTranslation();
  const [qParams, setQParams] = useQueryParams();
  const { abhaNumber } = useConsultation<{
    abhaNumber?: AbhaNumberModel;
  }>();

  const linkAbhaNumberAndPatientMutation = useMutation({
    mutationFn: apis.healthId.linkAbhaNumberAndPatient,
    onSuccess: (data) => {
      if (data) {
        Notification.Success({
          msg: t("abha_number_linked_successfully"),
        });

        fetchPatientData?.({ aborted: false });
        setQParams({
          ...qParams,
          show_link_abha_number: undefined,
          show_abha_profile: "true",
        });
      }
    },
    onError: () => {
      Notification.Error({
        msg: t("failed_to_link_abha_number"),
      });
    },
  });

  return (
    <>
      <LinkAbhaNumber
        show={qParams.show_link_abha_number === "true"}
        onClose={() => {
          setQParams({ ...qParams, show_link_abha_number: undefined });
        }}
        onSuccess={async (abhaProfile) => {
          linkAbhaNumberAndPatientMutation.mutate({
            patient: patient.id,
            abha_number: abhaProfile.external_id,
          });
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
