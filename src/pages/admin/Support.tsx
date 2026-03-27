import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { MessageSquare, LifeBuoy, Send, Loader2, X, MessageCircle, CheckCircle2, RotateCcw, User, Ban, Trash2, AlertTriangle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { db, auth } from "@/src/firebase";
import { collection, query, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, addDoc, getDoc, deleteDoc } from "firebase/firestore";
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
  const { permissions } = useOutletContext<{ permissions: Record<string, boolean> }>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [ticketUser, setTicketUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!auth.currentUser) return;
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
    if (!selectedTicket || !auth.currentUser) {
      setMessages([]);
      setShowUserInfo(false);
      setTicketUser(null);
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

  const fetchUserInfo = async (userId: string) => {
    if (!permissions.manage_users) return;
    setUserLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setTicketUser({ id: userDoc.id, ...userDoc.data() });
      } else {
        setTicketUser(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserClick = () => {
    if (selectedTicket && permissions.manage_users) {
      if (!showUserInfo) {
        fetchUserInfo(selectedTicket.userId);
      }
      setShowUserInfo(!showUserInfo);
    }
  };

  const handleBanUser = async () => {
    if (!ticketUser || !selectedTicket) return;
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حظر هذا المستخدم مؤقتاً؟' : 'Are you sure you want to temporarily ban this user?')) return;
    
    setActionLoading(true);
    try {
      const isBanned = !ticketUser.isBanned;
      await updateDoc(doc(db, "users", ticketUser.id), {
        isBanned: isBanned
      });
      setTicketUser({ ...ticketUser, isBanned });
      alert(language === 'ar' ? `تم ${isBanned ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح.` : `User successfully ${isBanned ? 'banned' : 'unbanned'}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${ticketUser.id}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!ticketUser || !selectedTicket) return;
    if (!window.confirm(language === 'ar' ? 'تحذير: هل أنت متأكد من حذف هذا المستخدم نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.' : 'WARNING: Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "users", ticketUser.id));
      alert(language === 'ar' ? 'تم حذف المستخدم بنجاح.' : 'User successfully deleted.');
      setShowUserInfo(false);
      setTicketUser(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${ticketUser.id}`);
    } finally {
      setActionLoading(false);
    }
  };

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
              <CardHeader className="border-b border-border py-4 flex flex-row items-center justify-between relative">
                <div>
                  <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={handleUserClick}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <User className="h-3 w-3" />
                      {language === 'ar' ? 'المستخدم: ' : 'User: '} {selectedTicket.userName} ({selectedTicket.userEmail})
                    </button>
                  </div>
                </div>
                
                {/* User Info Card Popup */}
                {showUserInfo && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-xl z-50 p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        {language === 'ar' ? 'معلومات العميل' : 'Customer Info'}
                      </h4>
                      <button onClick={() => setShowUserInfo(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {userLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : ticketUser ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">{language === 'ar' ? 'الاسم:' : 'Name:'}</span>
                          <p className="font-medium">{ticketUser.firstName} {ticketUser.lastName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</span>
                          <p className="font-medium">{ticketUser.email}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ar' ? 'الخطة:' : 'Plan:'}</span>
                          <p className="font-medium">{ticketUser.plan}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                          <p className="font-medium flex items-center gap-2">
                            {ticketUser.isBanned ? (
                              <span className="text-red-600 flex items-center gap-1"><Ban className="h-3 w-3" /> {language === 'ar' ? 'محظور' : 'Banned'}</span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {language === 'ar' ? 'نشط' : 'Active'}</span>
                            )}
                          </p>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-border flex flex-col gap-2">
                          <Button 
                            variant={ticketUser.isBanned ? "outline" : "destructive"} 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={handleBanUser}
                            disabled={actionLoading}
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                            {ticketUser.isBanned 
                              ? (language === 'ar' ? 'إلغاء الحظر' : 'Unban User') 
                              : (language === 'ar' ? 'حظر مؤقت' : 'Temporary Ban')}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="w-full justify-start bg-red-700 hover:bg-red-800"
                            onClick={handleDeleteUser}
                            disabled={actionLoading}
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            {language === 'ar' ? 'حذف العميل نهائياً' : 'Delete User Permanently'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground flex flex-col items-center">
                        <AlertTriangle className="h-8 w-8 mb-2 text-yellow-500" />
                        <p>{language === 'ar' ? 'لم يتم العثور على بيانات المستخدم. قد يكون تم حذفه.' : 'User data not found. They may have been deleted.'}</p>
                      </div>
                    )}
                  </div>
                )}

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
