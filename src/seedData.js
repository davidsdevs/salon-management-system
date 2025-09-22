import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { db, auth } from './firebase';

// Sample Branches Data
export const sampleBranches = [
  {
    id: 'branch_makati',
    name: 'David\'s Salon - Makati',
    address: '123 Ayala Avenue, Makati City, Metro Manila',
    phone: '+63 2 8888 1234',
    email: 'makati@davidssalon.com',
    operatingHours: {
      monday: '9:00 AM - 8:00 PM',
      tuesday: '9:00 AM - 8:00 PM',
      wednesday: '9:00 AM - 8:00 PM',
      thursday: '9:00 AM - 8:00 PM',
      friday: '9:00 AM - 8:00 PM',
      saturday: '9:00 AM - 7:00 PM',
      sunday: '10:00 AM - 6:00 PM'
    },
    managerId: 'manager_makati',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'branch_sm_north',
    name: 'David\'s Salon - SM North',
    address: 'SM North EDSA, Quezon City, Metro Manila',
    phone: '+63 2 8888 5678',
    email: 'smnorth@davidssalon.com',
    operatingHours: {
      monday: '10:00 AM - 9:00 PM',
      tuesday: '10:00 AM - 9:00 PM',
      wednesday: '10:00 AM - 9:00 PM',
      thursday: '10:00 AM - 9:00 PM',
      friday: '10:00 AM - 9:00 PM',
      saturday: '10:00 AM - 8:00 PM',
      sunday: '11:00 AM - 7:00 PM'
    },
    managerId: 'manager_sm_north',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'branch_bgc',
    name: 'David\'s Salon - BGC',
    address: '456 Bonifacio High Street, Taguig City, Metro Manila',
    phone: '+63 2 8888 9999',
    email: 'bgc@davidssalon.com',
    operatingHours: {
      monday: '9:00 AM - 9:00 PM',
      tuesday: '9:00 AM - 9:00 PM',
      wednesday: '9:00 AM - 9:00 PM',
      thursday: '9:00 AM - 9:00 PM',
      friday: '9:00 AM - 9:00 PM',
      saturday: '9:00 AM - 8:00 PM',
      sunday: '10:00 AM - 7:00 PM'
    },
    managerId: 'manager_bgc',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample Client Users Data (following new structure)
export const sampleClientUsers = [
  {
    // Core user information
    email: 'client1@test.com',
    password: 'password123',
    firstName: 'Maria',
    lastName: 'Santos',
    phoneNumber: '+63 917 123 4567',
    birthDate: '1990-05-15T00:00:00.000Z',
    gender: 'Female',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'client',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Client-specific data
    clientData: {
      category: 'X',
      loyaltyPoints: 150,
      referralCode: 'MARIA123',
      preferences: {
        receivePromotions: true,
        agreeToTerms: true
      }
    }
  },
  {
    // Core user information
    email: 'client2@test.com',
    password: 'password123',
    firstName: 'Juan',
    lastName: 'Cruz',
    phoneNumber: '+63 917 234 5678',
    birthDate: '1985-08-22T00:00:00.000Z',
    gender: 'Male',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'client',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Client-specific data
    clientData: {
      category: 'TR',
      loyaltyPoints: 75,
      referralCode: 'JUAN456',
      preferences: {
        receivePromotions: false,
        agreeToTerms: true
      }
    }
  },
  {
    // Core user information
    email: 'client3@test.com',
    password: 'password123',
    firstName: 'Ana',
    lastName: 'Reyes',
    phoneNumber: '+63 917 345 6789',
    birthDate: '1992-12-10T00:00:00.000Z',
    gender: 'Female',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'client',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Client-specific data
    clientData: {
      category: 'R',
      loyaltyPoints: 200,
      referralCode: 'ANA789',
      preferences: {
        receivePromotions: true,
        agreeToTerms: true
      }
    }
  }
];

// Sample Stylist Users Data (following new structure)
export const sampleStylistUsers = [
  {
    // Core user information
    email: 'stylist1@test.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phoneNumber: '+63 917 111 1111',
    birthDate: '1988-03-15T00:00:00.000Z',
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
      employeeId: 'EMP001',
      hireDate: new Date('2020-01-15T00:00:00.000Z'),
      salary: 25000,
      skills: ['service_haircut_men', 'service_haircut_women', 'service_coloring', 'service_styling']
    }
  },
  {
    // Core user information
    email: 'stylist2@test.com',
    password: 'password123',
    firstName: 'Michael',
    lastName: 'Chen',
    phoneNumber: '+63 917 222 2222',
    birthDate: '1985-07-22T00:00:00.000Z',
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
      branchId: 'branch_sm_north',
      employeeId: 'EMP002',
      hireDate: new Date('2019-06-01T00:00:00.000Z'),
      salary: 28000,
      skills: ['service_haircut_men', 'service_beard', 'service_mustache', 'service_styling']
    }
  }
];

