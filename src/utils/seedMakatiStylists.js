import { 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { sampleStylistUsers } from '../seedData.js';

// Filter only Makati stylists from the sample data
const makatiStylists = sampleStylistUsers.filter(stylist => 
  stylist.staffData.branchId === 'branch_makati'
);

export async function seedMakatiStylists() {
  console.log('Starting to seed Makati stylists...');
  const results = {
    success: [],
    errors: [],
    skipped: []
  };

  for (const stylistData of makatiStylists) {
    try {
      // Check if user already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, stylistData.email);
      if (signInMethods.length > 0) {
        results.skipped.push({
          email: stylistData.email,
          reason: 'User already exists'
        });
        console.log(`User ${stylistData.email} already exists, skipping...`);
        continue;
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        stylistData.email, 
        stylistData.password
      );
      const user = userCredential.user;

      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: stylistData.email,
        firstName: stylistData.firstName,
        lastName: stylistData.lastName,
        phoneNumber: stylistData.phoneNumber,
        birthDate: stylistData.birthDate,
        gender: stylistData.gender,
        profileImage: stylistData.profileImage,
        emailVerified: stylistData.emailVerified,
        role: stylistData.role,
        status: stylistData.status,
        createdAt: stylistData.createdAt,
        updatedAt: stylistData.updatedAt,
        staffData: stylistData.staffData,
        clientData: null
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      results.success.push({
        email: stylistData.email,
        name: `${stylistData.firstName} ${stylistData.lastName}`,
        employeeId: stylistData.staffData.employeeId
      });

      console.log(`✅ Created stylist: ${stylistData.firstName} ${stylistData.lastName} (${stylistData.email})`);

    } catch (error) {
      results.errors.push({
        email: stylistData.email,
        error: error.message
      });
      console.error(`❌ Error creating user ${stylistData.email}:`, error);
    }
  }

  console.log('Seeding completed!');
  console.log(`✅ Success: ${results.success.length} stylists`);
  console.log(`⚠️ Skipped: ${results.skipped.length} stylists`);
  console.log(`❌ Errors: ${results.errors.length} stylists`);

  return results;
}

// Function to check existing Makati stylists
export async function getExistingMakatiStylists() {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'stylist'),
      where('staffData.branchId', '==', 'branch_makati')
    );
    
    const querySnapshot = await getDocs(q);
    const stylists = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stylists.push({
        id: doc.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        employeeId: data.staffData?.employeeId,
        skills: data.staffData?.skills || []
      });
    });
    
    return stylists;
  } catch (error) {
    console.error('Error fetching Makati stylists:', error);
    return [];
  }
}

// Function to get available stylists for appointment booking
export async function getAvailableStylistsForAppointment() {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'stylist'),
      where('staffData.branchId', '==', 'branch_makati'),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const stylists = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stylists.push({
        id: doc.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phoneNumber,
        specialties: data.staffData?.skills || [],
        serviceIds: data.staffData?.skills || [],
        available: true,
        rating: 4.5 // Default rating
      });
    });
    
    return stylists;
  } catch (error) {
    console.error('Error fetching available stylists:', error);
    return [];
  }
}
