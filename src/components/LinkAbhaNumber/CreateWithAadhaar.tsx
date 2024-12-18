import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ButtonWithTimer, Button } from "@/components/ui/button";
import CheckBoxFormField from "@/components/Form/FormFields/CheckBoxFormField";
import OtpFormField from "@/components/Form/FormFields/OtpFormField";
import PhoneNumberFormField from "@/components/Form/FormFields/PhoneNumberFormField";
import TextFormField from "@/components/Form/FormFields/TextFormField";

import * as Notify from "@/lib/notify";

import { AbhaNumberModel } from "../../types";
import useMultiStepForm, { InjectedStepProps } from "./useMultiStepForm";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import apis from "../../api";
import { CircleCheckIcon, CircleIcon, CircleXIcon } from "lucide-react";

const MAX_OTP_RESEND_ALLOWED = 2;

type ICreateWithAadhaarProps = {
  onSuccess: (abhaNumber: AbhaNumberModel) => void;
};

type Memory = {
  aadhaarNumber: string;
  mobileNumber: string;

  isLoading: boolean;
  validationError: string;

  transactionId: string;
  abhaNumber: AbhaNumberModel | null;

  resendOtpCount: number;
};

export default function CreateWithAadhaar({
  onSuccess,
}: ICreateWithAadhaarProps) {
  const { currentStep } = useMultiStepForm<Memory>(
    [
      <EnterAadhaar {...({} as IEnterAadhaarProps)} />,
      <VerifyAadhaar {...({} as IVerifyAadhaarProps)} />,
      <HandleExistingAbhaNumber
        {...({ onSuccess } as IHandleExistingAbhaNumberProps)}
      />,
      <LinkMobileNumber {...({} as ILinkMobileNumberProps)} />,
      <VerifyMobileNumber {...({} as IVerifyMobileNumberProps)} />,
      <ChooseAbhaAddress
        {...({
          onSuccess,
        } as IChooseAbhaAddressProps)}
      />,
    ],
    {
      aadhaarNumber: "",
      mobileNumber: "+91",
      isLoading: false,
      validationError: "",
      transactionId: "",
      abhaNumber: null,
      resendOtpCount: 0,
    }
  );

  return <div>{currentStep}</div>;
}

type IEnterAadhaarProps = InjectedStepProps<Memory>;

