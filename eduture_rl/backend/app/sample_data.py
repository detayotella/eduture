from __future__ import annotations

from collections import defaultdict

from .models import ContentFragment

_QUESTION_TEXTS = {
    1: "I have strong beliefs about what is right and wrong, good and bad.",
    2: "I often act without considering the possible consequences.",
    3: "I tend to solve problems using a step-by-step approach.",
    4: "I believe that formal procedures and policies restrict people.",
    5: "I have a reputation for saying what I think, simply and directly.",
    6: "I often find that actions based on feelings are as sound as those based on careful thought and analysis.",
    7: "I like the sort of work where I have time for thorough preparation and implementation.",
    8: "I regularly question people about their basic assumptions.",
    9: "What matters most is whether something works in practice.",
    10: "I actively seek out new experiences.",
    11: "When I hear about a new idea or approach I immediately start working out how to apply it in practice.",
    12: "I am keen on self-discipline such as watching my diet, taking regular exercise, sticking to a fixed routine etc.",
    13: "I take pride in doing a thorough job.",
    14: "I get on best with logical, analytical people and less well with spontaneous, \"irrational\" people.",
    15: "I take care over the interpretation of data available to me and avoid jumping to conclusions.",
    16: "I like to reach a decision carefully after weighing up many alternatives.",
    17: "I'm attracted more to novel, unusual ideas than to practical ones.",
    18: "I don't like disorganised things and prefer to fit things into a coherent pattern.",
    19: "I accept and stick to laid down procedures and policies so long as I regard them as an efficient way of getting the job done.",
    20: "I like to relate my actions to a general principle.",
    21: "In discussions I like to get straight to the point.",
    22: "I tend to have distant, rather formal relationships with people at work.",
    23: "I thrive on the challenge of tackling something new and different.",
    24: "I enjoy fun-loving, spontaneous people.",
    25: "I pay meticulous attention to detail before coming to a conclusion.",
    26: "I find it difficult to produce ideas on impulse.",
    27: "I believe in coming to the point immediately.",
    28: "I am careful not to jump to conclusions too quickly.",
    29: "I prefer to have as many sources of information as possible -the more data to mull over the better.",
    30: "Flippant people who don't take things seriously enough usually irritate me.",
    31: "I listen to other people's point of view before putting my own forward.",
    32: "I tend to be open about how I'm feeling.",
    33: "In discussions I enjoy watching the manoeuvrings of the other participants.",
    34: "I prefer to respond to events on a spontaneous, flexible basis rather than plan things out in advance.",
    35: "I tend to be attracted to techniques such as network analysis, flow charts, branching programmes, contingency planning, etc.",
    36: "It worries me if I have to rush out a piece of work to meet a tight deadline.",
    37: "I tend to judge people's ideas on their practical merits.",
    38: "Quiet, thoughtful people tend to make me feel uneasy.",
    39: "I often get irritated by people who want to rush things.",
    40: "It is more important to enjoy the present moment than to think about the past or future.",
    41: "I think that decisions based on a thorough analysis of all the information are sounder than those based on intuition.",
    42: "I tend to be a perfectionist.",
    43: "In discussions I usually produce lots of spontaneous ideas.",
    44: "In meetings I put forward practical realistic ideas.",
    45: "More often than not, rules are there to be broken.",
    46: "I prefer to stand back from a situation and consider all the perspectives.",
    47: "I can often see inconsistencies and weaknesses in other people's arguments.",
    48: "On balance I talk more than I listen.",
    49: "I can often see better, more practical ways to get things done.",
    50: "I think written reports should be short and to the point.",
    51: "I believe that rational, logical thinking should win the day.",
    52: "I tend to discuss specific things with people rather than engaging in social discussion.",
    53: "I like people who approach things realistically rather than theoretically.",
    54: "In discussions I get impatient with irrelevancies and digressions.",
    55: "If I have a report to write I tend to produce lots of drafts before settling on the final version.",
    56: "I am keen to try things out to see if they work in practice.",
    57: "I am keen to reach answers via a logical approach.",
    58: "I enjoy being the one that talks a lot.",
    59: "In discussions I often find I am the realist, keeping people to the point and avoiding wild speculations.",
    60: "I like to ponder many alternatives before making up my mind.",
    61: "In discussions with people I often find I am the most dispassionate and objective.",
    62: "In discussions I'm more likely to adopt a \"low profile\" than to take the lead and do most of the talking.",
    63: "I like to be able to relate current actions to a longer-term bigger picture.",
    64: "When things go wrong I am happy to shrug it off and \"put it down to experience\".",
    65: "I tend to reject wild, spontaneous ideas as being impractical.",
    66: "It's best to think carefully before taking action.",
    67: "On balance I do the listening rather than the talking.",
    68: "I tend to be tough on people who find it difficult to adopt a logical approach.",
    69: "Most times I believe the end justifies the means.",
    70: "I don't mind hurting people's feelings so long as the job gets done.",
    71: "I find the formality of having specific objectives and plans stifling.",
    72: "I'm usually one of the people who puts life into a party.",
    73: "I do whatever is expedient to get the job done.",
    74: "I quickly get bored with methodical, detailed work.",
    75: "I am keen on exploring the basic assumptions, principles and theories underpinning things and events.",
    76: "I'm always interested to find out what people think.",
    77: "I like meetings to be run on methodical lines, sticking to laid down agenda, etc.",
    78: "I steer clear of subjective or ambiguous topics.",
    79: "I enjoy the drama and excitement of a crisis situation.",
    80: "People often find me insensitive to their feelings.",
}

