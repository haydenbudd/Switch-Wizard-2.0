import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabase';
import { RefreshCw, TrendingDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface WizardEvent {
  session_id: string;
  event_type: string;
  flow: string | null;
  step: number | null;
}

type TimeRange = 'today' | '7d' | '30d' | 'all';

interface FunnelStage {
  label: string;
  count: number;
  percent: number;
  dropoff: number;
}

const STEP_LABELS: Record<number, string> = {
  0: 'Application',
  1: 'Technology',
  2: 'Action',
  3: 'Environment',
  4: 'Duty',
  5: 'Connection',
  6: 'Guard',
  7: 'Features',
};

export function FunnelAnalysis() {
  const [events, setEvents] = useState<WizardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>('30d');

  const loadEvents = async () => {
    setLoading(true);
    let query = supabase
      .from('wizard_events')
      .select('session_id, event_type, flow, step')
      .order('created_at', { ascending: false });

    if (range !== 'all') {
      const now = new Date();
      let from: Date;
      if (range === 'today') {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (range === '7d') {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      query = query.gte('created_at', from.toISOString());
    }

    const { data, error } = await query.limit(10000);
    if (error) {
      console.error('Failed to load funnel data:', error);
    } else {
      setEvents((data as WizardEvent[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [range]);

  const { standardFunnel, medicalFunnel, totalSessions } = useMemo(() => {
    // Group events by session
    const sessions = new Map<string, { flow: string | null; maxStep: number; hasResults: boolean; hasPDF: boolean }>();

    for (const e of events) {
      let session = sessions.get(e.session_id);
      if (!session) {
        session = { flow: null, maxStep: -1, hasResults: false, hasPDF: false };
        sessions.set(e.session_id, session);
      }

      if (e.event_type === 'flow_select' && e.flow) session.flow = e.flow;
      if (e.event_type === 'step_view' && e.step != null && e.step > session.maxStep) session.maxStep = e.step;
      if (e.event_type === 'result_view') session.hasResults = true;
      if (e.event_type === 'pdf_download') session.hasPDF = true;
      if (e.flow && !session.flow) session.flow = e.flow;
    }

    const buildFunnel = (flow: string): FunnelStage[] => {
      const flowSessions = [...sessions.values()].filter(s => s.flow === flow);
      const total = flowSessions.length;
      if (total === 0) return [];

      const stages: { label: string; count: number }[] = [
        { label: 'Started', count: total },
      ];

      // Steps 0-7 for standard, fewer for medical
      const maxStepToShow = flow === 'standard' ? 7 : 5;
      for (let step = 0; step <= maxStepToShow; step++) {
        const label = STEP_LABELS[step] || `Step ${step}`;
        const count = flowSessions.filter(s => s.maxStep >= step).length;
        stages.push({ label, count });
      }

      stages.push({
        label: 'Results',
        count: flowSessions.filter(s => s.hasResults).length,
      });

      stages.push({
        label: 'PDF Download',
        count: flowSessions.filter(s => s.hasPDF).length,
      });

      return stages.map((stage, i) => {
        const prev = i > 0 ? stages[i - 1].count : stage.count;
        const dropoff = prev > 0 ? Math.round(((prev - stage.count) / prev) * 100) : 0;
        return {
          label: stage.label,
          count: stage.count,
          percent: total > 0 ? Math.round((stage.count / total) * 100) : 0,
          dropoff: i === 0 ? 0 : dropoff,
        };
      });
    };

    return {
      standardFunnel: buildFunnel('standard'),
      medicalFunnel: buildFunnel('medical'),
      totalSessions: sessions.size,
    };
  }, [events]);

  const ranges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const FunnelChart = ({ stages, title }: { stages: FunnelStage[]; title: string }) => {
    if (stages.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{title}</h3>
          <p className="text-sm text-gray-400 text-center py-8">No sessions recorded for this flow</p>
        </div>
      );
    }

    const maxCount = stages[0].count;
    const worstDropoff = Math.max(...stages.map(s => s.dropoff));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{title}</h3>
        <div className="space-y-2">
          {stages.map((stage, i) => {
            const barWidth = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            // Gradient from blue to green
            const hue = 210 + (i / (stages.length - 1)) * 90; // 210 (blue) → 300... actually let's go blue→emerald
            const isWorstDropoff = stage.dropoff > 0 && stage.dropoff === worstDropoff;

            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-24 text-right">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stage.label}</span>
                </div>
                <div className="flex-1 relative">
                  <div className="h-7 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        background: `hsl(${210 + (i / Math.max(stages.length - 1, 1)) * 50}, 70%, ${55 - i * 2}%)`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{stage.count}</span>
                  <span className="text-xs text-gray-400 ml-1">({stage.percent}%)</span>
                </div>
                <div className="w-16 text-right">
                  {stage.dropoff > 0 ? (
                    <span className={`text-xs flex items-center justify-end gap-0.5 ${isWorstDropoff ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {isWorstDropoff && <TrendingDown className="w-3 h-3" />}
                      -{stage.dropoff}%
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {ranges.map(r => (
            <button
              key={r.value}
              className={`px-3 py-1.5 text-sm ${range === r.value ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <span className="text-sm text-gray-500">{totalSessions} sessions</span>
      </div>

      {loading && events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading funnel data...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No events recorded yet. Use the wizard to generate funnel data.
        </div>
      ) : (
        <div className="space-y-6">
          <FunnelChart stages={standardFunnel} title="Standard Flow Funnel" />
          <FunnelChart stages={medicalFunnel} title="Medical Flow Funnel" />
        </div>
      )}
    </div>
  );
}
