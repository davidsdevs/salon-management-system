import React, { useState, useEffect } from 'react';
import SidebarWithHeader from './common/components/BranchManagerSidebarWithHeader.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  UserX,
  DollarSign,
  Target,
  Activity,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { appointmentService } from '../services/appointmentService.js';

const BranchManagerAppointments = () => {
  const { userProfile, branchInfo } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, list, analytics

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0,
    totalRevenue: 0,
    averageAppointmentValue: 0,
    peakHours: [],
    topServices: [],
    stylistPerformance: [],
    customerSatisfaction: 0
  });

  const userInfo = {
    name: userProfile?.firstName || "Branch Manager",
    subtitle: userProfile?.email || "Branch Manager Email",
    badge: "Branch Manager",
    profileImage: userProfile?.profileImage
  };

  useEffect(() => {
    loadAppointments();
  }, [branchInfo?.id]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      if (branchInfo?.id) {
        const appointmentsData = await appointmentService.getAppointmentsByBranch(branchInfo.id);
        setAppointments(appointmentsData);
        calculateAnalytics(appointmentsData);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (appointmentsData) => {
    const total = appointmentsData.length;
    const completed = appointmentsData.filter(apt => apt.status === 'completed').length;
    const cancelled = appointmentsData.filter(apt => apt.status === 'cancelled').length;
    const noShow = appointmentsData.filter(apt => apt.status === 'no-show').length;
    
    // Calculate revenue (assuming each appointment has a price)
    const totalRevenue = appointmentsData
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.servicePrice || 0), 0);
    
    const averageValue = completed > 0 ? totalRevenue / completed : 0;
    
    // Calculate peak hours
    const hourCounts = {};
    appointmentsData.forEach(apt => {
      if (apt.time) {
        const hour = apt.time.split(':')[0];
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }));
    
    // Calculate top services
    const serviceCounts = {};
    appointmentsData.forEach(apt => {
      if (apt.serviceName) {
        serviceCounts[apt.serviceName] = (serviceCounts[apt.serviceName] || 0) + 1;
      }
    });
    
    const topServices = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([service, count]) => ({ service, count }));
    
    // Calculate stylist performance
    const stylistStats = {};
    appointmentsData.forEach(apt => {
      if (apt.stylistName) {
        if (!stylistStats[apt.stylistName]) {
          stylistStats[apt.stylistName] = { total: 0, completed: 0, revenue: 0 };
        }
        stylistStats[apt.stylistName].total++;
        if (apt.status === 'completed') {
          stylistStats[apt.stylistName].completed++;
          stylistStats[apt.stylistName].revenue += (apt.servicePrice || 0);
        }
      }
    });
    
    const stylistPerformance = Object.entries(stylistStats)
      .map(([name, stats]) => ({
        name,
        totalAppointments: stats.total,
        completedAppointments: stats.completed,
        completionRate: (stats.completed / stats.total) * 100,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    setAnalytics({
      totalAppointments: total,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      noShowAppointments: noShow,
      totalRevenue,
      averageAppointmentValue: averageValue,
      peakHours,
      topServices,
      stylistPerformance,
      customerSatisfaction: 4.2 // Mock data
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      appointment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.stylistName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <UserX className="w-4 h-4" />;
      case 'no-show': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalAppointments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{analytics.completedAppointments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-[#160B53]">₱{analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Value</p>
              <p className="text-2xl font-bold text-orange-600">₱{analytics.averageAppointmentValue.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
          <div className="space-y-3">
            {analytics.peakHours.map((peak, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{peak.hour}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#160B53] h-2 rounded-full" 
                      style={{ width: `${(peak.count / Math.max(...analytics.peakHours.map(p => p.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{peak.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h3>
          <div className="space-y-3">
            {analytics.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">{service.service}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(service.count / Math.max(...analytics.topServices.map(s => s.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{service.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stylist Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stylist Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stylist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.stylistPerformance.map((stylist, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stylist.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stylist.totalAppointments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stylist.completedAppointments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${stylist.completionRate}%` }}
                        ></div>
                      </div>
                      {stylist.completionRate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₱{stylist.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAppointmentList = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
            <button className="px-4 py-2 bg-[#160B53] text-white rounded-lg hover:bg-[#160B53]/90 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stylist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#160B53] flex items-center justify-center text-white font-medium text-sm">
                        {appointment.clientName?.charAt(0) || 'C'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.clientName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{appointment.clientPhone || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.serviceName || 'N/A'}</div>
                    <div className="text-sm text-gray-500">₱{appointment.servicePrice || '0'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.stylistName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-gray-500">{appointment.time || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1 capitalize">{appointment.status || 'pending'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-[#160B53] hover:text-[#160B53]/80">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <SidebarWithHeader userInfo={userInfo} pageTitle="Appointments">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#160B53]"></div>
        </div>
      </SidebarWithHeader>
    );
  }

  return (
    <SidebarWithHeader userInfo={userInfo} pageTitle="Appointment Management">
      <div className="space-y-6">
        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'dashboard' 
                  ? 'bg-[#160B53] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[#160B53] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Appointments
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'dashboard' ? renderDashboard() : renderAppointmentList()}
      </div>
    </SidebarWithHeader>
  );
};

export default BranchManagerAppointments;
