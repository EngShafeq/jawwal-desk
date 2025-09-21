import React from 'react';
import { Moon, Sun, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';

export const DashboardHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { exportData, importData, clearAllData } = useStore();
  const { toast } = useToast();

  const handleBackup = () => {
    exportData();
    toast({
      title: "تم تصدير البيانات",
      description: "تم تصدير جميع البيانات بنجاح",
      variant: "default",
    });
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            importData(data);
            toast({
              title: "تم استيراد البيانات",
              description: "تم استيراد البيانات بنجاح",
              variant: "default",
            });
          } catch (error) {
            toast({
              title: "خطأ في الاستيراد",
              description: "فشل في استيراد البيانات",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm('هل تريد حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      clearAllData();
      toast({
        title: "تم حذف البيانات",
        description: "تم حذف جميع البيانات",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="glass-card p-6 mb-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="arabic-title text-foreground mb-2">
            لوحة إدارة مهام متجر قطع الجوال
          </h1>
          <p className="arabic-body text-muted-foreground">
            نظام إدارة شامل للمهام والعمليات
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackup}
            className="glass-input border-0"
          >
            <Download className="h-4 w-4 ml-2" />
            نسخ احتياطي
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestore}
            className="glass-input border-0"
          >
            <Upload className="h-4 w-4 ml-2" />
            استرجاع
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="glass-input border-0 text-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 ml-2" />
            مسح الكل
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="glass-input border-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 ml-2" />
            ) : (
              <Moon className="h-4 w-4 ml-2" />
            )}
            الوضع: {theme === 'dark' ? 'فاتح' : 'داكن'}
          </Button>
        </div>
      </div>
    </header>
  );
};