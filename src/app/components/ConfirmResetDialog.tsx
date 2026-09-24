import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';

interface ConfirmResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/** "Start over?" confirmation — Reset wipes every answer and saved progress. */
export function ConfirmResetDialog({ open, onOpenChange, onConfirm }: ConfirmResetDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="!text-xl">Start over?</AlertDialogTitle>
          <AlertDialogDescription className="!text-base">
            This clears all your answers and returns to the first step.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my answers</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Start over</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
