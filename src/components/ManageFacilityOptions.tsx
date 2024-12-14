import { useNavigate } from "raviger";
import { useTranslation } from "react-i18next";

import { DropdownItem } from "@/components/Common/Menu";

import { ManageFacilityOptionsComponentType } from "@/pluginTypes";
import { FileInputIcon } from "lucide-react";

const ManageFacilityOptions: ManageFacilityOptionsComponentType = ({
  facility,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!facility) {
    return null;
  }

  return (
    <>
      <DropdownItem
        id="view-abdm-records"
        onClick={() => navigate(`/facility/${facility.id}/abdm`)}
        icon={<FileInputIcon className="text-lg" />}
      >
        {t("view_abdm_records")}
      </DropdownItem>
    </>
  );
};

export default ManageFacilityOptions;
