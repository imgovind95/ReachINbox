import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { InboxMessage } from '../../hooks/useInboxMessages';

interface EmailListItemProps {
    data: InboxMessage;
}

export const EmailListItem = ({ data }: EmailListItemProps) => {
    const router = useRouter();

    const handleNavigation = () => {
        router.push(`/dashboard/email/${data.id}`);
    };

    const StatusBadge = () => {
        if (data.status === 'scheduled') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-medium tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-full border border-current opacity-60 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    </span>
                    {data.date}
                </span>
            );
        }

        const statusClasses = clsx(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide",
            {
                "bg-gray-100 text-gray-600": data.status === 'inbox',
                "bg-green-100 text-green-700": data.status === 'sent' || data.status === 'failed' || (data.status as any) === 'sending'
            }
        );

        const label = data.status === 'inbox' ? 'Inbox' : 'Delivered';

        return <span className={statusClasses}>{label}</span>;
    };

    return (
        <div
            onClick={handleNavigation}
            className="group px-8 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-start gap-4 cursor-pointer"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                        {data.sender ? `From: ${data.sender}` : `To: ${data.recipient}`}
                    </span>
                    <StatusBadge />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{data.subject}</span>
                    <span className="text-gray-400">-</span>
                    <span className="truncate">{data.body}</span>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                {/* Preview Link would go here passing as prop if needed, for now logic inside parent or passed down */}
                <button className="text-gray-300 hover:text-yellow-400 transition-colors">
                    <Star size={18} />
                </button>
            </div>
        </div>
    );
};
