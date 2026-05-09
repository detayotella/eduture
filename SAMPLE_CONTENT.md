# EDUTURE 2.0 — Detailed ICDL Prototype Content Dataset

## Adaptive Educational Hypermedia Sample Dataset

---

# PURPOSE OF THIS DOCUMENT

This document contains detailed instructional content designed for integration into the EDUTURE 2.0 adaptive educational hypermedia system.

The content in this dataset is intended to:

* replace placeholder/demo learning content currently used in the project,
* support adaptive sequencing,
* support rule-based personalization,
* support reinforcement learning recommendations,
* provide realistic instructional flow for demonstrations,
* and provide sufficient educational depth for academic evaluation.

This dataset is intentionally structured around ICDL-inspired digital literacy concepts.

The content is prototype-oriented and does not represent the complete ICDL curriculum.

---

# DATASET STRUCTURE

Each topic contains four learning object types:

1. Theory
2. Example
3. Activity
4. Exercise

These learning objects are dynamically sequenced by the EDUTURE adaptation engine depending on:

* learner learning style,
* learner engagement,
* quiz performance,
* interaction history,
* contextual features,
* and reinforcement learning optimization.

---

# ADAPTIVE LEARNING SEQUENCES

| Learning Style | Recommended Sequence                   |
| -------------- | -------------------------------------- |
| Activist       | Activity → Example → Theory → Exercise |
| Reflector      | Theory → Example → Activity → Exercise |
| Theorist       | Theory → Exercise → Example → Activity |
| Pragmatist     | Example → Activity → Theory → Exercise |

---

# MODULE 1 — COMPUTER ESSENTIALS

This module introduces learners to the foundational concepts of computer systems, computer hardware, file management, and digital interaction.

Learning outcomes:

After completing this module, learners should be able to:

* identify basic computer components,
* distinguish between different computer types,
* organize files and folders,
* identify input and output devices,
* and perform basic computer operations.

---

# TOPIC 1 — INTRODUCTION TO COMPUTERS

---

## THEORY

### Metadata

```json
{
  "module_id": "computer-essentials",
  "topic_id": "intro-computers",
  "content_type": "theory",
  "difficulty": 0.2,
  "estimated_time_minutes": 10
}
```

### Title

What is a Computer?

### Learning Objective

At the end of this lesson, learners should be able to:

* define a computer,
* identify major computer components,
* explain basic computer functions,
* and describe common uses of computers.

### Content

A computer is an electronic device that accepts data, processes it according to instructions, stores it, and produces meaningful information.

Computers are widely used in modern society because they help individuals and organizations complete tasks more efficiently and accurately.

Computers are commonly used in:

* schools,
* hospitals,
* offices,
* banks,
* businesses,
* and homes.

A computer system consists of several important components that work together.

## Major Components of a Computer

### 1. Monitor

The monitor displays visual output from the computer. It allows users to see text, images, videos, and software applications.

### 2. Keyboard

The keyboard is an input device used for typing text, numbers, and commands into the computer.

### 3. Mouse

The mouse is a pointing device used for selecting items, opening applications, and interacting with graphical interfaces.

### 4. System Unit

The system unit contains the main processing hardware of the computer including:

* processor (CPU),
* memory (RAM),
* storage devices,
* and motherboard.

The CPU is often referred to as the “brain” of the computer because it performs calculations and executes instructions.

## Functions of a Computer

A computer performs four major functions:

1. Input
2. Processing
3. Storage
4. Output

### Input

The computer receives data using input devices.

### Processing

The CPU processes the received data.

### Storage

Data and information can be saved for future use.

### Output

The computer displays or produces results for the user.

## Summary

Computers are essential tools used in everyday life. Understanding the major parts and functions of a computer provides the foundation for digital literacy.

---

## EXAMPLE

### Metadata

```json
{
  "module_id": "computer-essentials",
  "topic_id": "intro-computers",
  "content_type": "example",
  "difficulty": 0.2,
  "estimated_time_minutes": 8
}
```

### Title

Desktop vs Laptop Computers

### Content

Computers come in different forms depending on how they are used.

Two common types of computers are:

* desktop computers,
* and laptop computers.

## Desktop Computer

A desktop computer is designed to remain in one location.

It usually consists of separate components including:

* monitor,
* keyboard,
* mouse,
* and system unit.

Desktop computers are commonly used in:

* offices,
* schools,
* and computer laboratories.

### Advantages of Desktop Computers

* Larger screen size
* Easier hardware upgrades
* More powerful performance
* Better cooling systems

### Example Scenario

A university computer laboratory uses desktop computers because students use the systems for programming, research, and practical exercises.

## Laptop Computer

A laptop computer is portable and combines:

* monitor,
* keyboard,
* battery,
* touchpad,
* and processing components

into one device.

Laptop computers are designed for mobility and convenience.

### Advantages of Laptop Computers

* Portable
* Battery powered
* Compact design
* Convenient for travel

### Example Scenario

A student uses a laptop computer to attend online classes, complete assignments, and browse the internet while traveling.

## Comparison Summary

