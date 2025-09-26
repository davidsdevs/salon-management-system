import React, { useState, useEffect } from 'react';
import SidebarWithHeader from './common/components/BranchManagerSidebarWithHeader.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Settings,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  UserX,
  Activity,
  BarChart3,
  Target,
  X
} from 'lucide-react';
import { appointmentService, scheduleService, stylistService } from '../services/appointmentService.js';

const BranchManagerSchedule = () => {
  const { userProfile, branchInfo, userRole } = useAuth();
  const [stylists, setStylists] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('weekly'); // weekly, daily, monthly
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingCell, setEditingCell] = useState(null); // {stylistId, date, slotIndex}
  const [inlineForm, setInlineForm] = useState({
    startTime: '',
    endTime: '',
    status: 'available',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);


  const userInfo = {
    name: userProfile?.firstName || "Branch Manager",
    subtitle: userProfile?.email || "Branch Manager Email",
    badge: "Branch Manager",
    profileImage: userProfile?.profileImage
  };

  // Load data when component first mounts
  useEffect(() => {
    if (branchInfo?.id) {
      loadStylists();
      loadSchedules();
    }
  }, []);

  // Load data when branchInfo changes
  useEffect(() => {
    if (branchInfo?.id) {
      loadStylists();
      loadSchedules();
    } else {
      setStylists([]);
      setSchedules([]);
    }
  }, [branchInfo?.id]);

  // Set up subscription for real-time updates
  useEffect(() => {
    if (branchInfo?.id) {
      // Load schedules for a broader date range to cover both weekly and daily views
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30); // Load 30 days back
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 30); // Load 30 days forward

      // Set up subscription for real-time updates
      const unsubscribe = scheduleService.subscribeToSchedules(
        branchInfo.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
          (newSchedules) => {
            setSchedules(newSchedules);
          }
      );

      return () => unsubscribe();
      }
  }, [branchInfo?.id]);


  const loadStylists = async () => {
    try {
      setLoading(true);
      
      if (branchInfo?.id) {
        const stylistsData = await stylistService.getStylistsByBranch(branchInfo.id);
        
        // Transform stylist data to match expected format
        const transformedStylists = stylistsData.map(stylist => ({
          id: stylist.id,
          name: `${stylist.firstName} ${stylist.lastName}`,
          specialties: stylist.staffData?.skills || [],
          phone: stylist.phoneNumber,
          email: stylist.email,
          available: true,
          rating: 4.5,
          location: branchInfo.name
        }));
        
        setStylists(transformedStylists);
      } else {
        setStylists([]);
      }
    } catch (error) {
      console.error('Error loading stylists:', error);
      setStylists([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      if (branchInfo?.id) {
        // Load schedules for a broader date range to cover both weekly and daily views
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 30); // Load 30 days back
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30); // Load 30 days forward

        const schedulesData = await scheduleService.getBranchSchedules(
          branchInfo.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        
        setSchedules(schedulesData || []);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
    }
  };

  const refreshSchedules = async () => {
    await loadSchedules();
  };




  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(startOfWeek);
      newDate.setDate(startOfWeek.getDate() + i);
      dates.push(newDate);
    }
    return dates;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time24: time24,
        time12: formatTime12Hour(time24)
      });
    }
    return slots;
  };

  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Convert 12-hour format to 24-hour format
  const formatTime24Hour = (time12) => {
    const [time, ampm] = time12.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    
    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const getStylistSchedule = (stylistId, date) => {
    // Normalize date format to ensure consistency
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    
    const filteredSchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
      const matchesStylist = schedule.stylistId === stylistId;
      const matchesDate = scheduleDate === normalizedDate;
      
      return matchesStylist && matchesDate;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Return only the first (and should be only) schedule for this stylist on this date
    return filteredSchedules.length > 0 ? [filteredSchedules[0]] : [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-3 h-3" />;
      case 'busy': return <UserCheck className="w-3 h-3" />;
      case 'break': return <Clock className="w-3 h-3" />;
      case 'off': return <UserX className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };


  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await scheduleService.deleteSchedule(scheduleId);
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Error deleting schedule. Please try again.');
      }
    }
  };

  // Inline editing functions
  const handleCellClick = (stylistId, date, slotIndex = null) => {
    const existingSchedule = getStylistSchedule(stylistId, date);
    const schedule = existingSchedule.length > 0 ? existingSchedule[0] : null;
    
    setEditingCell({ stylistId, date, slotIndex: schedule ? 0 : null });
    setInlineForm({
      startTime: schedule ? formatTime12Hour(schedule.startTime) : '9:00 AM',
      endTime: schedule ? formatTime12Hour(schedule.endTime) : '5:00 PM',
      status: schedule?.status || 'available',
      notes: schedule?.notes || ''
    });
  };

  const handleInlineSave = async () => {
    if (isSaving) return; // Prevent multiple saves
    
    try {
      if (editingCell) {
        setIsSaving(true);
        const { stylistId, date, slotIndex } = editingCell;
        
        // Validate form data
        if (!inlineForm.startTime || !inlineForm.endTime) {
          alert('Please fill in both start and end times.');
          return;
        }
        
        // Convert to 24-hour format for comparison
        const startTime24 = formatTime24Hour(inlineForm.startTime);
        const endTime24 = formatTime24Hour(inlineForm.endTime);
        
        if (startTime24 >= endTime24) {
          alert('End time must be after start time.');
          return;
        }
        
        // Convert 12-hour format to 24-hour format for storage
        const scheduleData = {
          startTime: formatTime24Hour(inlineForm.startTime),
          endTime: formatTime24Hour(inlineForm.endTime),
          status: inlineForm.status,
          notes: inlineForm.notes,
          branchId: branchInfo.id
        };
        
        // Only store schedules that are NOT available (exceptions only)
        if (scheduleData.status === 'available') {
          // If setting to available, delete any existing schedule (since available is default)
          const existingSchedule = getStylistSchedule(stylistId, date);
          if (existingSchedule.length > 0) {
            console.log('🗑️ Deleting available schedule from database');
            await scheduleService.deleteSchedule(existingSchedule[0].id);
          } else {
            console.log('✅ No schedule to delete - already available by default');
            // Don't save anything if it's already available by default, but still close modal
            setEditingCell(null);
            setInlineForm({
              startTime: '',
              endTime: '',
              status: 'available',
              notes: ''
            });
            return;
          }
        } else {
          // Only store non-available schedules (busy, break, off)
          console.log('💾 Storing exception schedule:', scheduleData.status);
          const existingSchedule = getStylistSchedule(stylistId, date);
          
          if (existingSchedule.length > 0) {
            // Update existing schedule
            const scheduleToUpdate = existingSchedule[0];
            await scheduleService.updateSchedule(scheduleToUpdate.id, scheduleData);
            console.log('📝 Updated existing exception schedule');
      } else {
        // Create new schedule
            await scheduleService.createSchedule({
            stylistId,
            date,
              ...scheduleData
            });
            console.log('➕ Created new exception schedule');
          }
        }
        
        // Close modal and reset form
        setEditingCell(null);
        setInlineForm({
          startTime: '',
          endTime: '',
          status: 'available',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error saving inline schedule:', error);
      alert(`Error saving schedule: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInlineCancel = () => {
    setEditingCell(null);
    setInlineForm({
      startTime: '',
      endTime: '',
      status: 'available',
      notes: ''
    });
  };

  const handleInlineDelete = async () => {
    if (editingCell) {
      if (window.confirm('Are you sure you want to delete this schedule?')) {
        try {
          const { stylistId, date } = editingCell;
          const existingSchedule = getStylistSchedule(stylistId, date);
          
          if (existingSchedule.length > 0) {
            const scheduleToDelete = existingSchedule[0];
          
          if (!scheduleToDelete || !scheduleToDelete.id) {
            throw new Error('Schedule not found for deletion');
          }
          
          await scheduleService.deleteSchedule(scheduleToDelete.id);
          }
          
          setEditingCell(null);
          setInlineForm({
        startTime: '',
        endTime: '',
        status: 'available',
        notes: ''
      });
    } catch (error) {
          console.error('Error deleting schedule:', error);
          alert(`Error deleting schedule: ${error.message || 'Please try again.'}`);
        }
      }
    }
  };


  const filteredStylists = stylists.filter(stylist => {
    const matchesSearch = searchTerm === '' || 
      stylist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stylist.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'available' && stylist.available !== false) ||
      (filterStatus === 'busy' && stylist.available === false);
    
    return matchesSearch && matchesStatus;
  });

  const renderWeeklyView = () => {
    const weekDates = getWeekDates(currentWeek);
    const timeSlots = getTimeSlots();

    return (
      <div className="space-y-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Stylist
                  </th>
                  {weekDates.map((date, index) => (
                    <th key={index} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      <div className="text-sm font-semibold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-xs text-gray-400">{date.getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStylists.map((stylist) => (
                  <tr key={stylist.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#160B53] flex items-center justify-center text-white font-medium text-sm">
                          {stylist.name?.charAt(0) || 'S'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{stylist.name}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date, dateIndex) => {
                      const dateString = date.toISOString().split('T')[0];
                      const schedule = getStylistSchedule(stylist.id, dateString);
                      const isEditing = editingCell?.stylistId === stylist.id && editingCell?.date === dateString;
                      
                      return (
                        <td key={dateIndex} className="px-4 py-4 text-center relative">
                          {isEditing && (
                            // Popup editing form
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg p-4 w-80 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {editingCell?.slotIndex !== null ? 'Edit Time Block' : 'Block Time'}
                                  </h3>
                                  <button
                                    onClick={handleInlineCancel}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                      <input
                                        type="text"
                                        value={inlineForm.startTime}
                                        onChange={(e) => setInlineForm(prev => ({ ...prev, startTime: e.target.value }))}
                                        placeholder="9:00 AM"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                      <input
                                        type="text"
                                        value={inlineForm.endTime}
                                        onChange={(e) => setInlineForm(prev => ({ ...prev, endTime: e.target.value }))}
                                        placeholder="5:00 PM"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                      value={inlineForm.status}
                                      onChange={(e) => setInlineForm(prev => ({ ...prev, status: e.target.value }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                                    >
                                      <option value="available">Available</option>
                                      <option value="busy">Busy</option>
                                      <option value="break">Break</option>
                                      <option value="off">Off</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                      value={inlineForm.notes}
                                      onChange={(e) => setInlineForm(prev => ({ ...prev, notes: e.target.value }))}
                                      rows={2}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                                      placeholder="Add notes..."
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-6">
                                  {editingCell?.slotIndex !== null && (
                                    <button
                                      onClick={handleInlineDelete}
                                      disabled={isSaving}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Delete
                                    </button>
                                  )}
                                  <button
                                    onClick={handleInlineCancel}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleInlineSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-[#160B53] text-white rounded-lg hover:bg-[#160B53]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                  >
                                    {isSaving && (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          {!isEditing && (
                            // Normal schedule display - show single schedule per day
                          <div className="space-y-1">
                              {schedule.length > 0 ? (
                                // Show existing schedule
                                <div
                                  className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(schedule[0].status)} cursor-pointer hover:opacity-80`}
                                  onClick={() => handleCellClick(stylist.id, dateString, 0)}
                                  title={`${formatTime12Hour(schedule[0].startTime)} - ${formatTime12Hour(schedule[0].endTime)}${schedule[0].notes ? ': ' + schedule[0].notes : ''}`}
                              >
                                <div className="flex items-center justify-center space-x-1">
                                    {getStatusIcon(schedule[0].status)}
                                    <span>{formatTime12Hour(schedule[0].startTime)} - {formatTime12Hour(schedule[0].endTime)}</span>
                                </div>
                              </div>
                              ) : (
                                // Show default available schedule
                                <div
                                  className="px-2 py-1 rounded text-xs font-medium border bg-green-100 text-green-800 border-green-200 cursor-pointer hover:opacity-80"
                                onClick={() => handleCellClick(stylist.id, dateString)}
                                  title="Default available - Click to block time"
                                >
                                  <div className="flex items-center justify-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Available</span>
                                  </div>
                                </div>
                              )}
                          </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDailyView = () => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];

    return (
      <div className="space-y-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>

        {/* Stylist Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStylists.map((stylist) => {
            const schedule = getStylistSchedule(stylist.id, selectedDateString);
            const scheduleSlot = schedule.length > 0 ? schedule[0] : null;
            const isEditing = editingCell?.stylistId === stylist.id && editingCell?.date === selectedDateString;

            return (
              <div key={stylist.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Stylist Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#160B53] flex items-center justify-center text-white font-bold text-lg">
                          {stylist.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                    <h4 className="text-lg font-semibold text-gray-900">{stylist.name}</h4>
                        </div>
                      </div>

                {/* Schedule Display */}
                          {isEditing && (
                  // Popup editing form
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {editingCell?.slotIndex !== null ? 'Edit Time Block' : 'Block Time'}
                                  </h3>
                                  <button
                                    onClick={handleInlineCancel}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                      <input
                              type="text"
                                        value={inlineForm.startTime}
                                        onChange={(e) => setInlineForm(prev => ({ ...prev, startTime: e.target.value }))}
                              placeholder="9:00 AM"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                      <input
                              type="text"
                                        value={inlineForm.endTime}
                                        onChange={(e) => setInlineForm(prev => ({ ...prev, endTime: e.target.value }))}
                              placeholder="5:00 PM"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                      value={inlineForm.status}
                                      onChange={(e) => setInlineForm(prev => ({ ...prev, status: e.target.value }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                                    >
                                      <option value="available">Available</option>
                                      <option value="busy">Busy</option>
                                      <option value="break">Break</option>
                                      <option value="off">Off</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                      value={inlineForm.notes}
                                      onChange={(e) => setInlineForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
                                      placeholder="Add notes..."
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-6">
                                  {editingCell?.slotIndex !== null && (
                                    <button
                                      onClick={handleInlineDelete}
                                      disabled={isSaving}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Delete
                                    </button>
                                  )}
                                  <button
                                    onClick={handleInlineCancel}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleInlineSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-[#160B53] text-white rounded-lg hover:bg-[#160B53]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                  >
                                    {isSaving && (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                {/* Schedule Content */}
                {!isEditing && (
                  <div className="space-y-4">
                    {scheduleSlot ? (
                      // Existing Schedule
                      <div 
                        className={`p-4 rounded-lg border-2 cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(scheduleSlot.status)}`}
                        onClick={() => handleCellClick(stylist.id, selectedDateString, 0)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(scheduleSlot.status)}
                            <span className="font-medium capitalize">{scheduleSlot.status}</span>
                              </div>
                          <div className="text-xs text-gray-500">
                            Click to edit
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {formatTime12Hour(scheduleSlot.startTime)} - {formatTime12Hour(scheduleSlot.endTime)}
                        </div>
                        {scheduleSlot.notes && (
                          <div className="text-xs text-gray-600 mt-2 p-2 bg-white bg-opacity-50 rounded">
                            {scheduleSlot.notes}
                          </div>
                              )}
                            </div>
                          ) : (
                      // No Schedule - Show default available schedule
                            <div 
                        className="p-4 rounded-lg border-2 cursor-pointer hover:opacity-80 transition-opacity bg-green-100 text-green-800 border-green-200"
                              onClick={() => handleCellClick(stylist.id, selectedDateString)}
                            >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium capitalize">Available</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Click to edit
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          9:00 AM - 5:00 PM
                        </div>
                        <div className="text-xs text-gray-600">
                          Default available - Click to block time
                        </div>
                            </div>
                          )}

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCellClick(stylist.id, selectedDateString, scheduleSlot ? 0 : null)}
                        className="flex-1 px-3 py-2 text-sm bg-[#160B53] text-white rounded-lg hover:bg-[#160B53]/90 transition-colors"
                      >
                        {scheduleSlot ? 'Edit Block' : 'Block Time'}
                      </button>
                      {scheduleSlot && (
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this schedule?')) {
                              try {
                                await scheduleService.deleteSchedule(scheduleSlot.id);
                                // Refresh the schedules
                                await loadSchedules();
                              } catch (error) {
                                console.error('Error deleting schedule:', error);
                                alert('Error deleting schedule. Please try again.');
                              }
                            }
                          }}
                          className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
                      );
                    })}
          </div>

        {/* Empty State */}
        {filteredStylists.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Stylists Found</h3>
            <p className="text-gray-500">No stylists match your current search criteria.</p>
        </div>
        )}
      </div>
    );
  };


  const renderStaffManagement = () => (
    <div className="space-y-6">
      {/* Staff List Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Staff Management</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search stylists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#160B53]"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStylists.map((stylist) => (
          <div key={stylist.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#160B53] flex items-center justify-center text-white font-bold text-xl">
                {stylist.name?.charAt(0) || 'S'}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{stylist.name}</h4>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(stylist.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-500">{stylist.rating || '4.5'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{stylist.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{stylist.email || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{stylist.location || 'Branch Location'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    stylist.available !== false ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {stylist.available !== false ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-[#160B53] transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <SidebarWithHeader userInfo={userInfo} pageTitle="Staff Scheduling">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#160B53]"></div>
        </div>
      </SidebarWithHeader>
    );
  }

  return (
    <SidebarWithHeader userInfo={userInfo} pageTitle="Staff Scheduling">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setViewMode('weekly')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  viewMode === 'weekly'
                    ? 'border-[#160B53] text-[#160B53]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Weekly View</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  viewMode === 'daily'
                    ? 'border-[#160B53] text-[#160B53]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Daily View</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('staff')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  viewMode === 'staff'
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



        {/* Content */}
        {viewMode === 'weekly' && renderWeeklyView()}
        {viewMode === 'daily' && renderDailyView()}
        {viewMode === 'staff' && renderStaffManagement()}

      </div>
    </SidebarWithHeader>
  );
};

export default BranchManagerSchedule;
