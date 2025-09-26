import React, { useState, useEffect } from 'react';
import { seedMakatiStylists, getExistingMakatiStylists } from '../utils/seedMakatiStylists.js';
import { 
  UserPlus, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function SeedStylistsPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [existingStylists, setExistingStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedResults, setSeedResults] = useState(null);

  // Load existing stylists on component mount
  useEffect(() => {
    loadExistingStylists();
  }, []);

  const loadExistingStylists = async () => {
    try {
      setLoading(true);
      const stylists = await getExistingMakatiStylists();
      setExistingStylists(stylists);
    } catch (error) {
      console.error('Error loading existing stylists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedStylists = async () => {
    try {
      setIsSeeding(true);
      setSeedResults(null);
      
      const results = await seedMakatiStylists();
      setSeedResults(results);
      
      // Reload existing stylists to show updated list
      await loadExistingStylists();
      
    } catch (error) {
      console.error('Error seeding stylists:', error);
      setSeedResults({
        success: [],
        errors: [{ email: 'Unknown', error: error.message }],
        skipped: []
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#160B53] rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Seed Makati Stylists</h1>
              <p className="text-gray-600">Add stylists to the Makati branch database</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Note</p>
                <p>This will create stylist accounts in Firebase Auth and Firestore. Make sure you have the necessary permissions and that the Makati branch exists in your database.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Add Stylists</h2>
            <button
              onClick={loadExistingStylists}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleSeedStylists}
              disabled={isSeeding}
              className="flex items-center gap-2 px-6 py-3 bg-[#160B53] text-white rounded-lg hover:bg-[#0f073d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSeeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isSeeding ? 'Adding Stylists...' : 'Add 6 Makati Stylists'}
            </button>
            
            <div className="text-sm text-gray-600">
              <p>This will add 6 stylists with different specialties:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Maria Santos - Women's Hair & Coloring</li>
                <li>James Rodriguez - Men's Hair & Grooming</li>
                <li>Sophia Lim - Bridal & Special Events</li>
                <li>Carlos Mendoza - General Hair Services</li>
                <li>Isabella Tan - Color Specialist</li>
                <li>Antonio Garcia - Senior Stylist</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {seedResults && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Seeding Results</h3>
            
            {/* Success */}
            {seedResults.success.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    Successfully Added ({seedResults.success.length})
                  </span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <ul className="space-y-1">
                    {seedResults.success.map((stylist, index) => (
                      <li key={index} className="text-sm text-green-700">
                        {stylist.name} ({stylist.email}) - {stylist.employeeId}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Skipped */}
            {seedResults.skipped.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Skipped ({seedResults.skipped.length})
                  </span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <ul className="space-y-1">
                    {seedResults.skipped.map((stylist, index) => (
                      <li key={index} className="text-sm text-yellow-700">
                        {stylist.email} - {stylist.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Errors */}
            {seedResults.errors.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">
                    Errors ({seedResults.errors.length})
                  </span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <ul className="space-y-1">
                    {seedResults.errors.map((stylist, index) => (
                      <li key={index} className="text-sm text-red-700">
                        {stylist.email} - {stylist.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing Stylists */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Existing Makati Stylists ({existingStylists.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading stylists...</span>
            </div>
          ) : existingStylists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No stylists found for Makati branch</p>
              <p className="text-sm">Use the "Add 6 Makati Stylists" button above to seed stylists</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingStylists.map((stylist) => (
                <div key={stylist.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{stylist.name}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {stylist.employeeId}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{stylist.email}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {stylist.skills.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                        >
                          {skill.replace('service_', '').replace('_', ' ')}
                        </span>
                      ))}
                      {stylist.skills.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          +{stylist.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
