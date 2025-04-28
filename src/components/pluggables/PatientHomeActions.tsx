import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation, useQuery } from "@tanstack/react-query";

import { FC } from "react";
import { LinkAbhaNumber } from "@/components/LinkAbhaNumber";
import { Patient } from "@/types/patient";
import { apis } from "@/apis";
import { toast } from "@/lib/utils";

type PatientHomeActionsProps = {
  patient: Patient;
  facilityId?: string;
  className?: string;
};

const PatientHomeActions: FC<PatientHomeActionsProps> = ({
  patient,
  facilityId,
  className,
}) => {
  const { data: abhaNumber, refetch } = useQuery({
    queryKey: ["abhaNumber", patient.id],
    queryFn: () => apis.abhaNumber.get(patient.id),
    enabled: !!patient.id,
  });

  const { data: healthFacility } = useQuery({
    queryKey: ["healthFacility", facilityId],
    queryFn: () => apis.healthFacility.get(facilityId!),
    enabled: !!facilityId,
  });

  const linkAbhaNumberAndPatientMutation = useMutation({
    mutationFn: apis.healthId.linkAbhaNumberAndPatient,
    onSuccess: (data) => {
      if (data) {
        toast.success(data.detail);
        refetch();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      {!abhaNumber && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="abdm-container">
              <LinkAbhaNumber
                disabled={!healthFacility}
                onSuccess={(abhaNumber) => {
                  linkAbhaNumberAndPatientMutation.mutate({
                    patient: patient.id,
                    abha_number: abhaNumber.external_id,
                  });
                }}
                className={className}
              />
            </TooltipTrigger>
            {!healthFacility && (
              <TooltipContent className="abdm-container">
                <p>
                  Abha linking is disabled for this facility as it doesn't have
                  health facility id configured.
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
};

export default PatientHomeActions;
