export const styleMeta = {
    activist: { label: 'Activist', color: 'var(--style-activist)' },
    reflector: { label: 'Reflector', color: 'var(--style-reflector)' },
    theorist: { label: 'Theorist', color: 'var(--style-theorist)' },
    pragmatist: { label: 'Pragmatist', color: 'var(--style-pragmatist)' },
};

export const styleOrder = ['activist', 'reflector', 'theorist', 'pragmatist'];

const questionnaireTextByNumber = {
    1: 'I have strong beliefs about what is right and wrong, good and bad.',
    2: 'I often act without considering the possible consequences.',
    3: 'I tend to solve problems using a step-by-step approach.',
    4: 'I believe that formal procedures and policies restrict people.',
    5: 'I have a reputation for saying what I think, simply and directly.',
    6: 'I often find that actions based on feelings are as sound as those based on careful thought and analysis.',
    7: 'I like the sort of work where I have time for thorough preparation and implementation.',
    8: 'I regularly question people about their basic assumptions.',
    9: 'What matters most is whether something works in practice.',
    10: 'I actively seek out new experiences.',
    11: 'When I hear about a new idea or approach I immediately start working out how to apply it in practice.',
    12: 'I am keen on self-discipline such as watching my diet, taking regular exercise, sticking to a fixed routine etc.',
    13: 'I take pride in doing a thorough job.',
    14: 'I get on best with logical, analytical people and less well with spontaneous, "irrational" people.',
    15: 'I take care over the interpretation of data available to me and avoid jumping to conclusions.',
    16: 'I like to reach a decision carefully after weighing up many alternatives.',
    17: "I'm attracted more to novel, unusual ideas than to practical ones.",
    18: "I don't like disorganised things and prefer to fit things into a coherent pattern.",
    19: 'I accept and stick to laid down procedures and policies so long as I regard them as an efficient way of getting the job done.',
    20: 'I like to relate my actions to a general principle.',
    21: 'In discussions I like to get straight to the point.',
    22: 'I tend to have distant, rather formal relationships with people at work.',
    23: 'I thrive on the challenge of tackling something new and different.',
    24: 'I enjoy fun-loving, spontaneous people.',
    25: 'I pay meticulous attention to detail before coming to a conclusion.',
    26: 'I find it difficult to produce ideas on impulse.',
    27: 'I believe in coming to the point immediately.',
    28: 'I am careful not to jump to conclusions too quickly.',
    29: 'I prefer to have as many sources of information as possible -the more data to mull over the better.',
    30: "Flippant people who don't take things seriously enough usually irritate me.",
    31: "I listen to other people's point of view before putting my own forward.",
    32: "I tend to be open about how I'm feeling.",
    33: 'In discussions I enjoy watching the manoeuvrings of the other participants.',
    34: 'I prefer to respond to events on a spontaneous, flexible basis rather than plan things out in advance.',
    35: 'I tend to be attracted to techniques such as network analysis, flow charts, branching programmes, contingency planning, etc.',
    36: 'It worries me if I have to rush out a piece of work to meet a tight deadline.',
    37: "I tend to judge people's ideas on their practical merits.",
    38: 'Quiet, thoughtful people tend to make me feel uneasy.',
    39: 'I often get irritated by people who want to rush things.',
    40: 'It is more important to enjoy the present moment than to think about the past or future.',
    41: 'I think that decisions based on a thorough analysis of all the information are sounder than those based on intuition.',
    42: 'I tend to be a perfectionist.',
    43: 'In discussions I usually produce lots of spontaneous ideas.',
    44: 'In meetings I put forward practical realistic ideas.',
    45: 'More often than not, rules are there to be broken.',
    46: 'I prefer to stand back from a situation and consider all the perspectives.',
    47: "I can often see inconsistencies and weaknesses in other people's arguments.",
    48: 'On balance I talk more than I listen.',
    49: 'I can often see better, more practical ways to get things done.',
    50: 'I think written reports should be short and to the point.',
    51: 'I believe that rational, logical thinking should win the day.',
    52: 'I tend to discuss specific things with people rather than engaging in social discussion.',
    53: 'I like people who approach things realistically rather than theoretically.',
    54: 'In discussions I get impatient with irrelevancies and digressions.',
    55: 'If I have a report to write I tend to produce lots of drafts before settling on the final version.',
    56: 'I am keen to try things out to see if they work in practice.',
    57: 'I am keen to reach answers via a logical approach.',
    58: 'I enjoy being the one that talks a lot.',
    59: 'In discussions I often find I am the realist, keeping people to the point and avoiding wild speculations.',
    60: 'I like to ponder many alternatives before making up my mind.',
    61: 'In discussions with people I often find I am the most dispassionate and objective.',
    62: 'In discussions I\'m more likely to adopt a "low profile" than to take the lead and do most of the talking.',
    63: 'I like to be able to relate current actions to a longer-term bigger picture.',
    64: 'When things go wrong I am happy to shrug it off and "put it down to experience".',
    65: 'I tend to reject wild, spontaneous ideas as being impractical.',
    66: 'It\'s best to think carefully before taking action.',
    67: 'On balance I do the listening rather than the talking.',
    68: 'I tend to be tough on people who find it difficult to adopt a logical approach.',
    69: 'Most times I believe the end justifies the means.',
    70: "I don't mind hurting people's feelings so long as the job gets done.",
    71: 'I find the formality of having specific objectives and plans stifling.',
    72: "I'm usually one of the people who puts life into a party.",
    73: 'I do whatever is expedient to get the job done.',
    74: 'I quickly get bored with methodical, detailed work.',
    75: 'I am keen on exploring the basic assumptions, principles and theories underpinning things and events.',
    76: "I'm always interested to find out what people think.",
    77: 'I like meetings to be run on methodical lines, sticking to laid down agenda, etc.',
    78: 'I steer clear of subjective or ambiguous topics.',
    79: 'I enjoy the drama and excitement of a crisis situation.',
    80: 'People often find me insensitive to their feelings.',
};

