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
import { cn } from "@/lib/utils";
import { Facility } from "@/types/facility";
import { SettingsIcon } from "lucide-react";
import { ConfigureHealthFacilityForm } from "../ConfigureHealthFacilityForm";
import { useQueryClient } from "@tanstack/react-query";
import { I18NNAMESPACE } from "@/lib/constants";

type FacilityHomeActionsProps = {
  facility: Facility;
  className?: string;
};

const FacilityHomeActions: FC<FacilityHomeActionsProps> = ({
  facility,
  className,
}) => {
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
          <Button variant="outline" className={cn("cursor-pointer", className)}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            {t("configure_health_facility")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("configure_health_facility")}</DialogTitle>
            <DialogDescription>
              {t("configure_health_facility_description")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <ConfigureHealthFacilityForm
              facilityId={facility.id}
              onSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: ["healthFacility", facility.id],
                });
                setIsDialogOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FacilityHomeActions;
