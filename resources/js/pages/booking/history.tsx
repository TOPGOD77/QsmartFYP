import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Filter, ChevronLeft, ChevronRight, CalendarDays, MapPin, LogOut, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BookingHistoryProps {
  bookings: {
    id: number;
    service: string;
    date: string;
    time: string;
    branch: string;
    status: string;
    statusClass: string;
  }[];
  currentPage: number;
  totalPages: number;
  auth: {
    user: {
      email: string;
    };
  };
  selectedStatus?: string;
  selectedDate?: string;
  sortOrder: string;
}

export default function BookingHistory({ 
  bookings = [], 
  currentPage = 1, 
  totalPages = 1, 
  auth, 
  selectedStatus = '', 
  selectedDate = '',
  sortOrder = 'desc' 
}: BookingHistoryProps) {
  const [statusFilter, setStatusFilter] = useState(selectedStatus);
  const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
  const [dateFilter, setDateFilter] = useState<Date | null>(selectedDate ? new Date(selectedDate) : null);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePageChange = (page: number) => {
    router.get(route('booking.history', { page }), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    router.get(route('booking.history'), { 
      status: e.target.value,
      selected_date: dateFilter ? dateFilter.toISOString().split('T')[0] : '',
      sort_order: currentSortOrder
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSortOrderChange = () => {
    const newSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
    setCurrentSortOrder(newSortOrder);
    router.get(route('booking.history'), { 
      status: statusFilter,
      selected_date: dateFilter ? dateFilter.toISOString().split('T')[0] : '',
      sort_order: newSortOrder 
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleDateChange = (date: Date | null) => {
    setDateFilter(date);
    router.get(route('booking.history'), { 
      status: statusFilter,
      selected_date: date ? date.toISOString().split('T')[0] : '',
      sort_order: currentSortOrder
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearDateFilter = () => {
    setDateFilter(null);
    router.get(route('booking.history'), { 
      status: statusFilter,
      sort_order: currentSortOrder
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head title="Booking History" />

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href={route('dashboard')} className="text-2xl font-bold">
                Q<span className="text-[#007E85]">Smart</span>
              </Link>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section with Success Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-full bg-[#007E85]/10 p-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#007E85]" />
          </div>
          <h1 className="text-2xl font-bold text-center">BOOKING HISTORY</h1>
        </div>

        {/* Pagination, Filter and Sort */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pages.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`h-8 w-8 p-0 ${
                  currentPage === page ? "bg-[#007E85] hover:bg-[#007E85]/90" : ""
                }`}
              >
                {page}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="block border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
            </select>

            <div className="relative">
              <DatePicker
                selected={dateFilter}
                onChange={handleDateChange}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select Date"
                className="block border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                isClearable
              />
              {dateFilter && (
                <button
                  onClick={clearDateFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSortOrderChange}
              className="gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort by Date {currentSortOrder === 'desc' ? '(Newest)' : '(Oldest)'}
            </Button>
          </div>
        </div>

        {/* Booking List */}
        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-[#007E85]">
                      {booking.service}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.statusClass}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-gray-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {booking.date}, {booking.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {booking.branch} Branch
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.visit(route('queue.show', { booking: booking.id }))}
                      className="text-[#007E85] hover:text-[#007E85]/80"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">You haven't made any bookings yet.</p>
              <Button
                onClick={() => router.visit(route('booking'))}
                className="mt-4 bg-[#007E85] hover:bg-[#007E85]/90 text-white"
              >
                Make a Booking
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 