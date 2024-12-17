import { navigate } from "raviger";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";

import Loading from "@/components/ui/loading";
import TextFormField from "@/components/Form/FormFields/TextFormField";
import { FieldChangeEvent } from "@/components/Form/FormFields/Utils";

import * as Notification from "@/lib/notify";

import {
  HealthFacilityModel,
  IpartialUpdateHealthFacilityTBody,
} from "../types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import apis from "../api";

const initForm = {
  health_facility: null as HealthFacilityModel | null,
  hf_id: "",
};

const initialState = {
  form: { ...initForm },
  errors: {} as Partial<Record<keyof typeof initForm, string>>,
};

const FormReducer = (
  state = initialState,
  action:
    | {
        type: "set_form";
        form: typeof initialState.form;
      }
    | {
        type: "set_error";
        errors: typeof initialState.errors;
      }
) => {
  switch (action.type) {
    case "set_form": {
      return {
        ...state,
        form: action.form,
      };
    }
    case "set_error": {
      return {
        ...state,
        errors: action.errors,
      };
    }
    default:
      return state;
  }
};

export interface IConfigureHealthFacilityProps {
  facilityId: string;
}

export const ConfigureHealthFacility = (
  props: IConfigureHealthFacilityProps
) => {
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(FormReducer, initialState);
  const { facilityId } = props;
  const [isLoading, setIsLoading] = useState(false);

  const { isLoading: loading, data } = useQuery({
    queryKey: ["healthFacility", facilityId],
    queryFn: () => apis.healthFacility.get(facilityId),
    enabled: !!facilityId,
  });

  useEffect(() => {
    if (data) {
      dispatch({
        type: "set_form",
        form: {
          ...state.form,
          health_facility: data,
          hf_id: data.hf_id,
        },
      });
    }
  }, [data]);

  const handleUpdate = (data: HealthFacilityModel) => {
    if (data?.registered) {
      Notification.Success({
        msg: t("health_facility__config_update_success"),
      });
      navigate(`/facility/${facilityId}`);
    } else {
      if (data?.registered === false) {
        Notification.Warn({
          msg: data?.detail || t("health_facility__config_registration_error"),
        });
        navigate(`/facility/${facilityId}`);
      } else {
        Notification.Error({
          msg: data?.detail || t("health_facility__config_update_error"),
        });
      }
    }
    setIsLoading(false);
  };

  const registerHealthFacilityAsServiceMutation = useMutation({
    mutationFn: () => apis.healthFacility.registerAsService(facilityId),
    onSuccess: handleUpdate,
  });

  const updateHealthFacilityMutation = useMutation({
    mutationFn: (body: IpartialUpdateHealthFacilityTBody) =>
      apis.healthFacility.partialUpdate(facilityId, body),
    onSuccess: handleUpdate,
  });

  const createHealthFacilityMutation = useMutation({
    mutationFn: apis.healthFacility.create,
    onSuccess: handleUpdate,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!state.form.hf_id) {
      dispatch({
        type: "set_error",
        errors: { hf_id: t("health_facility__validation__hf_id_required") },
      });
      setIsLoading(false);
      return;
    }

    if (state.form.hf_id === state.form.health_facility?.hf_id) {
      registerHealthFacilityAsServiceMutation.mutate();
    } else if (state.form.health_facility) {
      updateHealthFacilityMutation.mutate({
        hf_id: state.form.hf_id,
      });
    } else {
      createHealthFacilityMutation.mutate({
        facility: facilityId,
        hf_id: state.form.hf_id,
      });
    }
  };

  const handleChange = (e: FieldChangeEvent<string>) => {
    dispatch({
      type: "set_form",
      form: { ...state.form, [e.name]: e.value },
    });
  };

  if (loading || isLoading) {
    return <Loading />;
  }

  return (
    <div className="cui-card mt-4">
      <form onSubmit={handleSubmit}>
        <div className="mt-2 grid grid-cols-1 gap-4">
          <div>
            <TextFormField
              name="hf_id"
              label={t("health_facility__hf_id")}
              trailing={
                <p
                  className={cn(
                    "tooltip cursor-pointer text-sm",
                    state.form.health_facility?.registered
                      ? "text-primary-600 hover:text-primary-800"
                      : "text-warning-600 hover:text-warning-800"
                  )}
                >
                  {state.form.health_facility?.registered ? (
                    <>
                      <div className="tooltip-text -ml-20 -mt-36 flex w-48 flex-col gap-4 whitespace-break-spaces">
                        <span className="text-secondary-100">
                          {t("health_facility__registered_1.1")}{" "}
                          <strong>
                            {t("health_facility__registered_1.2")}
                          </strong>
                        </span>
                        <span className="text-green-100">
                          {t("health_facility__registered_2")}
                        </span>
                      </div>
                      {t("health_facility__registered_3")}
                    </>
                  ) : (
                    <>
                      <div className="tooltip-text -ml-20 -mt-44 flex w-48 flex-col gap-4 whitespace-break-spaces">
                        <span className="text-secondary-100">
                          {t("health_facility__not_registered_1.1")}{" "}
                          <strong>
                            {t("health_facility__not_registered_1.2")}
                          </strong>
                        </span>
                        <span className="text-warning-100">
                          {t("health_facility__not_registered_2")}
                        </span>
                        {t("health_facility__not_registered_3")}
                      </div>
                    </>
                  )}
                </p>
              }
              required
              value={state.form.hf_id}
              onChange={handleChange}
              error={state.errors?.hf_id}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            onClick={handleSubmit}
            disabled={
              state.form.hf_id === state.form.health_facility?.hf_id &&
              state.form.health_facility?.registered
            }
          >
            {t("health_facility__link")}
          </Button>
        </div>
      </form>
    </div>
  );
};
