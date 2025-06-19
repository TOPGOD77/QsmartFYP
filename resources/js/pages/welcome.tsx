// resources/js/Pages/Welcome.jsx

import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  CalendarDays, 
  LayoutDashboard, 
  Settings2, 
  Quote, 
  LogOut,
  Search,
  ChevronRight,
  Clock,
  Shield,
  Smartphone,
  MapPin
} from 'lucide-react';

const buttonClass = 'bg-[#007E85] hover:bg-[#00676d] text-white transition-all duration-300 transform hover:scale-105';

const Welcome = () => {
  const { auth } = usePage().props;

  const [appointmentData, setAppointmentData] = useState({
    service: '',
    date: '',
    branch: '',
  });

  const handleSearch = () => {
    router.visit('/booking', {
      method: 'get',
      data: {
        service: appointmentData.service,
        date:    appointmentData.date,
        branch:  appointmentData.branch,
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppointmentData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <div className="flex flex-col min-h-screen bg-white text-gray-900">
        {/* Header */}
        <header className="w-full p-6 flex justify-between items-center shadow-md bg-white sticky top-0 z-50">
          <div className="text-2xl font-bold">
            Q<span className="text-primary">Smart</span>
          </div>
          <nav className="space-x-4">
            {auth?.user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{auth.user.email}</span>
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
          className="relative bg-cover bg-center py-36 px-6 text-left text-white overflow-hidden"
          style={{ backgroundImage: "url('/image/landingpage-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-4xl px-4 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-slide-up">
              Effortless Appointment
              <br />
              Scheduling and Queue
              <br />
              Management
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl text-gray-100 animate-slide-up-delay">
              Simplify your banking experience with Q-Smart. Manage your
              appointments and queues in real-time from anywhere!
            </p>
            <Button className={buttonClass + " animate-bounce-subtle"}>
              Learn More
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Appointment Search Box */}
        <section className="-mt-12 bg-white shadow-xl rounded-lg mx-auto p-8 w-full max-w-4xl relative z-10 transform hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-[#007E85]" />
            <h3 className="text-xl font-semibold text-gray-800">Quick Appointment Search</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Service Type</label>
              <Select
                value={appointmentData.service}
                onValueChange={(value) =>
                  setAppointmentData(prev => ({ ...prev, service: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Account Opening">Account Opening</SelectItem>
                  <SelectItem value="Loan Application">Loan Application</SelectItem>
                  <SelectItem value="Credit Card Services">Credit Card Services</SelectItem>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Preferred Date</label>
              <Input
                type="date"
                name="date"
                value={appointmentData.date}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Branch Location</label>
              <input
                type="text"
                className="w-full border px-4 py-3 rounded-lg bg-gray-50"
                value="Bangi"
                readOnly
              />
            </div>

            <div className="flex items-end">
              <Button className={buttonClass + " w-full"} onClick={handleSearch}>
                Search
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 text-center bg-gradient-to-b from-[#f8f9fa] to-white">
          <h2 className="text-3xl font-semibold mb-4 text-[#007E85]">
            Why Choose Q-Smart?
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Experience the future of queue management with our innovative features
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Real-Time Tracking',
                desc: 'Track your queue status in real time with up-to-date information.',
                icon: <Clock className="mx-auto mb-4 h-12 w-12 text-[#007E85]" />,
              },
              {
                title: 'Easy Scheduling',
                desc: 'Book and manage your appointments effortlessly.',
                icon: <CalendarDays className="mx-auto mb-4 h-12 w-12 text-[#007E85]" />,
              },
              {
                title: 'Mobile Access',
                desc: 'Access your queue status anywhere, anytime.',
                icon: <Smartphone className="mx-auto mb-4 h-12 w-12 text-[#007E85]" />,
              },
              {
                title: 'Secure System',
                desc: 'Your data is protected with our secure platform.',
                icon: <Shield className="mx-auto mb-4 h-12 w-12 text-[#007E85]" />,
              },
            ].map(({ title, desc, icon }, index) => (
              <div 
                key={title} 
                className="bg-white shadow-lg rounded-xl p-8 transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-[#007E85]/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-[#007E85]">
                  {title}
                </h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 bg-gradient-to-b from-white to-[#f8f9fa]">
          <h2 className="text-center text-3xl font-semibold mb-4 text-[#007E85]">
            What Our Customers Say
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'John Doe',
                role: 'Regular Customer',
                review: 'A fantastic platform for managing appointments seamlessly! The real-time updates are incredibly helpful.',
                rating: 5
              },
              {
                name: 'Jane Smith',
                role: 'Business Owner',
                review: "The best queue management system I've used! It has transformed how we handle customer service.",
                rating: 5
              },
              {
                name: 'Ali Hassan',
                role: 'Bank Customer',
                review: 'Convenient and simple, I love it! The mobile access feature is particularly useful for busy professionals.',
                rating: 5
              },
            ].map(({ name, role, review, rating }, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg p-8 flex flex-col hover:shadow-xl transition-all duration-300"
              >
                <Quote className="text-[#007E85] w-8 h-8 mb-6" />
                <p className="text-gray-700 mb-6 flex-grow">{review}</p>
                <div className="border-t pt-6">
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="text-sm text-gray-600 mb-2">{role}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-[#007E85] py-20 px-6">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-4 text-white">
              Stay Updated
            </h2>
            <p className="mb-8 text-teal-100">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 max-w-md mx-auto">
              <Input 
                placeholder="Enter your email" 
                className="flex-1 h-12 bg-white/10 text-white placeholder:text-white/60 border-white/20"
              />
              <Button className="bg-white text-[#007E85] hover:bg-white/90 h-12 px-8 font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Q<span className="text-[#007E85]">Smart</span>
              </h3>
              <p className="text-gray-400">
                Simplifying queue management for a better banking experience.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Queue Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Appointment Booking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customer Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Klang, Selangor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Mon - Fri: 9:00 AM - 5:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} QSmart. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Welcome;

// Add these styles to your CSS
const styles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out;
}

.animate-slide-up-delay {
  animation: slide-up 0.8s ease-out 0.2s both;
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}
`;
