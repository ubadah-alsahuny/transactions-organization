// File: src/utils/constants.js

export const constants = {
  // Default assets
  DEFAULT_LOGO: '/src/packages/document-generator/assets/images/syria-logo.svg',
  DEFAULT_STAMP: '/src/packages/document-generator/assets/images/default-stamp.png',
  
  // Colors
  PRIMARY_COLOR: '#1a237e',
  SECONDARY_COLOR: '#0d47a1',
  TERTIARY_COLOR: '#e3f2fd',
  FONT_FAMILY: 'Arial, sans-serif',
  
  // Security layer settings
  SECURITY_LINES_COUNT: 120,
  SECURITY_OPACITY_MIN: 0.12,
  SECURITY_OPACITY_MAX: 0.30,
  
  // Page settings
  PAGE_SIZE: 'A4',
  PAGE_WIDTH: 210, // mm
  PAGE_HEIGHT: 297, // mm
  PAGE_MARGIN: 20, // mm
  
  // Static Arabic texts
  STATIC_TEXTS: {
    REPUBLIC: 'الجمهورية العربية السورية',
    DEPARTMENT: 'وزارة',
    OFFICIAL_DOCUMENT: 'وثيقة رسمية',
    VERIFICATION_TEXT: 'هذه الوثيقة إلكترونية وصالحة للاستخدام',
    QR_LABEL: 'امسح للتحقق من صحة الوثيقة',
    CITIZEN_INFO: 'بيانات المواطن',
    TRANSACTION_INFO: 'بيانات المعاملة',
    ADDITIONAL_DATA: 'تفاصيل الطلب',
    EMPLOYEE_NOTES: 'ملاحظات الموظفين',
    SIGNATURE: 'التوقيع',
    DATE: 'التاريخ',
    STAMP: 'الختم'
  },
  
  // Request statuses (from Postman)
  REQUEST_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed'
  },
  
  // Roles
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    CO_MANAGER: 'co_manager',
    EMPLOYEE: 'employee',
    CITIZEN: 'citizen'
  }
};

export default constants;