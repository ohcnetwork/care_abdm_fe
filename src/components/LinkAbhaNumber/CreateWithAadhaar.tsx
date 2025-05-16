import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import ButtonV2, { ButtonWithTimer } from "@/components/Common/ButtonV2";
import CheckBoxFormField from "@/components/Form/FormFields/CheckBoxFormField";
import DateFormField from "@/components/Form/FormFields/DateFormField";
import OtpFormField from "@/components/Form/FormFields/OtpFormField";
import PhoneNumberFormField from "@/components/Form/FormFields/PhoneNumberFormField";
import { SelectFormField } from "@/components/Form/FormFields/SelectFormField";
import TextAreaFormField from "@/components/Form/FormFields/TextAreaFormField";
import TextFormField from "@/components/Form/FormFields/TextFormField";
import { validateRule } from "@/components/Users/UserAdd";

import useAuthUser from "@/hooks/useAuthUser";

import * as Notify from "@/Utils/Notifications";
import request from "@/Utils/request/request";
import useQuery from "@/Utils/request/useQuery";
import { classNames } from "@/Utils/utils";

import { useLinkAbhaNumberContext } from ".";
import routes from "../../api";
import { AbhaNumberModel } from "../../types";
import { formatUsername } from "../../utils";
import useMultiStepForm, { InjectedStepProps } from "./useMultiStepForm";

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

  patientName: string;
};

export default function CreateWithAadhaar({
  onSuccess,
}: ICreateWithAadhaarProps) {
  const { currentStep } = useMultiStepForm<Memory>(
    [
      {
        id: "enter-aadhaar",
        element: <EnterAadhaar {...({} as IEnterAadhaarProps)} />,
      },
      {
        id: "verify-aadhaar-with-otp",
        element: (
          <VerifyAadhaarWithOtp {...({} as IVerifyAadhaarWithOtpProps)} />
        ),
      },
      {
        id: "verify-aadhaar-with-demographics",
        element: (
          <VerifyAadhaarWithDemographics
            {...({ onSuccess } as IVerifyAadhaarWithDemographicsProps)}
          />
        ),
      },
      {
        id: "handle-existing-abha",
        element: (
          <HandleExistingAbhaNumber
            {...({ onSuccess } as IHandleExistingAbhaNumberProps)}
          />
        ),
      },
      {
        id: "link-mobile",
        element: <LinkMobileNumber {...({} as ILinkMobileNumberProps)} />,
      },
      {
        id: "verify-mobile",
        element: <VerifyMobileNumber {...({} as IVerifyMobileNumberProps)} />,
      },
      {
        id: "choose-abha-address",
        element: (
          <ChooseAbhaAddress
            {...({
              onSuccess,
            } as IChooseAbhaAddressProps)}
          />
        ),
      },
    ],
    {
      aadhaarNumber: "",
      mobileNumber: "+91",
      isLoading: false,
      validationError: "",
      transactionId: "",
      abhaNumber: null,
      resendOtpCount: 0,
      patientName: "",
    },
  );

  return <div>{currentStep}</div>;
}

type IEnterAadhaarProps = InjectedStepProps<Memory>;

