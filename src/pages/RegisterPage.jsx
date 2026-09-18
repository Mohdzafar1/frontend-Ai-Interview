import React, { useState,useEffect } from 'react';
import { Form, Input, Button, message, Divider,Select } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, RobotOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { API, useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password,values.applyFor);
      message.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  


   useEffect(() => {
      fetchQuestions();
    }, []);
  
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await API.get('/interviews');
        setInterview(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

     const interviewRole=interview.filter((item)=>item.isActive== true)

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
        <div style={styles.logoWrap}>
          <motion.div
            style={styles.logoIcon}
            animate={{ boxShadow: ['0 0 0px rgba(108,99,255,0.4)', '0 0 30px rgba(108,99,255,0.4)', '0 0 0px rgba(108,99,255,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RobotOutlined style={{ fontSize: 28, color: '#fff' }} />
          </motion.div>
          <h1 style={styles.logoTitle}>InterviewAI</h1>
          <p style={styles.logoSub}>Create your free account</p>
        </div>

        <Divider style={{ borderColor: 'var(--border-color)', margin: '0 0 24px' }} />

        <h2 style={styles.formTitle}>Get started today</h2>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="name" rules={[{ required: true, message: 'Enter your full name' }]}>
            <Input prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="Full name" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
            <Input prefix={<MailOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="Email address" />
          </Form.Item>
        <Form.Item
  name="applyFor"
  rules={[{ required: true, message: 'Please select role' }]}
>
  <Select
    mode="multiple" // ✅ enables checkbox-like multi select
    placeholder="Select Apply role"
    style={{ width: '100%' }}
    optionLabelProp="label"
  >
    {interviewRole.map((item) => (
      <Select.Option
        key={item._id}
        value={item._id}   // ✅ send ID
        label={item.category}
      >
        {item.category}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Minimum 6 characters' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="Password (min 6 chars)" />
          </Form.Item>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />} placeholder="Confirm password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} block icon={<ArrowRightOutlined />} iconPosition="end">
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)', padding: 24, position: 'relative',
  },
  card: {
    width: '100%', maxWidth: 420,
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 20, padding: '36px 32px', position: 'relative', zIndex: 1,
  },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logoIcon: {
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px',
  },
  logoTitle: { fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 },
  logoSub: { color: 'var(--text-muted)', fontSize: 13, marginTop: 4 },
  formTitle: { fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 },
  switchText: { textAlign: 'center', color: 'var(--text-secondary)', marginTop: 16, fontSize: 14 },
};