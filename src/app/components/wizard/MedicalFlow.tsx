import { useMemo } from 'react';
import { MedicalGlassCard } from '@/app/components/GlassCard';
import { Button } from '@/app/components/ui/button';
import { Check, Package, Settings, Mail, CircleDot, ToggleLeft, Gauge, Ban, Sun, Droplets, Download, ExternalLink, ArrowRight } from 'lucide-react';
import { OptionCard } from '@/app/components/OptionCard';
import { ProductVisual } from '@/app/components/wizard/ProductVisual';
import { WizardState } from '@/app/hooks/useWizardState';
import type { Product } from '@/app/lib/api';
import { cn } from '@/app/components/ui/utils';
import { Header } from '@/app/components/Header';
import { StepProgress, StepNavRow, StepHeading } from '@/app/components/wizard/StepFrame';
import { OptionGrid } from '@/app/components/wizard/OptionGrid';
import {
  pedalDesigns,
  NumberIcon,
  BUILDER_STEP_CONFIGS,
  optionLabel,
} from '@/app/data/options';
import {
  MEDICAL_STEP,
  getSequenceKey,
  stepPosition,
  visibleSteps,
  type StepContext,
} from '@/app/utils/wizardSteps';
import type { Option } from '@/app/data/options';
import { NO_PREFERENCE, hasPreference } from '@/app/utils/preference';
import { configQuoteText, quoteLinkProps } from '@/app/utils/quote';


const CRESCENT_IMAGE = 'https://linemaster.com/wp-content/uploads/2025/04/neuro-and-ent-1-optimized.png';
const AERO_IMAGE = 'https://linemaster.com/wp-content/uploads/2025/04/electro-surgical-cardiac-2-optimized.png';
// Explosion Proof Medical 600 (601-EX): a stock medical switch with no guard
const STOCK_FORK_IMAGE = 'https://linemaster.com/cdn/images/products/153/153-a-shadow@1200.png';
const PRESPEC_URL = 'https://linemaster.com/prespec-by-linemaster/';

// Medical-specific action options. Variable and No Preference were missing,
// and action is a hard filter — so variable-speed medical switches could
// never be reached from this path.
const MEDICAL_ACTIONS = [
  { id: 'momentary', label: 'Momentary', description: 'Active while pressed — ideal for surgical tools', icon: CircleDot },
  { id: 'maintained', label: 'Maintained', description: 'Toggle on/off — for diagnostic and therapy equipment', icon: ToggleLeft },
  { id: 'variable', label: 'Variable Speed', description: 'Output varies with pedal pressure — e.g. drills, pumps', icon: Gauge },
  { id: NO_PREFERENCE, label: 'No Preference', description: 'Show all medical switches', icon: Ban },
];

// Medical-specific environment options
const MEDICAL_ENVIRONMENTS = [
  { id: 'any', label: 'Standard Environment', description: 'Standard clinical or office setting', icon: Sun },
  { id: 'wet', label: 'Sterilizable / Washdown', description: 'IP68 rated for OR and sterilization', icon: Droplets },
];

