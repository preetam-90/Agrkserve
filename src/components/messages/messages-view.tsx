'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data (ids as strings to match backend/store conventions)
const conversations = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    avatar: '',
    lastMessage: 'Is the tractor available tomorrow?',
    time: '10:30 AM',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Amit Singh',
    avatar: '',
    lastMessage: 'Thanks for the service!',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Suresh Patel',
    avatar: '',
    lastMessage: 'Can we reschedule?',
    time: 'Yesterday',
    unread: 0,
    online: true,
  },
];

const initialMessages = [
  {
    id: '1',
    senderId: '1',
    text: 'Hello, is the tractor available for rent tomorrow?',
    time: '10:00 AM',
    isMe: false,
  },
  {
    id: '2',
    senderId: '0', // Me
    text: 'Yes, it is available. What time do you need it?',
    time: '10:05 AM',
    isMe: true,
  },
  {
    id: '3',
    senderId: '1',
    text: 'Around 8 AM would be great.',
    time: '10:15 AM',
    isMe: false,
  },
  {
    id: '4',
    senderId: '1',
    text: 'Is the tractor available tomorrow?',
    time: '10:30 AM',
    isMe: false,
  },
];

interface MessagesViewProps {
  className?: string;
}

export function MessagesView({ className }: MessagesViewProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messagesList, setMessagesList] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-select first conversation on desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {

// eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedConversation(conversations[0]?.id ?? null);
    }
     
  }, []);

  // Scroll to bottom when messages change or conversation changes
  useEffect(() => {
    // small timeout helps when DOM updates are still pending
    const t = setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
      50
    );
    return () => clearTimeout(t);
  }, [messagesList, selectedConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Optimistic local add (replace with store/send integration)
    const newMessage = {
      id: Date.now().toString(),
      senderId: '0',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessagesList((prev) => [...prev, newMessage]);
    setMessageInput('');
  };

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className={cn('grid h-[calc(100vh-8rem)] grid-cols-1 gap-6 md:grid-cols-3', className)}>
      {/* Conversations List */}
      <Card
        className={cn(
          'col-span-1 flex h-full flex-col overflow-hidden transition-all duration-300',
          selectedConversation ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="border-b p-4">
          <h1 className="mb-4 text-xl font-bold">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search messages..." className="bg-gray-50 pl-9" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col" role="listbox" aria-label="Conversations">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                role="option"
                aria-selected={selectedConversation === conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={cn(
                  'flex items-center gap-3 border-b border-gray-50 p-4 text-left transition-colors last:border-0 hover:bg-gray-50',
                  selectedConversation === conv.id && 'bg-green-50 hover:bg-green-50'
                )}
              >
                <div className="relative">
                  <Avatar src={conv.avatar} name={conv.name} />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <span className="truncate font-medium">{conv.name}</span>
                    <span className="ml-2 whitespace-nowrap text-xs text-gray-500">
                      {conv.time}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-500">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card
        className={cn(
          'col-span-1 flex h-full flex-col overflow-hidden transition-all duration-300 md:col-span-2',
          !selectedConversation ? 'hidden md:flex' : 'flex'
        )}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="z-10 flex items-center justify-between border-b bg-white p-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-ml-2 md:hidden"
                  onClick={() => setSelectedConversation(null)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar src={currentConversation?.avatar} name={currentConversation?.name} />
                <div>
                  <h2 className="font-semibold">{currentConversation?.name}</h2>
                  <p className="text-xs text-green-600">
                    {currentConversation?.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label="Start voice call">
                  <Phone className="h-5 w-5 text-gray-500" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Start video call">
                  <Video className="h-5 w-5 text-gray-500" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="More actions">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 bg-gray-50 p-4">
              <div className="space-y-4">
                {messagesList.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex w-full', msg.isMe ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
                        msg.isMe
                          ? 'rounded-tr-none bg-green-600 text-white'
                          : 'rounded-tl-none border border-gray-100 bg-white text-gray-900'
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={cn(
                          'mt-1 text-right text-[10px] opacity-70',
                          msg.isMe ? 'text-green-100' : 'text-gray-400'
                        )}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Dummy element used as a scroll target */}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-500"
                  aria-label="Attach image"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  aria-label="Message input"
                />
                <Button
                  type="submit"
                  className="bg-green-600 text-white hover:bg-green-700"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Select a Conversation</h3>
            <p className="max-w-sm text-gray-500">
              Choose a conversation from the list to start messaging with providers or renters.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
