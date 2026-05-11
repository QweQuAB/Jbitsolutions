import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Users, Eye, Cpu, Clock, Zap, Monitor,
  Smartphone, TrendingUp, MousePointer, Activity,
  ChevronLeft, ChevronRight, Server, BarChart2, List
} from 'lucide-react';
import { api } from '../../api';
import PageHeader from '../../components/PageHeader';
import Btn from '../../components/Btn';
import styles from './TrafficLogs.module.css';

const METHOD_COLORS = { GET: 'get', POST: 'post', PUT: 'put', DELETE: 'delete', PATCH: 'patch' };

function statusColor(code) {
  if (code >= 500) return 'status5xx';
  if (code >= 400) return 'status4xx';
  if (code >= 300) return 'status3xx';
  return 'status2xx';
}

function fmtUptime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function MemBar({ used, total, label }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const color = pct > 80 ? 'var(--danger)' : pct > 60 ? 'var(--warning)' : 'var(--accent3)';
  return (
    <div className={styles.memBar}>
      <div className={styles.memBarTop}>
        <span className={styles.memBarLabel}>{label}</span>
        <span className={styles.memBarVal}>{used} MB <span className={styles.memBarPct}>/ {total} MB</span></span>
      </div>
      <div className={styles.memBarTrack}>
        <div className={styles.memBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function HourlyChart({ data }) {
  if (!data || data.length === 0) return (
    <div className={styles.chartEmpty}>No traffic data in last 24h</div>
  );
  const max = Math.max(...data.map(d => parseInt(d.hits)));
  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const now = new Date();

  const byHour = {};
  data.forEach(d => {
    const h = new Date(d.hour).getHours();
    byHour[h] = parseInt(d.hits);
  });

  return (
    <div className={styles.chart}>
      {allHours.map(h => {
        const hits = byHour[h] || 0;
        const pct = max > 0 ? (hits / max) * 100 : 0;
        const isNow = h === now.getHours();
        return (
          <div key={h} className={styles.chartCol}>
            <div className={styles.chartBar} title={`${h}:00 — ${hits} requests`}>
              <div
                className={`${styles.chartFill} ${isNow ? styles.chartFillNow : ''}`}
                style={{ height: `${Math.max(pct, hits > 0 ? 4 : 0)}%` }}
              />
            </div>
            {h % 4 === 0 && <div className={styles.chartLabel}>{h}:00</div>}
          </div>
        );
      })}
    </div>
  );
}

export default function TrafficLogs() {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const limit = 50;

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
      setLastRefresh(new Date());
    } catch (e) {}
    setLoading(false);
  }, []);

  const loadLogs = useCallback(async () => {
    setLogLoading(true);
    try {
      const data = await api.getLogs(limit, page * limit);
      setLogs(data.logs);
      setLogTotal(data.total);
    } catch (e) {}
    setLogLoading(false);
  }, [page]);

  useEffect(() => { loadAnalytics(); }, []);
  useEffect(() => { if (tab === 'logs') loadLogs(); }, [tab, page]);

  function refresh() {
    if (tab === 'analytics') loadAnalytics();
    else loadLogs();
  }

  const a = analytics;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Visitor Analytics" subtitle="Real-time traffic, interactions & server health" badge="// TRAFFIC">
        <div className={styles.headerRight}>
          {lastRefresh && (
            <span className={styles.lastRefresh}>
              Updated {fmtTime(lastRefresh)}
            </span>
          )}
          <Btn variant="secondary" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </Btn>
        </div>
      </PageHeader>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'analytics' ? styles.tabActive : ''}`}
          onClick={() => setTab('analytics')}>
          <BarChart2 size={14} /> Analytics
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'logs' ? styles.tabActive : ''}`}
          onClick={() => setTab('logs')}>
          <List size={14} /> Raw Logs
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'analytics' ? (
          <motion.div key="analytics"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {loading ? (
              <div className={styles.skeletonGrid}>
                {[...Array(8)].map((_, i) => <div key={i} className={styles.skeleton} style={{ height: i < 4 ? 96 : 200 }} />)}
              </div>
            ) : !a ? (
              <div className={styles.errMsg}>Failed to load analytics. Check that the backend is running.</div>
            ) : (
              <>
                {/* ── Visitor KPIs ── */}
                <div className={styles.kpiGrid}>
                  <KpiCard
                    icon={<Users size={18} />}
                    label="Unique Visitors Today"
                    value={a.visitors.unique_today}
                    sub={`${a.visitors.unique_total} total all-time`}
                    color="accent" />
                  <KpiCard
                    icon={<Eye size={18} />}
                    label="Page Views Today"
                    value={a.visitors.page_views_today}
                    sub={`${a.visitors.page_views_total} all-time`}
                    color="purple" />
                  <KpiCard
                    icon={<Clock size={18} />}
                    label="Avg Response Time"
                    value={`${a.resources.avg_response_ms} ms`}
                    sub={`Peak ${a.resources.max_response_ms} ms (last hour)`}
                    color="green" />
                  <KpiCard
                    icon={<Zap size={18} />}
                    label="Requests / Min"
                    value={a.resources.requests_per_minute}
                    sub="Live server load"
                    color="orange" />
                </div>

                {/* ── Hourly Chart ── */}
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <TrendingUp size={15} />
                    <span>Hourly Traffic — Last 24 Hours</span>
                    <span className={styles.panelBadge}>{a.hourlyTraffic.reduce((s, d) => s + parseInt(d.hits), 0)} requests</span>
                  </div>
                  <HourlyChart data={a.hourlyTraffic} />
                </div>

                <div className={styles.twoCol}>
                  {/* ── Server Resources ── */}
                  <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <Server size={15} />
                      <span>Server Resources</span>
                      <span className={styles.uptimeBadge}>Up {fmtUptime(a.resources.uptime_seconds)}</span>
                    </div>
                    <div className={styles.panelBody}>
                      <MemBar
                        label="Heap Memory"
                        used={a.resources.memory_heap_used_mb}
                        total={a.resources.memory_heap_total_mb} />
                      <MemBar
                        label="RSS (Process)"
                        used={a.resources.memory_rss_mb}
                        total={Math.max(a.resources.memory_rss_mb, a.resources.memory_heap_total_mb) + 30} />
                      <div className={styles.resourceRow}>
                        <div className={styles.resourceItem}>
                          <Cpu size={14} />
                          <span className={styles.resourceLabel}>Node.js Process</span>
                          <span className={styles.resourceVal}>Running</span>
                        </div>
                        <div className={styles.resourceItem}>
                          <Activity size={14} />
                          <span className={styles.resourceLabel}>Req / min (live)</span>
                          <span className={`${styles.resourceVal} ${styles.accent}`}>{a.resources.requests_per_minute}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Device Split ── */}
                  <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <Monitor size={15} />
                      <span>Devices Today</span>
                    </div>
                    <div className={styles.panelBody}>
                      <DeviceSplit
                        mobile={parseInt(a.deviceSplit.mobile) || 0}
                        desktop={parseInt(a.deviceSplit.desktop) || 0} />
                    </div>
                  </div>
                </div>

                <div className={styles.twoCol}>
                  {/* ── Top Pages ── */}
                  <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <Eye size={15} />
                      <span>Top Pages</span>
                    </div>
                    <div className={styles.rankList}>
                      {a.topPages.length === 0 ? (
                        <div className={styles.emptySmall}>No page views tracked yet</div>
                      ) : (() => {
                        const maxV = Math.max(...a.topPages.map(p => parseInt(p.views)));
                        return a.topPages.map((p, i) => (
                          <div key={i} className={styles.rankRow}>
                            <div className={styles.rankNum}>{i + 1}</div>
                            <div className={styles.rankInfo}>
                              <div className={styles.rankName}>{p.page}</div>
                              <div className={styles.rankBar}>
                                <div className={styles.rankBarFill}
                                  style={{ width: `${(parseInt(p.views) / maxV) * 100}%` }} />
                              </div>
                            </div>
                            <div className={styles.rankCount}>{p.views}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* ── Top Interactions ── */}
                  <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <MousePointer size={15} />
                      <span>Top Interactions</span>
                    </div>
                    <div className={styles.rankList}>
                      {a.topInteractions.length === 0 ? (
                        <div className={styles.emptySmall}>No interactions tracked yet. Try clicking on the site!</div>
                      ) : (() => {
                        const maxV = Math.max(...a.topInteractions.map(p => parseInt(p.count)));
                        return a.topInteractions.map((p, i) => (
                          <div key={i} className={styles.rankRow}>
                            <div className={styles.rankNum}>{i + 1}</div>
                            <div className={styles.rankInfo}>
                              <div className={styles.rankName}>
                                <span className={styles.interactionType}>{p.type}</span>
                                {p.detail && <span className={styles.interactionDetail}>{p.detail}</span>}
                              </div>
                              <div className={styles.rankBar}>
                                <div className={styles.rankBarFill}
                                  style={{ width: `${(parseInt(p.count) / maxV) * 100}%`, background: 'var(--accent2)' }} />
                              </div>
                            </div>
                            <div className={styles.rankCount}>{p.count}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* ── Recent Interactions ── */}
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <Activity size={15} />
                    <span>Recent Visitor Activity</span>
                    <span className={styles.panelBadge}>Last 20 events</span>
                  </div>
                  <div className={styles.activityList}>
                    {a.recentInteractions.length === 0 ? (
                      <div className={styles.emptySmall}>No interactions yet</div>
                    ) : a.recentInteractions.map((ev, i) => (
                      <div key={i} className={styles.activityRow}>
                        <div className={`${styles.activityDot} ${ev.type === 'pageview' ? styles.dotView : styles.dotClick}`} />
                        <div className={styles.activityInfo}>
                          <span className={styles.activityPage}>{ev.page}</span>
                          {ev.detail && <span className={styles.activityDetail}>→ {ev.detail}</span>}
                        </div>
                        <div className={styles.activityMeta}>
                          <span className={styles.activityIp}>{ev.ip}</span>
                          <span className={styles.activityTime}>{fmtDateTime(ev.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="logs"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className={styles.logTable}>
              <div className={styles.tableHead}>
                <div>Time</div>
                <div>Method</div>
                <div>Path</div>
                <div>Status</div>
                <div>Response</div>
                <div>IP</div>
              </div>

              {logLoading ? (
                [...Array(12)].map((_, i) => <div key={i} className={styles.skeleton} style={{ height: 38, margin: '2px 0' }} />)
              ) : logs.length === 0 ? (
                <div className={styles.emptyLogs}>
                  <Activity size={32} style={{ opacity: 0.25, marginBottom: 12 }} />
                  <div>No logs yet.</div>
                </div>
              ) : logs.map((log, i) => (
                <motion.div key={log.id} className={styles.logRow}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.008 }}>
                  <div className={styles.cellTime}>{fmtTime(log.created_at)}</div>
                  <div>
                    <span className={`${styles.methodBadge} ${styles[METHOD_COLORS[log.method] || 'get']}`}>
                      {log.method}
                    </span>
                  </div>
                  <div className={styles.cellPath}>{log.path}</div>
                  <div>
                    <span className={`${styles.statusCode} ${styles[statusColor(log.status_code)]}`}>
                      {log.status_code}
                    </span>
                  </div>
                  <div className={styles.cellMs}>{log.response_time_ms}ms</div>
                  <div className={styles.cellIp}>{log.ip}</div>
                </motion.div>
              ))}
            </div>

            {logTotal > limit && (
              <div className={styles.pagination}>
                <Btn variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                  <ChevronLeft size={14} /> Prev
                </Btn>
                <span className={styles.pageInfo}>{page + 1} / {Math.ceil(logTotal / limit)} &nbsp;·&nbsp; {logTotal.toLocaleString()} total</span>
                <Btn variant="ghost" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= logTotal}>
                  Next <ChevronRight size={14} />
                </Btn>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  const colorMap = {
    accent: 'var(--accent)',
    purple: 'var(--accent2)',
    green: 'var(--accent3)',
    orange: 'var(--warning)',
  };
  const c = colorMap[color] || 'var(--accent)';
  return (
    <div className={styles.kpiCard} style={{ '--kpi-color': c }}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiSub}>{sub}</div>
    </div>
  );
}

function DeviceSplit({ mobile, desktop }) {
  const total = mobile + desktop;
  const mobilePct = total > 0 ? Math.round((mobile / total) * 100) : 50;
  const desktopPct = 100 - mobilePct;
  return (
    <div className={styles.deviceSplit}>
      <div className={styles.deviceBar}>
        <div className={styles.deviceBarMobile} style={{ width: `${mobilePct}%` }} />
        <div className={styles.deviceBarDesktop} style={{ width: `${desktopPct}%` }} />
      </div>
      <div className={styles.deviceLegend}>
        <div className={styles.deviceItem}>
          <Smartphone size={14} />
          <span>Mobile</span>
          <strong>{mobile}</strong>
          <span className={styles.devicePct}>{mobilePct}%</span>
        </div>
        <div className={styles.deviceItem}>
          <Monitor size={14} />
          <span>Desktop</span>
          <strong>{desktop}</strong>
          <span className={styles.devicePct}>{desktopPct}%</span>
        </div>
      </div>
      {total === 0 && <div className={styles.emptySmall}>No device data yet</div>}
    </div>
  );
}
