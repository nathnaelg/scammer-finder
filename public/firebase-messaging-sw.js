/// <reference lib="webworker" />
// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/9.24.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.24.0/firebase-messaging-compat.js");
// Firebase configuration
var firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize Firebase Messaging
var messaging = firebase.messaging();
// Background message handler
messaging.onBackgroundMessage(function (payload) {
    var _a, _b, _c;
    console.log("Received background message:", payload);
    var notificationTitle = ((_a = payload.notification) === null || _a === void 0 ? void 0 : _a.title) || "Background Notification";
    var notificationOptions = {
        body: (_b = payload.notification) === null || _b === void 0 ? void 0 : _b.body,
        icon: ((_c = payload.notification) === null || _c === void 0 ? void 0 : _c.icon) || "/firebase-logo.png",
    };
    var serviceWorker = self; // Correctly type `self`
    serviceWorker.registration.showNotification(notificationTitle, notificationOptions);
});
