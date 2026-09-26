'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ApiResponse, MessageData } from '@/types/ApiResponse';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

async function getJson(url: string, init?: RequestInit): Promise<ApiResponse> {
  const response = await fetch(url, init);
  const data: ApiResponse = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message ?? 'Request failed');
  }
  return data;
}

function UserDashboard() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(true);
  const [acceptMessages, setAcceptMessages] = useState(false);
  // window only exists in the browser; the server render gets ''
  const baseUrl = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ''
  );

  const { data: session } = useSession();

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message._id !== messageId));
  };

  const fetchAcceptMessages = useCallback(async () => {
    try {
      const data = await getJson('/api/accept-message');
      setAcceptMessages(Boolean(data.isAcceptingMessage));
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to fetch message settings',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    try {
      const data = await getJson('/api/get-message');
      setMessages(data.messages || []);
      if (refresh) {
        toast('Refreshed Messages', { description: 'Showing latest messages' });
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to fetch messages',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial state from the server (state is only set in promise callbacks)
  const userId = session?.user?._id;
  useEffect(() => {
    if (!userId) return;

    Promise.resolve().then(() => {
      fetchMessages();
      fetchAcceptMessages();
    });
  }, [userId, fetchAcceptMessages, fetchMessages]);

  // Handle switch change
  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);
    try {
      const data = await getJson('/api/accept-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptMessage: !acceptMessages }),
      });
      setAcceptMessages(Boolean(data.isAcceptingMessage));
      toast(data.message);
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update message settings',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session.user;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast('URL Copied!', {
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="w-full p-2 mr-2 rounded-md border bg-gray-50"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <Switch
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        aria-label="Refresh messages"
        onClick={(e) => {
          e.preventDefault();
          setIsLoading(true);
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
