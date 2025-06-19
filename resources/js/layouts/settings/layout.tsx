import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { User, LogOut, ArrowLeft } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.visit(route('dashboard'))}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Return to Dashboard
                            </Button>
                            <span className="text-2xl font-bold text-teal-600">Q<span className="text-gray-900">Smart</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center">
                                <User className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">{auth.user?.email}</span>
                            </div>
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

            <div className="max-w-7xl mx-auto px-4 py-8">
                <Heading title="Settings" description="Manage your profile and account settings" />

                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 mt-8">
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav className="flex flex-col space-y-1 space-x-0">
                            {sidebarNavItems.map((item, index) => (
                                <Button
                                    key={`${item.href}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-teal-50 text-teal-600': window.location.pathname === item.href,
                                    })}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>

                    <Separator className="my-6 md:hidden" />

                    <div className="flex-1 md:max-w-2xl">
                        <section className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
