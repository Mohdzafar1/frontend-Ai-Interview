import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DashboardOutlined, HistoryOutlined, LogoutOutlined,
  UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, RobotOutlined,UsergroupAddOutlined,QuestionOutlined,MonitorOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', roles: ['admin', 'candidate'] },

  { key: '/question', icon: <QuestionOutlined />, label: 'Question', roles: ['admin'] },

  { key: '/interviewList', icon: <MonitorOutlined />, label: 'Interview List', roles: ['admin'] },

  { key: '/candidateList', icon: <UsergroupAddOutlined />, label: 'Candidate List', roles: ['admin'] },

  { key: '/history', icon: <HistoryOutlined />, label: 'My Results', roles: ['admin', 'candidate'] },
];
const filteredMenu = menuItems.filter(item =>
  item.roles.includes(user?.role)
);

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true }
    ],
    onClick: ({ key }) => { if (key === 'logout') { logout(); navigate('/login'); } }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <Sider
        collapsible collapsed={collapsed}
        trigger={null}
        width={240}
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          position: 'fixed',
          height: '100vh',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '24px 16px' : '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <RobotOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1 }}>InterviewAI</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Smart Hiring Platform</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <Menu
          selectedKeys={[location.pathname]}
          mode="inline"
          style={{ background: 'transparent', border: 'none', marginTop: 8, flex: 1 }}
          items={filteredMenu}
          onClick={({ key }) => navigate(key)}
          theme="dark"
        />

        {/* User Profile at bottom */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          padding: collapsed ? '16px 12px' : '16px',
          display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'space-between'
        }}>
          <Dropdown menu={userMenu} placement="topRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar size={32} style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', fontFamily: 'Syne', fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              {!collapsed && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Syne' }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>
              )}
            </div>
          </Dropdown>
          {!collapsed && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: 'var(--text-muted)' }}
            />
          )}
        </div>
        {collapsed && (
          <div style={{ padding: '8px 12px 16px', display: 'flex', justifyContent: 'center' }}>
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s', background: 'transparent', position: 'relative', zIndex: 1 }}>
        <Content style={{ padding: '32px', minHeight: '100vh' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}