function EnterAadhaar({ memory, setMemory, goTo }: IEnterAadhaarProps) {
  const { t } = useTranslation();
  const user = useAuthUser();
  const { healthFacility } = useLinkAbhaNumberContext();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState([
    false,
    false,
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

  const handleSubmit = async () => {
    if (!validateAadhaar()) return;

    setMemory((prev) => ({ ...prev, isLoading: true }));

    const { res, data } = await request(
      routes.healthId.abhaCreateSendAadhaarOtp,
      {
        body: {
          aadhaar: memory!.aadhaarNumber,
        },
      },
    );

    if (res?.status === 200 && data) {
      setMemory((prev) => ({ ...prev, transactionId: data.transaction_id }));
      Notify.Success({
        msg: data.detail ?? t("aadhaar_otp_send_success"),
      });
      goTo("verify-aadhaar-with-otp");
    }

    setMemory((prev) => ({ ...prev, isLoading: false }));
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
          className={classNames(
            "ml-2 text-sm font-medium text-gray-600",
            !memory?.validationError && "-mt-4",
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
            label={
              <Trans
                t={t}
                i18nKey={`abha__disclaimer_${i + 1}`}
                values={{ user: formatUsername(user) }}
                components={{
                  input: (
                    <TextFormField
                      type="text"
                      name="name"
                      className="w-48 inline-block"
                      placeholder="Enter beneficiary name"
                      value={memory?.patientName}
                      onChange={(e) =>
                        setMemory((prev) => ({ ...prev, patientName: e.value }))
                      }
                    />
                  ),
                }}
              />
            }
            value={isAccepted}
            onChange={(e) => {
              setDisclaimerAccepted(
                disclaimerAccepted.map((v, j) => (j === i ? e.value : v)),
              );
            }}
            className="mr-2 rounded border-gray-700"
            labelClassName="text-xs text-gray-800"
            errorClassName="hidden"
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <ButtonV2
          className="w-full"
          loading={memory?.isLoading}
          disabled={
            disclaimerAccepted.some((v) => !v) ||
            memory?.aadhaarNumber.length !== 12 ||
            memory?.patientName.length === 0 ||
            memory?.isLoading
          }
          onClick={handleSubmit}
        >
          Verify with Otp
        </ButtonV2>
        {healthFacility?.benefit_name && (
          <ButtonV2
            className="w-full"
            disabled={
              disclaimerAccepted.some((v) => !v) ||
              memory?.aadhaarNumber.length !== 12 ||
              memory?.patientName.length === 0 ||
              memory?.isLoading
            }
            onClick={() => {
              setMemory((prev) => ({
                ...prev,
                transactionId: "",
              }));
              goTo("verify-aadhaar-with-demographics");
            }}
          >
            Verify with Demographics
          </ButtonV2>
        )}
      </div>
    </div>
  );
}

type IVerifyAadhaarWithOtpProps = InjectedStepProps<Memory>;

function VerifyAadhaarWithOtp({
  memory,
  setMemory,
  goTo,
}: IVerifyAadhaarWithOtpProps) {
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

  const handleSubmit = async () => {
    if (!validateMobileNumber()) return;

    setMemory((prev) => ({ ...prev, isLoading: true }));

    const { res, data } = await request(
      routes.healthId.abhaCreateVerifyAadhaarOtp,
      {
        body: {
          otp: otp,
          transaction_id: memory?.transactionId,
          mobile: memory?.mobileNumber.replace("+91", "").replace(/ /g, ""),
        },
      },
    );

    if (res?.status === 200 && data) {
      setMemory((prev) => ({
        ...prev,
        transactionId: data.transaction_id,
        abhaNumber: data.abha_number,
        resendOtpCount: 0,
      }));
      Notify.Success({
        msg: data.detail ?? t("otp_verification_success"),
      });
      goTo("handle-existing-abha");
    }

    setMemory((prev) => ({ ...prev, isLoading: false }));
  };

  const handleResendOtp = async () => {
    setMemory((prev) => ({ ...prev, isLoading: true }));

    const { res, data } = await request(
      routes.healthId.abhaCreateSendAadhaarOtp,
      {
        body: {
          aadhaar: memory!.aadhaarNumber,
          // transaction_id: memory?.transactionId,
        },
        silent: true,
      },
    );

    if (res?.status === 200 && data) {
      setMemory((prev) => ({
        ...prev,
        transactionId: data.transaction_id,
        resendOtpCount: prev.resendOtpCount + 1,
      }));
      Notify.Success({
        msg: data.detail ?? t("aadhaar_otp_send_success"),
      });
    } else {
      setMemory((prev) => ({
        ...prev,
        resendOtpCount: Infinity,
      }));
      Notify.Success({
        msg: t("aadhaar_otp_send_error"),
      });
    }

    setMemory((prev) => ({ ...prev, isLoading: false }));
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
          className={classNames(
            "ml-2 text-sm font-medium text-gray-600",
            !memory?.validationError && "-mt-4",
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
        <ButtonV2
          className="w-full"
          loading={memory?.isLoading}
          disabled={otp.length > 6 || memory?.mobileNumber.length === 0}
          onClick={handleSubmit}
        >
          {t("verify_otp")}
        </ButtonV2>

        {(memory?.resendOtpCount ?? 0) < MAX_OTP_RESEND_ALLOWED && (
          <ButtonWithTimer
            ghost
            className="w-full"
            initialInverval={60}
            onClick={handleResendOtp}
          >
            {t("resend_otp")}
          </ButtonWithTimer>
        )}
      </div>
    </div>
  );
}

type IVerifyAadhaarWithDemographicsProps = InjectedStepProps<Memory> & {
  onSuccess: (abhaNumber: AbhaNumberModel) => void;
};

function VerifyAadhaarWithDemographics({
  memory,
  setMemory,
  onSuccess,
  goTo,
}: IVerifyAadhaarWithDemographicsProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(memory?.patientName ?? "");
  const [gender, setGender] = useState<AbhaNumberModel["gender"]>();
  const [dob, setDob] = useState(new Date().toISOString().slice(0, 10));
  const [districtCode, setDistrictCode] = useState<number>();
  const [stateCode, setStateCode] = useState<number>();
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [mobile, setMobile] = useState("");

  const { data: states } = useQuery(routes.utility.states);
  const { data: districts } = useQuery(routes.utility.districts, {
    pathParams: {
      stateId: stateCode!,
    },
  });

  const validateInput = () => {
    if (!name) {
      setMemory((prev) => ({
        ...prev,
        validationError: "Name is required",
      }));
      return false;
    }

    if (!gender) {
      setMemory((prev) => ({
        ...prev,
        validationError: "Gender is required",
      }));
      return false;
    }

    if (!dob) {
      setMemory((prev) => ({
        ...prev,
        validationError: "Date of birth is required",
      }));
      return false;
    }

    if (!districtCode) {
      setMemory((prev) => ({
        ...prev,
        validationError: "District code is required",
      }));
      return false;
    }

    if (!stateCode) {
      setMemory((prev) => ({
        ...prev,
        validationError: "State code is required",
      }));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;

    setMemory((prev) => ({ ...prev, isLoading: true }));

    const { res, data } = await request(
      routes.healthId.abhaCreateVerifyAadhaarDemographics,
      {
        body: {
          transaction_id: memory?.transactionId || undefined,
          aadhaar: memory!.aadhaarNumber,
          name,
          gender: gender!,
          date_of_birth: dob,
          district_code: districtCode!.toString(),
          state_code: stateCode!.toString(),
          address,
          pin_code: pincode,
          mobile: mobile,
        },
      },
    );

    if (res?.status === 200 && data) {
      setMemory((prev) => ({
        ...prev,
        transactionId: data.transaction_id,
        abhaNumber: data.abha_number,
      }));
      Notify.Success({
        msg: "Aadhaar demographics verified successfully",
      });

      if (!data.transaction_id) {
        onSuccess(data.abha_number);
        return;
      }

      goTo("handle-existing-abha");
    }

    setMemory((prev) => ({ ...prev, isLoading: false }));
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
          className={classNames(
            "ml-2 text-sm font-medium text-gray-600",
            !memory?.validationError && "-mt-4",
          )}
        >
          {t("aadhaar_number_will_not_be_stored")}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <TextFormField
          name="name"
          label="Name"
          inputClassName="text-black tracking-[0.3em] font-bold placeholder:font-normal placeholder:tracking-normal"
          placeholder="Enter your name as per Aadhaar"
          errorClassName="hidden"
          value={name}
          onChange={(e) => {
            setName(e.value);
          }}
          required
        />

        <div className="flex items-center gap-2 max-sm:flex-col">
          <SelectFormField
            name="gender"
            label="Gender"
            className="flex-1 w-full"
            errorClassName="hidden"
            options={[
              { label: "Male", value: "M" },
              { label: "Female", value: "F" },
              { label: "Other", value: "O" },
            ]}
            optionLabel={({ label }) => label}
            optionValue={({ value }) => value}
            value={gender}
            onChange={({ value }) =>
              setGender(value as AbhaNumberModel["gender"])
            }
            required
          />

          <DateFormField
            label="Date of Birth"
            name="date_of_birth"
            className="flex-1 w-full"
            errorClassName="hidden"
            value={new Date(dob)}
            max={new Date()}
            onChange={(e) => {
              setDob(dayjs(e.value).format("YYYY-MM-DD"));
            }}
            required
          />
        </div>

        <div className="flex items-center gap-2 max-sm:flex-col">
          <SelectFormField
            label={t("state")}
            className="flex-1 w-full"
            errorClassName="hidden"
            id="state"
            name="state"
            options={states ?? []}
            optionLabel={(o) => o.state_name}
            optionValue={(o) => o.state_code}
            value={stateCode}
            onChange={({ value }) => setStateCode(value)}
            required
          />

          <SelectFormField
            label={t("district")}
            className="flex-1 w-full"
            errorClassName="hidden"
            id="district"
            name="district"
            options={districts ?? []}
            optionLabel={(o) => o.district_name}
            optionValue={(o) => o.district_code}
            value={districtCode}
            onChange={({ value }) => setDistrictCode(value)}
            required
          />
        </div>

        <TextAreaFormField
          name="address"
          label={t("address")}
          value={address}
          errorClassName="hidden"
          onChange={({ value }) => setAddress(value)}
        />

        <div className="flex items-center gap-2 max-sm:flex-col">
          <TextFormField
            name="pincode"
            label={t("pincode")}
            value={pincode}
            className="flex-1 w-full"
            errorClassName="hidden"
            onChange={({ value }) => setPincode(value)}
          />

          <PhoneNumberFormField
            label={t("mobile_number")}
            labelSuffix={<></>}
            name="mobile_number"
            value={mobile}
            onChange={({ value }) => {
              setMobile(value);
            }}
            className="flex-1 w-full"
            errorClassName="hidden"
            types={["mobile"]}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <ButtonV2
          className="w-full"
          loading={memory?.isLoading}
          disabled={!name || !gender || !dob || !stateCode || !districtCode}
          onClick={handleSubmit}
        >
          Verify Demographics
        </ButtonV2>
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
  goTo,
}: IHandleExistingAbhaNumberProps) {
  const { t } = useTranslation();

  // skip this step for new abha number
  useEffect(() => {
    if (memory?.abhaNumber?.new) {
      goTo("link-mobile");
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
        <ButtonV2
          className="w-full"
          onClick={() => {
            goTo("link-mobile");
          }}
        >
          {t("create_new_abha_address")}
        </ButtonV2>
        <ButtonV2
          variant="secondary"
          className="w-full"
          onClick={() => onSuccess(memory?.abhaNumber as AbhaNumberModel)}
        >
          {t("use_existing_abha_address")}
        </ButtonV2>
        <p className="text-xs text-secondary-800">
          {memory?.abhaNumber?.health_id}
        </p>
      </div>
    </div>
  );
}

type ILinkMobileNumberProps = InjectedStepProps<Memory>;

function LinkMobileNumber({ memory, goTo, setMemory }: ILinkMobileNumberProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (
      memory?.abhaNumber?.mobile ===
      memory?.mobileNumber.replace("+91", "").replace(/ /g, "")
    ) {
      goTo("choose-abha-address");
    }
  }, [memory?.abhaNumber, memory?.mobileNumber]); // eslint-disable-line

  const handleSubmit = async () => {
    setMemory((prev) => ({ ...prev, isLoading: true }));

    const { res, data } = await request(
      routes.healthId.abhaCreateLinkMobileNumber,
      {
        body: {
          mobile: memory?.mobileNumber.replace("+91", "").replace(/ /g, ""),
          transaction_id: memory?.transactionId,
        },
      },
    );

    if (res?.status === 200 && data) {
      setMemory((prev) => ({
        ...prev,
        transactionId: data.transaction_id,
      }));
      Notify.Success({
        msg: data.detail ?? t("mobile_otp_send_success"),
      });
      goTo("verify-mobile");
    }

    setMemory((prev) => ({ ...prev, isLoading: false }));
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
        <ButtonV2
          className="w-full"
          loading={memory?.isLoading}
          onClick={handleSubmit}
        >
          {t("send_otp")}
        </ButtonV2>
      </div>
    </div>
  );
}

type IVerifyMobileNumberProps = InjectedStepProps<Memory>;

function VerifyMobileNumber({
  memory,
  setMemory,
  goTo,
}: IVerifyMobileNumberProps) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");

  const handleSubmit = async () => {
    setMemory((prev) => ({ ...prev, isLoading: true }));

    const { res, data } = await request(
      routes.healthId.abhaCreateVerifyMobileNumber,
      {
        body: {
          transaction_id: memory?.transactionId,
          otp: otp,
        },
      },
    );

    if (res?.status === 200 && data) {
      setMemory((prev) => ({
        ...prev,
        transactionId: data.transaction_id,
        resendOtpCount: 0,
      }));
      Notify.Success({
        msg: data.detail ?? t("mobile_otp_verify_success"),
      });
      goTo("choose-abha-address");
    }

    setMemory((prev) => ({ ...prev, isLoading: false }));
  };

  const handleResendOtp = async () => {
    setMemory((prev) => ({ ...prev, isLoading: true }));

    const { res, data } = await request(
      routes.healthId.abhaCreateLinkMobileNumber,
      {
        body: {
          mobile: memory?.mobileNumber.replace("+91", "").replace(/ /g, ""),
          transaction_id: memory?.transactionId,
        },
      },
    );

    if (res?.status === 200 && data) {
      setMemory((prev) => ({
        ...prev,
        transactionId: data.transaction_id,
        resendOtpCount: prev.resendOtpCount + 1,
      }));
      Notify.Success({
        msg: data.detail ?? t("mobile_otp_send_success"),
      });
    } else {
      setMemory((prev) => ({
        ...prev,
        resendOtpCount: Infinity,
      }));
      Notify.Success({
        msg: t("mobile_otp_send_error"),
      });
    }

    setMemory((prev) => ({ ...prev, isLoading: false }));
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
        <ButtonV2
          className="w-full"
          loading={memory?.isLoading}
          onClick={handleSubmit}
        >
          {t("verify_otp")}
        </ButtonV2>

        {(memory?.resendOtpCount ?? 0) < MAX_OTP_RESEND_ALLOWED && (
          <ButtonWithTimer
            ghost
            className="w-full"
            initialInverval={60}
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

  useEffect(() => {
    const fetchSuggestions = async () => {
      const { res, data } = await request(
        routes.healthId.abhaCreateAbhaAddressSuggestion,
        {
          body: {
            transaction_id: memory?.transactionId,
          },
        },
      );

      if (res?.status === 200 && data) {
        setMemory((prev) => ({ ...prev, transactionId: data.transaction_id }));
        setSuggestions(data.abha_addresses);
      }
    };

    fetchSuggestions();
  }, [healthId, memory?.transactionId, setMemory]);

  const handleSubmit = async () => {
    setMemory((prev) => ({ ...prev, isLoading: true }));

    const { res, data } = await request(
      routes.healthId.abhaCreateEnrolAbhaAddress,
      {
        body: {
          abha_address: healthId,
          transaction_id: memory?.transactionId,
        },
      },
    );

    if (res?.status === 200 && data) {
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
          t("abha_address_validation_length_error"),
        )}
        {validateRule(
          isNaN(Number(healthId[0])) && healthId[0] !== ".",
          t("abha_address_validation_start_error"),
        )}
        {validateRule(
          healthId[healthId.length - 1] !== ".",
          t("abha_address_validation_end_error"),
        )}
        {validateRule(
          /^[0-9a-zA-Z._]+$/.test(healthId),
          t("abha_address_validation_character_error"),
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
        <ButtonV2
          className="w-full"
          disabled={
            memory?.isLoading ||
            !/^(?![\d.])[a-zA-Z0-9._]{4,}(?<!\.)$/.test(healthId)
          }
          onClick={handleSubmit}
        >
          {t("create_abha_address")}
        </ButtonV2>
      </div>
    </div>
  );
}
