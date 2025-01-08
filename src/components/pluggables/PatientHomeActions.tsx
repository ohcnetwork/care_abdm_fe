import { apis } from "@/apis";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { LinkAbhaNumber } from "@/components/LinkAbhaNumber";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type PatientHomeActionsProps = {
  patient: {
    id: string;

    [key: string]: unknown;
  };
  className?: string;
};

const PatientHomeActions: FC<PatientHomeActionsProps> = ({
  patient,
  className,
}) => {
  const { t } = useTranslation();

  const { data: abhaNumber, refetch } = useQuery({
    queryKey: ["abhaNumber", patient.id],
    queryFn: () => apis.abhaNumber.get(patient.id),
    enabled: !!patient.id,
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
        <LinkAbhaNumber
          onSuccess={(abhaNumber) => {
            linkAbhaNumberAndPatientMutation.mutate({
              patient: patient.id,
              abha_number: abhaNumber.external_id,
            });
          }}
          className={className}
        />
      )}
    </>
  );
};

export default PatientHomeActions;