// Sample Receptionist Users Data (following new structure)
export const sampleReceptionistUsers = [
  {
    // Core user information
    email: 'receptionist1@test.com',
    password: 'password123',
    firstName: 'Lisa',
    lastName: 'Garcia',
    phoneNumber: '+63 917 333 3333',
    birthDate: '1990-11-08T00:00:00.000Z',
    gender: 'Female',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'receptionist',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'EMP003',
      hireDate: new Date('2021-03-01T00:00:00.000Z'),
      salary: 20000,
      skills: ['appointment_management', 'customer_service', 'billing']
    }
  }
];

// Sample Branch Manager Users Data (following new structure)
export const sampleBranchManagerUsers = [
  {
    // Core user information
    email: 'manager1@test.com',
    password: 'password123',
    firstName: 'Roberto',
    lastName: 'Silva',
    phoneNumber: '+63 917 555 5555',
    birthDate: '1980-09-20T00:00:00.000Z',
    gender: 'Male',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'branch_manager',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'MGR001',
      hireDate: new Date('2018-01-15T00:00:00.000Z'),
      salary: 45000,
      skills: ['management', 'staff_scheduling', 'inventory_management', 'customer_relations']
    }
  }
];

// Sample Branch Admin Users Data (following new structure)
export const sampleBranchAdminUsers = [
  {
    // Core user information
    email: 'branchadmin1@test.com',
    password: 'password123',
    firstName: 'Patricia',
    lastName: 'Lopez',
    phoneNumber: '+63 917 777 7777',
    birthDate: '1978-06-18T00:00:00.000Z',
    gender: 'Female',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'branch_admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'ADM001',
      hireDate: new Date('2016-03-01T00:00:00.000Z'),
      salary: 55000,
      skills: ['admin_management', 'financial_reporting', 'staff_management', 'branch_operations']
    }
  }
];

// Sample Inventory Controller Users Data (following new structure)
export const sampleInventoryControllerUsers = [
  {
    // Core user information
    email: 'inventory1@test.com',
    password: 'password123',
    firstName: 'David',
    lastName: 'Kim',
    phoneNumber: '+63 917 888 8888',
    birthDate: '1985-01-25T00:00:00.000Z',
    gender: 'Male',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'inventory_controller',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'INV001',
      hireDate: new Date('2019-11-01T00:00:00.000Z'),
      salary: 30000,
      skills: ['inventory_management', 'supply_ordering', 'stock_tracking', 'cost_analysis']
    }
  }
];

// Sample Operational Manager Users Data (following new structure)
export const sampleOperationalManagerUsers = [
  {
    // Core user information
    email: 'opsmanager1@test.com',
    password: 'password123',
    firstName: 'Jennifer',
    lastName: 'Wong',
    phoneNumber: '+63 917 999 9999',
    birthDate: '1983-08-14T00:00:00.000Z',
    gender: 'Female',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'operational_manager',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'OPS001',
      hireDate: new Date('2015-05-01T00:00:00.000Z'),
      salary: 60000,
      skills: ['operations_management', 'process_optimization', 'multi_branch_management', 'strategic_planning']
    }
  }
];

