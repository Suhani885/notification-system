import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { baseURL } from "../utils/axios";
import {
  BellOutlined,
  UserOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Dropdown,
  Avatar,
  Button,
  Card,
  Empty,
  Spin,
  message,
} from "antd";
import type { MenuProps } from "antd";
import api from "../utils/axios";
import { getMessaging, getToken, deleteToken } from "firebase/messaging";
import toast from "react-hot-toast";
interface Notification {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  image?: string;
  action_url?: string;
}

interface UserProfile {
  username: string;
  email: string;
  avatar?: string | null;
}

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: "User",
    email: "",
    avatar: null,
  });
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    setInitialLoading(true);
    try {
      await Promise.all([loadNotifications(), loadUserProfile()]);
    } catch (error) {
      message.error("Failed to load dashboard data");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadNotifications = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get("notifications");
      const data = response.data.notification;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (): Promise<void> => {
    try {
      const response = await api.get("/login");
      const profile = response.data.user;
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: number): Promise<void> => {
    try {
      await api.put(`/notifications`, { id: notificationId });
      toast.success("Notification marked as read");
      loadNotifications();
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleLogout = async (): Promise<void> => {
    const { messaging } = await import("../firebase/firebaseConfig");
    const fcmToken = await getToken(messaging);
    api
      .post("logout", { token: fcmToken })
      .then(async () => {
        try {
          await deleteToken(messaging);
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

  const unreadCount = notifications.filter((n) => n).length;

  const notificationDropdownContent = (
    <div className="w-80 max-h-96 overflow-y-auto border border-gray-200 rounded-md shadow-lg bg-white">
      <div className="px-4 py-3  border-gray-600 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
      </div>

      {loading && (
        <div className="p-8 text-center">
          <Spin size="large" />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="p-8">
          <Empty description="No notifications yet" />
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-blue-50`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex items-start space-x-3">
                  {notification.image && (
                    <Avatar
                      src={`${baseURL}/media/${notification.image}`}
                      shape="circle"
                      size={40}
                      className="flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm text-gray-900 font-semibold cursor-pointer`}
                          onClick={() => {
                            if (notification.action_url) {
                              window.location.href = notification.action_url;
                            }
                          }}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification?.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              {new Date(
                                notification.timestamp
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(
                                notification.timestamp
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              type="text"
                              size="small"
                              icon={<CheckOutlined />}
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            >
                              Mark as read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
              <h1 className="text-2xl font-bold text-gray-900">NexTalk</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Dropdown
                dropdownRender={() => notificationDropdownContent}
                trigger={["click"]}
                placement="bottomRight"
                open={notificationDropdownOpen}
                onOpenChange={setNotificationDropdownOpen}
              >
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  className="relative hover:bg-gray-100"
                >
                  <Badge count={unreadCount} size="small">
                    <BellOutlined className="text-lg text-gray-600" />
                  </Badge>
                </Button>
              </Dropdown>

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
            Here's what's happening with your conversations today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageOutlined className="text-2xl text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Messages
                </p>
                <p className="text-2xl font-bold text-gray-900">557</p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserOutlined className="text-2xl text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Chats
                </p>
                <p className="text-2xl font-bold text-gray-900">21</p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BellOutlined className="text-2xl text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Unread Notifications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {unreadCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Recent Activity" className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <Avatar icon={<UserOutlined />} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Sarah sent you a message
                </p>
                <p className="text-sm text-gray-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <Avatar icon={<UserOutlined />} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  John joined your group chat
                </p>
                <p className="text-sm text-gray-600">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <Avatar icon={<SettingOutlined />} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  System update completed
                </p>
                <p className="text-sm text-gray-600">1 hour ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button type="primary" size="large" icon={<MessageOutlined />}>
              New Chat
            </Button>
            <Button size="large" icon={<UserOutlined />}>
              Add Contact
            </Button>
            <Button size="large" icon={<SettingOutlined />}>
              Settings
            </Button>
            <Button size="large" icon={<EyeOutlined />}>
              View All Chats
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
