import {
  ConsultationModel,
  FacilityModel,
  PatientMeta,
  PatientModel,
} from "./external";

import { AbhaNumberModel } from ".";
import { FormContextValue } from "@/components/Form/FormContext";
import { LazyExoticComponent } from "react";

type LazyComponent<T extends React.FC<any>> = LazyExoticComponent<T>;

export type SupportedPluginComponents = {
  ExtendPatientInfoCard: ExtendPatientInfoCardComponentType;
  ManagePatientOptions: ManagePatientOptionsComponentType;
  ManageFacilityOptions: ManageFacilityOptionsComponentType;
  ConsultationContextEnabler: React.FC;
  ExtendFacilityConfigure: ExtendFacilityConfigureComponentType;
  ExtendPatientRegisterForm: ExtendPatientRegisterFormComponentType;
};

export type PluginComponentMap = {
  [K in keyof SupportedPluginComponents]?: LazyComponent<
    SupportedPluginComponents[K]
  >;
};

type SupportedPluginExtensions =
  | "DoctorConnectButtons"
  | "PatientExternalRegistration";

export interface INavItem {
  text: string;
  to?: string;
  icon: string;
}

export type RouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof RouteParams<Rest>]: string }
    : T extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;

export type RouteFunction<T extends string> = (
  params: RouteParams<T>
) => JSX.Element;

export type AppRoutes = {
  [K in string]: RouteFunction<K>;
};

export interface ConsultationTabProps {
  consultationId: string;
  facilityId: string;
  patientId: string;
  consultationData: ConsultationModel;
  patientData: PatientModel;
}

export type PluginManifest = {
  plugin: string;
  routes: AppRoutes;
  extends: SupportedPluginExtensions[];
  components: PluginComponentMap;
  navItems: INavItem[];
  consultationTabs?: Record<
    string,
    LazyComponent<React.FC<ConsultationTabProps>>
  >;
};

export type ExtendFacilityConfigureComponentType = React.FC<{
  facilityId: string;
}>;

export type ExtendPatientInfoCardComponentType = React.FC<{
  patient: PatientModel;
  consultation?: ConsultationModel;
  fetchPatientData?: (state: { aborted: boolean }) => void;
  activeShiftingData: any;
  consultationId: string;
  consultationContext: {
    abhaNumber?: AbhaNumberModel;
  }; // TODO: use ConsultationContext type
}>;

export type PatientForm = PatientModel &
  PatientMeta & { age?: number; is_postpartum?: boolean };

export type ExtendPatientRegisterFormComponentType = React.FC<{
  facilityId: string;
  patientId?: string;
  state: {
    form: {
      [key: string]: any;
    };
    errors: {
      [key: string]: string;
    };
  };
  dispatch: React.Dispatch<any>;
  field: FormContextValue<PatientForm>;
}>;

export type ManageFacilityOptionsComponentType = React.FC<{
  facility?: FacilityModel;
}>;

export type ManagePatientOptionsComponentType = React.FC<{
  consultation: ConsultationModel | undefined;
  patient: PatientModel;
}>;
