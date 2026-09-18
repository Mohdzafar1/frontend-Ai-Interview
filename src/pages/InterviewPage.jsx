import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Progress, message, Spin, Modal, Tag } from 'antd';
import {
  AudioOutlined, AudioMutedOutlined, ArrowRightOutlined,
  RobotOutlined, CheckOutlined, CloseOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// ── AI Avatar Component ───────────────────────────────────────────────────────
function AIAvatar({ speaking, size = 100 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Pulse rings when speaking */}
        {speaking && [1, 2, 3].map(i => (
          <motion.div
            key={i}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid rgba(108,99,255,0.5)',
            }}
            animate={{ scale: [1, 1.3 + i * 0.2], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
          />
        ))}
        {/* Face */}
        <motion.div
          style={{
            width: size, height: size, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6c63ff 0%, #a78bfa 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
            boxShadow: speaking ? '0 0 30px rgba(108,99,255,0.5)' : 'none',
          }}
          animate={speaking ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, repeat: speaking ? Infinity : 0 }}
        >
          <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 56 56" fill="none">
            {/* Head outline */}
            <circle cx="28" cy="28" r="26" fill="rgba(255,255,255,0.12)" />
            {/* Eyes */}
            <motion.circle cx="19" cy="22" r="4.5" fill="white"
              animate={speaking ? { scaleY: [1, 0.2, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle cx="37" cy="22" r="4.5" fill="white"
              animate={speaking ? { scaleY: [1, 0.2, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            {/* Eye pupils */}
            <circle cx="20" cy="23" r="1.5" fill="rgba(108,99,255,0.8)" />
            <circle cx="38" cy="23" r="1.5" fill="rgba(108,99,255,0.8)" />
            {/* Mouth - animates when speaking */}
            {speaking ? (
              <motion.ellipse cx="28" cy="36" rx="7" ry="4" fill="white"
                animate={{ ry: [2, 5, 2] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            ) : (
              <path d="M20 34 Q28 40 36 34" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            )}
            {/* Antenna */}
            <rect x="26" y="2" width="4" height="5" rx="2" fill="white" />
            <circle cx="28" cy="1.5" r="2" fill="rgba(255,255,255,0.7)" />
          </svg>
        </motion.div>
      </div>

      {/* Sound Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
        {[6, 14, 22, 16, 10, 20, 12, 8, 18, 14].map((h, i) => (
          <motion.div
            key={i}
            style={{ width: 3, background: '#6c63ff', borderRadius: 2 }}
            animate={speaking
              ? { height: [h * 0.5, h, h * 1.5, h * 0.6, h], opacity: 1 }
              : { height: 3, opacity: 0.3 }
            }
            transition={{ duration: 0.6 + i * 0.05, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </div>

      <div style={{
        fontSize: 12, fontFamily: 'Syne', fontWeight: 600,
        color: speaking ? '#6c63ff' : 'var(--text-muted)',
        letterSpacing: '0.05em',
      }}>
        {speaking ? 'AI SPEAKING...' : 'WAITING...'}
      </div>
    </div>
  );
}

// ── Mic Visualizer ────────────────────────────────────────────────────────────
function MicVisualizer({ recording }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 24 }}>
      {[8, 14, 20, 14, 8, 18, 12].map((h, i) => (
        <motion.div
          key={i}
          style={{ width: 3, background: '#ef4444', borderRadius: 2 }}
          animate={recording
            ? { height: [h * 0.5, h, h * 1.3, h * 0.4, h] }
            : { height: 3 }
          }
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.07 }}
        />
      ))}
    </div>
  );
}

// ── Main Interview Page ────────────────────────────────────────────────────────
export default function InterviewPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [interview, setInterview] = useState(null);
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [phase, setPhase] = useState('speaking'); // 'speaking' | 'listening' | 'submitting'
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [manualAnswer, setManualAnswer] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);

  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const {
    transcript, listening, resetTranscript, browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const currentQuestion = interview?.questions?.[currentIndex];
  const totalQuestions = interview?.questions?.length || 0;
  const progress = totalQuestions ? Math.round((currentIndex / totalQuestions) * 100) : 0;

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) setSpeechSupported(false);
    startSession();
    totalTimerRef.current = setInterval(() => setTotalTimer(t => t + 1), 1000);
    return () => {
      clearAllTimers();
      synthRef.current?.cancel();
      SpeechRecognition.stopListening();
    };
  }, []);

  const clearAllTimers = () => {
    clearInterval(timerRef.current);
    clearInterval(totalTimerRef.current);
    clearTimeout(questionTimerRef.current);
  };

  // ── Start Session ─────────────────────────────────────────────────────────
  const startSession = async () => {
    try {
      const res = await API.post('/sessions/start', { interviewId });
      setInterview(res.data.interview);
      setSession(res.data.session);
      setLoading(false);
      setTimeout(() => speakQuestion(res.data.interview.questions[0]), 800);
    } catch (err) {
      message.error('Failed to start interview');
      navigate('/dashboard');
    }
  };

  // ── Text-to-Speech ────────────────────────────────────────────────────────
  const speakQuestion = useCallback((question) => {
    if (!question) return;
    setAiSpeaking(true);
    setPhase('speaking');
    resetTranscript();
    setManualAnswer('');

    synthRef.current?.cancel();
    const utterance = new SpeechSynthesisUtterance(question.text);
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Try to get a good voice
    const voices = synthRef.current?.getVoices() || [];
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.lang === 'en-US');
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setAiSpeaking(false);
      startListening();
    };
    utterance.onerror = () => {
      setAiSpeaking(false);
      startListening();
    };

    synthRef.current?.speak(utterance);

    // Start question countdown timer
    setTimer(question.timeLimit || 120);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [resetTranscript]);

  // ── Start Listening ───────────────────────────────────────────────────────
  const startListening = () => {
    setPhase('listening');
    if (speechSupported) {
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  // ── Submit Answer ─────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    setSubmitting(true);
    setPhase('submitting');
    stopListening();
    clearInterval(timerRef.current);
    synthRef.current?.cancel();

    const answerText = (useManualInput ? manualAnswer : transcript).trim() || '(No answer provided)';
    const timeTaken = (currentQuestion?.timeLimit || 120) - timer;

    try {
      const res = await API.post(`/sessions/${session._id}/answer`, {
        questionId: currentQuestion._id,
        questionText: currentQuestion.text,
        answerText,
        timeTaken,
      });

      setAnswerHistory(prev => [...prev, {
        question: currentQuestion.text,
        answer: answerText,
        score: res.data.score,
        feedback: res.data.feedback,
      }]);

      const nextIndex = currentIndex + 1;

      if (nextIndex >= totalQuestions) {
        // All done → complete session
        await completeSession();
      } else {
        setCurrentIndex(nextIndex);
        resetTranscript();
        setManualAnswer('');
        setSubmitting(false);
        setTimeout(() => speakQuestion(interview.questions[nextIndex]), 600);
      }
    } catch (err) {
      message.error('Failed to submit answer');
      setSubmitting(false);
      setPhase('listening');
    }
  };

  // ── Complete ──────────────────────────────────────────────────────────────
  const completeSession = async () => {
    try {
      await API.post(`/sessions/${session._id}/complete`);
      clearAllTimers();
      navigate(`/result/${session._id}`);
    } catch (err) {
      message.error('Error completing session');
    }
  };

  const handleQuit = () => setShowQuitModal(true);
  const confirmQuit = () => { clearAllTimers(); synthRef.current?.cancel(); navigate('/dashboard'); };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;



  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontFamily: 'Syne' }}>Setting up your interview...</p>
      </div>
    </div>
  );

  const activeAnswer = useManualInput ? manualAnswer : transcript;
  const timerColor = timer > 60 ? '#10b981' : timer > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div style={styles.page}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div style={styles.container}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div>
            <div style={styles.interviewTitle}>{interview?.title}</div>
            <div style={styles.interviewSub}>Question {currentIndex + 1} of {totalQuestions}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Total timer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Syne' }}>ELAPSED</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: 'var(--text-secondary)' }}>
                {formatTime(totalTimer)}
              </div>
            </div>
            {/* Question timer */}
            <div style={{ ...styles.timerBox, borderColor: timerColor + '44' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Syne' }}>REMAINING</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: timerColor }}>
                {formatTime(timer)}
              </div>
            </div>
            <Button danger onClick={handleQuit} icon={<CloseOutlined />} style={{ borderRadius: 10 }}>
              Quit
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Progress
          percent={progress}
          showInfo={false}
          strokeColor={{ '0%': '#6c63ff', '100%': '#a78bfa' }}
          trailColor="var(--border-color)"
          style={{ marginBottom: 28 }}
          strokeWidth={6}
        />

        {/* Main Content */}
        <div style={styles.mainGrid}>
          {/* LEFT: AI Avatar + Question */}
          <div style={styles.leftPanel}>
            <div style={styles.avatarCard}>
              <AIAvatar speaking={aiSpeaking} size={110} />
              <div style={styles.statusRow}>
                <div style={{ ...styles.statusDot, background: aiSpeaking ? '#6c63ff' : phase === 'listening' ? '#10b981' : '#f59e0b' }} />
                <span style={styles.statusText}>
                  {aiSpeaking ? 'AI is asking the question' : phase === 'listening' ? 'Your turn to answer' : 'Processing...'}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35 }}
                style={styles.questionCard}
              >
                <div style={styles.questionLabel}>QUESTION {currentIndex + 1}</div>
                <p style={styles.questionText}>{currentQuestion?.text}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <Tag color="purple" style={{ borderRadius: 6 }}>{currentQuestion?.category}</Tag>
                  <Tag color={currentQuestion?.difficulty === 'Easy' ? 'green' : currentQuestion?.difficulty === 'Hard' ? 'red' : 'orange'}
                    style={{ borderRadius: 6 }}>
                    {currentQuestion?.difficulty}
                  </Tag>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Previous answers count */}
            {answerHistory.length > 0 && (
              <div style={styles.prevAnswers}>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>✓ {answerHistory.length} question{answerHistory.length > 1 ? 's' : ''} answered</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {answerHistory.map((a, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: a.score >= 7 ? '#10b981' : a.score >= 5 ? '#f59e0b' : '#ef4444'
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Answer Area */}
          <div style={styles.rightPanel}>
            {/* Answer Transcript Box */}
            <div style={styles.answerBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={styles.answerLabel}>
                  {useManualInput ? 'TYPE YOUR ANSWER' : 'YOUR ANSWER (SPEECH)'}
                </span>
                <button
                  onClick={() => { setUseManualInput(!useManualInput); resetTranscript(); setManualAnswer(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600 }}
                >
                  {useManualInput ? '🎤 Use Mic' : '⌨️ Type Instead'}
                </button>
              </div>

              {useManualInput ? (
                <textarea
                  value={manualAnswer}
                  onChange={e => setManualAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  style={styles.manualTextarea}
                  disabled={phase === 'speaking' || submitting}
                />
              ) : (
                <div style={{
                  ...styles.transcriptArea,
                  borderColor: listening ? '#10b981' : 'transparent',
                  background: aiSpeaking ? 'rgba(108,99,255,0.05)' : 'var(--bg-secondary)',
                }}>
                  {aiSpeaking ? (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Listening... Please wait for AI to finish.
                    </span>
                  ) : activeAnswer ? (
                    <span style={{ color: 'var(--text-primary)' }}>{activeAnswer}</span>
                  ) : phase === 'listening' ? (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Start speaking your answer...
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Answer will appear here...</span>
                  )}
                  {listening && <span style={{ color: '#10b981' }}>▋</span>}
                </div>
              )}

              {/* Mic Controls */}
              {!useManualInput && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 16 }}>
                  <MicVisualizer recording={listening} />
                  {!aiSpeaking && (
                    listening ? (
                      <motion.button
                        style={{ ...styles.micBtn, background: '#ef4444' }}
                        onClick={stopListening}
                        whileTap={{ scale: 0.95 }}
                        animate={{ boxShadow: ['0 0 0px rgba(239,68,68,0.5)', '0 0 20px rgba(239,68,68,0.5)', '0 0 0px rgba(239,68,68,0.5)'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <AudioMutedOutlined style={{ fontSize: 22 }} />
                      </motion.button>
                    ) : (
                      <button style={{ ...styles.micBtn, background: '#10b981' }} onClick={startListening}>
                        <AudioOutlined style={{ fontSize: 22 }} />
                      </button>
                    )
                  )}
                  {listening && <MicVisualizer recording={listening} />}
                </div>
              )}
              {!useManualInput && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: listening ? '#ef4444' : 'var(--text-muted)' }}>
                    {listening ? '🔴 Recording — click mic to stop' : '⚪ Click mic to start recording'}
                  </span>
                </div>
              )}
            </div>

            {/* Replay + Submit */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => speakQuestion(currentQuestion)}
                disabled={aiSpeaking || submitting}
                style={{ borderRadius: 10, height: 46, color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'transparent' }}
              >
                Replay
              </Button>
              <Button
                type="primary"
                icon={currentIndex + 1 >= totalQuestions ? <CheckOutlined /> : <ArrowRightOutlined />}
                iconPosition="end"
                onClick={submitAnswer}
                loading={submitting}
                disabled={aiSpeaking || (!activeAnswer && phase !== 'listening')}
                style={{ flex: 1, height: 46, borderRadius: 10, fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}
              >
                {submitting ? 'Evaluating...' : currentIndex + 1 >= totalQuestions ? 'Finish Interview' : 'Submit & Next'}
              </Button>
            </div>

            {/* Tips */}
            <div style={styles.tipBox}>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                💡 <strong style={{ color: 'var(--text-secondary)' }}>Tip:</strong> Speak clearly and in English for best recognition. Use "Type Instead" if mic doesn't work.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quit Modal */}
      <Modal
        title={<span style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Quit Interview?</span>}
        open={showQuitModal}
        onOk={confirmQuit}
        onCancel={() => setShowQuitModal(false)}
        okText="Yes, Quit"
        cancelText="Continue"
        okButtonProps={{ danger: true }}
        styles={{ content: { background: 'var(--bg-card)', border: '1px solid var(--border-color)' }, header: { background: 'var(--bg-card)' }, footer: { background: 'var(--bg-card)' } }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Your progress will be lost. Are you sure you want to quit?
        </p>
      </Modal>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '28px 24px', position: 'relative', zIndex: 1 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  interviewTitle: { fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' },
  interviewSub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 2 },
  timerBox: {
    padding: '8px 16px', borderRadius: 12, border: '1px solid',
    background: 'var(--bg-card)', textAlign: 'center',
  },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' },
  leftPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  avatarCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 20, padding: '30px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
  statusRow: { display: 'flex', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  statusText: { fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Syne', fontWeight: 500 },
  questionCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 16, padding: '20px',
    borderLeft: '4px solid #6c63ff',
  },
  questionLabel: { fontSize: 10, fontFamily: 'Syne', fontWeight: 700, letterSpacing: '0.12em', color: '#6c63ff', marginBottom: 10 },
  questionText: { fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 },
  prevAnswers: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: 10,
  },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: 14 },
  answerBox: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 20, padding: '20px',
  },
  answerLabel: { fontSize: 10, fontFamily: 'Syne', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)' },
  transcriptArea: {
    minHeight: 150, padding: '14px 16px',
    background: 'var(--bg-secondary)', borderRadius: 12,
    border: '1.5px solid transparent',
    fontSize: 15, lineHeight: 1.7, transition: 'all 0.3s',
    wordBreak: 'break-word',
  },
  manualTextarea: {
    width: '100%', minHeight: 150,
    background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)',
    borderRadius: 12, padding: '14px 16px',
    color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.7,
    resize: 'vertical', fontFamily: 'DM Sans', outline: 'none',
  },
  micBtn: {
    width: 56, height: 56, borderRadius: '50%',
    color: '#fff', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22,
  },
  tipBox: {
    padding: '12px 14px', background: 'rgba(108,99,255,0.08)',
    borderRadius: 10, border: '1px solid rgba(108,99,255,0.2)',
  },
};