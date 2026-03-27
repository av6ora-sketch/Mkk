import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Mail, MessageSquare, LifeBuoy, Lightbulb, Send, Loader2, ChevronRight, ChevronLeft, Plus, X, MessageCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { db, auth } from "@/src/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, getDocs } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-error";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  createdAt: any;
  updatedAt: any;
  userId: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  createdAt: any;
}

export default function Support() {
  const { t, language } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "tickets"),
          where("userId", "==", user.uid),
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
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim() || !auth.currentUser) return;

    setCreating(true);
    try {
      const ticketRef = await addDoc(collection(db, "tickets"), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "User",
        userEmail: auth.currentUser.email || "",
        subject: newTicketSubject,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "tickets", ticketRef.id, "messages"), {
        senderId: auth.currentUser.uid,
        senderRole: 'user',
        text: newTicketMessage,
        createdAt: serverTimestamp()
      });

      setNewTicketSubject("");
      setNewTicketMessage("");
      setShowNewTicketForm(false);
      const newTicketSnap = await getDocs(query(collection(db, "tickets"), where("__name__", "==", ticketRef.id)));
      if (!newTicketSnap.empty) {
        setSelectedTicket({ id: ticketRef.id, ...newTicketSnap.docs[0].data() } as Ticket);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "tickets");
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !auth.currentUser) return;

    setSending(true);
    try {
      await addDoc(collection(db, "tickets", selectedTicket.id, "messages"), {
        senderId: auth.currentUser.uid,
        senderRole: 'user',
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

  const faqs = language === 'ar' ? [
    { q: "كيف أقوم بربط متجري؟", a: "يمكنك ربط متجرك من خلال صفحة المتاجر ونسخ كود التتبع ولصقه في وسم head في موقعك." },
    { q: "متى تظهر التحليلات؟", a: "تظهر التحليلات فوراً بعد تركيب الكود وبدء زيارة العملاء لمتجرك." },
    { q: "كيف أقوم بترقية باقتي؟", a: "من خلال صفحة حسابي، يمكنك اختيار ترقية الباقة واختيار الخطة المناسبة." }
  ] : [
    { q: "How do I connect my store?", a: "You can connect your store through the Stores page by copying the tracking code and pasting it into the head tag of your website." },
    { q: "When do analytics appear?", a: "Analytics appear immediately after installing the code and customers start visiting your store." },
    { q: "How do I upgrade my plan?", a: "Through the My Account page, you can choose to upgrade your plan and select the appropriate one." }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 rounded-2xl">
            <LifeBuoy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('sidebar.support')}</h2>
            <p className="text-muted-foreground text-sm">{language === 'ar' ? 'فريق الدعم الفني متواجد دائماً للإجابة على استفساراتك.' : 'Our technical support team is always available to answer your inquiries.'}</p>
          </div>
        </div>
        <Button onClick={() => setShowNewTicketForm(true)} className="w-full md:w-auto">
          <Plus className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {language === 'ar' ? 'فتح تذكرة جديدة' : 'Open New Ticket'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm">{language === 'ar' ? 'لا توجد تذاكر دعم مفتوحة.' : 'No support tickets open.'}</p>
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
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-border py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                  <CardDescription className="text-xs">
                    {language === 'ar' ? 'تذكرة رقم: ' : 'Ticket ID: '} {selectedTicket.id}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded-full uppercase",
                    selectedTicket.status === 'open' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {selectedTicket.status === 'open' ? (language === 'ar' ? 'مفتوحة' : 'Open') : (language === 'ar' ? 'مغلقة' : 'Closed')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%] gap-1",
                      msg.senderRole === 'user' ? (language === 'ar' ? "mr-auto items-end" : "ml-auto items-end") : (language === 'ar' ? "ml-auto items-start" : "mr-auto items-start")
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-2xl text-sm",
                      msg.senderRole === 'user' 
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
                      placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center p-2 bg-muted rounded-lg text-sm text-muted-foreground">
                    {language === 'ar' ? 'هذه التذكرة مغلقة. لا يمكنك إرسال رسائل جديدة.' : 'This ticket is closed. You cannot send new messages.'}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/20 rounded-3xl border border-dashed border-border">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
              <h3 className="text-xl font-bold mb-2">{language === 'ar' ? 'اختر تذكرة للبدء' : 'Select a ticket to start'}</h3>
              <p className="text-muted-foreground max-w-sm">
                {language === 'ar' ? 'قم باختيار تذكرة من القائمة الجانبية لمتابعة المحادثة مع فريق الدعم.' : 'Select a ticket from the sidebar to continue the conversation with the support team.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-bold">{language === 'ar' ? 'فتح تذكرة جديدة' : 'Open New Ticket'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowNewTicketForm(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'ar' ? 'الموضوع' : 'Subject'}</label>
                <Input 
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder={language === 'ar' ? 'عنوان مشكلتك' : 'Your issue title'} 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'ar' ? 'الرسالة الأولى' : 'First Message'}</label>
                <textarea 
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  className="flex min-h-[120px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                  placeholder={language === 'ar' ? 'اشرح مشكلتك بالتفصيل هنا...' : 'Explain your issue in detail here...'}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowNewTicketForm(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="flex-1" disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {language === 'ar' ? 'فتح التذكرة' : 'Open Ticket'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* FAQs & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <h4 className="font-semibold text-sm mb-1">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl shrink-0">
              <Lightbulb className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">{language === 'ar' ? 'نصائح لتطوير المنصة' : 'Tips to improve the platform'}</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed mb-4">
                {language === 'ar' ? 'هل لديك فكرة أو اقتراح لتطوير Avbora؟ نحن نستمع لعملائنا دائماً لتحسين خدماتنا.' : 'Do you have an idea or suggestion to improve Avbora? We always listen to our customers to improve our services.'}
              </p>
              <a href="mailto:contact@avbora.online?subject=اقتراح تطوير" className="inline-flex items-center text-sm font-semibold hover:underline">
                {language === 'ar' ? 'أرسل اقتراحك' : 'Send your suggestion'} <Mail className={`h-4 w-4 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
