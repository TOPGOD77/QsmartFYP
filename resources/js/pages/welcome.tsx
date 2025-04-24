import React, { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, usePage } from '@inertiajs/react';
import { Users, CalendarDays, LayoutDashboard, Settings2, Quote} from 'lucide-react';

interface AuthUser {
  user: {
    name: string;
    email: string;
  } | null;
}

const buttonClass = "bg-[#007E85] hover:bg-[#00676d] text-white";

const Welcome = () => {
  const { auth } = usePage<{ auth: AuthUser }>().props;

  const [appointmentData, setAppointmentData] = useState({
    service: '',
    date: '',
    branch: ''
  });

  const handleSearch = () => {
    console.log(appointmentData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppointmentData({ ...appointmentData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
      </Head>

      <div className="flex flex-col min-h-screen bg-white text-gray-900">
        {/* Navbar */}
        <header className="w-full p-6 flex justify-between items-center shadow-md">
          <div className="text-2xl font-bold">Q<span className="text-primary">Smart</span></div>
          <nav className="space-x-4">
            {auth?.user ? (
              <Link href={route('dashboard')} className="text-sm font-medium hover:underline">Dashboard</Link>
            ) : (
              <>
                <Button asChild className={buttonClass}>
                <Link href={route('login')}>Log in</Link>
                </Button>
                <Button asChild className={buttonClass}>
                <Link href={route('register')}>Register</Link>
                </Button>
              </>
            )}
          </nav>
        </header>

         {/* Hero Section */}
         <section
          className="relative bg-cover bg-center py-36 px-6 text-left text-white"
          style={{ backgroundImage: "url('/image/landingpage-bg.jpg')" }}
        >
          <div className="absolute inset-0 "></div>
          <div className="relative z-10 max-w-4xl px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Effortless Appointment<br />
              Scheduling and Queue<br />
              Management
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl">
              Simplify your banking experience with Q-Smart. Manage your appointments and queues in real-time from anywhere!
            </p>
            <Button className={buttonClass}>Learn More</Button>
          </div>
        </section>

        {/* Appointment Search Box */}
        <section className="-mt-12 bg-white shadow-md rounded-lg mx-auto p-6 w-full max-w-4xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={appointmentData.service} onValueChange={(value) => setAppointmentData({ ...appointmentData, service: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation ">Consultation</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" name="date" value={appointmentData.date} onChange={handleInputChange} />
            <Input name="branch" value={appointmentData.branch} onChange={handleInputChange} placeholder="Branch Location" />
            <Button className={buttonClass} onClick={handleSearch}>Search</Button>
          </div>
        </section>

       {/* Features */}
       <section className="py-16 px-6 text-center bg-[#f8f9fa]">
          <h2 className="text-3xl font-semibold mb-12 text-[#007E85]">
          Why Choose Q-Smart?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Real-Time Queue Tracking', desc: 'Track your queue status in real time with up-to-date information.', icon: <Users className="mx-auto mb-4 h-10 w-10" /> },
              { title: 'Easy Appointment Scheduling', desc: 'Book and manage your appointments effortlessly.', icon: <CalendarDays className="mx-auto mb-4 h-10 w-10" /> },
              { title: 'User-Friendly Dashboard', desc: 'Intuitive interface to manage your bookings.', icon: <LayoutDashboard className="mx-auto mb-4 h-10 w-10" /> },
              { title: 'Feedback System', desc: 'Receive and give feedback to improve experiences.', icon: <Settings2 className="mx-auto mb-4 h-10 w-10" /> },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="bg-white shadow-md rounded-lg p-6">
                {icon}
                <h3 className="font-bold text-xl mb-2 text-[#007E85]">{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-[#f8f9fa] py-16 px-6">
          <h2 className="text-center text-3xl font-semibold mb-10 text-[#007E85]">What Our Customer Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'John Doe',
                review: 'A fantastic platform for managing appointments seamlessly!',
              },
              {
                name: 'Jane Smith',
                review: "The best queue management system I've used!",
              },
              {
                name: 'Ali Hassan',
                review: 'Convenient and simple, I love it!'
              }
            ].map(({ name, review }, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between border hover:shadow-lg transition-all duration-300">
                <Quote className="text-[#007E85] w-6 h-6 mb-4" />
                <p className="text-sm italic text-gray-700">“{review}”</p>
                <div className="mt-6 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{name}</span>
                  <span className="text-yellow-500 text-sm">★★★★★</span>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* Newsletter */}
        <section className="bg-[#f8f9fa] py-16 px-6">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-4">Subscribe to our newsletter</h2>
            <p className="mb-6">Stay updated with the latest news and features from Q-Smart.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Input placeholder="Enter your email" className="flex-1" />
              <Button className={buttonClass}>Subscribe</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Welcome;