const fs = require('fs');
const path = require('path');
// Polyfill XMLHttpRequest for Firebase Storage
global.XMLHttpRequest = require('xhr2');

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInAnonymously } = require('firebase/auth');

require('dotenv').config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const logoPath = path.join(__dirname, '../public/assets/logo-final.png');

const files = [
    {
        src: logoPath,
        dest: "assets/logo.png",
        contentType: "image/png"
    },
    {
        src: logoPath,
        dest: "assets/favicon.png",
        contentType: "image/png"
    },
    {
        src: logoPath,
        dest: "assets/icon-192.png",
        contentType: "image/png"
    },
    {
        src: logoPath,
        dest: "assets/icon-512.png",
        contentType: "image/png"
    }
];

async function uploadFiles() {
    const auth = getAuth(app);
    try {
        await signInAnonymously(auth);
        console.log("Signed in anonymously");
    } catch (error) {
        console.error("Error signing in:", error);
        process.exit(1);
    }

    for (const file of files) {
        try {
            console.log(`Reading ${file.src}...`);
            const buffer = fs.readFileSync(file.src);
            const uint8Array = new Uint8Array(buffer);

            console.log(`Uploading to ${file.dest}...`);
            const storageRef = ref(storage, file.dest);

            await uploadBytes(storageRef, uint8Array, { contentType: file.contentType });
            console.log(`Successfully uploaded ${file.dest}`);
            const downloadURL = await getDownloadURL(storageRef);
            console.log(`Download URL for ${file.dest}: ${downloadURL}`);
        } catch (error) {
            console.error(`Error uploading ${file.dest}:`, error);
            process.exit(1);
        }
    }
    console.log('All uploads complete!');
    process.exit(0);
}

uploadFiles();
