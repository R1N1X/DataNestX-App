import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft,
  User,
  Phone,
  Video,
  MoreVertical,
  Search
} from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/messages/conversations'],
  });

  const { data: messages = [] } = useQuery({
    queryKey: [`/api/messages/${selectedConversation}`],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { receiverId: string; content: string }) => 
      apiRequest('POST', '/api/messages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedConversation}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      setNewMessage('');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Send Message',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: newMessage.trim(),
    });
  };

  const filteredConversations = conversations.filter((conv: any) =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = conversations.find((conv: any) => 
    conv.senderId === selectedConversation || conv.receiverId === selectedConversation
  )?.otherUser;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access messages.</p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with buyers and sellers in your network
          </p>
        </motion.div>

        <div className="bg-white rounded-xl border overflow-hidden" style={{ height: '600px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r border-border bg-gray-50">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-full">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No conversations yet</h3>
                    <p className="text-muted-foreground text-sm px-4">
                      {searchQuery ? 'No conversations match your search' : 'Start a conversation by contacting a seller or buyer'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredConversations.map((conversation: any) => {
                      const otherUserId = conversation.senderId === user.id 
                        ? conversation.receiverId 
                        : conversation.senderId;
                      const isSelected = selectedConversation === otherUserId;

                      return (
                        <div
                          key={conversation.id}
                          className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                            isSelected ? 'bg-primary/5 border-r-2 border-primary' : ''
                          }`}
                          onClick={() => setSelectedConversation(otherUserId)}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={conversation.otherUser?.avatarUrl || ""} />
                              <AvatarFallback>
                                {conversation.otherUser?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {conversation.otherUser?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                  {new Date(conversation.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {conversation.senderId === user.id ? 'You: ' : ''}
                                {conversation.content}
                              </p>
                              <div className="flex items-center mt-2">
                                <div className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  conversation.otherUser?.role === 'buyer' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {conversation.otherUser?.role || 'user'}
                                </div>
                                {conversation.datasetId && (
                                  <div className="text-xs text-muted-foreground ml-2">
                                    📊 Dataset related
                                  </div>
                                )}
                                {conversation.requestId && (
                                  <div className="text-xs text-muted-foreground ml-2">
                                    📝 Request related
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2 flex flex-col">
              {selectedConversation && selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="lg:hidden"
                          onClick={() => setSelectedConversation(null)}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedUser.avatarUrl || ""} />
                          <AvatarFallback>{selectedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{selectedUser.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {selectedUser.role} • {selectedUser.rating ? `⭐ ${selectedUser.rating}` : 'No rating'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message: any, index: number) => {
                          const isFromUser = message.senderId === user.id;
                          const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
                          
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`flex items-start space-x-2 ${
                                isFromUser ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {!isFromUser && (
                                <Avatar className={`h-8 w-8 ${showAvatar ? '' : 'invisible'}`}>
                                  <AvatarImage src={selectedUser.avatarUrl || ""} />
                                  <AvatarFallback className="text-xs">
                                    {selectedUser.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isFromUser
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-foreground'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  isFromUser ? 'text-primary-100' : 'text-muted-foreground'
                                }`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              
                              {isFromUser && (
                                <Avatar className={`h-8 w-8 ${showAvatar ? '' : 'invisible'}`}>
                                  <AvatarImage src={user.avatarUrl || ""} />
                                  <AvatarFallback className="text-xs">
                                    {user.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border bg-white">
                    <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                      <div className="flex-1">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="resize-none"
                          disabled={sendMessageMutation.isPending}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="flex-shrink-0"
                      >
                        {sendMessageMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No conversation selected</h3>
                    <p className="text-muted-foreground">
                      Select a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
