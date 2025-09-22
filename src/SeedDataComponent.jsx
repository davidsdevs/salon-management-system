import React, { useState } from 'react';
import { seedDatabase, clearAllData, seedStaffServicesOnly, seedServicesOnly } from './seedData';
import { CheckCircle, AlertTriangle, Loader, Database, Trash2, Users } from 'lucide-react';

export default function SeedDataComponent() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingStaffServices, setIsSeedingStaffServices] = useState(false);
  const [isSeedingServices, setIsSeedingServices] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const handleSeedData = async () => {
    setIsSeeding(true);
    setMessage('Seeding sample data...');
    setMessageType('info');
    
    try {
      await seedDatabase();
      setMessage('✅ Sample data seeded successfully! You can now test the appointment module.');
      setMessageType('success');
    } catch (error) {
      setMessage(`❌ Error seeding data: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedStaffServices = async () => {
    setIsSeedingStaffServices(true);
    setMessage('Seeding staff services data...');
    setMessageType('info');
    
    try {
      await seedStaffServicesOnly();
      setMessage('✅ Staff services data seeded successfully! Sarah Johnson can now perform her assigned services.');
      setMessageType('success');
    } catch (error) {
      setMessage(`❌ Error seeding staff services: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSeedingStaffServices(false);
    }
  };

  const handleSeedServices = async () => {
    setIsSeedingServices(true);
    setMessage('Seeding services only...');
    setMessageType('info');
    try {
      await seedServicesOnly();
      setMessage('✅ Services seeded successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage(`❌ Error seeding services: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSeedingServices(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }
    
    setIsClearing(true);
    setMessage('Clearing all data...');
    setMessageType('info');
    
    try {
      await clearAllData();
      setMessage('✅ All data cleared successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage(`❌ Error clearing data: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-8">
            <Database className="w-16 h-16 text-[#160B53] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              David's Salon - Sample Data Manager
            </h1>
            <p className="text-gray-600">
              Seed sample data to test the appointment module functionality
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : messageType === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Seed Sample Data</h3>
              <p className="text-gray-600 mb-4">
                Add sample branches, receptionists, stylists, services, and clients for testing.
              </p>
              <button
                onClick={handleSeedData}
                disabled={isSeeding || isSeedingStaffServices || isClearing}
                className="w-full bg-[#160B53] text-white px-4 py-3 rounded-lg hover:bg-[#0f073d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSeeding ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Database className="w-5 h-5" />
                )}
                {isSeeding ? 'Seeding Data...' : 'Seed Sample Data'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Seed Staff Services</h3>
              <p className="text-gray-600 mb-4">
                Add staff-service relationships for Sarah Johnson (4 services: Men's Haircut, Women's Haircut, Hair Coloring, Hair Styling).
              </p>
              <button
                onClick={handleSeedStaffServices}
                disabled={isSeedingStaffServices || isSeeding || isClearing}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSeedingStaffServices ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
                {isSeedingStaffServices ? 'Seeding Staff Services...' : 'Seed Staff Services'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Seed Services Only</h3>
              <p className="text-gray-600 mb-4">
                Create the services catalog without users or relationships.
              </p>
              <button
                onClick={handleSeedServices}
                disabled={isSeedingServices || isSeeding || isSeedingStaffServices || isClearing}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSeedingServices ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Database className="w-5 h-5" />
                )}
                {isSeedingServices ? 'Seeding Services...' : 'Seed Services Only'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clear All Data</h3>
              <p className="text-gray-600 mb-4">
                Remove all sample data from the database. Use with caution!
              </p>
              <button
                onClick={handleClearData}
                disabled={isSeeding || isSeedingStaffServices || isClearing}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isClearing ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                {isClearing ? 'Clearing Data...' : 'Clear All Data'}
              </button>
            </div>
          </div>

          {/* Sample Data Information */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Sample Data Includes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Branches (3)</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• David's Salon - Makati</li>
                  <li>• David's Salon - SM North</li>
                  <li>• David's Salon - BGC</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Receptionists (3)</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Maria Santos (Makati)</li>
                  <li>• Ana Cruz (SM North)</li>
                  <li>• Lisa Garcia (BGC)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Stylists (7)</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Sarah Johnson, Michael Chen, Jennifer Lee (Makati)</li>
                  <li>• David Rodriguez, Maria Gonzalez (SM North)</li>
                  <li>• Alex Thompson, Sophie Martinez (BGC)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Services (12)</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Haircuts, Coloring, Styling</li>
                  <li>• Highlights, Balayage, Perm</li>
                  <li>• Beard/Mustache Services</li>
                  <li>• Hair Treatments</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Credentials Table */}
          <div className="mt-8 bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">All Test Credentials</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">CLIENT</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Maria Santos</td>
                    <td className="px-4 py-3 text-sm text-gray-700">client1@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">CLIENT</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Juan Cruz</td>
                    <td className="px-4 py-3 text-sm text-gray-700">client2@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">CLIENT</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Ana Reyes</td>
                    <td className="px-4 py-3 text-sm text-gray-700">client3@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">STYLIST</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Sarah Johnson</td>
                    <td className="px-4 py-3 text-sm text-gray-700">stylist1@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">STYLIST</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Michael Chen</td>
                    <td className="px-4 py-3 text-sm text-gray-700">stylist2@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">RECEPTIONIST</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Lisa Garcia</td>
                    <td className="px-4 py-3 text-sm text-gray-700">receptionist1@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">RECEPTIONIST</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Carlos Rodriguez</td>
                    <td className="px-4 py-3 text-sm text-gray-700">receptionist2@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">BRANCH MANAGER</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Roberto Silva</td>
                    <td className="px-4 py-3 text-sm text-gray-700">manager1@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">BRANCH MANAGER</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Elena Martinez</td>
                    <td className="px-4 py-3 text-sm text-gray-700">manager2@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">BRANCH ADMIN</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Patricia Lopez</td>
                    <td className="px-4 py-3 text-sm text-gray-700">branchadmin1@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">INVENTORY CONTROLLER</td>
                    <td className="px-4 py-3 text-sm text-gray-700">David Kim</td>
                    <td className="px-4 py-3 text-sm text-gray-700">inventory1@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">OPERATIONAL MANAGER</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Jennifer Wong</td>
                    <td className="px-4 py-3 text-sm text-gray-700">opsmanager1@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">SUPER ADMIN</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Alexander Thompson</td>
                    <td className="px-4 py-3 text-sm text-gray-700">superadmin@test.com</td>
                    <td className="px-4 py-3 text-sm text-gray-700">password123</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* New User Structure Information */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 New User Structure</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>✅ All users are now stored in a single <code>users</code> collection</strong></p>
              <p>• <strong>Core fields:</strong> uid, email, firstName, lastName, phoneNumber, birthDate, gender, profileImage, emailVerified</p>
              <p>• <strong>Account metadata:</strong> role, status, createdAt, updatedAt</p>
              <p>• <strong>Client-specific data:</strong> clientData object with category, loyaltyPoints, referralCode, preferences</p>
              <p>• <strong>Staff-specific data:</strong> staffData object with branchId, employeeId, hireDate, salary, skills</p>
              <p>• <strong>Role-based access:</strong> Single collection with role field for permissions</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">How to Test</h3>
            <ol className="text-yellow-800 space-y-2 text-sm">
              <li>1. Click "Seed Sample Data" to add all sample data</li>
              <li>2. <strong>Test Receptionist Features:</strong> Login with receptionist credentials</li>
              <li>3. Navigate to "New Appointment" to test the booking process</li>
              <li>4. Try searching for existing clients (John Doe, Jane Smith, etc.)</li>
              <li>5. Test creating new clients with duplicate email/phone validation</li>
              <li>6. Book appointments with different services and stylists</li>
              <li>7. <strong>Test Client Features:</strong> Login with client credentials</li>
              <li>8. Test client dashboard, appointment booking, and profile management</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
