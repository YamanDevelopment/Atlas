// Hierarchical tag taxonomy for university events, organizations, and labs
// Primary tags (13) with secondary tags (5-20 each) for AI-powered categorization

interface TagDefinition {
	name: string;
	category: 'primary' | 'secondary';
	parentTag?: string; // Name of parent tag (only for secondary tags)
	description: string;
	synonyms?: string[];
}

interface InterestDefinition {
	keyword: string;
	category: string;
	synonyms: string[];
	relatedTags: string[]; // Will be converted to weighted linkedTags during initialization
}

// ===== HIERARCHICAL TAG STRUCTURE =====
export const COMPREHENSIVE_TAGS: TagDefinition[] = [
	// ==================== PRIMARY TAGS ====================
	{
		name: 'academic',
		category: 'primary',
		description: 'Educational and learning focused activities',
		synonyms: ['education', 'learning', 'study', 'scholarly', 'educational'],
	},
	{
		name: 'social',
		category: 'primary',
		description: 'Social interaction, networking, and community activities',
		synonyms: ['community', 'networking', 'social interaction', 'socializing'],
	},
	{
		name: 'arts & culture',
		category: 'primary',
		description: 'Creative arts, cultural activities, and artistic expression',
		synonyms: ['creative', 'artistic', 'cultural', 'arts', 'creativity'],
	},
	{
		name: 'sports & recreation',
		category: 'primary',
		description: 'Physical activities, sports, fitness, and recreational pursuits',
		synonyms: ['athletic', 'physical', 'recreation', 'sports', 'fitness'],
	},
	{
		name: 'technology',
		category: 'primary',
		description: 'Technology, programming, digital innovation, and tech careers',
		synonyms: ['tech', 'digital', 'innovation', 'technological'],
	},
	{
		name: 'professional development',
		category: 'primary',
		description: 'Career development, professional skills, and workplace preparation',
		synonyms: ['career', 'professional', 'workplace', 'career development'],
	},
	{
		name: 'community service',
		category: 'primary',
		description: 'Volunteer work, community service, and social impact activities',
		synonyms: ['volunteering', 'service', 'social impact', 'giving back'],
	},
	{
		name: 'health & wellness',
		category: 'primary',
		description: 'Mental health, physical wellness, and healthcare activities',
		synonyms: ['health', 'wellness', 'wellbeing', 'healthcare'],
	},
	{
		name: 'research',
		category: 'primary',
		description: 'Research activities, academic inquiry, and scholarly work',
		synonyms: ['research', 'academic research', 'scholarly', 'investigation'],
	},
	{
		name: 'leadership',
		category: 'primary',
		description: 'Leadership development, governance, and organizational management',
		synonyms: ['management', 'governance', 'administration', 'leading'],
	},
	{
		name: 'environmental',
		category: 'primary',
		description: 'Environmental conservation, sustainability, and green initiatives',
		synonyms: ['sustainability', 'green', 'eco-friendly', 'environmental'],
	},
	{
		name: 'religious & spiritual',
		category: 'primary',
		description: 'Faith-based, religious, and spiritual activities',
		synonyms: ['faith', 'spiritual', 'worship', 'religious'],
	},
	{
		name: 'special interests',
		category: 'primary',
		description: 'Unique hobbies, niche interests, and specialized activities',
		synonyms: ['hobbies', 'niche', 'specialized', 'unique interests'],
	},

	// ==================== SECONDARY TAGS - ACADEMIC ====================
	{
		name: 'computer science',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Programming, software development, and computing',
		synonyms: ['programming', 'coding', 'software', 'computing', 'cs'],
	},
	{
		name: 'engineering',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Engineering disciplines and technical problem solving',
		synonyms: ['technical', 'stem', 'design', 'engineering'],
	},
	{
		name: 'business studies',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Business, finance, management, and commerce',
		synonyms: ['business', 'finance', 'management', 'commerce', 'mba'],
	},
	{
		name: 'medicine & health sciences',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Healthcare, medical studies, and nursing',
		synonyms: ['medical', 'healthcare', 'nursing', 'health sciences', 'pre-med'],
	},
	{
		name: 'natural sciences',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Biology, chemistry, physics, and laboratory sciences',
		synonyms: ['biology', 'chemistry', 'physics', 'laboratory', 'science'],
	},
	{
		name: 'liberal arts & humanities',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Literature, philosophy, history, and humanities',
		synonyms: ['humanities', 'literature', 'philosophy', 'history', 'liberal arts'],
	},
	{
		name: 'law & legal studies',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Legal studies, jurisprudence, and law',
		synonyms: ['law', 'legal', 'jurisprudence', 'legal studies'],
	},
	{
		name: 'education & teaching',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Teaching, pedagogy, and educational studies',
		synonyms: ['teaching', 'pedagogy', 'education', 'curriculum'],
	},
	{
		name: 'mathematics & statistics',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Mathematics, statistics, and quantitative analysis',
		synonyms: ['mathematics', 'statistics', 'calculus', 'math', 'quantitative'],
	},
	{
		name: 'psychology & behavioral sciences',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Psychology, mental health studies, and behavioral science',
		synonyms: ['psychology', 'behavioral', 'mental health', 'counseling'],
	},
	{
		name: 'communications & media',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Communications, journalism, and media studies',
		synonyms: ['communications', 'journalism', 'media', 'broadcasting'],
	},
	{
		name: 'architecture & design',
		category: 'secondary',
		parentTag: 'academic',
		description: 'Architecture, urban planning, and design',
		synonyms: ['architecture', 'design', 'urban planning', 'architectural'],
	},

	// ==================== SECONDARY TAGS - SOCIAL ====================
	{
		name: 'greek life',
		category: 'secondary',
		parentTag: 'social',
		description: 'Fraternity and sorority activities',
		synonyms: ['fraternity', 'sorority', 'brotherhood', 'sisterhood', 'greek'],
	},
	{
		name: 'cultural & diversity',
		category: 'secondary',
		parentTag: 'social',
		description: 'Cultural heritage and diversity activities',
		synonyms: ['cultural', 'diversity', 'multicultural', 'ethnic', 'heritage'],
	},
	{
		name: 'international & global',
		category: 'secondary',
		parentTag: 'social',
		description: 'International activities and global perspectives',
		synonyms: ['international', 'global', 'foreign', 'worldwide'],
	},
	{
		name: 'lgbtq+ & inclusion',
		category: 'secondary',
		parentTag: 'social',
		description: 'LGBTQ+ community and inclusion activities',
		synonyms: ['lgbtq+', 'pride', 'queer', 'inclusion', 'diversity'],
	},
	{
		name: 'alumni & networking',
		category: 'secondary',
		parentTag: 'social',
		description: 'Alumni connections and professional networking',
		synonyms: ['alumni', 'networking', 'connections', 'graduates'],
	},
	{
		name: 'social events & parties',
		category: 'secondary',
		parentTag: 'social',
		description: 'Social gatherings, parties, and entertainment',
		synonyms: ['parties', 'social events', 'entertainment', 'fun'],
	},

	// ==================== SECONDARY TAGS - ARTS & CULTURE ====================
	{
		name: 'music & performance',
		category: 'secondary',
		parentTag: 'arts & culture',
		description: 'Music, bands, concerts, and musical performances',
		synonyms: ['music', 'musical', 'band', 'concert', 'singing', 'instruments'],
	},
	{
		name: 'theatre & drama',
		category: 'secondary',
		parentTag: 'arts & culture',
		description: 'Theatre, drama, acting, and stage performances',
		synonyms: ['theatre', 'drama', 'acting', 'performance', 'stage'],
	},
	{
		name: 'visual arts & design',
		category: 'secondary',
		parentTag: 'arts & culture',
		description: 'Visual arts, painting, drawing, and design',
		synonyms: ['visual arts', 'painting', 'drawing', 'art', 'design'],
	},
	{
		name: 'dance & choreography',
		category: 'secondary',
		parentTag: 'arts & culture',
		description: 'Dance, choreography, and movement arts',
		synonyms: ['dance', 'choreography', 'dancing', 'movement'],
	},
	{
		name: 'film & media production',
		category: 'secondary',
		parentTag: 'arts & culture',
		description: 'Film, video production, and media creation',
		synonyms: ['film', 'cinema', 'video', 'media production', 'filmmaking'],
	},
	{
		name: 'creative writing & literature',
		category: 'secondary',
		parentTag: 'arts & culture',
		description: 'Creative writing, poetry, and literature',
		synonyms: ['writing', 'poetry', 'literature', 'creative writing'],
	},
	{
		name: 'photography & imaging',
		category: 'secondary',
		parentTag: 'arts & culture',
		description: 'Photography, imaging, and visual documentation',
		synonyms: ['photography', 'photo', 'camera', 'imaging'],
	},

	// ==================== SECONDARY TAGS - SPORTS & RECREATION ====================
	{
		name: 'team sports',
		category: 'secondary',
		parentTag: 'sports & recreation',
		description: 'Basketball, soccer, volleyball, and team activities',
		synonyms: ['team sports', 'basketball', 'soccer', 'volleyball', 'football'],
	},
	{
		name: 'individual sports',
		category: 'secondary',
		parentTag: 'sports & recreation',
		description: 'Tennis, golf, swimming, and individual athletics',
		synonyms: ['individual sports', 'tennis', 'golf', 'swimming', 'track'],
	},
	{
		name: 'fitness & exercise',
		category: 'secondary',
		parentTag: 'sports & recreation',
		description: 'Gym, workout, fitness training, and exercise',
		synonyms: ['fitness', 'exercise', 'workout', 'gym', 'training'],
	},
	{
		name: 'outdoor activities',
		category: 'secondary',
		parentTag: 'sports & recreation',
		description: 'Hiking, camping, nature activities, and outdoor sports',
		synonyms: ['outdoor', 'hiking', 'camping', 'nature', 'adventure'],
	},
	{
		name: 'martial arts & combat sports',
		category: 'secondary',
		parentTag: 'sports & recreation',
		description: 'Martial arts, boxing, self-defense, and combat sports',
		synonyms: ['martial arts', 'karate', 'boxing', 'self-defense', 'combat'],
	},
	{
		name: 'intramural & club sports',
		category: 'secondary',
		parentTag: 'sports & recreation',
		description: 'Campus intramural and recreational club sports',
		synonyms: ['intramural', 'club sports', 'recreational sports', 'campus sports'],
	},

	// ==================== SECONDARY TAGS - TECHNOLOGY ====================
	{
		name: 'software development',
		category: 'secondary',
		parentTag: 'technology',
		description: 'Programming, coding, and software engineering',
		synonyms: ['programming', 'coding', 'software', 'development', 'engineering'],
	},
	{
		name: 'artificial intelligence',
		category: 'secondary',
		parentTag: 'technology',
		description: 'AI, machine learning, and data science',
		synonyms: ['ai', 'artificial intelligence', 'machine learning', 'data science'],
	},
	{
		name: 'cybersecurity',
		category: 'secondary',
		parentTag: 'technology',
		description: 'Information security and cyber defense',
		synonyms: ['cybersecurity', 'security', 'cyber defense', 'information security'],
	},
	{
		name: 'web & mobile development',
		category: 'secondary',
		parentTag: 'technology',
		description: 'Web development, mobile apps, and frontend/backend',
		synonyms: ['web development', 'mobile development', 'frontend', 'backend'],
	},
	{
		name: 'robotics & automation',
		category: 'secondary',
		parentTag: 'technology',
		description: 'Robotics, automation, and mechatronics',
		synonyms: ['robotics', 'automation', 'mechatronics', 'robots'],
	},
	{
		name: 'gaming & esports',
		category: 'secondary',
		parentTag: 'technology',
		description: 'Video games, esports, and competitive gaming',
		synonyms: ['gaming', 'video games', 'esports', 'competitive gaming'],
	},

	// ==================== SECONDARY TAGS - PROFESSIONAL DEVELOPMENT ====================
	{
		name: 'career preparation',
		category: 'secondary',
		parentTag: 'professional development',
		description: 'Resume building, interview skills, and job preparation',
		synonyms: ['career prep', 'resume building', 'interview skills', 'job prep'],
	},
	{
		name: 'internships & co-ops',
		category: 'secondary',
		parentTag: 'professional development',
		description: 'Work experience, internships, and cooperative education',
		synonyms: ['internships', 'co-op', 'work experience', 'job experience'],
	},
	{
		name: 'networking & connections',
		category: 'secondary',
		parentTag: 'professional development',
		description: 'Professional networking and relationship building',
		synonyms: ['networking', 'connections', 'professional networking'],
	},
	{
		name: 'entrepreneurship & startups',
		category: 'secondary',
		parentTag: 'professional development',
		description: 'Startups, business creation, and entrepreneurship',
		synonyms: ['entrepreneurship', 'startups', 'business creation', 'innovation'],
	},
	{
		name: 'public speaking & presentation',
		category: 'secondary',
		parentTag: 'professional development',
		description: 'Public speaking, presentation skills, and communication',
		synonyms: ['public speaking', 'presentation', 'communication', 'speaking'],
	},

	// ==================== SECONDARY TAGS - COMMUNITY SERVICE ====================
	{
		name: 'volunteer work',
		category: 'secondary',
		parentTag: 'community service',
		description: 'General volunteering and community assistance',
		synonyms: ['volunteering', 'volunteer work', 'community assistance'],
	},
	{
		name: 'charity & fundraising',
		category: 'secondary',
		parentTag: 'community service',
		description: 'Charitable work, fundraising, and donations',
		synonyms: ['charity', 'fundraising', 'donations', 'philanthropy'],
	},
	{
		name: 'social justice & advocacy',
		category: 'secondary',
		parentTag: 'community service',
		description: 'Social justice, advocacy, and equality work',
		synonyms: ['social justice', 'advocacy', 'activism', 'equality'],
	},
	{
		name: 'education & literacy support',
		category: 'secondary',
		parentTag: 'community service',
		description: 'Tutoring, education support, and literacy programs',
		synonyms: ['tutoring', 'education support', 'literacy', 'teaching'],
	},

	// ==================== SECONDARY TAGS - HEALTH & WELLNESS ====================
	{
		name: 'mental health & counseling',
		category: 'secondary',
		parentTag: 'health & wellness',
		description: 'Mental health awareness, counseling, and support',
		synonyms: ['mental health', 'counseling', 'therapy', 'psychological'],
	},
	{
		name: 'nutrition & healthy eating',
		category: 'secondary',
		parentTag: 'health & wellness',
		description: 'Nutrition, diet, and healthy eating habits',
		synonyms: ['nutrition', 'diet', 'healthy eating', 'food science'],
	},
	{
		name: 'stress management & mindfulness',
		category: 'secondary',
		parentTag: 'health & wellness',
		description: 'Stress relief, mindfulness, and relaxation techniques',
		synonyms: ['stress management', 'mindfulness', 'meditation', 'relaxation'],
	},

	// ==================== SECONDARY TAGS - RESEARCH ====================
	{
		name: 'undergraduate research',
		category: 'secondary',
		parentTag: 'research',
		description: 'Student research opportunities and programs',
		synonyms: ['undergraduate research', 'student research', 'research experience'],
	},
	{
		name: 'laboratory & experimental research',
		category: 'secondary',
		parentTag: 'research',
		description: 'Lab-based research and experimental work',
		synonyms: ['lab research', 'laboratory', 'experimental', 'experiments'],
	},
	{
		name: 'clinical & medical research',
		category: 'secondary',
		parentTag: 'research',
		description: 'Medical research, clinical trials, and health studies',
		synonyms: ['clinical research', 'medical research', 'health studies'],
	},
	{
		name: 'stem research & innovation',
		category: 'secondary',
		parentTag: 'research',
		description: 'Science, technology, engineering, and math research',
		synonyms: ['stem research', 'scientific research', 'innovation'],
	},

	// ==================== SECONDARY TAGS - LEADERSHIP ====================
	{
		name: 'student government',
		category: 'secondary',
		parentTag: 'leadership',
		description: 'Student government, SGA, and campus governance',
		synonyms: ['student government', 'sga', 'student senate', 'governance'],
	},
	{
		name: 'organization leadership',
		category: 'secondary',
		parentTag: 'leadership',
		description: 'Club and organization leadership roles',
		synonyms: ['organization leadership', 'club leadership', 'officer roles'],
	},
	{
		name: 'event planning & coordination',
		category: 'secondary',
		parentTag: 'leadership',
		description: 'Event organization, planning, and coordination',
		synonyms: ['event planning', 'event coordination', 'event management'],
	},

	// ==================== SECONDARY TAGS - ENVIRONMENTAL ====================
	{
		name: 'sustainability & green living',
		category: 'secondary',
		parentTag: 'environmental',
		description: 'Sustainable practices and green living initiatives',
		synonyms: ['sustainability', 'green living', 'eco-friendly', 'sustainable'],
	},
	{
		name: 'conservation & wildlife protection',
		category: 'secondary',
		parentTag: 'environmental',
		description: 'Wildlife conservation and environmental protection',
		synonyms: ['conservation', 'wildlife protection', 'environmental protection'],
	},
	{
		name: 'climate action & awareness',
		category: 'secondary',
		parentTag: 'environmental',
		description: 'Climate change awareness and action initiatives',
		synonyms: ['climate action', 'climate change', 'global warming'],
	},

	// ==================== SECONDARY TAGS - RELIGIOUS & SPIRITUAL ====================
	{
		name: 'christian & catholic',
		category: 'secondary',
		parentTag: 'religious & spiritual',
		description: 'Christian, Catholic, and Protestant faith activities',
		synonyms: ['christian', 'catholic', 'protestant', 'baptist', 'methodist'],
	},
	{
		name: 'interfaith & ecumenical',
		category: 'secondary',
		parentTag: 'religious & spiritual',
		description: 'Multi-faith and ecumenical activities',
		synonyms: ['interfaith', 'multi-faith', 'ecumenical'],
	},
	{
		name: 'meditation & spiritual wellness',
		category: 'secondary',
		parentTag: 'religious & spiritual',
		description: 'Meditation, spiritual wellness, and contemplative practices',
		synonyms: ['meditation', 'spiritual wellness', 'contemplative'],
	},

	// ==================== SECONDARY TAGS - SPECIAL INTERESTS ====================
	{
		name: 'anime & manga',
		category: 'secondary',
		parentTag: 'special interests',
		description: 'Japanese animation, manga, and otaku culture',
		synonyms: ['anime', 'manga', 'japanese culture', 'otaku', 'cosplay'],
	},
	{
		name: 'board games & tabletop',
		category: 'secondary',
		parentTag: 'special interests',
		description: 'Board games, tabletop games, and strategy games',
		synonyms: ['board games', 'tabletop games', 'strategy games'],
	},
	{
		name: 'debate & forensics',
		category: 'secondary',
		parentTag: 'special interests',
		description: 'Debate, forensics, and argumentation',
		synonyms: ['debate', 'forensics', 'argumentation', 'speech'],
	},
	{
		name: 'cooking & culinary arts',
		category: 'secondary',
		parentTag: 'special interests',
		description: 'Cooking, culinary arts, and food preparation',
		synonyms: ['cooking', 'culinary arts', 'food preparation', 'chef'],
	},
	{
		name: 'gaming & esports',
		category: 'secondary',
		parentTag: 'special interests',
		description: 'Video games, esports, and competitive gaming',
		synonyms: ['gaming', 'video games', 'esports', 'competitive gaming'],
	},
];

