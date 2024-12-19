import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import DropdownMenu, { DropdownItem } from "@/components/Common/Menu";
import CheckBoxFormField from "@/components/Form/FormFields/CheckBoxFormField";
import OtpFormField from "@/components/Form/FormFields/OtpFormField";
import TextFormField from "@/components/Form/FormFields/TextFormField";

import * as Notify from "@/lib/notify";

import { AbhaNumberModel } from "../../types";
import useMultiStepForm, { InjectedStepProps } from "./useMultiStepForm";
import { cn } from "@/lib/utils";
import { Button, ButtonWithTimer } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import apis from "@/api";

const MAX_OTP_RESEND_ALLOWED = 2;

type ILoginWithOtpProps = {
  onSuccess: (abhaNumber: AbhaNumberModel) => void;
};

type Memory = {
  id: string;

  isLoading: boolean;
  validationError: string;

  transactionId: string;
  type: "aadhaar" | "mobile" | "abha-number" | "abha-address";
  otp_system: "abdm" | "aadhaar";
  abhaNumber: AbhaNumberModel | null;

  resendOtpCount: number;
};

export default function LinkWithOtp({ onSuccess }: ILoginWithOtpProps) {
  const { currentStep } = useMultiStepForm<Memory>(
    [
      <EnterId {...({} as IEnterIdProps)} />,
      <VerifyId {...({ onSuccess } as IVerifyIdProps)} />,
    ],
    {
      id: "",
      isLoading: false,
      validationError: "",
      transactionId: "",
      type: "aadhaar",
      otp_system: "aadhaar",
      abhaNumber: null,
      resendOtpCount: 0,
    }
  );

  return <div>{currentStep}</div>;
}

type IEnterIdProps = InjectedStepProps<Memory>;

const supportedAuthMethods = ["AADHAAR_OTP", "MOBILE_OTP"];

