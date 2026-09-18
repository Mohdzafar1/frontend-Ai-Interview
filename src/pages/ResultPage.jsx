import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Spin, Tag, Progress, Divider } from 'antd';
import {
  TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ArrowLeftOutlined, ReloadOutlined, StarFilled,
  RiseOutlined, FireOutlined, SmileOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const scoreColor = (s) => s >= 7 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
const scoreLabel = (s) => s >= 8 ? 'Excellent' : s >= 6 ? 'Good' : s >= 4 ? 'Average' : 'Needs Work';
const scoreEmoji = (s) => s >= 8 ? '🏆' : s >= 6 ? '👍' : s >= 4 ? '📚' : '💪';

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/sessions/${sessionId}`)
      .then(r => { setSession(r.data); setLoading(false); })
      .catch(() => { navigate('/dashboard'); });
  }, [sessionId]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spin size="large" />
    </div>
  );

  const avg = session.averageScore || 0;
  const percent = Math.round(avg * 10);
  const color = scoreColor(avg);
  const duration = session.completedAt
    ? Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / 60000)
    : 0;

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} type="text"
            style={{ color: 'var(--text-muted)', padding: 0, height: 'auto', marginBottom: 8 }}>
            Back to Dashboard
          </Button>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Interview Results
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            {session.interviewId?.title}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button icon={<ReloadOutlined />} onClick={() => navigate(`/interview/${session.interviewId?._id}`)}
            style={{ borderRadius: 10, borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}>
            Retry
          </Button>
          <Button type="primary" onClick={() => navigate('/history')} style={{ borderRadius: 10, fontFamily: 'Syne', fontWeight: 600 }}>
            View All Results
          </Button>
        </div>
      </div>

      {/* Score Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.heroCard}
      >
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, delay: 0.3 }}
            >
              <div style={{ width: 140, height: 140, margin: '0 auto' }}>
                <CircularProgressbar
                  value={percent}
                  text={`${avg}`}
                  styles={buildStyles({
                    textSize: '22px',
                    textColor: color,
                    pathColor: color,
                    trailColor: 'var(--border-color)',
                    pathTransitionDuration: 1.2,
                  })}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 22 }}>{scoreEmoji(avg)}</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color, marginTop: 4 }}>
                  {scoreLabel(avg)}
                </div>
              </div>
            </motion.div>
          </Col>

          <Col xs={24} md={18}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
              <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                {session.overallFeedback}
              </p>
            </div>
            <Row gutter={[16, 12]}>
              {[
                { icon: <CheckCircleOutlined />, label: 'Questions', value: session.answers?.length || 0, color: '#6c63ff' },
                { icon: <TrophyOutlined />, label: 'Avg Score', value: `${avg}/10`, color },
                { icon: <ClockCircleOutlined />, label: 'Duration', value: `${duration}m`, color: '#f59e0b' },
                { icon: <RiseOutlined />, label: 'Accuracy', value: `${percent}%`, color: '#10b981' },
              ].map((s, i) => (
                <Col xs={12} sm={6} key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    style={styles.miniStat}
                  >
                    <div style={{ color: s.color, fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </motion.div>

      {/* Skill Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '32px 0 16px' }}>
          Answer Breakdown
        </h2>

        {session.answers?.map((ans, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.5 }}
            style={styles.answerCard}
          >
            <Row gutter={[16, 16]} align="top">
              <Col xs={24} md={14}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={styles.qNum}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 10px', fontFamily: 'Syne', lineHeight: 1.5 }}>
                      {ans.questionText}
                    </p>
                    <div style={styles.answerText}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontFamily: 'Syne', fontWeight: 600 }}>YOUR ANSWER</span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                        {ans.answerText || <em style={{ color: 'var(--text-muted)' }}>No answer provided</em>}
                      </p>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={10}>
                <div style={styles.scorePanel}>
                  {/* Score display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 56, height: 56, flexShrink: 0 }}>
                      <CircularProgressbar
                        value={ans.score * 10}
                        text={`${ans.score}`}
                        styles={buildStyles({
                          textSize: '28px',
                          textColor: scoreColor(ans.score),
                          pathColor: scoreColor(ans.score),
                          trailColor: 'var(--border-color)',
                        })}
                      />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: scoreColor(ans.score) }}>
                        {scoreLabel(ans.score)}
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <StarFilled key={s} style={{ fontSize: 12, color: s <= Math.round(ans.score / 2) ? '#f59e0b' : 'var(--border-color)' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Progress
                    percent={ans.score * 10}
                    showInfo={false}
                    strokeColor={scoreColor(ans.score)}
                    trailColor="var(--border-color)"
                    strokeWidth={5}
                    style={{ marginBottom: 12 }}
                  />
                  {/* AI Feedback */}
                  <div style={styles.feedbackBox}>
                    <span style={{ fontSize: 10, fontFamily: 'Syne', fontWeight: 700, color: '#6c63ff', letterSpacing: '0.1em' }}>AI FEEDBACK</span>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '5px 0 0', lineHeight: 1.6 }}>
                      {ans.feedback}
                    </p>
                  </div>
                  {ans.timeTaken && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                      ⏱ {ans.timeTaken}s to answer
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </motion.div>
        ))}
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={styles.tipsCard}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FireOutlined style={{ color: '#f59e0b', fontSize: 20 }} />
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
            Improvement Tips
          </span>
        </div>
        {avg < 7 && (
          <ul style={{ color: 'var(--text-secondary)', fontSize: 14, paddingLeft: 20, lineHeight: 2 }}>
            <li>Review core concepts in the areas where you scored below 6</li>
            <li>Practice speaking answers out loud to improve clarity</li>
            <li>Structure answers using STAR method (Situation, Task, Action, Result)</li>
            <li>Take more practice interviews to build confidence</li>
          </ul>
        )}
        {avg >= 7 && (
          <ul style={{ color: 'var(--text-secondary)', fontSize: 14, paddingLeft: 20, lineHeight: 2 }}>
            <li>Great job! Focus on the questions you scored below 8 for refinement</li>
            <li>Try the Hard difficulty version next</li>
            <li>Work on adding concrete examples and metrics to your answers</li>
          </ul>
        )}
      </motion.div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <SmileOutlined style={{ fontSize: 32, color: '#6c63ff', marginBottom: 12 }} />
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Keep practicing to improve your score!</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => navigate('/dashboard')} style={{ borderRadius: 10, borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'transparent', height: 44 }}>
            Back to Dashboard
          </Button>
          <Button type="primary" onClick={() => navigate(`/interview/${session.interviewId?._id}`)}
            icon={<ReloadOutlined />} style={{ borderRadius: 10, fontFamily: 'Syne', fontWeight: 600, height: 44 }}>
            Retake Interview
          </Button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  heroCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 20, padding: '28px 32px', marginBottom: 0,
  },
  miniStat: {
    background: 'var(--bg-secondary)', borderRadius: 14,
    padding: '16px 12px', textAlign: 'center',
    border: '1px solid var(--border-subtle)',
  },
  answerCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px', marginBottom: 12,
  },
  qNum: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'rgba(108,99,255,0.2)', color: '#6c63ff',
    fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  answerText: {
    background: 'var(--bg-secondary)', borderRadius: 10,
    padding: '10px 14px', border: '1px solid var(--border-subtle)',
  },
  scorePanel: {
    background: 'var(--bg-secondary)', borderRadius: 14,
    padding: '16px', border: '1px solid var(--border-subtle)',
  },
  feedbackBox: {
    background: 'rgba(108,99,255,0.08)', borderRadius: 8,
    padding: '10px 12px', border: '1px solid rgba(108,99,255,0.2)',
  },
  tipsCard: {
    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 16, padding: '20px 24px', marginTop: 24,
  },
};