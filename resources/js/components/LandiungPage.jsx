// LandingPage.jsx

import React, { useState } from 'react';
import { Button, Input, Select } from '@shadcn/ui';

const LandingPage = () => {
    const [appointmentData, setAppointmentData] = useState({
        service: '',
        date: '',
        branch: ''
    });

    const handleSearch = () => {
        // Perform search logic based on appointmentData
        console.log(appointmentData);
    };

    return (
        <div className="container mx-auto p-4">
            {/* Header Section */}
            <header className="flex justify-between items-center p-4 bg-gray-900 text-white">
                <div className="text-lg font-bold">Q-Smart</div>
                <div>
                    <Button variant="outline" className="ml-4">Sign In</Button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex flex-col items-center bg-cover bg-center py-16 text-white" style={{ backgroundImage: 'url(./path-to-your-image.jpg)' }}>
                <h1 className="text-4xl font-bold mb-4">Effortless Appointment Scheduling and Queue Management</h1>
                <p className="text-lg mb-6">Simplify your booking experience with Q-Smart. Manage your appointment seamlessly.</p>

                <div className="flex items-center space-x-4">
                    <Select 
                        value={appointmentData.service} 
                        onChange={(e) => setAppointmentData({...appointmentData, service: e.target.value})}
                        label="Service"
                    >
                        <option value="consultation">Consultation</option>
                        <option value="support">Support</option>
                    </Select>

                    <Input 
                        type="date" 
                        value={appointmentData.date} 
                        onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})} 
                        placeholder="Select Date" 
                    />

                    <Input 
                        value={appointmentData.branch} 
                        onChange={(e) => setAppointmentData({...appointmentData, branch: e.target.value})} 
                        placeholder="Branch Location" 
                    />

                    <Button variant="primary" onClick={handleSearch}>Search</Button>
                </div>
            </section>

            {/* Features Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
                <div className="p-4 bg-white shadow rounded-lg text-center">
                    <h3 className="font-semibold text-xl mb-2">Real-Time Queue Tracking</h3>
                    <p>Track your queue status in real time with up-to-date information.</p>
                </div>
                <div className="p-4 bg-white shadow rounded-lg text-center">
                    <h3 className="font-semibold text-xl mb-2">Easy Appointment Scheduling</h3>
                    <p>Book and manage your appointments effortlessly with our easy-to-use platform.</p>
                </div>
                <div className="p-4 bg-white shadow rounded-lg text-center">
                    <h3 className="font-semibold text-xl mb-2">User-Friendly Dashboard</h3>
                    <p>Manage all your bookings with an intuitive and simple dashboard.</p>
                </div>
                <div className="p-4 bg-white shadow rounded-lg text-center">
                    <h3 className="font-semibold text-xl mb-2">Feedback System</h3>
                    <p>Provide and receive feedback to enhance your booking experience.</p>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-gray-100 py-12">
                <h2 className="text-center text-3xl font-semibold mb-8">What Our Customers Say</h2>
                <div className="flex justify-center space-x-8">
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <p className="text-sm">"A fantastic platform for managing appointments seamlessly!"</p>
                        <div className="flex justify-between mt-4">
                            <div className="font-semibold">John Doe</div>
                            <div className="text-yellow-500">★★★★★</div>
                        </div>
                    </div>
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <p className="text-sm">"The best queue management system I've used!"</p>
                        <div className="flex justify-between mt-4">
                            <div className="font-semibold">Jane Smith</div>
                            <div className="text-yellow-500">★★★★★</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-gray-900 text-white py-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold">Subscribe to Our Newsletter</h2>
                    <p>Stay updated with the latest news and offers from Q-Smart.</p>
                </div>
                <div className="flex justify-center">
                    <Input className="mr-4" placeholder="Enter your email" />
                    <Button variant="primary">Subscribe</Button>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
