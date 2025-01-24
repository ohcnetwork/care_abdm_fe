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

type FacilityHomeActionsProps = {
  facility: Facility;
  className?: string;
};

const FacilityHomeActions: FC<FacilityHomeActionsProps> = ({
  facility,
  className,
}) => {
  const { t } = useTranslation();
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
            variant="ghost"
            className={cn(
              "w-full justify-start relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 dark:focus:bg-gray-800 dark:focus:text-gray-50",
              className
            )}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            {t("configure_health_facility")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] z-50" autoFocus>
          <DialogHeader>
            <DialogTitle>{t("configure_health_facility")}</DialogTitle>
            <DialogDescription>
              {t("configure_health_facility_description")}
            </DialogDescription>

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
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FacilityHomeActions;
