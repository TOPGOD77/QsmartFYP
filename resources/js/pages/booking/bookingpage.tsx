import React, { useState } from 'react';
import { usePage, router, Head } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Briefcase, LogOut, ArrowLeft, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';

// Define the Props interface with the booking type
interface Booking {
  id: number;
}

interface Props {
  service?: string;
  date?: string;
  branch?: string;
  errors?: { slot?: string };
  booking?: Booking;
  auth: {
    user: {
      email: string;
    };
  };
}

interface PageProps {
  props: Props;
}

function BookingPage() {
  // 1) pull props (including errors)
  const { service = '', date = '', branch = '', errors = {}, booking, auth } = usePage().props as Props;

  // 2) seed state
  const [selectedService, setSelectedService] = useState(service);
  const [selectedBranch, setSelectedBranch] = useState(branch);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    date ? new Date(date) : null
  );
  const [selectedHour, setSelectedHour] = useState('');
  const [processing, setProcessing] = useState(false);

  // errors.slot will now be defined here
  const slotError = errors.slot;

  const hours = [
    '09:00AM', '09:30AM', '10:00AM', '10:30AM',
    '11:00AM', '11:30AM', '12:30PM', '02:00PM',
    '02:30PM', '03:00PM', '03:30PM', '04:00PM',
  ];

  // Handle booking submission
  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedHour) {
      alert('Please fill in all required fields');
      return;
    }

    // Format the time to ensure it's in the correct format (e.g., "09:00 AM")
    const formattedHour = selectedHour.replace(/(\d{2})(\d{2})([AP]M)/, '$1:$2 $3');

    // Set the branch to Bangi by default
    const branch = 'Bangi';

    // Format the date in YYYY-MM-DD format, ensuring it's in the local timezone
    const formattedDate = selectedDate.toLocaleDateString('en-CA'); // This gives YYYY-MM-DD format

    // Log the booking attempt with more details
    console.log('Booking attempt details:', {
      service: selectedService,
      date: formattedDate,
      hour: formattedHour,
      branch: branch,
      currentTime: new Date().toLocaleTimeString(),
      currentDate: new Date().toLocaleDateString()
    });

    setProcessing(true);

    router.post(
      route('booking.store'),
      {
        service: selectedService,
        branch: branch,
        date: formattedDate,
        hour: formattedHour,
      },
      {
        onSuccess: (page) => {
          console.log('Booking successful:', page);
          // The backend will handle the redirection
        },
        onError: (errors) => {
          console.error('Booking failed with errors:', {
            errors,
            requestData: {
              service: selectedService,
              date: formattedDate,
              hour: formattedHour,
              branch: branch
            }
          });
          
          // Display validation errors with more detail
          if (errors.time) {
            alert(`Time Error: ${Array.isArray(errors.time) ? errors.time[0] : errors.time}`);
          } else if (errors.slot) {
            alert(`Slot Error: ${Array.isArray(errors.slot) ? errors.slot[0] : errors.slot}`);
          } else if (errors.date) {
            alert(`Date Error: ${Array.isArray(errors.date) ? errors.date[0] : errors.date}`);
          } else if (errors.service) {
            alert(`Service Error: ${Array.isArray(errors.service) ? errors.service[0] : errors.service}`);
          } else if (errors.branch) {
            alert(`Branch Error: ${Array.isArray(errors.branch) ? errors.branch[0] : errors.branch}`);
          } else {
            // Log the full error object for debugging
            console.error('Full error object:', errors);
            alert('An error occurred while booking. Please try again.');
          }
        },
        onFinish: () => {
          setProcessing(false);
        }
      }
    );
  };

  return (
    <>
      <Head title="Book Appointment" />
      
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

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* Back Button */}
          <button 
            onClick={() => router.visit(route('dashboard'))}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-center mb-2">Book Your Appointment</h1>
              <p className="text-center text-teal-100">Schedule your visit with ease</p>
            </div>

            {/* Main Content */}
            <div className="p-8">
              {slotError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                  {slotError}
                </div>
              )}

              {/* Service / Branch / Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Service */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="w-5 h-5" />
                    <label className="font-medium">Select Service</label>
                  </div>
                  <select
                    className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={selectedService}
                    onChange={e => setSelectedService(e.target.value)}
                  >
                    <option value="">-- Choose a Service --</option>
                    <option value="Account Opening">Account Opening</option>
                    <option value="Loan Application">Loan Application</option>
                    <option value="Credit Card Services">Credit Card Services</option>
                    <option value="Customer Support & Inquiries">Customer Support & Inquiries</option>
                    <option value="Fixed Deposit Consultation">Fixed Deposit Consultation</option>
                  </select>
                </div>

                {/* Branch */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5" />
                    <label className="font-medium">Branch</label>
                  </div>
                  <input
                    type="text"
                    className="w-full border px-4 py-3 rounded-lg bg-gray-50"
                    value="Bangi"
                    readOnly
                  />
                </div>

                {/* Date */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5" />
                    <label className="font-medium">Pick a Date</label>
                  </div>
                  <div className="relative">
                    <DatePicker
                      selected={selectedDate}
                      onChange={d => setSelectedDate(d)}
                      placeholderText="Select a date"
                      className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      dateFormat="dd MMM yyyy"
                      minDate={new Date()}
                      maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
                      filterDate={date => {
                        const day = date.getDay();
                        return day !== 0 && day !== 6;
                      }}
                    />
                    <Calendar className="absolute right-3 top-3 text-gray-400" size={20} />
                  </div>
                </div>
              </div>

              {/* Hours Section */}
              <div className="mb-12">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-6 h-6 text-teal-600" />
                  <h2 className="text-2xl font-semibold text-gray-800">Available Time Slots</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {hours.map(hour => (
                    <button
                      key={hour}
                      className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-all ${
                        selectedHour === hour 
                          ? 'bg-teal-600 hover:bg-teal-700 scale-105' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedHour(hour)}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-6">
                <button
                  onClick={handleBooking}
                  disabled={processing}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Booking...
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>
                <button 
                  onClick={() => router.visit(route('dashboard'))}
                  className="bg-gray-100 text-gray-600 px-10 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Override any default layouts
BookingPage.layout = (page: React.ReactNode) => page;

export default BookingPage;
