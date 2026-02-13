'use client';

import EmailList from "@/components/EmailList";
import { useSentMessages } from "@/hooks/useSentMessages";

export default function SentPage() {
  const { emails, loading, refresh } = useSentMessages();
  return <EmailList title="Sent" items={emails} isLoading={loading} onRefresh={refresh} />;
}