// ===== COMPREHENSIVE INTERESTS (Updated for hierarchical system) =====
export const COMPREHENSIVE_INTERESTS: InterestDefinition[] = [
	// Technology & Programming
	{
		keyword: 'programming',
		category: 'technology',
		synonyms: ['coding', 'software development', 'development', 'software engineering'],
		relatedTags: ['technology', 'software development', 'computer science'],
	},
	{
		keyword: 'artificial intelligence',
		category: 'technology',
		synonyms: ['ai', 'machine learning', 'ml', 'deep learning', 'neural networks'],
		relatedTags: ['technology', 'artificial intelligence', 'computer science'],
	},
	{
		keyword: 'web development',
		category: 'technology',
		synonyms: ['web dev', 'frontend', 'backend', 'fullstack', 'javascript', 'react'],
		relatedTags: ['technology', 'web & mobile development', 'software development'],
	},
	{
		keyword: 'cybersecurity',
		category: 'technology',
		synonyms: ['security', 'ethical hacking', 'penetration testing', 'cyber defense'],
		relatedTags: ['technology', 'cybersecurity'],
	},

	// Business & Entrepreneurship
	{
		keyword: 'entrepreneurship',
		category: 'business',
		synonyms: ['startups', 'business creation', 'innovation', 'venture'],
		relatedTags: ['professional development', 'entrepreneurship & startups', 'business studies'],
	},
	{
		keyword: 'business strategy',
		category: 'business',
		synonyms: ['strategy', 'planning', 'consulting', 'management'],
		relatedTags: ['business studies', 'professional development', 'leadership'],
	},

	// Health & Fitness
	{
		keyword: 'fitness',
		category: 'health',
		synonyms: ['exercise', 'workout', 'gym', 'strength training', 'cardio'],
		relatedTags: ['health & wellness', 'sports & recreation', 'fitness & exercise'],
	},
	{
		keyword: 'mental health',
		category: 'health',
		synonyms: ['psychology', 'therapy', 'counseling', 'mindfulness', 'meditation'],
		relatedTags: ['health & wellness', 'mental health & counseling'],
	},

	// Arts & Creativity
	{
		keyword: 'music',
		category: 'arts',
		synonyms: ['musical', 'concert', 'band', 'singing', 'instruments'],
		relatedTags: ['arts & culture', 'music & performance'],
	},
	{
		keyword: 'photography',
		category: 'arts',
		synonyms: ['photo', 'camera', 'imaging', 'digital photography'],
		relatedTags: ['arts & culture', 'photography & imaging', 'visual arts & design'],
	},
	{
		keyword: 'writing',
		category: 'arts',
		synonyms: ['creative writing', 'poetry', 'journalism', 'blogging'],
		relatedTags: ['arts & culture', 'creative writing & literature'],
	},

	// Sports & Recreation
	{
		keyword: 'basketball',
		category: 'sports',
		synonyms: ['hoops', 'court sports'],
		relatedTags: ['sports & recreation', 'team sports'],
	},
	{
		keyword: 'hiking',
		category: 'recreation',
		synonyms: ['trekking', 'outdoor adventure', 'nature walks'],
		relatedTags: ['sports & recreation', 'outdoor activities'],
	},

	// Service & Social Impact
	{
		keyword: 'volunteering',
		category: 'service',
		synonyms: ['community service', 'charity', 'helping', 'social impact'],
		relatedTags: ['community service', 'volunteer work'],
	},
	{
		keyword: 'social justice',
		category: 'activism',
		synonyms: ['activism', 'advocacy', 'equality', 'civil rights'],
		relatedTags: ['community service', 'social justice & advocacy'],
	},

	// Academic & Research
	{
		keyword: 'research',
		category: 'academic',
		synonyms: ['undergraduate research', 'lab work', 'scientific research'],
		relatedTags: ['research', 'undergraduate research'],
	},
	{
		keyword: 'engineering',
		category: 'academic',
		synonyms: ['technical', 'stem', 'problem solving', 'design'],
		relatedTags: ['academic', 'engineering'],
	},

	// Leadership & Development
	{
		keyword: 'leadership',
		category: 'development',
		synonyms: ['management', 'team lead', 'organization', 'mentoring'],
		relatedTags: ['leadership', 'organization leadership'],
	},
	{
		keyword: 'public speaking',
		category: 'development',
		synonyms: ['presentation', 'communication', 'speaking'],
		relatedTags: ['professional development', 'public speaking & presentation'],
	},

	// Social & Community
	{
		keyword: 'networking',
		category: 'social',
		synonyms: ['professional networking', 'connections', 'relationship building'],
		relatedTags: ['social', 'networking & connections', 'alumni & networking'],
	},
	{
		keyword: 'gaming',
		category: 'social',
		synonyms: ['video games', 'esports', 'gaming community', 'competitive gaming'],
		relatedTags: ['special interests', 'gaming & esports', 'technology'],
	},

	// Special Interests
	{
		keyword: 'anime',
		category: 'entertainment',
		synonyms: ['manga', 'japanese culture', 'otaku', 'cosplay'],
		relatedTags: ['special interests', 'anime & manga', 'cultural & diversity'],
	},
	{
		keyword: 'cooking',
		category: 'lifestyle',
		synonyms: ['culinary arts', 'baking', 'food preparation', 'chef'],
		relatedTags: ['special interests', 'cooking & culinary arts'],
	},
	{
		keyword: 'debate',
		category: 'academic',
		synonyms: ['forensics', 'argumentation', 'public speaking', 'critical thinking'],
		relatedTags: ['special interests', 'debate & forensics', 'academic'],
	},
];

