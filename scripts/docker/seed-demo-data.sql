-- ==============================================================================
-- IntegrityAI - Comprehensive Demo Seed Script (20+ Records across all services)
-- Password for all seeded users: password123
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AUTH SERVICE DATABASE (integrityai_auth)
-- ------------------------------------------------------------------------------
\c integrityai_auth;

-- Insert 4 Faculty Accounts
INSERT INTO users (user_id, name, email, password_hash, role, department, assigned_courses, phone_number, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111101', 'Dr. Rajesh Sharma', 'dr.sharma@integrityai.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'FACULTY', 'Computer Science & Engineering', 'Distributed Systems, Cloud Architecture', '+91 9876543210', NOW() - INTERVAL '30 days'),
  ('11111111-1111-1111-1111-111111111102', 'Prof. Ananya Iyer', 'prof.iyer@integrityai.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'FACULTY', 'Artificial Intelligence & Data Science', 'Natural Language Processing, Machine Learning', '+91 9876543211', NOW() - INTERVAL '30 days'),
  ('11111111-1111-1111-1111-111111111103', 'Dr. Vikram Malhotra', 'dr.malhotra@integrityai.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'FACULTY', 'Software Engineering', 'Database Systems, Enterprise Architecture', '+91 9876543212', NOW() - INTERVAL '30 days'),
  ('11111111-1111-1111-1111-111111111104', 'Prof. Neha Gupta', 'prof.gupta@integrityai.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'FACULTY', 'Information Technology', 'Operating Systems, Network Security', '+91 9876543213', NOW() - INTERVAL '30 days')
ON CONFLICT (email) DO NOTHING;

-- Insert 16 Student Accounts
INSERT INTO users (user_id, name, email, password_hash, role, course, semester, roll_number, phone_number, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222201', 'Aarav Patel', 'aarav.patel@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'MCA', 'Semester 3', 'MCA202401', '+91 9123456701', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222202', 'Priya Sharma', 'priya.sharma@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'MCA', 'Semester 3', 'MCA202402', '+91 9123456702', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222203', 'Rohan Verma', 'rohan.verma@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'MCA', 'Semester 3', 'MCA202403', '+91 9123456703', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222204', 'Sneha Reddy', 'sneha.reddy@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'MCA', 'Semester 3', 'MCA202404', '+91 9123456704', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222205', 'Aditya Kumar', 'aditya.kumar@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'B.Tech CS', 'Semester 5', 'CS202315', '+91 9123456705', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222206', 'Ananya Sen', 'ananya.sen@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'B.Tech CS', 'Semester 5', 'CS202316', '+91 9123456706', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222207', 'Varun Nair', 'varun.nair@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'B.Tech CS', 'Semester 5', 'CS202317', '+91 9123456707', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222208', 'Tanvi Joshi', 'tanvi.joshi@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'B.Tech CS', 'Semester 5', 'CS202318', '+91 9123456708', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222209', 'Kabir Mehta', 'kabir.mehta@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'MCA', 'Semester 3', 'MCA202405', '+91 9123456709', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222210', 'Riya Choudhury', 'riya.choudhury@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'MCA', 'Semester 3', 'MCA202406', '+91 9123456710', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222211', 'Siddharth Rao', 'siddharth.rao@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'B.Tech CS', 'Semester 5', 'CS202319', '+91 9123456711', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222212', 'Meera Nambiar', 'meera.nambiar@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'MCA', 'Semester 3', 'MCA202407', '+91 9123456712', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222213', 'Arjun Kapoor', 'arjun.kapoor@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'M.Tech AI', 'Semester 2', 'AI202501', '+91 9123456713', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222214', 'Divya Menon', 'divya.menon@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'M.Tech AI', 'Semester 2', 'AI202502', '+91 9123456714', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222215', 'Kunal Shah', 'kunal.shah@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'B.Tech CS', 'Semester 5', 'CS202320', '+91 9123456715', NOW() - INTERVAL '25 days'),
  ('22222222-2222-2222-2222-222222222216', 'Pooja Bose', 'pooja.bose@student.edu', '$2a$10$wH5E0tf7BBIAkTTUsFkqEOOYnq.QJKjrYa1D4sLcLeCoDGbCg/FhS', 'STUDENT', 'MCA', 'Semester 3', 'MCA202408', '+91 9123456716', NOW() - INTERVAL '25 days')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. FACULTY SERVICE DATABASE (integrityai_faculty)
-- ------------------------------------------------------------------------------
\c integrityai_faculty;

-- Link Faculty Profiles
INSERT INTO faculty (faculty_id, user_id, designation, department)
VALUES 
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'Professor & Head', 'Computer Science & Engineering'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', 'Associate Professor', 'Artificial Intelligence & Data Science'),
  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', 'Professor', 'Software Engineering'),
  ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111104', 'Assistant Professor', 'Information Technology')
ON CONFLICT (faculty_id) DO NOTHING;

-- Insert 6 Realistic Academic Assignments
INSERT INTO assignments (assignment_id, faculty_id, title, subject, description, target_course, target_semester, deadline, created_at)
VALUES 
  (
    '44444444-4444-4444-4444-444444444401',
    '33333333-3333-3333-3333-333333333301',
    'Distributed Systems: Cloud-Native Microservices Architecture',
    'Distributed Systems',
    'Design and document a scalable microservices architecture incorporating Spring Cloud Gateway, Eureka discovery, polyglot persistence (PostgreSQL + MongoDB), and distributed Prometheus observability. Submit detailed technical reports in PDF or DOCX format.',
    'MCA',
    'Semester 3',
    NOW() + INTERVAL '14 days',
    NOW() - INTERVAL '10 days'
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '33333333-3333-3333-3333-333333333302',
    'Natural Language Processing: Stylometric Feature Extraction vs LLMs',
    'Artificial Intelligence',
    'Implement a comparative analysis demonstrating how 14 stylometric statistical features (sentence burstiness CV, Guiraud root TTR, Hapax Legomena ratio) distinguish human academic prose from ChatGPT and Gemini outputs. Benchmark across Naive Bayes and Random Forest.',
    'B.Tech CS',
    'Semester 5',
    NOW() + INTERVAL '10 days',
    NOW() - INTERVAL '12 days'
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    '33333333-3333-3333-3333-333333333303',
    'Database Engineering: Sharding, ACID Guarantees & CAP Theorem',
    'Database Systems',
    'Empirical case study evaluating PostgreSQL relational consistency versus MongoDB horizontal sharding under high-concurrency read/write workloads. Analyze partition tolerance tradeoffs.',
    'MCA',
    'Semester 3',
    NOW() + INTERVAL '7 days',
    NOW() - INTERVAL '8 days'
  ),
  (
    '44444444-4444-4444-4444-444444444404',
    '33333333-3333-3333-3333-333333333304',
    'Operating Systems: Kernel Scheduling & Virtual Memory Page Replacement',
    'Operating Systems',
    'Write a comparative analysis of Linux CFS (Completely Fair Scheduler) and Windows priority-based preemptive scheduling with empirical memory footprint metrics.',
    'B.Tech CS',
    'Semester 5',
    NOW() + INTERVAL '5 days',
    NOW() - INTERVAL '9 days'
  ),
  (
    '44444444-4444-4444-4444-444444444405',
    '33333333-3333-3333-3333-333333333302',
    'Deep Learning: Multi-Head Self-Attention in Transformer Architectures',
    'Deep Learning',
    'Mathematical derivation of Scaled Dot-Product Attention, Positional Encoding, and Feed-Forward sublayers in original Transformer models. Include computational complexity analysis.',
    'M.Tech AI',
    'Semester 2',
    NOW() + INTERVAL '12 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    '44444444-4444-4444-4444-444444444406',
    '33333333-3333-3333-3333-333333333301',
    'Enterprise Cybersecurity: Zero-Trust Architecture & OAuth2/JWT Tokens',
    'Cybersecurity',
    'Evaluate cryptographic strengths and attack vectors (replay, secret brute-force) in stateless JWT bearer authorization compared to session state stores.',
    'MCA',
    'Semester 3',
    NOW() + INTERVAL '18 days',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (assignment_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. NOTIFICATION SERVICE DATABASE (integrityai_notification)
-- ------------------------------------------------------------------------------
\c integrityai_notification;

INSERT INTO notifications (notification_id, recipient_id, recipient_email, title, message, type, is_read, email_sent, created_at)
VALUES 
  ('55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222201', 'aarav.patel@student.edu', 'New Assignment Published', 'Dr. Rajesh Sharma has published "Distributed Systems: Cloud-Native Microservices Architecture". Deadline: in 14 days.', 'ASSIGNMENT_CREATED', true, true, NOW() - INTERVAL '10 days'),
  ('55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222202', 'priya.sharma@student.edu', 'New Assignment Published', 'Dr. Rajesh Sharma has published "Distributed Systems: Cloud-Native Microservices Architecture". Deadline: in 14 days.', 'ASSIGNMENT_CREATED', true, true, NOW() - INTERVAL '10 days'),
  ('55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222201', 'aarav.patel@student.edu', 'Submission Received & Analyzed', 'Your submission for Distributed Systems was successfully uploaded to AWS S3 and analyzed by IntegrityAI. Integrity Risk: LOW.', 'SUBMISSION_CONFIRMED', true, true, NOW() - INTERVAL '3 days'),
  ('55555555-5555-5555-5555-555555555504', '22222222-2222-2222-2222-222222222203', 'rohan.verma@student.edu', 'Integrity Alert: Potential Plagiarism', 'Your submission for Distributed Systems flagged a high similarity score (78.4%) matching peer content. Faculty review required.', 'INTEGRITY_WARNING', false, true, NOW() - INTERVAL '2 days'),
  ('55555555-5555-5555-5555-555555555505', '11111111-1111-1111-1111-111111111101', 'dr.sharma@integrityai.edu', 'New Student Submission', 'Student Aarav Patel (MCA202401) has submitted work for Distributed Systems. Status: Low Risk (0% AI, 4.2% Similarity).', 'FACULTY_ALERT', true, true, NOW() - INTERVAL '3 days'),
  ('55555555-5555-5555-5555-555555555506', '11111111-1111-1111-1111-111111111101', 'dr.sharma@integrityai.edu', 'Critical Alert: Peer Collusion Detected', 'Submissions from Rohan Verma and Sneha Reddy share 76.5% verbatim tri-grams in Distributed Systems.', 'FACULTY_ALERT', false, true, NOW() - INTERVAL '2 days'),
  ('55555555-5555-5555-5555-555555555507', '22222222-2222-2222-2222-222222222205', 'aditya.kumar@student.edu', 'New Assignment Published', 'Prof. Ananya Iyer has published "Natural Language Processing: Stylometric Feature Extraction vs LLMs".', 'ASSIGNMENT_CREATED', true, true, NOW() - INTERVAL '12 days'),
  ('55555555-5555-5555-5555-555555555508', '22222222-2222-2222-2222-222222222205', 'aditya.kumar@student.edu', 'Integrity Check Complete', 'Your NLP submission scored 94.2% AI probability. Highlighted sentences indicate ChatGPT didactic transition phrases.', 'INTEGRITY_WARNING', false, true, NOW() - INTERVAL '1 day'),
  ('55555555-5555-5555-5555-555555555509', '22222222-2222-2222-2222-222222222207', 'varun.nair@student.edu', 'Submission Verified: 100% Original', 'Your submission for Operating Systems was classified as 100% Human-Authored with zero plagiarism.', 'SUBMISSION_CONFIRMED', true, true, NOW() - INTERVAL '2 days'),
  ('55555555-5555-5555-5555-555555555510', '11111111-1111-1111-1111-111111111102', 'prof.iyer@integrityai.edu', 'Grading Summary Ready', '12 submissions received for Natural Language Processing. 2 flagged for AI review, 10 clear.', 'FACULTY_SUMMARY', false, true, NOW() - INTERVAL '4 hours')
ON CONFLICT (notification_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. REPORT SERVICE DATABASE (integrityai_report)
-- ------------------------------------------------------------------------------
\c integrityai_report;

INSERT INTO reports (
  report_id, student_id, submission_id, assignment_id, analysis_id,
  plagiarism_score, ai_detection_score, code_similarity_score,
  risk_score, status, decision, summary, faculty_remarks, generated_at
)
VALUES 
  (
    '66666666-6666-6666-6666-666666666601',
    '22222222-2222-2222-2222-222222222201',
    '77777777-7777-7777-7777-777777777701',
    '44444444-4444-4444-4444-444444444401',
    '88888888-8888-8888-8888-888888888801',
    3.8, 0.0, 0.0,
    'Low', 'COMPLETED', 'ACCEPTED',
    'Document exhibits high burstiness (CV = 0.512), high Type-Token Ratio (0.642), and rich Hapax Legomena. No hallmark AI transitional clichés detected. 100% human-authored academic work.',
    'Excellent original technical analysis of Spring Cloud Gateway routing patterns.',
    NOW() - INTERVAL '3 days'
  ),
  (
    '66666666-6666-6666-6666-666666666602',
    '22222222-2222-2222-2222-222222222202',
    '77777777-7777-7777-7777-777777777702',
    '44444444-4444-4444-4444-444444444401',
    '88888888-8888-8888-8888-888888888802',
    8.4, 0.0, 0.0,
    'Low', 'COMPLETED', 'ACCEPTED',
    'Original laboratory analysis. Standard technical vocabulary detected. 0.0% AI score verified via empirical science dampener.',
    'Well documented diagrams and performance benchmarks.',
    NOW() - INTERVAL '3 days'
  ),
  (
    '66666666-6666-6666-6666-666666666603',
    '22222222-2222-2222-2222-222222222203',
    '77777777-7777-7777-7777-777777777703',
    '44444444-4444-4444-4444-444444444401',
    '88888888-8888-8888-8888-888888888803',
    78.4, 12.0, 65.0,
    'High', 'COMPLETED', 'FLAGGED',
    'CRITICAL RISK: Direct peer collusion detected with another student submission in this assignment (78.4% similarity). High tri-gram overlap across architectural diagram explanations.',
    'Direct match with student Sneha Reddy. Both students called for academic integrity viva.',
    NOW() - INTERVAL '2 days'
  ),
  (
    '66666666-6666-6666-6666-666666666604',
    '22222222-2222-2222-2222-222222222204',
    '77777777-7777-7777-7777-777777777704',
    '44444444-4444-4444-4444-444444444401',
    '88888888-8888-8888-8888-888888888804',
    76.5, 8.5, 62.0,
    'High', 'COMPLETED', 'FLAGGED',
    'CRITICAL RISK: Direct peer match detected. Paragraphs 3 through 7 are word-for-word identical with Rohan Verma.',
    'Under investigation for peer copying.',
    NOW() - INTERVAL '2 days'
  ),
  (
    '66666666-6666-6666-6666-666666666605',
    '22222222-2222-2222-2222-222222222205',
    '77777777-7777-7777-7777-777777777705',
    '44444444-4444-4444-4444-444444444402',
    '88888888-8888-8888-8888-888888888805',
    5.2, 94.8, 0.0,
    'High', 'COMPLETED', 'REJECTED',
    'HIGH AI GENERATION RISK: Sentence length variance is unnaturally low (Burstiness CV = 0.231). 8 hallmark ChatGPT phrases detected (e.g. "it is crucial to note", "delve into", "rich tapestry of features", "a testament to"). 94.8% AI probability.',
    'Regenerated entire submission using ChatGPT without attribution. Resubmission mandatory.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '66666666-6666-6666-6666-666666666606',
    '22222222-2222-2222-2222-222222222206',
    '77777777-7777-7777-7777-777777777706',
    '44444444-4444-4444-4444-444444444402',
    '88888888-8888-8888-8888-888888888806',
    6.1, 0.0, 0.0,
    'Low', 'COMPLETED', 'ACCEPTED',
    'Stylometric analysis confirms human variation. Burstiness CV = 0.495. High individual vocabulary richness. 0.0% AI score.',
    'Well written review of Guiraud Index and Hapax Legomena.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '66666666-6666-6666-6666-666666666607',
    '22222222-2222-2222-2222-222222222207',
    '77777777-7777-7777-7777-777777777707',
    '44444444-4444-4444-4444-444444444404',
    '88888888-8888-8888-8888-888888888807',
    11.4, 0.0, 0.0,
    'Low', 'COMPLETED', 'ACCEPTED',
    'Empirical OS kernel scheduling benchmark. Technical metrics (nanosecond dispatch latencies, TLB shootdowns) safely preserved via domain filter.',
    'Strong experimental analysis of Linux CFS scheduling latency.',
    NOW() - INTERVAL '2 days'
  ),
  (
    '66666666-6666-6666-6666-666666666608',
    '22222222-2222-2222-2222-222222222208',
    '77777777-7777-7777-7777-777777777708',
    '44444444-4444-4444-4444-444444444404',
    '88888888-8888-8888-8888-888888888808',
    28.5, 34.0, 20.0,
    'Medium', 'COMPLETED', 'MANUAL_REVIEW',
    'MODERATE RISK: General literature review segments share similarities with GeeksForGeeks and tutorial text. AI probability 34.0%. Faculty manual review advised.',
    'Paraphrasing needed for section 2. Core implementation is acceptable.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '66666666-6666-6666-6666-666666666609',
    '22222222-2222-2222-2222-222222222209',
    '77777777-7777-7777-7777-777777777709',
    '44444444-4444-4444-4444-444444444403',
    '88888888-8888-8888-8888-888888888809',
    4.5, 0.0, 0.0,
    'Low', 'COMPLETED', 'ACCEPTED',
    '100% Human-Authored database benchmark. Original experimental sharding throughput data.',
    'Good comparison of 2PC vs Raft consensus.',
    NOW() - INTERVAL '4 days'
  ),
  (
    '66666666-6666-6666-6666-666666666610',
    '22222222-2222-2222-2222-222222222210',
    '77777777-7777-7777-7777-777777777710',
    '44444444-4444-4444-4444-444444444403',
    '88888888-8888-8888-8888-888888888810',
    7.2, 0.0, 0.0,
    'Low', 'COMPLETED', 'ACCEPTED',
    'Low risk. Clean document structure with authentic human syntax patterns.',
    'Accepted.',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (report_id) DO NOTHING;
