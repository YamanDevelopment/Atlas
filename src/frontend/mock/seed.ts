import type { 
  User, 
  Club, 
  Event, 
  Professor, 
  Interest, 
  StarterPlan, 
  Commitment, 
  Nudge, 
  InterestCategory,
  ClubCategory,
  EventCategory
} from '../types';

// Mock interests pool
export const MOCK_INTERESTS: Interest[] = [
  // Academic
  { id: '1', name: 'Machine Learning', category: 'academic', isCustom: false },
  { id: '2', name: 'Data Science', category: 'academic', isCustom: false },
  { id: '3', name: 'Web Development', category: 'academic', isCustom: false },
  { id: '4', name: 'Robotics', category: 'academic', isCustom: false },
  { id: '5', name: 'Cybersecurity', category: 'academic', isCustom: false },
  { id: '6', name: 'Biology Research', category: 'academic', isCustom: false },
  { id: '7', name: 'Psychology', category: 'academic', isCustom: false },
  { id: '8', name: 'Business', category: 'academic', isCustom: false },
  { id: '9', name: 'Marketing', category: 'academic', isCustom: false },
  { id: '10', name: 'Finance', category: 'academic', isCustom: false },
  
  // Career
  { id: '11', name: 'Entrepreneurship', category: 'career', isCustom: false },
  { id: '12', name: 'Consulting', category: 'career', isCustom: false },
  { id: '13', name: 'Software Engineering', category: 'career', isCustom: false },
  { id: '14', name: 'Product Management', category: 'career', isCustom: false },
  { id: '15', name: 'Design', category: 'career', isCustom: false },
  
  // Hobbies
  { id: '16', name: 'Photography', category: 'hobby', isCustom: false },
  { id: '17', name: 'Music Production', category: 'hobby', isCustom: false },
  { id: '18', name: 'Gaming', category: 'hobby', isCustom: false },
  { id: '19', name: 'Reading', category: 'hobby', isCustom: false },
  { id: '20', name: 'Writing', category: 'hobby', isCustom: false },
  { id: '21', name: 'Art', category: 'hobby', isCustom: false },
  
  // Lifestyle
  { id: '22', name: 'Christianity', category: 'lifestyle', isCustom: false },
  { id: '23', name: 'Meditation', category: 'lifestyle', isCustom: false },
  { id: '24', name: 'Sustainability', category: 'lifestyle', isCustom: false },
  { id: '25', name: 'Volunteering', category: 'lifestyle', isCustom: false },
  
  // Sports
  { id: '26', name: 'Pickleball', category: 'sport', isCustom: false },
  { id: '27', name: 'Soccer', category: 'sport', isCustom: false },
  { id: '28', name: 'Basketball', category: 'sport', isCustom: false },
  { id: '29', name: 'Tennis', category: 'sport', isCustom: false },
  { id: '30', name: 'Swimming', category: 'sport', isCustom: false },
];

export const MOCK_MAJORS = [
  'Computer Science',
  'Computer Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'Biology',
  'Psychology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'English',
  'Marketing',
  'Finance',
  'Accounting',
  'Nursing',
  'Pre-Med',
  'Pre-Law',
  'Communications',
  'Graphic Design',
  'Art',
  'Music',
  'Theatre',
  'History',
  'Political Science',
  'International Relations',
  'Environmental Science',
  'Architecture',
  'Other'
];

