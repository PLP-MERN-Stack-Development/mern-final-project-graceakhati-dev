import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let firestoreInstance: Firestore | null = null;
let firebaseApp: App | null = null;

/**
 * Initialize Firestore connection with proper error handling and validation
 * @returns Promise<Firestore>
 */
export const initializeFirestore = async (): Promise<Firestore> => {
  if (firestoreInstance) {
    console.log("ℹ️  Returning existing Firestore instance");
    return firestoreInstance;
  }

  try {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 Initializing Firebase Admin / Firestore...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Check if Firebase app already exists
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log("ℹ️  Found existing Firebase Admin app, reusing...");
      firebaseApp = existingApps[0];
      firestoreInstance = getFirestore(firebaseApp);
      console.log("✅ Using existing Firebase Admin app");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return firestoreInstance;
    }

    // STEP 1: Validate environment variables exist
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    console.log("🔍 Checking environment variables:");
    console.log(`   FIREBASE_PROJECT_ID: ${projectId ? "✅ Set" : "❌ Missing"}`);
    console.log(`   FIREBASE_SERVICE_ACCOUNT_KEY: ${serviceAccountKey ? "✅ Set" : "❌ Missing"}`);
    
    if (!projectId) {
      throw new Error(
        "❌ FIREBASE_PROJECT_ID is not set in environment variables.\n" +
        "   Please add it to your .env file or Render dashboard."
      );
    }

    if (!serviceAccountKey) {
      throw new Error(
        "❌ FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables.\n" +
        "   Please add the Firebase service account JSON to your .env file or Render dashboard."
      );
    }

    // STEP 2: Parse service account JSON safely
    console.log("\n📋 Parsing Firebase service account JSON...");
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
      console.log("✅ Service account JSON parsed successfully");
    } catch (parseError) {
      throw new Error(
        `❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON.\n` +
        `   Error: ${parseError instanceof Error ? parseError.message : "Unknown error"}\n` +
        `   Make sure the value is valid JSON with no syntax errors.`
      );
    }

    // STEP 3: Validate service account structure
    console.log("\n🔍 Validating service account structure...");
    if (!serviceAccount.type || serviceAccount.type !== "service_account") {
      throw new Error(
        `❌ Invalid service account: missing or incorrect 'type' field.\n` +
        `   Expected: "service_account", Got: "${serviceAccount.type}"`
      );
    }

    if (!serviceAccount.project_id) {
      throw new Error("❌ Invalid service account: missing 'project_id' field");
    }

    if (!serviceAccount.private_key) {
      throw new Error("❌ Invalid service account: missing 'private_key' field");
    }

    if (!serviceAccount.client_email) {
      throw new Error("❌ Invalid service account: missing 'client_email' field");
    }

    console.log(`   Type: ${serviceAccount.type} ✅`);
    console.log(`   Project ID: ${serviceAccount.project_id} ✅`);
    console.log(`   Client Email: ${serviceAccount.client_email} ✅`);
    console.log(`   Private Key: ${serviceAccount.private_key ? "Present" : "Missing"} ✅`);

    // STEP 4: Validate project ID matches
    if (serviceAccount.project_id !== projectId) {
      console.warn(
        `⚠️  Warning: FIREBASE_PROJECT_ID (${projectId}) doesn't match service account project_id (${serviceAccount.project_id})`
      );
    }

    // STEP 5: Fix private key newline formatting
    console.log("\n🔧 Processing private key...");
    if (serviceAccount.private_key && typeof serviceAccount.private_key === "string") {
      // Replace escaped newlines (\n) with actual newline characters
      const originalLength = serviceAccount.private_key.length;
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      console.log(`   Original length: ${originalLength}`);
      console.log(`   After newline replacement: ${serviceAccount.private_key.length}`);
      console.log(`   Starts with: ${serviceAccount.private_key.substring(0, 27)}`);
      console.log(`   Contains actual newlines: ${serviceAccount.private_key.includes("\n") ? "Yes ✅" : "No ❌"}`);
    }

    // STEP 6: Initialize Firebase Admin SDK
    console.log("\n🚀 Initializing Firebase Admin SDK...");
    try {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId,
      });
      console.log("✅ Firebase Admin app initialized");
    } catch (initError) {
      throw new Error(
        `❌ Failed to initialize Firebase Admin app.\n` +
        `   Error: ${initError instanceof Error ? initError.message : "Unknown error"}\n` +
        `   This usually means the private_key format is invalid.`
      );
    }

    // STEP 7: Get Firestore instance
    console.log("📊 Getting Firestore instance...");
    firestoreInstance = getFirestore(firebaseApp);
    console.log("✅ Firestore instance obtained");

    // SUCCESS!
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Firestore Connection Successful!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📧 Service Account: ${serviceAccount.client_email}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return firestoreInstance;
  } catch (error: any) {
    // Enhanced error logging
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Firestore Initialization Failed!");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(`💬 Error Message: ${error.message || "No error message"}`);
    
    if (error.stack) {
      console.error("\n📋 Stack Trace:");
      console.error(error.stack);
    }

    console.error("\n💡 Troubleshooting Tips:");
    console.error("   1. Verify FIREBASE_PROJECT_ID is set in .env");
    console.error("   2. Verify FIREBASE_SERVICE_ACCOUNT_KEY is valid JSON");
    console.error("   3. Ensure private_key in the JSON contains actual newlines");
    console.error("   4. Check that you downloaded the service account key from Firebase Console");
    console.error("   5. If on Render, ensure environment variables are set in dashboard");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    throw error;
  }
};

export const getFirestoreInstance = (): Firestore => {
  if (!firestoreInstance) {
    throw new Error("Firestore not initialized. Call initializeFirestore() first.");
  }
  return firestoreInstance;
};

export default {
  initializeFirestore,
  getFirestoreInstance,
};
