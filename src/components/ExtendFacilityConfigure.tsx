import { ExtendFacilityConfigureComponentType } from "@/types/plugable-props";
import { ConfigureHealthFacility } from "./ConfigureHealthFacility";

const ExtendFacilityConfigure: ExtendFacilityConfigureComponentType = ({
  facilityId,
}) => {
  return <ConfigureHealthFacility facilityId={facilityId} />;
};

export default ExtendFacilityConfigure;
