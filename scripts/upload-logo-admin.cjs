const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// Using the CI token set in environment variable
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccount && !process.env.FIREBASE_TOKEN) {
  console.error('❌ Error: No Firebase credentials found!');
  console.log('\nPlease set up authentication using one of these methods:');
  console.log('1. Set FIREBASE_TOKEN environment variable (from firebase login:ci)');
  console.log('2. Set GOOGLE_APPLICATION_CREDENTIALS to path of service account JSON');
  console.log('\nSee STORAGE_SETUP.md for detailed instructions.');
  process.exit(1);
}

try {
  admin.initializeApp({
    projectId: 'rcbc-debt-tracker-app',
    storageBucket: 'rcbc-debt-tracker-app.firebasestorage.app'
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const bucket = admin.storage().bucket();

async function uploadLogo() {
  try {
    // Path to the truly transparent logo image
    const logoPath = path.join(__dirname, '../public/assets/logo-transparent-fixed.png');
    
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo file not found at:', logoPath);
      console.log('\nPlease run the transparency fix script first:');
      console.log('python scripts/make-transparent.py');
      process.exit(1);
    }

    // Upload the logo with different sizes/names
    const uploads = [
      { localPath: logoPath, remotePath: 'assets/logo.png' },
      { localPath: logoPath, remotePath: 'assets/favicon.png' },
      { localPath: logoPath, remotePath: 'assets/icon-192.png' },
      { localPath: logoPath, remotePath: 'assets/icon-512.png' },
    ];

    console.log('🚀 Starting logo upload to Firebase Storage...\n');

    for (const { localPath, remotePath } of uploads) {
      console.log(`📤 Uploading ${remotePath}...`);
      
      await bucket.upload(localPath, {
        destination: remotePath,
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000', // Cache for 1 year
        },
        public: true, // Make the file publicly accessible
      });

      // Get the public URL
      const file = bucket.file(remotePath);
      await file.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${remotePath}`;
      console.log(`   ✅ ${publicUrl}\n`);
    }

    console.log('✨ All logos uploaded successfully!\n');
    console.log('Public URLs:');
    console.log(`  Logo:     https://storage.googleapis.com/${bucket.name}/assets/logo.png`);
    console.log(`  Favicon:  https://storage.googleapis.com/${bucket.name}/assets/favicon.png`);
    console.log(`  Icon 192: https://storage.googleapis.com/${bucket.name}/assets/icon-192.png`);
    console.log(`  Icon 512: https://storage.googleapis.com/${bucket.name}/assets/icon-512.png`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Firebase Storage is enabled in the Firebase Console');
    console.log('2. Check that your credentials have Storage permissions');
    console.log('3. See STORAGE_SETUP.md for detailed setup instructions');
    process.exit(1);
  }
}

uploadLogo();
