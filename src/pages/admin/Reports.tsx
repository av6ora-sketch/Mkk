import { useLanguage } from "../../contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const mockData = [
  { name: 'Jan', users: 400, articles: 240, stores: 20 },
  { name: 'Feb', users: 300, articles: 139, stores: 25 },
  { name: 'Mar', users: 200, articles: 980, stores: 30 },
  { name: 'Apr', users: 278, articles: 390, stores: 35 },
  { name: 'May', users: 189, articles: 480, stores: 40 },
  { name: 'Jun', users: 239, articles: 380, stores: 45 },
  { name: 'Jul', users: 349, articles: 430, stores: 50 },
];

export default function AdminReports() {
  const { language } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'ar' ? 'التقارير' : 'Reports'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'عرض تقارير النظام' : 'View system reports'}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'نمو المستخدمين' : 'User Growth'}</CardTitle>
            <CardDescription>{language === 'ar' ? 'عدد المستخدمين الجدد شهرياً' : 'New users per month'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" name={language === 'ar' ? 'المستخدمين' : 'Users'} stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'إنشاء المحتوى' : 'Content Creation'}</CardTitle>
            <CardDescription>{language === 'ar' ? 'المقالات المنشأة شهرياً' : 'Articles generated per month'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="articles" name={language === 'ar' ? 'المقالات' : 'Articles'} fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
