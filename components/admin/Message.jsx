"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, ShieldCheck } from "lucide-react"; // Icons for user/admin

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => (await axios.get("/api/messages/admin")).data,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ messageId, reply }) =>
      await axios.post("/api/messages/admin", { messageId, reply }),
    onSuccess: () => {
      toast.success("Reply sent!");
      setReplyText("");
      queryClient.invalidateQueries(["messages"]);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const grouped = Array.isArray(messages)
    ? messages.reduce((acc, msg) => {
        const email = msg?.email ?? "unknown";
        if (!acc[email])
          acc[email] = { name: msg?.name ?? "Unknown", email, messages: [] };
        acc[email].messages.push(msg);
        return acc;
      }, {})
    : {};

  if (isLoading)
    return <p className="p-4 text-gray-500">Loading messages...</p>;

  const selectedUser = selectedUserEmail ? grouped[selectedUserEmail] : null;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Inbox</h2>
        <ScrollArea className="max-h-[70vh]">
          {Object.values(grouped).map((user) => (
            <div
              key={user.email}
              className={`mb-2 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedUserEmail === user.email
                  ? "bg-gray-100 shadow"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedUserEmail(user.email);
                setReplyText("");
              }}
            >
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">
                {user.messages.length} message
                {user.messages.length > 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        {!selectedUser && (
          <p className="text-gray-500">Select a user to view messages</p>
        )}

        {selectedUser && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Messages from {selectedUser.name} ({selectedUser.email})
            </h2>

            <ScrollArea className="flex-1 max-h-[60vh] space-y-4 mb-4">
              {selectedUser.messages
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((msg) => (
                  <div key={msg._id} className="flex flex-col space-y-1">
                    {/* User message */}
                    <div className="flex items-start space-x-2">
                      <User className="w-6 h-6 text-blue-500 mt-1" />
                      <div className="bg-white p-3 rounded-xl shadow max-w-xs md:max-w-md">
                        <p>{msg.message}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Admin reply */}
                    {msg.reply && (
                      <div className="flex items-start space-x-2 justify-end">
                        <div className="bg-[#f69224] text-white p-3 rounded-xl shadow max-w-xs md:max-w-md text-right">
                          <p>{msg.reply}</p>
                          <span className="text-xs text-gray-200">
                            {new Date(msg.repliedAt).toLocaleString()}
                          </span>
                        </div>
                        <ShieldCheck className="w-6 h-6 text-yellow-400 mt-1" />
                      </div>
                    )}
                  </div>
                ))}
            </ScrollArea>

            {/* Reply Box */}
            <div className="mt-auto">
              <Textarea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="mb-2"
                rows={4}
              />
              <div className="text-right">
                <Button
                  onClick={() => {
                    const lastUnreplied = selectedUser.messages.find(
                      (m) => !m.reply
                    );
                    if (!lastUnreplied) return toast("No message to reply!");
                    replyMutation.mutate({
                      messageId: lastUnreplied._id,
                      reply: replyText,
                    });
                  }}
                  disabled={!replyText}
                  className="bg-[#f69224] hover:bg-[#e27e1e] text-white"
                >
                  Send Reply
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
