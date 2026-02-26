import { GlassCard, MedicalGlassCard } from '@/app/components/GlassCard';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Heart, Package, Settings, Info, Phone, Mail, MessageSquare, CircleDot, ToggleLeft, Sun, Droplets } from 'lucide-react';
import { OptionCard } from '@/app/components/OptionCard';
import { WizardState } from '@/app/hooks/useWizardState';
import type { Product } from '@/app/lib/api';
import { ProgressDots } from '@/app/components/ProgressDots';
import { cn } from '@/app/components/ui/utils';
import { motion, AnimatePresence } from 'motion/react';

const MotionDiv = motion.div;

// Medical-specific action options (all medical products are electrical)
const MEDICAL_ACTIONS = [
  { id: 'momentary', label: 'Momentary', description: 'Active while pressed — ideal for surgical tools', icon: CircleDot },
  { id: 'maintained', label: 'Maintained', description: 'Toggle on/off — for diagnostic and therapy equipment', icon: ToggleLeft },
];

// Medical-specific environment options
const MEDICAL_ENVIRONMENTS = [
  { id: 'any', label: 'Standard Environment', description: 'Standard clinical or office setting', icon: Sun },
  { id: 'wet', label: 'Sterilizable / Washdown', description: 'IP68 rated for OR and sterilization', icon: Droplets },
];

interface MedicalFlowProps {
  wizardState: WizardState;
  products: Product[];
  totalSteps: number;
  onBack: () => void;
  onContinue: () => void;
  onViewStandardProducts: () => void;
  onGeneratePDF: () => void;
  onReset: () => void;
}

// Stock path display: fork(1) + action(2) + environment(3) = 3 steps
const STOCK_DISPLAY_TOTAL = 3;
// Custom path: fork(1) + contact(2) = 2 steps
const CUSTOM_DISPLAY_TOTAL = 2;

