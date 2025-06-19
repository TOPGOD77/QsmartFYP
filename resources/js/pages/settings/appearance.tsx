import { Head } from '@inertiajs/react';
import { Sun, Moon, Monitor } from 'lucide-react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Customize how QSmart looks on your device" />

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    variant="outline"
                                    className="flex flex-col items-center justify-center gap-2 h-24 hover:bg-teal-50 hover:text-teal-600"
                                >
                                    <Sun className="h-6 w-6" />
                                    <span>Light</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex flex-col items-center justify-center gap-2 h-24 hover:bg-teal-50 hover:text-teal-600"
                                >
                                    <Moon className="h-6 w-6" />
                                    <span>Dark</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex flex-col items-center justify-center gap-2 h-24 hover:bg-teal-50 hover:text-teal-600"
                                >
                                    <Monitor className="h-6 w-6" />
                                    <span>System</span>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Color Scheme</Label>
                            <div className="grid grid-cols-4 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-12 bg-teal-600 hover:bg-teal-700"
                                />
                                <Button
                                    variant="outline"
                                    className="h-12 bg-blue-600 hover:bg-blue-700"
                                />
                                <Button
                                    variant="outline"
                                    className="h-12 bg-purple-600 hover:bg-purple-700"
                                />
                                <Button
                                    variant="outline"
                                    className="h-12 bg-pink-600 hover:bg-pink-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </>
    );
}
