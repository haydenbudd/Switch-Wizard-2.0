import { useState, useEffect, useRef, Fragment, lazy, Suspense } from 'react';
import { cn } from '@/app/components/ui/utils';
import { ON_SITE } from '@/app/utils/embed';
import { ProductVisual } from '@/app/components/wizard/ProductVisual';
import { ArrowRight, Check, ShieldCheck, ShieldOff, Award, Flag, Search } from 'lucide-react';
import { GlassCard } from '@/app/components/GlassCard';
import { OptionCard } from '@/app/components/OptionCard';
import { Option } from '@/app/data/options';
import { NO_PREFERENCE } from '@/app/utils/preference';
import { WizardState } from '@/app/hooks/useWizardState';
import { Button } from '@/app/components/ui/button';
import { WizardBreadcrumb } from '@/app/components/wizard/WizardBreadcrumb';
import type { OptionCount } from '@/app/hooks/useProductFiltering';
import { usePresence } from '@/app/hooks/usePresence';
import { StepProgress, StepNavRow, StepHeading, NAV_LINK_CLASS } from '@/app/components/wizard/StepFrame';
import { OptionGrid } from '@/app/components/wizard/OptionGrid';
import { STEP, skipsWiringSteps } from '@/app/utils/wizardSteps';

const LazyWizardCompanion = lazy(() => import('@/app/components/wizard/WizardCompanion'));

// Current answer for each single-select step (Technology to Safety Guard),
// used to tell a re-pick of the same option apart from a real change.
const STEP_ANSWER: Record<number, (s: WizardState) => string> = {
  [STEP.TECHNOLOGY]: s => s.selectedTechnology,
  [STEP.ACTION]: s => s.selectedAction,
  [STEP.ENVIRONMENT]: s => s.selectedEnvironment,
  [STEP.DUTY]: s => s.selectedDuty,
  [STEP.CONNECTION]: s => s.selectedConnection,
  [STEP.CIRCUITS]: s => s.selectedCircuitCount,
  [STEP.GUARD]: s => s.selectedGuard,
};

// Magic wand cursor as inline SVG data URI
const WAND_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cline x1='4' y1='28' x2='18' y2='14' stroke='%23a78bfa' stroke-width='2.5' stroke-linecap='round'/%3E%3Cpath d='M18,14 L20,10 L24,12 L22,16 Z' fill='%23fbbf24'/%3E%3Ccircle cx='26' cy='4' r='1.5' fill='%23fbbf24'/%3E%3Ccircle cx='29' cy='9' r='1' fill='%23fbbf24'/%3E%3Ccircle cx='24' cy='2' r='1' fill='%23fbbf24'/%3E%3Ccircle cx='30' cy='5' r='0.8' fill='%23fff'/%3E%3Ccircle cx='27' cy='1' r='0.8' fill='%23fff'/%3E%3C/svg%3E") 4 28, auto`;

// Where the hat's brim sits, measured down from the top of the L's line box
const HAT_BRIM_FROM_TOP = '0.1em';

// Wizard hat SVG for the "L" in Linemaster — sits crooked on top of the L.
// Sized and placed in em so it fits the label at any font size (20px on
// GitHub Pages, 14px on linemaster.com): its brim rests just above the L's
// cap height instead of covering the letter, tilt included.
const WizardHat = ({ visible }: { visible: boolean }) => {
  const { mounted, exiting } = usePresence(visible, 200);
  if (!mounted) return null;
  return (
      <svg
        className={exiting ? 'lm-exit' : 'lm-enter'}
        viewBox="0 0 24 20"
        aria-hidden="true"
        style={{
          // Pops in with a little overshoot, settles tilted
          '--enter-scale': 0,
          '--enter-rotate': '15deg',
          '--enter-dur': '0.45s',
          '--enter-ease': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          '--exit-scale': 0,
          '--exit-rotate': '15deg',
          transform: 'rotate(-12deg)',
          position: 'absolute',
          width: '1.1em',
          height: '0.9em',
          left: '-0.1em',
          bottom: `calc(100% - ${HAT_BRIM_FROM_TOP})`,
          transformOrigin: '70% 100%',
          pointerEvents: 'none',
        } as React.CSSProperties}
      >
        <path d="M12 0 L6 16 L18 16 Z" fill="var(--primary, #3b82f6)" />
        <ellipse cx="12" cy="17" rx="12" ry="3" fill="var(--primary, #3b82f6)" />
        <circle cx="12" cy="1.5" r="2" fill="#fbbf24" />
        <circle cx="9" cy="8" r="1" fill="#fbbf24" opacity="0.7" />
        <circle cx="14" cy="5" r="0.8" fill="#fbbf24" opacity="0.5" />
      </svg>
  );
};

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
  getProductCount: (step: number, optionId?: string) => OptionCount;
  clearDownstreamSelections: (step: number) => void;
  onCategorySelect: (id: string) => void;
  onApplicationSelect: (id: string) => void;
  /** Skip the questions and open the full catalog (search + compare). */
  onBrowseAll: () => void;
  onBack: () => void;
  onContinue: () => void;
  /** Advance without changing anything — back to the resume step if set. */
  onResumeOrContinue: () => void;
  /** Breadcrumb jump that remembers where the user came from. */
  onJumpToStep: (step: number) => void;
}

