import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DropdownKey = 'shippingCompanies' | 'cancelReasons' | 'issueCategories' | 'returnStatuses' | 'brands' | 'partTypes' | 'colors' | 'taskTitles';

export const DropdownManager: React.FC = () => {
  const { data, setData } = useStore();
  const { toast } = useToast();
  const [selectedDropdown, setSelectedDropdown] = useState<DropdownKey>('shippingCompanies');
  const [newItem, setNewItem] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const dropdownLabels: Record<DropdownKey, string> = {
    shippingCompanies: 'شركات الشحن',
    cancelReasons: 'أسباب الإلغاء',
    issueCategories: 'تصنيفات القضايا',
    returnStatuses: 'حالات الإرجاع',
    brands: 'العلامات التجارية',
    partTypes: 'أنواع القطع',
    colors: 'الألوان',
    taskTitles: 'عناوين المهام'
  };

  const addItem = () => {
    if (!newItem.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال العنصر الجديد",
        variant: "destructive",
      });
      return;
    }

    const currentItems = data.dropdowns[selectedDropdown];
    if (currentItems.includes(newItem.trim())) {
      toast({
        title: "عنصر مكرر",
        description: "هذا العنصر موجود بالفعل",
        variant: "destructive",
      });
      return;
    }

    setData({
      ...data,
      dropdowns: {
        ...data.dropdowns,
        [selectedDropdown]: [...currentItems, newItem.trim()]
      }
    });

    // If adding a shipping company, also add tracking URL if provided
    if (selectedDropdown === 'shippingCompanies' && trackingUrl.trim()) {
      setData({
        ...data,
        dropdowns: {
          ...data.dropdowns,
          [selectedDropdown]: [...currentItems, newItem.trim()],
          trackingLinks: {
            ...data.dropdowns.trackingLinks,
            [newItem.trim()]: trackingUrl.trim()
          }
        }
      });
    }

    setNewItem('');
    setTrackingUrl('');
    toast({
      title: "تم الإضافة",
      description: "تم إضافة العنصر بنجاح",
      variant: "default",
    });
  };

  const removeItem = (item: string) => {
    if (confirm(`هل تريد حذف "${item}"؟`)) {
      setData({
        ...data,
        dropdowns: {
          ...data.dropdowns,
          [selectedDropdown]: data.dropdowns[selectedDropdown].filter(i => i !== item)
        }
      });

      // Also remove tracking link if it's a shipping company
      if (selectedDropdown === 'shippingCompanies') {
        const newTrackingLinks = { ...data.dropdowns.trackingLinks };
        delete newTrackingLinks[item];
        setData({
          ...data,
          dropdowns: {
            ...data.dropdowns,
            [selectedDropdown]: data.dropdowns[selectedDropdown].filter(i => i !== item),
            trackingLinks: newTrackingLinks
          }
        });
      }

      toast({
        title: "تم الحذف",
        description: "تم حذف العنصر بنجاح",
        variant: "default",
      });
    }
  };

  const exportToCSV = () => {
    const items = data.dropdowns[selectedDropdown];
    const csvContent = '\uFEFF' + items.join('\n'); // BOM for Arabic support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dropdownLabels[selectedDropdown]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "تم التصدير",
      description: "تم تصدير البيانات إلى CSV",
      variant: "default",
    });
  };

  const importFromCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            // Remove BOM if present
            const cleanText = text.replace(/^\uFEFF/, '');
            const items = cleanText.split('\n')
              .map(item => item.trim())
              .filter(item => item.length > 0);

            setData({
              ...data,
              dropdowns: {
                ...data.dropdowns,
                [selectedDropdown]: [...new Set([...data.dropdowns[selectedDropdown], ...items])]
              }
            });

            toast({
              title: "تم الاستيراد",
              description: `تم استيراد ${items.length} عنصر`,
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

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إدارة القوائم المنسدلة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropdown Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedDropdown} onValueChange={(value: DropdownKey) => setSelectedDropdown(value)}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="اختر القائمة" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(dropdownLabels) as DropdownKey[]).map(key => (
                  <SelectItem key={key} value={key}>{dropdownLabels[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add New Item */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="أدخل العنصر الجديد..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="glass-input border-0"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            {selectedDropdown === 'shippingCompanies' && (
              <Input
                placeholder="رابط التتبع (اختياري)"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="glass-input border-0"
              />
            )}
            <Button onClick={addItem} className="btn-gradient">
              <Plus className="h-4 w-4 ml-2" />
              إضافة
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} className="glass-input border-0">
              <Download className="h-4 w-4 ml-2" />
              تصدير CSV
            </Button>
            <Button variant="outline" onClick={importFromCSV} className="glass-input border-0">
              <Upload className="h-4 w-4 ml-2" />
              استيراد CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Items */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle">
            {dropdownLabels[selectedDropdown]} ({data.dropdowns[selectedDropdown].length} عنصر)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.dropdowns[selectedDropdown].map((item, index) => (
              <div key={index} className="glass-input p-3 rounded-lg flex items-center justify-between">
                <span className="arabic-body">{item}</span>
                <div className="flex items-center gap-2">
                  {selectedDropdown === 'shippingCompanies' && data.dropdowns.trackingLinks[item] && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(data.dropdowns.trackingLinks[item], '_blank')}
                      className="glass-input border-0 p-1 h-6 w-6"
                    >
                      🔗
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem(item)}
                    className="text-destructive hover:text-destructive-foreground glass-input border-0 p-1 h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {selectedDropdown === 'shippingCompanies' && (
            <div className="mt-4">
              <h4 className="arabic-subtitle mb-2">روابط التتبع:</h4>
              <div className="space-y-2">
                {Object.entries(data.dropdowns.trackingLinks).map(([company, url]) => (
                  <div key={company} className="glass-input p-2 rounded-lg text-sm">
                    <div className="font-medium">{company}</div>
                    <div className="text-muted-foreground text-xs">{url}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};