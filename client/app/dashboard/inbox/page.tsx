'use client';

import EmailList from "@/components/EmailList";
import { useInboxMessages } from "@/hooks/useInboxMessages";

export default function InboxPage() {
    const { messages, isFetching, refresh } = useInboxMessages();

    return (
        <EmailList
            title="Inbox"
            items={messages}
            isLoading={isFetching}
            onRefresh={refresh}
        />
    );
}
