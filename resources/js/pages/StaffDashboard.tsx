import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '../components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  LogOut,
  Briefcase,
  Filter,
  Search,
  User,
  Loader2
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

interface Booking {
  id: number;
  customer: {
    name: string;
    email: string;
  };
  service: string;
  date: string;
  time: string;
  branch: string;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  notes: string;
}

interface PageProps extends InertiaPageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      department: string;
    };
  };
  groupedBookings: {
    [date: string]: Booking[];
  };
  dateStats: {
    [date: string]: {
      total: number;
      pending: number;
      in_progress: number;
      completed: number;
      missed: number;
    };
  };
  department: string;
  totalBookings: number;
  todayDate: string;
  bookingsPaginator: {
    data: Booking[];
    current_page: number;
    last_page: number;
  };
  totalStats: {
    total: number;
    pending: number;
    completed: number;
    missed: number;
  };
}

export default function StaffDashboard() {
  const { 
    auth, 
    groupedBookings, 
    dateStats, 
    department, 
    totalBookings,
    todayDate,
    bookingsPaginator,
    totalStats
  } = usePage<PageProps>().props;
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('date') || todayDate;
  });
  const [bookings, setBookings] = useState(bookingsPaginator.data);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noteEdit, setNoteEdit] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // Pagination variables
  const currentPage = bookingsPaginator.current_page;
  const totalPages = bookingsPaginator.last_page;

  // WebSocket connection
  useEffect(() => {
    const channel = window.Echo.channel('staff-dashboard');
    
    channel.listen('BookingStatusUpdated', (e: any) => {
      // Update the booking in the list
      setBookings(currentBookings => 
        currentBookings.map(booking => 
          booking.id === e.id ? {
            ...booking,
            status: e.status,
            notes: e.notes
          } : booking
        )
      );

      // Add notification
      const notification = {
        id: Date.now(),
        message: `Booking #${e.id} status updated to ${e.status}`,
        type: 'info' as const,
        timestamp: new Date()
      };
      setNotifications(current => [...current, notification]);

      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(current => 
          current.filter(n => n.id !== notification.id)
        );
      }, 5000);
    });

    return () => {
      channel.stopListening('BookingStatusUpdated');
    };
  }, []);

  // Sync bookings state with paginator data after filtering or pagination
  useEffect(() => {
    setBookings(bookingsPaginator.data);
  }, [bookingsPaginator.data]);

  // Sync filter state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get('search') || '');
    setStatusFilter(params.get('status') || null);
    const urlDate = params.get('date');
    if (!urlDate) {
      setSelectedDate(todayDate);
      // Update the URL to include today's date
      handleFilterChange({ date: todayDate });
    } else {
      setSelectedDate(urlDate);
    }
  }, [window.location.search, todayDate]);

  const updateStatus = (booking: Booking, newStatus: string) => {
    router.post(route('staff.bookings.update-status', { booking: booking.id }), {
      status: newStatus,
      notes: ''
    }, {
      preserveScroll: true,
      onSuccess: (response) => {
        // Show success notification
        const notification = {
          id: Date.now(),
          message: `Booking #${booking.id} status updated successfully`,
          type: 'success' as const,
          timestamp: new Date()
        };
        setNotifications(current => [...current, notification]);

        // Remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(current => 
            current.filter(n => n.id !== notification.id)
          );
        }, 5000);
      },
      onError: () => {
        // Show error notification
        const notification = {
          id: Date.now(),
          message: `Failed to update booking #${booking.id}`,
          type: 'error' as const,
          timestamp: new Date()
        };
        setNotifications(current => [...current, notification]);

        // Remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(current => 
            current.filter(n => n.id !== notification.id)
          );
        }, 5000);
      }
    });
  };

  // Add this function to handle note save
  const handleSaveNote = (booking: Booking) => {
    setNoteSaving(true);
    router.post(route('staff.bookings.update-notes', { booking: booking.id }), {
      notes: noteEdit,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setBookings(current =>
          current.map(b =>
            b.id === booking.id ? { ...b, notes: noteEdit } : b
          )
        );
        setSelectedBooking({ ...booking, notes: noteEdit });
        setNoteSaving(false);
      },
      onError: () => setNoteSaving(false),
    });
  };

  // Notification component
  const NotificationList = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            notification.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white`}
        >
          <p className="text-sm font-medium">{notification.message}</p>
          <p className="text-xs opacity-75">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter bookings by search, status, and single date
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesDate = !selectedDate || booking.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Animate numbers for stats
  const AnimatedNumber = ({ value, color }: { value: number, color: string }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = value;
      if (start === end) return;
      let increment = end > start ? 1 : -1;
      let stepTime = Math.abs(Math.floor(1000 / (end - start)));
      const timer = setInterval(() => {
        start += increment;
        setDisplay(start);
        if (start === end) clearInterval(timer);
      }, stepTime);
      return () => clearInterval(timer);
    }, [value]);
    return <span className={`text-2xl font-bold ${color}`}>{display}</span>;
  };

  // Enhanced stats card
  const renderStatsCard = (title: string, value: number, icon: React.ReactNode, color: string, gradient: string) => (
    <div className={`rounded-xl shadow-lg p-6 flex items-center gap-4 ${gradient}`} style={{ minHeight: 110 }}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-gray-100 text-sm font-medium mb-1">{title}</h3>
        <AnimatedNumber value={value} color={color} />
      </div>
    </div>
  );

  // Enhanced status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold"><Clock className="w-3 h-3" /> Pending</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold"><Loader2 className="w-3 h-3 animate-spin" /> In Progress</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'missed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold"><XCircle className="w-3 h-3" /> Missed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">Unknown</span>;
    }
  };

  // Enhanced filter bar
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setSelectedDate('');
    handleFilterChange({ search: '', status: null, date: '' });
  };

  const handleFilterChange = (newFilters = {}) => {
    const params: { [key: string]: any } = {
      search: searchTerm,
      status: statusFilter,
      date: selectedDate,
      ...newFilters,
    };
    // Remove empty params
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });
    router.visit(route('staff.dashboard'), {
      method: 'get',
      data: params,
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Helper to build query string with all filters and page
  const buildQueryString = (page: number) => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);
    if (selectedDate) params.append('date', selectedDate);
    params.append('page', String(page));
    return `?${params.toString()}`;
  };

  return (
    <>
      <Head title="Staff Dashboard" />
      <NotificationList />
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-teal-600">Q<span className="text-gray-900">Smart</span></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{auth.user?.email}</span>
              </div>
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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {auth.user?.name}</h1>
            <p className="text-gray-600 mt-1">Department: {department}</p>
            <p className="text-gray-600 mt-1">Today's Date: {formatDate(todayDate)}</p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {renderStatsCard(
              "Total Bookings",
              totalStats.total,
              <Calendar className="h-8 w-8 text-blue-200" />,
              "text-blue-200",
              "bg-gradient-to-br from-blue-500 to-blue-700"
            )}
            {renderStatsCard(
              "Pending Bookings",
              totalStats.pending,
              <Clock className="h-8 w-8 text-yellow-200" />,
              "text-yellow-200",
              "bg-gradient-to-br from-yellow-400 to-yellow-600"
            )}
            {renderStatsCard(
              "Completed Bookings",
              totalStats.completed,
              <CheckCircle2 className="h-8 w-8 text-green-200" />,
              "text-green-200",
              "bg-gradient-to-br from-green-500 to-green-700"
            )}
            {renderStatsCard(
              "Missed Bookings",
              totalStats.missed,
              <XCircle className="h-8 w-8 text-red-200" />,
              "text-red-200",
              "bg-gradient-to-br from-red-500 to-red-700"
            )}
          </div>
          {/* Enhanced Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6 space-y-2 sm:space-y-0 bg-white rounded-xl shadow p-4">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange({ search: e.target.value });
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm rounded-full bg-gray-50"
                value={statusFilter || ''}
                onChange={(e) => {
                  setStatusFilter(e.target.value || null);
                  handleFilterChange({ status: e.target.value || null });
                }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
              <span className="text-gray-500 text-sm">Date</span>
              <input
                type="date"
                className="block w-full border border-gray-200 rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm bg-gray-50"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  handleFilterChange({ date: e.target.value });
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 ml-2"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
          {/* Flat Bookings List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-xl">
            <div className="border-t border-gray-200">
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-teal-500" />
                </div>
              )}
              <ul className="divide-y divide-gray-100">
                {filteredBookings.map((booking, idx) => (
                  <li
                    key={booking.id}
                    className={`px-4 py-4 sm:px-6 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-teal-50 rounded-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-sm font-medium text-teal-600 truncate">
                              {booking.customer.name}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 gap-4">
                          <div className="flex items-center">
                            <Briefcase className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{booking.service}</p>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{booking.branch}</p>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{formatDate(booking.date)}</p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>{booking.time}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.visit(route('staff.booking.manage', { booking: booking.id }))}
                          className="text-gray-600 hover:text-gray-900 rounded-full border border-gray-300"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
                {filteredBookings.length === 0 && !isLoading && (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-400">
                    No bookings found matching your criteria
                  </li>
                )}
              </ul>
            </div>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => router.visit(buildQueryString(currentPage - 1))}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => router.visit(buildQueryString(page))}
                className={page === currentPage ? 'font-bold' : ''}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => router.visit(buildQueryString(currentPage + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 