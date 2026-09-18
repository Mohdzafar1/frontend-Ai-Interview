import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Button, Spin, message, Empty, Statistic, Progress, Modal } from 'antd';
import {
  RocketOutlined, ClockCircleOutlined, TrophyOutlined,
  CodeOutlined, DatabaseOutlined, TeamOutlined,
  ThunderboltOutlined, CheckCircleOutlined, PlayCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';
import { motion } from 'framer-motion';

const categoryIcons = {
  Frontend: <CodeOutlined />, Backend: <DatabaseOutlined />,
  'Full Stack': <ThunderboltOutlined />, Behavioral: <TeamOutlined />,
  HR: <TeamOutlined />, 'Data Science': <ExperimentOutlined />,
  DevOps: <ExperimentOutlined />, 'System Design': <ExperimentOutlined />,
};
const categoryColors = {
  Frontend: '#6c63ff', Backend: '#10b981', 'Full Stack': '#f59e0b',
  Behavioral: '#ec4899', HR: '#14b8a6', 'Data Science': '#8b5cf6',
};
const diffColors = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const diffBg = { Easy: '#0d2e22', Medium: '#2e1f06', Hard: '#2e0a0a' };

export default function DashboardPage() {
  const [interviews, setInterviews] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
       const loginUser = JSON.parse(localStorage.getItem("user"));
      const [intRes, histRes] = await Promise.all([
        API.get(`/interviews/getEnrolle/${loginUser?._id}`),
        API.get('/sessions/history'),
      ]);
      console.log("sadsa",intRes)
      setInterviews(intRes.data.data);
      setHistory(histRes.data);
    } catch (err) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setSeeding(true);
    try {
      await API.post('/interviews/seed');
      message.success('Sample interviews loaded!');
      fetchData();
    } catch (err) {
      message.error('Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

const avgScore = Array.isArray(history) && history?.length
  ? (history?.reduce((s, h) => s + (h.averageScore || 0), 0) / history?.length).toFixed(1)
  : 0;

// const avgScore = history?.length ? (history?.reduce((s, h) => s + (h.averageScore || 0), 0) / history?.length)?.toFixed(1) : 0;

  const stats = [
    { title: 'Interviews Done', value: history?.length, icon: <CheckCircleOutlined />, color: '#6c63ff' },
    { title: 'Avg Score', value: `${avgScore}/10`, icon: <TrophyOutlined />, color: '#10b981' },
    { title: 'Available Tests', value: interviews?.length, icon: <RocketOutlined />, color: '#f59e0b' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>Good day, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={styles.subtext}>Ready to ace your next interview? Choose a test below.</p>
          </div>
          {interviews?.length === 0 && (
            <Button
              type="primary" icon={<ThunderboltOutlined />}
              loading={seeding} onClick={seedData}
              style={{ height: 44 }}
            >
              Load Sample Interviews
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {stats.map((s, i) => (
          <Col xs={24} sm={8} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div style={{ ...styles.statCard, borderColor: s.color + '33' }}>
                <div style={{ ...styles.statIcon, background: s.color + '22', color: s.color }}>{s.icon}</div>
                <div>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statTitle}>{s.title}</div>
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Recent Activity */}
      {Array.isArray(history)?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Activity</h2>
            <Button type="text" onClick={() => navigate('/history')} style={{ color: 'var(--accent-primary)' }}>
              View all →
            </Button>
          </div>
          <Row gutter={[12, 12]} style={{ marginBottom: 32 }}>
            {history.slice(0, 3).map((s, i) => (
              <Col xs={24} sm={8} key={i}>
                <div style={styles.historyCard} onClick={() => navigate(`/result/${s._id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Syne', color: 'var(--text-primary)' }}>
                      {s.interviewId?.title || 'Interview'}
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne', color: s.averageScore >= 7 ? '#10b981' : s.averageScore >= 5 ? '#f59e0b' : '#ef4444' }}>
                      {s.averageScore}
                    </span>
                  </div>
                  <Progress
                    percent={s.averageScore * 10}
                    showInfo={false}
                    strokeColor={s.averageScore >= 7 ? '#10b981' : s.averageScore >= 5 ? '#f59e0b' : '#ef4444'}
                    trailColor="var(--border-color)"
                    size="small"
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    {new Date(s.completedAt).toLocaleDateString()}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </motion.div>
      )}

      {/* Interview Cards */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Available Interviews</h2>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{interviews?.length} tests available</span>
      </div>

      {Array.isArray(interviews)?.length === 0 ? (
        <div style={styles.emptyBox}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: 'var(--text-muted)' }}>No interviews yet. Click "Load Sample Interviews" to get started.</span>}
          />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {interviews?.map((interview, i) => (
            <Col xs={24} sm={12} lg={8} key={interview._id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div style={styles.interviewCard}>
                  {/* Card Header */}
                  <div style={{ ...styles.cardHeader, background: (categoryColors[interview.category] || '#6c63ff') + '15' }}>
                    <div style={{ ...styles.catIcon, background: categoryColors[interview.category] || '#6c63ff' }}>
                      {categoryIcons[interview.category] || <RocketOutlined />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.cardTitle}>{interview.title}</h3>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <Tag style={{ background: (categoryColors[interview.category] || '#6c63ff') + '22', color: categoryColors[interview.category] || '#6c63ff', border: 'none', fontSize: 11 }}>
                          {interview.category}
                        </Tag>
                        <Tag style={{ background: diffBg[interview.difficulty], color: diffColors[interview.difficulty], border: 'none', fontSize: 11 }}>
                          {interview.difficulty}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={styles.cardBody}>
                    <p style={styles.cardDesc}>{interview.description}</p>

                    <div style={styles.cardMeta}>
                      <div style={styles.metaItem}>
                        <CodeOutlined style={{ color: 'var(--text-muted)', fontSize: 12 }} />
                        <span>{interview.questions?.length || 0} questions</span>
                      </div>
                      <div style={styles.metaItem}>
                        <ClockCircleOutlined style={{ color: 'var(--text-muted)', fontSize: 12 }} />
                        <span>{interview.duration} min</span>
                      </div>
                    </div>

                    <Button
                      type="primary" block
                      icon={<PlayCircleOutlined />}
                      onClick={() => navigate(`/interview/${interview._id}`)}
                      style={{ marginTop: 14, fontFamily: 'Syne', fontWeight: 600 }}
                    >
                      Start Interview
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
  greeting: { fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 },
  subtext: { color: 'var(--text-secondary)', marginTop: 4, fontSize: 15 },
  statCard: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'var(--bg-card)', border: '1px solid',
    borderRadius: 16, padding: '20px 24px',
  },
  statIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  statValue: { fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 },
  statTitle: { fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'Syne' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  historyCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  interviewCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 18, overflow: 'hidden',
  },
  cardHeader: { padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 },
  catIcon: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 20, flexShrink: 0,
  },
  cardTitle: { fontFamily: 'Syne', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  cardBody: { padding: '0 20px 20px' },
  cardDesc: { color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 14, marginTop: 12 },
  cardMeta: { display: 'flex', gap: 16 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' },
  emptyBox: { textAlign: 'center', padding: '60px 0' },
};