const questionnaireStyleByNumber = {
    1: 'theorist', 2: 'activist', 3: 'theorist', 4: 'activist', 5: 'pragmatist', 6: 'pragmatist', 7: 'reflector', 8: 'theorist', 9: 'pragmatist', 10: 'activist',
    11: 'pragmatist', 12: 'theorist', 13: 'reflector', 14: 'theorist', 15: 'reflector', 16: 'reflector', 17: 'activist', 18: 'theorist', 19: 'pragmatist', 20: 'theorist',
    21: 'pragmatist', 22: 'theorist', 23: 'activist', 24: 'activist', 25: 'reflector', 26: 'theorist', 27: 'pragmatist', 28: 'reflector', 29: 'reflector', 30: 'theorist',
    31: 'reflector', 32: 'activist', 33: 'reflector', 34: 'activist', 35: 'theorist', 36: 'reflector', 37: 'pragmatist', 38: 'activist', 39: 'reflector', 40: 'activist',
    41: 'reflector', 42: 'theorist', 43: 'activist', 44: 'pragmatist', 45: 'activist', 46: 'reflector', 47: 'theorist', 48: 'activist', 49: 'pragmatist', 50: 'pragmatist',
    51: 'theorist', 52: 'reflector', 53: 'pragmatist', 54: 'pragmatist', 55: 'reflector', 56: 'pragmatist', 57: 'theorist', 58: 'activist', 59: 'pragmatist', 60: 'reflector',
    61: 'theorist', 62: 'reflector', 63: 'theorist', 64: 'activist', 65: 'pragmatist', 66: 'reflector', 67: 'reflector', 68: 'theorist', 69: 'pragmatist', 70: 'pragmatist',
    71: 'activist', 72: 'activist', 73: 'pragmatist', 74: 'activist', 75: 'theorist', 76: 'reflector', 77: 'pragmatist', 78: 'theorist', 79: 'activist', 80: 'activist',
};

export const questionnaireQuestions = Array.from({ length: 80 }, (_, index) => {
    const number = index + 1;
    const style = questionnaireStyleByNumber[number];
    return {
        id: `q${number}`,
        style,
        section: styleMeta[style].label,
        text: questionnaireTextByNumber[number],
    };
});

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
