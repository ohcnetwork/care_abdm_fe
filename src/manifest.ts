import { lazy } from "react";
import routes from "./routes";
import { PluginManifest } from "@/pluginTypes";

const manifest: PluginManifest = {
  plugin: "care_abdm",
  routes,
  extends: [],
  components: {
    ConsultationContextEnabler: lazy(
      () => import("./components/ConsultationContextEnabler"),
    ),
    ExtendPatientInfoCard: lazy(
      () => import("./components/ExtendPatientInfoCard"),
    ),
    ManagePatientOptions: lazy(
      () => import("./components/ManagePatientOptions"),
    ),
    ManageFacilityOptions: lazy(
      () => import("./components/ManageFacilityOptions"),
    ),
    // TODO: patient registration form
    // TODO: facility configuration form
  },
  navItems: [],
  consultationTabs: {
    ABDM: lazy(() => import("./components/ABDMRecordsTab")),
  },
};

export default manifest;
