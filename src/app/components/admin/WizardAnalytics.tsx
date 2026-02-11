import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabase';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface WizardEvent {
  id: number;
  session_id: string;
  event_type: string;
  flow: string | null;
  step: number | null;
  data: Record<string, unknown>;
  created_at: string;
}

type TimeRange = 'today' | '7d' | '30d' | 'all';

export function WizardAnalytics() {
  const [events, setEvents] = useState<WizardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>('7d');

  const loadEvents = async () => {
    setLoading(true);
    let query = supabase.from('wizard_events').select('*').order('created_at', { ascending: false });

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

    const { data, error } = await query.limit(5000);
    if (error) {
      console.error('Failed to load analytics:', error);
    } else {
      setEvents((data as WizardEvent[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [range]);

  const stats = useMemo(() => {
    const sessions = new Set(events.map(e => e.session_id));
    const totalSessions = sessions.size;

    // Flow split
    const flowEvents = events.filter(e => e.event_type === 'flow_select');
    const standardFlows = flowEvents.filter(e => e.flow === 'standard').length;
    const medicalFlows = flowEvents.filter(e => e.flow === 'medical').length;

    // Event type counts
    const typeCounts: Record<string, number> = {};
    for (const e of events) {
      typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1;
    }

    // PDF downloads
    const pdfDownloads = typeCounts['pdf_download'] || 0;

    // No results
    const noResults = typeCounts['no_results'] || 0;

    // Result views
    const resultViews = typeCounts['result_view'] || 0;

    // Completion rate: sessions with result_view / sessions with flow_select
    const sessionsWithFlow = new Set(flowEvents.map(e => e.session_id));
    const sessionsWithResult = new Set(events.filter(e => e.event_type === 'result_view').map(e => e.session_id));
    const completionRate = sessionsWithFlow.size > 0
      ? Math.round((sessionsWithResult.size / sessionsWithFlow.size) * 100)
      : 0;

    // Popular selections by step
    const selections = events.filter(e => e.event_type === 'selection');
    const selectionsByStep: Record<number, Record<string, number>> = {};
    for (const e of selections) {
      if (e.step == null) continue;
      if (!selectionsByStep[e.step]) selectionsByStep[e.step] = {};
      const data = e.data as Record<string, string>;
      // Collect all values from the data object
      for (const val of Object.values(data)) {
        if (typeof val === 'string' && val) {
          selectionsByStep[e.step][val] = (selectionsByStep[e.step][val] || 0) + 1;
        }
      }
    }

    // Recent events (latest 20)
    const recentEvents = events.slice(0, 20);

    return {
      totalSessions,
      standardFlows,
      medicalFlows,
      pdfDownloads,
      noResults,
      resultViews,
      completionRate,
      typeCounts,
      selectionsByStep,
      recentEvents,
    };
  }, [events]);

  const ranges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' },
  ];

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
        <span className="text-sm text-gray-500">{events.length} events</span>
      </div>

      {loading && events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading analytics...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No events recorded yet. Use the wizard to generate analytics data.
        </div>
      ) : (
        <>
          {/* Top stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Sessions" value={stats.totalSessions} />
            <StatCard label="Completion Rate" value={`${stats.completionRate}%`} />
            <StatCard label="PDF Downloads" value={stats.pdfDownloads} />
            <StatCard label="No Results" value={stats.noResults} />
          </div>

          {/* Flow split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Flow Split</h3>
              {stats.standardFlows + stats.medicalFlows > 0 ? (
                <div className="space-y-3">
                  <FlowBar label="Standard" count={stats.standardFlows} total={stats.standardFlows + stats.medicalFlows} color="bg-blue-500" />
                  <FlowBar label="Medical" count={stats.medicalFlows} total={stats.standardFlows + stats.medicalFlows} color="bg-purple-500" />
                </div>
              ) : (
                <p className="text-sm text-gray-400">No flow data yet</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Event Types</h3>
              <div className="space-y-2">
                {Object.entries(stats.typeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{type.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Popular selections by step */}
          {Object.keys(stats.selectionsByStep).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Popular Selections by Step</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.selectionsByStep)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([step, selections]) => (
                    <div key={step} className="space-y-1.5">
                      <p className="text-xs font-medium text-gray-500 uppercase">Step {step}</p>
                      {Object.entries(selections)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([val, count]) => (
                          <div key={val} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300 truncate mr-2">{val}</span>
                            <span className="text-gray-500 shrink-0">{count}</span>
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent events */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Events</h3>
            </div>
            <div className="overflow-auto max-h-80">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left text-gray-500">Time</th>
                    <th className="px-3 py-2 text-left text-gray-500">Type</th>
                    <th className="px-3 py-2 text-left text-gray-500">Flow</th>
                    <th className="px-3 py-2 text-left text-gray-500">Step</th>
                    <th className="px-3 py-2 text-left text-gray-500">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEvents.map((e) => (
                    <tr key={e.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-1.5 text-gray-500 whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-1.5 text-gray-900 dark:text-white">{e.event_type.replace(/_/g, ' ')}</td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{e.flow || '—'}</td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{e.step ?? '—'}</td>
                      <td className="px-3 py-1.5 text-gray-500 font-mono text-xs max-w-48 truncate">
                        {Object.keys(e.data).length > 0 ? JSON.stringify(e.data) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function FlowBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500">{count} ({pct}%)</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
