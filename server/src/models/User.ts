import bcrypt from 'bcryptjs';
import { getFirestoreInstance } from '../config/firestore';
import { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

/**
 * User Role Types
 */
export type UserRole = 'student' | 'instructor' | 'admin';

/**
 * User Interface
 */
export interface IUser {
  id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  xp: number;
  badges: string[];
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Model Class
 */
class UserModel {
  private static collection = 'users';

  /**
   * Hash password
   */
  private static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password
   */
  static async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  /**
   * Convert Firestore document to User object
   */
  private static docToUser(doc: QueryDocumentSnapshot<DocumentData>): IUser {
    const data = doc.data();
    // Handle Firestore Timestamp conversion
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : 
                     (data.createdAt instanceof Date ? data.createdAt : new Date());
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                     (data.updatedAt instanceof Date ? data.updatedAt : new Date());
    
    return {
      id: doc.id,
      firebaseUid: data.firebaseUid || doc.id,
      name: data.name,
      email: data.email,
      password: data.password || '',
      role: data.role || 'student',
      xp: data.xp || 0,
      badges: data.badges || [],
      googleId: data.googleId,
      createdAt,
      updatedAt,
    };
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string, includePassword: boolean = false): Promise<IUser | null> {
    const db = getFirestoreInstance();
    const usersRef = db.collection(this.collection);
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const user = this.docToUser(snapshot.docs[0]);
    if (!includePassword) {
      delete (user as any).password;
    }
    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<IUser | null> {
    const db = getFirestoreInstance();
    const doc = await db.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const user = this.docToUser(doc as QueryDocumentSnapshot<DocumentData>);
    delete (user as any).password;
    return user;
  }

  /**
   * Find user by Firebase UID
   */
  static async findByFirebaseUid(uid: string): Promise<IUser | null> {
    const db = getFirestoreInstance();

    // Try document ID first
    const doc = await db.collection(this.collection).doc(uid).get();
    if (doc.exists) {
      const user = this.docToUser(doc as QueryDocumentSnapshot<DocumentData>);
      delete (user as any).password;
      return user;
    }

    // Fallback to querying firebaseUid field for backward compatibility
    const usersRef = db.collection(this.collection);
    const snapshot = await usersRef.where('firebaseUid', '==', uid).limit(1).get();
    if (!snapshot.empty) {
      const user = this.docToUser(snapshot.docs[0]);
      delete (user as any).password;
      return user;
    }

    return null;
  }

  /**
   * Find user by Google ID
   */
  static async findByGoogleId(googleId: string): Promise<IUser | null> {
    const db = getFirestoreInstance();
    const usersRef = db.collection(this.collection);
    const snapshot = await usersRef.where('googleId', '==', googleId).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const user = this.docToUser(snapshot.docs[0]);
    delete (user as any).password;
    return user;
  }

  /**
   * Find user by email or Google ID
   */
  static async findByEmailOrGoogleId(email: string, googleId: string): Promise<IUser | null> {
    const db = getFirestoreInstance();
    const usersRef = db.collection(this.collection);
    
    // Try email first
    let snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    if (!snapshot.empty) {
      const user = this.docToUser(snapshot.docs[0]);
      delete (user as any).password;
      return user;
    }

    // Try Google ID
    snapshot = await usersRef.where('googleId', '==', googleId).limit(1).get();
    if (!snapshot.empty) {
      const user = this.docToUser(snapshot.docs[0]);
      delete (user as any).password;
      return user;
    }

    return null;
  }

  /**
   * Create new user
   */
  static async create(userData: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    googleId?: string;
    xp?: number;
    badges?: string[];
    firebaseUid?: string;
  }): Promise<IUser> {
    const db = getFirestoreInstance();
    const now = new Date();

    const userDoc: any = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      role: userData.role || 'student',
      xp: userData.xp || 0,
      badges: userData.badges || [],
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    if (userData.firebaseUid) {
      userDoc.firebaseUid = userData.firebaseUid;
    }

    // Hash password if provided
    if (userData.password) {
      userDoc.password = await this.hashPassword(userData.password);
    } else {
      userDoc.password = '';
    }

    // Add Google ID if provided
    if (userData.googleId) {
      userDoc.googleId = userData.googleId;
    }

    let docRef;
    if (userData.firebaseUid) {
      docRef = db.collection(this.collection).doc(userData.firebaseUid);
      await docRef.set(userDoc, { merge: true });
    } else {
      docRef = await db.collection(this.collection).add(userDoc);
    }
    const doc = await docRef.get();

    const user = this.docToUser(doc as QueryDocumentSnapshot<DocumentData>);
    delete (user as any).password;
    return user;
  }

  /**
   * Update user
   */
  static async update(id: string, updates: Partial<IUser>): Promise<IUser> {
    const db = getFirestoreInstance();
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    // Remove id and dates from updates (they're handled separately)
    delete updateData.id;
    delete updateData.createdAt;

    await db.collection(this.collection).doc(id).update(updateData);
    const updated = await this.findById(id);
    
    if (!updated) {
      throw new Error('User not found after update');
    }

    return updated;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<void> {
    const db = getFirestoreInstance();
    await db.collection(this.collection).doc(id).delete();
  }
}

export default UserModel;
