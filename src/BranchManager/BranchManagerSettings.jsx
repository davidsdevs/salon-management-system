import React, { useState, useEffect } from 'react';
import SidebarWithHeader from './common/components/BranchManagerSidebarWithHeader.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Clock, 
  Settings, 
  Save, 
  X, 
  Info,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Plus,
  Edit,
  Trash2,
  Scissors,
  DollarSign,
  Users,
  Archive,
  ArchiveRestore,
  Tag
} from 'lucide-react';
import { branchService } from '../services/appointmentService.js';

const BranchManagerSettings = () => {
  const { userProfile, branchInfo, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('general'); // general, services, staff
  const [operatingHours, setOperatingHours] = useState({});
  const [editingHours, setEditingHours] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [archivedServices, setArchivedServices] = useState([]);
  const [showArchivedServices, setShowArchivedServices] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'hair',
    imageURL: ''
  });

  const userInfo = {
    name: userProfile?.firstName || "Branch Manager",
    subtitle: userProfile?.email || "Branch Manager Email",
    badge: "Branch Manager",
    profileImage: userProfile?.profileImage
  };

  // Load operating hours and services when component mounts
  useEffect(() => {
    if (branchInfo?.id) {
      loadOperatingHours();
      loadServices();
    }
  }, [branchInfo?.id]);

  const loadOperatingHours = async () => {
    try {
      if (branchInfo?.id) {
        console.log('🔍 Loading operating hours from database for branch:', branchInfo.id);
        
        // Load fresh branch info from database
        const freshBranchInfo = await branchService.getBranchInfo(branchInfo.id);
        
        // Default hours if none set
        const defaultHours = {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '9:00 AM - 5:00 PM',
          sunday: '10:00 AM - 4:00 PM'
        };
        
        const hours = freshBranchInfo.operatingHours || defaultHours;
        console.log('📅 Loaded operating hours:', hours);
        setOperatingHours(hours);
      }
    } catch (error) {
      console.error('❌ Error loading operating hours:', error);
      // Fallback to default hours if database load fails
      const defaultHours = {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: '10:00 AM - 4:00 PM'
      };
      setOperatingHours(defaultHours);
    }
  };

  const saveOperatingHours = async () => {
    try {
      setIsSaving(true);
      if (branchInfo?.id) {
        console.log('💾 Saving operating hours to database:', operatingHours);
        
        // Update operating hours in database
        await branchService.updateOperatingHours(branchInfo.id, operatingHours);
        
        // Update local branchInfo in context (this would ideally be done through context)
        // For now, we'll just show success message
        console.log('✅ Operating hours saved to database successfully');
        
        setEditingHours(false);
        alert('Operating hours saved successfully! The changes will be reflected in the receptionist booking system.');
      }
    } catch (error) {
      console.error('❌ Error saving operating hours:', error);
      alert(`Error saving operating hours: ${error.message}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHoursChange = (day, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: value
    }));
  };

  const setDayClosed = (day) => {
    handleHoursChange(day, 'Closed');
  };

  // Service Management Functions
  const loadServices = async () => {
    try {
      if (branchInfo?.id) {
        console.log('🔍 Loading services for branch:', branchInfo.id);
        const branchServices = await branchService.getServicesByBranch(branchInfo.id);
        setServices(branchServices);
        console.log('📋 Loaded services:', branchServices.length);
        
        // Also load archived services
        const archivedBranchServices = await branchService.getArchivedServicesByBranch(branchInfo.id);
        setArchivedServices(archivedBranchServices);
        console.log('📦 Loaded archived services:', archivedBranchServices.length);
      }
    } catch (error) {
      console.error('❌ Error loading services:', error);
    }
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddService = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: 'hair',
      imageURL: ''
    });
    setShowServiceForm(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price?.toString() || '',
      duration: service.duration?.toString() || '',
      category: service.category || 'hair',
      imageURL: service.imageURL || ''
    });
    setShowServiceForm(true);
  };

  const handleSaveService = async () => {
    // Prevent multiple submissions
    if (isSavingService) return;
    
    try {
      if (!serviceForm.name.trim() || !serviceForm.price.trim()) {
        alert('Please fill in service name and price');
        return;
      }

      setIsSavingService(true);

      const serviceData = {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim(),
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration) || 60, // Default 60 minutes
        category: serviceForm.category,
        imageURL: serviceForm.imageURL.trim()
      };

      if (editingService) {
        // Update existing service
        await branchService.updateBranchService(editingService.id, serviceData);
        console.log('✅ Service updated successfully');
      } else {
        // Create new service
        await branchService.createBranchService(branchInfo.id, serviceData);
        console.log('✅ Service created successfully');
      }

      // Refresh services list
      await loadServices();
      setShowServiceForm(false);
      setEditingService(null);
      alert(`Service ${editingService ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('❌ Error saving service:', error);
      alert(`Error saving service: ${error.message}`);
    } finally {
      setIsSavingService(false);
    }
  };

  const handleArchiveService = async (serviceId, serviceName) => {
    if (window.confirm(`Are you sure you want to archive "${serviceName}"? This will hide it from active services but preserve it for existing appointments.`)) {
      try {
        await branchService.archiveBranchService(serviceId);
        console.log('✅ Service archived successfully');
        await loadServices();
        alert('Service archived successfully! It has been hidden from active services but preserved for existing appointments.');
      } catch (error) {
        console.error('❌ Error archiving service:', error);
        alert(`Error archiving service: ${error.message}`);
      }
    }
  };

  const handleUnarchiveService = async (serviceId, serviceName) => {
    if (window.confirm(`Are you sure you want to restore "${serviceName}"? This will make it available for new appointments.`)) {
      try {
        await branchService.unarchiveBranchService(serviceId);
        console.log('✅ Service unarchived successfully');
        await loadServices();
        alert('Service restored successfully! It is now available for new appointments.');
      } catch (error) {
        console.error('❌ Error unarchiving service:', error);
        alert(`Error restoring service: ${error.message}`);
      }
    }
  };

  // Render General Settings Tab
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Branch Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Building className="w-6 h-6 text-[#160B53]" />
          <h2 className="text-lg font-semibold text-gray-900">Branch Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{branchInfo?.name || 'Branch Name'}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{branchInfo?.address || 'Branch Address'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{branchInfo?.phone || 'Branch Phone'}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{branchInfo?.email || 'Branch Email'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operating Hours Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-[#160B53]" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
              <p className="text-sm text-gray-600">Configure when your branch is open</p>
            </div>
          </div>
          <button
            onClick={() => setEditingHours(!editingHours)}
            disabled={isSaving}
            className="px-4 py-2 bg-[#160B53] text-white rounded-lg hover:bg-[#160B53]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingHours ? 'Cancel' : 'Edit Hours'}
          </button>
        </div>

        {editingHours ? (
          // Edit Mode
          <div className="space-y-4">
            {Object.entries(operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-900 capitalize">
                  {day}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53] focus:border-transparent"
                    placeholder="9:00 AM - 6:00 PM"
                  />
                  <button
                    onClick={() => setDayClosed(day)}
                    className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Closed
                  </button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditingHours(false)}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveOperatingHours}
                disabled={isSaving}
                className="px-4 py-2 bg-[#160B53] text-white rounded-lg hover:bg-[#160B53]/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Display Mode
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(operatingHours).map(([day, hours]) => {
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;
              const isClosed = hours.toLowerCase().includes('closed') || hours.toLowerCase().includes('off');
              
              return (
                <div
                  key={day}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    isToday 
                      ? 'bg-[#160B53]/5 border-[#160B53] border-2' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${
                      isToday ? 'text-[#160B53]' : 'text-gray-900'
                    }`}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </h4>
                    {isToday && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">Today</span>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isClosed 
                      ? 'text-red-600' 
                      : isToday 
                        ? 'text-[#160B53] font-medium' 
                        : 'text-gray-600'
                  }`}>
                    {isClosed ? 'Closed' : hours}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Operating Hours Configuration</h4>
            <p className="text-sm text-blue-700 mt-1">
              These hours will be displayed to clients when they book appointments through the receptionist. 
              Use the format "9:00 AM - 6:00 PM" or "Closed" for days when the branch is not open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Services Management Tab
  const renderServicesManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Scissors className="w-6 h-6 text-[#160B53]" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Services Management</h2>
              <p className="text-sm text-gray-600">Manage the services offered by your branch</p>
            </div>
          </div>
          <button
            onClick={handleAddService}
            className="px-4 py-2 bg-[#160B53] text-white rounded-lg hover:bg-[#160B53]/90 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-2">
                      {/* Service Image */}
                      {service.imageURL ? (
                        <div className="flex-shrink-0">
                          <img
                            src={service.imageURL}
                            alt={service.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <Scissors className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                      
                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                        {service.category}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>₱{service.price?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration || 60} minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="p-2 text-gray-600 hover:text-[#160B53] hover:bg-[#160B53]/5 rounded-lg transition-colors"
                      title="Edit service"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchiveService(service.id, service.name)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Archive service"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
              <p className="text-gray-500 mb-4">Add your first service to get started</p>
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-[#160B53] text-white rounded-lg hover:bg-[#160B53]/90 transition-colors"
              >
                Add Service
              </button>
            </div>
          )}
        </div>

        {/* Archived Services Section */}
        {archivedServices.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Archive className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="text-md font-semibold text-gray-700">Archived Services</h3>
                  <p className="text-sm text-gray-500">Services that have been archived but preserved for existing appointments</p>
                </div>
              </div>
              <button
                onClick={() => setShowArchivedServices(!showArchivedServices)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-[#160B53] hover:bg-gray-50 rounded-lg transition-colors"
              >
                {showArchivedServices ? 'Hide' : 'Show'} ({archivedServices.length})
              </button>
            </div>

            {showArchivedServices && (
              <div className="space-y-3">
                {archivedServices.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4 mb-2">
                          {/* Service Image */}
                          {service.imageURL ? (
                            <div className="flex-shrink-0">
                              <img
                                src={service.imageURL}
                                alt={service.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                <Scissors className="w-6 h-6 text-gray-400" />
                              </div>
                            </div>
                          )}
                          
                          {/* Service Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="text-sm font-medium text-gray-900">{service.name}</span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Archived
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4" />
                                <span>₱{service.price?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{service.duration} min</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Tag className="w-4 h-4" />
                                <span className="capitalize">{service.category}</span>
                              </div>
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUnarchiveService(service.id, service.name)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Restore service"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render Staff Management Tab
  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-6 h-6 text-[#160B53]" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Staff Management</h2>
            <p className="text-sm text-gray-600">Manage your branch staff and stylists</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Management</h3>
          <p className="text-gray-500 mb-4">Staff management functionality will be available here</p>
          <p className="text-sm text-gray-400">This feature is coming soon...</p>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarWithHeader userInfo={userInfo}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Branch Settings</h1>
            <p className="text-gray-600">Manage your branch configuration and services</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'general'
                    ? 'border-[#160B53] text-[#160B53]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>General Settings</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'services'
                    ? 'border-[#160B53] text-[#160B53]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Scissors className="w-4 h-4" />
                  <span>Services Management</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'staff'
                    ? 'border-[#160B53] text-[#160B53]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Staff Management</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'services' && renderServicesManagement()}
        {activeTab === 'staff' && renderStaffManagement()}

        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button
                  onClick={() => setShowServiceForm(false)}
                  disabled={isSavingService}
                  className={`transition-colors ${
                    isSavingService 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={serviceForm.name}
                    onChange={handleServiceFormChange}
                    disabled={isSavingService}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53] focus:border-transparent ${
                      isSavingService ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g., Haircut, Hair Color, Facial"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={serviceForm.description}
                    onChange={handleServiceFormChange}
                    disabled={isSavingService}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53] focus:border-transparent ${
                      isSavingService ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Brief description of the service"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱) *</label>
                    <input
                      type="number"
                      name="price"
                      value={serviceForm.price}
                      onChange={handleServiceFormChange}
                      disabled={isSavingService}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53] focus:border-transparent ${
                        isSavingService ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      value={serviceForm.duration}
                      onChange={handleServiceFormChange}
                      disabled={isSavingService}
                      min="15"
                      step="15"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53] focus:border-transparent ${
                        isSavingService ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={serviceForm.category}
                    onChange={handleServiceFormChange}
                    disabled={isSavingService}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53] focus:border-transparent ${
                      isSavingService ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="hair">Hair</option>
                    <option value="facial">Facial</option>
                    <option value="nail">Nail</option>
                    <option value="massage">Massage</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Image URL</label>
                  <input
                    type="url"
                    name="imageURL"
                    value={serviceForm.imageURL}
                    onChange={handleServiceFormChange}
                    disabled={isSavingService}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53] focus:border-transparent ${
                      isSavingService ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="https://example.com/service-image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Add an image URL to showcase this service
                  </p>
                  
                  {/* Image Preview */}
                  {serviceForm.imageURL && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Image Preview:</p>
                      <div className="relative">
                        <img
                          src={serviceForm.imageURL}
                          alt="Service preview"
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500" style={{display: 'none'}}>
                          Invalid URL
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowServiceForm(false)}
                    disabled={isSavingService}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isSavingService 
                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveService}
                    disabled={isSavingService}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      isSavingService 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-[#160B53] text-white hover:bg-[#160B53]/90'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isSavingService 
                        ? (editingService ? 'Updating...' : 'Adding...') 
                        : (editingService ? 'Update Service' : 'Add Service')
                      }
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarWithHeader>
  );
};

export default BranchManagerSettings;
