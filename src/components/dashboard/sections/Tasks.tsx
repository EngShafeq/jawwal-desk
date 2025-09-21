import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore, TaskItem } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Archive,
  CheckSquare,
  Clock
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Tasks: React.FC = () => {
  const { data, setData } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TaskItem>>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');

  const itemsPerPage = 25;
  
  const getFilteredItems = () => {
    let items = data.tasks.filter(item => 
      !item.archived && (
        item.title.includes(searchTerm) ||
        item.brand.includes(searchTerm)
      )
    );

    switch (filter) {
      case 'active':
        return items.filter(item => item.status === 'قيد التنفيذ');
      case 'completed':
        return items.filter(item => item.status === 'منجز');
      case 'overdue':
        return items.filter(item => isOverdue(item.dueDate) && item.status === 'قيد التنفيذ');
      default:
        return items;
    }
  };

  const filteredItems = getFilteredItems();
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const resetForm = () => {
    setFormData({
      brand: '',
      title: '',
      dueDate: '',
      repeat: 'بدون',
      status: 'قيد التنفيذ'
    });
  };

  const handleSubmit = () => {
    if (!formData.brand || !formData.title) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال العلامة التجارية وعنوان المهمة",
        variant: "destructive",
      });
      return;
    }

    const newItem: TaskItem = {
      id: editingId || Date.now().toString(),
      brand: formData.brand!,
      title: formData.title!,
      dueDate: formData.dueDate || '',
      repeat: formData.repeat || 'بدون',
      status: formData.status || 'قيد التنفيذ',
      dateAdded: editingId ? data.tasks.find(i => i.id === editingId)?.dateAdded || new Date().toISOString() : new Date().toISOString(),
      processed: false,
      archived: false,
    };

    if (editingId) {
      setData({
        ...data,
        tasks: data.tasks.map(item => 
          item.id === editingId ? newItem : item
        )
      });
      setEditingId(null);
    } else {
      setData({
        ...data,
        tasks: [...data.tasks, newItem]
      });
    }

    resetForm();
    toast({
      title: editingId ? "تم التحديث" : "تم الإضافة",
      description: editingId ? "تم تحديث المهمة بنجاح" : "تم إضافة مهمة جديدة",
      variant: "default",
    });
  };

  const toggleStatus = (id: string) => {
    setData({
      ...data,
      tasks: data.tasks.map(item => {
        if (item.id === id) {
          return { 
            ...item, 
            status: item.status === 'قيد التنفيذ' ? 'منجز' : 'قيد التنفيذ' 
          };
        }
        return item;
      })
    });
  };

  const archiveItem = (id: string) => {
    setData({
      ...data,
      tasks: data.tasks.map(item =>
        item.id === id ? { ...item, archived: true, processed: true } : item
      )
    });
  };

  const deleteItem = (id: string) => {
    if (confirm('هل تريد حذف هذه المهمة؟')) {
      setData({
        ...data,
        tasks: data.tasks.filter(item => item.id !== id)
      });
    }
  };

  const isOverdue = (dueDate: string): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getStatusColor = (status: string) => {
    return status === 'منجز' 
      ? 'bg-green-500/20 text-green-700 dark:text-green-300'
      : 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
  };

  const getRepeatColor = (repeat: string) => {
    switch (repeat) {
      case 'يومي': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      case 'أسبوعي': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'شهري': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle">
            {editingId ? 'تعديل مهمة' : 'إضافة مهمة جديدة'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select value={formData.brand || ''} onValueChange={(value) => setFormData({...formData, brand: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="العلامة التجارية" />
              </SelectTrigger>
              <SelectContent>
                {data.dropdowns.brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formData.title || ''} onValueChange={(value) => setFormData({...formData, title: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="عنوان المهمة" />
              </SelectTrigger>
              <SelectContent>
                {data.dropdowns.taskTitles.map(title => (
                  <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="تاريخ الاستحقاق"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="glass-input border-0"
            />
            <Select value={formData.repeat || 'بدون'} onValueChange={(value: 'يومي' | 'أسبوعي' | 'شهري' | 'بدون') => setFormData({...formData, repeat: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="التكرار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="بدون">بدون</SelectItem>
                <SelectItem value="يومي">يومي</SelectItem>
                <SelectItem value="أسبوعي">أسبوعي</SelectItem>
                <SelectItem value="شهري">شهري</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.status || 'قيد التنفيذ'} onValueChange={(value: 'قيد التنفيذ' | 'منجز') => setFormData({...formData, status: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                <SelectItem value="منجز">منجز</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="btn-gradient">
              <Plus className="h-4 w-4 ml-2" />
              {editingId ? 'تحديث' : 'إضافة'}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => {setEditingId(null); resetForm();}} className="glass-input border-0">
                إلغاء
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في المهام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input border-0 pr-10"
          />
        </div>
        <Select value={filter} onValueChange={(value: typeof filter) => setFilter(value)}>
          <SelectTrigger className="glass-input border-0 w-40">
            <SelectValue placeholder="تصفية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المهام</SelectItem>
            <SelectItem value="active">قيد التنفيذ</SelectItem>
            <SelectItem value="completed">مكتملة</SelectItem>
            <SelectItem value="overdue">متأخرة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <Card key={item.id} className={`glass-card border-0 ${isOverdue(item.dueDate) && item.status === 'قيد التنفيذ' ? 'ring-2 ring-destructive/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">{item.title}</span>
                    <div className="text-muted-foreground">{item.brand}</div>
                  </div>
                  <div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    {item.repeat !== 'بدون' && (
                      <div className="mt-1">
                        <Badge className={getRepeatColor(item.repeat)}>
                          {item.repeat}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    {item.dueDate && (
                      <div className={`text-xs ${isOverdue(item.dueDate) && item.status === 'قيد التنفيذ' ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        <Clock className="h-3 w-3 inline ml-1" />
                        {new Date(item.dueDate).toLocaleDateString('ar-SA')}
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
            <div className="text-sm text-muted-foreground">إجمالي المهام</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-blue-600">
              {data.tasks.filter(i => !i.archived && i.status === 'قيد التنفيذ').length}
            </div>
            <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-green-600">
              {data.tasks.filter(i => !i.archived && i.status === 'منجز').length}
            </div>
            <div className="text-sm text-muted-foreground">مكتملة</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-red-600">
              {data.tasks.filter(i => !i.archived && isOverdue(i.dueDate) && i.status === 'قيد التنفيذ').length}
            </div>
            <div className="text-sm text-muted-foreground">متأخرة</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};