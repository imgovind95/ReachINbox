import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

export function useScheduledMessages() {
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

                    const scheduled = data
                        .filter((job: any) => {
                            if (job.status === 'PENDING' || job.status === 'DELAYED') {
                                return new Date(job.scheduledAt) > now;
                            }
                            return false;
                        })
                        .map((job: any) => ({
                            id: job.id,
                            recipient: job.recipient,
                            subject: job.subject,
                            body: job.body,
                            status: 'scheduled',
                            date: new Date(job.scheduledAt).toLocaleString()
                        }));
                    setEmails(scheduled);
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
            }, 6000);

            return () => {
                window.removeEventListener('refresh-sidebar', handleRefresh);
                clearInterval(interval);
            };
        }
    }, [session, fetchEmails]);

    return { emails, loading, refresh: () => fetchEmails(false) };
}
