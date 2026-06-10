import { useState, useEffect, useRef, Fragment, lazy, Suspense } from 'react';
import { ArrowRight, ChevronLeft, Check, ShieldCheck, ShieldOff, Award, Flag } from 'lucide-react';
import { GlassCard } from '@/app/components/GlassCard';
import { OptionCard } from '@/app/components/OptionCard';
import { Option } from '@/app/data/options';
import { NO_PREFERENCE } from '@/app/utils/preference';
import { WizardState } from '@/app/hooks/useWizardState';
import { Button } from '@/app/components/ui/button';
import { WizardBreadcrumb } from '@/app/components/wizard/WizardBreadcrumb';
import { motion, AnimatePresence } from 'motion/react';

const LazyWizardCompanion = lazy(() => import('@/app/components/wizard/WizardCompanion'));

// Magic wand cursor as inline SVG data URI
const WAND_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cline x1='4' y1='28' x2='18' y2='14' stroke='%23a78bfa' stroke-width='2.5' stroke-linecap='round'/%3E%3Cpath d='M18,14 L20,10 L24,12 L22,16 Z' fill='%23fbbf24'/%3E%3Ccircle cx='26' cy='4' r='1.5' fill='%23fbbf24'/%3E%3Ccircle cx='29' cy='9' r='1' fill='%23fbbf24'/%3E%3Ccircle cx='24' cy='2' r='1' fill='%23fbbf24'/%3E%3Ccircle cx='30' cy='5' r='0.8' fill='%23fff'/%3E%3Ccircle cx='27' cy='1' r='0.8' fill='%23fff'/%3E%3C/svg%3E") 4 28, auto`;

// Wizard hat SVG for the "L" in Linemaster — hangs crooked off the top of the L
const WizardHat = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.svg
        key="wizard-hat"
        initial={{ scale: 0, opacity: 0, rotate: 15 }}
        animate={{ scale: 1, opacity: 1, rotate: -12 }}
        exit={{ scale: 0, opacity: 0, rotate: 15 }}
        transition={{ type: 'spring', damping: 10, stiffness: 250 }}
        width="22"
        height="18"
        viewBox="0 0 24 20"
        style={{
          position: 'absolute',
          top: '-8px',
          left: '-2px',
          transformOrigin: '70% 100%',
          pointerEvents: 'none',
        }}
      >
        <path d="M12 0 L6 16 L18 16 Z" fill="var(--primary, #3b82f6)" />
        <ellipse cx="12" cy="17" rx="12" ry="3" fill="var(--primary, #3b82f6)" />
        <circle cx="12" cy="1.5" r="2" fill="#fbbf24" />
        <circle cx="9" cy="8" r="1" fill="#fbbf24" opacity="0.7" />
        <circle cx="14" cy="5" r="0.8" fill="#fbbf24" opacity="0.5" />
      </motion.svg>
    )}
  </AnimatePresence>
);

