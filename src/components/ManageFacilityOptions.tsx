import { useNavigate } from "raviger";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { DropdownItem } from "@/components/Common/Menu";

import { ManageFacilityOptionsComponentType } from "@/pluginTypes";

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
        icon={<CareIcon icon="l-file-network" className="text-lg" />}
      >
        {t("view_abdm_records")}
      </DropdownItem>
    </>
  );
};

export default ManageFacilityOptions;
