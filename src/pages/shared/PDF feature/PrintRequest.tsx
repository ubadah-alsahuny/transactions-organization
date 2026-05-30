import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../../services/api.ts';
import logo from '../../../assets/logos/Syrian_Government_Logo.svg';
import { formatDateTime } from '../../../utils/dateFormatter.ts';

type StepData = Record<string, any>;

interface RequestDetailsData {
  request: {
    id: string;
    status: string;
    currentStep: number;
    createdAt: string;
    updatedAt: string;
  };
  transaction: {
    name: string;
  };
  citizen: {
    name: string;
    nationalId: string;
  };
  steps: {
    id: string;
    stepOrder: number;
    sectionName: string;
    institutionName: string;
    status: string;
    processedAt: string | null;
    processor: {
      name: string | null;
      email: string | null;
      role: string | null;
    } | null;
    data: StepData | null;
  }[];
  cumulativeData: StepData;
}

export default function PrintRequest() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<RequestDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrintDetails = async () => {
      if (!requestId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/requests/${requestId}/print-details`);
        if (response.data?.success && response.data?.data) {
          setDetails(response.data.data);
        } else {
          setError(response.data?.error || 'فشل في جلب تفاصيل المعاملة للطباعة');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'حدث خطأ أثناء الاتصال بالخادم لجلب تفاصيل المعاملة');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrintDetails();
  }, [requestId]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Utility function to format database keys for display
  const formatKeyName = (key: string): string => {
    // Remove system alphanumeric prefixes like "34LegalParagraph" -> "LegalParagraph" or "B3PersonalNote" -> "PersonalNote"
    let cleaned = key.replace(/^[0-9a-zA-Z]{2}/, '');

    const translations: Record<string, string> = {
      'LegalParagraph': 'المطالعة القانونية',
      'fullName': 'الاسم الكامل',
      'fullNameArabic': 'الاسم الكامل باللغة العربية',
      'nationalId': 'الرقم الوطني',
      'phone': 'رقم الهاتف',
      'address': 'العنوان التفصيلي',
      'email': 'البريد الإلكتروني',
      'dateOfBirth': 'تاريخ الميلاد',
      'motherName': 'اسم الأم',
      'notes': 'الملاحظات العامة',
      'price': 'السعر المحدد',
      'amount': 'المبلغ المستحق',
      'description': 'الوصف الفني',
      'reason': 'السبب الموضح',
      'status': 'الحالة الحالية',
      'date': 'التاريخ والموعد',
    };

    if (translations[cleaned]) return translations[cleaned];
    if (translations[key]) return translations[key];

    // Otherwise, clean camelCase or snake_case key
    cleaned = cleaned.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  // Utility to filter step data (ignoring PersonalNote keys)
  const getFilteredStepData = (data: StepData | null): [string, any][] => {
    if (!data) return [];
    return Object.entries(data).filter(([key]) => {
      // Exclude keys containing "PersonalNote"
      return !key.toLowerCase().includes('personalnote');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-primary)] text-[var(--color-text)]">
        <Loader2 className="w-12 h-12 text-[var(--color-action)] animate-spin mb-4" />
        <p className="text-lg font-medium animate-pulse">جارٍ تحميل بيانات المعاملة للطباعة...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-primary)] text-[var(--color-text)] p-4">
        <div className="max-w-md w-full text-center bg-[var(--color-section)] border border-[var(--color-outine)] rounded-3xl p-8 shadow-xl">
          <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-4">
            <FileText className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold mb-2">تعذر تحميل بيانات الطباعة</h2>
          <p className="text-[var(--color-sub-text)] mb-6 text-sm">{error || 'الطلب غير موجود أو لا تملك الصلاحية الكافية لعرضه.'}</p>
          <button
            onClick={handleBack}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-action)] hover:bg-[var(--color-action-hover)] px-5 py-3 font-semibold text-[var(--color-text-button)] transition-all transform active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={16} />
            العودة للمكان السابق
          </button>
        </div>
      </div>
    );
  }

  // Get primary institution name from the first completed step
  const institutionName = details.steps.find(s => s.institutionName)?.institutionName || 'الخدمات الإلكترونية';
  
  // Format transaction status into Arabic
  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'rejected': return 'مرفوضة';
      case 'cancelled': return 'ملغاة';
      case 'in_progress': return 'قيد المعالجة';
      default: return 'معلقة';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/95 dark:bg-slate-950 py-8 px-4 flex flex-col items-center select-none" dir="rtl">
      
      {/* Dynamic Screen Action Bar */}
      <div className="w-full max-w-[210mm] no-print mb-6 flex justify-between items-center bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-xl transition-all">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 text-sm font-semibold transition-all hover:translate-x-[-2px] cursor-pointer"
        >
          <ArrowLeft size={16} />
          رجوع
        </button>
        <div className="text-slate-300 font-medium text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          جاهز للطباعة / التصدير
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-5 py-2.5 text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.03] cursor-pointer"
        >
          <Printer size={16} />
          طباعة الصفحة (A4)
        </button>
      </div>

      {/* A4 Printable Sheet Container */}
      <div 
        className="print-container bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] rounded-3xl shadow-2xl border border-slate-200/50 flex flex-col justify-between transition-all"
        id="a4-sheet"
      >
        <div>
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            
            {/* Top Right Header Details */}
            <div className="text-right flex flex-col gap-1.5 text-black">
              <span className="font-bold text-[15px] tracking-wide">الجمهورية العربية السورية</span>
              <span className="font-semibold text-[14px]">وزارة {institutionName}</span>
              <span className="text-xs text-neutral-600 font-medium mt-1">تاريخ الطلب: {formatDateTime(details.request.createdAt)}</span>
            </div>

            {/* Top Left Syrian Logo */}
            <div className="text-left">
              <img 
                src={logo} 
                alt="الجمهورية العربية السورية" 
                className="w-20 h-20 object-contain drop-shadow-sm print:drop-shadow-none"
              />
            </div>

          </div>

          {/* Bold Sleek Horizontal Separator */}
          <hr className="border-t-2 border-neutral-800 my-4" />

          {/* Document Content Space */}
          <div className="pt-4 flex flex-col gap-6">
            
            {/* Request Summary Title Card */}
            <div className="text-center bg-neutral-50 print:bg-transparent border border-neutral-200/80 rounded-2xl p-4 flex flex-col gap-1.5">
              <h2 className="text-lg font-bold text-neutral-900 tracking-wide">{details.transaction.name}</h2>
              <span className="text-xs text-neutral-500 font-medium">رقم الطلب المرجعي: {details.request.id}</span>
              
              <div className="flex justify-center gap-6 text-xs font-semibold text-neutral-700 mt-2">
                <span>اسم المواطن: {details.citizen.name}</span>
                <span className="w-px bg-neutral-300"></span>
                <span>الرقم الوطني: {details.citizen.nationalId}</span>
                <span className="w-px bg-neutral-300"></span>
                <span>الحالة: <span className="font-bold text-neutral-900">{formatStatus(details.request.status)}</span></span>
              </div>
            </div>

            {/* Dynamic general form handling all steps data */}
            <div className="flex flex-col gap-5 mt-2">
              {details.steps.map((step) => {
                const filteredData = getFilteredStepData(step.data);
                const hasProcessedInfo = step.processedAt || step.processor?.name;

                return (
                  <div key={step.id} className="border border-neutral-300 rounded-xl overflow-hidden print:break-inside-avoid">
                    {/* Step Title Header */}
                    <div className="bg-neutral-100 border-b border-neutral-300 px-4 py-2.5 flex justify-between items-center">
                      <span className="font-bold text-sm text-neutral-800">
                        الخطوة {step.stepOrder} • {step.sectionName}
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        step.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {step.status === 'approved' ? 'موافق عليها' : 'مرفوضة'}
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="p-4 flex flex-col gap-3.5">
                      {/* Processor Details */}
                      {hasProcessedInfo && (
                        <div className="text-[11px] text-neutral-500 font-semibold flex flex-wrap gap-x-4 gap-y-1 pb-2 border-b border-dashed border-neutral-200">
                          {step.processor?.name && (
                            <span>معالجة بواسطة: {step.processor.name} ({step.processor.role === 'employee' ? 'موظف' : step.processor.role === 'co_manager' ? 'معاون مدير' : 'مدير'})</span>
                          )}
                          {step.processedAt && (
                            <span>بتاريخ: {formatDateTime(step.processedAt)}</span>
                          )}
                        </div>
                      )}

                      {/* Generic Form Data Fields (ignoring Personal Notes) */}
                      {filteredData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                          {filteredData.map(([key, value]) => (
                            <div 
                              key={key} 
                              className="bg-neutral-50/50 print:bg-transparent border border-neutral-200/60 rounded-lg p-2.5 flex flex-col gap-1 print:border-neutral-100"
                            >
                              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                {formatKeyName(key)}
                              </span>
                              <span className="text-xs font-semibold text-neutral-900 break-words whitespace-pre-wrap">
                                {typeof value === 'boolean' 
                                  ? (value ? 'نعم' : 'لا') 
                                  : typeof value === 'object' 
                                    ? JSON.stringify(value) 
                                    : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-xs text-neutral-400 font-medium italic">
                          لم يتم إدخال بيانات في هذه الخطوة
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Professional Print Page Footer */}
        <div className="mt-12 pt-4 border-t border-dashed border-neutral-300 text-center flex justify-between items-center text-[10px] text-neutral-400 font-semibold print:text-neutral-500">
          <span>المعاملات الإلكترونية الحكومية • الجمهورية العربية السورية</span>
          <span>صفحة 1 من 1</span>
          <span>معرف المعاملة: {details.request.id.slice(0, 8)}</span>
        </div>

      </div>

      {/* Styled inline sheet printing CSS rules */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>

    </div>
  );
}
