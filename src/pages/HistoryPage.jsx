import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Spin, Tag, Empty, Progress, Statistic } from 'antd';
import {
  TrophyOutlined, ClockCircleOutlined, EyeOutlined,
  RocketOutlined, FireOutlined, CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { motion } from 'framer-motion';

const scoreColor = (s) => s >= 7 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
const scoreLabel = (s) => s >= 8 ? 'Excellent' : s >= 6 ? 'Good' : s >= 4 ? 'Average' : 'Needs Work';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // API.get('/sessions/history')
    //   .then(r => { setSessions(r.data); setLoading(false); })
    //   .catch(() => setLoading(false));

    API.get('/sessions/history')
  .then(r => {
    setSessions(r.data.data); // ✅ correct
    setLoading(false);
  })

  }, []);


  // const avgScore = sessions?.length
  //   ? (sessions.reduce((s, h) => s + (h.averageScore || 0), 0) / sessions?.length).toFixed(1)
  //   : 0;

  const avgScore = Array.isArray(sessions) && sessions.length
  ? (sessions.reduce((s, h) => s + (h.averageScore || 0), 0) / sessions.length).toFixed(1)
  : 0;

  const bestScore = sessions?.length
    ? Math?.max(...sessions?.map(s => s.averageScore || 0))
    : 0;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            My Results
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Track your interview performance over time
          </p>
        </div>
      </motion.div>

      {sessions?.length === 0 ? (
        <div style={styles.emptyWrap}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No interviews completed yet</p>
                <Button type="primary" icon={<RocketOutlined />} onClick={() => navigate('/dashboard')} style={{ borderRadius: 10 }}>
                  Take Your First Interview
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            {[
              { label: 'Total Interviews', value: sessions?.length, icon: <CalendarOutlined />, color: '#6c63ff' },
              { label: 'Average Score', value: `${avgScore}/10`, icon: <TrophyOutlined />, color: '#10b981' },
              { label: 'Best Score', value: `${bestScore}/10`, icon: <FireOutlined />, color: '#f59e0b' },
            ].map((s, i) => (
              <Col xs={24} sm={8} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ ...styles.statCard, borderColor: s.color + '33' }}
                >
                  <div style={{ ...styles.statIcon, background: s.color + '22', color: s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Syne' }}>{s.label}</div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Score trend bar */}
          {sessions?.length >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={styles.trendCard}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>
                Score Trend (Most Recent First)
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 60 }}>
                {sessions.slice(0, 8).reverse().map((s, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: scoreColor(s.averageScore),
                      height: `${(s.averageScore / 10) * 50}px`,
                      minHeight: 4, transition: 'height 0.5s'
                    }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.averageScore}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Session List */}
          <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '24px 0 14px' }}>
            All Sessions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sessions?.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.2 }}
                style={styles.sessionCard}
                onClick={() => navigate(`/result/${s._id}`)}
              >
                <div style={styles.cardLeft}>
                  {/* Score circle */}
                  <div style={{ ...styles.scoreCircle, borderColor: scoreColor(s.averageScore), color: scoreColor(s.averageScore) }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }}>{s.averageScore}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/10</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                      {s.interviewId?.title || 'Interview'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      <Tag style={{ background: 'rgba(108,99,255,0.15)', color: '#a78bfa', border: 'none', fontSize: 11, borderRadius: 6 }}>
                        {s.interviewId?.category}
                      </Tag>
                      <Tag style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', fontSize: 11, borderRadius: 6 }}>
                        {scoreLabel(s.averageScore)}
                      </Tag>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ClockCircleOutlined style={{ fontSize: 10 }} />
                        {new Date(s.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.cardRight}>
                  <div style={{ width: 120 }}>
                    <Progress
                      percent={s.averageScore * 10}
                      showInfo={false}
                      strokeColor={scoreColor(s.averageScore)}
                      trailColor="var(--border-color)"
                      strokeWidth={6}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {s.answers?.length} questions answered
                    </div>
                  </div>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    style={{ color: '#6c63ff' }}
                  >
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  emptyWrap: { textAlign: 'center', padding: '80px 0' },
  statCard: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'var(--bg-card)', border: '1px solid',
    borderRadius: 16, padding: '20px 24px',
  },
  statIcon: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, flexShrink: 0,
  },
  trendCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px', marginBottom: 8,
  },
  sessionCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 14, padding: '16px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s',
    gap: 16,
  },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 16, flex: 1 },
  cardRight: { display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 },
  scoreCircle: {
    width: 60, height: 60, borderRadius: '50%',
    border: '2px solid', flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-secondary)',
  },
};