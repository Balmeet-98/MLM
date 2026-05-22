import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminLuckyDraw() {
  const [groups, setGroups] = useState([]);
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [monthNumber, setMonthNumber] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [scheduleMonth, setScheduleMonth] = useState('');
  const [scheduleGroup, setScheduleGroup] = useState('');
  const [running, setRunning] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [result, setResult] = useState(null);

  const loadData = () => {
    api.get('/admin/groups').then((r) => setGroups(r.data.groups));
    api.get('/admin/lucky-draw/history').then((r) => setHistory(r.data.draws));
    api.get('/admin/lucky-draw/schedules').then((r) => setSchedules(r.data.schedules)).catch(() => setSchedules([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleGroup || !scheduleMonth || !drawDate) return;
    setScheduling(true);
    try {
      const { data } = await api.post(`/admin/lucky-draw/${scheduleGroup}/schedule`, {
        monthNumber: parseInt(scheduleMonth, 10),
        drawDate,
      });
      toast.success(data.message || 'Scheduled and members notified');
      setDrawDate('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to schedule');
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelSchedule = async (id) => {
    try {
      await api.patch(`/admin/lucky-draw/schedules/${id}/cancel`);
      toast.success('Schedule cancelled');
      loadData();
    } catch {
      toast.error('Could not cancel');
    }
  };

  const handleDraw = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !monthNumber) return;
    setRunning(true);
    setResult(null);
    try {
      const { data } = await api.post(`/admin/lucky-draw/${selectedGroup}`, {
        monthNumber: parseInt(monthNumber, 10),
      });
      setResult(data);
      toast.success(`Draw complete! ${data.winners?.length} winner(s) selected`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Draw failed');
    } finally {
      setRunning(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Lucky Draw</h1>
        <p className="page-subtitle">Schedule draw dates, notify all members, then run the draw</p>
      </div>

      {/* Schedule + notify */}
      <div className="card border-2 border-purple-200 bg-purple-50/50">
        <h2 className="font-bold text-slate-800 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          📅 Schedule lucky draw date
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Pick a date — every active member gets a notification that the lucky draw happens on that day.
        </p>
        <form onSubmit={handleSchedule} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium text-gray-700">Group</label>
            <select
              className="input mt-1"
              value={scheduleGroup}
              onChange={(e) => setScheduleGroup(e.target.value)}
              required
            >
              <option value="">Choose group...</option>
              {groups.filter((g) => g.status === 'active').map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.memberCount} members)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Month (1–16)</label>
            <input
              type="number"
              min={1}
              max={17}
              className="input mt-1 w-28"
              value={scheduleMonth}
              onChange={(e) => setScheduleMonth(e.target.value)}
              required
              placeholder="3"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Draw date</label>
            <input
              type="date"
              min={today}
              className="input mt-1"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={scheduling} className="btn-primary whitespace-nowrap">
            {scheduling ? 'Sending…' : '📢 Notify all members'}
          </button>
        </form>
      </div>

      {/* Upcoming schedules */}
      {schedules.length > 0 && (
        <div className="card-flat">
          <div className="px-5 py-4 border-b">
            <h2 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>
              Upcoming scheduled draws
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {schedules.map((s) => (
              <div key={s.id} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {s.groups?.name || 'Group'} — Month {s.month_number}
                  </p>
                  <p className="text-sm text-purple-700 font-bold mt-0.5">
                    🎰 {format(new Date(`${s.draw_date}T12:00:00`), 'EEEE, d MMMM yyyy')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCancelSchedule(s.id)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run draw */}
      <div className="card border border-amber-100 bg-amber-50/60">
        <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          🎰 Run lucky draw (pick winners)
        </h2>
        <form onSubmit={handleDraw} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">Select Group</label>
            <select
              className="input mt-1"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              required
            >
              <option value="">Choose group...</option>
              {groups.filter((g) => g.status === 'active').map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.memberCount} members)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Month Number (1–16)</label>
            <input
              type="number"
              min={1}
              max={17}
              className="input mt-1 w-32"
              value={monthNumber}
              onChange={(e) => setMonthNumber(e.target.value)}
              required
              placeholder="e.g. 3"
            />
          </div>
          <button type="submit" disabled={running} className="btn-primary whitespace-nowrap">
            {running ? '🎲 Drawing...' : '🎰 Run Draw'}
          </button>
        </form>

        <div className="mt-3 text-xs text-yellow-700 space-y-0.5">
          <p>• Schedule the date first so members know when the draw happens</p>
          <p>• Only members with installments paid up to that month are eligible</p>
          <p>• Month 16 draws 24 winners (7 AC + 7 TV + 10 Bikes)</p>
        </div>
      </div>

      {result && (
        <div className="card border-2 border-green-400 bg-green-50">
          <h3 className="font-bold text-green-800 mb-3">🏆 Draw Results ({result.eligibleCount} eligible)</h3>
          <div className="space-y-2">
            {result.winners?.map((w, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-bold">{w.winner.name}</p>
                  <p className="text-xs text-gray-500">
                    Won: <strong>{w.reward}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-flat">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>
            Draw History
          </h2>
        </div>
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎰</div>
            <p>No draws conducted yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {history.map((d) => (
              <div
                key={d.id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{d.users?.name}</p>
                  <p className="text-xs text-slate-400">
                    Month {d.month_number} &nbsp;·&nbsp; {d.reward_catalog?.reward_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">{format(new Date(d.drawn_at), 'dd MMM yyyy')}</p>
                  <span className={`badge ${d.status === 'collected' ? 'badge-green' : 'badge-yellow'}`}>
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
