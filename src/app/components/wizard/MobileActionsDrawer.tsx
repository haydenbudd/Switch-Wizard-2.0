import { ArrowLeft, Mail, Link, Download, RefreshCw } from 'lucide-react';
import type { AnchorHTMLAttributes } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/app/components/ui/drawer';

/**
 * Phone-only actions menu on the results page. Lazy-loaded by ResultsPage
 * the first time it opens, so the drawer library (vaul) stays out of the
 * initial bundle.
 */
export default function MobileActionsDrawer({
  open,
  onOpenChange,
  resultCount,
  showShareActions,
  quoteLink,
  onBack,
  onCopyLink,
  onDownloadPDF,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultCount: number;
  showShareActions: boolean;
  quoteLink: AnchorHTMLAttributes<HTMLAnchorElement>;
  onBack: () => void;
  onCopyLink: () => void;
  onDownloadPDF: () => void;
  onReset: () => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Actions</DrawerTitle>
          <DrawerDescription>{resultCount} products found</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 p-4 pb-8">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full gap-2 justify-start" onClick={onBack}>
              <ArrowLeft className="w-6 h-6" /> Go Back
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button asChild className="w-full gap-2 justify-start">
              <a {...quoteLink}><Mail className="w-6 h-6" /> Request a Quote</a>
            </Button>
          </DrawerClose>
          {showShareActions && (
            <>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={onCopyLink}>
                  <Link className="w-6 h-6" /> Copy Share Link
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={onDownloadPDF}>
                  <Download className="w-6 h-6" /> Download PDF
                </Button>
              </DrawerClose>
            </>
          )}
          <DrawerClose asChild>
            <Button variant="outline" className="w-full gap-2 justify-start !text-destructive" onClick={onReset}>
              <RefreshCw className="w-6 h-6" /> Reset Wizard
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
