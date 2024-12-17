import { useTranslation } from "react-i18next";
import { AbhaNumberModel, ABHAQRContent } from "../../types";
import * as Notification from "@/lib/notify";

import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useMutation } from "@tanstack/react-query";
import apis from "../../api";

type ILoginWithQrProps = {
  onSuccess: (abhaNumber: AbhaNumberModel) => void;
};

export default function LinkWithQr({ onSuccess }: ILoginWithQrProps) {
  const { t } = useTranslation();

  const createAbhaNumberMutation = useMutation({
    mutationFn: apis.abhaNumber.create,
    onSuccess,
  });

  return (
    <div>
      <Scanner
        onScan={async (detectedCodes: IDetectedBarcode[]) => {
          if (detectedCodes.length === 0) return;

          const scannedValue = detectedCodes[0].rawValue;
          if (!scannedValue || createAbhaNumberMutation.isPending) return;

          try {
            const qrData = JSON.parse(scannedValue) as ABHAQRContent;

            createAbhaNumberMutation.mutate({
              abha_number: qrData.hidn,
              health_id: qrData.hid || qrData.phr,
              name: qrData.name,
              gender: qrData.gender,
              date_of_birth: qrData.dob,
              address: qrData.address,
              district: qrData.district_name || qrData["dist name"],
              state: qrData.state_name || qrData["state name"],
              mobile: qrData.mobile,
            });
          } catch (e) {
            Notification.Error({
              msg: t("abha__qr_scanning_error"),
            });
          }
        }}
        onError={(e: unknown) => {
          const errorMessage = e instanceof Error ? e.message : "Unknown error";
          Notification.Error({
            msg: errorMessage,
          });
        }}
        scanDelay={3000}
        constraints={{
          facingMode: "environment",
        }}
      />
    </div>
  );
}
