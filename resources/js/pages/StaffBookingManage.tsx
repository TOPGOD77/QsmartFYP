import React, { useState } from 'react';
import { usePage, router, Head } from '@inertiajs/react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, User, Briefcase, MapPin, Calendar, Clock } from 'lucide-react';

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

interface PageProps {
  booking: Booking;
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      department: string;
    };
  };
  success?: string;
  [key: string]: any;
}

export default function StaffBookingManage() {
  const { booking, auth, success } = usePage<PageProps>().props;
  const [noteEdit, setNoteEdit] = useState(booking.notes || '');
  const [noteSaving, setNoteSaving] = useState(false);
  const [status, setStatus] = useState<Booking['status']>(booking.status);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'missed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Missed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSaveNote = () => {
    setNoteSaving(true);
    router.post(route('staff.bookings.update-notes', { booking: booking.id }), {
      notes: noteEdit,
    }, {
      preserveScroll: true,
      onSuccess: () => setNoteSaving(false),
      onError: () => setNoteSaving(false),
    });
  };

  const updateStatus = (newStatus: Booking['status']) => {
    router.post(route('staff.bookings.update-status', { booking: booking.id }), {
      status: newStatus,
      notes: noteEdit,
    }, {
      preserveScroll: true,
      onSuccess: () => setStatus(newStatus),
    });
  };

  return (
    <>
      <Head title={`Manage Booking #${booking.id}`} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <Button
            variant="ghost"
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-teal-700"
            onClick={() => router.visit(route('staff.dashboard'))}
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Button>
          {success && (
            <Alert variant="default" className="mb-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="relative">
            {/* Top colored bar */}
            <div className="absolute -top-4 left-0 w-full h-3 rounded-t-xl bg-gradient-to-r from-teal-500 to-blue-400" />
            <Card className="pt-8 pb-8 px-10 shadow-2xl rounded-2xl border border-gray-200 bg-white min-h-[480px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-gray-900">Manage Booking</CardTitle>
                <div className="flex gap-2 mt-2">{getStatusBadge(status)}</div>
              </CardHeader>
              <CardContent className="space-y-6 mt-2">
                <div className="grid grid-cols-1 gap-4 text-lg">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-5 h-5" />
                    <Label className="text-base">Customer:</Label>
                    <span className="font-semibold uppercase tracking-wide">{booking.customer.name}</span>
                    <span className="text-xs text-gray-500">({booking.customer.email})</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="w-5 h-5" />
                    <Label className="text-base">Service:</Label>
                    <span>{booking.service}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5" />
                    <Label className="text-base">Branch:</Label>
                    <span>{booking.branch}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5" />
                    <Label className="text-base">Date:</Label>
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5" />
                    <Label className="text-base">Time:</Label>
                    <span>{new Date(booking.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="notes" className="text-base">Notes:</Label>
                  <textarea
                    id="notes"
                    className="w-full border rounded-lg p-3 text-base mt-1 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-gray-50 min-h-[80px]"
                    rows={3}
                    value={noteEdit}
                    onChange={e => setNoteEdit(e.target.value)}
                    placeholder="Add a note..."
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={noteSaving}
                    >
                      {noteSaving ? 'Saving...' : 'Save Note'}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 mt-4">
                {status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => updateStatus('in_progress')}
                    className="text-blue-600 hover:text-blue-800 border border-blue-200"
                  >
                    Start Service
                  </Button>
                )}
                {status === 'in_progress' && (
                  <Button
                    variant="outline"
                    onClick={() => updateStatus('completed')}
                    className="text-green-600 hover:text-green-800 border border-green-200"
                  >
                    Complete
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 