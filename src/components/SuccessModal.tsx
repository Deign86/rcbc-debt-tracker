import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const SuccessModal = ({ isOpen, title, message, onClose }: SuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base">{message}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
