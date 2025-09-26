// Test script for appointment module functionality
// This can be run in the browser console to test the appointment module

import { 
  appointmentService, 
  serviceService, 
  stylistService, 
  clientService 
} from './services/appointmentService.js';
import { seedDatabase, addSampleAppointments } from './seedData.js';

// Test function to verify appointment module
export const testAppointmentModule = async () => {
  console.log('🧪 Testing Appointment Module...');
  
  try {
    // Test 1: Seed database with sample data
    console.log('📊 Seeding database...');
    const seedResult = await seedDatabase();
    if (seedResult) {
      console.log('✅ Database seeded successfully');
    } else {
      console.log('❌ Database seeding failed');
      return;
    }

    // Test 2: Load services
    console.log('🔧 Testing services...');
    const services = await serviceService.getServices();
    console.log(`✅ Loaded ${services.length} services`);

    // Test 3: Load stylists
    console.log('👨‍💼 Testing stylists...');
    const stylists = await stylistService.getStylists();
    console.log(`✅ Loaded ${stylists.length} stylists`);

    // Test 4: Load clients
    console.log('👥 Testing clients...');
    const clients = await clientService.getClients();
    console.log(`✅ Loaded ${clients.length} clients`);

    // Test 5: Create a test appointment
    console.log('📅 Testing appointment creation...');
    const testAppointment = {
      clientFirstName: "Test",
      clientLastName: "Client",
      clientPhone: "+63 999 123 4567",
      clientEmail: "test@example.com",
      services: [{
        id: services[0]?.id || "service1",
        name: services[0]?.name || "Test Service",
        duration: 60,
        price: 500,
        category: "hair"
      }],
      stylists: [{
        serviceId: services[0]?.id || "service1",
        serviceName: services[0]?.name || "Test Service",
        stylistId: stylists[0]?.id || "stylist1",
        stylistName: stylists[0]?.name || "Test Stylist"
      }],
      date: new Date().toISOString().split('T')[0],
      time: "10:00",
      totalCost: 500,
      status: "pending",
      notes: "Test appointment",
      branchId: "branch1",
      createdBy: "test-user"
    };

    const createdAppointment = await appointmentService.createAppointment(testAppointment);
    console.log('✅ Test appointment created:', createdAppointment.id);

    // Test 6: Load appointments
    console.log('📋 Testing appointment loading...');
    const appointments = await appointmentService.getAppointmentsByBranch("branch1");
    console.log(`✅ Loaded ${appointments.length} appointments`);

    // Test 7: Update appointment status
    console.log('🔄 Testing appointment status update...');
    await appointmentService.updateAppointmentStatus(createdAppointment.id, "confirmed");
    console.log('✅ Appointment status updated to confirmed');

    // Test 8: Delete test appointment
    console.log('🗑️ Testing appointment deletion...');
    await appointmentService.deleteAppointment(createdAppointment.id);
    console.log('✅ Test appointment deleted');

    console.log('🎉 All tests passed! Appointment module is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Function to add sample appointments for testing
export const addTestAppointments = async () => {
  console.log('📅 Adding sample appointments...');
  try {
    await addSampleAppointments();
    console.log('✅ Sample appointments added successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to add sample appointments:', error);
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testAppointmentModule = testAppointmentModule;
  window.addTestAppointments = addTestAppointments;
  window.seedDatabase = seedDatabase;
}
