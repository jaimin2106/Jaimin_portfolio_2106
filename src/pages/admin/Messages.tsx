import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Mail, Check, Trash2, Clock, MailOpen, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error in Messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "messages", id), { read: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to mark as read");
    }
  };

  const deleteMessage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      toast.success("Message deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete message");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading messages...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Messages</h1>
          <p className="text-gray-500 mt-1">Manage contact form inquiries</p>
        </div>
        <div className="bg-black/5 px-4 py-2 rounded-full text-sm font-medium">
          {messages.filter(m => !m.read).length} Unread
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* List */}
        <div className="md:col-span-1 bg-white border border-black/5 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-black/5 bg-gray-50/50">
            <h2 className="font-semibold text-sm">Inbox</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Mail className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {messages.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.read) markAsRead(msg.id);
                    }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === msg.id ? "bg-gray-50" : ""
                    } ${!msg.read ? "bg-orange-50/30" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-medium text-sm truncate pr-2 ${!msg.read ? 'font-bold' : ''}`}>
                        {msg.name}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), 'MMM d') : ''}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mb-2">{msg.email}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded-full text-gray-600">
                        {msg.service}
                      </span>
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-[#E85D04]"></span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="md:col-span-2 bg-white border border-black/5 rounded-2xl flex flex-col overflow-hidden">
          {selectedMessage ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full"
              >
                <div className="p-6 border-b border-black/5 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedMessage.name}</h2>
                    <a href={`mailto:${selectedMessage.email}`} className="text-sm text-[#E85D04] hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selectedMessage.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedMessage.createdAt?.seconds ? format(new Date(selectedMessage.createdAt.seconds * 1000), 'MMM d, yyyy h:mm a') : 'Unknown Date'}
                    </span>
                    <button
                      onClick={(e) => deleteMessage(selectedMessage.id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="mb-6">
                    <span className="text-xs font-mono uppercase text-gray-500 block mb-2">Interested In</span>
                    <span className="bg-black/5 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedMessage.service}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase text-gray-500 block mb-2">Message</span>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-black/5 bg-gray-50 flex justify-end">
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E85D04] transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" /> Reply via Email
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MailOpen className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