_STYLE_BY_QUESTION = {
    1: "theorist", 2: "activist", 3: "theorist", 4: "activist", 5: "pragmatist", 6: "pragmatist", 7: "reflector", 8: "theorist", 9: "pragmatist", 10: "activist",
    11: "pragmatist", 12: "theorist", 13: "reflector", 14: "theorist", 15: "reflector", 16: "reflector", 17: "activist", 18: "theorist", 19: "pragmatist", 20: "theorist",
    21: "pragmatist", 22: "theorist", 23: "activist", 24: "activist", 25: "reflector", 26: "theorist", 27: "pragmatist", 28: "reflector", 29: "reflector", 30: "theorist",
    31: "reflector", 32: "activist", 33: "reflector", 34: "activist", 35: "theorist", 36: "reflector", 37: "pragmatist", 38: "activist", 39: "reflector", 40: "activist",
    41: "reflector", 42: "theorist", 43: "activist", 44: "pragmatist", 45: "activist", 46: "reflector", 47: "theorist", 48: "activist", 49: "pragmatist", 50: "pragmatist",
    51: "theorist", 52: "reflector", 53: "pragmatist", 54: "pragmatist", 55: "reflector", 56: "pragmatist", 57: "theorist", 58: "activist", 59: "pragmatist", 60: "reflector",
    61: "theorist", 62: "reflector", 63: "theorist", 64: "activist", 65: "pragmatist", 66: "reflector", 67: "reflector", 68: "theorist", 69: "pragmatist", 70: "pragmatist",
    71: "activist", 72: "activist", 73: "pragmatist", 74: "activist", 75: "theorist", 76: "reflector", 77: "pragmatist", 78: "theorist", 79: "activist", 80: "activist",
}

QUESTIONNAIRE_QUESTIONS = [
    {
        "question_id": f"q{question_number}",
        "text": _QUESTION_TEXTS[question_number],
        "style": _STYLE_BY_QUESTION[question_number],
    }
    for question_number in range(1, 81)
]

