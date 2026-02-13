'use client';

import EmailList from "@/components/EmailList";
import { useScheduledMessages } from "@/hooks/useScheduledMessages";

export default function ScheduledPage() {
  const { emails, loading, refresh } = useScheduledMessages();
  return <EmailList title="Scheduled" items={emails} isLoading={loading} onRefresh={refresh} />;
}