| Feature        | Desktop    | Laptop  |
| -------------- | ---------- | ------- |
| Portability    | Low        | High    |
| Upgradeability | Easy       | Limited |
| Battery        | No         | Yes     |
| Space Usage    | More space | Compact |

---

## ACTIVITY

### Metadata

```json
{
  "module_id": "computer-essentials",
  "topic_id": "intro-computers",
  "content_type": "activity",
  "difficulty": 0.3,
  "estimated_time_minutes": 15
}
```

### Title

Identify Computer Components

### Activity Instructions

In this activity, learners will identify major computer hardware components.

## Task 1 — Observation

Look at a nearby computer system and identify the following:

1. Monitor
2. Keyboard
3. Mouse
4. System Unit
5. Speakers (if available)

## Task 2 — Classification

For each component:

* write its name,
* state whether it is input or output hardware,
* and explain its function.

## Task 3 — Reflection

Answer the following questions:

1. Which component do you use the most?
2. Why is the CPU called the brain of the computer?
3. What would happen if the monitor stopped working?

### Expected Learning Outcome

After this activity, learners should be able to recognize basic computer hardware and explain their functions.

---

## EXERCISE

### Metadata

```json
{
  "module_id": "computer-essentials",
  "topic_id": "intro-computers",
  "content_type": "exercise",
  "difficulty": 0.3,
  "estimated_time_minutes": 10
}
```

### Title

Computer Basics Assessment

### Instructions

Choose the correct answer for each question.

---

### Question 1

Which device is mainly used for typing information into the computer?

A. Monitor
B. Keyboard
C. Speaker
D. Printer

Correct Answer: B

Explanation:
The keyboard is used to enter text and commands into the computer.

---

### Question 2

Which computer type is designed for portability?

A. Desktop
B. Mainframe
C. Laptop
D. Server

Correct Answer: C

Explanation:
Laptops are portable computers designed for mobility.

---

### Question 3

What is the main function of the monitor?

A. To process data
B. To store files
C. To display output
D. To connect to the internet

Correct Answer: C

---

### Question 4

Which component performs calculations and processes instructions?

A. Keyboard
B. CPU
C. Mouse
D. Printer

Correct Answer: B

---

# TOPIC 2 — FILE MANAGEMENT

---

## THEORY

### Metadata

```json
{
  "module_id": "computer-essentials",
  "topic_id": "file-management",
  "content_type": "theory",
  "difficulty": 0.3,
  "estimated_time_minutes": 12
}
```

### Title

Understanding Files and Folders

### Learning Objective

At the end of this lesson, learners should be able to:

* explain what files and folders are,
* organize files properly,
* identify common file types,
* and apply good file management practices.

### Content

Computers store information in the form of files.

A file is a collection of related data stored under a specific name.

Examples of files include:

* documents,
* images,
* videos,
* presentations,
* spreadsheets,
* and audio files.

## What is a Folder?

A folder is a container used to organize and group files.

Folders help users:

* keep files organized,
* locate information quickly,
* and manage digital content efficiently.

Folders may also contain subfolders.

## Common File Extensions

| File Type     | Extension |
| ------------- | --------- |
| Word Document | .docx     |
| Image         | .jpg      |
| Audio         | .mp3      |
| Video         | .mp4      |
| Spreadsheet   | .xlsx     |

## Importance of File Management

Good file management helps:

* reduce confusion,
* prevent data loss,
* improve productivity,
* and simplify document retrieval.

## File Management Best Practices

1. Use meaningful file names
2. Organize files into folders
3. Avoid duplicate files
4. Backup important files regularly
5. Delete unnecessary files

## Summary

Files and folders are essential for organizing digital information effectively.

---

## EXAMPLE

### Metadata

```json
{
  "module_id": "computer-essentials",
  "topic_id": "file-management",
  "content_type": "example",
  "difficulty": 0.3,
  "estimated_time_minutes": 8
}
```

### Title

Organizing School Assignments

### Content

A student creates a folder structure to organize academic work.

The student creates a main folder named:

"University Work"

Inside the folder, the student creates subfolders:

* Assignments
* Lecture Notes
* Projects
* Past Questions

The student saves a Word document named:

"ICT_Assignment_Week1.docx"

inside the Assignments folder.

This organization method helps the student:

* find files easily,
* avoid losing assignments,
* and manage academic documents efficiently.

---

## ACTIVITY

### Metadata

```json
{
  "module_id": "computer-essentials",
  "topic_id": "file-management",
  "content_type": "activity",
  "difficulty": 0.4,
  "estimated_time_minutes": 15
}
```

### Title

Create and Organize Digital Files

### Activity Instructions

Perform the following tasks:

1. Create a folder named:
   "EDUTURE Practice"

2. Inside the folder, create the following subfolders:

   * Notes
   * Assignments
   * Projects

3. Create a text document named:
   "My_First_File.txt"

4. Save the document inside the Assignments folder.

5. Rename the file to:
   "Computer_Basics_Notes.txt"

6. Move the file into the Notes folder.

### Reflection Questions

1. Why are folders useful?
2. What problems can occur when files are poorly organized?
3. How can backups protect important information?

---

## EXERCISE

