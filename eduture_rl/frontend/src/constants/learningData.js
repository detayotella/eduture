export const styleMeta = {
    activist: { label: 'Activist', color: 'var(--style-activist)' },
    reflector: { label: 'Reflector', color: 'var(--style-reflector)' },
    theorist: { label: 'Theorist', color: 'var(--style-theorist)' },
    pragmatist: { label: 'Pragmatist', color: 'var(--style-pragmatist)' },
};

export const styleOrder = ['activist', 'reflector', 'theorist', 'pragmatist'];

const styleStatements = {
    activist: [
        'I prefer to jump into a task and refine it while I work.',
        'I get energy from trying something new straight away.',
        'I learn fastest when the situation feels practical.',
        'I enjoy exploring ideas that have immediate use.',
        'I often want to test a concept before discussing it for long.',
    ],
    reflector: [
        'I like to think through an idea before acting on it.',
        'I learn best when I can observe patterns carefully.',
        'I prefer to review information from several angles.',
        'I benefit from time to quietly compare alternatives.',
        'I often pause before deciding how to respond.',
    ],
    theorist: [
        'I like content that explains the logic behind a concept.',
        'I want learning to be structured and well organized.',
        'I prefer models, frameworks, and clear relationships.',
        'I enjoy understanding why something works.',
        'I feel comfortable when information follows a system.',
    ],
    pragmatist: [
        'I want learning that quickly translates into action.',
        'I like examples that solve real-world problems.',
        'I prefer practical tips over abstract discussion.',
        'I am motivated by tasks that show immediate results.',
        'I enjoy checking whether an idea works in practice.',
    ],
};

let questionCounter = 1;
export const questionnaireQuestions = styleOrder.flatMap((style) =>
    Array.from({ length: 20 }, (_, index) => {
        const prompt = styleStatements[style][index % styleStatements[style].length];
        const question = {
            id: `q${questionCounter}`,
            style,
            section: styleMeta[style].label,
            text: `${prompt}`,
        };
        questionCounter += 1;
        return question;
    }),
);

export const assessmentQuestions = [
    {
        id: 'q1',
        question: 'Which component processes instructions?',
        options: ['Monitor', 'CPU', 'Keyboard', 'Mouse'],
        answer: 1,
    },
    {
        id: 'q2',
        question: 'Which is an input device?',
        options: ['Printer', 'Monitor', 'Keyboard', 'Speaker'],
        answer: 2,
    },
    {
        id: 'q3',
        question: 'What does RAM mainly store?',
        options: ['Temporary working data', 'Permanent backups', 'Web links', 'Passwords only'],
        answer: 0,
    },
    {
        id: 'q4',
        question: 'Which file type is usually a document?',
        options: ['.docx', '.mp3', '.exe', '.zip'],
        answer: 0,
    },
    {
        id: 'q5',
        question: 'Which action helps protect files?',
        options: ['Ignore updates', 'Use weak passwords', 'Create backups', 'Share credentials'],
        answer: 2,
    },
    {
        id: 'q6',
        question: 'What is the main role of an operating system?',
        options: ['Play music', 'Manage hardware and software', 'Edit photos only', 'Replace the screen'],
        answer: 1,
    },
    {
        id: 'q7',
        question: 'Which device displays output?',
        options: ['Scanner', 'Monitor', 'Microphone', 'Keyboard'],
        answer: 1,
    },
    {
        id: 'q8',
        question: 'What does a browser do?',
        options: ['Runs the CPU', 'Connects to the internet and shows web pages', 'Prints documents', 'Stores RAM'],
        answer: 1,
    },
    {
        id: 'q9',
        question: 'Which is a strong password pattern?',
        options: ['12345678', 'password', 'SecurePass123!', 'abcabcabc'],
        answer: 2,
    },
    {
        id: 'q10',
        question: 'What does saving a file do?',
        options: ['Deletes it', 'Stores it for later use', 'Prints it', 'Renames it automatically'],
        answer: 1,
    },
    {
        id: 'q11',
        question: 'Which action is best for learning by doing?',
        options: ['Read only', 'Practice with a task', 'Avoid examples', 'Skip review'],
        answer: 1,
    },
    {
        id: 'q12',
        question: 'Which item is a storage device?',
        options: ['SSD', 'Monitor', 'Mouse', 'Headset'],
        answer: 0,
    },
    {
        id: 'q13',
        question: 'What does word processing software help you do?',
        options: ['Edit documents', 'Cool the computer', 'Move files faster', 'Increase Wi-Fi speed'],
        answer: 0,
    },
    {
        id: 'q14',
        question: 'Which file type is usually a presentation?',
        options: ['.pptx', '.png', '.csv', '.txt'],
        answer: 0,
    },
    {
        id: 'q15',
        question: 'Which behavior is safest when browsing?',
        options: ['Click every popup', 'Check the site address', 'Share your password', 'Disable updates'],
        answer: 1,
    },
    {
        id: 'q16',
        question: 'What is a spreadsheet used for?',
        options: ['Writing code only', 'Organizing numbers and calculations', 'Playing videos', 'Changing the screen brightness'],
        answer: 1,
    },
    {
        id: 'q17',
        question: 'Which device captures sound?',
        options: ['Microphone', 'Monitor', 'Printer', 'Router'],
        answer: 0,
    },
    {
        id: 'q18',
        question: 'Which habit helps you recover after a mistake?',
        options: ['Ignore backups', 'Keep a backup copy', 'Delete the file', 'Share the file publicly'],
        answer: 1,
    },
];

export const modules = [
    { module_id: 'icdl-essentials', title: 'ICDL Computer Essentials', description: 'Hardware, software, and the foundations of confident computer use.', topic_id: 'computer-basics' },
    { module_id: 'icdl-productivity', title: 'ICDL Productivity', description: 'Document workflows, productivity habits, and guided practice tasks.', topic_id: 'documents' },
];

export const learnerStats = [
    { label: 'Completion', value: '72%', note: 'Across active modules' },
    { label: 'Improvement', value: '+18', note: 'Average score gain' },
    { label: 'Streak', value: '14d', note: 'Continuous learning days' },
    { label: 'Satisfaction', value: '4.7/5', note: 'Learner feedback' },
];

export const progressActivity = [
    'Completed the learning-style questionnaire',
    'Opened the Computer Essentials module',
    'Finished the pre-test assessment',
    'Recorded a high-engagement session',
];

export const learningContent = {
    'computer-basics': {
        title: 'What is a Computer?',
        badge: 'Theory',
        body: 'A computer is an electronic device that processes information through hardware and software working in coordination. It stores, retrieves, and transforms data to help people solve problems, create content, and communicate efficiently.',
        callout: 'A computer is not just a device you use. It is a system that constantly translates human intent into machine operations.',
        estimated: '12 min',
    },
    documents: {
        title: 'Working with Documents',
        badge: 'Theory',
        body: 'Document workflows bring structure to everyday productivity tasks. Good organization, consistent naming, and regular backups help learners move confidently between creation, review, and sharing.',
        callout: 'Clarity improves speed. A clean document process reduces the need to rethink simple steps.',
        estimated: '10 min',
    },
};

export function getCurrentLearnerId(user) {
    return user?.learner_id || 0;
}
