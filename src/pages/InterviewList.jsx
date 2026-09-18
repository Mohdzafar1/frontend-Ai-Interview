import React, { useEffect, useState } from 'react';
import {
  Button, Modal, Form, Input,
  Select, InputNumber, Table, Tag, Space, Popconfirm, Spin,Checkbox 
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { API } from '../context/AuthContext';

const { Option } = Select;

export default function InterviewList() {
  const [interview, setInterview] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  console.log("interview",interview)
  // 🔹 Fetch interview
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

  // 🔹 Open Modal
  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  // 🔹 Submit
  const handleSubmit = async (values) => {
    try {
      const loginUser = JSON.parse(localStorage.getItem("user"));

      const payload = {
        ...values,
        
        createdBy: loginUser?._id
      };

      if (editing) {
        const res = await API.put(`/interviews/${editing._id}`, payload);

        setInterview(prev =>
          prev.map(q => q._id === editing._id ? res.data : q)
        );
      } else {
        const res = await API.post('/interviews/create', payload);
        setInterview(prev => [...prev, res.data]);
      }

      setOpen(false);
      form.resetFields();

    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Edit
  const handleEdit = (record) => {
    setEditing(record);

    form.setFieldsValue({
      ...record,
      keywords: record.keywords?.join(',')
    });

    setOpen(true);
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    try {
      await API.delete(`/questions/${id}`);
      setInterview(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Table Columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (text) => (
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {text}
        </span>
      )
    },
    {
      title: 'Role',
      dataIndex: 'category',
      render: (cat) => <Tag>{cat}</Tag>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (d) => <Tag color="blue">{d}</Tag>
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      render: (d) => <Tag color="blue">{d}</Tag>
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      render: (t) => <Tag>{t}s</Tag>
    },
    {
      title: 'CreateBy',
      dataIndex: 'createdBy',
      render: (createdBy) => <Tag>{createdBy?.name}</Tag>
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} danger type="text" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'Syne',
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Interview List
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Manage your interview 
            </p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add New Interview
          </Button>
        </div>
      </motion.div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={interview}
          rowKey="_id"
          pagination={{ pageSize: 6 }}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 12
          }}
        />
      )}

      {/* Modal */}
      <Modal
        title={editing ? 'Edit Interview' : 'Add Interview'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="difficulty" label="Difficulty" initialValue="Medium">
            <Select>
              <Option value="Easy">Easy</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Hard">Hard</Option>
            </Select>
          </Form.Item>

          <Form.Item name="duration" label="Duration" initialValue={120}>
            <InputNumber min={30} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
                name="isActive"
                valuePropName="checked"
                initialValue={false}
                >
                <Checkbox>Is Active</Checkbox>
                </Form.Item>

        </Form>
      </Modal>
    </div>
  );
}