interface StandardStepsProps {
  wizardState: WizardState;
  categories: Option[];
  applications: Option[];
  technologies: Option[];
  actions: Option[];
  environments: Option[];
  features: Option[];
  duties: Option[];
  connections: Option[];
  circuitCounts: Option[];
  totalSteps: number;
  getProgressStep: (step: number) => number;
  getDisplayStep: (step: number) => number;
  getProductCount: (step: number, optionId?: string) => number;
  clearDownstreamSelections: (step: number) => void;
  onCategorySelect: (id: string) => void;
  onApplicationSelect: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function StandardSteps({
  wizardState,
  categories,
  applications,
  technologies,
  actions,
  environments,
  features,
  duties,
  connections,
  circuitCounts,
  totalSteps,
  getProgressStep,
  getDisplayStep,
  getProductCount,
  clearDownstreamSelections,
  onCategorySelect,
  onApplicationSelect,
  onBack,
  onContinue,
}: StandardStepsProps) {
  const [showWizard, setShowWizard] = useState(false);
  // Once toggled on, keep the lazy chunk mounted for exit animations
  const [companionLoaded, setCompanionLoaded] = useState(false);
  useEffect(() => {
    if (showWizard) setCompanionLoaded(true);
  }, [showWizard]);
  const [stepAnnouncement, setStepAnnouncement] = useState('');
  const stepContentRef = useRef<HTMLDivElement>(null);

  // Step titles for screen reader announcements
  const stepTitles: Record<number, string> = {
    0: 'Select Your Application',
    1: 'Select Technology',
    2: 'Select Action Type',
    3: 'Operating Environment',
    4: 'Duty Rating',
    5: 'Connection Type',
    6: 'Circuits Controlled',
    7: 'Safety Guard',
    8: 'Additional Features',
  };

  // Announce step changes to screen readers and move focus
  useEffect(() => {
    const title = stepTitles[wizardState.step];
    if (title && wizardState.step > 0) {
      setStepAnnouncement(`Step ${getDisplayStep(wizardState.step)} of ${totalSteps}: ${title}`);
      // Move focus to the step content area after transition
      setTimeout(() => stepContentRef.current?.focus(), 350);
    }
  }, [wizardState.step]);

  // Global wand cursor + wizard color — inject a <style> tag when wizard is active
  useEffect(() => {
    if (!showWizard) return;
    const style = document.createElement('style');
    style.textContent = [
      `*, *::before, *::after { cursor: ${WAND_CURSOR} !important; }`,
      `:root { --wizard-color: #0c2461; }`,
      `.dark, .lm-dark { --wizard-color: #3b82f6; }`,
    ].join('\n');
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [showWizard]);

  // Guard against undefined props in environments like Figma Make
  if (!wizardState || !categories) return null;

  // Helper to handle single-select progression. No artificial delay — the
  // AnimatePresence exit animation already gives a visual handoff to the
  // next step, and a setTimeout here just made every click feel laggy.
  const handleSingleSelect = (
    value: string,
    setter: (val: string) => void,
    stepIndex: number
  ) => {
    setter(value);
    clearDownstreamSelections(stepIndex);
    onContinue();
  };

  // Helper to handle multi-select toggle
  const handleMultiSelect = (
    value: string,
    currentValues: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter((v) => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  // Filter applications by parent category if selected
  const filteredApplications = wizardState.selectedCategory
    ? (applications || []).filter(app => app.parentCategory === wizardState.selectedCategory)
    : (applications || []);

  const progressPercent = Math.round((getProgressStep(wizardState.step) / totalSteps) * 100);

  // Wizard companion easter egg — lazily loaded so the ASCII art stays out
  // of the main bundle until the user actually toggles it on. Stays mounted
  // after first load so the exit animation can play on dismiss.
  const wizardCompanion = companionLoaded ? (
    <Suspense fallback={null}>
      <LazyWizardCompanion visible={showWizard} onDismiss={() => setShowWizard(false)} />
    </Suspense>
  ) : null;

  // Step 0: Category Selection
  if (wizardState.step === 0 && !wizardState.selectedCategory) {
    return (
      <Fragment>
      <div className="pt-20 pb-12" style={{ paddingLeft: '15%', paddingRight: '15%' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p
            className="text-lg md:text-xl font-medium text-muted-foreground mb-3 tracking-wide uppercase cursor-pointer hover:text-primary focus-visible:text-primary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-md px-2 -mx-2"
            onClick={() => setShowWizard(prev => !prev)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowWizard(prev => !prev); } }}
            role="button"
            tabIndex={0}
            aria-pressed={showWizard}
            aria-label={showWizard ? 'Hide Switch Wizard companion' : 'Show Switch Wizard companion'}
          >
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <WizardHat visible={showWizard} />
              L
            </span>inemaster Switch Wizard
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 leading-tight">
            Find Your Solution
          </h1>
          <p className="!text-xl !text-muted-foreground" style={{ textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
            Select your industry to begin. We'll guide you to the right foot switch.
          </p>
        </motion.div>

        <div className="flex items-center gap-4 w-full mb-8" aria-hidden="true">
          <div className="h-px flex-1 bg-border" />
          <span className="!text-base font-semibold uppercase tracking-widest !text-muted-foreground">Choose Your Industry</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto" style={{ maxWidth: '960px' }}>
          {(categories || []).map((category, i) => (
            <motion.div
              key={category.id}
              className="min-w-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard
                hoverEffect
                interactive
                aria-label={category.label}
                className="p-8 md:p-10 h-full transition-all duration-300 group"
                onClick={() => onCategorySelect(category.id)}
              >
                <div className="flex flex-col items-center text-center h-full min-w-0">
                  <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary/8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-105 mb-5 shrink-0">
                    {category.icon && <category.icon className="w-8 h-8" aria-hidden="true" />}
                  </div>
                  <span className="!text-2xl !font-semibold tracking-tight mb-3 w-full">{category.label}</span>
                  <p className="!text-base !text-muted-foreground mt-auto">
                    {category.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-3xl mx-auto mt-20 pt-10 border-t border-border/50"
        >
          <div className="flex items-center gap-3 text-muted-foreground">
            <ShieldCheck className="!w-7 !h-7 !text-primary/60" aria-hidden="true" />
            <span className="!text-lg !font-medium">ISO Certified</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Flag className="!w-7 !h-7 !text-primary/60" aria-hidden="true" />
            <span className="!text-lg !font-medium">Made in USA</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Award className="!w-7 !h-7 !text-primary/60" aria-hidden="true" />
            <span className="!text-lg !font-medium">70+ Years of Excellence</span>
          </div>
        </motion.div>

      </div>
      {wizardCompanion}
      </Fragment>
    );
  }

  // Common wrapper for all steps after category selection
  return (
    <Fragment>
    <div className="pt-16 pb-16" style={{ paddingLeft: '15%', paddingRight: '15%' }}>
      {/* Progress Bar */}
      <div className="mx-auto mb-14" style={{ maxWidth: '700px' }}>
        <div className="flex justify-between !text-base !font-medium !text-muted-foreground mb-2.5 tracking-wide">
          <span className="uppercase">Step {getDisplayStep(wizardState.step)} of {totalSteps}</span>
          <span className="tabular-nums">{progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Wizard progress: step ${getDisplayStep(wizardState.step)} of ${totalSteps}`}>
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full progress-glow"
            initial={{ width: 0 }}
            animate={{ width: `${(getProgressStep(wizardState.step) / totalSteps) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Clickable breadcrumb of prior answers — tap any chip to jump back */}
      <WizardBreadcrumb
        wizardState={wizardState}
        applications={applications}
        technologies={technologies}
        actions={actions}
        environments={environments}
        duties={duties}
        connections={connections}
        circuitCounts={circuitCounts}
        features={features}
        onJumpToStep={wizardState.setStep}
      />

      {/* Screen reader announcements for step changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {stepAnnouncement}
      </div>

      <div className="w-full" ref={stepContentRef} tabIndex={-1} style={{ outline: 'none' }}>
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Back
          </Button>
          {wizardState.step === 8 && (
            <Button variant="ghost" onClick={onContinue} className="text-muted-foreground hover:text-foreground">
              Skip <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={wizardState.step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Step 0 Phase 2: Application Selection */}
            {wizardState.step === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Select Your Application</h2>
                  <p className="!text-lg !text-muted-foreground">Choose the specific use case for your foot switch</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                  {filteredApplications.map((app, i) => (
                    <OptionCard
                      key={app.id}
                      label={app.label}
                      description={app.description}
                      icon={app.icon}
                      selected={wizardState.selectedApplication === app.id}
                      onClick={() => onApplicationSelect(app.id)}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Technology */}
            {wizardState.step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Select Technology</h2>
                  <p className="!text-lg !text-muted-foreground">Choose the switching mechanism for your application</p>
                  <p className="!text-sm !text-muted-foreground/80 mt-3 italic">
                    Pneumatic and Wireless skip the wiring and circuit questions — 2 fewer steps.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full" role="radiogroup" aria-label="Select technology">
                  {(technologies || [])
                    .filter((t) => t.availableFor?.includes(wizardState.selectedApplication))
                    .map((tech, i) => (
                      <OptionCard
                        key={tech.id}
                        label={tech.label}
                        description={tech.description}
                        icon={tech.icon}
                        selected={wizardState.selectedTechnology === tech.id}
                        count={getProductCount(1, tech.id)}
                        onClick={() => handleSingleSelect(tech.id, wizardState.setSelectedTechnology, 1)}
                        index={i}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Step 2: Action */}
            {wizardState.step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Select Action Type</h2>
                  <p className="!text-lg !text-muted-foreground">How should the switch activate and deactivate?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full" role="radiogroup" aria-label="Select action type">
                  {(actions || [])
                    .filter((a) => a.availableFor?.includes(wizardState.selectedTechnology))
                    .map((action, i) => (
                      <OptionCard
                        key={action.id}
                        label={action.label}
                        description={action.description}
                        icon={action.icon}
                        selected={wizardState.selectedAction === action.id}
                        count={action.id === NO_PREFERENCE ? undefined : getProductCount(2, action.id)}
                        onClick={() => handleSingleSelect(action.id, wizardState.setSelectedAction, 2)}
                        index={i}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Step 3: Environment */}
            {wizardState.step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Operating Environment</h2>
                  <p className="!text-lg !text-muted-foreground">Where will the switch be used?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full" role="radiogroup" aria-label="Select operating environment">
                  {(environments || []).map((env, i) => (
                    <OptionCard
                      key={env.id}
                      label={env.label}
                      icon={env.icon}
                      description={env.description}
                      selected={wizardState.selectedEnvironment === env.id}
                      count={getProductCount(3, env.id)}
                      onClick={() => handleSingleSelect(env.id, wizardState.setSelectedEnvironment, 3)}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Duty Rating */}
            {wizardState.step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Duty Rating</h2>
                  <p className="!text-lg !text-muted-foreground">How heavy will the usage be?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full" role="radiogroup" aria-label="Select duty rating">
                  {(duties || []).map((duty, i) => (
                    <OptionCard
                      key={duty.id}
                      label={duty.label}
                      description={duty.description}
                      icon={duty.icon}
                      selected={wizardState.selectedDuty === duty.id}
                      count={duty.id === NO_PREFERENCE ? undefined : getProductCount(4, duty.id)}
                      onClick={() => handleSingleSelect(duty.id, wizardState.setSelectedDuty, 4)}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Connection Type */}
            {wizardState.step === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Connection Type</h2>
                  <p className="!text-lg !text-muted-foreground">How should the switch connect to your equipment?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full" role="radiogroup" aria-label="Select connection type">
                  {(connections || []).map((conn, i) => (
                    <OptionCard
                      key={conn.id}
                      label={conn.label}
                      description={conn.description}
                      icon={conn.icon}
                      selected={wizardState.selectedConnection === conn.id}
                      count={conn.id === NO_PREFERENCE ? undefined : getProductCount(5, conn.id)}
                      onClick={() => handleSingleSelect(conn.id, wizardState.setSelectedConnection, 5)}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Circuits Controlled */}
            {wizardState.step === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Circuits Controlled</h2>
                  <p className="!text-lg !text-muted-foreground">How many circuits do you need to control?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full" role="radiogroup" aria-label="Select circuit count">
                  {(circuitCounts || []).map((cc, i) => (
                    <OptionCard
                      key={cc.id}
                      label={cc.label}
                      description={cc.description}
                      icon={cc.icon}
                      selected={wizardState.selectedCircuitCount === cc.id}
                      count={cc.id === NO_PREFERENCE ? undefined : getProductCount(6, cc.id)}
                      onClick={() => handleSingleSelect(cc.id, wizardState.setSelectedCircuitCount, 6)}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Safety Guard */}
            {wizardState.step === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Safety Guard</h2>
                  <p className="!text-lg !text-muted-foreground">Do you need protection against accidental activation?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full" role="radiogroup" aria-label="Select safety guard option">
                  <OptionCard
                    label="Yes, Add Guard"
                    description="Safety guard prevents accidental activation."
                    icon={ShieldCheck}
                    selected={wizardState.selectedGuard === 'yes'}
                    count={getProductCount(7, 'yes')}
                    onClick={() => handleSingleSelect('yes', wizardState.setSelectedGuard, 7)}
                    index={0}
                  />
                  <OptionCard
                    label="No Guard Needed"
                    description="No safety guard required."
                    icon={ShieldOff}
                    selected={wizardState.selectedGuard === 'no'}
                    count={getProductCount(7, 'no')}
                    onClick={() => handleSingleSelect('no', wizardState.setSelectedGuard, 7)}
                    index={1}
                  />
                </div>
              </div>
            )}

            {/* Step 8: Additional Features (Multi-select) */}
            {wizardState.step === 8 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="!text-4xl !font-bold tracking-tight block mb-2">Additional Features</h2>
                  <p className="!text-lg !text-muted-foreground">Select any that apply, or skip to view results.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
                  {(features || [])
                    .filter((f) => !f.hideFor?.includes(wizardState.selectedTechnology))
                    .map((feat, i) => {
                      const isSelected = wizardState.selectedFeatures.includes(feat.id);
                      return (
                        <GlassCard
                          key={feat.id}
                          interactive
                          hoverEffect={!isSelected}
                          aria-label={`${feat.label}${isSelected ? ', selected' : ''}`}
                          aria-pressed={isSelected}
                          className={`p-5 transition-all duration-200 animate-card-enter ${
                            isSelected
                              ? 'border-primary/25 bg-primary/[0.03] dark:bg-primary/[0.06] shadow-[var(--selection-glow)]'
                              : ''
                          }`}
                          onClick={() => handleMultiSelect(feat.id, wizardState.selectedFeatures, wizardState.setSelectedFeatures)}
                          style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-9 h-9 flex items-center justify-center rounded-lg shrink-0 transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                : 'bg-secondary text-transparent'
                            }`}>
                              <Check className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <span className="!text-xl !font-semibold block mb-0.5">{feat.label}</span>
                              <p className="text-sm text-muted-foreground leading-snug">{feat.description}</p>
                              {(feat.id === 'custom_cable' || feat.id === 'custom_connector') && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Requires custom solution quote</p>
                              )}
                            </div>
                          </div>
                        </GlassCard>
                      );
                    })}
                </div>
                <div className="flex justify-center pt-6">
                  <Button
                    size="lg"
                    onClick={onContinue}
                    className="px-10 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/75 shadow-lg shadow-primary/15 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
                  >
                    View Results <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    {wizardCompanion}
    </Fragment>
  );
}
