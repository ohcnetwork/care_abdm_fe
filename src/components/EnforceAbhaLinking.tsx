import { useNavigate, useQueryParams } from "raviger";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useConsultation } from "@/components/Facility/ConsultationDetails/ConsultationContext";

import { AbhaNumberModel } from "../types";

export default function EnforceAbhaLinking() {
  const { t } = useTranslation();
  const [qParams, setQParams] = useQueryParams();
  const navigate = useNavigate();
  const { abhaNumber } = useConsultation<{
    abhaNumber?: AbhaNumberModel;
  }>();

  return (
    <Dialog
      open={!abhaNumber && qParams["show_link_abha_number"] !== "true"}
      onOpenChange={() => {}}
    >
      <DialogContent className="sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Abha Linking is Pending</DialogTitle>
          <DialogDescription>
            To continue, please link your Abha number to your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-1 font-medium text-warning-500">
          <CareIcon
            icon="l-exclamation-triangle"
            className="text-base size-4 mt-1"
          />
          <p>
            Linking your Abha number is necessary to access (view or edit) the
            patient's health records and ensure a seamless experience.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6 flex-col w-full">
          <div
            className="bg-primary-600 w-full pointer-events-auto flex cursor-pointer items-center justify-center gap-2 rounded border-0 p-2 text-sm font-normal transition-all duration-200 ease-in-out"
            onClick={() => {
              close();
              setQParams({
                ...qParams,
                show_link_abha_number: "true",
              });
            }}
          >
            <span className="flex w-full items-center justify-center gap-2 text-center text-white">
              <CareIcon icon="l-link" className="text-lg" />
              <p>{t("generate_link_abha")}</p>
            </span>
          </div>

          <div
            className="bg-secondary-400 pointer-events-auto w-full flex cursor-pointer items-center justify-center gap-2 rounded border-0 p-2 text-sm font-normal transition-all duration-200 ease-in-out"
            onClick={() => {
              close();
              navigate("/patients");
            }}
          >
            <span className="flex w-full items-center justify-center gap-2 text-center text-secondary-900">
              <CareIcon icon="l-arrow-left" className="text-lg" />
              <p>Go Back</p>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