### Metadata

```json
{
  "module_id": "computer-essentials",
  "topic_id": "file-management",
  "content_type": "exercise",
  "difficulty": 0.4,
  "estimated_time_minutes": 10
}
```

### Title

Files and Folders Quiz

---

### Question 1

What is the purpose of a folder?

A. To display videos
B. To organize files
C. To browse websites
D. To print documents

Correct Answer: B

---

### Question 2

Which extension is commonly associated with Microsoft Word documents?

A. .jpg
B. .docx
C. .mp3
D. .png

Correct Answer: B

---

### Question 3

Which of the following is considered good file management practice?

A. Using random file names
B. Storing all files in one folder
C. Organizing files into categories
D. Deleting files immediately

Correct Answer: C

---

# MODULE 2 — ONLINE ESSENTIALS

This module introduces learners to the fundamentals of internet usage, web browsing, online communication, and online safety.

Learning outcomes:

After completing this module, learners should be able to:

* explain how the internet works,
* use web browsers effectively,
* understand online communication,
* and identify safe internet practices.

---

# TOPIC 1 — INTERNET BASICS

---

## THEORY

### Metadata

```json
{
  "module_id": "online-essentials",
  "topic_id": "internet-basics",
  "content_type": "theory",
  "difficulty": 0.2,
  "estimated_time_minutes": 10
}
```

### Title

Introduction to the Internet

### Learning Objective

At the end of this lesson, learners should be able to:

* define the internet,
* explain common internet uses,
* identify web browsers,
* and describe basic online activities.

### Content

The internet is a global network that connects millions of computers and digital devices worldwide.

The internet allows users to:

* communicate,
* access information,
* watch videos,
* participate in online learning,
* and use online services.

## Common Internet Services

### 1. Web Browsing

Users visit websites using web browsers.

### 2. Email Communication

People send and receive electronic messages.

### 3. Online Learning

Students access educational materials online.

### 4. Social Communication

People communicate through social and messaging platforms.

## Web Browsers

A web browser is software used to access websites.

Examples include:

* Google Chrome
* Mozilla Firefox
* Microsoft Edge
* Safari

## Website Addresses

Every website has a unique web address called a URL.

Example:

[https://www.example.com](https://www.example.com)

## Summary

The internet provides access to global communication and information resources.

---

## EXAMPLE

### Metadata

```json
{
  "module_id": "online-essentials",
  "topic_id": "internet-basics",
  "content_type": "example",
  "difficulty": 0.2,
  "estimated_time_minutes": 8
}
```

### Title

Searching for Educational Information Online

### Content

A student wants to learn about the benefits of computers in education.

The student performs the following steps:

1. Opens a web browser
2. Visits a search engine
3. Types the search query:
   "Benefits of Computers in Education"
4. Presses Enter
5. Reviews the search results

The student opens several educational websites to gather information.

This example demonstrates how the internet helps users access knowledge quickly.

---

## ACTIVITY

### Metadata

```json
{
  "module_id": "online-essentials",
  "topic_id": "internet-basics",
  "content_type": "activity",
  "difficulty": 0.3,
  "estimated_time_minutes": 15
}
```

### Title

Explore an Educational Website

### Activity Instructions

1. Open a web browser.
2. Visit an educational website.
3. Identify the following:

   * address bar,
   * navigation menu,
   * search feature,
   * homepage.
4. Search for an educational topic.
5. Write down:

   * what information you found,
   * and how the website was organized.

### Reflection Questions

1. Why is the internet useful for students?
2. What challenges can occur when searching online?
3. Why is it important to verify online information?

---

## EXERCISE

### Metadata

```json
{
  "module_id": "online-essentials",
  "topic_id": "internet-basics",
  "content_type": "exercise",
  "difficulty": 0.3,
  "estimated_time_minutes": 10
}
```

### Title

Internet Basics Quiz

---

### Question 1

Which software is used to access websites?

A. Calculator
B. Browser
C. Scanner
D. Printer

Correct Answer: B

---

### Question 2

What does the internet connect?

A. Printers only
B. Phones only
C. Computers and devices worldwide
D. Monitors only

Correct Answer: C

---

### Question 3

Which of the following is an example of a web browser?

A. Microsoft Word
B. Google Chrome
C. VLC Media Player
D. Adobe Reader

Correct Answer: B

---

# IMPLEMENTATION NOTE FOR DEVELOPERS

This dataset is designed for direct integration into:

* content_fragments database table,
* adaptive recommendation pipelines,
* React learning interfaces,
* and RL experimentation workflows.

Recommended integration workflow:

1. Convert sections into JSON seed objects
2. Populate PostgreSQL database
3. Render dynamically in frontend learning pages
4. Connect recommendation engine to content metadata
5. Track learner interactions per content fragment

---

# RESEARCH NOTE

The instructional materials in this prototype represent selected ICDL-inspired educational modules used for evaluating adaptive educational sequencing strategies within the EDUTURE system.

The primary contribution of EDUTURE lies in:

* adaptive personalization,
* contextual recommendation,
* reinforcement learning optimization,
* and intelligent sequencing of learning objects.
