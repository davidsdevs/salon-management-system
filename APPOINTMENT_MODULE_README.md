# Appointment Module - David's Salon

## Overview
The appointment module provides comprehensive functionality for managing salon appointments, including creation, viewing, editing, and status management. It's designed specifically for receptionists to efficiently handle client bookings.

## Features

### 🎯 Core Functionality
- **Create Appointments**: Multi-step appointment creation with client selection/registration
- **View Appointments**: Real-time appointment listing with filtering and search
- **Edit Appointments**: Update appointment details and status
- **Delete Appointments**: Remove appointments with confirmation
- **Status Management**: Track appointment status (pending, confirmed, completed, cancelled)

### 👥 Client Management
- **Search Existing Clients**: Find clients by name or phone number
- **Register New Clients**: Create new client profiles during booking
- **Client Data**: Store comprehensive client information including contact details

### 🛠️ Service & Stylist Management
- **Service Selection**: Choose from available salon services
- **Stylist Assignment**: Assign specific stylists to services
- **Service Categories**: Organize services by type (hair, nails, facial, other)
- **Pricing**: Automatic cost calculation for selected services

### 📅 Scheduling
- **Date Selection**: Choose appointment dates
- **Time Slots**: Available time slot management
- **Availability Checking**: Real-time availability verification
- **Conflict Prevention**: Prevent double-booking

## File Structure

```
src/
├── services/
│   └── appointmentService.js          # Core appointment operations
├── Receptionist/
│   ├── ReceptionistDashboard.jsx      # Dashboard with stats and quick actions
│   ├── ReceptionistAppointments.jsx   # Main appointments list view
│   └── ReceptionistNewAppointment.jsx # Appointment creation form
├── seedData.js                        # Sample data for testing
└── testAppointmentModule.js           # Test utilities
```

## Database Schema

### Collections

#### `appointments`
```javascript
{
  id: "auto-generated",
  clientFirstName: "string",
  clientLastName: "string", 
  clientPhone: "string",
  clientEmail: "string",
  clientId: "string", // Reference to clients collection
  services: [
    {
      id: "string",
      name: "string",
      duration: "number",
      price: "number",
      category: "string"
    }
  ],
  stylists: [
    {
      serviceId: "string",
      serviceName: "string", 
      stylistId: "string",
      stylistName: "string"
    }
  ],
  date: "string", // YYYY-MM-DD format
  time: "string", // HH:MM format
  totalCost: "number",
  status: "string", // pending, confirmed, completed, cancelled
  notes: "string",
  branchId: "string",
  createdBy: "string", // User ID
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### `services`
```javascript
{
  id: "auto-generated",
  name: "string",
  duration: "number", // minutes
  price: "number",
  category: "string", // hair, nails, facial, other
  isChemical: "boolean"
}
```

#### `stylists`
```javascript
{
  id: "auto-generated",
  name: "string",
  serviceIds: ["string"], // Array of service IDs
  specialties: ["string"], // Array of specialty names
  branchId: "string",
  rating: "number",
  available: "boolean"
}
```

#### `clients`
```javascript
{
  id: "auto-generated",
  firstName: "string",
  lastName: "string",
  phone: "string",
  email: "string",
  birthday: "string", // YYYY-MM-DD format
  gender: "string",
  branchId: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

## Usage

### 1. Setting Up Sample Data
```javascript
import { seedDatabase, addTestAppointments } from './src/seedData.js';

// Seed the database with sample data
await seedDatabase();

// Add sample appointments
await addTestAppointments();
```

### 2. Testing the Module
```javascript
import { testAppointmentModule } from './src/testAppointmentModule.js';

// Run comprehensive tests
await testAppointmentModule();
```

### 3. Using the Service Functions
```javascript
import { appointmentService } from './src/services/appointmentService.js';

// Create an appointment
const appointment = await appointmentService.createAppointment({
  clientFirstName: "John",
  clientLastName: "Doe",
  // ... other fields
});

// Get appointments for a branch
const appointments = await appointmentService.getAppointmentsByBranch("branch1");

// Update appointment status
await appointmentService.updateAppointmentStatus(appointmentId, "confirmed");

// Delete an appointment
await appointmentService.deleteAppointment(appointmentId);
```

## Real-time Features

The appointment module includes real-time updates using Firestore listeners:

```javascript
// Subscribe to appointment changes
const unsubscribe = appointmentService.subscribeToAppointments(
  branchId,
  (appointments) => {
    // Handle real-time updates
    setAppointments(appointments);
  },
  filters
);

// Cleanup listener
unsubscribe();
```

## UI Components

### ReceptionistDashboard
- Displays appointment statistics
- Shows today's schedule
- Quick action buttons
- Real-time data updates

### ReceptionistAppointments
- Comprehensive appointment listing
- Search and filtering capabilities
- Status management
- Bulk actions
- Real-time updates

### ReceptionistNewAppointment
- Multi-step appointment creation
- Client search and registration
- Service selection with categories
- Stylist assignment
- Time slot management
- Form validation

## Security

The module uses Firestore security rules to ensure data protection:

```javascript
// Example security rules
match /appointments/{appointmentId} {
  allow read, write: if request.auth != null;
}

match /clients/{clientId} {
  allow read, write: if request.auth != null;
}
```

## Error Handling

All service functions include comprehensive error handling:

```javascript
try {
  const appointment = await appointmentService.createAppointment(data);
  // Success
} catch (error) {
  console.error('Error creating appointment:', error);
  // Handle error appropriately
}
```

## Performance Considerations

- **Pagination**: Large appointment lists are paginated
- **Filtering**: Server-side filtering reduces data transfer
- **Caching**: Client-side caching for frequently accessed data
- **Real-time**: Efficient listeners with proper cleanup

## Future Enhancements

- **Email Notifications**: Send appointment confirmations
- **SMS Integration**: Text message reminders
- **Calendar Integration**: Sync with external calendars
- **Recurring Appointments**: Support for regular bookings
- **Waitlist Management**: Handle fully booked time slots
- **Analytics**: Appointment statistics and reporting

## Troubleshooting

### Common Issues

1. **Appointments not loading**: Check Firestore security rules
2. **Real-time updates not working**: Verify listener cleanup
3. **Time slots showing as unavailable**: Check appointment conflicts
4. **Client search not working**: Verify client data structure

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'appointment-module');
```

## Support

For issues or questions regarding the appointment module, please refer to the main project documentation or contact the development team.
