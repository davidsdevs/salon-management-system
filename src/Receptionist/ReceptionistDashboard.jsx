import React, { useState, useEffect } from "react";
import SidebarWithHeader from "./common/components/ReceptionistSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { 
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Plus,
  Eye
} from "lucide-react";
import { appointmentService } from "../services/appointmentService.js";

export default function ReceptionistDashboard() {
  const { userProfile, branchInfo } = useAuth();
const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    totalClients: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = {
    name: userProfile?.firstName || "Receptionist",
    subtitle: userProfile?.email || "Receptionist Email",
    badge: "Receptionist",
    profileImage: userProfile?.profileImage || "./placeholder.svg"
  };

  useEffect(() => {
    if (!branchInfo?.id) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Load today's appointments
        const todayAppts = await appointmentService.getAppointmentsByBranch(branchInfo.id, {
          date: today
        });
        
        // Load pending appointments
        const pendingAppts = await appointmentService.getAppointmentsByBranch(branchInfo.id, {
          status: 'pending'
        });

        setTodayAppointments(todayAppts.slice(0, 5)); // Show first 5 appointments
        
        setStats({
          todayAppointments: todayAppts.length,
          pendingAppointments: pendingAppts.length,
          completedToday: todayAppts.filter(apt => apt.status === 'completed').length,
          totalClients: 0 // This would need to be loaded from clients collection
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [branchInfo?.id]);



  return (
    <SidebarWithHeader
      userInfo={userInfo}
      pageTitle="Receptionist Dashboard"
    >
      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome back, {userInfo.name}!
              </h2>
              <p className="text-gray-600">
                Here's what's happening with your salon appointments today.
              </p>
            </div>
            <div className="text-4xl text-[#160B53]">
              <i className="ri-user-heart-line"></i>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate("/receptionist-appointments")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all appointments →
              </button>
            </div>
          </div>

          {/* Pending Confirmations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Confirmations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-yellow-600 font-medium">
                Needs attention
              </span>
            </div>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                Great job!
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quick Actions</p>
                <p className="text-sm text-gray-500">Manage appointments</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => navigate("/receptionist-appointments/new")}
                className="w-full text-sm bg-[#160B53] text-white px-3 py-2 rounded-lg hover:bg-[#0f073d] transition-colors"
              >
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#160B53] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-900 w-20">
                      {appointment.time}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {`${appointment.clientFirstName || ''} ${appointment.clientLastName || ''}`.trim()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.services?.map(s => s.name).join(', ') || 'No services'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status === 'confirmed' || appointment.status === 'completed' ? 
                        <CheckCircle className="w-3 h-3" /> : 
                        <Clock className="w-3 h-3" />
                      }
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <button
                      onClick={() => navigate("/receptionist-appointments")}
                      className="text-[#160B53] hover:text-[#0f073d]"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No appointments scheduled for today</p>
              <button
                onClick={() => navigate("/receptionist-appointments/new")}
                className="mt-2 text-sm text-[#160B53] hover:text-[#0f073d] font-medium"
              >
                Book first appointment
              </button>
            </div>
          )}
        </div> 
      </div>
       
    </SidebarWithHeader>
  );
}