function EnterId({ memory, setMemory, next }: IEnterIdProps) {
  const { t } = useTranslation();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState([
    false,
    false,
    false,
  ]);
  const [authMethods, setAuthMethods] = useState<string[]>([]);

  const valueType = useMemo(() => {
    const id = memory?.id;
    const isNumeric = !isNaN(Number(id?.trim()));

    if (isNumeric && (id?.length === 12 || id?.length === 16)) {
      return "aadhaar";
    } else if (isNumeric && id?.length === 10) {
      return "mobile";
    } else if (isNumeric && id?.length === 14) {
      return "abha-number";
    } else {
      return "abha-address";
    }
  }, [memory?.id]);

  const checkAuthMethodsMutation = useMutation({
    mutationFn: apis.healthId.abhaLoginCheckAuthMethods,
    onSuccess: (data) => {
      if (data) {
        const methods = data.auth_methods.filter((method: string) =>
          supportedAuthMethods.find((supported) => supported === method)
        );

        if (methods.length === 0) {
          Notify.Warn({ msg: t("get_auth_mode_error") });
        }
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
    onError: (error) => {
      Notify.Error({ msg: error?.message ?? t("get_auth_mode_error") });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: apis.healthId.abhaLoginSendOtp,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
        }));
        Notify.Success({ msg: data.detail ?? t("send_otp_success") });
        next();
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const handleGetAuthMethods = async () => {
    if (!memory?.id) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    if (valueType === "aadhaar") {
      setAuthMethods(["AADHAAR_OTP"]);
    } else if (valueType === "mobile") {
      setAuthMethods(["MOBILE_OTP"]);
    } else {
      checkAuthMethodsMutation.mutate({
        abha_address: memory.id.replace(/-/g, "").replace(/ /g, ""),
      });
    }

    setMemory((prev) => ({ ...prev, isLoading: false }));
  };

  const handleSendOtp = async (authMethod: string) => {
    if (!supportedAuthMethods.includes(authMethod)) {
      Notify.Warn({ msg: t("auth_method_unsupported") });
      return;
    }

    if (!memory?.id) {
      return;
    }

    const otp_system: "aadhaar" | "abdm" =
      authMethod === "AADHAAR_OTP" ? "aadhaar" : "abdm";

    setMemory((prev) => ({
      ...prev,
      isLoading: true,
      type: valueType,
      otp_system,
    }));

    sendOtpMutation.mutate({
      value: memory.id,
      type: valueType,
      otp_system,
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-center">
        <TextFormField
          type="password"
          name="id"
          label={t("any_id")}
          inputClassName="text-black tracking-[0.3em] font-bold placeholder:font-normal placeholder:tracking-normal"
          placeholder={t("enter_any_id")}
          disabled={memory?.isLoading}
          value={memory?.id}
          onChange={({ value }) => {
            setMemory((prev) => ({ ...prev, id: value }));
            setAuthMethods([]);
          }}
          error={memory?.validationError}
        />
        <span
          className={cn(
            "ml-2 text-sm font-medium text-gray-600",
            !memory?.validationError && "-mt-4"
          )}
        >
          {t("any_id_description")}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {disclaimerAccepted.map((isAccepted, i) => (
          <CheckBoxFormField
            key={`abha_disclaimer_${i + 2}`}
            name={`abha_disclaimer_${i + 2}`}
            label={t(`abha__disclaimer_${i + 2}`)}
            value={isAccepted}
            onChange={(e) => {
              setDisclaimerAccepted(
                disclaimerAccepted.map((v, j) => (j === i ? e.value : v))
              );
            }}
            className="mr-2 rounded border-gray-700"
            labelClassName="text-xs text-gray-800"
            errorClassName="hidden"
          />
        ))}
      </div>

      <div className="mt-4 flex items-center">
        {authMethods.length === 0 ? (
          <Button
            className="w-full"
            loading={memory?.isLoading}
            disabled={
              disclaimerAccepted.some((v) => !v) || memory?.id.length === 0
            }
            onClick={handleGetAuthMethods}
          >
            {t("get_auth_methods")}
          </Button>
        ) : (
          <DropdownMenu
            itemClassName="!w-full md:!w-full"
            containerClassName="w-full"
            title={t("verify_using")}
          >
            {authMethods.map((method) => (
              <DropdownItem key={method} onClick={() => handleSendOtp(method)}>
                {t(`abha__auth_method__${method}`)}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

type IVerifyIdProps = InjectedStepProps<Memory> & {
  onSuccess: (abhaNumber: AbhaNumberModel) => void;
};

function VerifyId({ memory, setMemory, onSuccess }: IVerifyIdProps) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");

  const verifyOtpMutation = useMutation({
    mutationFn: apis.healthId.abhaLoginVerifyOtp,
    onSuccess: (data) => {
      if (data) {
        Notify.Success({ msg: t("verify_otp_success") });
        onSuccess(data.abha_number);
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: apis.healthId.abhaLoginSendOtp,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
          resendOtpCount: (prev.resendOtpCount ?? 0) + 1,
        }));
        Notify.Success({ msg: data.detail ?? t("send_otp_success") });
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
    onError: () => {
      setMemory((prev) => ({
        ...prev,
        resendOtpCount: Infinity,
      }));
      Notify.Error({ msg: t("send_otp_error") });

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const handleSubmit = async () => {
    if (!memory?.type || !memory?.transactionId || !memory?.otp_system) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    verifyOtpMutation.mutate({
      type: memory.type,
      transaction_id: memory.transactionId,
      otp,
      otp_system: memory.otp_system,
    });
  };

  const handleResendOtp = async () => {
    if (!memory?.type || !memory?.transactionId || !memory?.otp_system) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    resendOtpMutation.mutate({
      value: memory.id,
      type: memory.type,
      otp_system: memory.otp_system,
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-center">
        <TextFormField
          type="password"
          name="id"
          label={t("any_id")}
          inputClassName="text-black tracking-[0.3em] font-bold placeholder:font-normal placeholder:tracking-normal"
          placeholder={t("enter_any_id")}
          disabled={true}
          value={memory?.id}
          onChange={() => null}
        />
        <span
          className={cn(
            "ml-2 text-sm font-medium text-gray-600",
            !memory?.validationError && "-mt-4"
          )}
        >
          {t("any_id_description")}
        </span>
      </div>

      <div className="mt-4">
        <OtpFormField
          name="otp"
          onChange={(value) => setOtp(value as string)}
          value={otp}
          label={t("enter_otp")}
          disabled={memory?.isLoading}
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <Button
          className="w-full"
          loading={memory?.isLoading}
          disabled={otp.length !== 6}
          onClick={handleSubmit}
        >
          {t("verify_and_link")}
        </Button>

        {(memory?.resendOtpCount ?? 0) < MAX_OTP_RESEND_ALLOWED && (
          <ButtonWithTimer
            variant="ghost"
            className="w-full"
            initialInterval={60}
            onClick={handleResendOtp}
          >
            {t("resend_otp")}
          </ButtonWithTimer>
        )}
      </div>
    </div>
  );
}