// Mock clubs
export const MOCK_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'AI Research Club',
    description: 'A community of students passionate about artificial intelligence, machine learning, and the future of technology. We work on projects, host guest speakers, and compete in hackathons.',
    shortDescription: 'Explore AI/ML through projects and competitions',
    tags: ['AI', 'Machine Learning', 'Research', 'Technology'],
    category: 'academic',
    timeCommitment: '4-6 hours/week',
    meetingFrequency: 'Weekly meetings + project time',
    contactInfo: {
      email: 'ai.research@ucf.edu',
      discord: 'discord.gg/aiclub',
      instagram: '@ucf_aiclub'
    },
    whyRecommended: 'Perfect match for your machine learning interest and computer science major',
    memberCount: 87,
    isProfessional: true
  },
  {
    id: 'club-2', 
    name: 'Pickleball Club',
    description: 'Join UCF\'s fastest growing sport! We welcome players of all skill levels for casual games, tournaments, and social events.',
    shortDescription: 'Fun and fast-growing racquet sport for all levels',
    tags: ['Pickleball', 'Sports', 'Social', 'Recreation'],
    category: 'sport',
    timeCommitment: '2-3 hours/week',
    meetingFrequency: '3x week practices, optional tournaments',
    contactInfo: {
      email: 'pickleball@ucf.edu',
      instagram: '@ucf_pickleball'
    },
    whyRecommended: 'Great way to stay active and social - matches your pickleball interest!',
    memberCount: 124,
    isProfessional: false
  },
  {
    id: 'club-3',
    name: 'Google Developer Student Club',
    description: 'Connect with fellow developers, learn new technologies, and build solutions for local problems. Part of the global Google DSC network.',
    shortDescription: 'Learn and build with Google technologies',
    tags: ['Google', 'Development', 'Technology', 'Networking'],
    category: 'professional',
    timeCommitment: '3-5 hours/week',
    meetingFrequency: 'Bi-weekly meetings + workshops',
    contactInfo: {
      email: 'gdsc@ucf.edu',
      website: 'gdsc.ucf.edu',
      discord: 'discord.gg/gdscucf'
    },
    whyRecommended: 'Excellent for web development skills and career networking',
    memberCount: 156,
    isProfessional: true
  },
  {
    id: 'club-4',
    name: 'Photography Club',
    description: 'Capture the world through your lens! Learn photography techniques, explore campus and Orlando, and showcase your work.',
    shortDescription: 'Learn photography and explore creative expression',
    tags: ['Photography', 'Art', 'Creative', 'Visual'],
    category: 'hobby',
    timeCommitment: '2-4 hours/week',
    meetingFrequency: 'Weekly photo walks + monthly showcases',
    contactInfo: {
      email: 'photo@ucf.edu',
      instagram: '@ucf_photography'
    },
    whyRecommended: 'Perfect creative outlet matching your photography interest',
    memberCount: 89,
    isProfessional: false
  },
  {
    id: 'club-5',
    name: 'Christian Student Fellowship',
    description: 'A welcoming community for students to grow in faith, build friendships, and serve others together.',
    shortDescription: 'Faith-based community and service',
    tags: ['Christianity', 'Faith', 'Community', 'Service'],
    category: 'cultural',
    timeCommitment: '3-4 hours/week',
    meetingFrequency: 'Weekly meetings + bible study + service projects',
    contactInfo: {
      email: 'csf@ucf.edu',
      website: 'csfucf.org'
    },
    whyRecommended: 'Aligns with your Christianity interest and offers meaningful community',
    memberCount: 203,
    isProfessional: false
  },
  {
    id: 'club-6',
    name: 'Entrepreneurship Society',
    description: 'For students interested in starting their own ventures. We provide mentorship, networking, and pitch competitions.',
    shortDescription: 'Start and scale your business ideas',
    tags: ['Entrepreneurship', 'Business', 'Startups', 'Innovation'],
    category: 'professional',
    timeCommitment: '4-6 hours/week',
    meetingFrequency: 'Weekly workshops + monthly pitch events',
    contactInfo: {
      email: 'entrepreneurs@ucf.edu',
      website: 'entrepreneurship.ucf.edu',
      instagram: '@ucf_entrepreneurs'
    },
    whyRecommended: 'Great match for your entrepreneurship and business interests',
    memberCount: 167,
    isProfessional: true
  }
];

