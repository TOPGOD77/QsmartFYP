import { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function bookingpage() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');

  const hours = [
    '09:00AM', '09:30AM', '10:00AM',
    '10:30AM', '11:00AM', '11:30AM',
    '12:30AM', '02:00PM', '02:30PM',
    '03:00PM', '03:30PM', '04:00PM'
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold">BOOK YOUR APPOINTMENT</h1>
        <p className="text-gray-400 mt-1">Please fill up the blank fields below</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
  {/* Select Service */}
  <div className="flex flex-col text-left">
    <label className="mb-1 font-medium text-gray-700">Select services</label>
    <select
      className="border border-gray-300 px-4 py-2 rounded-md text-gray-700"
      value={selectedService}
      onChange={(e) => setSelectedService(e.target.value)}
    >
      <option>Services</option>
      {/* Add actual service options */}
    </select>
  </div>

  {/* Select Branch */}
  <div className="flex flex-col text-left">
    <label className="mb-1 font-medium text-gray-700">Select branch</label>
    <select
      className="border border-gray-300 px-4 py-2 rounded-md text-gray-700"
      value={selectedBranch}
      onChange={(e) => setSelectedBranch(e.target.value)}
    >
      <option>Services</option>
      {/* Add actual branch options */}
    </select>
  </div>

  {/* Select Date */}
  <div className="flex flex-col text-left">
    <label className="mb-1 font-medium text-gray-700">Pick a Date</label>
    <div className="relative">
      <input
        type="text"
        placeholder="20 Jan - 22 Jan"
        className="border border-gray-300 px-4 py-2 rounded-md w-full pr-10 text-gray-700"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
    </div>
  </div>
</div>


        <h2 className="mt-8 mb-4 font-semibold">Select Hour</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
          {hours.map((hour, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-md w-24 text-white font-semibold ${
                selectedHour === hour ? 'bg-[#007E85]' : 'bg-teal-700'
              }`}
              onClick={() => setSelectedHour(hour)}
            >
              {hour}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button className="bg-[#007E85] text-white px-8 py-2 rounded-md font-semibold hover:bg-teal-800">
            Book Now
          </button>
          <button className="bg-gray-100 text-gray-400 px-8 py-2 rounded-md font-semibold cursor-not-allowed">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
