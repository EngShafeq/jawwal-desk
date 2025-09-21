import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  RotateCcw, 
  Trash2,
  Archive as ArchiveIcon,
  Calendar,
  Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ArchivedItem {
  id: string;
  type: 'waitingList' | 'shipping' | 'returns' | 'issues' | 'tasks';
  data: any;
  archivedDate: string;
}

export const Archive: React.FC = () => {
  const { data, setData } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 25;

  const typeLabels = {
    waitingList: 'قائمة الانتظار',
    shipping: 'الشحنات',
    returns: 'الإرجاعات',
    issues: 'القضايا',
    tasks: 'المهام'
  };

  // Collect all archived items
  const getAllArchivedItems = (): ArchivedItem[] => {
    const items: ArchivedItem[] = [];

    // Add archived items from each category
    data.waitingList.filter(item => item.archived).forEach(item => {
      items.push({
        id: item.id,
        type: 'waitingList',
        data: item,
        archivedDate: item.dateAdded // Using dateAdded as archived date for simplicity
      });
    });

    data.shipping.filter(item => item.archived).forEach(item => {
      items.push({
        id: item.id,
        type: 'shipping',
        data: item,
        archivedDate: item.dateAdded
      });
    });

    data.returns.filter(item => item.archived).forEach(item => {
      items.push({
        id: item.id,
        type: 'returns',
        data: item,
        archivedDate: item.dateAdded
      });
    });

    data.issues.filter(item => item.archived).forEach(item => {
      items.push({
        id: item.id,
        type: 'issues',
        data: item,
        archivedDate: item.dateAdded
      });
    });

    data.tasks.filter(item => item.archived).forEach(item => {
      items.push({
        id: item.id,
        type: 'tasks',
        data: item,
        archivedDate: item.dateAdded
      });
    });

    return items.sort((a, b) => new Date(b.archivedDate).getTime() - new Date(a.archivedDate).getTime());
  };

  const filteredItems = getAllArchivedItems().filter(item => {
    const matchesSearch = searchTerm === '' || 
      JSON.stringify(item.data).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Group items by date
  const groupedItems = paginatedItems.reduce((groups, item) => {
    const date = new Date(item.archivedDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, ArchivedItem[]>);

  const restoreItem = (item: ArchivedItem) => {
    const updatedItem = { ...item.data, archived: false };

    switch (item.type) {
      case 'waitingList':
        setData({
          ...data,
          waitingList: data.waitingList.map(i => 
            i.id === item.id ? updatedItem : i
          )
        });
        break;
      case 'shipping':
        setData({
          ...data,
          shipping: data.shipping.map(i => 
            i.id === item.id ? updatedItem : i
          )
        });
        break;
      case 'returns':
        setData({
          ...data,
          returns: data.returns.map(i => 
            i.id === item.id ? updatedItem : i
          )
        });
        break;
      case 'issues':
        setData({
          ...data,
          issues: data.issues.map(i => 
            i.id === item.id ? updatedItem : i
          )
        });
        break;
      case 'tasks':
        setData({
          ...data,
          tasks: data.tasks.map(i => 
            i.id === item.id ? updatedItem : i
          )
        });
        break;
    }

    toast({
      title: "تم الاسترجاع",
      description: "تم استرجاع العنصر من الأرشيف",
      variant: "default",
    });
  };

  const purgeItem = (item: ArchivedItem) => {
    if (!confirm('هل تريد حذف هذا العنصر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    switch (item.type) {
      case 'waitingList':
        setData({
          ...data,
          waitingList: data.waitingList.filter(i => i.id !== item.id)
        });
        break;
      case 'shipping':
        setData({
          ...data,
          shipping: data.shipping.filter(i => i.id !== item.id)
        });
        break;
      case 'returns':
        setData({
          ...data,
          returns: data.returns.filter(i => i.id !== item.id)
        });
        break;
      case 'issues':
        setData({
          ...data,
          issues: data.issues.filter(i => i.id !== item.id)
        });
        break;
      case 'tasks':
        setData({
          ...data,
          tasks: data.tasks.filter(i => i.id !== item.id)
        });
        break;
    }

    toast({
      title: "تم الحذف",
      description: "تم حذف العنصر نهائياً",
      variant: "destructive",
    });
  };

  const renderItemContent = (item: ArchivedItem) => {
    const itemData = item.data;
    
    switch (item.type) {
      case 'waitingList':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">{itemData.customerName}</span>
              <div className="text-muted-foreground">{itemData.whatsapp}</div>
            </div>
            <div>
              <span>{itemData.brand} - {itemData.partType}</span>
              <div className="text-muted-foreground">{itemData.model}</div>
            </div>
            <div>
              <Badge variant={itemData.availability === 'متوفر' ? 'default' : 'secondary'}>
                {itemData.availability}
              </Badge>
            </div>
          </div>
        );
      case 'shipping':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">{itemData.policyNumber}</span>
              <div className="text-muted-foreground">{itemData.company}</div>
            </div>
            <div>
              <Badge variant={itemData.paymentStatus === 'تم السداد' ? 'default' : 'secondary'}>
                {itemData.paymentStatus}
              </Badge>
            </div>
            <div>
              {itemData.cancelReason && (
                <div className="text-destructive text-xs">{itemData.cancelReason}</div>
              )}
            </div>
          </div>
        );
      case 'returns':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">{itemData.returnNumber}</span>
              <div className="text-muted-foreground">{itemData.company}</div>
            </div>
            <div>
              <Badge className={itemData.status === 'مكتمل' ? 'bg-green-500/20 text-green-700' : 'bg-blue-500/20 text-blue-700'}>
                {itemData.status}
              </Badge>
            </div>
            <div>
              <div className="text-muted-foreground">{itemData.product}</div>
            </div>
          </div>
        );
      case 'issues':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">{itemData.orderNumber}</span>
              <div className="text-muted-foreground">{itemData.product}</div>
            </div>
            <div>
              <Badge className={itemData.category === 'تأخير' ? 'bg-yellow-500/20 text-yellow-700' : 'bg-red-500/20 text-red-700'}>
                {itemData.category}
              </Badge>
            </div>
            <div>
              <Badge className={itemData.status === 'منجز' ? 'bg-green-500/20 text-green-700' : 'bg-blue-500/20 text-blue-700'}>
                {itemData.status}
              </Badge>
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">{itemData.title}</span>
              <div className="text-muted-foreground">{itemData.brand}</div>
            </div>
            <div>
              <Badge className={itemData.status === 'منجز' ? 'bg-green-500/20 text-green-700' : 'bg-blue-500/20 text-blue-700'}>
                {itemData.status}
              </Badge>
            </div>
            <div>
              {itemData.dueDate && (
                <div className="text-muted-foreground text-xs">
                  {new Date(itemData.dueDate).toLocaleDateString('ar-SA')}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle flex items-center gap-2">
            <ArchiveIcon className="h-5 w-5" />
            الأرشيف ({filteredItems.length} عنصر)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في الأرشيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input border-0 pr-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="glass-input border-0 w-48">
                <SelectValue placeholder="تصفية حسب النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="waitingList">قائمة الانتظار</SelectItem>
                <SelectItem value="shipping">الشحنات</SelectItem>
                <SelectItem value="returns">الإرجاعات</SelectItem>
                <SelectItem value="issues">القضايا</SelectItem>
                <SelectItem value="tasks">المهام</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Items */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([date, items]) => (
          <Collapsible key={date} defaultOpen>
            <CollapsibleTrigger asChild>
              <Card className="glass-card border-0 cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="arabic-subtitle">
                        {new Date(date).toLocaleDateString('ar-SA', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                      <Badge variant="outline">
                        {items.length} عنصر
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {items.map((item) => (
                <Card key={`${item.type}-${item.id}`} className="glass-card border-0 mr-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {typeLabels[item.type]}
                          </Badge>
                        </div>
                        {renderItemContent(item)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restoreItem(item)}
                          className="glass-input border-0"
                        >
                          <RotateCcw className="h-3 w-3 ml-1" />
                          استرجاع
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => purgeItem(item)}
                          className="glass-input border-0 text-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-8 text-center">
            <ArchiveIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="arabic-subtitle text-muted-foreground mb-2">
              لا توجد عناصر في الأرشيف
            </div>
            <div className="text-sm text-muted-foreground">
              العناصر المؤرشفة ستظهر هنا
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Archive Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(typeLabels).map(([type, label]) => {
          const count = filteredItems.filter(item => item.type === type).length;
          return (
            <Card key={type} className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <div className="arabic-subtitle">{count}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};