// Sample Super Admin Users Data (following new structure)
export const sampleSuperAdminUsers = [
  {
    // Core user information
    email: 'superadmin@test.com',
    password: 'password123',
    firstName: 'Alexander',
    lastName: 'Thompson',
    phoneNumber: '+63 917 000 0000',
    birthDate: '1975-03-30T00:00:00.000Z',
    gender: 'Male',
    profileImage: '',
    emailVerified: true,

    // Account metadata
    role: 'super_admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Staff-specific data
    staffData: {
      branchId: 'branch_makati',
      employeeId: 'SUPER001',
      hireDate: new Date('2010-01-01T00:00:00.000Z'),
      salary: 100000,
      skills: ['system_administration', 'user_management', 'security_management', 'business_strategy']
    }
  }
];

// Sample Services Data
export const sampleServices = [
  {
    id: 'service_haircut_men',
    name: 'Men\'s Haircut',
    description: 'Professional men\'s haircut with styling',
    category: 'hair',
    price: 350,
    duration: 45,
    imageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    isChemical: false,
    requiresStylist: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'service_haircut_women',
    name: 'Women\'s Haircut',
    description: 'Professional women\'s haircut with styling',
    category: 'hair',
    price: 450,
    duration: 60,
    imageURL: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop&crop=face',
    isActive: true,
    isChemical: false,
    requiresStylist: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'service_coloring',
    name: 'Hair Coloring',
    description: 'Professional hair coloring service',
    category: 'hair',
    price: 1200,
    duration: 120,
    imageURL: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop',
    isActive: true,
    isChemical: true,
    requiresStylist: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'service_styling',
    name: 'Hair Styling',
    description: 'Professional hair styling for special occasions',
    category: 'hair',
    price: 800,
    duration: 90,
    imageURL: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
    isActive: true,
    isChemical: false,
    requiresStylist: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'service_beard',
    name: 'Beard Trim',
    description: 'Professional beard trimming and shaping',
    category: 'other',
    price: 200,
    duration: 30,
    imageURL: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop',
    isActive: true,
    isChemical: false,
    requiresStylist: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'service_mustache',
    name: 'Mustache Trim',
    description: 'Professional mustache trimming and styling',
    category: 'other',
    price: 150,
    duration: 20,
    imageURL: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop',
    isActive: true,
    isChemical: false,
    requiresStylist: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample Staff Services Data
export const sampleStaffServices = [
  // Sarah Johnson (stylist) - can perform multiple services
  {
    staffId: 'CUe2Ey6HLVZOihk1mN5HSAVItd63', // Sarah Johnson's UID
    serviceId: 'service_haircut_men',
    branchId: 'branch_makati',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    staffId: 'CUe2Ey6HLVZOihk1mN5HSAVItd63',
    serviceId: 'service_haircut_women',
    branchId: 'branch_makati',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    staffId: 'CUe2Ey6HLVZOihk1mN5HSAVItd63',
    serviceId: 'service_coloring',
    branchId: 'branch_makati',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    staffId: 'CUe2Ey6HLVZOihk1mN5HSAVItd63',
    serviceId: 'service_styling',
    branchId: 'branch_makati',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Function to create a user in Firebase Auth and store profile in Firestore
async function createUserWithProfile(userData) {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });

    // Prepare user profile data for Firestore (excluding password)
    const { password, ...profileData } = userData;
    const userProfile = {
      uid: user.uid,
      ...profileData
    };

    // Store user profile in Firestore users collection
    await setDoc(doc(db, 'users', user.uid), userProfile);

    console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    return { uid: user.uid, email: userData.email, role: userData.role };
  } catch (error) {
    console.error(`❌ Error creating user ${userData.email}:`, error);
    throw error;
  }
}

// Main seeding function
export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create branches
    console.log('🏢 Creating branches...');
    for (const branch of sampleBranches) {
      await setDoc(doc(db, 'branches', branch.id), branch);
    }
    console.log(`✅ Created ${sampleBranches.length} branches`);

    // Create services
    console.log('💇 Creating services...');
    for (const service of sampleServices) {
      await setDoc(doc(db, 'services', service.id), service);
    }
    console.log(`✅ Created ${sampleServices.length} services`);

    // Create staff services relationships
    console.log('👥 Creating staff-services relationships...');
    for (const staffService of sampleStaffServices) {
      await addDoc(collection(db, 'staff_services'), staffService);
    }
    console.log(`✅ Created ${sampleStaffServices.length} staff-services relationships`);

    // Create all user types
    const allUsers = [
      ...sampleClientUsers,
      ...sampleStylistUsers,
      ...sampleReceptionistUsers,
      ...sampleBranchManagerUsers,
      ...sampleBranchAdminUsers,
      ...sampleInventoryControllerUsers,
      ...sampleOperationalManagerUsers,
      ...sampleSuperAdminUsers
    ];
    
    console.log('👥 Creating users...');
    const createdUsers = [];

    for (const userData of allUsers) {
      try {
        const result = await createUserWithProfile(userData);
        createdUsers.push(result);
      } catch (error) {
        console.error(`Failed to create user ${userData.email}:`, error);
      }
    }

    console.log(`✅ Created ${createdUsers.length} users`);

    // Display credentials for testing
    console.log('\n🔑 USER CREDENTIALS FOR TESTING:');
    console.log('=====================================');

    const credentialsByRole = {};
    allUsers.forEach(user => {
      if (!credentialsByRole[user.role]) {
        credentialsByRole[user.role] = [];
      }
      credentialsByRole[user.role].push({
        email: user.email,
        password: user.password,
        name: `${user.firstName} ${user.lastName}`
      });
    });
    
    Object.keys(credentialsByRole).forEach(role => {
      console.log(`\n${role.toUpperCase()}:`);
      credentialsByRole[role].forEach(user => {
        console.log(`  📧 ${user.email} | 🔑 ${user.password} | 👤 ${user.name}`);
      });
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    return { success: true, usersCreated: createdUsers.length };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Function to seed only staff services data
export async function seedStaffServicesOnly() {
  try {
    console.log('🌱 Seeding staff services data...');
    
    // Clear existing staff services first
    const staffServicesQuery = query(collection(db, 'staff_services'));
    const staffServicesSnapshot = await getDocs(staffServicesQuery);
    const staffServicesDeletePromises = staffServicesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(staffServicesDeletePromises);
    
    // Add staff services data
    const staffServicesRef = collection(db, 'staff_services');
    for (const staffService of sampleStaffServices) {
      await addDoc(staffServicesRef, staffService);
    }
    
    console.log('✅ Staff services data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding staff services data:', error);
    throw error;
  }
}

// Function to clear all data
export async function clearAllData() {
  try {
    console.log('🧹 Clearing existing data...');
    
    // Clear users collection
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const usersDeletePromises = usersSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(usersDeletePromises);
    
    // Clear branches collection
    const branchesQuery = query(collection(db, 'branches'));
    const branchesSnapshot = await getDocs(branchesQuery);
    const branchesDeletePromises = branchesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(branchesDeletePromises);
    
    // Clear services collection
    const servicesQuery = query(collection(db, 'services'));
    const servicesSnapshot = await getDocs(servicesQuery);
    const servicesDeletePromises = servicesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(servicesDeletePromises);
    
    // Clear staff services collection
    const staffServicesQuery = query(collection(db, 'staff_services'));
    const staffServicesSnapshot = await getDocs(staffServicesQuery);
    const staffServicesDeletePromises = staffServicesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(staffServicesDeletePromises);
    
    // Clear appointments collection
    const appointmentsQuery = query(collection(db, 'appointments'));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointmentsDeletePromises = appointmentsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(appointmentsDeletePromises);
    
    console.log('✅ All data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

// Function to seed only services
export async function seedServicesOnly() {
  try {
    console.log('🌱 Seeding services only...');

    // Optionally clear existing services first
    const servicesQueryRef = query(collection(db, 'services'));
    const servicesSnapshot = await getDocs(servicesQueryRef);
    const deletePromises = servicesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Add services from sampleServices
    for (const service of sampleServices) {
      await setDoc(doc(db, 'services', service.id), service);
    }

    console.log(`✅ Seeded ${sampleServices.length} services successfully`);
    return { success: true, count: sampleServices.length };
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  }
}