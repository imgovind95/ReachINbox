import { ChevronDown, Settings } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

interface UserProfileProps {
    userName: string;
    userEmail: string;
    userImage: string;
}

export const UserProfile = ({ userName, userEmail, userImage }: UserProfileProps) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="relative mt-4">
            <div
                onClick={() => setShowMenu(!showMenu)}
                className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {userImage ? (
                        <img
                            src={userImage}
                            alt="User"
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold uppercase">
                            {(userName?.[0] || userEmail?.[0] || 'U')}
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate">{userName || 'User'}</span>
                        <span className="text-xs text-gray-500 truncate">{userEmail || 'user@example.com'}</span>
                    </div>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden py-1">
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setShowMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <div className="w-8 flex justify-center"><Settings size={16} /></div>
                        Settings
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <div className="w-8 flex justify-center">→</div>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};
