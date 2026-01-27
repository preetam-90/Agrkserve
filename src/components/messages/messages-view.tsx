'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, MoreVertical, Phone, Video, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const conversations = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    avatar: '',
    lastMessage: 'Is the tractor available tomorrow?',
    time: '10:30 AM',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Amit Singh',
    avatar: '',
    lastMessage: 'Thanks for the service!',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'Suresh Patel',
    avatar: '',
    lastMessage: 'Can we reschedule?',
    time: 'Yesterday',
    unread: 0,
    online: true,
  },
];

const messages = [
  {
    id: 1,
    senderId: 1,
    text: 'Hello, is the tractor available for rent tomorrow?',
    time: '10:00 AM',
    isMe: false,
  },
  {
    id: 2,
    senderId: 0, // Me
    text: 'Yes, it is available. What time do you need it?',
    time: '10:05 AM',
    isMe: true,
  },
  {
    id: 3,
    senderId: 1,
    text: 'Around 8 AM would be great.',
    time: '10:15 AM',
    isMe: false,
  },
  {
    id: 4,
    senderId: 1,
    text: 'Is the tractor available tomorrow?',
    time: '10:30 AM',
    isMe: false,
  },
];

interface MessagesViewProps {
  className?: string;
}

export function MessagesView({ className }: MessagesViewProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // Auto-select first conversation on desktop
  useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSelectedConversation(1);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    // Handle send logic here
    setMessageInput('');
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]", className)}>
      {/* Conversations List */}
      <Card className={cn(
        "col-span-1 flex flex-col h-full overflow-hidden transition-all duration-300",
        selectedConversation ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages..."
              className="pl-9 bg-gray-50"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={cn(
                  "flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0",
                  selectedConversation === conv.id && "bg-green-50 hover:bg-green-50"
                )}
              >
                <div className="relative">
                  <Avatar src={conv.avatar} name={conv.name} />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium truncate">{conv.name}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{conv.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 bg-green-600 text-white text-xs flex items-center justify-center rounded-full">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className={cn(
        "col-span-1 md:col-span-2 flex flex-col h-full overflow-hidden transition-all duration-300",
        !selectedConversation ? "hidden md:flex" : "flex"
      )}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2"
                  onClick={() => setSelectedConversation(null)}
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
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full",
                      msg.isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                        msg.isMe
                          ? "bg-green-600 text-white rounded-tr-none"
                          : "bg-white text-gray-900 rounded-tl-none border border-gray-100"
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1 text-right opacity-70",
                          msg.isMe ? "text-green-100" : "text-gray-400"
                        )}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-gray-500">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Conversation</h3>
            <p className="text-gray-500 max-w-sm">
              Choose a conversation from the list to start messaging with providers or renters.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
