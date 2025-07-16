import React from 'react';
import { Head } from '@inertiajs/react';
import { Bar } from 'react-chartjs-2';

interface BookingPerDay {
  date: string;
  count: number;
}

interface AdminDashboardProps {
  bookingsPerDay: BookingPerDay[];
}

export default function AdminDashboard({ bookingsPerDay }: AdminDashboardProps) {
  const labels = bookingsPerDay.map(item => item.date);
  const data = {
    labels,
    datasets: [
      {
        label: 'Bookings per Day',
        data: bookingsPerDay.map(item => item.count),
        backgroundColor: '#14b8a6',
      },
    ],
  };

  return (
    <>
      <Head title="Admin Dashboard" />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Bookings in the Last 7 Days</h2>
          <Bar data={data} />
        </div>
      </div>
    </>
  );
}
