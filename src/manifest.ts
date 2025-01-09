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
    PatientRegistrationForm: lazy(
      () => import("./components/pluggables/PatientRegistrationForm")
    ),
  },
  navItems: [],
};

export default manifest;
