import { TopBar } from './EmailList/TopBar';
import { EmailListItem } from './EmailList/EmailListItem';

interface EmailListProps {
    title: string;
    items: any[];
    isLoading?: boolean;
    onRefresh?: () => void;
}

export default function EmailList({ title, items, isLoading, onRefresh }: EmailListProps) {
    return (
        <div className="h-full flex flex-col">
            <TopBar
                itemCount={items.length}
                isLoading={!!isLoading}
                onRefresh={onRefresh}
            />

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Loading {title}...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <p>No emails found</p>
                    </div>
                ) : (
                    <div>
                        {items.map((item) => (
                            <EmailListItem key={item.id} data={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
