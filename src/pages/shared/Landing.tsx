import { Link } from 'react-router-dom';
import logo from '../../assets/logos/Syrian_Government_Logo.svg';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-14 w-14 object-contain" />
            <div>
              <div className="text-lg font-bold">الجمهورية العربية السورية</div>
              <div className="text-sm text-[var(--color-sub-text)]">منصة معاملات المؤسسات</div>
            </div>
          </div>
          <Link
            to="/login/employee"
            className="rounded-2xl bg-[var(--color-action)] px-6 py-3 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
          >
            تسجيل الدخول
          </Link>
        </header>

        <main className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-8 shadow-[rgba(0,0,0,0.1)_0_0.27rem_0.7rem]">
            <h1 className="text-3xl font-extrabold leading-tight">
              أتمتة المعاملات الحكومية باستخدام تقنية البلوك تشين
            </h1>
            <p className="mt-4 text-[var(--color-sub-text)] leading-relaxed">
              واجهة المؤسسات لإدارة الأقسام والموظفين وقوالب المعاملات وتتبع الطلبات بشكل آمن وشفاف.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login/employee"
                className="rounded-2xl bg-[var(--color-action)] px-6 py-3 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
              >
                دخول الموظفين
              </Link>
              <Link
                to="/login/manager"
                className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-6 py-3 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              >
                دخول المدير
              </Link>
              <Link
                to="/login/co-manager"
                className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-6 py-3 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              >
                دخول نائب المدير
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-6">
              <div className="text-lg font-bold mb-1">أدوار المؤسسة</div>
              <div className="text-[var(--color-sub-text)]">
                مدير، نائب مدير، وموظفون بصلاحيات منفصلة وطرق وصول محمية.
              </div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-6">
              <div className="text-lg font-bold mb-1">الطلبات</div>
              <div className="text-[var(--color-sub-text)]">
                تتبع المعاملات الجارية والطلبات الواردة وربطها بالأقسام داخلياً.
              </div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-6">
              <div className="text-lg font-bold mb-1">قوالب المعاملات</div>
              <div className="text-[var(--color-sub-text)]">
                تعريف الخطوات والبيانات الأولية المطلوبة لضمان اكتمال المعاملة قبل المعالجة.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

