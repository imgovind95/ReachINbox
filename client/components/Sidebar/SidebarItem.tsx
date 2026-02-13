import Link from 'next/link';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
    name: string;
    icon: LucideIcon;
    path: string;
    count: number;
    isActive: boolean;
}

export const SidebarItem = ({ name, icon: Icon, path, count, isActive }: SidebarItemProps) => {
    return (
        <Link
            href={path}
            prefetch={true}
            className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                    ? 'bg-green-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
            )}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-gray-900' : 'text-gray-500'} />
                {name}
            </div>
            <span className={clsx("text-xs", isActive ? "text-gray-900" : "text-gray-400")}>
                {count}
            </span>
        </Link>
    );
};
