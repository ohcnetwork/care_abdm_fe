"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FC, useEffect, useMemo } from "react";
import { apis } from "@/apis";
import { toast } from "sonner";
import { HealthFacility } from "@/types/healthFacility";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { I18NNAMESPACE } from "@/lib/constants";

type ConfigureHealthFacilityFormProps = {
  facilityId: string;
  onSuccess?: (data: HealthFacility) => void;
};

export const ConfigureHealthFacilityForm: FC<
  ConfigureHealthFacilityFormProps
> = ({ facilityId, onSuccess }) => {
  const { t } = useTranslation(I18NNAMESPACE);

  const formSchema = useMemo(
    () =>
      z.object({
        hf_id: z.string().min(1, {
          message: t("health_facility__validation__hf_id_required"),
        }),
      }),
    []
  );

  const { data: healthFacility, refetch } = useQuery({
    queryKey: ["healthFacility", facilityId],
    queryFn: () => apis.healthFacility.get(facilityId),
    enabled: !!facilityId,
  });

  useEffect(() => {
    if (healthFacility) {
      form.setValue("hf_id", healthFacility.hf_id);
    }
  }, [healthFacility]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hf_id: "",
    },
  });

  const handleError = (error: Error) => {
    toast.error(error?.message || t("health_facility__config_update_error"));
  };

  const handleUpdate = (data: HealthFacility) => {
    if (data?.registered) {
      toast.success(t("health_facility__config_update_success"));
      refetch();
      onSuccess?.(data);
    } else {
      toast.warning(
        data?.detail || t("health_facility__config_registration_error")
      );
      refetch();
      onSuccess?.(data);
    }
  };

  const registerHealthFacilityAsServiceMutation = useMutation({
    mutationFn: () => apis.healthFacility.registerAsService(facilityId),
    onSuccess: handleUpdate,
    onError: handleError,
  });

  const updateHealthFacilityMutation = useMutation({
    mutationFn: (body: Partial<HealthFacility>) =>
      apis.healthFacility.partialUpdate(facilityId, body),
    onSuccess: handleUpdate,
    onError: handleError,
  });

  const createHealthFacilityMutation = useMutation({
    mutationFn: apis.healthFacility.create,
    onSuccess: handleUpdate,
    onError: handleError,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.hf_id === healthFacility?.hf_id) {
      registerHealthFacilityAsServiceMutation.mutate();
    } else if (healthFacility) {
      updateHealthFacilityMutation.mutate({
        hf_id: values.hf_id,
      });
    } else {
      createHealthFacilityMutation.mutate({
        facility: facilityId,
        hf_id: values.hf_id,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <FormField
          control={form.control}
          name="hf_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("health_facility__hf_id")}</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input {...field} />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className={
                            healthFacility?.registered
                              ? "text-primary-500"
                              : "text-warning-500"
                          }
                        >
                          {healthFacility?.registered ? (
                            <CircleCheckIcon className="size-6" />
                          ) : (
                            <CircleAlertIcon className="size-6" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {healthFacility?.registered ? (
                          <div className="flex flex-col gap-2">
                            <span>
                              {t("health_facility__registered_1.1")}{" "}
                              <strong>
                                {t("health_facility__registered_1.2")}
                              </strong>
                            </span>
                            <span className="text-green-500">
                              {t("health_facility__registered_2")}
                            </span>
                            <span>{t("health_facility__registered_3")}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <span>
                              {t("health_facility__not_registered_1.1")}{" "}
                              <strong>
                                {t("health_facility__not_registered_1.2")}
                              </strong>
                            </span>
                            <span className="text-warning">
                              {t("health_facility__not_registered_2")}
                            </span>
                            <span>
                              {t("health_facility__not_registered_3")}
                            </span>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={
            form.watch("hf_id") === healthFacility?.hf_id &&
            healthFacility?.registered
          }
          loading={
            registerHealthFacilityAsServiceMutation.isPending ||
            updateHealthFacilityMutation.isPending ||
            createHealthFacilityMutation.isPending
          }
        >
          {t("health_facility__link")}
        </Button>
      </form>
    </Form>
  );
};
