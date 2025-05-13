import React, { useState, useEffect, useRef } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';

interface Message {
    id: string;
    type: "user" | "bot" | "streaming";
    content: string;
}

// Helper for message styling
const commonBubbleClasses = "p-3 max-w-[75%] rounded-2xl shadow";

// Defining the message styles configuration explicitly
const messageStylesConfig: Record<"user" | "bot" | "streaming" | "default", { wrapper: string; bubble: string }> = {
    user: {
        wrapper: "flex justify-end", // Aligns the entire row to the end (right)
        bubble: "bg-blue-500 text-white",
    },
    bot: {
        wrapper: "flex justify-start", // Aligns the entire row to the start (left)
        bubble: "bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white",
    },
    streaming: {
        wrapper: "flex justify-start", // Aligns like a bot message
        bubble: "bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white opacity-80",
    },
    default: {
        wrapper: "flex justify-start",
        bubble: "bg-yellow-200 text-gray-900 dark:bg-yellow-600 dark:text-white",
    },
};

const Chatbot: React.FC = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendQuery = async () => {
        if (!query) return;

        const messageWithId: Message = {
            id: Date.now().toString(), // Generate a unique id using timestamp
            type: 'user',
            content: query,
        };

        setIsLoading(true);
        setMessages(prev => [...prev, messageWithId]);

        let responseChunk = '';

        const eventSource = new EventSourcePolyfill(`http://localhost:8000/chat/?query=${query}`);

        eventSource.onmessage = (event: any) => {
            const data = JSON.parse(event.data);

            if (data.type === 'message_chunk') {
                responseChunk += ' ' + data.content;
                setMessages(prev => [
                    ...prev.filter(m => m.type !== 'streaming'), // Remove any existing 'streaming' messages
                    { id: Date.now().toString(), type: 'streaming', content: responseChunk },
                ]);
            } else if (data.type === 'message_stream_complete') {
                setMessages(prev => [
                    ...prev.filter(m => m.type !== 'streaming'), // Remove the 'streaming' message once complete
                    { id: Date.now().toString(), type: 'bot', content: responseChunk }, // Add the complete bot message
                ]);
                setIsLoading(false);
                eventSource.close(); // Close the connection once the stream is complete
            }
        };

        eventSource.onerror = (err: any) => {
            console.error('Error:', err);
            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), type: 'bot', content: 'Sorry, something went wrong. Please try again.' },
            ]);
            setIsLoading(false);
            eventSource.close();
        };

        setQuery('');
    };

    return (
        <div className="max-w-xl mx-auto p-4 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2 bg-white dark:bg-gray-900 p-4">
                {messages.map((msg) => {
                    // TypeScript now knows that msg.type can only be one of 'user', 'bot', or 'streaming'.
                    const styleConf = messageStylesConfig[msg.type] || messageStylesConfig.default;

                    return (
                        <div key={msg.id} className={styleConf.wrapper}>
                            <div className={`${commonBubbleClasses} ${styleConf.bubble}`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={chatRef} />
            </div>

            <div className="mt-4 flex items-center space-x-2">
                <input
                    type="text"
                    className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ask something..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter' && !isLoading && query) {
                            sendQuery();
                        }
                    }}
                />
                <button
                    onClick={sendQuery}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    disabled={isLoading || !query.trim()}
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
