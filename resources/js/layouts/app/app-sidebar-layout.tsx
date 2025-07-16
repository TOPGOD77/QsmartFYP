import { AppContent } from '@/components/app-content';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';

function SidebarContent({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 hidden lg:block bg-white border-r transition-all duration-200" 
                 style={{ width: isCollapsed ? '3rem' : '18rem' }}>
                <AppSidebar className="h-full" />
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-200 ${isCollapsed ? 'lg:pl-12' : 'lg:pl-72'}`}>
                <div className="flex-none">
                    <AppSidebarHeader />
                </div>
                <div className="mx-auto max-w-[1200px] px-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <SidebarProvider defaultOpen={false}>
            <SidebarContent>{children}</SidebarContent>
        </SidebarProvider>
    );
}
