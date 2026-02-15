import { useState, useMemo } from 'react';
import { TopBar } from './EmailList/TopBar';
import { EmailListItem } from './EmailList/EmailListItem';

interface EmailListProps {
    title: string;
    items: any[];
    isLoading?: boolean;
    onRefresh?: () => void;
}

export default function EmailList({ title, items, isLoading, onRefresh }: EmailListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        const lowerQuery = searchQuery.toLowerCase();
        return items.filter(item =>
            (item.recipient && item.recipient.toLowerCase().includes(lowerQuery)) ||
            (item.subject && item.subject.toLowerCase().includes(lowerQuery)) ||
            (item.body && item.body.toLowerCase().includes(lowerQuery))
        );
    }, [items, searchQuery]);

    const suggestions = useMemo(() => {
        if (!searchQuery) return [];
        const lowerQuery = searchQuery.toLowerCase();
        const matches = new Set<string>();

        items.forEach(item => {
            if (item.subject && item.subject.toLowerCase().includes(lowerQuery)) matches.add(item.subject);
            if (item.recipient && item.recipient.toLowerCase().includes(lowerQuery)) matches.add(item.recipient);
        });

        return Array.from(matches).slice(0, 5);
    }, [items, searchQuery]);

    return (
        <div className="h-full flex flex-col">
            <TopBar
                itemCount={filteredItems.length}
                isLoading={!!isLoading}
                onRefresh={onRefresh}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                suggestions={suggestions}
            />

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Loading {title}...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        {searchQuery ? (
                            <p>No results found for "{searchQuery}"</p>
                        ) : (
                            <p>No emails found</p>
                        )}
                    </div>
                ) : (
                    <div>
                        {filteredItems.map((item) => (
                            <EmailListItem key={item.id} data={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