function EnterAadhaar({ memory, setMemory, next }: IEnterAadhaarProps) {
  const { t } = useTranslation();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState([
    false,
    false,
    false,
    false,
  ]);

  const validateAadhaar = () => {
    if (memory?.aadhaarNumber.length !== 12) {
      setMemory((prev) => ({
        ...prev,
        validationError: t("aadhaar_validation_length_error"),
      }));
      return false;
    }

    if (memory?.aadhaarNumber.includes(" ")) {
      setMemory((prev) => ({
        ...prev,
        validationError: t("aadhaar_validation_space_error"),
      }));
      return false;
    }

    return true;
  };

  const sendAadhaarOtpMutation = useMutation({
    mutationFn: apis.healthId.abhaCreateSendAadhaarOtp,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({ ...prev, transactionId: data.transaction_id }));
        Notify.Success({
          msg: data.detail ?? t("aadhaar_otp_send_success"),
        });
        next();
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const handleSubmit = async () => {
    if (!validateAadhaar()) return;

    setMemory((prev) => ({ ...prev, isLoading: true }));

    sendAadhaarOtpMutation.mutate({
      aadhaar: memory!.aadhaarNumber,
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-center">
        <TextFormField
          type="password"
          name="aadhaar-number"
          label={t("aadhaar_number")}
          minLength={12}
          maxLength={12}
          inputClassName="text-black tracking-[0.3em] font-bold placeholder:font-normal placeholder:tracking-normal"
          placeholder={t("enter_aadhaar_number")}
          disabled={memory?.isLoading}
          value={memory?.aadhaarNumber}
          onChange={({ value }) =>
            setMemory((prev) => ({
              ...prev,
              aadhaarNumber: value.replace(/\D/g, ""),
            }))
          }
          error={memory?.validationError}
        />
        <span
          className={cn(
            "ml-2 text-sm font-medium text-gray-600",
            !memory?.validationError && "-mt-4"
          )}
        >
          {t("aadhaar_number_will_not_be_stored")}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {disclaimerAccepted.map((isAccepted, i) => (
          <CheckBoxFormField
            key={`abha_disclaimer_${i + 1}`}
            name={`abha_disclaimer_${i + 1}`}
            label={t(`abha__disclaimer_${i + 1}`)}
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
        <Button
          className="w-full"
          loading={memory?.isLoading}
          disabled={
            disclaimerAccepted.some((v) => !v) ||
            memory?.aadhaarNumber.length !== 12
          }
          onClick={handleSubmit}
        >
          {t("send_otp")}
        </Button>
      </div>
    </div>
  );
}

type IVerifyAadhaarProps = InjectedStepProps<Memory>;

function VerifyAadhaar({ memory, setMemory, next }: IVerifyAadhaarProps) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");

  const validateMobileNumber = () => {
    const phone = memory?.mobileNumber.replace("+91", "").replace(/ /g, "");
    if (phone?.length !== 10) {
      setMemory((prev) => ({
        ...prev,
        validationError: t("mobile_number_validation_error"),
      }));
      return false;
    }

    return true;
  };

  const verifyAadhaarOtpMutation = useMutation({
    mutationFn: apis.healthId.abhaCreateVerifyAadhaarOtp,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
          abhaNumber: data.abha_number,
          resendOtpCount: 0,
        }));
        Notify.Success({
          msg: data.detail ?? t("otp_verification_success"),
        });
        next();
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const resendAadhaarOtpMutation = useMutation({
    mutationFn: apis.healthId.abhaCreateSendAadhaarOtp,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
          resendOtpCount: prev.resendOtpCount + 1,
        }));
        Notify.Success({
          msg: data.detail ?? t("aadhaar_otp_send_success"),
        });
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
    onError: () => {
      setMemory((prev) => ({
        ...prev,
        resendOtpCount: Infinity,
      }));
      Notify.Success({
        msg: t("aadhaar_otp_send_error"),
      });

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const handleSubmit = async () => {
    if (!validateMobileNumber()) return;

    if (!memory?.transactionId || !memory?.mobileNumber) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    verifyAadhaarOtpMutation.mutate({
      otp: otp,
      transaction_id: memory.transactionId,
      mobile: memory.mobileNumber.replace("+91", "").replace(/ /g, ""),
    });
  };

  const handleResendOtp = async () => {
    if (!memory?.aadhaarNumber) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    resendAadhaarOtpMutation.mutate({
      aadhaar: memory.aadhaarNumber,
      // transaction_id: memory?.transactionId,
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-center">
        <TextFormField
          type="password"
          name="aadhaar-number"
          label={t("aadhaar_number")}
          minLength={12}
          maxLength={12}
          inputClassName="text-black tracking-[0.3em] font-bold placeholder:font-normal placeholder:tracking-normal"
          placeholder={t("enter_aadhaar_number")}
          disabled={true}
          value={memory?.aadhaarNumber}
          onChange={() => null}
        />
        <span
          className={cn(
            "ml-2 text-sm font-medium text-gray-600",
            !memory?.validationError && "-mt-4"
          )}
        >
          {t("aadhaar_number_will_not_be_stored")}
        </span>
      </div>

      <div className="mt-4">
        <OtpFormField
          name="otp"
          onChange={(value) => setOtp(value as string)}
          value={otp}
          label={t("enter_aadhaar_otp")}
          disabled={memory?.isLoading}
        />
      </div>

      <div className="mt-0">
        <PhoneNumberFormField
          label={t("enter_mobile_number")}
          labelSuffix={<></>}
          name="mobile_number"
          value={memory?.mobileNumber}
          onChange={(e) => {
            if (!memory?.mobileNumber.startsWith("+91")) {
              setMemory((prev) => ({
                ...prev,
                validationError: t("only_indian_mobile_numbers_supported"),
              }));
              return;
            }

            setMemory((prev) => ({ ...prev, mobileNumber: e.value }));
          }}
          error={memory?.validationError}
          errorClassName="text-xs text-red-500"
          types={["mobile"]}
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <Button
          className="w-full"
          loading={memory?.isLoading}
          disabled={otp.length > 6 || memory?.mobileNumber.length === 0}
          onClick={handleSubmit}
        >
          {t("verify_otp")}
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

type IHandleExistingAbhaNumberProps = InjectedStepProps<Memory> & {
  onSuccess: (abhaNumber: AbhaNumberModel) => void;
};

function HandleExistingAbhaNumber({
  memory,
  onSuccess,
  next,
}: IHandleExistingAbhaNumberProps) {
  const { t } = useTranslation();

  // skip this step for new abha number
  useEffect(() => {
    if (memory?.abhaNumber?.new) {
      next();
    }
  }, [memory?.abhaNumber, memory?.mobileNumber]); // eslint-disable-line

  return (
    <div>
      <h2 className="text-xl font-semibold text-secondary-800">
        {t("abha_number_exists")}
      </h2>
      <p className="text-sm text-secondary-800">
        {t("abha_number_exists_description")}
      </p>
      <div className="mt-4 flex flex-col items-center justify-center gap-2">
        <Button className="w-full" onClick={next}>
          {t("create_new_abha_address")}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onSuccess(memory?.abhaNumber as AbhaNumberModel)}
        >
          {t("use_existing_abha_address")}
        </Button>
        <p className="text-xs text-secondary-800">
          {memory?.abhaNumber?.health_id}
        </p>
      </div>
    </div>
  );
}

type ILinkMobileNumberProps = InjectedStepProps<Memory>;

function LinkMobileNumber({
  memory,
  goTo,
  setMemory,
  next,
}: ILinkMobileNumberProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (
      memory?.abhaNumber?.mobile ===
      memory?.mobileNumber.replace("+91", "").replace(/ /g, "")
    ) {
      goTo(5); // skip linking mobile number
    }
  }, [memory?.abhaNumber, memory?.mobileNumber]); // eslint-disable-line

  const linkMobileNumberMutation = useMutation({
    mutationFn: apis.healthId.abhaCreateLinkMobileNumber,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
        }));
        Notify.Success({
          msg: data.detail ?? t("mobile_otp_send_success"),
        });
        next();
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const handleSubmit = async () => {
    if (!memory?.mobileNumber || !memory?.transactionId) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    linkMobileNumberMutation.mutate({
      mobile: memory.mobileNumber.replace("+91", "").replace(/ /g, ""),
      transaction_id: memory.transactionId,
    });
  };

  return (
    <div>
      <div className="mt-0">
        <PhoneNumberFormField
          label={t("enter_mobile_number")}
          labelSuffix={<></>}
          name="mobile_number"
          value={memory?.mobileNumber}
          disabled={true}
          onChange={() => null}
          types={["mobile"]}
        />
      </div>

      <p className="mb-4 text-sm text-secondary-800">
        {t("mobile_number_different_from_aadhaar_mobile_number")}
      </p>

      <div className="mt-4 flex items-center">
        <Button
          className="w-full"
          loading={memory?.isLoading}
          onClick={handleSubmit}
        >
          {t("send_otp")}
        </Button>
      </div>
    </div>
  );
}

type IVerifyMobileNumberProps = InjectedStepProps<Memory>;

function VerifyMobileNumber({
  memory,
  setMemory,
  next,
}: IVerifyMobileNumberProps) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");

  const verifyMobileNumberMutation = useMutation({
    mutationFn: apis.healthId.abhaCreateVerifyMobileNumber,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
          resendOtpCount: 0,
        }));
        Notify.Success({
          msg: data.detail ?? t("mobile_otp_verify_success"),
        });
        next();
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const resendMobileOtpMutation = useMutation({
    mutationFn: apis.healthId.abhaCreateLinkMobileNumber,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
          resendOtpCount: prev.resendOtpCount + 1,
        }));
        Notify.Success({
          msg: data.detail ?? t("mobile_otp_send_success"),
        });
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
    onError: () => {
      setMemory((prev) => ({
        ...prev,
        resendOtpCount: Infinity,
      }));
      Notify.Success({
        msg: t("mobile_otp_send_error"),
      });

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const handleSubmit = async () => {
    if (!memory?.transactionId) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    verifyMobileNumberMutation.mutate({
      transaction_id: memory?.transactionId,
      otp: otp,
    });
  };

  const handleResendOtp = async () => {
    if (!memory?.mobileNumber || !memory?.transactionId) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    resendMobileOtpMutation.mutate({
      mobile: memory.mobileNumber.replace("+91", "").replace(/ /g, ""),
      transaction_id: memory.transactionId,
    });
  };

  return (
    <div>
      <div className="mt-0">
        <PhoneNumberFormField
          label={t("enter_mobile_number")}
          labelSuffix={<></>}
          name="mobile_number"
          value={memory?.mobileNumber}
          disabled={true}
          onChange={() => null}
          types={["mobile"]}
        />
      </div>

      <div className="mt-4">
        <OtpFormField
          name="otp"
          onChange={(value) => setOtp(value as string)}
          value={otp}
          label={t("enter_mobile_otp")}
          disabled={memory?.isLoading}
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <Button
          className="w-full"
          loading={memory?.isLoading}
          onClick={handleSubmit}
        >
          {t("verify_otp")}
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

type IChooseAbhaAddressProps = InjectedStepProps<Memory> & {
  onSuccess: (abhaNumber: AbhaNumberModel) => void;
};

function ChooseAbhaAddress({
  memory,
  setMemory,
  onSuccess,
}: IChooseAbhaAddressProps) {
  const { t } = useTranslation();
  const [healthId, setHealthId] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fetchSuggestionsMutation = useMutation({
    mutationFn: apis.healthId.abhaCreateAbhaAddressSuggestion,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({ ...prev, transactionId: data.transaction_id }));
        setSuggestions(data.abha_addresses);
      }
    },
  });

  useEffect(() => {
    if (!memory?.transactionId) {
      return;
    }

    fetchSuggestionsMutation.mutate({
      transaction_id: memory.transactionId,
    });
  }, [healthId, memory?.transactionId]);

  const enrollAbhaAddressMutation = useMutation({
    mutationFn: apis.healthId.abhaCreateEnrolAbhaAddress,
    onSuccess: (data) => {
      if (data) {
        setMemory((prev) => ({
          ...prev,
          transactionId: data.transaction_id,
          abhaNumber: data.abha_number,
        }));
        Notify.Success({
          msg: data.detail ?? t("abha_address_created_success"),
        });
        onSuccess(data.abha_number);
      }

      setMemory((prev) => ({ ...prev, isLoading: false }));
    },
  });

  const handleSubmit = async () => {
    if (!memory?.transactionId) {
      return;
    }

    setMemory((prev) => ({ ...prev, isLoading: true }));

    enrollAbhaAddressMutation.mutate({
      abha_address: healthId,
      transaction_id: memory.transactionId,
    });
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <TextFormField
        name="health-id"
        label={t("enter_abha_address")}
        placeholder={t("enter_abha_address")}
        disabled={memory?.isLoading}
        value={healthId}
        onChange={({ value }) => {
          setHealthId(value);
        }}
      />

      <div className="-mt-4 mb-2 pl-2 text-sm text-secondary-500">
        {validateRule(
          healthId.length >= 4,
          t("abha_address_validation_length_error")
        )}
        {validateRule(
          isNaN(Number(healthId[0])) && healthId[0] !== ".",
          t("abha_address_validation_start_error")
        )}
        {validateRule(
          healthId[healthId.length - 1] !== ".",
          t("abha_address_validation_end_error")
        )}
        {validateRule(
          /^[0-9a-zA-Z._]+$/.test(healthId),
          t("abha_address_validation_character_error")
        )}
      </div>

      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm text-secondary-800">
            {t("abha_address_suggestions")}
          </h4>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            {suggestions
              .filter((suggestion) => suggestion !== healthId)
              .map((suggestion) => (
                <p
                  onClick={() => setHealthId(suggestion)}
                  className="cursor-pointer rounded-md bg-primary-400 px-2.5 py-1 text-xs text-white"
                >
                  {suggestion}
                </p>
              ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2">
        <Button
          className="w-full"
          disabled={
            memory?.isLoading ||
            !/^(?![\d.])[a-zA-Z0-9._]{4,}(?<!\.)$/.test(healthId)
          }
          onClick={handleSubmit}
        >
          {t("create_abha_address")}
        </Button>
      </div>
    </div>
  );
}

export const validateRule = (
  condition: boolean,
  content: JSX.Element | string,
  isInitialState: boolean = false
) => {
  return (
    <div>
      {isInitialState ? (
        <CircleIcon className="text-xl text-gray-500" />
      ) : condition ? (
        <CircleCheckIcon className="text-xl text-green-500" />
      ) : (
        <CircleXIcon className="text-xl text-red-500" />
      )}{" "}
      <span
        className={cn(
          isInitialState
            ? "text-black"
            : condition
            ? "text-primary-500"
            : "text-red-500"
        )}
      >
        {content}
      </span>
    </div>
  );
};