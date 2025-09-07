importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD1bStJ16x9k6AJS1nJr8r6H1rBjS_-ESs",
  authDomain: "notification-system-df72c.firebaseapp.com",
  projectId: "notification-system-df72c",
  storageBucket: "notification-system-df72c.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  measurementId: "G-QQ60MN24F2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'NexTalk Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'nextalk-notification',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});