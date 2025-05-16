import { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import ButtonV2 from "@/components/Common/ButtonV2";
import DialogModal from "@/components/Common/Dialog";

import { classNames } from "@/Utils/utils";

import { AbhaNumberModel, HealthFacilityModel } from "../../types";
import CreateWithAadhaar from "./CreateWithAadhaar";
import LinkWithOtp from "./LinkWithOtp";

interface ILinkAbhaNumberProps {
  healthFacility?: HealthFacilityModel;
  show: boolean;
  onClose: () => void;
  onSuccess: (abhaNumber: AbhaNumberModel) => void;
}

const ABHA_LINK_OPTIONS = {
  create_with_aadhaar: {
    title: "abha_link_options__create_with_aadhaar__title",
    description: "abha_link_options__create_with_aadhaar__description",
    disabled: false,
    value: "create_with_aadhaar",
    create: true,
  },
  link_with_otp: {
    title: "abha_link_options__link_with_otp__title",
    description: "abha_link_options__link_with_otp__description",
    disabled: false,
    value: "link_with_otp",
    create: false,
  },
};

type LinkAbhaNumberContextValue = {
  healthFacility?: HealthFacilityModel;
};

const LinkAbhaNumberContext = createContext<LinkAbhaNumberContextValue>({});

export default function LinkAbhaNumber({
  healthFacility,
  show,
  onClose,
  onSuccess,
}: ILinkAbhaNumberProps) {
  const { t } = useTranslation();
  const [currentAbhaLinkOption, setCurrentAbhaLinkOption] = useState<
    keyof typeof ABHA_LINK_OPTIONS
  >("create_with_aadhaar");

  return (
    <LinkAbhaNumberContext.Provider value={{ healthFacility }}>
      <DialogModal
        title={t(ABHA_LINK_OPTIONS[currentAbhaLinkOption].title)}
        show={show}
        onClose={onClose}
        className="!max-w-2xl"
      >
        {currentAbhaLinkOption === "create_with_aadhaar" && (
          <CreateWithAadhaar onSuccess={onSuccess} />
        )}

        {currentAbhaLinkOption === "link_with_otp" && (
          <LinkWithOtp onSuccess={onSuccess} />
        )}

        <div className="mt-6">
          <p
            onClick={() =>
              setCurrentAbhaLinkOption(
                ABHA_LINK_OPTIONS[currentAbhaLinkOption].create
                  ? "link_with_otp"
                  : "create_with_aadhaar",
              )
            }
            className="cursor-pointer text-center text-sm text-blue-800"
          >
            {ABHA_LINK_OPTIONS[currentAbhaLinkOption].create
              ? t("link_existing_abha_profile")
              : t("create_new_abha_profile")}
          </p>
        </div>
      </DialogModal>
    </LinkAbhaNumberContext.Provider>
  );
}

export const useLinkAbhaNumberContext = () => {
  const context = useContext(LinkAbhaNumberContext);

  if (!context) {
    throw new Error(
      "useLinkAbhaNumberContext must be used within a LinkAbhaNumberProvider",
    );
  }

  return context;
};
