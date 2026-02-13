import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Papa from 'papaparse';

export function useCompose() {
    const router = useRouter();
    const { data: session } = useSession();

    // Form State
    const [recipients, setRecipients] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [minDelay, setMinDelay] = useState('');
    const [hourlyLimit, setHourlyLimit] = useState('');
    const [attachments, setAttachments] = useState<{ filename: string, content: string, encoding: string }[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    // Scheduling State
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduledDate, setScheduledDate] = useState<string>('');
    const [isSending, setIsSending] = useState(false);

    const parseEmails = (content: string): string[] => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = content.match(emailRegex);
        return matches ? Array.from(new Set(matches)) : [];
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                complete: (results) => {
                    const extracted: string[] = [];
                    results.data.forEach((row: any) => {
                        const rowValues = Object.values(row).join(' ');
                        const found = parseEmails(rowValues);
                        extracted.push(...found);
                    });

                    if (extracted.length > 0) {
                        setRecipients(prev => Array.from(new Set([...prev, ...extracted])));
                        alert(`Loaded ${extracted.length} emails from file`);
                    } else {
                        alert("No valid emails found in file");
                    }
                },
                header: false,
                skipEmptyLines: true,
                error: (err) => {
                    console.error("CSV Parse Error:", err);
                    alert("Failed to parse CSV file");
                }
            });
        }
    };

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result as string;
                    const content = result.split(',')[1];
                    setAttachments(prev => [...prev, {
                        filename: file.name,
                        content: content,
                        encoding: 'base64'
                    }]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', ',', ' '].includes(e.key)) {
            e.preventDefault();
            const value = inputValue.trim().replace(/,$/, '');
            if (value) {
                const found = parseEmails(value);
                if (found.length > 0) {
                    setRecipients(prev => Array.from(new Set([...prev, ...found])));
                    setInputValue('');
                }
            }
        } else if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
            setRecipients(prev => prev.slice(0, -1));
        }
    };

    const removeRecipient = (email: string) => {
        setRecipients(prev => prev.filter(r => r !== email));
    };

    useEffect(() => {
        router.prefetch('/dashboard/sent');
        router.prefetch('/dashboard/scheduled');
    }, [router]);

    const handleSend = async (type: 'now' | 'later' = 'now') => {
        if (isSending) return;

        if (!session?.user || !(session.user as any).id) {
            alert("Please log in first");
            return;
        }

        if (type === 'later' && !scheduledDate) {
            alert("Please select a date and time for scheduling.");
            return;
        }

        let targets = [...recipients];

        if (inputValue.trim()) {
            const pendingEmails = parseEmails(inputValue);
            if (pendingEmails.length > 0) {
                targets = Array.from(new Set([...targets, ...pendingEmails]));
                setRecipients(targets);
                setInputValue('');
            } else {
                alert("The email address in the 'To' field is invalid. Please check the format.");
                return;
            }
        }

        if (targets.length === 0) {
            alert("Please add at least one recipient");
            return;
        }

        setIsSending(true);

        const payloadBase = {
            userId: (session.user as any).id,
            subject,
            body,
            hourlyLimit: hourlyLimit ? parseInt(hourlyLimit) : undefined,
            minDelay: minDelay ? parseInt(minDelay) : undefined,
            attachments: attachments.length > 0 ? attachments : undefined
        };

        // Yield to UI
        await new Promise(resolve => setTimeout(resolve, 0));

        Promise.all(targets.map(async (email) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...payloadBase,
                        recipient: email,
                        scheduledAt: type === 'later' && scheduledDate ? new Date(scheduledDate).toISOString() : undefined
                    }),
                    signal: controller.signal,
                    keepalive: true
                });
                clearTimeout(timeoutId);

                if (!res.ok) {
                    console.error(`Failed to send to ${email}:`, await res.text());
                }
            } catch (err) {
                console.error(`Fetch error for ${email}:`, err);
            }
        }));

        window.dispatchEvent(new Event('refresh-sidebar'));

        if (type === 'now') {
            router.push('/dashboard/sent');
        } else {
            router.push('/dashboard/scheduled');
        }
    };

    return {
        recipients,
        inputValue,
        setInputValue,
        subject,
        setSubject,
        body,
        setBody,
        minDelay,
        setMinDelay,
        hourlyLimit,
        setHourlyLimit,
        attachments,
        fileInputRef,
        attachmentInputRef,
        showSchedule,
        setShowSchedule,
        scheduledDate,
        setScheduledDate,
        isSending,
        handleFileUpload,
        handleAttachmentUpload,
        removeAttachment,
        handleKeyDown,
        removeRecipient,
        handleSend,
        session
    };
}
