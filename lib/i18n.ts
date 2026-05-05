export type Lang = 'en' | 'zh' | 'ms';

export const translations = {
  en: {
    // Welcome / IC entry
    welcome: 'WELCOME',
    enterIc: 'Enter IC / Passport Number',
    icPlaceholder: 'e.g. 990101011234',
    continue: 'CONTINUE',
    back: 'BACK',
    language: 'Language',

    // New customer registration
    register: 'REGISTER',
    firstTimeHere: 'First time at X FITNESS',
    fullName: 'Full Name',
    namePlaceholder: 'Your full name',
    phone: 'Phone Number',
    phonePlaceholder: 'e.g. 0123456789',
    emergencyName: 'Emergency Contact Name',
    emergencyPhone: 'Emergency Contact Phone',
    agreeTerms: 'I have read and agree to the Terms & Conditions',
    viewTerms: 'View Terms & Conditions',
    submit: 'CHECK-IN',

    // Returning customer
    welcomeBack: 'WELCOME BACK',
    confirmCheckin: 'CONFIRM CHECK-IN',
    notYou: 'Not you? Go back',

    // Approved
    approved: 'WALK-IN ACCESS APPROVED',
    approvedSub: 'Please proceed to the counter for payment',
    enjoyWorkout: 'Enjoy your workout',

    // Banned
    banned: 'BANNED',
    bannedSub: 'You are not permitted to enter',
    bannedContact: 'Please leave the premises',

    // Errors
    invalidIc: 'Please enter a valid IC number',
    fillAllFields: 'Please fill in all required fields',
    mustAgree: 'You must agree to the Terms & Conditions',
    error: 'Something went wrong. Please try again',
    duplicateIc: 'This IC is already registered. Please go back and enter your IC',
  },
  zh: {
    welcome: '欢迎',
    enterIc: '请输入身份证 / 护照号码',
    icPlaceholder: '例如 990101011234',
    continue: '继续',
    back: '返回',
    language: '语言',

    register: '注册',
    firstTimeHere: '第一次来 X FITNESS',
    fullName: '姓名',
    namePlaceholder: '请输入完整姓名',
    phone: '电话号码',
    phonePlaceholder: '例如 0123456789',
    emergencyName: '紧急联络人姓名',
    emergencyPhone: '紧急联络人电话',
    agreeTerms: '我已阅读并同意条款与细则',
    viewTerms: '查看条款与细则',
    submit: '确认入场',

    welcomeBack: '欢迎回来',
    confirmCheckin: '确认入场',
    notYou: '不是你？返回',

    approved: '入场已通过',
    approvedSub: '请到柜台付款',
    enjoyWorkout: '祝你训练愉快',

    banned: '已封禁',
    bannedSub: '禁止入场',
    bannedContact: '请离开本场所',

    invalidIc: '请输入有效的身份证号码',
    fillAllFields: '请填写所有必填栏位',
    mustAgree: '您必须同意条款与细则',
    error: '发生错误，请重试',
    duplicateIc: '该身份证已注册，请返回输入身份证',
  },
  ms: {
    welcome: 'SELAMAT DATANG',
    enterIc: 'Masukkan Nombor IC / Pasport',
    icPlaceholder: 'cth. 990101011234',
    continue: 'TERUSKAN',
    back: 'KEMBALI',
    language: 'Bahasa',

    register: 'DAFTAR',
    firstTimeHere: 'Kali pertama di X FITNESS',
    fullName: 'Nama Penuh',
    namePlaceholder: 'Nama penuh anda',
    phone: 'Nombor Telefon',
    phonePlaceholder: 'cth. 0123456789',
    emergencyName: 'Nama Hubungan Kecemasan',
    emergencyPhone: 'Telefon Hubungan Kecemasan',
    agreeTerms: 'Saya telah membaca dan bersetuju dengan Terma & Syarat',
    viewTerms: 'Lihat Terma & Syarat',
    submit: 'DAFTAR MASUK',

    welcomeBack: 'SELAMAT KEMBALI',
    confirmCheckin: 'SAHKAN DAFTAR MASUK',
    notYou: 'Bukan anda? Kembali',

    approved: 'AKSES WALK-IN DILULUSKAN',
    approvedSub: 'Sila ke kaunter untuk pembayaran',
    enjoyWorkout: 'Selamat bersenam',

    banned: 'DIHARAMKAN',
    bannedSub: 'Anda tidak dibenarkan masuk',
    bannedContact: 'Sila tinggalkan premis',

    invalidIc: 'Sila masukkan nombor IC yang sah',
    fillAllFields: 'Sila isi semua medan yang diperlukan',
    mustAgree: 'Anda mesti bersetuju dengan Terma & Syarat',
    error: 'Sesuatu telah berlaku. Sila cuba lagi',
    duplicateIc: 'IC ini telah didaftarkan. Sila kembali dan masukkan IC anda',
  },
};

export function t(lang: Lang, key: keyof typeof translations.en): string {
  return translations[lang][key] || translations.en[key];
}