interface MedicalFlowProps {
  wizardState: WizardState;
  products: Product[];
  /** Answers the step order's skip rules read (Crescent skips the treadle step). */
  stepContext: StepContext;
  onBack: () => void;
  onContinue: () => void;
  onViewStandardProducts: () => void;
  onGeneratePDF: () => void;
  onReset: () => void;
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
  stepContext,
  onBack,
  onContinue,
  onViewStandardProducts,
  onGeneratePDF,
  onReset,
}: MedicalFlowProps) {
  // Guard against undefined props in environments like Figma Make
  if (!wizardState || !products) return null;

  const isCustomPath = wizardState.selectedMedicalPath === 'custom';

  // Medical products (any technology — wired and wireless medical switches
  // both belong in this catalog; the results page's Technology filter can
  // narrow them).
  const medicalProducts = (products || []).filter(p => p.applications.includes('medical'));

  const getActionCount = (actionId: string) =>
    medicalProducts.filter(p => p.actions.includes(actionId)).length;

  const getEnvironmentCount = (envId: string) => {
    const base = hasPreference(wizardState.selectedAction)
      ? medicalProducts.filter(p => p.actions.includes(wizardState.selectedAction))
      : medicalProducts;
    if (envId === 'wet') return base.filter(p => p.ip === 'IP68').length;
    return base.length; // 'any' = no filter
  };

  // No artificial setTimeout delays — the next step's entrance animation is the
  // visual handoff to the next step, and waiting just makes clicks feel laggy.
  // (Matches the snappiness pattern in StandardSteps.handleSingleSelect.)
  const handleForkSelect = (path: 'stock' | 'custom') => {
    wizardState.setSelectedMedicalPath(path);
    onContinue();
  };

  const handleActionSelect = (id: string) => {
    wizardState.setSelectedAction(id);
    onContinue();
  };

  const handleEnvironmentSelect = (id: string) => {
    wizardState.setSelectedEnvironment(id);
    onViewStandardProducts();
  };

  // ── Custom builder handlers ──

  const handleBuilderSelect = (setter: (id: string) => void, id: string) => {
    setter(id);
    onContinue();
  };

  // Generate button count options based on channel + pedal (memoized to stabilize NumberIcon refs)
  const maxButtons = getMaxButtons(wizardState.selectedChannel, wizardState.selectedPedalDesign);
  const buttonCountOptions = useMemo(() =>
    Array.from({ length: maxButtons }, (_, i) => ({
      id: String(i + 1),
      label: `${i + 1} Button${i > 0 ? 's' : ''}`,
      description: undefined,
      icon: NumberIcon(i + 1),
    })),
    [maxButtons],
  );

  // ── Generic option step renderer ──

  const renderOptionStep = (title: string, subtitle: string, options: Option[], columns: number, selectedValue: string, setter: (id: string) => void) => (
    <div className="space-y-6">
      <StepHeading title={title} subtitle={subtitle} />
      <OptionGrid md={columns <= 2 ? 2 : 3} className="max-w-3xl mx-auto">
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
      </OptionGrid>
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
              <StepHeading title="Select Channel Type" subtitle="Choose the housing style for your custom footswitch." />
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
            <StepHeading
              title="Number of Buttons"
              subtitle={<>
                How many buttons does your switch need?
                <span className="block text-xs mt-1 text-red-400">
                  {wizardState.selectedChannel === 'aero'
                    ? `Aero with ${optionLabel(pedalDesigns, wizardState.selectedPedalDesign).toLowerCase()} supports up to ${maxButtons} button${maxButtons > 1 ? 's' : ''}`
                    : `Crescent supports up to ${maxButtons} buttons`}
                </span>
              </>}
            />
            <OptionGrid
              md={buttonCountOptions.length <= 2 || buttonCountOptions.length === 4 ? 2 : 3}
              className="max-w-3xl mx-auto"
            >
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
            </OptionGrid>
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
        const setter = setterKey ? (wizardState as unknown as Record<string, unknown>)[setterKey] as (id: string) => void : undefined;
        if (!setter) return null;
        return renderOptionStep(cfg.title, cfg.subtitle, cfg.options, cfg.columns, selectedValue, setter);
      }
    }
  };

  // ── Summary page ──

  const renderSummary = () => {
    // Built in step order, matching the PDF: Channel, Treadle Count, Buttons,
    // then the remaining builder steps. (The old version spliced Buttons in
    // after a row labelled 'Pedal Design', which no longer exists — findIndex
    // returned -1 and Buttons landed above Channel.)
    const configEntries: { label: string; value: string }[] = [];
    const pushCfg = (cfg: (typeof BUILDER_STEP_CONFIGS)[number]) => {
      if (cfg.aeroOnly && wizardState.selectedChannel !== 'aero') return;
      const val = wizardState[cfg.stateKey as keyof WizardState] as string;
      if (val) configEntries.push({ label: cfg.summaryLabel, value: optionLabel(cfg.options, val) });
    };

    if (wizardState.selectedChannel) {
      configEntries.push({ label: 'Channel', value: wizardState.selectedChannel === 'crescent' ? 'Crescent Channel' : 'Aero Channel' });
    }
    const treadleCfg = BUILDER_STEP_CONFIGS.find(c => c.stateKey === 'selectedPedalDesign');
    if (treadleCfg) pushCfg(treadleCfg);
    if (wizardState.selectedButtonCount) {
      configEntries.push({ label: 'Buttons', value: wizardState.selectedButtonCount });
    }
    for (const cfg of BUILDER_STEP_CONFIGS) {
      if (cfg !== treadleCfg) pushCfg(cfg);
    }

    // Contact page + configuration copied for its message box
    const quoteLink = quoteLinkProps(configQuoteText(configEntries));

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Check className="w-8 h-8 text-red-600" aria-hidden="true" />
          </div>
        </div>
        <StepHeading title="Your Custom Switch Configuration" subtitle="Review your selections below." />

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
            onClick={() => onGeneratePDF()}
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Download Summary (PDF)
          </Button>
          {/* Opens the contact page and copies the configuration so the buyer
              doesn't have to retype it or attach the PDF */}
          <Button
            asChild
            variant="outline"
            className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <a {...quoteLink}>
              <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
              Request a Quote
            </a>
          </Button>
        </div>
      </div>
    );
  };

  // ── Stock flow step rendering ──

  const renderStep = () => {
    switch (wizardState.step) {
      case 0: // Brief transitional state while setTimeout fires
        return null;

      case 1: { // Fork step - "How would you like to proceed?"
        // ! classes throughout: on linemaster.com the theme's heading and
        // paragraph sizes/margins beat Tailwind's layered utilities.
        const forkCards = [
          {
            id: 'stock' as const,
            title: 'Browse Stock Products',
            description: 'Explore our catalog of standard medical-grade footswitches.',
            image: STOCK_FORK_IMAGE,
            icon: Package,
          },
          {
            id: 'custom' as const,
            // Non-breaking hyphen keeps "Semi‑Custom" on one line
            title: 'Build a Semi\u2011Custom Switch',
            description: 'Start from our Aero or Crescent housing, then choose treadles, buttons, connection and labeling.',
            image: AERO_IMAGE,
            icon: Settings,
          },
        ];
        return (
          // No outer card: laid out like the other steps, with Back in the
          // row above (see the fork layout below)
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="!text-sm !font-bold !text-brand-steel tracking-[0.08em] uppercase !mt-0 !mb-2">
                Medical &amp; Healthcare
              </p>
              <h2 className="!text-3xl md:!text-4xl !font-bold !text-foreground tracking-[-0.01em] !my-0">
                How would you like to proceed?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5" role="radiogroup" aria-label="Choose how to proceed">
              {forkCards.map(card => {
                const selected = wizardState.selectedMedicalPath === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleForkSelect(card.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleForkSelect(card.id); } }}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    className={cn(
                      'group relative cursor-pointer rounded-[10px] border-2 bg-card px-5 pt-6 pb-6 md:px-6 flex flex-col items-center text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      selected
                        ? 'border-primary shadow-[var(--card-hover-shadow)]'
                        : 'border-border hover:border-[var(--card-hover-border)] hover:shadow-[var(--card-hover-shadow)]'
                    )}
                  >
                    <ProductVisual image={card.image} icon={card.icon} heightClass="h-32 md:h-40" />
                    <h3 className="!text-xl !font-bold !text-foreground !leading-snug !mt-0 !mb-2">
                      {card.title}
                    </h3>
                    <p className="!text-sm !text-muted-foreground !leading-relaxed !my-0">
                      {card.description}
                    </p>
                    {selected && (
                      <div className="absolute top-3 right-3 bg-primary rounded-full p-1 !text-white" aria-hidden="true">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fully custom: the PRESPEC program, in the same navy as the
                front-page band */}
            <a
              href={PRESPEC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lm-hero-band group mt-5 flex flex-col md:flex-row md:items-center gap-5 md:gap-8 rounded-[10px] p-6 md:p-8 !no-underline hover:!no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3f6a9b]"
            >
              <div className="flex-1 min-w-0">
                <p className="!text-xs !font-bold !text-brand-steel tracking-[0.12em] uppercase !mt-0 !mb-2">
                  Fully custom &middot; PRESPEC Program
                </p>
                <h3 className="!text-2xl !font-bold !text-white !leading-snug !mt-0 !mb-2">
                  Designing a new medical device?
                </h3>
                <p className="!text-base !text-white/80 !leading-relaxed !my-0">
                  PRESPEC is Linemaster&rsquo;s design-phase development program: our engineers work with your team to design a fully custom foot control early in your device&rsquo;s development.
                </p>
              </div>
              <span className="inline-flex shrink-0 self-start md:self-center items-center gap-2 rounded-full bg-white px-5 py-3 !text-sm !font-bold uppercase tracking-[0.03em] !text-[#081b2f] transition-colors group-hover:bg-white/90">
                Explore PRESPEC
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </span>
            </a>
          </div>
        );
      }

      case 2:
        // Stock path: Action Selection
        if (!isCustomPath) {
          return (
            <div className="space-y-6">
              <StepHeading title="Action Type" subtitle="How should the footswitch activate?" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {MEDICAL_ACTIONS.map((action, i) => (
                  <OptionCard
                    key={action.id}
                    label={action.label}
                    description={action.description}
                    icon={action.icon}
                    selected={wizardState.selectedAction === action.id}
                    count={action.id === NO_PREFERENCE ? undefined : getActionCount(action.id)}
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
              <StepHeading title="Operating Environment" subtitle="Where will the footswitch be used?" />

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
      <div className="min-h-screen dark:bg-gradient-to-b dark:from-gray-900 dark:to-black relative">
        <Header onReset={onReset} />
        <div className="container mx-auto px-4 py-8 pt-24 pb-20 relative z-10">
          {wizardState.step === 1 && (
            // Back sits top-left, as on every other step
            <StepNavRow
              onBack={onBack}
              rightAction={wizardState.selectedMedicalPath ? (
                // Came back to this screen with a path already chosen
                <Button variant="outline" onClick={onContinue} className="gap-1">
                  Continue <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              ) : undefined}
            />
          )}
          <div
            key={`${wizardState.step}-${wizardState.selectedMedicalPath}`}
            className="lm-enter"
            style={{ '--enter-y': '20px', '--enter-dur': '0.3s' } as React.CSSProperties}
          >
            {renderStep()}
          </div>
        </div>
      </div>
    );
  }

  // Custom builder and stock steps use progress bar layout
  // The fork is an unnumbered "choose a path" screen, so both paths count
  // from 1 after it: Stock is Action, Environment; Custom is the builder.
  const isBuilder = isCustomPath && wizardState.step >= MEDICAL_STEP.CHANNEL;
  const sequenceKey = getSequenceKey(wizardState.flow, wizardState.selectedMedicalPath);
  const builderDisplayStep = stepPosition(sequenceKey, wizardState.step, stepContext);
  const builderDisplayTotal = visibleSteps(sequenceKey, stepContext).length - 1;
  const progressPercent = Math.round((builderDisplayStep / builderDisplayTotal) * 100);
  const label = isBuilder ? 'Custom Builder' : 'Medical';

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/30 to-white dark:from-gray-900 dark:to-black relative">
      <Header onReset={onReset} />
      <div className="container mx-auto px-4 pt-24 pb-20 relative z-10">

        <StepProgress
          displayStep={builderDisplayStep}
          displayTotal={builderDisplayTotal}
          progressPercent={progressPercent}
          accent="medical"
          label={label}
          ariaLabel={`${label} wizard progress: step ${builderDisplayStep} of ${builderDisplayTotal}`}
        />
        <StepNavRow onBack={onBack} />

        <div className="max-w-4xl mx-auto">
          {/* Content Area with Animation */}
          <div
            key={`${wizardState.step}-${isCustomPath ? 'custom' : 'stock'}`}
            className="lm-enter"
            style={{ '--enter-x': '20px', '--enter-dur': '0.3s' } as React.CSSProperties}
          >
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
