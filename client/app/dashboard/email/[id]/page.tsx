'use client';

import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Trash2,
    Archive,
    Star,
    ChevronDown,
    Download,
    FileText as FileIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// --- Types ---
interface AttachmentType {
    filename: string;
    content: string; // Base64 content
    encoding: string;
}

interface EmailJobData {
    id: string;
    subject: string;
    body: string;
    recipient: string;
    sentAt: string | null;
    scheduledAt: string;
    status: string;
    attachments: AttachmentType[] | null;
    user: {
        name: string | null;
        email: string;
        avatar: string | null;
    };
}

// --- Sub-Components ---

const MessageHeader = ({ data, goBack, currentUser }: { data: EmailJobData, goBack: () => void, currentUser: any }) => {
    return (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={goBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    aria-label="Back"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-gray-900 truncate max-w-2xl" title={data.subject}>
                    {data.subject}
                </h1>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">{data.status}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
                <button className="p-2 hover:bg-gray-100 rounded-full hover:text-yellow-400 transition-colors">
                    <Star size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full hover:text-gray-600 transition-colors">
                    <Archive size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                </button>
                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                {currentUser?.image && (
                    <img src={currentUser.image} className="w-8 h-8 rounded-full border border-gray-200" alt="Me" />
                )}
            </div>
        </div>
    );
};

const MessageContent = ({ data, currentUser }: { data: EmailJobData, currentUser: any }) => {
    // Format date string based on status
    const formattedDate = data.sentAt
        ? new Date(data.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
        : new Date(data.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

    const sName = data.user?.name || "Unknown Sender";
    const sEmail = data.user?.email || "sender@example.com";
    const sAvatar = data.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sName)}&background=random`;

    return (
        <div className="flex-1 overflow-y-auto px-8 md:px-16 py-8">
            <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                    <img
                        src={sAvatar}
                        alt={sName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900">{sName}</span>
                            <span className="text-gray-500 text-sm hidden sm:inline">&lt;{sEmail}&gt;</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5 relative group/tooltip cursor-pointer w-fit">
                            <span>to {currentUser?.email === sEmail ? data.recipient : 'me'}</span>
                            <ChevronDown size={12} />
                        </div>
                    </div>
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                    {formattedDate}
                </div>
            </div>

            <div className="max-w-4xl text-gray-800 leading-relaxed text-[15px] space-y-6 whitespace-pre-wrap">
                {data.body}
            </div>

            <FileAttachments files={data.attachments} />
        </div>
    );
};

const FileAttachments = ({ files }: { files: AttachmentType[] | null }) => {
    if (!files || files.length === 0) return null;

    return (
        <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FileIcon size={16} /> {files.length} Attachments
            </h3>
            <div className="flex flex-wrap gap-4">
                {files.map((f, idx) => (
                    <div key={idx} className="group relative w-48 border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-gray-50">
                        <div className="h-32 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                            {f.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img
                                    src={`data:image/png;base64,${f.content}`}
                                    alt={f.filename}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FileIcon size={40} className="text-gray-400" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <a
                                    href={`data:application/octet-stream;base64,${f.content}`}
                                    download={f.filename}
                                    className="bg-white/90 p-2 rounded-full shadow-sm text-gray-700 hover:text-blue-600"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        </div>
                        <div className="p-3 bg-white">
                            <div className="text-xs font-medium text-gray-900 truncate" title={f.filename}>
                                {f.filename}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1">
                                {(f.content.length * 0.75 / 1024).toFixed(1)} KB
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function EmailDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();

    // State
    const [mailData, setMailData] = useState<EmailJobData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const emailId = params?.id;

    useEffect(() => {
        if (emailId) {
            const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/job/${emailId}`;
            fetch(endpoint)
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error("Failed to fetch email data");
                })
                .then(data => setMailData(data))
                .catch(err => console.error("Error loading email:", err))
                .finally(() => setIsLoading(false));
        }
    }, [emailId]);

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center text-gray-500">Loading email...</div>;
    }

    if (!mailData) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-gray-500 gap-4">
                <p>Email not found.</p>
                <button onClick={() => router.back()} className="text-blue-600 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
            <MessageHeader
                data={mailData}
                goBack={() => router.back()}
                currentUser={session?.user}
            />
            <MessageContent
                data={mailData}
                currentUser={session?.user}
            />
        </div>
    );
}
