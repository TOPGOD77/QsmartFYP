import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
  Users, 
  CalendarDays, 
  History, 
  Settings2, 
  Search, 
  Clock,
  MapPin,
  Briefcase,
  Bell,
  ChevronRight,
  LogOut,
  User,
  CreditCard,
  LayoutDashboard
} from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';

interface AuthUser {
  user: {
    id: number;
    name: string;
    email: string;
    department?: string; // Added department to interface
  } | null;
}

export default function Dashboard() {
  const { auth, upcomingAppointments, currentQueues } = usePage<{
    auth: AuthUser;
    upcomingAppointments: Array<{
      id: number;
      service: string;
      date: string;
      time: string;
      branch: string;
      status: string;
    }>;
    currentQueues: Record<string, { code: string; queue_number: string | null }>;
  }>().props;

  const [appointmentData, setAppointmentData] = useState({
    service: '',
    date: '',
    branch: '',
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time function
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleSearch = () => {
    const date = new Date(appointmentData.date);
    const day = date.getDay();
    if (day === 0 || day === 6) {
      alert('Booking on Saturday and Sunday is not allowed.');
      return;
    }
    router.get(route('booking'), {
      service: appointmentData.service,
      date:    appointmentData.date,
      branch:  appointmentData.branch,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppointmentData({ ...appointmentData, [e.target.name]: e.target.value });
  };

  // Service list for customers
  const allServices = [
    "Account Opening",
    "Loan Application",
    "Credit Card Services",
    "Customer Support & Inquiries",
    "Fixed Deposit Consultation",
  ];

  // Office hour slots (30-min steps, 09:00–12:30, 14:00–16:00)
  const officeHourSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ];

  // Get user info and department
  const user = auth.user;
  const userDepartment = user && user.department ? user.department : null;
  const isStaff = !!userDepartment;
  const availableServices = isStaff ? [userDepartment] : allServices;

  return (
    <>
      <Head title="Dashboard" />
      
      {/* Header/Navigation */}
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-lg py-8 px-4 space-y-6">
          <div className="text-2xl font-bold text-teal-600 mb-8">
            Q<span className="text-gray-900">Smart</span>
          </div>
          <nav className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start" onClick={() => router.visit('/dashboard')}>
              <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => router.visit('/booking')}>
              <CalendarDays className="w-5 h-5 mr-2" /> Book Appointment
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => router.visit('/booking/history')}>
              <History className="w-5 h-5 mr-2" /> Booking History
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => router.visit('/profile')}>
              <Settings2 className="w-5 h-5 mr-2" /> Settings
            </Button>
            <div className="border-t border-gray-200 my-6" />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start text-blue-600 border-blue-200 w-full">
                  Request Edit to Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Edit to Admin</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to request a booking edit from the admin. All fields are required and only office hours/weekday slots are allowed.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const bookingId = (form.elements.namedItem('bookingId') as HTMLSelectElement).value;
                    const newService = (form.elements.namedItem('newService') as HTMLSelectElement).value;
                    const newDate = (form.elements.namedItem('newDate') as HTMLInputElement).value;
                    const newTime = (form.elements.namedItem('newTime') as HTMLSelectElement).value;
                    const reason = (form.elements.namedItem('reason') as HTMLInputElement).value;
                    router.post(route('booking.requestEdit'), {
                      bookingId,
                      newService,
                      newDate,
                      newTime,
                      reason,
                    }, {
                      onSuccess: () => {
                        // Optionally close the dialog or show a success message
                        alert('Your edit request has been sent to the admin.');
                      }
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Booking</label>
                    <select name="bookingId" className="w-full border rounded p-2">
                      {upcomingAppointments.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.service} - {b.date} {b.time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Service</label>
                    <select name="newService" className="w-full border rounded p-2">
                      {availableServices.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Date</label>
                    <input
                      name="newDate"
                      type="date"
                      className="w-full border rounded p-2"
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]}
                      onInput={e => {
                        // Block weekends
                        const input = e.target as HTMLInputElement;
                        const date = new Date(input.value);
                        if (date.getDay() === 0 || date.getDay() === 6) {
                          input.setCustomValidity('Please select a weekday (Mon-Fri).');
                        } else {
                          input.setCustomValidity('');
                        }
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Time</label>
                    <select name="newTime" className="w-full border rounded p-2">
                      {officeHourSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason for Edit</label>
                    <input name="reason" className="w-full border rounded p-2" placeholder="Enter reason" required />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" variant="default">Send Request</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" className="justify-start text-red-600 mt-8" onClick={() => router.post(route('logout'))}>
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </Button>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {auth.user?.name}!</h1>
                <p className="mt-1 text-teal-100">Here's what's happening today</p>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="bg-white/10 rounded-lg p-3">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-teal-100">Current Time</p>
                  <p className="text-lg font-semibold">{formatTime(currentTime)}</p>
                </div>
              </div>
            </div>
            {/* --- Current Queue Numbers (Enhanced Card Style) --- */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-teal-700">Current Queue Numbers (Today)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(currentQueues || {}).map(([service, info]) => {
                  // Choose an icon and color for each service
                  let icon = null;
                  let bg = "bg-gradient-to-br from-teal-400 to-teal-600";
                  let iconColor = "text-white";
                  if (service === "Account Opening") {
                    icon = <User className={`w-8 h-8 ${iconColor}`} />;
                    bg = "bg-gradient-to-br from-blue-400 to-blue-600";
                  } else if (service === "Loan Application") {
                    icon = <Briefcase className={`w-8 h-8 ${iconColor}`} />;
                    bg = "bg-gradient-to-br from-green-400 to-green-600";
                  } else if (service === "Credit Card Services") {
                    icon = <CreditCard className={`w-8 h-8 ${iconColor}`} />;
                    bg = "bg-gradient-to-br from-pink-400 to-pink-600";
                  } else if (service === "Customer Support & Inquiries") {
                    icon = <Bell className={`w-8 h-8 ${iconColor}`} />;
                    bg = "bg-gradient-to-br from-yellow-400 to-yellow-600";
                  } else if (service === "Fixed Deposit Consultation") {
                    icon = <CalendarDays className={`w-8 h-8 ${iconColor}`} />;
                    bg = "bg-gradient-to-br from-purple-400 to-purple-600";
                  }
                  return (
                    <div
                      key={service}
                      className={`rounded-xl shadow p-6 flex flex-col items-center border border-teal-100 transition-transform hover:scale-105 ${bg}`}
                    >
                      <div className="mb-2">{icon}</div>
                      <div className="text-sm text-white mb-2 font-medium">{service}</div>
                      <div className="text-4xl font-extrabold text-white mb-1 drop-shadow">
                        {info.queue_number ?? <span className="text-teal-100 text-lg">No queue yet</span>}
                      </div>
                      <div className="text-xs text-teal-100">Code: {info.code}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Search */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-teal-600" />
                Quick Booking Appointment Search
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Service
                  </label>
                  <Select
                    value={appointmentData.service}
                    onValueChange={(value) => setAppointmentData({ ...appointmentData, service: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Account Opening">Account Opening</SelectItem>
                      <SelectItem value="Loan Application">Loan Application</SelectItem>
                      <SelectItem value="Credit Card Services">Credit Card Services</SelectItem>
                      <SelectItem value="Customer Support & Inquiries">Customer Support & Inquiries</SelectItem>
                      <SelectItem value="Fixed Deposit Consultation">Fixed Deposit Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Date
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={appointmentData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Branch
                  </label>
                  <input
                    type="text"
                    className="w-full border px-4 py-3 rounded-lg bg-gray-50"
                    value="Bangi"
                    readOnly
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleSearch}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.visit(route('booking.history'))}
                  className="text-teal-600 hover:text-teal-700"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-teal-600">
                            {appointment.service}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4" />
                              {appointment.date} at {appointment.time}
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {appointment.branch} Branch
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {appointment.status}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 hover:text-teal-700"
                          onClick={() => router.visit(route('queue.show', { id: appointment.id }))}
                        >
                          View Details
                          <ChevronRight className="w-5 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
                    <p className="text-gray-500 mb-4">You don't have any upcoming appointments scheduled.</p>
                    <Button
                      onClick={() => router.visit(route('booking'))}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Book an Appointment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
