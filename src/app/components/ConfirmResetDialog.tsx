import { useRef } from 'react';
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
  const confirmRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="rounded-2xl"
        // Focus "Start over" (Radix focuses Cancel by default), so Enter
        // confirms. Escape still keeps the answers.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          confirmRef.current?.focus();
        }}
      >
        <AlertDialogHeader className="sm:text-center">
          <AlertDialogTitle className="!text-xl">Start over?</AlertDialogTitle>
          <AlertDialogDescription className="!text-base">
            This clears all your answers and returns to the first step.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* Centered under the centered text (the default footer is right-aligned) */}
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel>Keep my answers</AlertDialogCancel>
          <AlertDialogAction ref={confirmRef} onClick={onConfirm}>Start over</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
