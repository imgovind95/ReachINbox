'use client';

import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Trash2, Archive, Star,
    ChevronDown, Download, FileText
} from 'lucide-react';
import { useEmailDetail } from '@/hooks/useEmailDetail';

// --- Local Components for Structural Atomization ---

const EmailHeader = ({ email, router, session }: any) => {
    const dateStr = email.sentAt
        ? new Date(email.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
        : new Date(email.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

    const senderName = email.user?.name || "Unknown Sender";
    const senderEmail = email.user?.email || "sender@example.com";
    const avatarUrl = email.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`;

    return (
        <div className="flex-none">
            {/* Top Navigation Bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 truncate max-w-2xl" title={email.subject}>
                        {email.subject}
                    </h1>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono lowercase">{email.status}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                    <button className="p-2 hover:bg-gray-100 rounded-full hover:text-yellow-400 transition-colors"><Star size={20} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full hover:text-gray-600 transition-colors"><Archive size={20} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    {session?.user?.image && (
                        <img src={session.user.image} className="w-8 h-8 rounded-full border border-gray-200" alt="Me" />
                    )}
                </div>
            </div>

            {/* Sender Info Section */}
            <div className="px-8 md:px-16 pt-8 pb-6">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <img src={avatarUrl} alt={senderName} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-900 text-lg">{senderName}</span>
                                <span className="text-gray-500 text-sm hidden sm:inline">&lt;{senderEmail}&gt;</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1 relative cursor-pointer w-fit hover:text-gray-900 transition-colors">
                                <span>to {session?.user?.email === senderEmail ? email.recipient : 'me'}</span>
                                <ChevronDown size={12} />
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap font-medium">
                        {dateStr}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmailBody = ({ body }: { body: string }) => (
    <div className="px-8 md:px-16 py-2 max-w-4xl">
        <div className="text-gray-800 leading-relaxed text-[15px] space-y-6 whitespace-pre-wrap font-normal">
            {body}
        </div>
    </div>
);

const EmailAttachments = ({ attachments }: { attachments: any[] }) => {
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="px-8 md:px-16 pb-12 mt-8">
            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText size={16} /> {attachments.length} Attachments
                </h3>
                <div className="flex flex-wrap gap-4">
                    {attachments.map((file, i) => (
                        <div key={i} className="group relative w-48 border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-gray-50">
                            {/* Preview */}
                            <div className="h-32 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                                {file.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                    <img src={`data:image/png;base64,${file.content}`} alt={file.filename} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <FileText size={40} className="text-gray-400" />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <a
                                        href={`data:application/octet-stream;base64,${file.content}`}
                                        download={file.filename}
                                        className="bg-white/90 p-2 rounded-full shadow-sm text-gray-700 hover:text-blue-600 transform translate-y-2 group-hover:translate-y-0 transition-all"
                                    >
                                        <Download size={20} />
                                    </a>
                                </div>
                            </div>
                            {/* Meta */}
                            <div className="p-3 bg-white">
                                <div className="text-xs font-medium text-gray-900 truncate" title={file.filename}>{file.filename}</div>
                                <div className="text-[10px] text-gray-500 mt-1">{(file.content.length * 0.75 / 1024).toFixed(1)} KB</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function EmailDetailPage() {
    const router = useRouter();
    const { email, loading, session } = useEmailDetail();

    if (loading) return <div className="h-screen flex items-center justify-center text-gray-500 font-medium">Loading email content...</div>;

    if (!email) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-gray-500 gap-4">
                <p>Email content unavailable.</p>
                <button onClick={() => router.back()} className="text-blue-600 hover:underline font-medium">Return to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-white text-gray-900 font-sans overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <EmailHeader email={email} router={router} session={session} />
                <EmailBody body={email.body} />
                <EmailAttachments attachments={email.attachments as any[]} />
            </div>
        </div>
    );
}
