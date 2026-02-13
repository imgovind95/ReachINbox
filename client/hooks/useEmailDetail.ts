import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export interface Attachment {
    filename: string;
    content: string; // Base64
    encoding: string;
}

export interface EmailJob {
    id: string;
    subject: string;
    body: string;
    recipient: string;
    sentAt: string | null;
    scheduledAt: string;
    status: string;
    attachments: Attachment[] | null;
    user: {
        name: string | null;
        email: string;
        avatar: string | null;
    };
}

export function useEmailDetail() {
    const params = useParams();
    const [email, setEmail] = useState<EmailJob | null>(null);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession(); // Keep session here if needed for logic

    useEffect(() => {
        if (params?.id) {
            setLoading(true); // Ensure loading state reset on id change
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/job/${params.id}`)
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error("Failed to fetch");
                })
                .then(data => setEmail(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [params?.id]);

    return { email, loading, session };
}