// Helper functions remain the same
export const getAllTagNames = (): string[] => {
	return COMPREHENSIVE_TAGS.map(tag => tag.name);
};

export const getAllInterestKeywords = (): string[] => {
	return COMPREHENSIVE_INTERESTS.map(interest => interest.keyword);
};

export const getPrimaryTags = (): TagDefinition[] => {
	return COMPREHENSIVE_TAGS.filter(tag => tag.category === 'primary');
};

export const getSecondaryTags = (): TagDefinition[] => {
	return COMPREHENSIVE_TAGS.filter(tag => tag.category === 'secondary');
};

export const getSecondaryTagsByParent = (parentTagName: string): TagDefinition[] => {
	return COMPREHENSIVE_TAGS.filter(tag => tag.category === 'secondary' && tag.parentTag === parentTagName);
};

export const findTagsBySynonym = (synonym: string): TagDefinition[] => {
	return COMPREHENSIVE_TAGS.filter(tag =>
		tag.synonyms?.some(s => s.toLowerCase().includes(synonym.toLowerCase())) ||
		tag.name.toLowerCase().includes(synonym.toLowerCase()),
	);
};

export const findInterestsBySynonym = (synonym: string): InterestDefinition[] => {
	return COMPREHENSIVE_INTERESTS.filter(interest =>
		interest.synonyms.some(s => s.toLowerCase().includes(synonym.toLowerCase())) ||
		interest.keyword.toLowerCase().includes(synonym.toLowerCase()),
	);
};

export default { COMPREHENSIVE_TAGS, COMPREHENSIVE_INTERESTS };