import React, { useState } from 'react';
import { appointmentService, serviceService, stylistService, clientService } from './services/appointmentService.js';
import { seedDatabase, clearAllData } from './seedData.js';

export default function TestAppointmentModule() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('🧪 Starting Appointment Module Tests...', true);
      
      // Test 1: Seed database
      addResult('📊 Seeding database with sample data...', true);
      const seedResult = await seedDatabase();
      if (seedResult) {
        addResult('✅ Database seeded successfully', true);
      } else {
        addResult('❌ Database seeding failed', false);
        return;
      }

      // Test 2: Load services
      addResult('🔧 Testing services loading...', true);
      const services = await serviceService.getServices();
      addResult(`✅ Loaded ${services.length} services`, true);

      // Test 3: Load stylists
      addResult('👨‍💼 Testing stylists loading...', true);
      const stylists = await stylistService.getStylists();
      addResult(`✅ Loaded ${stylists.length} stylists`, true);

      // Test 4: Load clients
      addResult('👥 Testing clients loading...', true);
      const clients = await clientService.getClients();
      addResult(`✅ Loaded ${clients.length} clients`, true);

      // Test 5: Create a test appointment
      addResult('📅 Testing appointment creation...', true);
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
      addResult(`✅ Test appointment created with ID: ${createdAppointment.id}`, true);

      // Test 6: Load appointments
      addResult('📋 Testing appointment loading...', true);
      const appointments = await appointmentService.getAppointmentsByBranch("branch1");
      addResult(`✅ Loaded ${appointments.length} appointments`, true);

      // Test 7: Update appointment status
      addResult('🔄 Testing appointment status update...', true);
      await appointmentService.updateAppointmentStatus(createdAppointment.id, "confirmed");
      addResult('✅ Appointment status updated to confirmed', true);

      // Test 8: Delete test appointment
      addResult('🗑️ Testing appointment deletion...', true);
      await appointmentService.deleteAppointment(createdAppointment.id);
      addResult('✅ Test appointment deleted', true);

      addResult('🎉 All tests passed! Appointment module is working correctly.', true);
      
    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, false);
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = async () => {
    setLoading(true);
    try {
      addResult('📅 Adding sample appointments...', true);
      
      // Create a sample appointment
      const sampleAppointment = {
        clientFirstName: 'Test',
        clientLastName: 'Client',
        clientPhone: '+63 917 999 9999',
        clientEmail: 'test.client@email.com',
        clientId: null,
        isNewClient: true,
        registerAsUser: false,
        services: [
          {
            id: 'service_haircut_men',
            name: 'Men\'s Haircut',
            duration: 45,
            price: 350,
            category: 'haircut'
          }
        ],
        stylists: [
          {
            serviceId: 'service_haircut_men',
            serviceName: 'Men\'s Haircut',
            stylistId: 'stylist_makati_1',
            stylistName: 'Sarah Johnson'
          }
        ],
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        totalCost: 350,
        notes: 'Test appointment',
        status: 'pending',
        branchId: 'branch_makati',
        createdBy: 'test-user',
        createdAt: new Date()
      };
      
      await appointmentService.createAppointment(sampleAppointment);
      addResult('✅ Sample appointment added successfully', true);
    } catch (error) {
      addResult(`❌ Failed to add sample appointment: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Appointment Module Test</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={runTests}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>
          <button
            onClick={addSampleData}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Add Sample Data
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  result.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={result.success ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                  </span>
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
