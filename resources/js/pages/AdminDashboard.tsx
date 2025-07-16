import React, { useState } from 'react';
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
  MoreVertical,
  Loader2,
  BarChart2,
  ListChecks
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

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
      department?: string;
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
  totalBookings: number;
  todayDate: string;
  bookingsPaginator: {
    data: Booking[];
    current_page: number;
    last_page: number;
  };
  bookingTrends?: any[];
  servicePopularity?: any[];
  statusBreakdown?: any[];
  branchPerformance?: any[];
}

export default function AdminDashboard() {
  const { 
    auth, 
    groupedBookings, 
    dateStats, 
    totalBookings,
    todayDate,
    bookingsPaginator,
    bookingTrends = [],
    servicePopularity = [],
    statusBreakdown = [],
    branchPerformance = [],
  } = usePage<PageProps & {
    bookingTrends?: any[],
    servicePopularity?: any[],
    statusBreakdown?: any[],
    branchPerformance?: any[],
  }>().props;
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  // Single date filter
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, booking: Booking | null }>({ show: false, booking: null });
  const [editModal, setEditModal] = useState<{ show: boolean, booking: Booking | null }>({ show: false, booking: null });
  const [editForm, setEditForm] = useState({ service: '', date: '', time: '' });
  const [analyticsRange, setAnalyticsRange] = useState<{ start: string, end: string }>({
    start: '',
    end: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'analytics' | 'bookings'>('analytics');

  // Replace allBookings with paginated bookings
  const allBookings: Booking[] = bookingsPaginator.data;
  const currentPage = bookingsPaginator.current_page;
  const totalPages = bookingsPaginator.last_page;

  const { data, setData, post, processing } = useForm({
    status: '',
    notes: '',
  });

  // No updateStatus for admin for now (read-only)

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
  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch =
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesDate = !selectedDate || booking.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Animated number for stats
  const AnimatedNumber = ({ value, color }: { value: number, color: string }) => {
    const [display, setDisplay] = useState(0);
    React.useEffect(() => {
      let start = 0;
      const end = value;
      if (start === end) return;
      const increment = end > start ? 1 : -1;
      const stepTime = Math.abs(Math.floor(1000 / (end - start)));
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
    router.visit(route('admin.dashboard'), {
      method: 'get',
      data: params,
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleDeleteBooking = (booking: Booking) => {
    setDeleteConfirm({ show: true, booking });
  };

  const confirmDeleteBooking = () => {
    if (deleteConfirm.booking) {
      router.delete(route('admin.bookings.destroy', { booking: deleteConfirm.booking.id }), {
        onSuccess: () => setDeleteConfirm({ show: false, booking: null }),
        onError: () => setDeleteConfirm({ show: false, booking: null })
      });
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditForm({
      service: booking.service,
      date: booking.date,
      time: booking.time,
    });
    setEditModal({ show: true, booking });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitEditBooking = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('submitEditBooking called', editForm, editModal.booking);
    if (editModal.booking) {
      router.put(route('admin.bookings.update', { booking: editModal.booking.id }), {
        service: editForm.service,
        booking_date: editForm.date,
        booking_time: editForm.time,
      }, {
        onSuccess: () => setEditModal({ show: false, booking: null }),
        onError: (errors) => {
          alert('Failed to update booking. Please check your input.');
          console.error('Booking update error:', errors);
        },
      });
    }
  };

  const handleAnalyticsRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAnalyticsRange(prev => {
      const updated = { ...prev, [name]: value };
      // If both dates are set, trigger reload
      if (updated.start && updated.end) {
        router.visit(route('admin.dashboard'), {
          method: 'get',
          data: { analytics_start: updated.start, analytics_end: updated.end },
          preserveState: true,
          preserveScroll: true,
        });
      }
      return updated;
    });
  };

  // Enhanced filter bar
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setSelectedDate('');
    handleFilterChange({ search: '', status: null, date: '' });
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <span className="text-2xl font-bold text-teal-600">Q<span className="text-gray-900">Smart</span></span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left font-medium transition-colors ${sidebarTab === 'analytics' ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-100 text-gray-700'}`}
            onClick={() => setSidebarTab('analytics')}
          >
            <BarChart2 className="w-5 h-5" /> Analytics
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left font-medium transition-colors ${sidebarTab === 'bookings' ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-100 text-gray-700'}`}
            onClick={() => setSidebarTab('bookings')}
          >
            <ListChecks className="w-5 h-5" /> Bookings
          </button>
        </nav>
        <div className="border-t p-4 flex items-center gap-2">
          <User className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">{auth.user?.email}</span>
        </div>
        <div className="p-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.post(route('logout'))}
            className="w-full text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {sidebarTab === 'analytics' && (
          <>
            {/* Welcome Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {auth.user?.name}</h1>
              <p className="text-gray-600 mt-1">Role: Admin</p>
              <p className="text-gray-600 mt-1">Today's Date: {formatDate(todayDate)}</p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {renderStatsCard(
                "Total Bookings",
                totalBookings,
                <Calendar className="h-8 w-8 text-blue-200" />,
                "text-blue-200",
                "bg-gradient-to-br from-blue-500 to-blue-700"
              )}
              {renderStatsCard(
                "Today's Pending",
                dateStats[todayDate]?.pending || 0,
                <Clock className="h-8 w-8 text-yellow-200" />,
                "text-yellow-200",
                "bg-gradient-to-br from-yellow-400 to-yellow-600"
              )}
              {renderStatsCard(
                "Today's Completed",
                dateStats[todayDate]?.completed || 0,
                <CheckCircle2 className="h-8 w-8 text-green-200" />,
                "text-green-200",
                "bg-gradient-to-br from-green-500 to-green-700"
              )}
              {renderStatsCard(
                "Today's Missed",
                dateStats[todayDate]?.missed || 0,
                <XCircle className="h-8 w-8 text-red-200" />,
                "text-red-200",
                "bg-gradient-to-br from-red-500 to-red-700"
              )}
            </div>
            {/* Analytics Section */}
            <div className="my-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Analytics</h2>
              <div className="flex gap-4 mb-6 items-center">
                <label className="font-medium text-gray-700">Date Range:</label>
                <input
                  type="date"
                  name="start"
                  value={analyticsRange.start}
                  onChange={handleAnalyticsRangeChange}
                  className="border px-2 py-1 rounded"
                />
                <span className="mx-2">to</span>
                <input
                  type="date"
                  name="end"
                  value={analyticsRange.end}
                  onChange={handleAnalyticsRangeChange}
                  className="border px-2 py-1 rounded"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Booking Trends */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Booking Trends (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={bookingTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#007E85" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Service Popularity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Service Popularity</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={servicePopularity} dataKey="count" nameKey="service" cx="50%" cy="50%" outerRadius={80} label>
                        {servicePopularity.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={["#007E85", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"][idx % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Status Breakdown */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                        {statusBreakdown.map((entry, idx) => (
                          <Cell key={`cell-status-${idx}`} fill={["#007E85", "#FFBB28", "#FF8042", "#8884d8"][idx % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Branch Performance */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Branch Performance</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={branchPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branch" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#007E85" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
        {sidebarTab === 'bookings' && (
          <>
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
                  onChange={e => {
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
                  onChange={e => {
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
                  onChange={e => {
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
                              <span className="text-xs text-gray-400 mr-2">#{booking.id}</span>
                              <User className="h-5 w-5 text-gray-400 mr-2" />
                              <p className="text-sm font-medium text-teal-600 truncate">
                                {booking.customer.name}
                              </p>
                              <span className="ml-2 text-xs text-gray-500">{booking.customer.email}</span>
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
                            <div className="flex items-center">
                              <span className="font-semibold text-gray-400 mr-1">Notes:</span>
                              <span className="truncate max-w-xs" title={booking.notes}>{booking.notes ? (booking.notes.length > 30 ? booking.notes.slice(0, 30) + '…' : booking.notes) : <span className="italic text-gray-300">No notes</span>}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteBooking(booking)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            {/* Booking Details Modal */}
            {selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                    onClick={() => setSelectedBooking(null)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h2 className="text-xl font-bold mb-4 text-teal-700">Booking Details</h2>
                  <div className="space-y-2">
                    <div><span className="font-semibold">Customer:</span> {selectedBooking.customer.name} ({selectedBooking.customer.email})</div>
                    <div><span className="font-semibold">Service:</span> {selectedBooking.service}</div>
                    <div><span className="font-semibold">Branch:</span> {selectedBooking.branch}</div>
                    <div><span className="font-semibold">Date:</span> {formatDate(selectedBooking.date)}</div>
                    <div><span className="font-semibold">Time:</span> {selectedBooking.time}</div>
                    <div><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedBooking.status)}`}>{selectedBooking.status.replace('_', ' ').toUpperCase()}</span></div>
                    <div><span className="font-semibold">Notes:</span> {selectedBooking.notes || <span className="italic text-gray-400">No notes</span>}</div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {deleteConfirm.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg relative">
                  <h2 className="text-xl font-bold mb-4 text-red-700">Confirm Delete</h2>
                  <p>Are you sure you want to delete this booking?</p>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeleteConfirm({ show: false, booking: null })}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmDeleteBooking}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {editModal.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg relative">
                  <h2 className="text-xl font-bold mb-4 text-blue-700">Edit Booking</h2>
                  <form onSubmit={submitEditBooking} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                      <Select
                        value={editForm.service}
                        onValueChange={value => setEditForm({ ...editForm, service: value })}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditFormChange}
                        className="w-full border px-3 py-2 rounded-md"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <select
                        name="time"
                        value={editForm.time}
                        onChange={handleEditFormChange}
                        className="w-full border px-3 py-2 rounded-md"
                        required
                      >
                        <option value="">Select Time</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="09:30">09:30 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="12:30">12:30 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="14:30">02:30 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="15:30">03:30 PM</option>
                        <option value="16:00">04:00 PM</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setEditModal({ show: false, booking: null })} type="button">
                        Cancel
                      </Button>
                      <Button variant="secondary" type="submit">
                        Save
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 