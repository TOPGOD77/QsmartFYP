declare global {
    interface Window {
      Echo: any;
    }
  }
  
import { useEffect, useState } from 'react';
import { usePage, Head, router } from '@inertiajs/react';
import { Clock, Users, MapPin, Calendar, Briefcase, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReviewModal from './ReviewModal';

interface QueueProps {
  turnNumber: string;
  estimatedMins: number;
  estimatedWaitTime: string;
  service: string;
  branch: string;
  date: string;
  time: string;
  peopleAhead: number;
  currentTime: string;
  bookingTime: string;
  auth: {
    user: any;
  };
  isPastBooking: boolean;
  statusMessage: string;
  bookingId: number;
  hasReview: boolean;
  [key: string]: any;
}

const QueuePage = () => {
  const { turnNumber, estimatedWaitTime, service, branch, date, time, peopleAhead, auth, isPastBooking, statusMessage, bookingId, hasReview } = usePage<QueueProps>().props;

  const [ahead, setAhead] = useState(peopleAhead);
  const [wait, setWait] = useState(estimatedWaitTime);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const channel = window.Echo.channel(`queue.${branch}`);
    channel.listen('QueueUpdated', (e: any) => {
      if (e.turnNumber === turnNumber) {
        setAhead(e.ahead);
        setWait(e.estimatedWaitTime);
      }
    });
    return () => {
      channel.stopListening('QueueUpdated');
    };
  }, [branch, turnNumber]);

  // Format queue position message
  const getQueueMessage = () => {
    if (isPastBooking) {
      return null; // Don't show queue position for past bookings
    }
    if (ahead === 0) {
      return "You're next in line!";
    }
    return `${ahead} ${ahead === 1 ? 'person' : 'people'} ahead`;
  };

  const queueMessage = getQueueMessage();

  return (
    <>
      <Head title="Your Turn" />
      
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
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => router.visit(route('dashboard'))}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="text-sm text-gray-500">
              Current Time: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Status Banner */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 text-white">
              <h1 className="text-3xl font-bold text-center mb-2">Your Queue Status</h1>
              <p className="text-center text-teal-100">Real-time updates on your position</p>
            </div>

            {/* Queue Number */}
            <div className="p-8">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-8 rounded-xl shadow-lg w-full max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300">
                <p className="text-7xl font-extrabold text-center">{turnNumber}</p>
                <p className="text-center mt-2 text-blue-100">Your Queue Number</p>
              </div>

              {/* Wait Time or Status */}
              <div className="mt-8 bg-gray-50 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-6 h-6 text-teal-600" />
                  <span className="text-xl font-semibold text-gray-800">
                    {isPastBooking ? 'Appointment Status' : 'Estimated Wait Time'}
                  </span>
                </div>
                {isPastBooking ? (
                  <p className="text-3xl font-bold text-red-600">{statusMessage}</p>
                ) : (
                  <p className="text-3xl font-bold text-teal-600">{wait}</p>
                )}
              </div>

              {/* Queue Details */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Show statusMessage if set and not a past booking */}
                {(!isPastBooking && statusMessage) ? (
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Current Status</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{statusMessage}</p>
                  </div>
                ) : !isPastBooking && queueMessage && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-teal-600" />
                      <span className="font-semibold text-gray-800">Queue Position</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{queueMessage}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-gray-800">Service Type</span>
                  </div>
                  <p className="text-lg text-gray-700">{service}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-gray-800">Branch Location</span>
                  </div>
                  <p className="text-lg text-gray-700">{branch}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-gray-800">Appointment Time</span>
                  </div>
                  <p className="text-lg text-gray-700">{date} at {time}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => router.visit(route('dashboard'))}
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-teal-700 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              {isPastBooking 
                ? 'This appointment has already passed.' 
                : 'Your position will be updated automatically. Please wait for your turn.'}
            </p>
          </div>

          {isPastBooking && statusMessage === 'Appointment Completed' && !hasReview && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-teal-700 transition"
              >
                Leave a Review
              </button>
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        bookingId={bookingId}
        service={service}
        branch={branch}
        date={date}
      />
    </>
  );
}

export default QueuePage;
