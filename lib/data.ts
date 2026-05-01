import type { QuizQuestion, InterviewQuestion, WorkplaceSituation } from "./types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    q: "What ECE qualification do you hold?",
    opts: ["Bachelor of Education (ECE)", "Diploma in ECE", "Overseas ECE degree or diploma", "No formal ECE qualification yet"],
    scores: [10, 7, 6, 0],
  },
  {
    q: "How familiar are you with Te Whāriki?",
    opts: ["I've studied it in depth", "I've heard of it, know the basics", "This is new to me", "I work with it already in NZ"],
    scores: [9, 5, 0, 10],
  },
  {
    q: "Have you written Learning Stories?",
    opts: ["Yes, regularly", "I know what they are, written a few", "Heard of them, never written one", "What is a Learning Story?"],
    scores: [10, 6, 3, 0],
  },
  {
    q: "How confident is your spoken English professionally?",
    opts: ["Very confident", "Comfortable but improving", "I manage but find it hard", "I prefer Mandarin at work"],
    scores: [10, 7, 4, 1],
  },
  {
    q: "Where are you with NZ Teacher Registration?",
    opts: ["Fully registered", "Application in progress", "Know I need to, haven't started", "Didn't know I needed to"],
    scores: [10, 6, 3, 0],
  },
  {
    q: "How many NZ ECE interviews have you had?",
    opts: ["Three or more", "One or two", "None yet", "I've interviewed but not been offered"],
    scores: [10, 6, 2, 4],
  },
  {
    q: "How familiar are you with NZ ECE workplace culture?",
    opts: ["I've worked in NZ ECE", "Visited or volunteered in NZ centres", "Researched it online", "Not familiar yet"],
    scores: [10, 7, 4, 1],
  },
  {
    q: "Do you have an NZ-ready CV?",
    opts: ["Yes — reviewed and ready", "Have a CV, not NZ-specific", "Need to write one from scratch", "Used my overseas CV"],
    scores: [10, 5, 2, 1],
  },
  {
    q: "How do you feel about communicating with NZ parents?",
    opts: ["Confident — I build strong relationships", "Working on it", "I find it challenging", "Very little experience"],
    scores: [10, 6, 3, 1],
  },
  {
    q: "What's your timeline for NZ ECE work?",
    opts: ["Within a month", "Within 3 months", "Exploring, no rush", "Already working in NZ ECE"],
    scores: [8, 7, 5, 10],
  },
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    cat: "values",
    q: "Why do you want to work in early childhood education?",
    a: "NZ panels want genuine passion — not a job answer. Talk about what specifically draws you to under-5s, your philosophy on play, and what you believe about how children learn.",
    tip: "Avoid: 'I love children.' Say what specifically about their development excites you.",
  },
  {
    cat: "behaviour",
    q: "Tell me about a time a child was upset. What did you do?",
    a: "Tests emotional intelligence. Use a specific example — the child's state, what you observed, how you responded, and what happened. Show co-regulation, not control.",
    tip: "STAR method: Situation, Task, Action, Result. Specific beats general every time.",
  },
  {
    cat: "curriculum",
    q: "How would you plan an activity based on a child's interest?",
    a: "They want child-led planning. Describe observing a child, documenting the interest (Learning Story), then extending it — following the child, not imposing.",
    tip: "Reference Te Whāriki strands: Belonging, Wellbeing, Exploration, Communication, Contribution.",
  },
  {
    cat: "culture",
    q: "How do you build relationships with parents from different cultural backgrounds?",
    a: "Show curiosity, not assumptions. Families are experts on their own children. Mention open communication, warmth, and respect for different parenting values.",
    tip: "Show you understand NZ's bicultural and multicultural commitments — especially important for Chinese applicants.",
  },
  {
    cat: "values",
    q: "What does a safe environment look like to you?",
    a: "Both physical and emotional safety. NZ ECE values risk-enabling environments, not over-protection. Describe supervised risk and emotional safety.",
    tip: "NZ ECE balances safety with the value of challenging, risky play for development.",
  },
  {
    cat: "behaviour",
    q: "Describe a time you disagreed with a colleague.",
    a: "Show you addressed it directly but respectfully, kept the child's wellbeing central, and sought resolution rather than avoidance.",
    tip: "Avoid: 'I just went along with it.' Show adult professional communication.",
  },
  {
    cat: "curriculum",
    q: "What do you know about Learning Stories?",
    a: "Narrative assessments capturing a moment of learning, connected to Te Whāriki. Written for the child and family — warm, personal, strengths-based.",
    tip: "Haven't written one? Be honest but show you've researched them. Bring a printed sample if possible.",
  },
  {
    cat: "culture",
    q: "How do you feel about working in a bicultural environment?",
    a: "Biculturalism — honouring the Treaty of Waitangi — is foundational in NZ ECE. Show genuine respect for Te Reo Māori and that you're on a learning journey.",
    tip: "Learn 5–10 Te Reo words before your interview. It signals real respect, not just compliance.",
  },
];

export const WORKPLACE_SITUATIONS: WorkplaceSituation[] = [
  { id: "manager",  icon: "😓", en: "My manager is difficult",          zh: "我的管理者很难相处",     subEn: "Conflict, being dismissed, unfair treatment",       subZh: "冲突、被忽视、不公正对待" },
  { id: "voice",    icon: "🤐", en: "I don't feel heard",                zh: "我感觉没有发言权",       subEn: "My ideas are ignored, I feel invisible",           subZh: "我的意见被忽视，我感觉不存在" },
  { id: "job",      icon: "😰", en: "I'm worried about my job",          zh: "我担心我的工作",         subEn: "Performance concerns, probation, threats",         subZh: "绩效问题、试用期、威胁" },
  { id: "cultural", icon: "🌏", en: "Cultural misunderstandings",         zh: "文化误解",               subEn: "Being treated differently, communication barriers", subZh: "被区别对待、沟通障碍" },
  { id: "rights",   icon: "⚖️", en: "I think I'm being treated unfairly", zh: "我认为我被不公平对待",  subEn: "Possible discrimination or rights violations",     subZh: "可能的歧视或权利侵犯" },
  { id: "other",    icon: "💬", en: "Something else",                    zh: "其他情况",               subEn: "I'll describe my situation",                       subZh: "我来描述我的情况" },
];

export const PATHWAY_QUESTIONS = [
  {
    id: "qual_country",
    en: "Where was your ECE qualification obtained?",
    zh: "你的幼教资质在哪里获得？",
    opts: [
      { en: "New Zealand", zh: "新西兰" },
      { en: "China", zh: "中国" },
      { en: "Other Asian country", zh: "其他亚洲国家" },
      { en: "Other", zh: "其他" },
    ],
  },
  {
    id: "qual_level",
    en: "What level is your qualification?",
    zh: "你的资质级别是什么？",
    opts: [
      { en: "Bachelor degree or higher", zh: "学士学位或以上" },
      { en: "Diploma (3 years)", zh: "文凭（3年）" },
      { en: "Diploma (2 years or less)", zh: "文凭（2年或以下）" },
      { en: "Certificate only", zh: "仅证书" },
    ],
  },
  {
    id: "nz_experience",
    en: "Do you have any NZ ECE work experience?",
    zh: "你有新西兰幼教工作经验吗？",
    opts: [
      { en: "Yes — more than 6 months", zh: "是——超过6个月" },
      { en: "Yes — less than 6 months", zh: "是——不足6个月" },
      { en: "No, but I have overseas ECE experience", zh: "没有，但我有海外幼教经验" },
      { en: "No ECE work experience", zh: "没有幼教工作经验" },
    ],
  },
];
