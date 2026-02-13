'use client';

import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Paperclip, Upload,
    Undo, Redo, Type, Bold, Italic,
    FileText, X
} from 'lucide-react';
import { useCompose } from '@/hooks/useCompose';

export default function ComposePage() {
    const router = useRouter();

    // Destructure all needed state and handlers from the custom hook
    const {
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
    } = useCompose();

    return (
        <div className="min-h-screen bg-white flex flex-col relative text-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Compose New Email</h1>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        multiple
                        ref={attachmentInputRef}
                        className="hidden"
                        onChange={handleAttachmentUpload}
                    />
                    <button
                        onClick={() => attachmentInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        title="Attach Files"
                    >
                        <Paperclip size={20} />
                    </button>
                    <button
                        onClick={() => setShowSchedule(true)}
                        className="bg-white border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-2 px-6 rounded-md transition-colors"
                    >
                        Send Later
                    </button>
                    <button
                        onClick={() => handleSend('now')}
                        disabled={isSending}
                        className={`bg-green-600 text-white font-semibold py-2 px-6 rounded-md transition-colors flex items-center gap-2 ${isSending ? 'opacity-70' : 'hover:bg-green-700'}`}
                    >
                        {isSending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        Send Now
                    </button>
                </div>
            </div>

            <div className="px-16 py-8 max-w-5xl">
                {/* From */}
                <div className="flex items-center mb-6">
                    <label className="w-24 text-gray-500 font-medium">From</label>
                    <div className="bg-gray-100 px-4 py-2 rounded-md font-medium text-gray-900 text-sm">
                        {session?.user?.email || 'user@example.com'}
                    </div>
                </div>

                {/* To / Upload */}
                <div className="flex items-center mb-6 border-b border-gray-100 pb-2">
                    <label className="w-24 text-gray-500 font-medium self-start mt-2">To</label>
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                        {recipients.slice(0, 3).map((email, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm">
                                <span>{email}</span>
                                <button onClick={() => removeRecipient(email)} className="hover:text-green-900"><X size={12} /></button>
                            </div>
                        ))}

                        {recipients.length > 3 && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                +{recipients.length - 3}
                            </div>
                        )}

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={recipients.length === 0 ? "recipient@example.com" : ""}
                            className="min-w-[200px] flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-300 py-1"
                        />
                    </div>

                    <input
                        type="file"
                        accept=".csv,.txt"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-green-600 text-sm font-medium hover:text-green-700 shrink-0 ml-4"
                    >
                        <Upload size={16} />
                        Upload List
                    </button>
                </div>

                {/* Subject */}
                <div className="flex items-center mb-8 border-b border-gray-100 pb-2">
                    <label className="w-24 text-gray-500 font-medium">Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject"
                        className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-300 font-medium"
                    />
                </div>

                {/* Settings */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">Delay (ms)</label>
                            <input
                                type="number"
                                value={minDelay}
                                onChange={(e) => setMinDelay(e.target.value)}
                                placeholder="2000"
                                className="w-20 h-10 border border-gray-200 rounded-md text-center outline-none focus:border-green-500"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">Hourly Limit</label>
                            <input
                                type="number"
                                value={hourlyLimit}
                                onChange={(e) => setHourlyLimit(e.target.value)}
                                placeholder="10"
                                className="w-20 h-10 border border-gray-200 rounded-md text-center outline-none focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Attachments List */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                                    <FileText size={14} className="text-gray-500" />
                                    <span className="max-w-[150px] truncate">{file.filename}</span>
                                    <button onClick={() => removeAttachment(idx)} className="hover:text-red-500 transition-colors"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Editor */}
                <div className="bg-gray-50 rounded-lg min-h-[400px] flex flex-col">
                    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-white rounded-t-lg">
                        {[Undo, Redo, Type, Bold, Italic].map((I, i) => <button key={i} className="p-1.5 text-gray-500"><I size={18} /></button>)}
                    </div>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="flex-1 p-6 bg-transparent outline-none resize-none text-gray-700 leading-relaxed placeholder-gray-400"
                        placeholder="Type Your Reply..."
                    ></textarea>
                </div>

            </div>

            {/* Modal - Overlay */}
            <div
                className={`fixed inset-0 z-10 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ${showSchedule ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={() => setShowSchedule(false)}
            ></div>

            {/* Modal - Content */}
            <div className={`absolute top-16 right-8 z-20 w-[400px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-200 origin-top-right ${showSchedule ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="p-6">
                    <h3 className="font-semibold mb-4">Send Later</h3>
                    <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full border p-2 mb-4 rounded"
                    />
                    <button
                        onClick={() => handleSend('later')}
                        disabled={isSending}
                        className={`w-full bg-green-600 text-white rounded py-2 flex items-center justify-center gap-2 ${isSending ? 'opacity-70' : ''}`}
                    >
                        {isSending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        Schedule Send
                    </button>
                    <button
                        onClick={() => setShowSchedule(false)}
                        className="w-full text-gray-500 text-sm mt-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>

        </div>
    );
}
