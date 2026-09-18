import React, { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, RobotOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        {/* Logo */}
        <div style={styles.logoWrap}>
          <motion.div
            style={styles.logoIcon}
            animate={{ boxShadow: ['0 0 0px rgba(108,99,255,0.4)', '0 0 30px rgba(108,99,255,0.4)', '0 0 0px rgba(108,99,255,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RobotOutlined style={{ fontSize: 28, color: '#fff' }} />
          </motion.div>
          <h1 style={styles.logoTitle}>InterviewAI</h1>
          <p style={styles.logoSub}>Smart AI-Powered Interview Platform</p>
        </div>

        <Divider style={{ borderColor: 'var(--border-color)', margin: '0 0 24px' }} />

        <h2 style={styles.formTitle}>Sign in to your account</h2>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
            <Input prefix={<MailOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="Email address" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="Password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} block icon={<ArrowRightOutlined />} iconPosition="end">
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Create one →</Link>
        </p>

        {/* Demo hint */}
        <div style={styles.demoBox}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Demo: register a new account and seed sample interviews from dashboard
          </span>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: 24,
    position: 'relative',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 20,
    padding: '36px 32px',
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logoIcon: {
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
  },
  logoTitle: {
    fontFamily: 'Syne', fontSize: 26, fontWeight: 800,
    color: 'var(--text-primary)', margin: 0,
  },
  logoSub: { color: 'var(--text-muted)', fontSize: 13, marginTop: 4 },
  formTitle: {
    fontFamily: 'Syne', fontSize: 18, fontWeight: 700,
    color: 'var(--text-primary)', marginBottom: 20,
  },
  switchText: { textAlign: 'center', color: 'var(--text-secondary)', marginTop: 16, fontSize: 14 },
  demoBox: {
    marginTop: 16, padding: '10px 14px',
    background: 'var(--bg-secondary)', borderRadius: 10,
    border: '1px solid var(--border-subtle)', textAlign: 'center',
  },
};