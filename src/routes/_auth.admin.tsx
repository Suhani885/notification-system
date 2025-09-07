import { createFileRoute } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SendOutlined,
  NotificationOutlined,
  UploadOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  Table,
  Button,
  Card,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Dropdown,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { TableRowSelection } from "antd/es/table/interface";
import type { MenuProps } from "antd";
import api from "../utils/axios";
import toast from "react-hot-toast";

interface User {
  id: number;
  username: string;
  email: string;
}

interface NotificationForm {
  title: string;
  body: string;
  type: "message" | "system" | "welcome" | "announcement";
}

interface UserProfile {
  username: string;
  email: string;
  avatar?: string | null;
}

export const Route = createFileRoute("/_auth/admin")({
  component: AdminDashboard,
});

const fetchUsers = async (): Promise<User[] | undefined> => {
  try {
    const response = await api.get("getUsers");
    return response.data.users;
  } catch (error) {
    alert("Failed to fetch users");
    return undefined;
  }
};

const sendNotification = async (
  userIds: string[],
  notification: NotificationForm & {
    image?: any;
    actionUrl?: string;
  }
): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("userIds", JSON.stringify(userIds));
    formData.append("title", notification.title);
    formData.append("body", notification.body);

    if (notification.image && notification.image.file) {
      formData.append("image", notification.image.file);
    }
    if (notification.actionUrl) {
      formData.append("actionUrl", notification.actionUrl);
    }

    await api.post("/notifications", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    alert("Failed to send notification");
  }
};

const fetchUserProfile = async (): Promise<UserProfile | undefined> => {
  try {
    const response = await api.get("/login");
    return response.data.user;
  } catch (error) {
    alert("Failed to fetch user profile");
    return undefined;
  }
};

function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: "Admin",
    email: "",
    avatar: null,
  });
  const [form] = Form.useForm();
  const router = useRouter();
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        const [usersData, profileData] = await Promise.all([
          fetchUsers(),
          fetchUserProfile(),
        ]);
        setUsers(Array.isArray(usersData) ? usersData : []);
        if (profileData) {
          setUserProfile(profileData);
        }
      } catch (error) {
        message.error("Failed to load admin data");
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = (): void => {
    api
      .post("logout")
      .then(async () => {
        try {
          router.navigate({ to: "/" });
          toast.success("Logged out successfully");
        } catch (firebaseErr) {
          console.warn("Failed to delete FCM token:", firebaseErr);
        }
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            "Failed to log out. Please try again."
        );
      });
  };

  const columns: ColumnsType<User> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (username: string) => (
        <div className="flex items-center space-x-3">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{username}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  const rowSelection: TableRowSelection<User> = {
    selectedRowKeys: selectedUserIds,
    onChange: (selectedRowKeys: any) => {
      setSelectedUserIds(selectedRowKeys as number[]);
    },
    onSelectAll: (selected: any) => {
      if (selected) {
        const allIds = users.map((user) => Number(user.id));
        setSelectedUserIds(allIds);
      } else {
        setSelectedUserIds([]);
      }
    },
  };

  const handleSelectAll = (): void => {
    const allIds = users.map((user) => user.id);
    setSelectedUserIds(allIds);
  };

  const handleDeselectAll = (): void => {
    setSelectedUserIds([]);
  };

  const handleSendNotification = (): void => {
    if (selectedUserIds.length === 0) {
      message.warning("Please select at least one user");
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmitNotification = async (
    values: NotificationForm
  ): Promise<void> => {
    setSending(true);
    const data = {
      userIds: selectedUserIds,
      ...values,
    };
    console.log(" New notification:", data);
    try {
      await sendNotification(selectedUserIds.map(String), values);
      toast.success(`Notification sent to ${selectedUserIds.length} user(s)`);
      setIsModalOpen(false);
      form.resetFields();
      setSelectedUserIds([]);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                NexTalk Admin
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  className="flex items-center space-x-2 hover:bg-gray-100"
                >
                  <Avatar
                    size="small"
                    src={userProfile.avatar}
                    icon={<UserOutlined />}
                  />
                  <span className="hidden sm:inline text-gray-700">
                    {userProfile.username.toUpperCase()}
                  </span>
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back,{" "}
            {userProfile.username.charAt(0).toUpperCase() +
              userProfile.username.slice(1)}
            ! 👋
          </h2>
          <p className="text-gray-600">
            Manage users and send notifications from your admin panel.
          </p>
        </div>

        <Card
          title="User Management"
          extra={
            <div className="space-x-2">
              <Button
                onClick={handleSelectAll}
                disabled={selectedUserIds.length === users.length}
              >
                Select All
              </Button>
              <Button
                onClick={handleDeselectAll}
                disabled={selectedUserIds.length === 0}
              >
                Deselect All
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendNotification}
                disabled={selectedUserIds.length === 0}
              >
                Send Notification ({selectedUserIds.length})
              </Button>
            </div>
          }
        >
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
            }}
          />
        </Card>
      </main>

      <Modal
        title="Send Notification"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <NotificationOutlined className="mr-2" />
            Sending to {selectedUserIds.length} selected user(s)
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmitNotification}>
          <Form.Item
            label="Notification Title"
            name="title"
            rules={[
              { required: true, message: "Please enter notification title" },
              { max: 100, message: "Title must be less than 100 characters" },
            ]}
          >
            <Input placeholder="Enter notification title" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="body"
            rules={[
              { required: true, message: "Please enter notification message" },
              { max: 500, message: "Message must be less than 500 characters" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter notification message"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="Image (Optional)" name="image">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Redirect URL"
            name="actionUrl"
            rules={[
              { required: true, message: "Please enter redirect URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input
              placeholder="https://example.com"
              prefix={<LinkOutlined />}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={sending}
              icon={<SendOutlined />}
            >
              Send Notification
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
