import { createFileRoute } from '@tanstack/react-router'
import type { FormProps } from 'antd';
import { Form, Input, Typography } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, UserOutlined } from '@ant-design/icons';
import { useRouter } from '@tanstack/react-router';
// import { toast } from 'sonner';
const { Title, Text } = Typography;

type FieldType = {
  userName?: string;
  password?: string;
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Login failed:', errorInfo);
};

const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  return Notification.permission;
};

const handleNotificationPermission = async () => {
  try {
    const permission = await requestNotificationPermission();
    
    switch (permission) {
      case 'granted':
        console.log('Notification permission granted');
        new Notification('Welcome to NexTalk!', {
          body: 'You will now receive notifications for new messages',
          icon: '/favicon.ico'
        });
        break;
      case 'denied':
        console.log('Notification permission denied');
        break;
      case 'default':
        console.log('Notification permission dismissed');
        break;
    }
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const router = useRouter()
  // const { data, isLoading: loading, isSuccess } = useQuery({
  //   ...coreLoginRetrieveOptions(),
  //   retry: false,
  // });
  // if (isSuccess) {
  //   router.navigate({ to: "/dashboard" })
  // }

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    console.log('Login attempt:', values);
    const token: string = btoa(values.userName + ":" + values.password);
    try {
      // loginmutation.mutate(
      //   {
      //     headers: {
      //       Authorization: `Basic ${token}`,
      //     },
      //   },
      //   {
      //     onSuccess: async (data) => {
      //       toast.success(data.msg)
      //       
      //       await handleNotificationPermission();
      //       
      //       router.navigate({ to: "/dashboard" });
      //     },
      //     onError: (error) => {
      //       console.log(error)
      //       toast.error("error")
      //     },
      //   }
      // );

      await handleNotificationPermission();
      // router.navigate({ to: "/dashboard" });
      
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-slate-700">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s ease-in-out infinite alternate'
          }}
        />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
                radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
              `,
            animation: 'gradientShift 15s ease-in-out infinite alternate'
          }}
        />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="relative w-full max-w-lg mx-auto">
          <div className="text-center mb-12">
            <Title className="!text-white !mb-4 drop-shadow-lg !text-3xl sm:!text-4xl lg:!text-5xl">
              Welcome to NexTalk
            </Title>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="px-6 py-8 sm:px-12 lg:px-16 sm:py-12">
              <div className="text-center mb-8">
                <Title level={3} className="text-black !mb-3 !text-xl sm:!text-2xl lg:!text-3xl !font-bold">
                  Sign in to your account
                </Title>
                <Text className="text-gray-600 !text-base sm:!text-lg">
                  Enter your username and password to continue
                </Text>
              </div>

              <Form
                name="login"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                size="large"
                layout="vertical"
                className="space-y-6"
              >
                <Form.Item<FieldType>
                  label={<span className="text-gray-700 font-semibold text-base">Username</span>}
                  name="userName"
                  rules={[
                    { required: true, message: 'Please enter your User Name' },
                  ]}
                  className="mb-6"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400 mr-1" />}
                    placeholder="Enter your username"
                    className="rounded-xl border-2 border-gray-200 hover:border-blue-400 focus:border-gray-700 transition-colors duration-200"
                    style={{
                      height: '52px',
                      fontSize: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px'
                    }}
                  />
                </Form.Item>

                <Form.Item<FieldType>
                  label={<span className="text-gray-700 font-semibold text-base">Password</span>}
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                  className="mb-8"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400 mr-1" />}
                    placeholder="Enter your password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    className="rounded-xl border-2 border-gray-200 hover:border-blue-400 focus:border-gray-700 transition-colors duration-200"
                    style={{
                      height: '52px',
                      fontSize: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px'
                    }}
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <button
                    type="submit"
                    className="h-14 w-full rounded-xl bg-gradient-to-r from-black via-gray-900 to-slate-700 font-bold text-lg text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-gray-300/50"
                  >
                    Sign In
                  </button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}