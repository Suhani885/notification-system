importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
 apiKey: "AIzaSyAZWdBZFk6V5sZoZOo-ugZGCgB9gvQqiMI",
  authDomain: "notification-d1d31.firebaseapp.com",
  projectId: "notification-d1d31",
  storageBucket: "notification-d1d31.firebasestorage.app",
  messagingSenderId: "211732983860",
  appId: "1:211732983860:web:c5c715ee14eb7d6f4a9a61",
  measurementId: "G-TRGD98BKQM"
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