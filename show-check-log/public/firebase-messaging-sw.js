importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyBI66UgSM5WLV1g4-lrzqN4s1BBD5rIjk0",
  authDomain: "show-check-log.firebaseapp.com",
  projectId: "show-check-log",
  messagingSenderId: "59159890509",
  appId: "1:59159890509:web:32c44c952a0240384b6a04"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png"
  })
})