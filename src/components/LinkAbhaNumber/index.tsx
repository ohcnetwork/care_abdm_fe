import { Button, ButtonProps } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createContext, FC, useState, useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AbhaNumber } from "@/types/abhaNumber";
import { CreateWithAadhaar } from "./CreateWithAadhaar";
import { IdCardIcon } from "lucide-react";
import { LinkWithOtp } from "./LinkWithOtp";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apis } from "@/apis";
import { useQuery } from "@tanstack/react-query";
import { HealthFacility } from "@/types/healthFacility";
import { User } from "@/types/user";

type LinkAbhaNumberContextValue = {
  healthFacility?: HealthFacility;
  currentUser?: User;
};

const LinkAbhaNumberContext = createContext<LinkAbhaNumberContextValue>({});

type LinkAbhaNumberProps = ButtonProps & {
  facilityId?: string;
  onSuccess: (abhaNumber: AbhaNumber) => void;
  defaultMode?: "new" | "existing";
};

export const LinkAbhaNumber: FC<LinkAbhaNumberProps> = ({
  facilityId,
  onSuccess,
  defaultMode = "new",
  ...props
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOnSuccess = (abhaNumber: AbhaNumber) => {
    setIsDrawerOpen(false);
    onSuccess(abhaNumber);
  };

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: apis.user.getCurrentUser,
  });

  const { data: healthFacility } = useQuery({
    queryKey: ["healthFacility", facilityId],
    queryFn: () => apis.healthFacility.get(facilityId!),
    enabled: !!facilityId,
  });

  return (
    <LinkAbhaNumberContext.Provider
      value={{
        healthFacility,
        currentUser,
      }}
    >
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger disabled={!healthFacility} className="abdm-container">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="abdm-container">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsDrawerOpen(true);
                  }}
                  disabled={!healthFacility}
                  {...props}
                >
                  <span>
                    <IdCardIcon />
                  </span>
                  Generate/Link ABHA Number
                </Button>
              </TooltipTrigger>
              {!healthFacility && (
                <TooltipContent className="abdm-container">
                  <p>
                    Abha linking is disabled for this facility as it doesn't
                    have health facility id configured.
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DrawerTrigger>
        <DrawerContent className="abdm-container">
          <div className="md:mx-auto max-w-screen md:max-w-md max-md:p-4 max-h-svh">
            <DrawerHeader>
              <DrawerTitle>Generate/Link ABHA Number</DrawerTitle>
              <DrawerDescription>
                Generate/link patient's ABHA details for easy access to
                healthcare services.
              </DrawerDescription>
            </DrawerHeader>
            <Tabs defaultValue={defaultMode} orientation="vertical">
              <TabsList className="w-full">
                <TabsTrigger
                  className="flex-1 w-1/2 truncate justify-start"
                  value="new"
                >
                  Generate new ABHA number
                </TabsTrigger>
                <TabsTrigger
                  className="flex-1 w-1/2 truncate justify-start"
                  value="existing"
                >
                  Link existing ABHA number
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="h-96 pb-6 pr-3">
                <TabsContent value="new">
                  <CreateWithAadhaar onSuccess={handleOnSuccess} />
                </TabsContent>
                <TabsContent value="existing">
                  <LinkWithOtp onSuccess={handleOnSuccess} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>
    </LinkAbhaNumberContext.Provider>
  );
};

export const useLinkAbhaNumberContext = () => {
  const context = useContext(LinkAbhaNumberContext);

  if (!context) {
    throw new Error(
      "useLinkAbhaNumberContext must be used within a LinkAbhaNumberProvider"
    );
  }

  return context;
};
