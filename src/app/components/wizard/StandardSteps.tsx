import { ArrowRight, ChevronLeft, Check, ShieldCheck, ShieldOff } from 'lucide-react';
import { GlassCard } from '@/app/components/GlassCard';
import { OptionCard } from '@/app/components/OptionCard';
import { Option } from '@/app/data/options';
import { WizardState } from '@/app/hooks/useWizardState';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

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
  // Helper to handle single-select progression
  const handleSingleSelect = (
    value: string,
    setter: (val: string) => void,
    stepIndex: number
  ) => {
    setter(value);
    clearDownstreamSelections(stepIndex);
    setTimeout(onContinue, 150);
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
    ? applications.filter(app => app.parentCategory === wizardState.selectedCategory)
    : applications;

  const progressPercent = Math.round((getProgressStep(wizardState.step) / totalSteps) * 100);

  // Step 0: Category Selection
  if (wizardState.step === 0 && !wizardState.selectedCategory) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-primary/70 mb-3">
            Linemaster Product Finder
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
            Find Your Solution
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Select your industry to begin. We'll guide you to the right foot switch.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard
                hoverEffect
                interactive
                className="p-10 h-full transition-all duration-300 group"
                onClick={() => onCategorySelect(category.id)}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary/8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-105 mb-5">
                    {category.icon && <category.icon className="w-8 h-8" />}
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight mb-3">{category.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
                    {category.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Step 0 Phase 2: Application Selection
  if (wizardState.step === 0) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center mb-10">
          <Button variant="ghost" onClick={onBack} className="mr-4 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-primary/60 mb-0.5">Step 1</p>
            <h2 className="text-2xl font-bold tracking-tight">Select Your Application</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
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
    );
  }

  // Common wrapper for steps 1-8
  return (
    <div className="container mx-auto px-4 pt-24 pb-20">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-14">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2.5 tracking-wide">
          <span className="uppercase">Step {getDisplayStep(wizardState.step)} of {totalSteps}</span>
          <span className="tabular-nums">{progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full progress-glow"
            initial={{ width: 0 }}
            animate={{ width: `${(getProgressStep(wizardState.step) / totalSteps) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {[7].includes(wizardState.step) && (
            <Button variant="ghost" onClick={onContinue} className="text-muted-foreground hover:text-foreground">
              Skip <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={wizardState.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Step 1: Technology */}
            {wizardState.step === 1 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">Select Technology</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {technologies
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
                <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">Select Action Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {actions
                    .filter((a) => a.availableFor?.includes(wizardState.selectedTechnology))
                    .map((action, i) => (
                      <OptionCard
                        key={action.id}
                        label={action.label}
                        description={action.description}
                        icon={action.icon}
                        selected={wizardState.selectedAction === action.id}
                        count={getProductCount(2, action.id)}
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
                <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">Operating Environment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {environments.map((env, i) => (
                    <OptionCard
                      key={env.id}
                      id={env.id}
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
                <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">Duty Rating</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {duties.map((duty, i) => (
                    <OptionCard
                      key={duty.id}
                      label={duty.label}
                      description={duty.description}
                      icon={duty.icon}
                      selected={wizardState.selectedDuty === duty.id}
                      count={getProductCount(4, duty.id)}
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
                <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">Connection Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  {connections.map((conn, i) => (
                    <OptionCard
                      key={conn.id}
                      id={conn.id}
                      label={conn.label}
                      description={conn.description}
                      icon={conn.icon}
                      selected={wizardState.selectedConnection === conn.id}
                      count={getProductCount(5, conn.id)}
                      onClick={() => handleSingleSelect(conn.id, wizardState.setSelectedConnection, 5)}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Safety Guard */}
            {wizardState.step === 6 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">Safety Guard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <OptionCard
                    id="yes"
                    label="Yes, Add Guard"
                    description="Safety guard prevents accidental activation."
                    icon={ShieldCheck}
                    selected={wizardState.selectedGuard === 'yes'}
                    count={getProductCount(6, 'yes')}
                    onClick={() => handleSingleSelect('yes', wizardState.setSelectedGuard, 6)}
                    index={0}
                  />
                  <OptionCard
                    id="no"
                    label="No Guard Needed"
                    description="No safety guard required."
                    icon={ShieldOff}
                    selected={wizardState.selectedGuard === 'no'}
                    count={getProductCount(6, 'no')}
                    onClick={() => handleSingleSelect('no', wizardState.setSelectedGuard, 6)}
                    index={1}
                  />
                </div>
              </div>
            )}

            {/* Step 7: Additional Features (Multi-select) */}
            {wizardState.step === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Additional Features</h2>
                  <p className="text-muted-foreground">Select any that apply, or skip to view results.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {features
                    .filter((f) => !f.hideFor?.includes(wizardState.selectedTechnology))
                    .map((feat, i) => {
                      const isSelected = wizardState.selectedFeatures.includes(feat.id);
                      return (
                        <GlassCard
                          key={feat.id}
                          interactive
                          hoverEffect={!isSelected}
                          className={`p-5 transition-all duration-200 animate-card-enter ${
                            isSelected
                              ? 'ring-2 ring-primary/25 bg-primary/[0.04]'
                              : ''
                          }`}
                          onClick={() => handleMultiSelect(feat.id, wizardState.selectedFeatures, wizardState.setSelectedFeatures)}
                          style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-9 h-9 flex items-center justify-center rounded-lg shrink-0 transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-transparent'
                            }`}>
                              <Check className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[15px] mb-0.5">{feat.label}</h3>
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
                    className="px-10 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/75 shadow-lg shadow-primary/15 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
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
  );
}
