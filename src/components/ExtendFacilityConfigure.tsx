import { ExtendFacilityConfigureComponentType } from "@/pluginTypes";
import { ConfigureHealthFacility } from "./ConfigureHealthFacility";

const ExtendFacilityConfigure: ExtendFacilityConfigureComponentType = ({
  facilityId,
}) => {
  return <ConfigureHealthFacility facilityId={facilityId} />;
};

export default ExtendFacilityConfigure;
