import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let firestoreInstance: Firestore | null = null;
let firebaseApp: App | null = null;

/**
 * Initialize Firestore connection
 * @returns Promise<Firestore>
 */
export const initializeFirestore = async (): Promise<Firestore> => {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  try {
    // Check if Firebase app already exists
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
      firestoreInstance = getFirestore(firebaseApp);
      console.log('✅ Using existing Firebase app');
      return firestoreInstance;
    }

    // Get Firebase credentials from environment
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!serviceAccountKey || !projectId) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY and FIREBASE_PROJECT_ID are required');
    }

    // Parse service account key (can be JSON string or path)
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
      
      // Fix private key: replace \n escape sequences with actual newlines
      // This is needed because environment variables store \n as literal characters
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
    } catch (parseError) {
      // If parsing fails, assume it's a file path
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_KEY must be a valid JSON string: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Initialize Firebase Admin
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId,
    });

    firestoreInstance = getFirestore(firebaseApp);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Firestore Connection Successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Project ID: ${projectId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return firestoreInstance;
  } catch (error: any) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Firestore Connection Failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`💬 Error Message: ${error.message || 'No error message'}`);
    console.error('\n💡 Make sure you have set:');
    console.error('   FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)');
    console.error('   FIREBASE_PROJECT_ID');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    throw error;
  }
};

/**
 * Get Firestore instance
 * @returns Firestore
 */
export const getFirestoreInstance = (): Firestore => {
  if (!firestoreInstance) {
    throw new Error('Firestore not initialized. Call initializeFirestore() first.');
  }
  return firestoreInstance;
};

export default firestoreInstance;

