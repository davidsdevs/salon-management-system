const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this file exists
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Additional stylists for Makati branch
const makatiStylists = [
  {
    // Core user information
    email: 'maria.santos@davidsalon.com',
    password: 'password123',
    firstName: 'Maria',
    lastName: 'Santos',
    phoneNumber: '+63 917 333 3333',
    birthDate: '1990-05-12T00:00:00.000Z',
    gender: 'Female',
    profileImage: '',
    emailVerified: true,
    
    // Account metadata
    role: 'stylist',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'EMP003',
      hireDate: new Date('2021-03-01T00:00:00.000Z'),
      salary: 26000,
      skills: ['service_haircut_women', 'service_coloring', 'service_highlights', 'service_balayage', 'service_keratin']
    }
  },
  {
    // Core user information
    email: 'james.rodriguez@davidsalon.com',
    password: 'password123',
    firstName: 'James',
    lastName: 'Rodriguez',
    phoneNumber: '+63 917 444 4444',
    birthDate: '1987-11-08T00:00:00.000Z',
    gender: 'Male',
    profileImage: '',
    emailVerified: true,
    
    // Account metadata
    role: 'stylist',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'EMP004',
      hireDate: new Date('2020-08-15T00:00:00.000Z'),
      salary: 27000,
      skills: ['service_haircut_men', 'service_beard', 'service_mustache', 'service_fade', 'service_perm']
    }
  },
  {
    // Core user information
    email: 'sophia.lim@davidsalon.com',
    password: 'password123',
    firstName: 'Sophia',
    lastName: 'Lim',
    phoneNumber: '+63 917 555 5555',
    birthDate: '1992-02-28T00:00:00.000Z',
    gender: 'Female',
    profileImage: '',
    emailVerified: true,
    
    // Account metadata
    role: 'stylist',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'EMP005',
      hireDate: new Date('2022-01-10T00:00:00.000Z'),
      salary: 24000,
      skills: ['service_haircut_women', 'service_bridal', 'service_makeup', 'service_updo', 'service_braiding']
    }
  },
  {
    // Core user information
    email: 'carlos.mendoza@davidsalon.com',
    password: 'password123',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    phoneNumber: '+63 917 666 6666',
    birthDate: '1989-09-14T00:00:00.000Z',
    gender: 'Male',
    profileImage: '',
    emailVerified: true,
    
    // Account metadata
    role: 'stylist',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'EMP006',
      hireDate: new Date('2021-07-20T00:00:00.000Z'),
      salary: 28000,
      skills: ['service_haircut_men', 'service_haircut_women', 'service_coloring', 'service_highlights', 'service_treatment']
    }
  },
  {
    // Core user information
    email: 'isabella.tan@davidsalon.com',
    password: 'password123',
    firstName: 'Isabella',
    lastName: 'Tan',
    phoneNumber: '+63 917 777 7777',
    birthDate: '1994-12-03T00:00:00.000Z',
    gender: 'Female',
    profileImage: '',
    emailVerified: true,
    
    // Account metadata
    role: 'stylist',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'EMP007',
      hireDate: new Date('2022-06-01T00:00:00.000Z'),
      salary: 23000,
      skills: ['service_haircut_women', 'service_coloring', 'service_ombré', 'service_balayage', 'service_keratin']
    }
  },
  {
    // Core user information
    email: 'antonio.garcia@davidsalon.com',
    password: 'password123',
    firstName: 'Antonio',
    lastName: 'Garcia',
    phoneNumber: '+63 917 888 8888',
    birthDate: '1986-04-17T00:00:00.000Z',
    gender: 'Male',
    profileImage: '',
    emailVerified: true,
    
    // Account metadata
    role: 'stylist',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'EMP008',
      hireDate: new Date('2019-11-15T00:00:00.000Z'),
      salary: 29000,
      skills: ['service_haircut_men', 'service_haircut_women', 'service_beard', 'service_mustache', 'service_styling']
    }
  }
];

async function seedMakatiStylists() {
  try {
    console.log('Starting to seed Makati stylists...');
    
    for (const stylistData of makatiStylists) {
      try {
        // Create Firebase Auth user
        const userRecord = await admin.auth().createUser({
          email: stylistData.email,
          password: stylistData.password,
          displayName: `${stylistData.firstName} ${stylistData.lastName}`,
          emailVerified: stylistData.emailVerified
        });

        console.log(`Created auth user: ${stylistData.email}`);

        // Create user document in Firestore
        const userDoc = {
          uid: userRecord.uid,
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
          createdAt: admin.firestore.Timestamp.fromDate(stylistData.createdAt),
          updatedAt: admin.firestore.Timestamp.fromDate(stylistData.updatedAt),
          staffData: stylistData.staffData,
          clientData: null
        };

        await db.collection('users').doc(userRecord.uid).set(userDoc);
        console.log(`Created Firestore user document: ${stylistData.email}`);

      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`User ${stylistData.email} already exists, skipping...`);
        } else {
          console.error(`Error creating user ${stylistData.email}:`, error);
        }
      }
    }

    console.log('✅ Successfully seeded Makati stylists!');
    console.log(`Added ${makatiStylists.length} stylists to the Makati branch.`);
    
  } catch (error) {
    console.error('❌ Error seeding Makati stylists:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedMakatiStylists();
