import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Facility } from "@/types/facility";
import { SettingsIcon } from "lucide-react";
import { ConfigureHealthFacilityForm } from "../ConfigureHealthFacilityForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { I18NNAMESPACE } from "@/lib/constants";

type FacilityHomeActionsProps = {
  facility: Facility;
  className?: string;
};

const FacilityHomeActions: FC<FacilityHomeActionsProps> = ({ facility }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  if (!facility) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer font-semibold"
          >
            <SettingsIcon />
            {t("configure_health_facility")}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("configure_health_facility")}</SheetTitle>
            <SheetDescription>
              {t("configure_health_facility_description")}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ConfigureHealthFacilityForm
              facilityId={facility.id}
              onSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: ["healthFacility", facility.id],
                });
                setOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FacilityHomeActions;
