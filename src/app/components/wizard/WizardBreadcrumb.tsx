import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Option } from '@/app/data/options';
import type { WizardState } from '@/app/hooks/useWizardState';

interface WizardBreadcrumbProps {
  wizardState: WizardState;
  applications: Option[];
  technologies: Option[];
  actions: Option[];
  environments: Option[];
  duties: Option[];
  connections: Option[];
  circuitCounts: Option[];
  features: Option[];
  onJumpToStep: (step: number) => void;
}

interface Crumb {
  step: number;
  label: string;
  value: string;
}

// Compact summary value: "no_preference" reads as "Any", multi-select arrays
// truncate to "first, +N more" so the bar stays scannable on a phone.
function formatMulti(ids: string[], options: Option[], cap = 2): string {
  if (ids.length === 0) return '';
  const labels = ids.map(id => options.find(o => o.id === id)?.label ?? id);
  if (labels.length <= cap) return labels.join(', ');
  return `${labels.slice(0, cap).join(', ')} +${labels.length - cap}`;
}

function labelFor(options: Option[], id: string): string {
  if (id === 'no_preference') return 'Any';
  return options.find(o => o.id === id)?.label ?? id;
}

/**
 * Horizontal strip of clickable chips summarising the user's prior choices.
 * Each chip jumps back to that step without clearing downstream selections —
 * if the user then picks a different option at the destination, the existing
 * handleSingleSelect machinery clears downstream for them.
 */
export const WizardBreadcrumb = memo(function WizardBreadcrumb({
  wizardState,
  applications,
  technologies,
  actions,
  environments,
  duties,
  connections,
  circuitCounts,
  features,
  onJumpToStep,
}: WizardBreadcrumbProps) {
  const crumbs: Crumb[] = [];

  if (wizardState.selectedApplication) {
    crumbs.push({
      step: 0,
      label: 'Industry',
      value: labelFor(applications, wizardState.selectedApplication),
    });
  }
  if (wizardState.selectedTechnology) {
    crumbs.push({
      step: 1,
      label: 'Tech',
      value: labelFor(technologies, wizardState.selectedTechnology),
    });
  }
  if (wizardState.selectedAction) {
    crumbs.push({
      step: 2,
      label: 'Action',
      value: labelFor(actions, wizardState.selectedAction),
    });
  }
  if (wizardState.selectedEnvironment) {
    crumbs.push({
      step: 3,
      label: 'Env',
      value: labelFor(environments, wizardState.selectedEnvironment),
    });
  }
  if (wizardState.selectedDuty) {
    crumbs.push({
      step: 4,
      label: 'Duty',
      value: labelFor(duties, wizardState.selectedDuty),
    });
  }
  if (wizardState.selectedConnection) {
    crumbs.push({
      step: 5,
      label: 'Wiring',
      value: labelFor(connections, wizardState.selectedConnection),
    });
  }
  if (wizardState.selectedCircuitCount) {
    crumbs.push({
      step: 6,
      label: 'Circuits',
      value: labelFor(circuitCounts, wizardState.selectedCircuitCount),
    });
  }
  if (wizardState.selectedGuard) {
    crumbs.push({
      step: 7,
      label: 'Guard',
      value: wizardState.selectedGuard === 'yes' ? 'Required' : 'Not needed',
    });
  }
  if (wizardState.selectedFeatures.length > 0) {
    crumbs.push({
      step: 8,
      label: 'Features',
      value: formatMulti(wizardState.selectedFeatures, features),
    });
  }

  // Don't render an empty bar — happens on the very first step
  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Your wizard answers"
      className="mx-auto mb-6"
      style={{ maxWidth: '900px' }}
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 px-1">
        {crumbs.map((c, idx) => (
          <div key={c.step} className="flex items-center gap-2 shrink-0">
            {idx > 0 && (
              <ChevronRight className="w-4 h-4 !text-muted-foreground/40" aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={() => onJumpToStep(c.step)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 hover:bg-muted hover:border-primary/40 active:scale-[0.97] transition-all px-3 py-1 text-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              title={`Edit your ${c.label} answer`}
              aria-label={`Edit ${c.label}: ${c.value}`}
            >
              <span className="!text-muted-foreground">{c.label}:</span>
              <span className="!font-semibold !text-foreground">{c.value}</span>
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
});
