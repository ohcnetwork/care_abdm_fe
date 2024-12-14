import * as Notification from "@/Utils/Notifications";

import { ExtendPatientRegisterFormComponentType } from "@/pluginTypes";
import LinkAbhaNumber from "./LinkAbhaNumber";
import { AbhaNumberModel } from "../types";
import { FormContextValue } from "@/components/Form/FormContext";
import { useCallback, useEffect, useState } from "react";
import TextFormField from "@/components/Form/FormFields/TextFormField";
import { PatientForm } from "@/components/Patient/PatientRegister";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import routes from "../api";
import useQuery from "@/Utils/request/useQuery";
import { useTranslation } from "react-i18next";
import { usePubSub } from "@/Utils/pubsubContext";
import request from "@/Utils/request/request";
import { PatientModel } from "@/components/Patient/models";
import { SquareUserIcon } from "lucide-react";
import { parsePhoneNumber } from "@/lib/utils";

const ExtendPatientRegisterForm: ExtendPatientRegisterFormComponentType = ({
  facilityId,
  patientId,
  state,
  dispatch,
  field,
}) => {
  const { t } = useTranslation();
  const [showLinkAbhaNumberModal, setShowLinkAbhaNumberModal] = useState(false);
  const { setSubscribers } = usePubSub();

  useQuery(routes.abhaNumber.get, {
    pathParams: { abhaNumberId: patientId ?? "" },
    silent: true,
    onResponse(res) {
      if (res.data) {
        dispatch({
          type: "set_form",
          form: {
            ...state.form,
            abha_number: res.data.external_id,
            health_id_number: res.data.abha_number,
            health_id: res.data.health_id,
          },
        });
      }
    },
  });

  const linkAbhaNumberAndPatient = useCallback(
    async (message: unknown) => {
      const patient = message as PatientModel;

      if (state.form.abha_number) {
        const { res, data } = await request(
          routes.healthId.linkAbhaNumberAndPatient,
          {
            body: {
              patient: patient.id,
              abha_number: state.form.abha_number,
            },
          }
        );

        if (res?.status === 200 && data) {
          Notification.Success({
            msg: t("abha_number_linked_successfully"),
          });
        }
      }
    },
    [state.form.abha_number, t]
  );

  useEffect(() => {
    if (!state.form.abha_number) return;

    const topic = "patient:upsert";

    // manually setting the subscribers (old instance of linkAbhaNumberAndPatient is replaced with new instance) as subscribe and unsubscribe cannot be used here because this component is not rendered while PatientForm is in loading state
    setSubscribers((prev) => {
      const handlers = Array.from(prev[topic] ?? []).filter(
        (handler) => handler.toString() !== linkAbhaNumberAndPatient.toString()
      );

      handlers.push(linkAbhaNumberAndPatient);
      return { ...prev, [topic]: new Set(handlers) };
    });
  }, [linkAbhaNumberAndPatient, state.form.abha_number]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: healthFacility } = useQuery(routes.healthFacility.get, {
    pathParams: { facility_id: facilityId },
    silent: true,
  });

  const populateAbhaValues = (
    abhaProfile: AbhaNumberModel,
    field: FormContextValue<PatientForm>
  ) => {
    const values = {
      abha_number: abhaProfile.external_id,
      health_id_number: abhaProfile.abha_number,
      health_id: abhaProfile.health_id,
    };

    if (abhaProfile.name)
      field("name").onChange({
        name: "name",
        value: abhaProfile.name,
      });

    if (abhaProfile.mobile) {
      field("phone_number").onChange({
        name: "phone_number",
        value: parsePhoneNumber(abhaProfile.mobile, "IN"),
      });

      field("emergency_phone_number").onChange({
        name: "emergency_phone_number",
        value: parsePhoneNumber(abhaProfile.mobile, "IN"),
      });
    }

    if (abhaProfile.gender)
      field("gender").onChange({
        name: "gender",
        value: { M: "1", F: "2", O: "3" }[abhaProfile.gender],
      });

    if (abhaProfile.date_of_birth)
      field("date_of_birth").onChange({
        name: "date_of_birth",
        value: new Date(abhaProfile.date_of_birth),
      });

    if (abhaProfile.pincode)
      field("pincode").onChange({
        name: "pincode",
        value: abhaProfile.pincode,
      });

    if (abhaProfile.address) {
      field("address").onChange({
        name: "address",
        value: abhaProfile.address,
      });

      field("permanent_address").onChange({
        name: "permanent_address",
        value: abhaProfile.address,
      });
    }

    dispatch({ type: "set_form", form: { ...state.form, ...values } });
    setShowLinkAbhaNumberModal(false);
  };

  return (
    <>
      {!state.form.abha_number && (
        <div className="flex justify-center md:justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  disabled={!healthFacility}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLinkAbhaNumberModal(true);
                  }}
                >
                  <SquareUserIcon className="mr-2" />
                  <span>{t("generate_link_abha")}</span>
                </Button>
              </TooltipTrigger>
              {!healthFacility && (
                <TooltipContent className="max-w-sm break-words text-sm">
                  {t("abha_disabled_due_to_no_health_facility")}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="mb-8 overflow-visible">
        {showLinkAbhaNumberModal && (
          <LinkAbhaNumber
            show={showLinkAbhaNumberModal}
            onClose={() => setShowLinkAbhaNumberModal(false)}
            onSuccess={(data) => {
              if (patientId) {
                Notification.Warn({
                  msg: "To link Abha Number, please save the patient details",
                });
              }

              populateAbhaValues(data, field);
            }}
          />
        )}
        {state.form.abha_number && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-x-20 xl:gap-y-6">
            <div id="abha-number">
              <TextFormField
                id="abha-number"
                name="abha-number"
                label={t("abha_number")}
                type="text"
                value={state.form.health_id_number}
                onChange={() => null}
                disabled={true}
                error=""
              />
            </div>
            <div id="health-id">
              <TextFormField
                id="health-id"
                name="health-id"
                label={t("abha_address")}
                type="text"
                value={state.form.health_id}
                onChange={() => null}
                disabled={true}
                error=""
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ExtendPatientRegisterForm;