CONTENT_SEED = [
    # ========== MODULE 1: COMPUTER ESSENTIALS - TOPIC 1: INTRODUCTION TO COMPUTERS ==========
    
    # THEORY
    {
        "module_id": "icdl-computer-essentials",
        "topic_id": "intro-computers",
        "content_type": "theory",
        "sequence_order": 1,
        "title": "What is a Computer?",
        "content_data": """LEARNING OBJECTIVES:
At the end of this lesson, learners should be able to:
- Define a computer
- Identify major computer components
- Explain basic computer functions
- Describe common uses of computers

CONTENT:
A computer is an electronic device that accepts data, processes it according to instructions, stores it, and produces meaningful information.

Computers are widely used in modern society because they help individuals and organizations complete tasks more efficiently and accurately.

Computers are commonly used in:
- Schools
- Hospitals
- Offices
- Banks
- Businesses
- Homes

A computer system consists of several important components that work together.

MAJOR COMPONENTS OF A COMPUTER:

1. Monitor
The monitor displays visual output from the computer. It allows users to see text, images, videos, and software applications.

2. Keyboard
The keyboard is an input device used for typing text, numbers, and commands into the computer.

3. Mouse
The mouse is a pointing device used for selecting items, opening applications, and interacting with graphical interfaces.

4. System Unit
The system unit contains the main processing hardware of the computer including:
- Processor (CPU)
- Memory (RAM)
- Storage devices
- Motherboard
The CPU is often referred to as the "brain" of the computer because it performs calculations and executes instructions.

FUNCTIONS OF A COMPUTER:
A computer performs four major functions:
1. Input - The computer receives data using input devices
2. Processing - The CPU processes the received data
3. Storage - Data and information can be saved for future use
4. Output - The computer displays or produces results for the user

SUMMARY:
Computers are essential tools used in everyday life. Understanding the major parts and functions of a computer provides the foundation for digital literacy.""",
        "difficulty": 0.2,
        "estimated_time_minutes": 10,
    },
    
    # EXAMPLE
    {
        "module_id": "icdl-computer-essentials",
        "topic_id": "intro-computers",
        "content_type": "example",
        "sequence_order": 2,
        "title": "Desktop vs Laptop Computers",
        "content_data": """Computers come in different forms depending on how they are used. Two common types of computers are:
- Desktop computers
- Laptop computers

DESKTOP COMPUTER:
A desktop computer is designed to remain in one location. It usually consists of separate components including:
- Monitor
- Keyboard
- Mouse
- System unit

Desktop computers are commonly used in:
- Offices
- Schools
- Computer laboratories

Advantages of Desktop Computers:
- Larger screen size
- Easier hardware upgrades
- More powerful performance
- Better cooling systems

Example Scenario:
A university computer laboratory uses desktop computers because students use the systems for programming, research, and practical exercises.

LAPTOP COMPUTER:
A laptop computer is portable and combines:
- Monitor
- Keyboard
- Battery
- Touchpad
- Processing components
into one device.

Laptop computers are designed for mobility and convenience.

Advantages of Laptop Computers:
- Portable
- Battery powered
- Compact design
- Convenient for travel

Example Scenario:
A student uses a laptop computer to attend online classes, complete assignments, and browse the internet while traveling.

COMPARISON SUMMARY:
Feature          | Desktop        | Laptop
Portability      | Low            | High
Upgradeability   | Easy           | Limited
Battery          | No             | Yes
Space Usage      | More space     | Compact""",
        "difficulty": 0.2,
        "estimated_time_minutes": 8,
    },
    
    # ACTIVITY
    {
        "module_id": "icdl-computer-essentials",
        "topic_id": "intro-computers",
        "content_type": "activity",
        "sequence_order": 3,
        "title": "Identify Computer Components",
        "content_data": """ACTIVITY INSTRUCTIONS:
In this activity, learners will identify major computer hardware components.

TASK 1 — OBSERVATION:
Look at a nearby computer system and identify the following:
1. Monitor
2. Keyboard
3. Mouse
4. System Unit
5. Speakers (if available)

TASK 2 — CLASSIFICATION:
For each component:
- Write its name
- State whether it is input or output hardware
- Explain its function

TASK 3 — REFLECTION:
Answer the following questions:
1. Which component do you use the most?
2. Why is the CPU called the brain of the computer?
3. What would happen if the monitor stopped working?

EXPECTED LEARNING OUTCOME:
After this activity, learners should be able to recognize basic computer hardware and explain their functions.""",
        "difficulty": 0.3,
        "estimated_time_minutes": 15,
    },
    
    # EXERCISE
    {
        "module_id": "icdl-computer-essentials",
        "topic_id": "intro-computers",
        "content_type": "exercise",
        "sequence_order": 4,
        "title": "Computer Basics Assessment",
        "content_data": """INSTRUCTIONS: Choose the correct answer for each question.

QUESTION 1:
Which device is mainly used for typing information into the computer?
A. Monitor
B. Keyboard
C. Speaker
D. Printer
CORRECT ANSWER: B
EXPLANATION: The keyboard is used to enter text and commands into the computer.

QUESTION 2:
Which computer type is designed for portability?
A. Desktop
B. Mainframe
C. Laptop
D. Server
CORRECT ANSWER: C
EXPLANATION: Laptops are portable computers designed for mobility.

QUESTION 3:
What is the main function of the monitor?
A. To process data
B. To store files
C. To display output
D. To connect to the internet
CORRECT ANSWER: C

QUESTION 4:
Which component performs calculations and processes instructions?
A. Keyboard
B. CPU
C. Mouse
D. Printer
CORRECT ANSWER: B""",
        "difficulty": 0.3,
        "estimated_time_minutes": 10,
    },

    # ========== MODULE 1: COMPUTER ESSENTIALS - TOPIC 2: FILE MANAGEMENT ==========
    
    # THEORY
    {
        "module_id": "icdl-computer-essentials",
        "topic_id": "file-management",
        "content_type": "theory",
        "sequence_order": 1,
        "title": "Understanding Files and Folders",
        "content_data": """LEARNING OBJECTIVES:
At the end of this lesson, learners should be able to:
- Explain what files and folders are
- Organize files properly
- Identify common file types
- Apply good file management practices

CONTENT:
Computers store information in the form of files. A file is a collection of related data stored under a specific name.

Examples of files include:
- Documents
- Images
- Videos
- Presentations
- Spreadsheets
- Audio files

WHAT IS A FOLDER?
A folder is a container used to organize and group files. Folders help users:
- Keep files organized
- Locate information quickly
- Manage digital content efficiently

Folders may also contain subfolders.

COMMON FILE EXTENSIONS:
File Type       | Extension
Word Document   | .docx
Image          | .jpg
Audio          | .mp3
Video          | .mp4
Spreadsheet    | .xlsx

IMPORTANCE OF FILE MANAGEMENT:
Good file management helps:
- Reduce confusion
- Prevent data loss
- Improve productivity
- Simplify document retrieval

FILE MANAGEMENT BEST PRACTICES:
1. Use meaningful file names
2. Organize files into folders
3. Avoid duplicate files
4. Backup important files regularly
5. Delete unnecessary files

SUMMARY:
Files and folders are essential for organizing digital information effectively.""",
        "difficulty": 0.3,
        "estimated_time_minutes": 12,
    },
    
    # EXAMPLE
    {
        "module_id": "icdl-computer-essentials",
        "topic_id": "file-management",
        "content_type": "example",
        "sequence_order": 2,
        "title": "Organizing School Assignments",
        "content_data": """A student creates a folder structure to organize academic work.

The student creates a main folder named: "University Work"

Inside the folder, the student creates subfolders:
- Assignments
- Lecture Notes
- Projects
- Past Questions

The student saves a Word document named: "ICT_Assignment_Week1.docx"
inside the Assignments folder.

This organization method helps the student:
- Find files easily
- Avoid losing assignments
- Manage academic documents efficiently

FOLDER STRUCTURE VISUALIZATION:
University Work/
├── Assignments/
│   └── ICT_Assignment_Week1.docx
├── Lecture Notes/
├── Projects/
└── Past Questions/

This hierarchical structure demonstrates proper file organization practices.""",
        "difficulty": 0.3,
        "estimated_time_minutes": 8,
    },
    
    # ACTIVITY
    {
        "module_id": "icdl-computer-essentials",
        "topic_id": "file-management",
        "content_type": "activity",
        "sequence_order": 3,
        "title": "Create and Organize Digital Files",
        "content_data": """ACTIVITY INSTRUCTIONS:
Perform the following tasks:

1. Create a folder named: "EDUTURE Practice"

2. Inside the folder, create the following subfolders:
   - Notes
   - Assignments
   - Projects

3. Create a text document named: "My_First_File.txt"

4. Save the document inside the Assignments folder.

5. Rename the file to: "Computer_Basics_Notes.txt"

6. Move the file into the Notes folder.

REFLECTION QUESTIONS:
1. Why are folders useful?
2. What problems can occur when files are poorly organized?
3. How can backups protect important information?

EXPECTED FOLDER STRUCTURE AFTER ACTIVITY:
EDUTURE Practice/
├── Notes/
│   └── Computer_Basics_Notes.txt
├── Assignments/
└── Projects/""",
        "difficulty": 0.4,
        "estimated_time_minutes": 15,
    },
    
    # EXERCISE
    {
        "module_id": "icdl-computer-essentials",
        "topic_id": "file-management",
        "content_type": "exercise",
        "sequence_order": 4,
        "title": "Files and Folders Quiz",
        "content_data": """INSTRUCTIONS: Choose the correct answer for each question.

QUESTION 1:
What is the purpose of a folder?
A. To display videos
B. To organize files
C. To browse websites
D. To print documents
CORRECT ANSWER: B

QUESTION 2:
Which extension is commonly associated with Microsoft Word documents?
A. .jpg
B. .docx
C. .mp3
D. .png
CORRECT ANSWER: B

QUESTION 3:
Which of the following is considered good file management practice?
A. Using random file names
B. Storing all files in one folder
C. Organizing files into categories
D. Deleting files immediately
CORRECT ANSWER: C

ADDITIONAL PRACTICE QUESTIONS:
- What is a file?
- Name at least three common file extensions
- Why is backup important?
- How should you name your files for easy retrieval?""",
        "difficulty": 0.4,
        "estimated_time_minutes": 10,
    },

    # ========== MODULE 2: ONLINE ESSENTIALS - TOPIC 1: INTERNET BASICS ==========
    
    # THEORY
    {
        "module_id": "icdl-online-essentials",
        "topic_id": "internet-basics",
        "content_type": "theory",
        "sequence_order": 1,
        "title": "Introduction to the Internet",
        "content_data": """LEARNING OBJECTIVES:
At the end of this lesson, learners should be able to:
- Define the internet
- Explain common internet uses
- Identify web browsers
- Describe basic online activities

CONTENT:
The internet is a global network that connects millions of computers and digital devices worldwide.

The internet allows users to:
- Communicate
- Access information
- Watch videos
- Participate in online learning
- Use online services

COMMON INTERNET SERVICES:

1. Web Browsing
Users visit websites using web browsers.

2. Email Communication
People send and receive electronic messages.

3. Online Learning
Students access educational materials online.

4. Social Communication
People communicate through social and messaging platforms.

WEB BROWSERS:
A web browser is software used to access websites.

Examples include:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

WEBSITE ADDRESSES:
Every website has a unique web address called a URL (Uniform Resource Locator).

Example: https://www.example.com

URL STRUCTURE:
- https:// = Protocol (secure connection)
- www = World Wide Web
- example = Domain name
- .com = Top-level domain

SUMMARY:
The internet provides access to global communication and information resources.""",
        "difficulty": 0.2,
        "estimated_time_minutes": 10,
    },
    
    # EXAMPLE
    {
        "module_id": "icdl-online-essentials",
        "topic_id": "internet-basics",
        "content_type": "example",
        "sequence_order": 2,
        "title": "Searching for Educational Information Online",
        "content_data": """A student wants to learn about the benefits of computers in education.

The student performs the following steps:

STEP 1: Open a web browser
- Click on the browser icon (Chrome, Firefox, Edge, or Safari)

STEP 2: Visit a search engine
- Navigate to Google, Bing, or another search engine website

STEP 3: Type the search query
- Search for: "Benefits of Computers in Education"

STEP 4: Press Enter
- The search engine displays a list of relevant websites

STEP 5: Review the search results
- Look through titles and descriptions
- Click on promising educational websites

STEP 6: Gather information
- Read articles and take notes
- Visit multiple sources for comprehensive understanding

This example demonstrates:
- How to use a web browser
- How to conduct an online search
- How the internet helps users access knowledge quickly
- How to find educational resources online

REAL-WORLD APPLICATIONS:
- Students researching for assignments
- Professionals learning new skills
- Families finding healthcare information
- Everyone accessing news and current events""",
        "difficulty": 0.2,
        "estimated_time_minutes": 8,
    },
    
    # ACTIVITY
    {
        "module_id": "icdl-online-essentials",
        "topic_id": "internet-basics",
        "content_type": "activity",
        "sequence_order": 3,
        "title": "Explore an Educational Website",
        "content_data": """ACTIVITY INSTRUCTIONS:

1. Open a web browser.

2. Visit an educational website (e.g., Khan Academy, Coursera, Wikipedia, or an educational institution website).

3. Identify the following website components:
   - Address bar (showing the URL)
   - Navigation menu (links at top or side)
   - Search feature (search box)
   - Homepage (main landing page)

4. Search for an educational topic of your interest using the website's search feature.

5. Write down:
   - What information you found
   - How the website was organized
   - How easy it was to navigate

REFLECTION QUESTIONS:

1. Why is the internet useful for students?
   - Provides access to vast educational resources
   - Enables remote learning opportunities
   - Allows communication with instructors and peers
   - Offers diverse perspectives on topics

2. What challenges can occur when searching online?
   - Finding unreliable information
   - Information overload
   - Difficulty distinguishing quality sources
   - Time management

3. Why is it important to verify online information?
   - Not all online content is accurate
   - Misinformation can spread quickly
   - Multiple sources help confirm facts
   - Critical thinking is essential in digital literacy""",
        "difficulty": 0.3,
        "estimated_time_minutes": 15,
    },
    
    # EXERCISE
    {
        "module_id": "icdl-online-essentials",
        "topic_id": "internet-basics",
        "content_type": "exercise",
        "sequence_order": 4,
        "title": "Internet Basics Quiz",
        "content_data": """INSTRUCTIONS: Choose the correct answer for each question.

QUESTION 1:
Which software is used to access websites?
A. Calculator
B. Browser
C. Scanner
D. Printer
CORRECT ANSWER: B
EXPLANATION: A web browser is software specifically designed to access and display websites.

QUESTION 2:
What does the internet connect?
A. Printers only
B. Phones only
C. Computers and devices worldwide
D. Monitors only
CORRECT ANSWER: C
EXPLANATION: The internet is a global network connecting millions of computers and digital devices worldwide.

QUESTION 3:
Which of the following is an example of a web browser?
A. Microsoft Word
B. Google Chrome
C. VLC Media Player
D. Adobe Reader
CORRECT ANSWER: B
EXPLANATION: Google Chrome is one of the most popular web browsers for accessing websites.

QUESTION 4:
What does URL stand for?
A. Universal Resource Library
B. Uniform Resource Locator
C. Universal Retrieval Language
D. Unified Remote Link
CORRECT ANSWER: B

QUESTION 5:
Which of these is NOT an internet service?
A. Web browsing
B. Email
C. Printing local documents
D. Online learning
CORRECT ANSWER: C
EXPLANATION: Printing local documents is a computer function, not an internet service.""",
        "difficulty": 0.3,
        "estimated_time_minutes": 10,
    },
]

MODULE_SUMMARIES = {
    "icdl-computer-essentials": {
        "module_id": "icdl-computer-essentials",
        "title": "Computer Essentials",
        "description": "Foundational computing concepts: hardware, file management, and I/O devices.",
        "topics": ["intro-computers", "file-management", "input-output-devices"],
    },
    "icdl-online-essentials": {
        "module_id": "icdl-online-essentials",
        "title": "Online Essentials",
        "description": "Basics of internet use, web browsing, and online safety.",
        "topics": ["internet-basics"],
    },
}


def build_questionnaire_by_style() -> dict[str, list[dict]]:
    grouped = defaultdict(list)
    for question in QUESTIONNAIRE_QUESTIONS:
        grouped[question["style"]].append(question)
    return grouped


def seed_content_rows() -> list[ContentFragment]:
    return [ContentFragment(**row) for row in CONTENT_SEED]
