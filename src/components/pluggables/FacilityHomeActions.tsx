import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Facility } from "@/types/facility";
import { SettingsIcon } from "lucide-react";
import { ConfigureHealthFacilityForm } from "../ConfigureHealthFacilityForm";
import { useQueryClient } from "@tanstack/react-query";
import { I18NNAMESPACE } from "@/lib/constants";

type FacilityHomeActionsProps = {
  facility: Facility;
  className?: string;
};

const FacilityHomeActions: FC<FacilityHomeActionsProps> = ({ facility }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!facility) {
    return null;
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer font-semibold"
          >
            <SettingsIcon />
            {t("configure_health_facility")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md w-[95%] rounded-md">
          <DialogHeader>
            <DialogTitle>{t("configure_health_facility")}</DialogTitle>
            <DialogDescription className="text-start">
              {t("configure_health_facility_description")}
            </DialogDescription>
          </DialogHeader>

          <ConfigureHealthFacilityForm
            facilityId={facility.id}
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ["healthFacility", facility.id],
              });
              setIsDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FacilityHomeActions;
