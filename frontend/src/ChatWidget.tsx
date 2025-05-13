import React, { useState } from 'react';
import ChatbotInner from './chatboat';
import { FaCommentDots, FaTimes } from 'react-icons/fa'; // Using FontAwesome icons

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="w-[420px] h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-300 dark:border-gray-700">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-2xl">
                        <span className="font-semibold">Chat</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:text-red-200 transition cursor-pointer"
                            title='Minimize the chat'
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat content */}
                    <div className="flex-1 overflow-hidden">
                        <ChatbotInner />
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg"
                    title="Open Chat"
                >
                    <FaCommentDots className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
