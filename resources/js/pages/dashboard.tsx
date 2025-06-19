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
  User
} from 'lucide-react';

interface AuthUser {
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function Dashboard() {
  const { auth, upcomingAppointments } = usePage<{ 
    auth: AuthUser;
    upcomingAppointments: Array<{
      id: number;
      service: string;
      date: string;
      time: string;
      branch: string;
      status: string;
    }>;
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
    router.get(route('booking'), {
      service: appointmentData.service,
      date:    appointmentData.date,
      branch:  appointmentData.branch,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppointmentData({ ...appointmentData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Head title="Dashboard" />
      
      {/* Header/Navigation */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-teal-600">Q<span className="text-gray-900">Smart</span></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{auth.user?.email}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.post(route('logout'))}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gray-50">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {auth.user?.name}!</h1>
                <p className="mt-2 text-teal-100">Here's what's happening today</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-teal-100">Current Time</p>
                  <p className="text-lg font-semibold">{formatTime(currentTime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Quick Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" />
              Quick Appointment Search
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

          {/* Quick Actions and Upcoming Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-teal-50"
                  onClick={() => router.visit(route('booking'))}
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-teal-600" />
                    <span>New Appointment</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-teal-50"
                  onClick={() => router.visit(route('booking.history'))}
                >
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-teal-600" />
                    <span>Booking History</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-teal-50"
                  onClick={() => router.visit(route('profile.edit'))}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    <span>Edit Profile</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Button>
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
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 hover:text-teal-700"
                          onClick={() => router.visit(route('queue.show', { id: appointment.id }))}
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
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
        </div>
      </div>
    </>
  );
}
