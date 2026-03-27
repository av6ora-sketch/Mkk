import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { MessageSquare, LifeBuoy, Send, Loader2, X, MessageCircle, CheckCircle2, RotateCcw, User } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { db, auth } from "@/src/firebase";
import { collection, query, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, addDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";
import { cn } from "@/src/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  createdAt: any;
  updatedAt: any;
  userId: string;
  userName: string;
  userEmail: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  createdAt: any;
}

export default function AdminSupport() {
  const { language } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const q = query(
      collection(db, "tickets"),
      orderBy("updatedAt", "desc")
    );

    const unsubscribeTickets = onSnapshot(q, (snapshot) => {
      const ticketsData: Ticket[] = [];
      snapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(ticketsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "tickets");
      setLoading(false);
    });

    return () => unsubscribeTickets();
  }, []);

  useEffect(() => {
    if (!selectedTicket) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "tickets", selectedTicket.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messagesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `tickets/${selectedTicket.id}/messages`);
    });

    return () => unsubscribeMessages();
  }, [selectedTicket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !auth.currentUser) return;

    setSending(true);
    try {
      await addDoc(collection(db, "tickets", selectedTicket.id, "messages"), {
        senderId: auth.currentUser.uid,
        senderRole: 'admin',
        text: newMessage,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, "tickets", selectedTicket.id), {
        updatedAt: serverTimestamp()
      });

      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tickets/${selectedTicket.id}/messages`);
    } finally {
      setSending(false);
    }
  };

  const toggleTicketStatus = async () => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      const newStatus = selectedTicket.status === 'open' ? 'closed' : 'open';
      await updateDoc(doc(db, "tickets", selectedTicket.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tickets/${selectedTicket.id}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/5 rounded-2xl">
          <LifeBuoy className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{language === 'ar' ? 'إدارة تذاكر الدعم' : 'Support Tickets Management'}</h2>
          <p className="text-muted-foreground text-sm">{language === 'ar' ? 'قم بالرد على استفسارات المستخدمين وإدارة المحادثات.' : 'Respond to user inquiries and manage conversations.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'جميع التذاكر' : 'All Tickets'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm">{language === 'ar' ? 'لا توجد تذاكر دعم.' : 'No support tickets.'}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={cn(
                        "w-full text-right p-4 hover:bg-muted/50 transition-colors flex flex-col gap-1",
                        selectedTicket?.id === ticket.id && "bg-muted border-r-4 border-primary"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase",
                          ticket.status === 'open' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {ticket.status === 'open' ? (language === 'ar' ? 'مفتوحة' : 'Open') : (language === 'ar' ? 'مغلقة' : 'Closed')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {ticket.updatedAt?.toDate ? new Date(ticket.updatedAt.toDate()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm truncate w-full">{ticket.subject}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{ticket.userName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-8">
          {selectedTicket ? (
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="border-b border-border py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'المستخدم: ' : 'User: '} {selectedTicket.userName} ({selectedTicket.userEmail})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleTicketStatus}
                    disabled={updatingStatus}
                    className={cn(
                      selectedTicket.status === 'open' ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                    )}
                  >
                    {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (
                      selectedTicket.status === 'open' ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    {selectedTicket.status === 'open' ? (language === 'ar' ? 'إغلاق التذكرة' : 'Close Ticket') : (language === 'ar' ? 'إعادة فتح' : 'Reopen')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%] gap-1",
                      msg.senderRole === 'admin' ? (language === 'ar' ? "mr-auto items-end" : "ml-auto items-end") : (language === 'ar' ? "ml-auto items-start" : "mr-auto items-start")
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-2xl text-sm",
                      msg.senderRole === 'admin' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted text-foreground rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                      {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t border-border">
                {selectedTicket.status === 'open' ? (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب ردك هنا...' : 'Type your reply here...'}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center p-2 bg-muted rounded-lg text-sm text-muted-foreground">
                    {language === 'ar' ? 'هذه التذكرة مغلقة. قم بإعادة فتحها للرد.' : 'This ticket is closed. Reopen it to reply.'}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/20 rounded-3xl border border-dashed border-border">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
              <h3 className="text-xl font-bold mb-2">{language === 'ar' ? 'اختر تذكرة للبدء' : 'Select a ticket to start'}</h3>
              <p className="text-muted-foreground max-w-sm">
                {language === 'ar' ? 'قم باختيار تذكرة من القائمة الجانبية للرد على المستخدم.' : 'Select a ticket from the sidebar to respond to the user.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
