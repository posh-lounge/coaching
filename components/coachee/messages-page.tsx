"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Search } from "lucide-react";
import { useCoachConversations, useCoachMessages, useCoachSendMessage, useCoacheeConversations, useCoacheeMessages, useCoacheeSendMessage } from "@/lib/api/v1/hooks";

interface Props { role: "coach" | "coachee"; }

function Avatar({ name, photo, size = 10 }: { name: string; photo?: string | null; size?: number }) {
  const s = `w-${size} h-${size}`;
  return (
    <div className={`${s} rounded-full overflow-hidden bg-indigo-100 shrink-0`}>
      {photo ? <img src={photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-sm">{name?.[0]}</div>}
    </div>
  );
}

export default function MessagesPage({ role }: Props) {
  const [selectedRelId, setSelectedRelId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convos   = role === "coach" ? useCoachConversations()   : useCoacheeConversations();
  const messages = role === "coach" ? useCoachMessages(selectedRelId)   : useCoacheeMessages(selectedRelId);
  const sendMsg  = role === "coach" ? useCoachSendMessage()   : useCoacheeSendMessage();

  const conversations = convos.data?.conversations ?? [];
  const msgs          = messages.data?.messages    ?? [];
  const selected      = conversations.find((c: any) => c.rel_id === selectedRelId);

  const filtered = conversations.filter((c: any) =>
    !search || c.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || !selectedRelId) return;
    const text = input;
    setInput("");
    await sendMsg.mutateAsync({ rel_id: selectedRelId, content: text });
  };

  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d: string) => {
    const now = new Date(); const dt = new Date(d);
    if (dt.toDateString() === now.toDateString()) return fmtTime(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 mb-3">Messages</h1>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 bg-gray-50"/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12"><MessageCircle size={32} className="mx-auto mb-2 text-gray-200"/><p className="text-gray-400 text-sm">No conversations yet</p></div>
          ) : filtered.map((c: any) => (
            <button key={c.rel_id} onClick={() => setSelectedRelId(c.rel_id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition text-left ${selectedRelId === c.rel_id ? "bg-indigo-50 border-l-2 border-l-indigo-600" : ""}`}>
              <div className="relative">
                <Avatar name={c.display_name} photo={c.profile_photo} size={10}/>
                {c.unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{c.unread}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold truncate ${c.unread > 0 ? "text-gray-900" : "text-gray-700"}`}>{c.display_name}</p>
                  {c.last_msg_at && <span className="text-[10px] text-gray-400 shrink-0 ml-2">{fmtDate(c.last_msg_at)}</span>}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message || "No messages yet"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selectedRelId && selected ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
            <Avatar name={selected.display_name} photo={selected.profile_photo} size={10}/>
            <div>
              <h2 className="font-bold text-gray-900">{selected.display_name}</h2>
              <p className="text-xs text-gray-400">{selected.rel_type?.replace("_", " ")} · {selected.sessions_remaining} sessions remaining</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {msgs.map((m: any, i: number) => {
              const mine = m.sender_id === selected.rel_id.toString(); // simplified — use actual userId in production
              const showDate = i === 0 || new Date(msgs[i-1].created_at).toDateString() !== new Date(m.created_at).toDateString();
              return (
                <React.Fragment key={m.msg_id}>
                  {showDate && <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400 whitespace-nowrap">{new Date(m.created_at).toLocaleDateString("en-US", { weekday:"short",month:"short",day:"numeric" })}</span><div className="flex-1 h-px bg-gray-200"/></div>}
                  <div className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                    <Avatar name={m.firstname} size={8}/>
                    <div className={`max-w-xs lg:max-w-md ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${mine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"}`}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">{fmtTime(m.created_at)}</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef}/>
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-4 shrink-0">
            <div className="flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-indigo-400 p-3 transition">
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1} placeholder={`Message ${selected.display_name}...`}
                className="flex-1 bg-transparent text-sm resize-none outline-none text-gray-900 placeholder-gray-400 max-h-32"/>
              <button onClick={send} disabled={!input.trim() || sendMsg.isPending}
                className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shrink-0">
                <Send size={15}/>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4"><MessageCircle size={36} className="text-indigo-400"/></div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Select a conversation</h3>
            <p className="text-gray-400 text-sm">Choose a conversation from the left to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
