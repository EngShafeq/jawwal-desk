import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore, WaitingListItem } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Copy, 
  Search, 
  MessageCircle, 
  Edit, 
  Check, 
  Archive, 
  Trash2,
  Phone,
  ExternalLink
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const WaitingList: React.FC = () => {
  const { data, setData } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WaitingListItem>>({});

  const itemsPerPage = 25;
  const filteredItems = data.waitingList.filter(item => 
    !item.archived && (
      item.customerName.includes(searchTerm) ||
      item.brand.includes(searchTerm) ||
      item.partType.includes(searchTerm) ||
      item.model.includes(searchTerm)
    )
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const resetForm = () => {
    setFormData({
      customerName: '',
      whatsapp: '',
      brand: '',
      partType: '',
      model: '',
      network: '',
      color: '',
      availability: 'غير متوفر',
      price: '',
      productLink: ''
    });
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^05\d{8}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneToE164 = (phone: string): string => {
    if (phone.startsWith('05')) {
      return `+966${phone.substring(1)}`;
    }
    return phone;
  };

  const generatePreview = (item: Partial<WaitingListItem>): string => {
    if (!item.brand || !item.partType || !item.model) {
      return 'سيتم إنشاء المعاينة تلقائياً...';
    }
    
    return `🔧 ${item.partType} ${item.brand} ${item.model}
📱 الشبكة: ${item.network || 'غير محدد'}
🎨 اللون: ${item.color || 'غير محدد'}
${item.availability === 'متوفر' ? '✅ متوفر' : '❌ غير متوفر'}
💰 السعر: ${item.price || 'غير محدد'} ريال
${item.productLink ? `🔗 ${item.productLink}` : ''}`;
  };

  const handleSubmit = () => {
    if (!formData.customerName || !formData.whatsapp) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال اسم العميل ورقم الواتساب",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhone(formData.whatsapp)) {
      toast({
        title: "رقم واتساب غير صحيح",
        description: "يرجى إدخال رقم صحيح (05xxxxxxxx)",
        variant: "destructive",
      });
      return;
    }

    const newItem: WaitingListItem = {
      id: editingId || Date.now().toString(),
      customerName: formData.customerName!,
      whatsapp: formatPhoneToE164(formData.whatsapp!),
      brand: formData.brand || '',
      partType: formData.partType || '',
      model: formData.model || '',
      network: formData.network || '',
      color: formData.color || '',
      availability: formData.availability || 'غير متوفر',
      price: formData.price || '',
      productLink: formData.productLink || '',
      dateAdded: editingId ? data.waitingList.find(i => i.id === editingId)?.dateAdded || new Date().toISOString() : new Date().toISOString(),
      processed: false,
      archived: false,
    };

    if (editingId) {
      setData({
        ...data,
        waitingList: data.waitingList.map(item => 
          item.id === editingId ? newItem : item
        )
      });
      setEditingId(null);
    } else {
      // Check for duplicates
      const isDuplicate = data.waitingList.some(item => 
        item.customerName === newItem.customerName &&
        item.whatsapp === newItem.whatsapp &&
        item.brand === newItem.brand &&
        item.partType === newItem.partType &&
        !item.archived
      );

      if (isDuplicate) {
        toast({
          title: "عنصر مكرر",
          description: "هذا العنصر موجود بالفعل",
          variant: "destructive",
        });
        return;
      }

      setData({
        ...data,
        waitingList: [...data.waitingList, newItem]
      });
    }

    resetForm();
    toast({
      title: editingId ? "تم التحديث" : "تم الإضافة",
      description: editingId ? "تم تحديث العنصر بنجاح" : "تم إضافة عنصر جديد",
      variant: "default",
    });
  };

  const handleWhatsApp = (item: WaitingListItem) => {
    const message = encodeURIComponent(`مرحباً ${item.customerName} 👋

📱 بخصوص طلبك لـ ${item.partType} ${item.brand} ${item.model}

${item.availability === 'متوفر' ? 
  `✅ القطعة متوفرة الآن!
💰 السعر: ${item.price} ريال
${item.productLink ? `🔗 رابط المنتج: ${item.productLink}` : ''}

هل تريد المتابعة مع الطلب؟` : 
  `❌ القطعة غير متوفرة حالياً
⏰ سنتواصل معك فور توفرها`}

شكراً لثقتك بنا 🙏`);

    window.open(`https://wa.me/${item.whatsapp}?text=${message}`, '_blank');
  };

  const toggleAvailability = (id: string) => {
    setData({
      ...data,
      waitingList: data.waitingList.map(item =>
        item.id === id 
          ? { ...item, availability: item.availability === 'متوفر' ? 'غير متوفر' : 'متوفر' }
          : item
      )
    });
  };

  const copyPreview = (item: WaitingListItem) => {
    const preview = generatePreview(item);
    navigator.clipboard.writeText(preview);
    toast({
      title: "تم النسخ",
      description: "تم نسخ معاينة المنتج",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="arabic-subtitle">
            {editingId ? 'تعديل عنصر' : 'إضافة عنصر جديد'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="اسم العميل"
              value={formData.customerName || ''}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              className="glass-input border-0"
            />
            <Input
              placeholder="واتساب (05xxxxxxxx)"
              value={formData.whatsapp || ''}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              className="glass-input border-0"
            />
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
            <Select value={formData.partType || ''} onValueChange={(value) => setFormData({...formData, partType: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="نوع القطعة" />
              </SelectTrigger>
              <SelectContent>
                {data.dropdowns.partTypes.map(part => (
                  <SelectItem key={part} value={part}>{part}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="الموديل"
              value={formData.model || ''}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className="glass-input border-0"
            />
            <Input
              placeholder="الشبكة"
              value={formData.network || ''}
              onChange={(e) => setFormData({...formData, network: e.target.value})}
              className="glass-input border-0"
            />
            <Select value={formData.color || ''} onValueChange={(value) => setFormData({...formData, color: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="اللون" />
              </SelectTrigger>
              <SelectContent>
                {data.dropdowns.colors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formData.availability || 'غير متوفر'} onValueChange={(value: 'متوفر' | 'غير متوفر') => setFormData({...formData, availability: value})}>
              <SelectTrigger className="glass-input border-0">
                <SelectValue placeholder="حالة التوفر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="متوفر">متوفر</SelectItem>
                <SelectItem value="غير متوفر">غير متوفر</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="السعر"
              value={formData.price || ''}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="glass-input border-0"
            />
            <Input
              placeholder="رابط المنتج"
              value={formData.productLink || ''}
              onChange={(e) => setFormData({...formData, productLink: e.target.value})}
              className="glass-input border-0"
            />
          </div>

          {/* Preview Box */}
          <div className="glass-input p-4 rounded-xl">
            <h4 className="arabic-subtitle mb-2">معاينة المنتج:</h4>
            <pre className="arabic-body whitespace-pre-wrap text-sm">
              {generatePreview(formData)}
            </pre>
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
            placeholder="البحث في قائمة الانتظار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input border-0 pr-10"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <Card key={item.id} className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">{item.customerName}</span>
                    <div className="text-muted-foreground">{item.whatsapp}</div>
                  </div>
                  <div>
                    <span className="font-medium">{item.brand} - {item.partType}</span>
                    <div className="text-muted-foreground">{item.model}</div>
                  </div>
                  <div>
                    <Badge variant={item.availability === 'متوفر' ? 'default' : 'secondary'}>
                      {item.availability}
                    </Badge>
                    {item.price && <div className="text-muted-foreground">{item.price} ريال</div>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => copyPreview(item)} className="glass-input border-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleAvailability(item.id)} className="glass-input border-0">
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleWhatsApp(item)} className="glass-input border-0">
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {setEditingId(item.id); setFormData(item);}} className="glass-input border-0">
                      <Edit className="h-3 w-3" />
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
            <div className="text-sm text-muted-foreground">إجمالي العناصر</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-green-600">
              {filteredItems.filter(i => i.availability === 'متوفر').length}
            </div>
            <div className="text-sm text-muted-foreground">متوفر</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-red-600">
              {filteredItems.filter(i => i.availability === 'غير متوفر').length}
            </div>
            <div className="text-sm text-muted-foreground">غير متوفر</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <div className="arabic-subtitle text-blue-600">
              {data.waitingList.filter(i => i.processed).length}
            </div>
            <div className="text-sm text-muted-foreground">تمت المعالجة</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};