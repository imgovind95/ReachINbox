'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Clock, Send, Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SidebarItem } from './Sidebar/SidebarItem';
import { UserProfile } from './Sidebar/UserProfile';

export default function Sidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ scheduled: 0, sent: 0, inbox: 0 });
  const { data: session } = useSession();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userImage, setUserImage] = useState('');

  useEffect(() => {
    // Logic extraction to separate concerns
    async function fetchCounts() {
      if (!session?.user) return;

      const userId = (session.user as any).id;
      const email = session.user.email;

      if (userId) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${userId}`);
          if (res.ok) {
            const data = await res.json();
            const now = new Date();

            const scheduled = data.filter((job: any) =>
              (job.status === 'PENDING' || job.status === 'DELAYED') && new Date(job.scheduledAt) > now
            ).length;

            const sent = data.filter((job: any) =>
              job.status === 'COMPLETED' || job.status === 'FAILED' ||
              ((job.status === 'PENDING' || job.status === 'DELAYED') && new Date(job.scheduledAt) <= now)
            ).length;

            setCounts(prev => ({ ...prev, scheduled, sent }));
          }
        } catch (err) { console.error("Schedule count error", err); }
      }

      if (email) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/inbox/${email}`);
          if (res.ok) {
            const data = await res.json();
            setCounts(prev => ({ ...prev, inbox: data.length }));
          }
        } catch (err) { console.error("Inbox count error", err); }
      }
    }

    if (session) fetchCounts();

    const handleRefresh = () => session && fetchCounts();
    window.addEventListener('refresh-sidebar', handleRefresh);
    const interval = setInterval(() => { if (session && !document.hidden) fetchCounts(); }, 8000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-sidebar', handleRefresh);
    };
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || '');
      setUserEmail(session.user.email || '');
      setUserImage(session.user.image || '');

      if ((session.user as any).id && (!session.user.name || session.user.name === 'undefined')) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user/${(session.user as any).id}`)
          .then(res => res.json())
          .then(d => { if (d?.name) { setUserName(d.name); if (d.avatar) setUserImage(d.avatar); } });
      }
    }
  }, [session]);

  const navItems = [
    { name: 'Scheduled', icon: Clock, path: '/dashboard/scheduled', count: counts.scheduled },
    { name: 'Sent', icon: Send, path: '/dashboard/sent', count: counts.sent },
    { name: 'Inbox', icon: Inbox, path: '/dashboard/inbox', count: counts.inbox },
  ];

  return (
    <div className="w-64 bg-gray-50 h-full border-r border-gray-200 flex flex-col p-4 flex-shrink-0">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tighter text-gray-900">ReachInbox</h1>
      </div>

      {session && !session.user.id && (
        <div className="mb-4 bg-red-50 border border-red-200 p-2 rounded text-xs text-red-600">
          Connection Error. Please Logout.
        </div>
      )}

      <Link
        href="/dashboard/compose"
        className="w-full bg-white border-2 border-green-500 text-green-600 font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 mb-8 hover:bg-green-50 transition-colors shadow-sm"
      >
        <span className="text-lg">+</span> Compose
      </Link>

      <div className="flex-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Core</h3>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              path={item.path}
              count={item.count}
              isActive={pathname.startsWith(item.path)}
            />
          ))}
        </nav>
      </div>

      <UserProfile userName={userName} userEmail={userEmail} userImage={userImage} />
    </div>
  );
}
