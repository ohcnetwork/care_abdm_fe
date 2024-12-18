import { MenuItem } from "@headlessui/react";
import { useQueryParams } from "raviger";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useConsultation } from "@/components/Facility/ConsultationDetails/ConsultationContext";

import useAuthUser from "@/hooks/useAuthUser";

import { ManagePatientOptionsComponentType } from "@/pluginTypes";

import { AbhaNumberModel, HealthFacilityModel } from "../types";
import { FileInputIcon, LinkIcon, SquareUserIcon } from "lucide-react";
import { triggerGoal } from "@/lib/plausible";

const ManagePatientOptions: ManagePatientOptionsComponentType = ({
  consultation,
}) => {
  const { t } = useTranslation();
  const [qParams, setQParams] = useQueryParams();
  const authUser = useAuthUser();
  const { abhaNumber, healthFacility } = useConsultation<{
    abhaNumber?: AbhaNumberModel;
    healthFacility?: HealthFacilityModel;
  }>();

  if (!consultation) {
    return null;
  }

  return (
    <div>
      {abhaNumber ? (
        <>
          <MenuItem>
            {({ close }) => (
              <>
                <div
                  className="dropdown-item-primary pointer-events-auto m-2 flex cursor-pointer items-center justify-start gap-2 rounded border-0 p-2 text-sm font-normal transition-all duration-200 ease-in-out"
                  onClick={() => {
                    close();
                    setQParams({ ...qParams, show_abha_profile: "true" });
                    triggerGoal("Patient Card Button Clicked", {
                      buttonName: t("show_abha_profile"),
                      consultationId: consultation?.id,
                      userId: authUser?.id,
                    });
                  }}
                >
                  <SquareUserIcon className="text-lg text-primary-500" />
                  <span>{t("show_abha_profile")}</span>
                </div>
                <div
                  className="dropdown-item-primary pointer-events-auto m-2 flex cursor-pointer items-center justify-start gap-2 rounded border-0 p-2 text-sm font-normal transition-all duration-200 ease-in-out"
                  onClick={() => {
                    close();
                    setQParams({ ...qParams, show_fetch_records: "true" });
                    triggerGoal("Patient Card Button Clicked", {
                      buttonName: t("hi__fetch_records"),
                      consultationId: consultation?.id,
                      userId: authUser?.id,
                    });
                  }}
                >
                  <FileInputIcon className="text-lg text-primary-500" />
                  <span>{t("hi__fetch_records")}</span>
                </div>
              </>
            )}
          </MenuItem>
        </>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <MenuItem disabled={!healthFacility}>
                {({ close, disabled }) => (
                  <div
                    className={cn(
                      "dropdown-item-primary pointer-events-auto m-2 flex cursor-pointer items-center justify-start gap-2 rounded border-0 p-2 text-sm font-normal transition-all duration-200 ease-in-out",
                      disabled && "pointer-events-none opacity-30"
                    )}
                    onClick={() => {
                      close();
                      setQParams({
                        ...qParams,
                        show_link_abha_number: "true",
                      });
                    }}
                  >
                    <span className="flex w-full items-center justify-start gap-2">
                      <LinkIcon className="text-lg text-primary-500" />
                      <p>{t("generate_link_abha")}</p>
                    </span>
                  </div>
                )}
              </MenuItem>
            </TooltipTrigger>

            {!healthFacility && (
              <TooltipContent className="max-w-sm break-words text-sm">
                {t("abha_disabled_due_to_no_health_facility")}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ManagePatientOptions;
