import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore, IssueItem } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Archive,
  RotateCw,
  CheckSquare
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export const Issues: React.FC = () => {
  const { data, setData } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IssueItem>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const itemsPerPage = 25;
  const filteredItems = data.issues.filter(item => 
    !item.archived && (
      item.orderNumber.includes(searchTerm) ||
      item.product.includes(searchTerm) ||
      item.category.includes(searchTerm)
    )
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const resetForm = () => {
    setFormData({
      orderNumber: '',
      category: 'تأخير',
      product: '',
      followUpDate: '',
      status: 'قيد المعالجة'
    });
  };

  const handleSubmit = () => {
    if (!formData.orderNumber || !formData.category) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال رقم الطلب وتصنيف القضية",
        variant: "destructive",
      });
      return;
    }

    const newItem: IssueItem = {
      id: editingId || Date.now().toString(),
      orderNumber: formData.orderNumber!,
      category: formData.category!,
      product: formData.product || '',
      followUpDate: formData.followUpDate || '',
      status: formData.status || 'قيد المعالجة',
      dateAdded: editingId ? data.issues.find(i => i.id === editingId)?.dateAdded || new Date().toISOString() : new Date().toISOString(),
      processed: false,
      archived: false,
    };

    if (editingId) {
      setData({
        ...data,
        issues: data.issues.map(item => 
          item.id === editingId ? newItem : item
        )
      });
      setEditingId(null);
    } else {
      // Check for duplicates
      const isDuplicate = data.issues.some(item => 
        item.orderNumber === newItem.orderNumber && 
        item.category === newItem.category && 
        !item.archived
      );

      if (isDuplicate) {
        toast({
          title: "قضية مكررة",
          description: "هذه القضية موجودة بالفعل",
          variant: "destructive",
        });
        return;
      }

      setData({
        ...data,
        issues: [...data.issues, newItem]
      });
    }

    resetForm();
    toast({
      title: editingId ? "تم التحديث" : "تم الإضافة",
      description: editingId ? "تم تحديث القضية بنجاح" : "تم إضافة قضية جديدة",
      variant: "default",
    });
  };

  const toggleStatus = (id: string) => {
    setData({
      ...data,
      issues: data.issues.map(item => {
        if (item.id === id) {
          return { 
            ...item, 
            status: item.status === 'قيد المعالجة' ? 'منجز' : 'قيد المعالجة' 
          };
        }
        return item;
      })
    });
  };

  const archiveItem = (id: string) => {
    setData({
      ...data,
      issues: data.issues.map(item =>
        item.id === id ? { ...item, archived: true, processed: true } : item
      )
    });
  };

  const deleteItem = (id: string) => {
    if (confirm('هل تريد حذف هذه القضية؟')) {
      setData({
        ...data,
        issues: data.issues.filter(item => item.id !== id)
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
        issues: data.issues.map(item => {
          if (selectedItems.includes(item.id)) {
            return { 
              ...item, 
              status: item.status === 'قيد المعالجة' ? 'منجز' : 'قيد المعالجة' 
            };
          }
          return item;
        })
      });
    } else if (action === 'archive') {
      setData({
        ...data,
        issues: data.issues.map(item =>
          selectedItems.includes(item.id) 
            ? { ...item, archived: true, processed: true }
            : item
        )
      });
    } else if (action === 'delete') {
      setData({
        ...data,
        issues: data.issues.filter(item => !selectedItems.includes(item.id))
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'تأخير': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'نقص': return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      case 'تالف': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'منجز' 
      ? 'bg-green-500/20 text-green-700 dark:text-green-300'
      : 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle">
            {editingId ? 'تعديل قضية' : 'إضافة قضية جديدة'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="رقم الطلب"
              value={formData.orderNumber || ''}
              onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
              className="glass-input border-0"
            />
            <Select value={formData.category || 'تأخير'} onValueChange={(value: 'تأخير' | 'نقص' | 'تالف') => setFormData({...formData, category: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="تصنيف القضية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="تأخير">تأخير</SelectItem>
                <SelectItem value="نقص">نقص</SelectItem>
                <SelectItem value="تالف">تالف</SelectItem>
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
            <Select value={formData.status || 'قيد المعالجة'} onValueChange={(value: 'قيد المعالجة' | 'منجز') => setFormData({...formData, status: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                <SelectItem value="منجز">منجز</SelectItem>
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

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في القضايا..."
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
                    <span className="font-medium">{item.orderNumber}</span>
                    <div className="text-muted-foreground">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </div>
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
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(item.id)} className="glass-input border-0">
                      <CheckSquare className="h-3 w-3" />
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
            <div className="text-sm text-muted-foreground">إجمالي القضايا</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-blue-600">
              {filteredItems.filter(i => i.status === 'قيد المعالجة').length}
            </div>
            <div className="text-sm text-muted-foreground">قيد المعالجة</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-green-600">
              {filteredItems.filter(i => i.status === 'منجز').length}
            </div>
            <div className="text-sm text-muted-foreground">منجز</div>
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