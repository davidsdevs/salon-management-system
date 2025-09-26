import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection references
const appointmentsRef = collection(db, 'appointments');
const servicesRef = collection(db, 'services');
const stylistsRef = collection(db, 'stylists');
const usersRef = collection(db, 'users');
const schedulesRef = collection(db, 'schedules');
const branchesRef = collection(db, 'branches');
const staffServicesRef = collection(db, 'staff_services');

// Appointment CRUD Operations
export const appointmentService = {
  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      // Remove undefined fields (Firestore rejects undefined)
      const removeUndefinedFields = (obj) => Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        if (value !== undefined) acc[key] = value;
        return acc;
      }, {});

      const appointment = removeUndefinedFields({
        ...appointmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: appointmentData.status || 'pending'
      });
      
      const docRef = await addDoc(appointmentsRef, appointment);
      console.log('Appointment created with ID:', docRef.id);
      return { id: docRef.id, ...appointment };
    } catch (error) {
      console.error('Error creating appointment:', error?.message || error, error);
      throw error;
    }
  },

  // Get all appointments for a branch
  async getAppointmentsByBranch(branchId, filters = {}) {
    try {
      let q = query(
        appointmentsRef,
        where('branchId', '==', branchId)
      );

      // Add date filter if provided
      if (filters.date) {
        q = query(q, where('date', '==', filters.date));
      }

      // Add status filter if provided
      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      const appointments = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by date (desc) then by time (asc)
      appointments.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date); // desc
        }
        return a.time.localeCompare(b.time); // asc
      });

      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Subscribe to real-time appointment updates
  subscribeToAppointments(branchId, callback, filters = {}) {
    let q = query(
      appointmentsRef,
      where('branchId', '==', branchId)
    );

    // Add date filter if provided
    if (filters.date) {
      q = query(q, where('date', '==', filters.date));
    }

    // Add status filter if provided
    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }

    return onSnapshot(q, (querySnapshot) => {
      const appointments = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by date (desc) then by time (asc)
      appointments.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date); // desc
        }
        return a.time.localeCompare(b.time); // asc
      });

      callback(appointments);
    });
  },

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    try {
      const docRef = doc(appointmentsRef, appointmentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Appointment not found');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  // Update appointment
  async updateAppointment(appointmentId, updateData) {
    try {
      const docRef = doc(appointmentsRef, appointmentId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('Appointment updated:', appointmentId);
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    try {
      const docRef = doc(appointmentsRef, appointmentId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      console.log('Appointment status updated:', appointmentId, status);
      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Delete appointment
  async deleteAppointment(appointmentId) {
    try {
      const docRef = doc(appointmentsRef, appointmentId);
      await deleteDoc(docRef);
      
      console.log('Appointment deleted:', appointmentId);
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
};

// Services CRUD Operations
export const serviceService = {
  // Get all services (active only by default)
  async getServices(includeArchived = false) {
    try {
      const querySnapshot = await getDocs(servicesRef);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        const serviceData = doc.data();
        // Filter out archived services unless specifically requested
        if (includeArchived || !serviceData.archived) {
        services.push({
          id: doc.id,
            ...serviceData
        });
        }
      });

      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get services by category (active only by default)
  async getServicesByCategory(category, includeArchived = false) {
    try {
      const q = query(servicesRef, where('category', '==', category));
      const querySnapshot = await getDocs(q);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        const serviceData = doc.data();
        // Filter out archived services unless specifically requested
        if (includeArchived || !serviceData.archived) {
        services.push({
          id: doc.id,
            ...serviceData
        });
        }
      });

      return services;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  }
};

// Stylist Users CRUD Operations (stored in users collection with role: 'stylist')
export const stylistService = {
  // Get all stylist users
  async getStylists() {
    try {
      console.log('Querying all stylists...');
      const q = query(usersRef, where('role', '==', 'stylist'));
      const querySnapshot = await getDocs(q);
      const stylists = [];
      
      console.log('All stylists query snapshot size:', querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('All stylist data:', { id: doc.id, ...data });
        stylists.push({
          id: doc.id,
          ...data
        });
      });

      console.log('Found all stylists:', stylists.length);
      return stylists;
    } catch (error) {
      console.error('Error fetching stylists:', error);
      throw error;
    }
  },

  // Get stylists by branch
  async getStylistsByBranch(branchId) {
    try {
      console.log('🔍 Querying stylists for branchId:', branchId);
      const q = query(
        usersRef, 
        where('role', '==', 'stylist')
      );
      const querySnapshot = await getDocs(q);
      const stylists = [];
      
      console.log('🔍 Query snapshot size:', querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('🔍 Stylist data:', { 
          id: doc.id, 
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          staffData: data.staffData,
          branchId: data.staffData?.branchId,
          targetBranchId: branchId,
          match: data.staffData?.branchId === branchId
        });
        
        // Check if stylist belongs to the specified branch
        if (data.staffData && data.staffData.branchId === branchId) {
          console.log('✅ Match found for stylist:', data.firstName, data.lastName);
          stylists.push({
            id: doc.id,
            ...data
          });
        } else {
          console.log('❌ No match for stylist:', data.firstName, data.lastName, 'branchId:', data.staffData?.branchId, 'target:', branchId);
        }
      });

      console.log('🔍 Found stylists for branch:', stylists.length);
      console.log('🔍 Stylist names:', stylists.map(s => `${s.firstName} ${s.lastName}`));
      return stylists;
    } catch (error) {
      console.error('Error fetching stylists by branch:', error);
      throw error;
    }
  },

  // Get stylists for a specific service
  async getStylistsForService(serviceId, branchId) {
    try {
      const q = query(
        usersRef, 
        where('role', '==', 'stylist')
      );
      const querySnapshot = await getDocs(q);
      const stylists = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Check if stylist belongs to the specified branch and has the service skill
        if (data.staffData && 
            data.staffData.branchId === branchId && 
            data.staffData.skills && 
            data.staffData.skills.includes(serviceId)) {
          stylists.push({
            id: doc.id,
            ...data
          });
        }
      });

      return stylists;
    } catch (error) {
      console.error('Error fetching stylists for service:', error);
      throw error;
    }
  }
};

// Client Users CRUD Operations (stored in users collection with role: 'client')
export const clientService = {
  // Get all client users
  async getClients() {
    try {
      const q = query(usersRef, where('role', '==', 'client'));
      const querySnapshot = await getDocs(q);
      const clients = [];
      
      querySnapshot.forEach((doc) => {
        clients.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Search client users by name or phone
  async searchClients(searchTerm) {
    try {
      const q = query(usersRef, where('role', '==', 'client'));
      const querySnapshot = await getDocs(q);
      const clients = [];
      
      querySnapshot.forEach((doc) => {
        const clientData = { id: doc.id, ...doc.data() };
        const fullName = `${clientData.firstName || ''} ${clientData.lastName || ''}`.toLowerCase();
        const phone = clientData.phoneNumber || '';
        
        if (fullName.includes(searchTerm.toLowerCase()) || 
            phone.includes(searchTerm)) {
          clients.push(clientData);
        }
      });

      return clients;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  },

  // Check if email already exists
  async checkEmailExists(email, excludeClientId = null) {
    try {
      if (!email) return false;
      
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      let exists = false;
      querySnapshot.forEach((doc) => {
        if (!excludeClientId || doc.id !== excludeClientId) {
          exists = true;
        }
      });
      
      return exists;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  },

  // Check if phone number already exists
  async checkPhoneExists(phone, excludeClientId = null) {
    try {
      if (!phone) return false;
      
      const q = query(usersRef, where('phoneNumber', '==', phone));
      const querySnapshot = await getDocs(q);
      
      let exists = false;
      querySnapshot.forEach((doc) => {
        if (!excludeClientId || doc.id !== excludeClientId) {
          exists = true;
        }
      });
      
      return exists;
    } catch (error) {
      console.error('Error checking phone existence:', error);
      throw error;
    }
  },

  // Validate client data before creation
  async validateClientData(clientData, excludeClientId = null) {
    const errors = {};
    
    // Check email if provided
    if (clientData.email) {
      const emailExists = await this.checkEmailExists(clientData.email, excludeClientId);
      if (emailExists) {
        errors.email = 'Email address is already registered with another client';
      }
    }
    
    // Check phone if provided
    if (clientData.phoneNumber) {
      const phoneExists = await this.checkPhoneExists(clientData.phoneNumber, excludeClientId);
      if (phoneExists) {
        errors.phoneNumber = 'Phone number is already registered with another client';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Create a new client user (this should be done through Firebase Auth + users collection)
  async createClient(clientData) {
    try {
      // Validate client data first
      const validation = await this.validateClientData(clientData);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      
      // Note: This function should be called after creating Firebase Auth user
      // The actual user creation should be done in the registration process
      console.log('Client data validated successfully');
      return { validated: true };
    } catch (error) {
      console.error('Error validating client data:', error);
      throw error;
    }
  },

  // Update a client user
  async updateClient(clientId, updateData) {
    try {
      const docRef = doc(usersRef, clientId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('Client updated:', clientId);
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }
};

// Utility functions
export const appointmentUtils = {
  // Generate time slots for a given date
  generateTimeSlots(date, operatingHours = null) {
    const slots = [];
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Get operating hours for the specific day
    let startHour = 9;
    let endHour = 18;
    let isClosed = false;
    
    if (operatingHours && operatingHours[dayOfWeek]) {
      const dayHours = operatingHours[dayOfWeek];
      
      // Check if branch is closed
      if (dayHours.toLowerCase().includes('closed') || dayHours.toLowerCase().includes('off')) {
        isClosed = true;
      } else {
        // Parse operating hours (e.g., "9:00 AM - 6:00 PM")
        const timeMatch = dayHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          const [, startH, startM, startPeriod, endH, endM, endPeriod] = timeMatch;
          
          // Convert to 24-hour format
          startHour = this.convertTo24Hour(parseInt(startH), startPeriod);
          endHour = this.convertTo24Hour(parseInt(endH), endPeriod);
        }
      }
    }
    
    // If closed, return empty slots
    if (isClosed) {
      return [];
    }
    
    // Generate time slots based on operating hours
    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      
      slots.push({
        time: timeString,
        display: `${displayHour}:00 ${ampm}`,
        available: true
      });
    }
    
    return slots;
  },

  // Convert 12-hour time to 24-hour format
  convertTo24Hour(hour, period) {
    if (period.toUpperCase() === 'AM') {
      return hour === 12 ? 0 : hour;
    } else { // PM
      return hour === 12 ? 12 : hour + 12;
    }
  },

  // Check if a time slot is available
  isTimeSlotAvailable(appointments, date, time) {
    return !appointments.some(appointment => 
      appointment.date === date && appointment.time === time
    );
  }
};

// Schedule Management Service
export const scheduleService = {
  // Create a new schedule entry
  async createSchedule(scheduleData) {
    try {
      const schedule = {
        ...scheduleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(schedulesRef, schedule);
      console.log('Schedule created with ID:', docRef.id);
      return { id: docRef.id, ...schedule };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  // Get schedules for a specific stylist and date range
  async getStylistSchedules(stylistId, startDate, endDate) {
    try {
      const q = query(
        schedulesRef,
        where('stylistId', '==', stylistId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc'),
        orderBy('startTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting stylist schedules:', error);
      throw error;
    }
  },

  // Get all schedules for a branch
  async getBranchSchedules(branchId, startDate, endDate) {
    try {
      const q = query(
        schedulesRef,
        where('branchId', '==', branchId)
      );
      
      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter by date range and sort in JavaScript
      const filteredSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= startDate && scheduleDate <= endDate;
      });
      
      // Sort by date and start time
      filteredSchedules.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
      
      return filteredSchedules;
    } catch (error) {
      console.error('Error getting branch schedules:', error);
      throw error;
    }
  },

  // Update a schedule entry
  async updateSchedule(scheduleId, updateData) {
    try {
      const scheduleRef = doc(schedulesRef, scheduleId);
      await updateDoc(scheduleRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      console.log('Schedule updated:', scheduleId);
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  // Delete a schedule entry
  async deleteSchedule(scheduleId) {
    try {
      const scheduleRef = doc(schedulesRef, scheduleId);
      await deleteDoc(scheduleRef);
      console.log('Schedule deleted:', scheduleId);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },

  // Get schedules for a specific date
  async getSchedulesByDate(branchId, date) {
    try {
      const q = query(
        schedulesRef,
        where('branchId', '==', branchId),
        where('date', '==', date),
        orderBy('startTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting schedules by date:', error);
      throw error;
    }
  },

  // Subscribe to real-time schedule updates
  subscribeToSchedules(branchId, startDate, endDate, callback) {
    console.log('🔍 subscribeToSchedules called with:', { branchId, startDate, endDate });
    
    const q = query(
      schedulesRef,
      where('branchId', '==', branchId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const schedules = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📅 Raw schedules from database:', schedules);
      
      // Convert startDate and endDate to Date objects for proper comparison
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Filter by date range and sort in JavaScript
      const filteredSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        const isInRange = scheduleDate >= startDateObj && scheduleDate <= endDateObj;
        
        console.log('🔍 Date filtering:', {
          scheduleDate: schedule.date,
          scheduleDateObj: scheduleDate.toISOString().split('T')[0],
          startDate: startDate,
          endDate: endDate,
          isInRange
        });
        
        return isInRange;
      });
      
      console.log('📅 Filtered schedules:', filteredSchedules);
      
      // Sort by date and start time
      filteredSchedules.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
      
      callback(filteredSchedules);
    });
  }
};

// Branch Service
export const branchService = {
  // Update branch operating hours
  async updateOperatingHours(branchId, operatingHours) {
    try {
      console.log('💾 Updating operating hours for branch:', branchId, operatingHours);
      
      const branchDocRef = doc(branchesRef, branchId);
      await updateDoc(branchDocRef, {
        operatingHours: operatingHours,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Operating hours updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating operating hours:', error);
      throw error;
    }
  },

  // Get branch information
  async getBranchInfo(branchId) {
    try {
      const branchDoc = await getDoc(doc(branchesRef, branchId));
      if (branchDoc.exists()) {
        return { id: branchDoc.id, ...branchDoc.data() };
      } else {
        throw new Error('Branch not found');
      }
    } catch (error) {
      console.error('❌ Error getting branch info:', error);
      throw error;
    }
  },

  // Get services by branch (only branch-specific services)
  async getServicesByBranch(branchId, includeArchived = false) {
    try {
      console.log('🔍 Getting services for branch:', branchId, includeArchived ? '(including archived)' : '(active only)');
      
      // Get only branch-specific services
      const branchServicesQuery = query(servicesRef, where('branchId', '==', branchId));
      const branchServicesSnapshot = await getDocs(branchServicesQuery);
      const branchServices = [];
      
      branchServicesSnapshot.forEach((doc) => {
        const serviceData = doc.data();
        // Filter out archived services unless specifically requested
        if (includeArchived || !serviceData.archived) {
        branchServices.push({
          id: doc.id,
            ...serviceData
        });
        }
      });
      
        console.log('✅ Found branch-specific services:', branchServices.length);
        return branchServices;
    } catch (error) {
      console.error('❌ Error getting services by branch:', error);
      throw error;
    }
  },

  // Create a new service for a branch
  async createBranchService(branchId, serviceData) {
    try {
      console.log('💾 Creating service for branch:', branchId, serviceData);
      
      const serviceDoc = {
        ...serviceData,
        branchId: branchId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(servicesRef, serviceDoc);
      console.log('✅ Service created with ID:', docRef.id);
      
      return { id: docRef.id, ...serviceData };
    } catch (error) {
      console.error('❌ Error creating branch service:', error);
      throw error;
    }
  },

  // Update a branch service
  async updateBranchService(serviceId, serviceData) {
    try {
      console.log('💾 Updating service:', serviceId, serviceData);
      
      const serviceDocRef = doc(servicesRef, serviceId);
      await updateDoc(serviceDocRef, {
        ...serviceData,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Service updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating branch service:', error);
      throw error;
    }
  },

  // Archive a branch service (soft delete)
  async archiveBranchService(serviceId) {
    try {
      console.log('📦 Archiving service:', serviceId);
      
      const serviceDocRef = doc(servicesRef, serviceId);
      await updateDoc(serviceDocRef, {
        archived: true,
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Service archived successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error archiving branch service:', error);
      throw error;
    }
  },

  // Unarchive a branch service
  async unarchiveBranchService(serviceId) {
    try {
      console.log('📦 Unarchiving service:', serviceId);
      
      const serviceDocRef = doc(servicesRef, serviceId);
      await updateDoc(serviceDocRef, {
        archived: false,
        archivedAt: null,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Service unarchived successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error unarchiving branch service:', error);
      throw error;
    }
  },

  // Get archived services for a branch
  async getArchivedServicesByBranch(branchId) {
    try {
      console.log('🔍 Getting archived services for branch:', branchId);
      
      // Get branch-specific services
      const branchServicesQuery = query(servicesRef, where('branchId', '==', branchId));
      const branchServicesSnapshot = await getDocs(branchServicesQuery);
      const archivedServices = [];
      
      branchServicesSnapshot.forEach((doc) => {
        const serviceData = doc.data();
        // Only include archived services
        if (serviceData.archived) {
          archivedServices.push({
            id: doc.id,
            ...serviceData
          });
        }
      });
      
      console.log('✅ Found archived services:', archivedServices.length);
      return archivedServices;
    } catch (error) {
      console.error('❌ Error getting archived services by branch:', error);
      throw error;
    }
  }
};

// Staff Services CRUD Operations
export const staffServicesService = {
  // Get all staff-service relationships
  async getStaffServices() {
    try {
      const querySnapshot = await getDocs(staffServicesRef);
      const staffServices = [];
      
      querySnapshot.forEach((doc) => {
        staffServices.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return staffServices;
    } catch (error) {
      console.error('Error fetching staff services:', error);
      throw error;
    }
  },

  // Get services for a specific staff member
  async getServicesByStaff(staffId) {
    try {
      const q = query(staffServicesRef, where('staffId', '==', staffId));
      const querySnapshot = await getDocs(q);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return services;
    } catch (error) {
      console.error('Error fetching services by staff:', error);
      throw error;
    }
  },

  // Get staff members for a specific service
  async getStaffByService(serviceId) {
    try {
      const q = query(staffServicesRef, where('serviceId', '==', serviceId));
      const querySnapshot = await getDocs(q);
      const staff = [];
      
      querySnapshot.forEach((doc) => {
        staff.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return staff;
    } catch (error) {
      console.error('Error fetching staff by service:', error);
      throw error;
    }
  },

  // Get staff services for a specific branch
  async getStaffServicesByBranch(branchId) {
    try {
      const q = query(staffServicesRef, where('branchId', '==', branchId));
      const querySnapshot = await getDocs(q);
      const staffServices = [];
      
      querySnapshot.forEach((doc) => {
        staffServices.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return staffServices;
    } catch (error) {
      console.error('Error fetching staff services by branch:', error);
      throw error;
    }
  },

  // Create a staff-service relationship
  async createStaffService(staffServiceData) {
    try {
      console.log('💾 Creating staff-service relationship:', staffServiceData);
      
      const docRef = await addDoc(staffServicesRef, {
        ...staffServiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Staff-service relationship created with ID:', docRef.id);
      return { id: docRef.id, ...staffServiceData };
    } catch (error) {
      console.error('❌ Error creating staff-service relationship:', error);
      throw error;
    }
  },

  // Update a staff-service relationship
  async updateStaffService(staffServiceId, updateData) {
    try {
      console.log('💾 Updating staff-service relationship:', staffServiceId, updateData);
      
      const docRef = doc(staffServicesRef, staffServiceId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Staff-service relationship updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating staff-service relationship:', error);
      throw error;
    }
  },

  // Delete a staff-service relationship
  async deleteStaffService(staffServiceId) {
    try {
      console.log('🗑️ Deleting staff-service relationship:', staffServiceId);
      
      const docRef = doc(staffServicesRef, staffServiceId);
      await deleteDoc(docRef);
      
      console.log('✅ Staff-service relationship deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting staff-service relationship:', error);
      throw error;
    }
  },

  // Check if a staff member can perform a service
  async canStaffPerformService(staffId, serviceId) {
    try {
      const q = query(
        staffServicesRef, 
        where('staffId', '==', staffId),
        where('serviceId', '==', serviceId)
      );
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking staff service capability:', error);
      throw error;
    }
  }
};
