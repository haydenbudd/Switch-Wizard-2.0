import { useMemo } from 'react';
import { GlassCard, MedicalGlassCard } from '@/app/components/GlassCard';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, Check, Heart, Package, Settings, Info, Phone, Mail, MessageSquare, CircleDot, ToggleLeft, Sun, Droplets, ChevronLeft, Download, ExternalLink } from 'lucide-react';
import { OptionCard } from '@/app/components/OptionCard';
import { WizardState } from '@/app/hooks/useWizardState';
import type { Product } from '@/app/lib/api';
import { cn } from '@/app/components/ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '@/app/components/Header';
import {
  pedalDesigns,
  NumberIcon,
  BUILDER_STEP_CONFIGS,
  optionLabel,
} from '@/app/data/options';
import type { Option } from '@/app/data/options';

const MotionDiv = motion.div;

const CRESCENT_IMAGE = 'https://linemaster.com/wp-content/uploads/2025/04/neuro-and-ent-1-optimized.png';
const AERO_IMAGE = 'https://linemaster.com/wp-content/uploads/2025/04/electro-surgical-cardiac-2-optimized.png';

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

// Custom builder steps (after fork):
// channel(2) + pedal(3) + buttons(4) + output(5) + wired(6) + toe(7) + treadle(8, aero only) + labeling(9) + LEDs(10) + summary(11)
const CUSTOM_BUILDER_STEPS = 10; // 10 steps for Aero, 9 for Crescent (skip treadle)

// Map from raw wizard step to builder display step, accounting for treadle skip
function getCustomDisplayStep(rawStep: number, channel: string): number {
  // Steps 2-11 map to builder display steps 1-10
  const builderStep = rawStep - 1; // step 2 → display 1, step 3 → display 2, etc.
  if (channel === 'crescent' && rawStep > 8) {
    return builderStep - 1; // shift down by 1 after treadle skip
  }
  return builderStep;
}

function getCustomDisplayTotal(channel: string): number {
  return channel === 'crescent' ? CUSTOM_BUILDER_STEPS - 1 : CUSTOM_BUILDER_STEPS;
}

// Get max button count based on channel and pedal design
function getMaxButtons(channel: string, pedalDesign: string): number {
  if (channel === 'crescent') return 3;
  // Aero channel: depends on pedal design
  switch (pedalDesign) {
    case 'single': return 2;
    case 'twin': return 3;
    case 'triple': return 4;
    default: return 2;
  }
}

