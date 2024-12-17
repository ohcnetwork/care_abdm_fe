import dayjs from "dayjs";
import { navigate } from "raviger";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import DialogModal from "@/components/Common/Dialog";
import DateFormField from "@/components/Form/FormFields/DateFormField";
import DateRangeFormField from "@/components/Form/FormFields/DateRangeFormField";
import {
  MultiSelectFormField,
  SelectFormField,
} from "@/components/Form/FormFields/SelectFormField";
import TextFormField from "@/components/Form/FormFields/TextFormField";

import { useMessageListener } from "@/hooks/useMessageListener";

import * as Notification from "@/lib/notify";
import { ABDM_CONSENT_PURPOSE, ABDM_HI_TYPE } from "../constants";
import { AbhaNumberModel, ConsentHIType, ConsentPurpose } from "../types";
import { useMutation } from "@tanstack/react-query";
import apis from "../api";

const getDate = (value: string | Date) =>
  (value && dayjs(value).isValid() && dayjs(value).toDate()) || undefined;

interface IProps {
  abha?: AbhaNumberModel;
  show: boolean;
  onClose: () => void;
}

export default function FetchRecordsModal({ abha, show, onClose }: IProps) {
  const { t } = useTranslation();

  const [idVerificationStatus, setIdVerificationStatus] = useState<
    "pending" | "in-progress" | "verified" | "failed"
  >("verified");
  const [purpose, setPurpose] = useState<ConsentPurpose>("CAREMGT");
  const [fromDate, setFromDate] = useState<Date>(
    dayjs().subtract(30, "day").toDate()
  );
  const [toDate, setToDate] = useState<Date>(dayjs().toDate());
  const [hiTypes, setHiTypes] = useState<ConsentHIType[]>([]);
  const [expiryDate, setExpiryDate] = useState<Date>(
    dayjs().add(30, "day").toDate()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const notificationSubscriptionState = useNotificationSubscriptionState([
  //   show,
  // ]);

  useMessageListener((data) => {
    if (data.type === "MESSAGE" && data.from === "patients/on_find") {
      if (data.message?.patient?.id === abha?.health_id) {
        setIdVerificationStatus("verified");
        setErrors({
          ...errors,
          health_id: "",
        });
      }
    }
  });

  const createConsentMutation = useMutation({
    mutationFn: apis.consent.create,
    onSuccess: () => {
      Notification.Success({
        msg: t("consent_requested_successfully"),
      });

      navigate(
        `/facility/${abha?.patient_object?.facility}/abdm`
        // ?? `/facility/${abha?.patient_object?.facility}/patient/${abha?.patient_object?.id}/consultation/${abha?.patient_object?.last_consultation?.id}/abdm`,
      );

      onClose();
    },
  });

  return (
    <DialogModal
      className="max-w-xl"
      fixedWidth={false}
      title={t("hi__fetch_records")}
      show={show}
      onClose={onClose}
    >
      {/* {["unsubscribed", "subscribed_on_other_device"].includes(
        notificationSubscriptionState,
      ) && (
        <p className="my-4 text-sm text-warning-600">
          <TriangleAlertIcon className="h-4 w-4" />{" "}
          Notifications needs to be enabled on this device to verify the
          patient.
        </p>
      )} */}

      <div className="flex items-center gap-3">
        <TextFormField
          value={abha?.health_id as string}
          onChange={() => null}
          disabled
          label={t("consent_request__patient_identifier")}
          name="health_id"
          error={errors.health_id}
          className="flex-1"
        />
      </div>
      <SelectFormField
        label={t("consent_request__purpose")}
        errorClassName="hidden"
        id="purpose"
        name="purpose"
        className="mb-6"
        options={ABDM_CONSENT_PURPOSE}
        optionLabel={(o) => t(`consent__purpose__${o}`)}
        optionValue={(o) => o}
        value={purpose}
        onChange={({ value }) => setPurpose(value)}
        required
      />

      <DateRangeFormField
        name="health_records_range"
        id="health_records_range"
        value={{
          start: getDate(fromDate),
          end: getDate(toDate),
        }}
        onChange={(e) => {
          setFromDate(e.value.start!);
          setToDate(e.value.end!);
        }}
        label={t("consent_request__date_range")}
        required
      />

      <MultiSelectFormField
        name="hi_types"
        options={ABDM_HI_TYPE}
        label={t("consent_request__hi_types")}
        placeholder={t("consent_request__hi_types_placeholder")}
        labelSuffix={
          hiTypes.length !== ABDM_HI_TYPE.length && (
            <Button
              variant="ghost"
              onClick={() => {
                setHiTypes(ABDM_HI_TYPE);
              }}
            >
              {t("select_all")}
            </Button>
          )
        }
        value={hiTypes}
        optionLabel={(option) => t(`consent__hi_type__${option}`)}
        optionValue={(option) => option}
        onChange={(e) => setHiTypes(e.value)}
        required
      />

      <DateFormField
        name="expiry_date"
        id="expiry_date"
        value={getDate(expiryDate)}
        onChange={(e) => setExpiryDate(e.value!)}
        label={t("consent_request__expiry")}
        required
        disablePast
      />

      <div className="mt-6 flex items-center justify-end">
        <Button
          onClick={async () => {
            if (idVerificationStatus !== "verified") {
              setErrors({
                ...errors,
                health_id: t("verify_patient_identifier"),
              });

              return;
            }

            createConsentMutation.mutate({
              patient_abha: abha?.health_id as string,
              hi_types: hiTypes,
              purpose,
              from_time: fromDate,
              to_time: toDate,
              expiry: expiryDate,
            });
          }}
          disabled={idVerificationStatus !== "verified"}
          loading={createConsentMutation.isPending}
        >
          {t("request_consent")}
        </Button>
      </div>
    </DialogModal>
  );
}
