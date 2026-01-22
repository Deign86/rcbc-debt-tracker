import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2, RotateCcw, FileEdit } from "lucide-react";

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal = ({ isOpen, onClose, onConfirm }: ResetModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-strong border-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reset All Data</DialogTitle>
          <DialogDescription className="text-base">
            Are you sure you want to reset all data?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive" className="glass-subtle border-destructive/30 bg-destructive/10 rounded-xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-semibold">
              This action cannot be undone!
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              This will permanently:
            </p>
            <div className="space-y-3 pl-2">
              <div className="flex items-center gap-3 glass-subtle p-3 rounded-xl">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Delete all payment history</p>
              </div>
              <div className="flex items-center gap-3 glass-subtle p-3 rounded-xl">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Reset debt to initial amount</p>
              </div>
              <div className="flex items-center gap-3 glass-subtle p-3 rounded-xl">
                <FileEdit className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Clear all adjustments</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 glass-button border-white/20 dark:border-white/10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 rounded-xl shadow-lg transition-colors"
          >
            Reset All Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
