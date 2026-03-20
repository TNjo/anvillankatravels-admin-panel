const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin using environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Error: Firebase credentials not found in .env.local!');
  console.log('Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore();
const bucket = getStorage().bucket();

const MEMORIES_FOLDER = 'd:\\Tour website\\dream-sri-lanka-planner\\src\\assets\\Memories';
const COLLECTION = 'travelMemories';

async function uploadImage(filePath, fileName) {
  const destination = `travel-memories/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
  
  await bucket.upload(filePath, {
    destination,
    metadata: {
      contentType: 'image/jpeg',
    },
  });

  const file = bucket.file(destination);
  await file.makePublic();
  
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
  return publicUrl;
}

async function seedMemories() {
  console.log('Starting to seed travel memories...\n');

  // Get all jpeg files
  const files = fs.readdirSync(MEMORIES_FOLDER)
    .filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'))
    .sort();

  console.log(`Found ${files.length} images to upload.\n`);

  // Check if collection already has data
  const existingDocs = await db.collection(COLLECTION).get();
  if (!existingDocs.empty) {
    console.log(`Collection already has ${existingDocs.size} documents.`);
    console.log('Do you want to continue and add more? (existing ones will be kept)\n');
  }

  let order = existingDocs.size;

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const filePath = path.join(MEMORIES_FOLDER, fileName);
    
    console.log(`[${i + 1}/${files.length}] Uploading: ${fileName}`);
    
    try {
      // Upload to Firebase Storage
      const imageUrl = await uploadImage(filePath, fileName);
      console.log(`  ✓ Uploaded to: ${imageUrl}`);

      // Save to Firestore
      const now = new Date().toISOString();
      const memoryData = {
        imageUrl,
        title: '',
        location: 'Sri Lanka',
        caption: '',
        order: order + i,
        published: true,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection(COLLECTION).add(memoryData);
      console.log(`  ✓ Saved to Firestore: ${docRef.id}\n`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
  }

  console.log('Done! All images have been uploaded and saved to the database.');
  console.log('\nYou can now view them at:');
  console.log('- Admin: https://admin.anvillankatravels.com/dashboard/travel-memories');
  console.log('- API: https://admin.anvillankatravels.com/api/travel-memories?published=true');
}

seedMemories().catch(console.error);