/**
 * What picking an industry leads to, so the follow-up Application question
 * doesn't feel like being asked the same thing twice.
 */
function CategoryPreview({ apps }: { apps: string[] }) {
  if (apps.length < 2) return null;
  // Plain text rather than a list of pills — and so nothing for
  // linemaster.com's list styling (bullets on every ul/li) to latch onto.
  // ! margins: the site's theme also sets p{margin:0 0 10px}.
  return (
    <div className="mt-6 w-full">
      <p className="!mt-0 !mb-1.5 !text-xs !font-semibold uppercase tracking-wider !text-muted-foreground">Next, choose from</p>
      {/* Each name stays together (no "Custom Aero /" | "Crescent" splits),
          and text-balance evens out the lines instead of leaving one short. */}
      <p className="!my-0 !text-sm !font-medium !text-primary leading-relaxed text-balance">
        {apps.map((a, i) => (
          <span key={a}>
            {/* inline-block keeps a name whole when it fits, and still lets it
                wrap inside itself in a card too narrow for it */}
            <span className="inline-block max-w-full">{a}{i < apps.length - 1 && ','}</span>
            {i < apps.length - 1 && ' '}
          </span>
        ))}
      </p>
    </div>
  );
}

/** Keeps hyphenated words such as "general-purpose" from breaking at the
 *  hyphen ("general-" | "purpose") when the line wraps. */
function KeepHyphenated({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\S+-\S+)/).map((part, i) =>
        i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part
      )}
    </>
  );
}

/** "Industrial & Manufacturing" -> two lines, broken after the "&", so all
 *  three industry titles are the same height and line up across the cards. */
