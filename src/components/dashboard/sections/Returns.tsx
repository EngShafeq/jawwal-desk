import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore, ReturnItem } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Edit, 
  Trash2,
  Archive,
  RotateCw,
  CheckSquare
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export const Returns: React.FC = () => {
  const { data, setData } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ReturnItem>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const itemsPerPage = 25;
  const filteredItems = data.returns.filter(item => 
    !item.archived && (
      item.returnNumber.includes(searchTerm) ||
      item.company.includes(searchTerm) ||
      item.product.includes(searchTerm)
    )
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const resetForm = () => {
    setFormData({
      returnNumber: '',
      company: '',
      status: 'جديد',
      product: '',
      followUpDate: ''
    });
  };

  const handleSubmit = () => {
    if (!formData.returnNumber || !formData.company) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال رقم الإرجاع وشركة الشحن",
        variant: "destructive",
      });
      return;
    }

    const newItem: ReturnItem = {
      id: editingId || Date.now().toString(),
      returnNumber: formData.returnNumber!,
      company: formData.company!,
      status: formData.status || 'جديد',
      product: formData.product || '',
      followUpDate: formData.followUpDate || '',
      dateAdded: editingId ? data.returns.find(i => i.id === editingId)?.dateAdded || new Date().toISOString() : new Date().toISOString(),
      processed: false,
      archived: false,
    };

    if (editingId) {
      setData({
        ...data,
        returns: data.returns.map(item => 
          item.id === editingId ? newItem : item
        )
      });
      setEditingId(null);
    } else {
      // Check for duplicates
      const isDuplicate = data.returns.some(item => 
        item.returnNumber === newItem.returnNumber && !item.archived
      );

      if (isDuplicate) {
        toast({
          title: "رقم إرجاع مكرر",
          description: "رقم الإرجاع موجود بالفعل",
          variant: "destructive",
        });
        return;
      }

      setData({
        ...data,
        returns: [...data.returns, newItem]
      });
    }

    resetForm();
    toast({
      title: editingId ? "تم التحديث" : "تم الإضافة",
      description: editingId ? "تم تحديث الإرجاع بنجاح" : "تم إضافة إرجاع جديد",
      variant: "default",
    });
  };

  const cycleStatus = (id: string) => {
    const statuses: ('جديد' | 'قيد المعالجة' | 'مكتمل')[] = ['جديد', 'قيد المعالجة', 'مكتمل'];
    setData({
      ...data,
      returns: data.returns.map(item => {
        if (item.id === id) {
          const currentIndex = statuses.indexOf(item.status);
          const nextIndex = (currentIndex + 1) % statuses.length;
          return { ...item, status: statuses[nextIndex] };
        }
        return item;
      })
    });
  };

  const openTracking = (item: ReturnItem) => {
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

  const archiveItem = (id: string) => {
    setData({
      ...data,
      returns: data.returns.map(item =>
        item.id === id ? { ...item, archived: true, processed: true } : item
      )
    });
  };

  const deleteItem = (id: string) => {
    if (confirm('هل تريد حذف هذا الإرجاع؟')) {
      setData({
        ...data,
        returns: data.returns.filter(item => item.id !== id)
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
    if (action === 'delete' && !confirm('هل تريد حذف العناصر المحددة؟')) {
      return;
    }

    if (action === 'toggle-status') {
      setData({
        ...data,
        returns: data.returns.map(item => {
          if (selectedItems.includes(item.id)) {
            const statuses: ('جديد' | 'قيد المعالجة' | 'مكتمل')[] = ['جديد', 'قيد المعالجة', 'مكتمل'];
            const currentIndex = statuses.indexOf(item.status);
            const nextIndex = (currentIndex + 1) % statuses.length;
            return { ...item, status: statuses[nextIndex] };
          }
          return item;
        })
      });
    } else if (action === 'archive') {
      setData({
        ...data,
        returns: data.returns.map(item =>
          selectedItems.includes(item.id) 
            ? { ...item, archived: true, processed: true }
            : item
        )
      });
    } else if (action === 'delete') {
      setData({
        ...data,
        returns: data.returns.filter(item => !selectedItems.includes(item.id))
      });
    } else if (action === 'open-tracking') {
      selectedItems.forEach(id => {
        const item = data.returns.find(r => r.id === id);
        if (item) openTracking(item);
      });
    }

    setSelectedItems([]);
    setShowBulkActions(false);
    toast({
      title: "تم تنفيذ الإجراء",
      description: `تم تنفيذ الإجراء على ${selectedItems.length} عنصر`,
      variant: "default",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'قيد المعالجة': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'مكتمل': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle">
            {editingId ? 'تعديل إرجاع' : 'إضافة إرجاع جديد'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="رقم الإرجاع"
              value={formData.returnNumber || ''}
              onChange={(e) => setFormData({...formData, returnNumber: e.target.value})}
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
            <Select value={formData.status || 'جديد'} onValueChange={(value: 'جديد' | 'قيد المعالجة' | 'مكتمل') => setFormData({...formData, status: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="جديد">جديد</SelectItem>
                <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                <SelectItem value="مكتمل">مكتمل</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="المنتج/القطعة"
              value={formData.product || ''}
              onChange={(e) => setFormData({...formData, product: e.target.value})}
              className="glass-input border-0"
            />
            <Input
              type="date"
              placeholder="تاريخ المتابعة"
              value={formData.followUpDate || ''}
              onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
              className="glass-input border-0"
            />
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

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الإرجاعات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input border-0 pr-10"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="glass-card border-0 bg-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <span>تم تحديد {selectedItems.length} عنصر</span>
              <Button size="sm" onClick={() => handleBulkAction('toggle-status')} className="glass-input border-0">
                تبديل الحالة
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('archive')} className="glass-input border-0">
                أرشفة
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('delete')} className="glass-input border-0 text-destructive">
                حذف
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('open-tracking')} className="glass-input border-0">
                فتح تتبع للكل
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
                    <span className="font-medium">{item.returnNumber}</span>
                    <div className="text-muted-foreground">{item.company}</div>
                  </div>
                  <div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    {item.product && (
                      <div className="text-muted-foreground mt-1">{item.product}</div>
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
                    <Button size="sm" variant="outline" onClick={() => cycleStatus(item.id)} className="glass-input border-0">
                      <RotateCw className="h-3 w-3" />
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
            <div className="text-sm text-muted-foreground">إجمالي الإرجاعات</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-blue-600">
              {filteredItems.filter(i => i.status === 'جديد').length}
            </div>
            <div className="text-sm text-muted-foreground">جديد</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-yellow-600">
              {filteredItems.filter(i => i.status === 'قيد المعالجة').length}
            </div>
            <div className="text-sm text-muted-foreground">قيد المعالجة</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-green-600">
              {filteredItems.filter(i => i.status === 'مكتمل').length}
            </div>
            <div className="text-sm text-muted-foreground">مكتمل</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};