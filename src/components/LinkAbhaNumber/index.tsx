import { IdCardIcon } from "lucide-react";
import { FC, useState } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AbhaNumber } from "@/types/abhaNumber";
import { CreateWithAadhaar } from "./CreateWithAadhaar";
import { LinkWithOtp } from "./LinkWithOtp";
import { TooltipComponent } from "../ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

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
    <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DialogTrigger>
        <Button {...props}>
          <span>
            <IdCardIcon />
          </span>
          Generate/Link ABHA Number
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="h-full w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate/Link ABHA Number</DialogTitle>
            <DialogDescription>
              Generate/link patient's ABHA details for easy access to healthcare
              services.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue={defaultMode} orientation="vertical" className="flex flex-wrap">
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
      </DialogContent>
    </Dialog>
  );
};
