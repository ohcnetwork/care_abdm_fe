import * as Notification from "@/lib/notify";

import ABHAProfileModal from "./ABHAProfileModal";
import { ExtendPatientInfoCardComponentType } from "@/types/plugable-props";
import FetchRecordsModal from "./FetchRecordsModal";
import LinkAbhaNumber from "./LinkAbhaNumber";
import apis from "../api";
import { useMutation } from "@tanstack/react-query";
import { useQueryParams } from "raviger";
import { useTranslation } from "react-i18next";

const ExtendPatientInfoCard: ExtendPatientInfoCardComponentType = ({
  consultationContext: { abhaNumber },
  patient,
  fetchPatientData,
}) => {
  const { t } = useTranslation();
  const [qParams, setQParams] = useQueryParams();

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
            patient: patient.id!,
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
