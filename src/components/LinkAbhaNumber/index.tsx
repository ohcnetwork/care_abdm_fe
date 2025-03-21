import { IdCardIcon } from "lucide-react";
import { FC, useState } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AbhaNumber } from "@/types/abhaNumber";
import { CreateWithAadhaar } from "./CreateWithAadhaar";
import { LinkWithOtp } from "./LinkWithOtp";
import { TooltipComponent } from "../ui/tooltip";

type LinkAbhaNumberProps = ButtonProps & {
  onSuccess: (abhaNumber: AbhaNumber) => void;
  defaultMode?: "new" | "existing";
};

export const LinkAbhaNumber: FC<LinkAbhaNumberProps> = ({
  onSuccess,
  defaultMode = "new",
  ...props
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOnSuccess = (abhaNumber: AbhaNumber) => {
    setIsDrawerOpen(false);
    onSuccess(abhaNumber);
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger>
        <Button {...props}>
          <span>
            <IdCardIcon />
          </span>
          Generate/Link ABHA Number
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="md:mx-auto max-w-screen md:max-w-md max-md:p-4 max-h-svh">
          <DrawerHeader>
            <DrawerTitle>Generate/Link ABHA Number</DrawerTitle>
            <DrawerDescription>
              Generate/link patient's ABHA details for easy access to healthcare
              services.
            </DrawerDescription>
          </DrawerHeader>
          <Tabs defaultValue={defaultMode} orientation="vertical">
            <TabsList className="w-full">
              <TabsTrigger
                className="flex-1 w-1/2 justify-start"
                value="new"
              >
              <TooltipComponent content="Generate new ABHA number" side="top">
                <span className="truncate">Generate new ABHA number</span>
                </TooltipComponent>
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 w-1/2 justify-start"
                value="existing"
              >
              <TooltipComponent content="Link existing ABHA number" side="top">
                <span className="truncate">Link existing ABHA number</span>
              </TooltipComponent>
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
  );
};
