const fs = require('fs');
const path = require('path');
// Polyfill XMLHttpRequest for Firebase Storage
global.XMLHttpRequest = require('xhr2');

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInAnonymously } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "***REMOVED***",
    authDomain: "rcbc-debt-tracker-app.firebaseapp.com",
    projectId: "rcbc-debt-tracker-app",
    storageBucket: "rcbc-debt-tracker-app.firebasestorage.app",
    messagingSenderId: "***REMOVED***",
    appId: "1:***REMOVED***:web:0377a94b9799cbd550b53f"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const files = [
    {
        src: "C:/Users/Deign/.gemini/antigravity/brain/5656b8cb-b281-4974-b22d-e3b1b36027d1/uploaded_image_0_1763895934799.png",
        dest: "logo-circle.png",
        contentType: "image/png"
    },
    {
        src: "C:/Users/Deign/.gemini/antigravity/brain/5656b8cb-b281-4974-b22d-e3b1b36027d1/uploaded_image_1_1763895934799.png",
        dest: "logo-transparent.png",
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
