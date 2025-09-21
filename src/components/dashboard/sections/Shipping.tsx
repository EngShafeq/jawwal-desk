import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore, ShippingItem } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Copy, 
  Search, 
  ExternalLink, 
  Edit, 
  Trash2,
  Archive,
  CreditCard,
  CheckSquare
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export const Shipping: React.FC = () => {
  const { data, setData } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ShippingItem>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const itemsPerPage = 25;
  const filteredItems = data.shipping.filter(item => 
    !item.archived && (
      item.policyNumber.includes(searchTerm) ||
      item.company.includes(searchTerm)
    )
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const resetForm = () => {
    setFormData({
      policyNumber: '',
      company: '',
      cancelReason: '',
      followUpDate: '',
      paymentStatus: 'الدفع عند الاستلام'
    });
  };

  const handleSubmit = () => {
    if (!formData.policyNumber || !formData.company) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال رقم البوليصة وشركة الشحن",
        variant: "destructive",
      });
      return;
    }

    const newItem: ShippingItem = {
      id: editingId || Date.now().toString(),
      policyNumber: formData.policyNumber!,
      company: formData.company!,
      cancelReason: formData.cancelReason || '',
      followUpDate: formData.followUpDate || '',
      paymentStatus: formData.paymentStatus || 'الدفع عند الاستلام',
      dateAdded: editingId ? data.shipping.find(i => i.id === editingId)?.dateAdded || new Date().toISOString() : new Date().toISOString(),
      processed: false,
      archived: false,
    };

    if (editingId) {
      setData({
        ...data,
        shipping: data.shipping.map(item => 
          item.id === editingId ? newItem : item
        )
      });
      setEditingId(null);
    } else {
      // Check for duplicates
      const isDuplicate = data.shipping.some(item => 
        item.policyNumber === newItem.policyNumber && !item.archived
      );

      if (isDuplicate) {
        toast({
          title: "بوليصة مكررة",
          description: "رقم البوليصة موجود بالفعل",
          variant: "destructive",
        });
        return;
      }

      setData({
        ...data,
        shipping: [...data.shipping, newItem]
      });
    }

    resetForm();
    toast({
      title: editingId ? "تم التحديث" : "تم الإضافة",
      description: editingId ? "تم تحديث الشحنة بنجاح" : "تم إضافة شحنة جديدة",
      variant: "default",
    });
  };

  const togglePaymentStatus = (id: string) => {
    setData({
      ...data,
      shipping: data.shipping.map(item =>
        item.id === id 
          ? { ...item, paymentStatus: item.paymentStatus === 'تم السداد' ? 'الدفع عند الاستلام' : 'تم السداد' }
          : item
      )
    });
  };

  const openTracking = (item: ShippingItem) => {
    const trackingUrl = data.dropdowns.trackingLinks[item.company];
    if (trackingUrl) {
      window.open(trackingUrl, '_blank');
    } else {
      toast({
        title: "رابط التتبع غير متوفر",
        description: "لا يوجد رابط تتبع لهذه الشركة",
        variant: "destructive",
      });
    }
  };

  const copyLine = (item: ShippingItem) => {
    const line = `${item.policyNumber} - ${item.company} - ${item.paymentStatus}`;
    navigator.clipboard.writeText(line);
    toast({
      title: "تم النسخ",
      description: "تم نسخ بيانات الشحنة",
      variant: "default",
    });
  };

  const archiveItem = (id: string) => {
    setData({
      ...data,
      shipping: data.shipping.map(item =>
        item.id === id ? { ...item, archived: true, processed: true } : item
      )
    });
  };

  const deleteItem = (id: string) => {
    if (confirm('هل تريد حذف هذه الشحنة؟')) {
      setData({
        ...data,
        shipping: data.shipping.filter(item => item.id !== id)
      });
    }
  };

  const isOverdue = (followUpDate: string): boolean => {
    if (!followUpDate) return false;
    return new Date(followUpDate) < new Date();
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
    setShowBulkActions(selectedItems.length > 0 || checked);
  };

  const handleBulkAction = (action: string) => {
    const updates = selectedItems.map(id => {
      switch (action) {
        case 'paid':
          return { id, paymentStatus: 'تم السداد' as const };
        case 'unpaid':
          return { id, paymentStatus: 'الدفع عند الاستلام' as const };
        case 'archive':
          return { id, archived: true, processed: true };
        case 'delete':
          return { id, delete: true };
        default:
          return { id };
      }
    });

    if (action === 'delete' && !confirm('هل تريد حذف العناصر المحددة؟')) {
      return;
    }

    setData({
      ...data,
      shipping: data.shipping.map(item => {
        const update = updates.find(u => u.id === item.id);
        if (update) {
          if ('delete' in update) return null;
          return { ...item, ...update };
        }
        return item;
      }).filter(Boolean) as ShippingItem[]
    });

    setSelectedItems([]);
    setShowBulkActions(false);
    toast({
      title: "تم تنفيذ الإجراء",
      description: `تم تنفيذ الإجراء على ${selectedItems.length} عنصر`,
      variant: "default",
    });
  };

  const copyPaidPolicies = () => {
    const paidPolicies = filteredItems
      .filter(item => item.paymentStatus === 'تم السداد')
      .map(item => item.policyNumber)
      .join('\n');
    
    navigator.clipboard.writeText(paidPolicies);
    toast({
      title: "تم النسخ",
      description: "تم نسخ البوليصات المدفوعة",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle">
            {editingId ? 'تعديل شحنة' : 'إضافة شحنة جديدة'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="رقم البوليصة"
              value={formData.policyNumber || ''}
              onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
              className="glass-input border-0"
            />
            <Select value={formData.company || ''} onValueChange={(value) => setFormData({...formData, company: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="شركة الشحن" />
              </SelectTrigger>
              <SelectContent>
                {data.dropdowns.shippingCompanies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formData.cancelReason || ''} onValueChange={(value) => setFormData({...formData, cancelReason: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="سبب الإلغاء (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                {data.dropdowns.cancelReasons.map(reason => (
                  <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="تاريخ المتابعة"
              value={formData.followUpDate || ''}
              onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
              className="glass-input border-0"
            />
            <Select value={formData.paymentStatus || 'الدفع عند الاستلام'} onValueChange={(value: 'الدفع عند الاستلام' | 'تم السداد') => setFormData({...formData, paymentStatus: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="حالة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الدفع عند الاستلام">الدفع عند الاستلام</SelectItem>
                <SelectItem value="تم السداد">تم السداد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="btn-gradient">
              <Plus className="h-4 w-4 ml-2" />
              {editingId ? 'تحديث' : 'حفظ'}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => {setEditingId(null); resetForm();}} className="glass-input border-0">
                إلغاء
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الشحنات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input border-0 pr-10"
          />
        </div>
        <Button variant="outline" onClick={copyPaidPolicies} className="glass-input border-0">
          <Copy className="h-4 w-4 ml-2" />
          نسخ المدفوعة
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="glass-card border-0 bg-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <span>تم تحديد {selectedItems.length} عنصر</span>
              <Button size="sm" onClick={() => handleBulkAction('paid')} className="glass-input border-0">
                تحديد كمدفوع
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('unpaid')} className="glass-input border-0">
                تحديد كغير مدفوع
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('archive')} className="glass-input border-0">
                أرشفة
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('delete')} className="glass-input border-0 text-destructive">
                حذف
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <Card key={item.id} className={`glass-card border-0 ${isOverdue(item.followUpDate) ? 'ring-2 ring-destructive/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox 
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">{item.policyNumber}</span>
                    <div className="text-muted-foreground">{item.company}</div>
                  </div>
                  <div>
                    <Badge variant={item.paymentStatus === 'تم السداد' ? 'default' : 'secondary'}>
                      {item.paymentStatus}
                    </Badge>
                    {item.cancelReason && (
                      <div className="text-destructive text-xs mt-1">{item.cancelReason}</div>
                    )}
                  </div>
                  <div>
                    {item.followUpDate && (
                      <div className={`text-xs ${isOverdue(item.followUpDate) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        متابعة: {new Date(item.followUpDate).toLocaleDateString('ar-SA')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => copyLine(item)} className="glass-input border-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => togglePaymentStatus(item.id)} className="glass-input border-0">
                      <CreditCard className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openTracking(item)} className="glass-input border-0">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {setEditingId(item.id); setFormData(item);}} className="glass-input border-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => archiveItem(item.id)} className="glass-input border-0">
                      <Archive className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteItem(item.id)} className="glass-input border-0 text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "btn-gradient" : "glass-input border-0"}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle">{filteredItems.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي الشحنات</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-green-600">
              {filteredItems.filter(i => i.paymentStatus === 'تم السداد').length}
            </div>
            <div className="text-sm text-muted-foreground">مدفوعة</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-orange-600">
              {filteredItems.filter(i => i.paymentStatus === 'الدفع عند الاستلام').length}
            </div>
            <div className="text-sm text-muted-foreground">عند الاستلام</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-red-600">
              {filteredItems.filter(i => isOverdue(i.followUpDate)).length}
            </div>
            <div className="text-sm text-muted-foreground">متأخرة المتابعة</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};