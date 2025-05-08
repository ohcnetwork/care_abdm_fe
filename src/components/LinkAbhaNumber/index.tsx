import { Button, ButtonProps } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { FC, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AbhaNumber } from "@/types/abhaNumber";
import { CreateWithAadhaar } from "./CreateWithAadhaar";
import { IdCardIcon } from "lucide-react";
import { LinkWithOtp } from "./LinkWithOtp";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <DrawerTrigger disabled={props.disabled} className="abdm-container">
        <Button
          {...props}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDrawerOpen(true);
          }}
        >
          <span>
            <IdCardIcon />
          </span>
          Generate/Link ABHA Number
        </Button>
      </DrawerTrigger>
      <DrawerContent className="abdm-container">
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
  );
};
