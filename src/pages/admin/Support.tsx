import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { handleFirestoreError, OperationType } from "../../lib/firestore-error";

interface SupportTicket {
  id: string;
  ownerUid: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt?: string;
}

export default function AdminSupport() {
  const { language, t } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const path = "support_tickets";
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
        return;
      }
      const ticketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
      setTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchTickets();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const path = "support_tickets";
      try {
        await updateDoc(doc(db, path, id), { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `${path}/${id}`);
        return;
      }
      await fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة تذاكر الدعم' : 'Manage support tickets'}
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border rounded-xl bg-card">
          {language === 'ar' ? 'لا توجد تذاكر دعم حالياً.' : 'No support tickets at the moment.'}
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="flex flex-row items-start justify-between py-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      {language === 'ar' ? 'بواسطة: ' : 'By: '} {ticket.ownerUid}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ticket.createdAt ? format(new Date(ticket.createdAt), "PPP p") : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                    ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <div className="flex gap-2 mt-2">
                    {ticket.status !== 'open' && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(ticket.id, 'open')}>
                        <Clock className="mr-2 h-4 w-4" />
                        {language === 'ar' ? 'مفتوح' : 'Open'}
                      </Button>
                    )}
                    {ticket.status !== 'in_progress' && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(ticket.id, 'in_progress')}>
                        <Loader2 className="mr-2 h-4 w-4" />
                        {language === 'ar' ? 'قيد المعالجة' : 'In Progress'}
                      </Button>
                    )}
                    {ticket.status !== 'closed' && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(ticket.id, 'closed')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {language === 'ar' ? 'إغلاق' : 'Close'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                  {ticket.message}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
