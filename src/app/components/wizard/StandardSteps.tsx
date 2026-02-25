import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ChevronLeft, Check, ShieldCheck, ShieldOff, Award, Flag, ShieldCheck as ShieldCert } from 'lucide-react';
import { GlassCard } from '@/app/components/GlassCard';
import { OptionCard } from '@/app/components/OptionCard';
import { Option } from '@/app/data/options';
import { WizardState } from '@/app/hooks/useWizardState';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const WIZARD_ASCII = `\
                                            ####
                                          #######
                                        ##########
                                       ############
                                      ####### ######
                                     ######    ######
                                    ######      ######
                                   ######        ######
                                  ######          ######
                                 ######            ######
                                ######              ######
                               ######                ######
                              #######                  #######
                             #######                    #######
                        #############################################
                   ####################################################### ######
                 ########################################################### ############
            ##################                                               ###############
          ##############           ####################################           ##############
        ###########               ######################################               ###########
      ########                   ######################################                   ########
      ######                    ######   #######        #######   ######                    ######
       #######                ######### ###########    ########### #########                #######
         #########            ########## ############   ###########  #########            #########
           ###########       ##########   ###   #### ## ####   ###   ##########       ###########
              ##########################   ######### #### #########   ##########################
                 ################### #   ############################   # ###################
                    ##############   ################################   #################
                      ###############      ########      ###############    ###########
                        ###########        ########        ###########     #############
                          #########        ##########        #########     ####### #######
                       ###########        ##############        ##################   ######
                      ##########        ########  ########        #########################
           ###               ######################      ######################   #############
           #####                ##################          ##################       #########
            ######                    ##########                ##########           ###########
            ######                     ######                       #####            ###########
             ######                    #######                     ######            ###########
             ######                   ########                     #######              #####
              ######                  ##########                  ########              #####
              ######                  ############               #########              #####
               ######                ###############            ###########             #####
               ######              ########  #########          #############           #####
                ######           ##########     #######      ####### ##########         #####
                ######    #  #############        #####     ######    #############  #  #####
               ######## ##################        #####  ########     ########################
              #################### ######        #############       ###### ##################
             ###############      #####         ###########          #####      ##############
             ##############     ######        ##########            ######     ##############
             ##############    #######        #########             #######    #############
                 #####################              ####              #####################
                    # ################              ####              #####################
                      ################              ####              #####################
                       #######  ######              ####              ######  ####### #####
                               ######               ####               ######         #####
                               ######               ####               ######         #####
                               ######               ####               ######         #####
                              ######                ####                ######        #####
                              ######                ####                ######        #####
                              ######                 ##                 ######        #####
                             ######                  ##                  ######       #####
                             ######                 ####                 ######       #####
                             ######                 ####                 ######       #####
                             #####                  ####                  #####       #####
                            ######                  ####                  ######      #####
                            ######                  ####                  ######      #####
                            ####################################################      #####
                           ######################################################     #####
                           ######################################################     #####`;

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
  const [showWizard, setShowWizard] = useState(false);

  // Guard against undefined props in environments like Figma Make
  if (!wizardState || !categories) return null;

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
    ? (applications || []).filter(app => app.parentCategory === wizardState.selectedCategory)
    : (applications || []);

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
          <p
            className="text-lg md:text-xl font-medium text-muted-foreground mb-3 tracking-wide uppercase cursor-pointer hover:text-primary transition-colors duration-300"
            onClick={() => setShowWizard(true)}
          >
            Linemaster Switch Wizard
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 leading-tight">
            Find Your Solution
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Select your industry to begin. We'll guide you to the right foot switch.
          </p>
        </motion.div>

        <div className="flex items-center gap-4 max-w-5xl mx-auto mb-8" aria-hidden="true">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Choose Your Industry</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {(categories || []).map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard
                hoverEffect
                interactive
                aria-label={category.label}
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

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8 max-w-3xl mx-auto mt-20 pt-10 border-t border-border/50"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCert className="w-5 h-5 text-primary/60" />
            <span className="text-sm font-medium">ISO Certified</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flag className="w-5 h-5 text-primary/60" />
            <span className="text-sm font-medium">Made in USA</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="w-5 h-5 text-primary/60" />
            <span className="text-sm font-medium">70+ Years of Excellence</span>
          </div>
        </motion.div>

        {showWizard && createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
            }}
            onClick={() => setShowWizard(false)}
          >
            <div
              style={{
                background: 'var(--background, #0f172a)',
                border: '1px solid var(--border, rgba(226,232,240,0.08))',
                borderRadius: '12px',
                padding: '24px',
                maxHeight: '90vh',
                maxWidth: '95vw',
                overflow: 'auto',
                cursor: 'default',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <pre
                style={{
                  fontSize: 'clamp(4px, 1.2vw, 8px)',
                  lineHeight: 1.2,
                  fontFamily: 'monospace',
                  color: 'var(--primary, #3b82f6)',
                  whiteSpace: 'pre',
                  userSelect: 'none',
                  margin: 0,
                }}
              >
{WIZARD_ASCII}
              </pre>
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted-foreground, #94a3b8)', marginTop: '16px', fontStyle: 'italic' }}>
                You found the Switch Wizard! (click anywhere to close)
              </p>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Common wrapper for all steps after category selection
  return (
    <div className="container mx-auto px-4 pt-24 pb-20">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-14">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2.5 tracking-wide">
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

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {wizardState.step === 7 && (
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
            {/* Step 0 Phase 2: Application Selection */}
            {wizardState.step === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Select Your Application</h2>
                  <p className="text-muted-foreground">Choose the specific use case for your foot switch</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Select Technology</h2>
                  <p className="text-muted-foreground">Choose the switching mechanism for your application</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Select Action Type</h2>
                  <p className="text-muted-foreground">How should the switch activate and deactivate?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {(actions || [])
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
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Operating Environment</h2>
                  <p className="text-muted-foreground">Where will the switch be used?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Duty Rating</h2>
                  <p className="text-muted-foreground">How heavy will the usage be?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {(duties || []).map((duty, i) => (
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
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Connection Type</h2>
                  <p className="text-muted-foreground">How should the switch connect to your equipment?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  {(connections || []).map((conn, i) => (
                    <OptionCard
                      key={conn.id}
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
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Safety Guard</h2>
                  <p className="text-muted-foreground">Do you need protection against accidental activation?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <OptionCard
                    label="Yes, Add Guard"
                    description="Safety guard prevents accidental activation."
                    icon={ShieldCheck}
                    selected={wizardState.selectedGuard === 'yes'}
                    count={getProductCount(6, 'yes')}
                    onClick={() => handleSingleSelect('yes', wizardState.setSelectedGuard, 6)}
                    index={0}
                  />
                  <OptionCard
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
  );
}