export function MedicalFlow({
  wizardState,
  products,
  totalSteps,
  onBack,
  onContinue,
  onViewStandardProducts,
  onGeneratePDF,
  onReset,
}: MedicalFlowProps) {
  // Guard against undefined props in environments like Figma Make
  if (!wizardState || !products) return null;

  const isCustomPath = wizardState.selectedMedicalPath === 'custom';

  // Medical products filtered by application
  const medicalProducts = (products || []).filter(p => p.applications.includes('medical') && p.technology === 'electrical');

  const getActionCount = (actionId: string) =>
    medicalProducts.filter(p => p.actions.includes(actionId)).length;

  const getEnvironmentCount = (envId: string) => {
    const base = medicalProducts.filter(p => p.actions.includes(wizardState.selectedAction));
    if (envId === 'wet') return base.filter(p => p.ip === 'IP68').length;
    return base.length; // 'any' = no filter
  };
  const displayStep = wizardState.step; // fork(1)=1, action(2)=2, environment(3)=3

  const handleForkSelect = (path: 'stock' | 'custom') => {
    wizardState.setSelectedMedicalPath(path);
    setTimeout(onContinue, 200);
  };

  const handleActionSelect = (id: string) => {
    wizardState.setSelectedAction(id);
    setTimeout(onContinue, 150);
  };

  const handleEnvironmentSelect = (id: string) => {
    wizardState.setSelectedEnvironment(id);
    wizardState.setSelectedTechnology('electrical');
    setTimeout(onViewStandardProducts, 150);
  };

  // Stock path progress: steps 2-3 map to dots 0-1 (2 dots)
  const stockProgressStep = wizardState.step - 2;
  const stockProgressTotal = 2;

  const renderStep = () => {
    switch (wizardState.step) {
      case 1: // Fork step - "How would you like to proceed?"
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <GlassCard className="max-w-2xl w-full p-8 md:p-10">
              <div className="text-center mb-6">
                <p className="text-sm font-semibold text-blue-500 tracking-wide mb-2">
                  STEP 1 OF {STOCK_DISPLAY_TOTAL}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  How would you like to proceed?
                </h2>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Medical customers can browse our standard catalog of medical-grade products or configure a fully custom solution tailored to your exact specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" role="radiogroup" aria-label="Choose how to proceed">
                {/* Browse Stock Products */}
                <div
                  onClick={() => handleForkSelect('stock')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleForkSelect('stock'); } }}
                  role="radio"
                  aria-checked={wizardState.selectedMedicalPath === 'stock'}
                  tabIndex={0}
                  className={cn(
                    "relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-200",
                    wizardState.selectedMedicalPath === 'stock'
                      ? "border-blue-500 bg-gradient-to-br from-white to-blue-50/80 dark:from-gray-800 dark:to-blue-950/30 shadow-lg shadow-blue-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-xl w-fit mb-4 transition-colors",
                    wizardState.selectedMedicalPath === 'stock'
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  )}>
                    <Package className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className={cn(
                    "font-semibold text-lg mb-1 transition-colors",
                    wizardState.selectedMedicalPath === 'stock' ? "text-blue-700 dark:text-blue-300" : ""
                  )}>
                    Browse Stock Products
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Explore our existing catalog of medical-grade foot switches
                  </p>
                  {wizardState.selectedMedicalPath === 'stock' && (
                    <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1 text-white" aria-hidden="true">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Configure Custom Solution */}
                <div
                  onClick={() => handleForkSelect('custom')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleForkSelect('custom'); } }}
                  role="radio"
                  aria-checked={wizardState.selectedMedicalPath === 'custom'}
                  tabIndex={0}
                  className={cn(
                    "relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-200",
                    wizardState.selectedMedicalPath === 'custom'
                      ? "border-blue-500 bg-gradient-to-br from-white to-blue-50/80 dark:from-gray-800 dark:to-blue-950/30 shadow-lg shadow-blue-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-xl w-fit mb-4 transition-colors",
                    wizardState.selectedMedicalPath === 'custom'
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  )}>
                    <Settings className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className={cn(
                    "font-semibold text-lg mb-1 transition-colors",
                    wizardState.selectedMedicalPath === 'custom' ? "text-blue-700 dark:text-blue-300" : ""
                  )}>
                    Configure Custom Solution
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Design a custom medical-grade footswitch to your specifications
                  </p>
                  {wizardState.selectedMedicalPath === 'custom' && (
                    <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1 text-white" aria-hidden="true">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                  Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  Select an option to continue
                </span>
              </div>
            </GlassCard>
          </div>
        );

      case 2:
        // Custom path: Contact / Engineering page
        if (isCustomPath) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="max-w-2xl w-full space-y-6">
                <MedicalGlassCard className="p-8 md:p-10">
                  <div className="text-center space-y-4 mb-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-red-600" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      Custom Medical Solution
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      Our engineering team specializes in designing custom medical-grade foot controls
                      tailored to your exact specifications, including compliance with IEC 60601 and other regulatory requirements.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 rounded-xl bg-red-50/50 dark:bg-red-900/30">
                      <Phone className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-medium text-foreground">Call Us</p>
                      <p className="text-xs text-muted-foreground mt-1">(203) 484-3400</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-red-50/50 dark:bg-red-900/30">
                      <Mail className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-xs text-muted-foreground mt-1">sales@linemaster.com</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-red-50/50 dark:bg-red-900/30">
                      <MessageSquare className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-medium text-foreground">Request Quote</p>
                      <p className="text-xs text-muted-foreground mt-1">Online form</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white px-8"
                      onClick={() => window.location.href = 'https://linemaster.com/contact'}
                    >
                      Contact Engineering Team
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        wizardState.setSelectedMedicalPath('stock');
                        // Stay on step 2, which now renders action selection
                      }}
                    >
                      Browse Stock Products Instead
                    </Button>
                  </div>
                </MedicalGlassCard>

                <div className="flex justify-center">
                  <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                    Back to options
                  </Button>
                </div>
              </div>
            </div>
          );
        }

        // Stock path: Action Selection
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">
                Action Type
              </h2>
              <p className="text-muted-foreground">How should the foot switch activate?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {MEDICAL_ACTIONS.map((action, i) => (
                <OptionCard
                  key={action.id}
                  id={action.id}
                  label={action.label}
                  description={action.description}
                  icon={action.icon}
                  selected={wizardState.selectedAction === action.id}
                  count={getActionCount(action.id)}
                  onClick={() => handleActionSelect(action.id)}
                  index={i}
                />
              ))}
            </div>
          </div>
        );

      case 3: // Stock path: Environment Selection
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">
                Operating Environment
              </h2>
              <p className="text-muted-foreground">Where will the foot switch be used?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {MEDICAL_ENVIRONMENTS.map((env, i) => (
                <OptionCard
                  key={env.id}
                  id={env.id}
                  label={env.label}
                  description={env.description}
                  icon={env.icon}
                  selected={wizardState.selectedEnvironment === env.id}
                  count={getEnvironmentCount(env.id)}
                  onClick={() => handleEnvironmentSelect(env.id)}
                  index={i}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Fork step and custom contact have their own self-contained layout
  if (wizardState.step === 1 || (wizardState.step === 2 && isCustomPath)) {
    return (
      <div className="min-h-screen mesh-gradient-light dark:bg-gradient-to-b dark:from-gray-900 dark:to-black relative">
        <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={`${wizardState.step}-${wizardState.selectedMedicalPath}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Steps 2-3 (stock path): Simplified medical wizard layout
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/30 to-white dark:from-gray-900 dark:to-black relative">
      <div className="container mx-auto px-4 py-8 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={onBack} title="Back" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold tracking-widest text-red-500 uppercase">Medical Division</span>
            <span className="text-xs text-muted-foreground mt-1">
              Step {displayStep} of {STOCK_DISPLAY_TOTAL}
            </span>
            <ProgressDots currentStep={stockProgressStep} totalSteps={stockProgressTotal} />
          </div>
          <div className="w-10" />
        </div>

        {/* Content Area with Animation */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={wizardState.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </MotionDiv>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t z-50">
          <div className="container mx-auto max-w-4xl flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={onBack}
            >
              Back
            </Button>

            {wizardState.step === 2 && (
              <Button
                onClick={onContinue}
                className="bg-red-600 hover:bg-red-700 text-white px-8"
                disabled={!wizardState.selectedAction}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            )}

            {wizardState.step === 3 && (
              <Button
                onClick={() => {
                  wizardState.setSelectedTechnology('electrical');
                  onViewStandardProducts();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-8"
                disabled={!wizardState.selectedEnvironment}
              >
                View Results
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
