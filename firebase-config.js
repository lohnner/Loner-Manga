export const firebaseConfig = {
  apiKey: "COLE_AQUI_API_KEY",
  authDomain: "COLE_AQUI_AUTH_DOMAIN",
  projectId: "COLE_AQUI_PROJECT_ID",
  storageBucket: "COLE_AQUI_STORAGE_BUCKET",
  messagingSenderId: "COLE_AQUI_SENDER_ID",
  appId: "COLE_AQUI_APP_ID",
  measurementId: ""
};

export const firebaseReady = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.appId &&
    !firebaseConfig.apiKey.includes("COLE_") &&
    !firebaseConfig.appId.includes("COLE_")
);