// Mock events
export const MOCK_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'AI Workshop: Building Your First Neural Network',
    description: 'Hands-on workshop covering the fundamentals of neural networks using TensorFlow. Perfect for beginners!',
    shortDescription: 'Learn neural network basics with hands-on coding',
    date: new Date('2025-09-30T18:00:00'),
    endDate: new Date('2025-09-30T20:00:00'),
    location: 'Engineering Building II, Room 208',
    organizer: 'AI Research Club',
    tags: ['AI', 'Machine Learning', 'Workshop', 'TensorFlow'],
    category: 'workshop',
    whyRecommended: 'Perfect for diving deeper into your machine learning interests',
    attendeeCount: 45,
    isVirtual: false,
    isFree: true
  },
  {
    id: 'event-2',
    title: 'Pickleball Tournament: Fall Championship',
    description: 'Compete in UCF\'s biggest pickleball tournament of the semester! All skill levels welcome with separate brackets.',
    shortDescription: 'Competitive tournament with prizes for all skill levels',
    date: new Date('2025-10-05T09:00:00'),
    endDate: new Date('2025-10-05T15:00:00'),
    location: 'Recreation and Wellness Center Courts',
    organizer: 'Pickleball Club',
    tags: ['Pickleball', 'Tournament', 'Competition', 'Sports'],
    category: 'sport',
    whyRecommended: 'Great opportunity to compete in your favorite sport!',
    attendeeCount: 32,
    isVirtual: false,
    isFree: false
  },
  {
    id: 'event-3',
    title: 'Tech Career Fair',
    description: 'Meet with top tech companies looking to hire UCF students for internships and full-time positions.',
    shortDescription: 'Network with tech recruiters and explore career opportunities',
    date: new Date('2025-10-08T10:00:00'),
    endDate: new Date('2025-10-08T16:00:00'),
    location: 'Student Union Pegasus Ballroom',
    organizer: 'Career Services',
    tags: ['Career', 'Technology', 'Networking', 'Jobs'],
    category: 'career',
    whyRecommended: 'Excellent for your computer science career path',
    attendeeCount: 234,
    isVirtual: false,
    isFree: true
  },
  {
    id: 'event-4',
    title: 'Photography Walk: Downtown Orlando',
    description: 'Explore downtown Orlando through your camera lens. We\'ll visit iconic spots and learn urban photography techniques.',
    shortDescription: 'Capture downtown Orlando with fellow photographers',
    date: new Date('2025-10-02T16:00:00'),
    endDate: new Date('2025-10-02T19:00:00'),
    location: 'Meet at Lake Eola Park',
    organizer: 'Photography Club',
    tags: ['Photography', 'Orlando', 'Urban', 'Art'],
    category: 'social',
    whyRecommended: 'Perfect way to practice photography in a beautiful setting',
    attendeeCount: 18,
    isVirtual: false,
    isFree: true
  }
];

