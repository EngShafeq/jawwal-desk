import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/hooks/useStore';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Truck, 
  RotateCcw, 
  AlertTriangle, 
  CheckSquare 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const Reports: React.FC = () => {
  const { data } = useStore();

  // KPI Calculations
  const waitingListKPIs = {
    total: data.waitingList.filter(i => !i.archived).length,
    available: data.waitingList.filter(i => !i.archived && i.availability === 'متوفر').length,
    unavailable: data.waitingList.filter(i => !i.archived && i.availability === 'غير متوفر').length,
    processed: data.waitingList.filter(i => i.processed).length,
  };

  const shippingKPIs = {
    total: data.shipping.filter(i => !i.archived).length,
    paid: data.shipping.filter(i => !i.archived && i.paymentStatus === 'تم السداد').length,
    cod: data.shipping.filter(i => !i.archived && i.paymentStatus === 'الدفع عند الاستلام').length,
    overdue: data.shipping.filter(i => !i.archived && i.followUpDate && new Date(i.followUpDate) < new Date()).length,
  };

  const returnsKPIs = {
    total: data.returns.filter(i => !i.archived).length,
    new: data.returns.filter(i => !i.archived && i.status === 'جديد').length,
    processing: data.returns.filter(i => !i.archived && i.status === 'قيد المعالجة').length,
    completed: data.returns.filter(i => !i.archived && i.status === 'مكتمل').length,
  };

  const issuesKPIs = {
    total: data.issues.filter(i => !i.archived).length,
    processing: data.issues.filter(i => !i.archived && i.status === 'قيد المعالجة').length,
    completed: data.issues.filter(i => !i.archived && i.status === 'منجز').length,
    overdue: data.issues.filter(i => !i.archived && i.followUpDate && new Date(i.followUpDate) < new Date()).length,
  };

  const tasksKPIs = {
    total: data.tasks.filter(i => !i.archived).length,
    active: data.tasks.filter(i => !i.archived && i.status === 'قيد التنفيذ').length,
    completed: data.tasks.filter(i => !i.archived && i.status === 'منجز').length,
    overdue: data.tasks.filter(i => !i.archived && i.dueDate && new Date(i.dueDate) < new Date() && i.status === 'قيد التنفيذ').length,
  };

  // Chart Data
  const shippingCompaniesData = {
    labels: data.dropdowns.shippingCompanies,
    datasets: [
      {
        label: 'عدد الشحنات',
        data: data.dropdowns.shippingCompanies.map(company =>
          data.shipping.filter(s => !s.archived && s.company === company).length
        ),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 101, 101, 0.6)',
          'rgba(251, 191, 36, 0.6)',
          'rgba(139, 92, 246, 0.6)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const issueCategoriesData = {
    labels: ['تأخير', 'نقص', 'تالف'],
    datasets: [
      {
        label: 'عدد القضايا',
        data: [
          data.issues.filter(i => !i.archived && i.category === 'تأخير').length,
          data.issues.filter(i => !i.archived && i.category === 'نقص').length,
          data.issues.filter(i => !i.archived && i.category === 'تالف').length,
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Cairo',
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Cairo',
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Cairo',
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'Cairo',
          },
        },
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="arabic-subtitle text-blue-600">{waitingListKPIs.total}</div>
                <div className="text-sm text-muted-foreground">قائمة الانتظار</div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="arabic-subtitle text-green-600">{shippingKPIs.total}</div>
                <div className="text-sm text-muted-foreground">الشحنات</div>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="arabic-subtitle text-purple-600">{returnsKPIs.total}</div>
                <div className="text-sm text-muted-foreground">الإرجاعات</div>
              </div>
              <RotateCcw className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="arabic-subtitle text-red-600">{issuesKPIs.total}</div>
                <div className="text-sm text-muted-foreground">القضايا</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="arabic-subtitle text-yellow-600">{tasksKPIs.total}</div>
                <div className="text-sm text-muted-foreground">المهام</div>
              </div>
              <CheckSquare className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Waiting List KPIs */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="arabic-subtitle text-blue-600">قائمة الانتظار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>المتوفر</span>
              <span className="font-medium text-green-600">{waitingListKPIs.available}</span>
            </div>
            <div className="flex justify-between">
              <span>غير المتوفر</span>
              <span className="font-medium text-red-600">{waitingListKPIs.unavailable}</span>
            </div>
            <div className="flex justify-between">
              <span>تمت المعالجة</span>
              <span className="font-medium text-gray-600">{waitingListKPIs.processed}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping KPIs */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="arabic-subtitle text-green-600">الشحنات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>مدفوعة</span>
              <span className="font-medium text-green-600">{shippingKPIs.paid}</span>
            </div>
            <div className="flex justify-between">
              <span>عند الاستلام</span>
              <span className="font-medium text-orange-600">{shippingKPIs.cod}</span>
            </div>
            <div className="flex justify-between">
              <span>متأخرة المتابعة</span>
              <span className="font-medium text-red-600">{shippingKPIs.overdue}</span>
            </div>
          </CardContent>
        </Card>

        {/* Returns KPIs */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="arabic-subtitle text-purple-600">الإرجاعات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>جديد</span>
              <span className="font-medium text-blue-600">{returnsKPIs.new}</span>
            </div>
            <div className="flex justify-between">
              <span>قيد المعالجة</span>
              <span className="font-medium text-yellow-600">{returnsKPIs.processing}</span>
            </div>
            <div className="flex justify-between">
              <span>مكتمل</span>
              <span className="font-medium text-green-600">{returnsKPIs.completed}</span>
            </div>
          </CardContent>
        </Card>

        {/* Issues KPIs */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="arabic-subtitle text-red-600">القضايا</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>قيد المعالجة</span>
              <span className="font-medium text-blue-600">{issuesKPIs.processing}</span>
            </div>
            <div className="flex justify-between">
              <span>منجز</span>
              <span className="font-medium text-green-600">{issuesKPIs.completed}</span>
            </div>
            <div className="flex justify-between">
              <span>متأخرة</span>
              <span className="font-medium text-red-600">{issuesKPIs.overdue}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Companies Chart */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="arabic-subtitle flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              الشحنات حسب الشركة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={shippingCompaniesData} options={chartOptions} />
          </CardContent>
        </Card>

        {/* Issue Categories Chart */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="arabic-subtitle flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              القضايا حسب التصنيف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={issueCategoriesData} options={pieOptions} />
          </CardContent>
        </Card>
      </div>

      {/* Tasks KPIs */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle text-yellow-600">ملخص المهام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="arabic-subtitle text-blue-600">{tasksKPIs.active}</div>
              <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
            </div>
            <div className="text-center">
              <div className="arabic-subtitle text-green-600">{tasksKPIs.completed}</div>
              <div className="text-sm text-muted-foreground">مكتملة</div>
            </div>
            <div className="text-center">
              <div className="arabic-subtitle text-red-600">{tasksKPIs.overdue}</div>
              <div className="text-sm text-muted-foreground">متأخرة</div>
            </div>
            <div className="text-center">
              <div className="arabic-subtitle text-gray-600">
                {Math.round((tasksKPIs.completed / tasksKPIs.total) * 100) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">نسبة الإنجاز</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="arabic-subtitle text-green-600">
                  {Math.round((waitingListKPIs.available / waitingListKPIs.total) * 100) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">معدل التوفر</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="arabic-subtitle text-blue-600">
                  {Math.round((shippingKPIs.paid / shippingKPIs.total) * 100) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">معدل الدفع المسبق</div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="arabic-subtitle text-purple-600">
                  {Math.round((returnsKPIs.completed / returnsKPIs.total) * 100) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">معدل إنجاز الإرجاعات</div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};