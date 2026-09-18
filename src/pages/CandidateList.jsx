import React, { useEffect, useState } from 'react';
import {
  Button, Modal, Form, Input,
  Select, InputNumber, Table, Tag,
  Space, Popconfirm, Spin
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { API } from '../context/AuthContext';

const { Option } = Select;

export default function CandidateList() {
  const [candidate, setCandidateList] = useState([]);
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
   fetchCandidateList()
  }, []);


  const fetchCandidateList = async () => {
    try {
      setLoading(true);
      const loginUser = JSON.parse(localStorage.getItem("user"));

      const res = await API.get(`/auth/candidateList/${loginUser?._id}`)
     
      setCandidateList(res.data?.users);
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

        setCandidateList(prev =>
          prev.map(q => q._id === editing._id ? res.data : q)
        );
      } else {
        const res = await API.post('/questions/create', payload);
        setCandidateList(prev => [...prev, res.data]);
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
      setCandidateList(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Filtering Logic


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
      title: 'Name',
      dataIndex: 'name',
      render: (text) => (
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {text}
        </span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (t) => <Tag>{t}</Tag>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (c) => <Tag>{c}</Tag>
    },
     {
      title: 'Apply For',
      dataIndex: 'designation',
      render: (c) => <Tag>{c}</Tag>
    },
      {
      title: 'Interview Permission',
      dataIndex: 'status',
      render: (c) => <Tag>{c}</Tag>
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
              Candidate Lists
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
    onClick={() => setAssignModalOpen(true)}
    disabled={selectedRowKeys.length === 0}
  >
    Assign Questions
  </Button>
</div>
        </div>
      </motion.div>

    

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
          dataSource={candidate}
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