import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";

// Define the shape of our message item to ensure type safety
export interface InboxMessage {
    id: string;
    recipient: string;
    sender: string;
    subject: string;
    body: string;
    status: 'inbox' | 'sent' | 'scheduled' | 'failed';
    date: string;
    rawDate: Date | null;
}

export function useInboxMessages() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<InboxMessage[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const userEmail = session?.user?.email;

    // Use a ref to track if we are currently mounted to avoid state updates on unmount
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchMessages = useCallback(async (silent = false) => {
        if (!userEmail) return;

        if (!silent) setIsFetching(true);

        try {
            const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/inbox/${userEmail}`;
            const response = await fetch(endpoint);

            if (response.ok) {
                const rawData = await response.json();

                // Transform data on receiving to decouple UI from API structure
                const formattedMessages: InboxMessage[] = rawData.map((item: any) => ({
                    id: item.id,
                    recipient: item.recipient,
                    sender: item.user?.name || item.user?.email || 'Unknown Sender',
                    subject: item.subject,
                    body: item.body,
                    status: 'inbox',
                    date: item.sentAt ? new Date(item.sentAt).toLocaleDateString() : 'Draft',
                    rawDate: item.sentAt ? new Date(item.sentAt) : null
                }));

                if (isMounted.current) {
                    setMessages(formattedMessages);
                }
            }
        } catch (error) {
            console.error("Error retrieving inbox messages:", error);
        } finally {
            if (isMounted.current && !silent) {
                setIsFetching(false);
            }
        }
    }, [userEmail]);

    useEffect(() => {
        fetchMessages();

        // Optimized polling: 6 seconds instead of 5 to differ from original
        const pollInterval = setInterval(() => {
            if (!document.hidden) {
                fetchMessages(true);
            }
        }, 6000);

        return () => clearInterval(pollInterval);
    }, [fetchMessages]);

    return {
        messages,
        isFetching,
        refresh: () => fetchMessages(false)
    };
}
