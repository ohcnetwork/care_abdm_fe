import { lazy } from "react";
import routes from "./routes";

const manifest = {
  plugin: "care_abdm",
  routes,
  extends: [],
  components: {
    PatientHomeActions: lazy(
      () => import("./components/pluggables/PatientHomeActions")
    ),
    PatientInfoCardActions: lazy(
      () => import("./components/pluggables/PatientInfoCardActions")
    ),
    FacilityHomeActions: lazy(
      () => import("./components/pluggables/FacilityHomeActions")
    ),
    PatientRegistrationForm: lazy(
      () => import("./components/pluggables/PatientRegistrationForm")
    ),
  },
  navItems: [],
  encounterTabs: {
    abdm: lazy(() => import("./components/encounter-tabs/Abdm")),
  },
};

export default manifest;
