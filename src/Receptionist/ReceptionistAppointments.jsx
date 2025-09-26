import React, { useState, useEffect } from "react";
import SidebarWithHeader from "./common/components/ReceptionistSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Printer
} from "lucide-react";
import { appointmentService } from "../services/appointmentService.js";

export default function ReceptionistAppointments() {
  const { userProfile, branchInfo } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  const [bulkPrintFilters, setBulkPrintFilters] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    status: 'all',
    includeClientDetails: true,
    includeServices: true,
    includeStylists: true
  });

  const userInfo = {
    name: userProfile?.firstName || "Receptionist",
    subtitle: userProfile?.email || "Receptionist Email",
    badge: "Receptionist",
    profileImage: userProfile?.profileImage || "./placeholder.svg"
  };

  // Set up real-time listener for appointments
  useEffect(() => {
    if (!branchInfo?.id) return;

    const filters = {
      status: statusFilter,
      date: dateFilter
    };

    const unsubscribe = appointmentService.subscribeToAppointments(
      branchInfo.id, 
      (appointmentsData) => {
        setAppointments(appointmentsData);
      setLoading(false);
      },
      filters
    );

    return () => unsubscribe();
  }, [branchInfo?.id, statusFilter, dateFilter]);

  const filteredAppointments = appointments.filter(appointment => {
    const clientName = `${appointment.clientFirstName || ''} ${appointment.clientLastName || ''}`.trim();
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (appointment.clientPhone || '').includes(searchTerm) ||
                         (appointment.services && appointment.services.some(service => 
                           service.name?.toLowerCase().includes(searchTerm.toLowerCase())
                         )) ||
                         (appointment.stylists && appointment.stylists.some(stylist => 
                           stylist.stylistName?.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesDate = appointment.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      // The real-time listener will update the UI automatically
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Show error message to user
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleEditAppointment = (appointment) => {
    // TODO: Implement edit functionality
    console.log("Edit appointment:", appointment);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await appointmentService.deleteAppointment(appointmentId);
        // The real-time listener will update the UI automatically
      } catch (error) {
        console.error('Error deleting appointment:', error);
        // Show error message to user
      }
    }
  };

  const handlePrintAppointment = (appointment) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Generate the HTML content for the report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Appointment Report - David's Salon</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #160B53;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .salon-name {
            font-size: 28px;
            font-weight: 600;
            color: #160B53;
            margin: 0;
          }
          .report-title {
            font-size: 18px;
            color: #666;
            margin: 10px 0 0 0;
          }
          .appointment-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #160B53;
            min-width: 120px;
          }
          .detail-value {
            flex: 1;
            text-align: right;
          }
          .services-section {
            margin-top: 20px;
          }
          .service-item {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .service-name {
            font-weight: 600;
            color: #333;
          }
          .service-details {
            color: #666;
            font-size: 14px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-confirmed { background: #d1f2eb; color: #00b894; }
          .status-pending { background: #fff3cd; color: #f39c12; }
          .status-completed { background: #cce7ff; color: #0984e3; }
          .status-cancelled { background: #ffd6d6; color: #e74c3c; }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e9ecef;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .header { margin-bottom: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="salon-name">David's Salon</h1>
          <p class="report-title">Appointment Report</p>
        </div>

        <div class="appointment-details">
          <div class="detail-row">
            <span class="detail-label">Appointment ID:</span>
            <span class="detail-value">#${appointment.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time:</span>
            <span class="detail-value">${appointment.date} at ${appointment.time}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
              <span class="status-badge status-${appointment.status}">${appointment.status}</span>
            </span>
          </div>
        </div>

        <div class="appointment-details">
          <h3 style="margin-top: 0; color: #160B53;">Client Information</h3>
          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${appointment.clientFirstName || ''} ${appointment.clientLastName || ''}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${appointment.clientPhone || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${appointment.clientEmail || 'N/A'}</span>
          </div>
        </div>

        <div class="services-section">
          <h3 style="color: #160B53; margin-bottom: 15px;">Services & Stylists</h3>
          ${appointment.services?.map((service, index) => {
            const stylist = appointment.stylists?.[index];
            return `
              <div class="service-item">
                <div>
                  <div class="service-name">${service.name}</div>
                  <div class="service-details">
                    Duration: ${service.duration} min • Price: ₱${service.price}
                    ${stylist ? `<br>Stylist: ${stylist.stylistName}` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('') || '<p>No services assigned</p>'}
        </div>

        ${appointment.notes ? `
          <div class="appointment-details">
            <h3 style="margin-top: 0; color: #160B53;">Notes</h3>
            <p style="margin: 0; font-style: italic;">${appointment.notes}</p>
          </div>
        ` : ''}

        <div class="appointment-details">
          <div class="detail-row">
            <span class="detail-label">Total Cost:</span>
            <span class="detail-value" style="font-size: 18px; font-weight: 600; color: #160B53;">
              ₱${appointment.totalCost || 0}
            </span>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>David's Salon - ${branchInfo?.name || 'Branch Name'}</p>
        </div>
      </body>
      </html>
    `;

    // Write the HTML content to the new window
    printWindow.document.write(reportHTML);
    printWindow.document.close();

    // Wait for the content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  const handleBulkPrint = () => {
    // Filter appointments based on bulk print filters
    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const fromDate = new Date(bulkPrintFilters.dateFrom);
      const toDate = new Date(bulkPrintFilters.dateTo);
      
      const matchesDateRange = appointmentDate >= fromDate && appointmentDate <= toDate;
      const matchesStatus = bulkPrintFilters.status === 'all' || appointment.status === bulkPrintFilters.status;
      
      return matchesDateRange && matchesStatus;
    });

    if (filteredAppointments.length === 0) {
      alert('No appointments found for the selected criteria.');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    
    // Generate the HTML content for the bulk report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Appointments Report - David's Salon</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
            font-size: 14px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #160B53;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .salon-name {
            font-size: 32px;
            font-weight: 600;
            color: #160B53;
            margin: 0;
          }
          .report-title {
            font-size: 20px;
            color: #666;
            margin: 10px 0 0 0;
          }
          .report-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
          }
          .info-item {
            text-align: center;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            font-size: 18px;
            font-weight: 600;
            color: #160B53;
            margin-top: 5px;
          }
          .appointments-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .appointments-table th {
            background: #160B53;
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .appointments-table td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
          }
          .appointments-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          .appointments-table tr:hover {
            background: #e3f2fd;
          }
          .client-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }
          .client-contact {
            font-size: 12px;
            color: #666;
          }
          .service-list {
            font-size: 13px;
            line-height: 1.4;
          }
          .service-item {
            margin-bottom: 4px;
            padding: 2px 0;
          }
          .stylist-list {
            font-size: 13px;
            color: #666;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-confirmed { background: #d1f2eb; color: #00b894; }
          .status-pending { background: #fff3cd; color: #f39c12; }
          .status-completed { background: #cce7ff; color: #0984e3; }
          .status-cancelled { background: #ffd6d6; color: #e74c3c; }
          .summary-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
          }
          .summary-title {
            font-size: 18px;
            font-weight: 600;
            color: #160B53;
            margin-bottom: 15px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          .summary-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e9ecef;
          }
          .summary-number {
            font-size: 24px;
            font-weight: 600;
            color: #160B53;
            margin-bottom: 5px;
          }
          .summary-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e9ecef;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .header { margin-bottom: 20px; }
            .appointments-table { font-size: 12px; }
            .appointments-table th, .appointments-table td { padding: 8px 6px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="salon-name">David's Salon</h1>
          <p class="report-title">Appointments Report</p>
        </div>

        <div class="report-info">
          <div class="info-item">
            <div class="info-label">Report Period</div>
            <div class="info-value">${bulkPrintFilters.dateFrom} to ${bulkPrintFilters.dateTo}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Total Appointments</div>
            <div class="info-value">${filteredAppointments.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status Filter</div>
            <div class="info-value">${bulkPrintFilters.status === 'all' ? 'All Status' : bulkPrintFilters.status}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Branch</div>
            <div class="info-value">${branchInfo?.name || 'Branch Name'}</div>
          </div>
        </div>

        <table class="appointments-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Date & Time</th>
              <th>Services</th>
              ${bulkPrintFilters.includeStylists ? '<th>Stylists</th>' : ''}
              <th>Status</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAppointments.map(appointment => `
              <tr>
                <td>
                  <div class="client-name">${appointment.clientFirstName || ''} ${appointment.clientLastName || ''}</div>
                  ${bulkPrintFilters.includeClientDetails ? `
                    <div class="client-contact">
                      ${appointment.clientPhone || 'No phone'}<br>
                      ${appointment.clientEmail || 'No email'}
                    </div>
                  ` : ''}
                </td>
                <td>
                  <div style="font-weight: 600;">${appointment.date}</div>
                  <div style="color: #666; font-size: 12px;">${appointment.time}</div>
                </td>
                <td>
                  ${bulkPrintFilters.includeServices ? `
                    <div class="service-list">
                      ${appointment.services?.map(service => `
                        <div class="service-item">
                          <strong>${service.name}</strong><br>
                          <span style="color: #666;">${service.duration} min • ₱${service.price}</span>
                        </div>
                      `).join('') || 'No services'}
                    </div>
                  ` : 'Services included'}
                </td>
                ${bulkPrintFilters.includeStylists ? `
                  <td>
                    <div class="stylist-list">
                      ${appointment.stylists?.map(stylist => stylist.stylistName).join(', ') || 'No stylist assigned'}
                    </div>
                  </td>
                ` : ''}
                <td>
                  <span class="status-badge status-${appointment.status}">${appointment.status}</span>
                </td>
                <td style="font-weight: 600; color: #160B53;">₱${appointment.totalCost || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <h3 class="summary-title">Summary Statistics</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${filteredAppointments.filter(apt => apt.status === 'confirmed').length}</div>
              <div class="summary-label">Confirmed</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${filteredAppointments.filter(apt => apt.status === 'pending').length}</div>
              <div class="summary-label">Pending</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${filteredAppointments.filter(apt => apt.status === 'completed').length}</div>
              <div class="summary-label">Completed</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${filteredAppointments.filter(apt => apt.status === 'cancelled').length}</div>
              <div class="summary-label">Cancelled</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">₱${filteredAppointments.reduce((total, apt) => total + (apt.totalCost || 0), 0)}</div>
              <div class="summary-label">Total Revenue</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">${filteredAppointments.length > 0 ? Math.round(filteredAppointments.reduce((total, apt) => total + (apt.totalCost || 0), 0) / filteredAppointments.length) : 0}</div>
              <div class="summary-label">Avg. Value</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>David's Salon - ${branchInfo?.name || 'Branch Name'}</p>
        </div>
      </body>
      </html>
    `;

    // Write the HTML content to the new window
    printWindow.document.write(reportHTML);
    printWindow.document.close();

    // Wait for the content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };

    setShowBulkPrintModal(false);
  };

  return (
    <SidebarWithHeader
      userInfo={userInfo}
      pageTitle="Appointment Management"
    >
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
            <p className="text-gray-600">Manage salon appointments and bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowBulkPrintModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print All
            </button>
            <button 
              onClick={() => navigate("/receptionist-appointments/new")}
              className="flex items-center gap-2 bg-[#160B53] text-white px-4 py-2 rounded-lg hover:bg-[#0f073d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                +12% from yesterday
              </span>
            </div>
          </div>

          {/* Pending Confirmations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Confirmations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === 'pending').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.status === 'completed' && apt.date === new Date().toISOString().split('T')[0]).length}
                </p>
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
        </div>

        {/* Today's Schedule Overview */}
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
          
          <div className="space-y-3">
            {appointments
              .filter(apt => apt.date === new Date().toISOString().split('T')[0])
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment, index) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-900 w-20">
                      {appointment.time}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{appointment.clientName}</div>
                      <div className="text-sm text-gray-500">{appointment.service} • {appointment.stylist}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <button
                      onClick={() => handleViewDetails(appointment)}
                      className="text-[#160B53] hover:text-[#0f073d]"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            
            {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
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

            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Filter Button */}
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#160B53] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments found for the selected criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stylist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {`${appointment.clientFirstName || ''} ${appointment.clientLastName || ''}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {appointment.clientPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.services?.map(service => service.name).join(', ') || 'No services'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.services?.reduce((total, service) => total + (service.duration || 0), 0) || 0} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.stylists?.map(stylist => stylist.stylistName).join(', ') || 'No stylist assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.time}</div>
                        <div className="text-sm text-gray-500">{appointment.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(appointment)}
                            className="text-[#160B53] hover:text-[#0f073d]"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintAppointment(appointment)}
                            className="text-green-600 hover:text-green-800"
                            title="Print Report"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Status Actions */}
        {filteredAppointments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredAppointments.filter(apt => apt.status === 'confirmed').length}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredAppointments.filter(apt => apt.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredAppointments.filter(apt => apt.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredAppointments.filter(apt => apt.status === 'cancelled').length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Client</label>
                <p className="text-gray-900">
                  {`${selectedAppointment.clientFirstName || ''} ${selectedAppointment.clientLastName || ''}`.trim()}
                </p>
                <p className="text-sm text-gray-600">{selectedAppointment.clientPhone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Services</label>
                <div className="space-y-1">
                  {selectedAppointment.services?.map((service, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-900">{service.name}</span>
                      <span className="text-sm text-gray-600">{service.duration} min</span>
                    </div>
                  )) || <p className="text-gray-900">No services</p>}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Stylists</label>
                <p className="text-gray-900">
                  {selectedAppointment.stylists?.map(stylist => stylist.stylistName).join(', ') || 'No stylist assigned'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                <p className="text-gray-900">{selectedAppointment.date} at {selectedAppointment.time}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusIcon(selectedAppointment.status)}
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </span>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handlePrintAppointment(selectedAppointment)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
              <button
                onClick={() => {
                  handleEditAppointment(selectedAppointment);
                  setShowModal(false);
                }}
                className="flex-1 px-4 py-2 bg-[#160B53] text-white rounded-lg hover:bg-[#0f073d]"
              >
                Edit Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Print Modal */}
      {showBulkPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Print All Appointments</h3>
              <button
                onClick={() => setShowBulkPrintModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={bulkPrintFilters.dateFrom}
                      onChange={(e) => setBulkPrintFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={bulkPrintFilters.dateTo}
                      onChange={(e) => setBulkPrintFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  value={bulkPrintFilters.status}
                  onChange={(e) => setBulkPrintFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Include in Report</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bulkPrintFilters.includeClientDetails}
                      onChange={(e) => setBulkPrintFilters(prev => ({ ...prev, includeClientDetails: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Client Contact Details</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bulkPrintFilters.includeServices}
                      onChange={(e) => setBulkPrintFilters(prev => ({ ...prev, includeServices: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Service Details</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bulkPrintFilters.includeStylists}
                      onChange={(e) => setBulkPrintFilters(prev => ({ ...prev, includeStylists: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Stylist Information</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowBulkPrintModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPrint}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarWithHeader>
  );
}