// Mock professors
export const MOCK_PROFESSORS: Professor[] = [
  {
    id: 'prof-1',
    name: 'Dr. Sarah Chen',
    title: 'Associate Professor',
    department: 'Computer Science',
    researchAreas: ['Machine Learning', 'Natural Language Processing', 'AI Ethics'],
    email: 'sarah.chen@ucf.edu',
    officeLocation: 'Engineering I, Room 345',
    bio: 'Dr. Chen leads cutting-edge research in machine learning applications for healthcare and natural language understanding.',
    recentWork: [
      'Published in ICML 2024: "Ethical Considerations in Healthcare AI"',
      'NIH Grant: $2.3M for AI-assisted diagnosis research',
      'Featured speaker at NeurIPS 2024'
    ],
    whyRecommended: 'Perfect match for your machine learning interests - actively seeking undergraduate researchers',
    labName: 'Intelligent Systems Lab',
    isAcceptingStudents: true
  },
  {
    id: 'prof-2',
    name: 'Dr. Michael Rodriguez',
    title: 'Professor',
    department: 'Engineering',
    researchAreas: ['Robotics', 'Computer Vision', 'Autonomous Systems'],
    email: 'm.rodriguez@ucf.edu',
    officeLocation: 'Engineering II, Room 127',
    bio: 'Dr. Rodriguez\'s lab focuses on developing autonomous robots for search and rescue operations.',
    recentWork: [
      'IEEE Paper: "Autonomous Navigation in Complex Environments"',
      'NSF Grant: $1.8M for disaster response robotics',
      'Partnership with Orange County Emergency Services'
    ],
    whyRecommended: 'Excellent opportunity to combine your robotics and AI interests in practical applications',
    labName: 'Autonomous Robotics Lab',
    isAcceptingStudents: true
  },
  {
    id: 'prof-3',
    name: 'Dr. Emily Johnson',
    title: 'Assistant Professor',
    department: 'Business',
    researchAreas: ['Entrepreneurship', 'Innovation Management', 'Startup Ecosystems'],
    email: 'emily.johnson@ucf.edu',
    officeLocation: 'Business Building, Room 412',
    bio: 'Dr. Johnson studies how university environments can better support student entrepreneurs and startup formation.',
    recentWork: [
      'Published: "University Startup Incubators and Student Success"',
      'Consultant for UCF Business Incubator',
      'Mentor for 15+ student startups'
    ],
    whyRecommended: 'Perfect for exploring the intersection of business and entrepreneurship',
    isAcceptingStudents: true
  }
];

// Mock current user
export const MOCK_USER: User = {
  id: 'user-1',
  email: 'john.doe@ucf.edu',
  firstName: 'John',
  lastName: 'Doe',
  major: 'Computer Science',
  interests: [
    MOCK_INTERESTS[0], // Machine Learning
    MOCK_INTERESTS[25], // Pickleball
    MOCK_INTERESTS[15], // Photography
    MOCK_INTERESTS[21] // Christianity
  ],
  currentInvolvement: ['Study Group', 'Part-time job'],
  timeBudget: '3-5 hours',
  onboardingComplete: true,
  createdAt: new Date('2025-09-01')
};

// Mock starter plan
export const MOCK_STARTER_PLAN: StarterPlan = {
  id: 'plan-1',
  userId: 'user-1', 
  primaryRecommendation: MOCK_CLUBS[0], // AI Research Club
  secondaryRecommendations: [MOCK_CLUBS[1], MOCK_CLUBS[3]], // Pickleball, Photography
  alternativeRecommendations: [MOCK_CLUBS[2], MOCK_CLUBS[4], MOCK_CLUBS[5]], // Google DSC, CSF, Entrepreneurship
  createdAt: new Date('2025-09-27'),
  accepted: false
};

// Mock commitments
export const MOCK_COMMITMENTS: Commitment[] = [
  {
    id: 'commitment-1',
    type: 'club',
    itemId: 'club-1',
    name: 'AI Research Club',
    status: 'pending',
    addedAt: new Date('2025-09-26'),
    notes: 'Applied for membership, waiting for response'
  },
  {
    id: 'commitment-2', 
    type: 'event',
    itemId: 'event-1',
    name: 'AI Workshop: Building Your First Neural Network',
    status: 'active',
    addedAt: new Date('2025-09-25')
  }
];

// Mock nudges  
export const MOCK_NUDGES: Nudge[] = [
  {
    id: 'nudge-1',
    message: '2 new robotics opportunities added this week',
    type: 'new-opportunities',
    actionUrl: '/explore?category=robotics',
    createdAt: new Date('2025-09-26'),
    dismissed: false
  },
  {
    id: 'nudge-2',
    message: 'Pickleball tournament registration closes in 3 days',
    type: 'deadline-reminder', 
    actionUrl: '/event/event-2',
    createdAt: new Date('2025-09-25'),
    dismissed: false
  }
];