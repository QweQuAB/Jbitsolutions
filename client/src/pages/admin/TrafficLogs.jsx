import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Activity } from 'lucide-react';
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

export default function TrafficLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => { load(); }, [page]);

  async function load() {
    setLoading(true);
    api.getLogs(limit, page * limit).then(d => {
      setLogs(d.logs); setTotal(d.total); setLoading(false);
    }).catch(() => setLoading(false));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Traffic Logs" subtitle={`${total.toLocaleString()} total requests logged`} badge="// LOGS">
        <Btn variant="secondary" onClick={load}><RefreshCw size={14} />Refresh</Btn>
      </PageHeader>

      <div className={styles.logTable}>
        <div className={styles.tableHead}>
          <div>Time</div>
          <div>Method</div>
          <div>Path</div>
          <div>Status</div>
          <div>Response</div>
          <div>IP</div>
        </div>

        {loading ? (
          [...Array(10)].map((_, i) => <div key={i} className={styles.skeleton} />)
        ) : logs.length === 0 ? (
          <div className={styles.empty}>
            <Activity size={32} className={styles.emptyIcon} />
            <div>No logs yet. Traffic will appear here as requests come in.</div>
          </div>
        ) : (
          logs.map((log, i) => (
            <motion.div key={log.id} className={styles.logRow}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}>
              <div className={styles.cellTime}>{new Date(log.created_at).toLocaleTimeString()}</div>
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
          ))
        )}
      </div>

      {total > limit && (
        <div className={styles.pagination}>
          <Btn variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Btn>
          <span className={styles.pageInfo}>{page + 1} / {Math.ceil(total / limit)}</span>
          <Btn variant="ghost" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= total}>Next</Btn>
        </div>
      )}
    </motion.div>
  );
}
