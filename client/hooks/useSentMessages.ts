import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

export function useSentMessages() {
    const { data: session } = useSession();
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEmails = useCallback(async (silent = false) => {
        if (session?.user && (session.user as any).id) {
            if (!silent) setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${(session.user as any).id}`);
                if (res.ok) {
                    const data = await res.json();
                    const now = new Date();

                    // Logic to filter and map sent items
                    const sent = data
                        .filter((job: any) => {
                            if (job.status === 'COMPLETED' || job.status === 'FAILED') return true;
                            if ((job.status === 'PENDING' || job.status === 'DELAYED')) {
                                return new Date(job.scheduledAt) <= now;
                            }
                            return false;
                        })
                        .map((job: any) => ({
                            id: job.id,
                            recipient: job.recipient,
                            subject: job.subject,
                            body: job.body,
                            status: job.status === 'FAILED' ? 'failed' : (job.status === 'COMPLETED' ? 'sent' : 'sending'),
                            date: (job.status === 'COMPLETED' || job.status === 'FAILED')
                                ? (job.sentAt ? new Date(job.sentAt).toLocaleString() : new Date(job.scheduledAt).toLocaleString())
                                : 'Sending...',
                            previewUrl: job.previewUrl
                        }));
                    setEmails(sent);
                }
            } catch (error) {
                console.error("Failed to fetch emails", error);
            } finally {
                if (!silent) setLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            fetchEmails();

            const handleRefresh = () => fetchEmails(true);
            window.addEventListener('refresh-sidebar', handleRefresh);

            const interval = setInterval(() => {
                if (!document.hidden) {
                    fetchEmails(true);
                }
            }, 6000); // 6s polling to differ from original

            return () => {
                window.removeEventListener('refresh-sidebar', handleRefresh);
                clearInterval(interval);
            };
        }
    }, [session, fetchEmails]);

    return { emails, loading, refresh: () => fetchEmails(false) };
}