function CategoryTitle({ label }: { label: string }) {
  const [first, ...rest] = label.split(' & ');
  if (!rest.length) return <>{label}</>;
  return (
    <>
      <span className="block">{first} &amp;</span>
      <span className="block">{rest.join(' & ')}</span>
    </>
  );
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
  onBrowseAll,
  onBack,
  onContinue,
  onResumeOrContinue,
  onJumpToStep,
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
    [STEP.APPLICATION]: 'Select Your Application',
    [STEP.TECHNOLOGY]: 'Select Technology',
    [STEP.ACTION]: 'Select Action Type',
    [STEP.ENVIRONMENT]: 'Operating Environment',
    [STEP.DUTY]: 'Duty Rating',
    [STEP.CONNECTION]: 'Connection Type',
    [STEP.CIRCUITS]: 'Circuits Controlled',
    [STEP.GUARD]: 'Safety Guard',
    [STEP.FEATURES]: 'Additional Features',
  };

  // Announce step changes to screen readers and move focus
  useEffect(() => {
    const title = stepTitles[wizardState.step];
    if (title && wizardState.step > 0) {
      // Same numbering as the visible counter (industry pick = step 1)
      setStepAnnouncement(`Step ${getDisplayStep(wizardState.step) + 1} of ${totalSteps + 1}: ${title}`);
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
  // next step's entrance animation gives the visual handoff, and a
  // setTimeout here just made every click feel laggy.
  //
  // Re-picking the answer a step already has (e.g. after jumping back via the
  // breadcrumb to check it) keeps every later answer and returns the user to
  // where they were. Only a *changed* answer clears the steps after it.
  const handleSingleSelect = (
    value: string,
    setter: (val: string) => void,
    stepIndex: number
  ) => {
    if (value === STEP_ANSWER[stepIndex]?.(wizardState)) {
      onResumeOrContinue();
      return;
    }
    setter(value);
    // Editing one answer from the answers row (resumeStep set): keep every
    // later answer and go straight back. Only answers the new choice makes
    // meaningless are dropped — Pneumatic / Wireless skip wiring + circuits.
    if (wizardState.resumeStep !== null) {
      if (stepIndex === STEP.TECHNOLOGY && skipsWiringSteps(value)) {
        wizardState.setSelectedConnection('');
        wizardState.setSelectedCircuitCount('');
      }
      onResumeOrContinue();
      return;
    }
    clearDownstreamSelections(stepIndex);
    onContinue();
  };

  // OptionCard props for an option's exact/close match counts
  const countProps = (step: number, id: string) => {
    const c = getProductCount(step, id);
    return { count: c.exact, closeCount: c.close };
  };

  const currentAnswer = STEP_ANSWER[wizardState.step]?.(wizardState) ?? '';

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

  // The industry pick counts as step 1, so the first question after it
  // already shows progress ("Step 2 of 10") instead of "Step 1 · 0%".
  const displayStep = getDisplayStep(wizardState.step) + 1;
  const displayTotal = totalSteps + 1;
  const selectedCategoryLabel = (categories || []).find(c => c.id === wizardState.selectedCategory)?.label;

  // Step N of M fills N/M of the bar, so the last question shows a full bar
  // (as in the medical builder). It used (N - 1)/M, which stopped at 90%.
  const progressPercent = Math.round((displayStep / displayTotal) * 100);

  // Wizard companion easter egg — lazily loaded so the ASCII art stays out
  // of the main bundle until the user actually toggles it on. Stays mounted
  // after first load so the exit animation can play on dismiss.
  const wizardCompanion = companionLoaded ? (
    <Suspense fallback={null}>
      <LazyWizardCompanion visible={showWizard} onDismiss={() => setShowWizard(false)} />
    </Suspense>
  ) : null;

  // "Linemaster Switch Wizard" label — clicking it summons the ASCII
  // wizard easter egg. Kept (smaller) on linemaster.com, where the big
  // heading is dropped, so the egg still has a trigger there.
  const wizardEyebrow = (
    <span
      // Bold steel blue eyebrow, like "PRESPEC Program" on linemaster.com.
      // On the navy front-page band it uses a lighter blue (lm-hero-band).
      // Sizes are 15% up from text-base (site) and text-lg/xl (Pages).
      className={`inline-block !font-bold !text-brand-steel cursor-pointer hover:!text-primary focus-visible:!text-primary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-md px-2 -mx-2 ${ON_SITE ? '!text-[1.15rem]' : '!text-[1.3rem] md:!text-[1.4375rem] mb-3'}`}
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
    </span>
  );

  // Step 0: Category Selection
  if (wizardState.step === STEP.APPLICATION && !wizardState.selectedCategory) {
    return (
      <Fragment>
      <div className={`${ON_SITE ? 'pt-6' : ''} pb-12`}>
        {ON_SITE ? (
        // linemaster.com: the same navy band, but contained and rounded so it
        // lines up under the page's own "Product Finder" title (1170px is the
        // site's content column). The title is already there, so the band
        // carries just the eyebrow and the prompt.
        <div className="px-4 sm:px-8">
          <div className="lm-hero-band mx-auto rounded-[14px] px-6 pt-14 pb-36 md:pb-40" style={{ maxWidth: '1170px' }}>
            <p
              style={{ '--enter-y': '16px' } as React.CSSProperties}
              // ! margins: the site's theme sets p{margin:0 0 10px}
              className="lm-enter !text-2xl !font-semibold !text-white text-center !mt-0 !mb-0"
            >
              <span className="block mb-2">{wizardEyebrow}</span>
              Select your industry to begin. We'll guide you to the right footswitch.
            </p>
          </div>
        </div>
        ) : (
        // Navy band with a faint blueprint grid, after the PreSpec page's
        // hero. Full width on GitHub Pages. -mt-4 pulls it up under the
        // (transparent) toolbar row.
        <div className="lm-hero-band -mt-4 px-4 pt-24 pb-36 md:pb-40">
          <div
            className="lm-enter text-center"
            style={{ '--enter-y': '24px', '--enter-dur': '0.6s' } as React.CSSProperties}
          >
            {wizardEyebrow}
            <h1 className="!text-5xl md:!text-6xl !font-bold !tracking-[-0.01em] mb-5 leading-tight !text-white">
              Find Your Solution
            </h1>
            <p className="!text-xl !text-white/85" style={{ textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
              Select your industry to begin. We'll guide you to the right footswitch.
            </p>
          </div>
        </div>
        )}

        {/* On linemaster.com the cards sit 16px further in than the band on
            small screens, so a strip of navy still shows beside them */}
        <div className={`${ON_SITE ? 'px-8 sm:px-12' : 'px-4 sm:px-8'} lg:px-[10%] xl:px-[15%]`}>
        {/* Tighter gap in the narrow 3-column range (768-1023px) so the cards
            are wide enough for "Custom Aero / Crescent" on one line. The
            cards overlap the bottom of the navy band. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-5 lg:gap-8 mx-auto relative z-10 -mt-24 md:-mt-28" style={{ maxWidth: '960px' }}>
          {(categories || []).map((category, i) => (
            // Each card spans 4 rows of the outer grid and shares them through
            // CSS subgrid (photo / title / description / next choices), so
            // those rows line up across the three cards however text wraps.
            <div
              key={category.id}
              className="lm-enter min-w-0 row-span-4 grid grid-rows-subgrid gap-y-0"
              style={{ '--enter-y': '20px', '--enter-delay': `${0.15 + i * 0.08}s` } as React.CSSProperties}
            >
              <GlassCard
                hoverEffect
                interactive
                aria-label={category.label}
                className="row-span-4 grid grid-rows-subgrid gap-y-0 justify-items-center text-center min-w-0 p-8 md:p-6 lg:p-10 transition-all duration-300 group"
                onClick={() => onCategorySelect(category.id)}
              >
                <ProductVisual image={category.image} icon={category.icon} />
                {/* Slightly smaller in the narrow 3-column range (768-1023px) */}
                <span className="!text-2xl md:!text-xl lg:!text-2xl !font-semibold tracking-[-0.01em] mb-2 w-full">
                  <CategoryTitle label={category.label} />
                </span>
                <p className="!my-0 !text-base !text-muted-foreground text-balance">
                  <KeepHyphenated text={category.description} />
                </p>
                <CategoryPreview
                  apps={category.nextChoices ?? (applications || []).filter(a => a.parentCategory === category.id).map(a => a.label)}
                />
              </GlassCard>
            </div>
          ))}
        </div>

        {/* Shortcut for buyers who already know what they want */}
        <div
          className="lm-enter flex flex-col items-center gap-3 mt-8"
          style={{ '--enter-delay': '0.45s' } as React.CSSProperties}
        >
          <span className="!text-lg !font-medium">Already know what you need?</span>
          <Button
            variant="cta"
            onClick={onBrowseAll}
            className="gap-2 !text-sm h-auto max-w-full whitespace-normal text-center px-5 sm:px-7 py-3.5 group"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            Skip the questions: search &amp; compare all products
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Button>
        </div>

        {/* Trust Badges */}
        <div
          style={{ '--enter-delay': '0.6s', '--enter-dur': '0.8s' } as React.CSSProperties}
          className="lm-enter flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-3xl mx-auto mt-14 pt-8 border-t border-border/50"
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
        </div>
        </div>

      </div>
      {wizardCompanion}
      </Fragment>
    );
  }

  // Common wrapper for all steps after category selection
  return (
    <Fragment>
    <div className="pt-16 pb-16 px-4 sm:px-8 lg:px-[10%] xl:px-[15%]">
      <StepProgress displayStep={displayStep} displayTotal={displayTotal} progressPercent={progressPercent} />

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
        onJumpToStep={onJumpToStep}
      />

      {/* Screen reader announcements for step changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {stepAnnouncement}
      </div>

      <div className="w-full" ref={stepContentRef} tabIndex={-1} style={{ outline: 'none' }}>
        <StepNavRow
          onBack={onBack}
          rightAction={
            wizardState.step === STEP.FEATURES ? (
              <Button variant="ghost" onClick={onResumeOrContinue} className={NAV_LINK_CLASS}>
                Skip <ArrowRight className="w-4 h-4 ml-1 -mr-1" aria-hidden="true" />
              </Button>
            ) : currentAnswer ? (
              // Step already answered (user came back to review it): let them
              // move on without re-clicking a card.
              <Button variant="outline" onClick={onResumeOrContinue} className="gap-1">
                {wizardState.resumeStep === STEP.RESULTS ? 'Back to results' : 'Continue'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : null
          }
        />

        {/* Keyed so each step slides in fresh */}
        <div
          key={wizardState.step}
          className="lm-enter"
          style={{ '--enter-x': '12px', '--enter-dur': '0.18s' } as React.CSSProperties}
        >
            {/* Step 0 Phase 2: Application Selection */}
            {wizardState.step === STEP.APPLICATION && (
              <div className="space-y-6">
                <StepHeading
                  title="Select Your Application"
                  subtitle={selectedCategoryLabel
                    ? <>Within <span className="!font-semibold !text-foreground">{selectedCategoryLabel}</span>, which is closest to your use?</>
                    : 'Choose the specific use case for your footswitch'}
                />
                <div className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full mx-auto",
                  // Fewer than three options (Commercial has two): narrower,
                  // centered grid instead of a half-empty left-aligned row
                  filteredApplications.length >= 3 ? "lg:grid-cols-3" : "max-w-4xl"
                )}>
                  {filteredApplications.map((app, i) => (
                    <OptionCard
                      key={app.id}
                      label={app.label}
                      description={app.description}
                      icon={app.icon}
                      selected={wizardState.selectedApplication === app.id}
                      onClick={() => onApplicationSelect(app.id)}
                      index={i}
                      layout="row"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Technology */}
            {wizardState.step === STEP.TECHNOLOGY && (
              <div className="space-y-6">
                <StepHeading title="Select Technology" subtitle="Choose the switching mechanism for your application">
                  <p className="!text-sm !text-muted-foreground/80 mt-3 italic">
                    Pneumatic and Wireless skip the wiring and circuit questions — 2 fewer steps.
                  </p>
                </StepHeading>
                <OptionGrid md={3} className="w-full" role="radiogroup" aria-label="Select technology">
                  {(technologies || [])
                    .filter((t) => t.availableFor?.includes(wizardState.selectedApplication))
                    .map((tech, i) => (
                      <OptionCard
                        key={tech.id}
                        label={tech.label}
                        description={tech.description}
                        icon={tech.icon}
                        selected={wizardState.selectedTechnology === tech.id}
                        {...countProps(STEP.TECHNOLOGY, tech.id)}
                        onClick={() => handleSingleSelect(tech.id, wizardState.setSelectedTechnology, STEP.TECHNOLOGY)}
                        index={i}
                      />
                    ))}
                </OptionGrid>
              </div>
            )}

            {/* Step 2: Action */}
            {wizardState.step === STEP.ACTION && (
              <div className="space-y-6">
                <StepHeading title="Select Action Type" subtitle="How should the switch activate and deactivate?" />
                <OptionGrid sm={2} md={4} className="w-full" role="radiogroup" aria-label="Select action type">
                  {(actions || [])
                    .filter((a) => a.availableFor?.includes(wizardState.selectedTechnology))
                    .map((action, i) => (
                      <OptionCard
                        key={action.id}
                        label={action.label}
                        description={action.description}
                        icon={action.icon}
                        selected={wizardState.selectedAction === action.id}
                        {...(action.id === NO_PREFERENCE ? {} : countProps(STEP.ACTION, action.id))}
                        onClick={() => handleSingleSelect(action.id, wizardState.setSelectedAction, STEP.ACTION)}
                        index={i}
                      />
                    ))}
                </OptionGrid>
              </div>
            )}

            {/* Step 3: Environment */}
            {wizardState.step === STEP.ENVIRONMENT && (
              <div className="space-y-6">
                <StepHeading title="Operating Environment" subtitle="Where will the switch be used?" />
                <OptionGrid sm={2} md={3} className="w-full" role="radiogroup" aria-label="Select operating environment">
                  {(environments || []).map((env, i) => (
                    <OptionCard
                      key={env.id}
                      label={env.label}
                      icon={env.icon}
                      description={env.description}
                      selected={wizardState.selectedEnvironment === env.id}
                      {...countProps(STEP.ENVIRONMENT, env.id)}
                      onClick={() => handleSingleSelect(env.id, wizardState.setSelectedEnvironment, STEP.ENVIRONMENT)}
                      index={i}
                    />
                  ))}
                </OptionGrid>
              </div>
            )}

            {/* Step 4: Duty Rating */}
            {wizardState.step === STEP.DUTY && (
              <div className="space-y-6">
                <StepHeading title="Duty Rating" subtitle="How heavy will the usage be?" />
                <OptionGrid sm={2} md={4} className="w-full" role="radiogroup" aria-label="Select duty rating">
                  {(duties || []).map((duty, i) => (
                    <OptionCard
                      key={duty.id}
                      label={duty.label}
                      description={duty.description}
                      icon={duty.icon}
                      selected={wizardState.selectedDuty === duty.id}
                      {...(duty.id === NO_PREFERENCE ? {} : countProps(STEP.DUTY, duty.id))}
                      onClick={() => handleSingleSelect(duty.id, wizardState.setSelectedDuty, STEP.DUTY)}
                      index={i}
                    />
                  ))}
                </OptionGrid>
              </div>
            )}

            {/* Step 5: Connection Type */}
            {wizardState.step === STEP.CONNECTION && (
              <div className="space-y-6">
                <StepHeading title="Connection Type" subtitle="How should the switch connect to your equipment?" />
                <OptionGrid sm={2} md={4} className="w-full" role="radiogroup" aria-label="Select connection type">
                  {(connections || []).map((conn, i) => (
                    <OptionCard
                      key={conn.id}
                      label={conn.label}
                      description={conn.description}
                      icon={conn.icon}
                      selected={wizardState.selectedConnection === conn.id}
                      {...(conn.id === NO_PREFERENCE ? {} : countProps(STEP.CONNECTION, conn.id))}
                      onClick={() => handleSingleSelect(conn.id, wizardState.setSelectedConnection, STEP.CONNECTION)}
                      index={i}
                    />
                  ))}
                </OptionGrid>
              </div>
            )}

            {/* Step 6: Circuits Controlled */}
            {wizardState.step === STEP.CIRCUITS && (
              <div className="space-y-6">
                <StepHeading title="Circuits Controlled" subtitle="How many circuits do you need to control?" />
                <OptionGrid sm={2} md={3} className="w-full" role="radiogroup" aria-label="Select circuit count">
                  {(circuitCounts || []).map((cc, i) => (
                    <OptionCard
                      key={cc.id}
                      label={cc.label}
                      description={cc.description}
                      icon={cc.icon}
                      selected={wizardState.selectedCircuitCount === cc.id}
                      {...(cc.id === NO_PREFERENCE ? {} : countProps(STEP.CIRCUITS, cc.id))}
                      onClick={() => handleSingleSelect(cc.id, wizardState.setSelectedCircuitCount, STEP.CIRCUITS)}
                      index={i}
                    />
                  ))}
                </OptionGrid>
              </div>
            )}

            {/* Step 7: Safety Guard */}
            {wizardState.step === STEP.GUARD && (
              <div className="space-y-6">
                <StepHeading title="Safety Guard" subtitle="Do you need protection against accidental activation?" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full" role="radiogroup" aria-label="Select safety guard option">
                  <OptionCard
                    label="Yes, Add Guard"
                    description="Safety guard prevents accidental activation."
                    icon={ShieldCheck}
                    selected={wizardState.selectedGuard === 'yes'}
                    {...countProps(STEP.GUARD, 'yes')}
                    onClick={() => handleSingleSelect('yes', wizardState.setSelectedGuard, STEP.GUARD)}
                    index={0}
                  />
                  <OptionCard
                    label="Not Required"
                    description="Show switches with or without a guard."
                    icon={ShieldOff}
                    selected={wizardState.selectedGuard === 'no'}
                    {...countProps(STEP.GUARD, 'no')}
                    onClick={() => handleSingleSelect('no', wizardState.setSelectedGuard, STEP.GUARD)}
                    index={1}
                  />
                </div>
              </div>
            )}

            {/* Step 8: Additional Features (Multi-select) */}
            {wizardState.step === STEP.FEATURES && (
              <div className="space-y-6">
                <StepHeading title="Additional Features" subtitle="Select any that apply, or skip to view results." />
                <OptionGrid sm={2} gap={5} className="max-w-3xl mx-auto">
                  {(features || [])
                    // The guard was already asked on its own step — don't ask twice
                    .filter((f) => f.id !== 'shield')
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
                </OptionGrid>
                <div className="flex justify-center pt-6">
                  <Button
                    size="lg"
                    variant="cta"
                    onClick={onContinue}
                    className="px-10 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    View Results <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
    {wizardCompanion}
    </Fragment>
  );
}
