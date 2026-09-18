import React, { useEffect, useState } from 'react';
import {
  Button, Modal, Form, Input,
  Select, InputNumber, Table, Tag,
  Space, Popconfirm, Spin
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,MonitorOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { API } from '../context/AuthContext';

const { Option } = Select;

export default function Question() {
  const [questions, setQuestions] = useState([]);
  const [interview, setInterview] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
const [selectedInterview, setSelectedInterview] = useState(null);
  const [filters, setFilters] = useState({
    category: null,
    difficulty: null,
    createdBy: null
  });

  const [form] = Form.useForm();

  // 🔹 Fetch Questions
  useEffect(() => {
    fetchQuestions();
    fetchInterview()
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await API.get('/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

   const fetchInterview = async () => {
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
        keywords: values.keywords || [],
        createdBy: loginUser?._id
      };

      if (editing) {
        const res = await API.put(`/questions/${editing._id}`, payload);

        setQuestions(prev =>
          prev.map(q => q._id === editing._id ? res.data : q)
        );
      } else {
        const res = await API.post('/questions/create', payload);
        setQuestions(prev => [...prev, res.data]);
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
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Filtering Logic
  const filteredQuestions = questions.filter(q => {
    return (
      (!filters.category || q.category === filters.category) &&
      (!filters.difficulty || q.difficulty === filters.difficulty) &&
      (!filters.createdBy || q.createdBy?._id === filters.createdBy)
    );
  });

  // 🔹 Row Selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

const handleAssign = async () => {
  try {
    if (!selectedInterview) return;

    await API.post(`/interviews/addQuestionInInterview/${selectedInterview}`, {
      questionIds: selectedRowKeys
    });

    setAssignModalOpen(false);
    setSelectedRowKeys([]);
  } catch (err) {
    console.error(err);
  }
};

  // 🔹 Table Columns
  const columns = [
    {
      title: 'Question',
      dataIndex: 'text',
      render: (text) => (
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {text}
        </span>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (cat) => <Tag>{cat}</Tag>
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      render: (d) => <Tag color="blue">{d}</Tag>
    },
    {
      title: 'Time',
      dataIndex: 'timeLimit',
      render: (t) => <Tag>{t}s</Tag>
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      render: (c) => <Tag>{c?.name}</Tag>
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
              Question Manager
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Manage your interview questions
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
  <Button
    type="primary"
    icon={<PlusOutlined />}
    onClick={handleAdd}
  >
    Add Question
  </Button>

  <Button
   type="primary"
    icon={<MonitorOutlined />}
    onClick={() => setAssignModalOpen(true)}
    disabled={selectedRowKeys.length === 0}
  >
    Assign Questions
  </Button>
</div>
        </div>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>

        <Select
          placeholder="Category"
          allowClear
          style={{ width: 180 }}
          onChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
        >
          {[...new Set(questions.map(q => q.category))].map(cat => (
            <Option key={cat}>{cat}</Option>
          ))}
        </Select>

        <Select
          placeholder="Difficulty"
          allowClear
          style={{ width: 180 }}
          onChange={(val) => setFilters(prev => ({ ...prev, difficulty: val }))}
        >
          <Option value="Easy">Easy</Option>
          <Option value="Medium">Medium</Option>
          <Option value="Hard">Hard</Option>
        </Select>

        <Select
          placeholder="Created By"
          allowClear
          style={{ width: 200 }}
          onChange={(val) => setFilters(prev => ({ ...prev, createdBy: val }))}
        >
          {[...new Set(questions.map(q => q.createdBy?._id))]
            .map(id => {
              const user = questions.find(q => q.createdBy?._id === id)?.createdBy;
              return <Option key={id} value={id}>{user?.name}</Option>;
            })}
        </Select>

      </div>

      {/* Selected Count */}
      <div style={{ marginBottom: 10 }}>
        Selected: {selectedRowKeys.length}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredQuestions}
          rowKey="_id"
          rowSelection={rowSelection}
          pagination={{ pageSize: 6 }}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 12
          }}
        />
      )}

      {/* Modal */}
      <Modal
        title={editing ? 'Edit Question' : 'Add Question'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>

          <Form.Item name="text" label="Question" rules={[{ required: true }]}>
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

          <Form.Item name="timeLimit" label="Time Limit" initialValue={120}>
            <InputNumber min={30} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="keywords" label="Keywords">
            <Input
              placeholder="comma separated"
              onChange={(e) =>
                form.setFieldsValue({
                  keywords: e.target.value.split(',').map(k => k.trim())
                })
              }
            />
          </Form.Item>

          <Form.Item name="expectedAnswer" label="Expected Answer">
            <Input.TextArea rows={3} />
          </Form.Item>

        </Form>
      </Modal>
      <Modal
  title="Assign Questions"
  open={assignModalOpen}
  onCancel={() => setAssignModalOpen(false)}
  footer={null} // we will create custom button
  width={400}
>
  <Select
    placeholder="Select Interview"
    style={{ width: '100%', marginBottom: 16 }}
    onChange={(val) => setSelectedInterview(val)}
  >
    {interview.map((item) => (
      <Option key={item._id} value={item._id}>
        {item.category} , {item.difficulty}
      </Option>
    ))}
  </Select>

  <Button
    type="primary"
    block
    disabled={!selectedInterview}
    onClick={handleAssign}
  >
    Submit
  </Button>
</Modal>
    </div>
  );
}