// Setter keys on WizardState, keyed by stateKey for dynamic lookup
const SETTER_MAP: Record<string, string> = {
  selectedPedalDesign: 'setSelectedPedalDesign',
  selectedOutputType: 'setSelectedOutputType',
  selectedWiredWireless: 'setSelectedWiredWireless',
  selectedToeLoop: 'setSelectedToeLoop',
  selectedTreadleType: 'setSelectedTreadleType',
  selectedCustomLabeling: 'setSelectedCustomLabeling',
  selectedLEDs: 'setSelectedLEDs',
};

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

  // ── Custom builder handlers ──

  const handleBuilderSelect = (setter: (id: string) => void, id: string) => {
    setter(id);
    setTimeout(onContinue, 150);
  };

  // Generate button count options based on channel + pedal (memoized to stabilize NumberIcon refs)
  const maxButtons = getMaxButtons(wizardState.selectedChannel, wizardState.selectedPedalDesign);
  const buttonCountOptions = useMemo(() =>
    Array.from({ length: maxButtons }, (_, i) => ({
      id: String(i + 1),
      label: `${i + 1} Button${i > 0 ? 's' : ''}`,
      description: `${i + 1} button${i > 0 ? 's' : ''} per pedal.`,
      icon: NumberIcon(i + 1),
    })),
    [maxButtons],
  );

  // ── Generic option step renderer ──

  const renderOptionStep = (title: string, subtitle: string, options: Option[], columns: number, selectedValue: string, setter: (id: string) => void) => (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">
          {title}
        </h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className={cn(
        "grid gap-6 max-w-3xl mx-auto",
        columns <= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"
      )}>
        {options.map((opt, i) => (
          <OptionCard
            key={opt.id}
            label={opt.label}
            description={opt.description}
            icon={opt.icon}
            selected={selectedValue === opt.id}
            onClick={() => handleBuilderSelect(setter, opt.id)}
            index={i}
          />
        ))}
      </div>
    </div>
  );

  // ── Render builder step content ──

  const renderBuilderStep = () => {
    switch (wizardState.step) {
      case 2: // Channel selection
        {
          const channelCards = [
            { id: 'crescent', label: 'Crescent Channel', description: 'Classic ergonomic housing with curved profile.', image: CRESCENT_IMAGE },
            { id: 'aero', label: 'Aero Channel', description: 'Low-profile, streamlined design.', image: AERO_IMAGE },
          ];
          return (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">
                  Select Channel Type
                </h2>
                <p className="text-muted-foreground">Choose the housing style for your custom footswitch.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {channelCards.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => handleBuilderSelect(wizardState.setSelectedChannel, ch.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBuilderSelect(wizardState.setSelectedChannel, ch.id); } }}
                    role="radio"
                    aria-checked={wizardState.selectedChannel === ch.id}
                    tabIndex={0}
                    className={cn(
                      "group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200",
                      wizardState.selectedChannel === ch.id
                        ? "border-red-500 shadow-lg shadow-red-500/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md"
                    )}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={ch.image}
                        alt={ch.label}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className={cn(
                        "font-semibold text-lg mb-1 transition-colors",
                        wizardState.selectedChannel === ch.id ? "text-red-600 dark:text-red-400" : "text-foreground"
                      )}>
                        {ch.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{ch.description}</p>
                    </div>
                    {wizardState.selectedChannel === ch.id && (
                      <div className="absolute top-3 right-3 bg-red-500 rounded-full p-1.5 text-white shadow-md" aria-hidden="true">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

      case 4: // Number of buttons (special — dynamic options)
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">
                Number of Buttons
              </h2>
              <p className="text-muted-foreground">
                How many buttons per pedal?
                {wizardState.selectedChannel === 'aero' && (
                  <span className="block text-xs mt-1 text-red-400">
                    Aero {wizardState.selectedPedalDesign} supports up to {maxButtons} button{maxButtons > 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
            <div className={cn(
              "grid gap-6 max-w-3xl mx-auto",
              buttonCountOptions.length <= 2 ? "grid-cols-1 md:grid-cols-2" :
              buttonCountOptions.length === 4 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"
            )}>
              {buttonCountOptions.map((opt, i) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  description={opt.description}
                  icon={opt.icon}
                  selected={wizardState.selectedButtonCount === opt.id}
                  onClick={() => handleBuilderSelect(wizardState.setSelectedButtonCount, opt.id)}
                  index={i}
                />
              ))}
            </div>
          </div>
        );

      case 11: // Summary
        return renderSummary();

      default: {
        // Data-driven steps (3, 5-10) — looked up from BUILDER_STEP_CONFIGS
        const cfg = BUILDER_STEP_CONFIGS.find(c => c.step === wizardState.step);
        if (!cfg) return null;
        const selectedValue = wizardState[cfg.stateKey as keyof WizardState] as string;
        const setterKey = SETTER_MAP[cfg.stateKey];
        const setter = setterKey ? (wizardState as Record<string, unknown>)[setterKey] as (id: string) => void : undefined;
        if (!setter) return null;
        return renderOptionStep(cfg.title, cfg.subtitle, cfg.options, cfg.columns, selectedValue, setter);
      }
    }
  };

  // ── Summary page ──

  const renderSummary = () => {
    const configEntries: { label: string; value: string }[] = [];

    // Channel + button count are special; the rest come from BUILDER_STEP_CONFIGS
    const channelVal = wizardState.selectedChannel;
    if (channelVal) {
      const channelLabel = channelVal === 'crescent' ? 'Crescent Channel' : 'Aero Channel';
      configEntries.push({ label: 'Channel', value: channelLabel });
    }

    for (const cfg of BUILDER_STEP_CONFIGS) {
      if (cfg.aeroOnly && wizardState.selectedChannel !== 'aero') continue;
      const val = wizardState[cfg.stateKey as keyof WizardState] as string;
      if (val) configEntries.push({ label: cfg.summaryLabel, value: optionLabel(cfg.options, val) });
    }

    // Button count (step 4, not in BUILDER_STEP_CONFIGS since it's dynamic)
    const btnVal = wizardState.selectedButtonCount;
    if (btnVal) {
      // Insert after pedal design (index 1) for logical ordering
      const insertIdx = configEntries.findIndex(e => e.label === 'Pedal Design');
      configEntries.splice(insertIdx + 1, 0, { label: 'Number of Buttons', value: btnVal });
    }

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-red-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">
            Your Custom Switch Configuration
          </h2>
          <p className="text-muted-foreground">Review your selections below.</p>
        </div>

        <MedicalGlassCard className="p-6 md:p-8">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {configEntries.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </MedicalGlassCard>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-6"
            onClick={onGeneratePDF}
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Download Summary (PDF)
          </Button>
          <Button
            variant="outline"
            className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => window.open('https://linemaster.com/contact', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
            Contact Engineering Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="text-center p-4 rounded-xl bg-red-50/50 dark:bg-red-900/30">
            <Phone className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Call Us</p>
            <p className="text-xs text-muted-foreground mt-1">(203) 484-3400</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-red-50/50 dark:bg-red-900/30">
            <Mail className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Email</p>
            <p className="text-xs text-muted-foreground mt-1">sales@linemaster.com</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-red-50/50 dark:bg-red-900/30">
            <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Request Quote</p>
            <p className="text-xs text-muted-foreground mt-1">Online form</p>
          </div>
        </div>
      </div>
    );
  };

  // ── Stock flow step rendering ──

  const renderStep = () => {
    switch (wizardState.step) {
      case 0: // Brief transitional state while setTimeout fires
        return null;

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
        // Stock path: Action Selection
        if (!isCustomPath) {
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
        }
        // Custom path falls through to builder
        return renderBuilderStep();

      case 3:
        if (!isCustomPath) {
          // Stock path: Environment Selection
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
        }
        return renderBuilderStep();

      // Steps 4-11: all custom builder steps
      case 4: case 5: case 6: case 7: case 8: case 9: case 10: case 11:
        if (isCustomPath) return renderBuilderStep();
        return null;

      default:
        return null;
    }
  };

  // Fork step (and transitional step 0) use self-contained layout
  if (wizardState.step <= 1) {
    return (
      <div className="min-h-screen mesh-gradient-light dark:bg-gradient-to-b dark:from-gray-900 dark:to-black relative">
        <Header onReset={onReset} />
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

  // Custom builder and stock steps use progress bar layout
  const isBuilder = isCustomPath && wizardState.step >= 2;
  const builderDisplayStep = isBuilder
    ? getCustomDisplayStep(wizardState.step, wizardState.selectedChannel)
    : displayStep;
  const builderDisplayTotal = isBuilder
    ? getCustomDisplayTotal(wizardState.selectedChannel)
    : STOCK_DISPLAY_TOTAL;
  const progressPercent = Math.round((builderDisplayStep / builderDisplayTotal) * 100);
  const label = isBuilder ? 'Custom Builder' : 'Medical';

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/30 to-white dark:from-gray-900 dark:to-black relative">
      <Header onReset={onReset} />
      <div className="container mx-auto px-4 pt-24 pb-20 relative z-10">

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-14">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2.5 tracking-wide">
            <span className="uppercase">Step {builderDisplayStep} of {builderDisplayTotal}</span>
            <span className="text-xs text-red-500 font-semibold tracking-widest uppercase">{label}</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} wizard progress: step ${builderDisplayStep} of ${builderDisplayTotal}`}>
            <MotionDiv
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Inline navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Back
            </Button>
          </div>

          {/* Content Area with Animation */}
          <AnimatePresence mode="wait">
            <MotionDiv
              key={`${wizardState.step}-${isCustomPath ? 'custom' : 'stock'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderStep()}
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
