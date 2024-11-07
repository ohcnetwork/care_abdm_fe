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
    ExtendFacilityConfigure: lazy(
      () => import("./components/ExtendFacilityConfigure"),
    ),
    ExtendPatientRegisterForm: lazy(
      () => import("./components/ExtendPatientRegisterForm"),
    ),
  },
  navItems: [],
  consultationTabs: {
    ABDM: lazy(() => import("./components/ABDMRecordsTab")),
  },
};

export default manifest;
