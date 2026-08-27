export const seedUsers = [
  {
    username: "Admin",
    email: "admin@test.com",
    phone: "p011",
    password: "", // hashed automatically by seed.js (1234)
    address: "Cairo, Egypt",
    gender: "male",
    confirmEmail: true,
    role: "admin",
  },
  {
    username: "Staff",
    email: "staff@test.com",
    phone: "p012",
    password: "", // hashed automatically by seed.js (1234)
    address: "Giza, Egypt",
    gender: "female",
    confirmEmail: true,
    role: "staff",
  },
  {
    username: "Customer",
    email: "customer@test.com",
    phone: "p013",
    password: "", // hashed automatically by seed.js (1234)
    address: "Alexandria, Egypt",
    gender: "male",
    confirmEmail: true,
    role: "customer",
  },
  {
    username: "Sara Ahmed",
    email: "sara@test.com",
    phone: "p014",
    password: "", // hashed automatically by seed.js (1234)
    address: "Mansoura, Egypt",
    gender: "female",
    confirmEmail: true,
    role: "customer",
  },
];

export const seedCategories = [
  { name: "العلوم الشرعية", description: "اشرف العلوم" },
  { name: "الروايات", description: "روايات مميزة" },
  { name: "التاريخ", description: "كتب عن التاريخ" },
  { name: "العلوم", description: "عن العلوم المتنوعة و الابحاث" },
  { name: "اخرى", description: "" },
];

export const seedAuthors = [
  {
    name: "Ahmed Khaled",
    bio: "Egyptian novelist known for sci-fi stories.",
    birthDate: new Date("1972-03-12"),
  },
  {
    name: "Nadia Salem",
    bio: "Author of history and civilization books.",
    birthDate: new Date("1980-07-22"),
  },
  {
    name: "Omar Hossam",
    bio: "Fantasy writer and world builder.",
    birthDate: new Date("1985-01-05"),
  },
  {
    name: "Laila Mansour",
    bio: "Biographer and journalist.",
    birthDate: new Date("1975-11-18"),
  },
  {
    name: "Karim Fathy",
    bio: "Science communicator and researcher.",
    birthDate: new Date("1990-06-30"),
  },
  {
    name: "Mona Hassan",
    bio: "Literary fiction author.",
    birthDate: new Date("1988-09-14"),
    deathDate: new Date("1988-09-14"),
  },
];

export const seedBooks = [
  {
    title: "صحيح مسلم",
    subtitle: "أصح الكتب المصنفة بعد كتاب الله تعالى",
    description:
      "أحد أهم كتب الحديث النبوي، جمع فيه الإمام مسلم الأحاديث الصحيحة مع بيان معانيها وأحكامها وفقهها.",
    pages: 920,
    price: 180,
    costPrice: 90,
    quantity: 15,
    minQuantity: 5,
    availableToBorrow: true,
    publisher: "دار ابن كثير",
    cover: "/covers/muslim.svg",
  },
  {
    title: "ميراث التنين",
    subtitle: "آخر نسل الدم القديم",
    description:
      "ملحمة خيالية ملحمية عن آخر وريث من سلالة التنين يحارب لاستعادة عرشه الضائع ويكشف أسرار عالمه المنسي.",
    pages: 610,
    price: 150,
    costPrice: 85,
    quantity: 8,
    minQuantity: 2,
    availableToBorrow: false,
    publisher: "دار الخيال",
    cover: "/covers/dragon.svg",
  },
  {
    title: "مصر القديمة من جديد",
    subtitle: "أسرار الفراعنة",
    description:
      "دراسة تاريخية مفصلة عن الحضارة المصرية القديمة وحضارات وادي النيل وألغازها الخالدة.",
    pages: 450,
    price: 120,
    costPrice: 70,
    quantity: 10,
    minQuantity: 3,
    availableToBorrow: true,
    publisher: "دار التحرير",
    cover: "/covers/egypt.svg",
  },
  {
    title: "عوالم الكم",
    subtitle: "فهم العالم الكمي",
    description:
      "مقدمة مبسطة في ميكانيكا الكم تفتح أبواب الفضول أمام القراء غير المتخصصين.",
    pages: 290,
    price: 110,
    costPrice: 62,
    quantity: 9,
    minQuantity: 3,
    availableToBorrow: true,
    publisher: "دار العلوم",
    cover: "/covers/quantum.svg",
  },
  {
    title: "مدينة الزجاج",
    subtitle: "رواية عن الذاكرة والفقد",
    description:
      "عمل أدبي يستكشف الروابط الأسرية وهشاشة الذاكرة من خلال حكاية عائلة في مدينة عصرية.",
    pages: 240,
    price: 75,
    costPrice: 40,
    quantity: 20,
    minQuantity: 5,
    availableToBorrow: true,
    publisher: "دار الدلتا",
    cover: "/covers/glass.svg",
  },
  {
    title: "الأربعون النووية",
    subtitle: "أربعون حديثاً نبوياً صحيحاً",
    description:
      "مجموعة الإمام النووي لأهم الأحاديث النبوية التي يدور عليها أكثر أمر الدين وأحكام الشريعة.",
    pages: 180,
    price: 95,
    costPrice: 45,
    quantity: 18,
    minQuantity: 5,
    availableToBorrow: true,
    publisher: "دار ابن كثير",
    cover: "/covers/nawawi.svg",
  },
  {
    title: "أصداء الماضي",
    subtitle: "إثارة عبر الزمن",
    description:
      "عالم يغير مسار التاريخ بالخطأ ويضطر إلى السفر في الزمن لإصلاح المخطط الزمني قبل فوات الأوان.",
    pages: 410,
    price: 105,
    costPrice: 58,
    quantity: 11,
    minQuantity: 4,
    availableToBorrow: true,
    publisher: "دار ابن كثير",
    cover: "/covers/echoes.svg",
  },
  {
    title: "حضارة الأندلس",
    subtitle: "أمة بنت الحضارة ورعت العلم",
    description:
      "دراسة تاريخية عن حضارة الأندلس وازدهار العلوم والفنون والعمارة في ربوعها عبر القرون.",
    pages: 520,
    price: 135,
    costPrice: 78,
    quantity: 7,
    minQuantity: 2,
    availableToBorrow: true,
    publisher: "دار التحرير",
    cover: "/covers/andalus.svg",
  },
];

export const seedCustomers = [
  {
    username: "Omar Walk-In",
    phone: "0111",
    address: "Nasr City, Cairo",
    gender: "male",
    type: "branch",
  },
  {
    username: "Dina Online",
    phone: "0112",
    address: "Zamalek, Cairo",
    gender: "female",
    type: "online",
  },
  {
    username: "Mostafa Mixed",
    phone: "0113",
    address: "Heliopolis, Cairo",
    gender: "male",
    type: "onlineAndBranch",
  },
];
