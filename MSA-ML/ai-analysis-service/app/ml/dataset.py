"""
Curated training and evaluation dataset for AI vs. Human academic coursework classification.
Provides balanced samples across computer science, engineering, literature, ethics, and science.
"""

from typing import Tuple, List
import random


# ---------------------------------------------------------------------------
# Core Academic Corpus: Human-Authored Samples (Class 0)
# Characteristics: Irregular sentence lengths, domain-specific empirical measurements,
# idiosyncratic transitions, personal observations, colloquial student phrasing,
# concrete lab data, and citations.
# ---------------------------------------------------------------------------
HUMAN_CORPUS = [
    # 1. Engineering / Materials Science Lab Report
    """We conducted the tensile test on three cylindrical mild steel specimens using an electromechanical Instron 5982 frame. Each specimen had an initial gauge length of 50.0 mm and a nominal diameter of 12.5 mm according to ASTM E8 guidelines. The crosshead speed was kept constant at 1.5 mm/min. For specimen 1, the upper yield strength was observed at 318.4 MPa, after which noticeable plastic deformation set in. Final fracture occurred at an elongation of 24.6% with a distinct cup-and-cone morphology indicative of ductile failure. Necking started slightly past the ultimate tensile strength of 462.1 MPa. Some slippage occurred in the upper wedge grip during run 2, which caused a momentary plateau in the stress-strain curve around 150 MPa, but we re-tightened the fixture and zeroed the extensometer before repeating the trial.""",

    # 2. Operating Systems Lab / Student Implementation Notes
    """In this assignment I implemented a custom LRU page replacement algorithm in C. I used a doubly linked list combined with an open-addressing hash table to achieve O(1) page lookups and removals. The hardest bug was handling page eviction when the free frame list ran empty during multi-threaded page faults. If thread A selected a victim page while thread B was servicing an I/O interrupt on the exact same frame index, the lock wasn't held properly and it threw a segmentation fault. I fixed it by introducing a per-frame reader-writer lock in `vm_manager.c` around lines 145-180. Benchmarking against the reference FIFO implementation on a 100,000 memory reference trace gave an 18% lower miss rate on the matrix multiplication benchmark, although page fault latency increased slightly due to the pointer overhead.""",

    # 3. Database Systems Homework
    """Normalizing the university registrar database required breaking down the initial unnormalized table into 3NF. Originally, the `StudentCourseRegistration` table had composite keys consisting of `(student_id, course_code, semester)`. However, attributes like `instructor_office` and `department_head` depended only on `instructor_id`, which created transitive dependencies violating Third Normal Form. I created separate relations: `Instructors(instructor_id, name, office, dept_id)` and `Courses(course_code, title, credits)`. The SQL join queries run a bit slower on Postgres when generating the full student transcript, but we eliminated update anomalies where changing an instructor's office required updating 400 student enrollment rows.""",

    # 4. Computer Networks / Socket Programming Report
    """We built a multi-client chat server using non-blocking TCP sockets with `epoll` on Linux 6.1. When testing with 500 concurrent connections over localhost, memory usage peaked at 24 MB. One quirk we noticed was that if a client unexpectedly drops Wi-Fi without sending a FIN packet, the server's TCP socket stays in the ESTABLISHED state until keepalive probes timeout after 7200 seconds. To solve this, we set `SO_KEEPALIVE` with `TCP_KEEPIDLE` set to 30 seconds and `TCP_KEEPCNT` set to 3. This allowed the server daemon to reap dead connection descriptors quickly and avoid file descriptor exhaustion under load.""",

    # 5. Distributed Systems / Cloud Project Report
    """For our term project, we deployed three microservices on an Ubuntu 22.04 LTS VPS instance. We initially tried running RabbitMQ for inter-service messaging, but the 1GB RAM budget on the cheap server caused the Erlang runtime to get killed by Linux OOM killer whenever message queues backed up. We pivoted to Redis Streams, which dropped memory usage down to roughly 12 MB. The order processing service reads incoming events from the stream using consumer groups with automatic acknowledgment. During our load test using Locust with 50 concurrent users, average latency was 142 ms with zero 5xx server errors.""",

    # 6. Algorithm Analysis Assignment
    """Comparing QuickSelect against standard HeapSort for finding the k-th smallest element in an array of size N = 1,000,000: When the input array was already sorted in ascending order, naive QuickSelect with the last element chosen as pivot suffered from O(N^2) recursion depth and crashed with a stack overflow. Switching to the median-of-three pivot selection strategy resolved this issue completely, reducing runtime from > 30 seconds down to 42 milliseconds. HeapSort ran in a steady 180 milliseconds regardless of input permutation because of its strict O(N log N) guarantee.""",

    # 7. Student Literature Analysis
    """When looking at Orwell's 1984, what struck me most wasn't just the overt surveillance of the telescreens, but Winston's quiet struggle to remember what London was like before the revolution. Memory itself is treated as a crime. His diary isn't an act of grand defiance aimed at overthrowing the Party; it's an intensely personal attempt to maintain his sanity against a state that literally rewrites yesterday's newspapers. When he buys the glass paperweight from Mr. Charrington's antique shop, it represents an anchor to a tactile, unalterable past that the Party hasn't managed to sanitize yet.""",

    # 8. Web Development / React Student Assignment
    """The frontend is built using React 18 with Vite. State management was tricky because the cart state needed to sync across the navbar icon and the checkout drawer without prop drilling through four layers of layout components. I ended up using Zustand instead of Redux Toolkit because it avoids boilerplate reducers and keeps the bundle size under 80 KB. One annoyance was that when navigating back from Stripe checkout, the webhook took 2 seconds to fire, so the order confirmation screen briefly showed an 'unpaid' badge until I added polling on the order status endpoint with a 500ms interval.""",

    # 9. Physics Laboratory Report
    """In this experiment we determined the Planck constant using the photoelectric effect. Monochromatic light filters of wavelengths 365 nm, 404 nm, 436 nm, and 546 nm were placed in front of a high-pressure mercury arc lamp. The stopping potential V_0 was measured with an electrometer across a photodiode cathode. By plotting stopping potential against frequency, the slope of the linear regression line yielded h/e = 4.11 x 10^-15 V*s. Multiplying by the elementary charge gave h = 6.58 x 10^-34 J*s, which is within 0.7% of the accepted literature value (6.626 x 10^-34 J*s). The small discrepancy was likely due to stray ambient light and cathode surface oxidation.""",

    # 10. Student Essay on Remote Work
    """Working from home sounds great on paper, but after doing it for six months during my internship, the novelty wore off fast. The biggest issue is that the boundary between work hours and personal time just disappears. My laptop sits on my desk two feet from my bed, so I kept checking Slack messages at 10 PM. On the other hand, skipping the daily 45-minute subway commute gave me back almost two hours each day, which let me cook dinner and actually get eight hours of sleep. A hybrid setup with two days in the office seems like the only sensible compromise.""",

    # 11. Student Cryptography Assignment
    """I implemented RSA keypair generation and OAEP padding in Python from scratch. Generating 2048-bit primes p and q using the Miller-Rabin primality test with 40 rounds of random bases ensures the probability of a composite passing as prime is less than 2^-80. I initially made a silly mistake in the extended Euclidean algorithm where I didn't handle negative modular inverses properly, causing decryption to output garbage text. Adding `d = (d % phi + phi) % phi` fixed the private key computation. The test vectors from RFC 8017 now pass completely.""",

    # 12. Student Biology Experiment
    """We measured the rate of enzyme catalase activity across different pH buffers (pH 4, 6, 7, 8, and 10) by recording oxygen bubble column height produced from hydrogen peroxide breakdown in test tubes over 3-minute intervals. Optimal activity peaked sharply at pH 7.2 with a bubble column of 8.4 cm. At pH 4 and pH 10, activity dropped below 1.1 cm, showing clear enzyme denaturation from disruption of ionic and hydrogen bonds in the tertiary protein structure. Yeast concentration was held constant at 5% w/v across all trials.""",

    # 13. Data Structures Student Homework
    """My implementation of the B-Tree of order 5 is written in C++. Splitting full child nodes during insert required careful pointer manipulation. When a leaf node reaches 5 keys, the median key at index 2 is pushed up into the parent node, and two new children of 2 keys each are created. I wrote a unit test inserting 10,000 random integers and verifying the tree property with an in-order traversal that checks if elements remain strictly sorted. Valgrind reports zero memory leaks after running the destructor.""",

    # 14. Student Ethics in AI Essay
    """I don't think facial recognition should be used by law enforcement in public spaces without strict judicial warrants. Several studies, like Joy Buolamwini's Gender Shades project, proved that commercial face analysis algorithms have error rates up to 34% higher for darker-skinned women compared to lighter-skinned men. Relying on these tools to justify police stops or arrests just automates existing racial profiling under the guise of mathematical objectivity. If a human officer made that many false identifications, they'd face disciplinary review.""",

    # 15. Student Machine Learning Assignment Notes
    """For the Kaggle house price prediction task, I tried three baseline models: Ridge Regression, a 3-layer MLP, and XGBoost. The raw dataset had lots of missing values in `LotFrontage` and `Alley`, which I imputed using median values grouped by neighborhood. One-hot encoding the categorical variables blew up the feature dimension to 240 columns. XGBoost with a learning rate of 0.05 and max depth 4 scored an RMSE of 0.124 on the log-transformed sale price, comfortably beating the neural net which kept overfitting after epoch 30.""",

    # 16. Student Microservices Project Notes
    """In our microservice project, we built services for auth, submissions, and reports using Spring Boot and Docker. We used an API gateway for routing and Eureka server for service discovery. Monolithic architecture is simpler to deploy initially, but microservices allowed each team member to work on separate services independently. We used OpenFeign for HTTP communication between services and Prometheus with Grafana for monitoring container metrics. Setting up Docker Compose locally helped test inter-service communication before deployment.""",

    # 17. Student DevOps & Cloud Architecture Coursework
    """We configured a CI/CD pipeline using Jenkins to build and package our microservices into Docker images. Prometheus scrapes application metrics from the Spring Boot actuator endpoints, while Grafana dashboards display CPU, memory, and request latency in real time. We chose PostgreSQL for relational data and MongoDB for unstructured logs. Managing configuration across multiple services was challenging, but containerizing each service made deployment consistent across our local machines.""",

    # 18. Student Cloud Computing Assignment
    """Integrity AI is a microservice project. We used Jenkins, Docker, Prometheus, and Grafana in this project. Also we used Eureka server for discovery and an API gateway for reverse proxying. Monolithic architecture is often better for simple applications than microservice architecture because microservices are complex to manage, but microservices scale better. In microservices we used OpenFeign for communication between services.""",
]

# ---------------------------------------------------------------------------
# Core Academic Corpus: AI-Generated Samples (Class 1)
# Characteristics: Formulaic transitions ("In today's fast-paced world", "It is important to note"),
# didactic imperatives, thesis-conclusion symmetry, uniform sentence length (low burstiness),
# prescriptive modal verbs ("fosters a sense of", "crucial role", "delve into").
# ---------------------------------------------------------------------------
AI_CORPUS = [
    # 1. AI Essay on Cloud Computing
    """In today's rapidly evolving digital landscape, cloud computing plays a pivotal role in modern enterprise architecture. It is important to note that organizations are transitioning from traditional on-premises infrastructure toward scalable microservices solutions. Cloud platforms provide a multifaceted approach to resource allocation, enabling businesses to achieve seamless scalability and enhanced cost efficiency. Furthermore, containerization technologies such as Docker and orchestration tools like Kubernetes serve as a testament to the transformative power of modern software engineering. By fostering an environment of continuous integration and continuous deployment, enterprises can accelerate innovation while mitigating operational overhead. In conclusion, embracing cloud-native principles is essential for organizations seeking to navigate the complexities of the contemporary world.""",

    # 2. AI Technical Architecture Description
    """The proposed microservices architecture is designed to address the challenges of modern distributed systems. First and foremost, the system is decomposed into loosely coupled, independently deployable services. It is recommended to utilize a lightweight API gateway to handle authentication, rate limiting, and request routing across all downstream endpoints. Consequently, if a specific service experiences high traffic, it can be horizontally scaled without impacting other components. It is worth noting that asynchronous communication via message brokers ensures fault tolerance and decouples producers from consumers. In order to ensure data integrity, each service maintains its own dedicated database. In summary, this architectural paradigm provides a robust and resilient framework for enterprise software development.""",

    # 3. AI Essay on Artificial Intelligence Ethics
    """Artificial intelligence stands as a testament to human ingenuity, offering transformative potential across various sectors. However, the ethical implications of autonomous decision-making systems cannot be overstated. It is crucial to understand that algorithms trained on historical data frequently inherit and amplify societal biases. Furthermore, transparency and explainability play an essential role in fostering trust between automated systems and human stakeholders. A multifaceted approach involving robust regulatory frameworks, rigorous auditing mechanisms, and multidisciplinary collaboration is necessary to ensure fairness. In conclusion, as we continue to delve deeper into the modern era of machine learning, responsible stewardship must remain at the forefront of technological advancement.""",

    # 4. AI Explanation of Microservices vs Monolith
    """When comparing monolithic architectures to microservices, it is essential to consider the multifaceted nature of software scalability. In a monolithic system, all business logic and data access layers reside within a single codebase, which can simplify initial development. However, as applications grow in complexity, this unified structure often leads to tight coupling and deployment bottlenecks. In contrast, microservices architecture decomposes application logic into modular, domain-driven services that communicate over lightweight protocols. This approach allows development teams to work autonomously and deploy features independently. In summary, while microservices introduce operational complexity, they pave the way for superior flexibility and long-term scalability.""",

    # 5. AI Procedural Lab Guide
    """It is highly recommended to follow these step-by-step instructions to configure the continuous integration pipeline. First and foremost, navigate to the Jenkins dashboard and click on New Item to create a declarative pipeline. Specify the Git repository URL and verify that the authentication credentials are properly configured. Next, ensure that the Jenkinsfile contains distinct stages for building, testing, and containerizing the microservices. As shown below, executing unit tests before artifact generation prevents faulty code from reaching production environments. Once the build stage is complete, push the Docker image to the container registry. In conclusion, following best practices in CI/CD automation fosters an efficient and reliable delivery lifecycle.""",

    # 6. AI Essay on Cybersecurity
    """In today's interconnected world, cybersecurity has become a cornerstone of organizational resilience. It is worth noting that cyber threats have evolved from simple script-based intrusions into sophisticated, multi-vector attacks orchestrated by advanced persistent threat actors. Implementing a holistic defense-in-depth strategy is of paramount importance. Such a strategy encompasses perimeter firewalls, end-to-end encryption, multi-factor authentication, and continuous behavioral monitoring. Furthermore, employee training plays a vital role in preventing social engineering attacks. In conclusion, establishing a comprehensive security posture enables institutions to safeguard sensitive digital assets against ever-evolving vulnerabilities.""",

    # 7. AI Essay on Big Data and Analytics
    """Big data analytics has revolutionized the way modern enterprises extract actionable insights from vast information streams. In an era defined by rapid data generation, organizations must harness advanced data lakes and distributed processing frameworks. It is important to realize that the four V's of big data—volume, velocity, variety, and veracity—present distinct computational hurdles. By leveraging distributed computing engines like Apache Spark, organizations can analyze petabytes of unstructured text and transactional records in real time. This capability fosters informed decision-making and enhances strategic planning. In summary, big data serves as an invaluable asset in the contemporary knowledge economy.""",

    # 8. AI Essay on Renewable Energy
    """The global transition toward renewable energy sources plays a crucial role in mitigating the adverse consequences of climate change. Solar, wind, and hydroelectric power represent sustainable alternatives to conventional fossil fuels. It is essential to recognize that technological innovations in battery storage systems have substantially addressed the intermittency issues historically associated with solar and wind generation. Furthermore, smart grid integration allows utilities to balance load demands dynamically. In conclusion, fostering sustainable infrastructure is imperative for ensuring environmental preservation and long-term economic prosperity for future generations.""",

    # 9. AI Essay on Data Structures
    """Data structures form the foundational backbone of efficient computational problem solving. It is worth noting that selecting the appropriate data structure directly influences algorithmic time and space complexity. For instance, hash tables provide near-constant time complexity for search operations, making them quintessential for high-throughput caching systems. Conversely, balanced search trees ensure logarithmic worst-case bounds, which is crucial for applications requiring sorted order retrieval. In summary, a thorough understanding of foundational structures paves the way for designing elegant, high-performance software systems.""",

    # 10. AI Reflective Essay on Success and Discipline
    """Success does not always come from immediate talent; rather, it often stems from relentless dedication and daily discipline. In today's fast-paced society, many individuals feel pressured to achieve overnight results and compare themselves with others. However, progress does not require perfection. Taking small steps every day turns ordinary efforts into extraordinary accomplishments. Furthermore, encountering setbacks teaches us valuable lessons regarding patience, perseverance, and emotional resilience. In conclusion, remaining committed to continuous improvement fosters a mindset that empowers individuals to navigate life's inevitable challenges.""",

    # 11. AI Essay on Blockchain Technology
    """Blockchain technology has emerged as a disruptive paradigm that redefines digital trust and decentralized consensus. At its core, a blockchain functions as an immutable, distributed ledger maintained by peer-to-peer network nodes. It is crucial to note that cryptographic hashing and consensus mechanisms such as Proof of Stake ensure data integrity without requiring centralized intermediaries. This innovative framework paves the way for transparent supply chain tracking, secure digital identities, and decentralized financial systems. In conclusion, blockchain stands as a testament to the power of decentralized computing.""",

    # 12. AI Essay on Mobile Computing and 5G
    """The advent of fifth-generation mobile networks represents a monumental leap forward in telecommunications infrastructure. 5G technology offers unprecedented data throughput, ultra-low latency, and massive device connectivity. It is important to emphasize that these capabilities are essential for enabling cutting-edge applications such as autonomous vehicles, smart cities, and remote robotic surgery. Furthermore, network slicing allows operators to customize bandwidth allocations according to specific enterprise requirements. In conclusion, 5G fosters seamless digital connectivity in an increasingly interconnected global society.""",

    # 13. AI Essay on Agile Methodologies
    """Agile methodologies have transformed modern software development by prioritizing iterative collaboration and customer satisfaction over rigid procedural frameworks. It is worth noting that frameworks such as Scrum and Kanban empower cross-functional teams to respond dynamically to changing market demands. Regular sprint retrospectives foster a culture of continuous learning and incremental refinement. Furthermore, breaking down large deliverables into manageable user stories mitigates project risk and accelerates time-to-market. In summary, adopting an Agile mindset is indispensable for navigating modern software engineering complexities.""",

    # 14. AI Essay on Natural Language Processing
    """Natural Language Processing represents a quintessential intersection of computer science, linguistics, and artificial intelligence. In recent years, transformer architectures have fundamentally reshaped how machines comprehend human language. It is crucial to understand that self-attention mechanisms enable models to capture long-range contextual relationships within textual sequences. This breakthrough has led to substantial improvements in machine translation, sentiment analysis, and conversational interfaces. In conclusion, NLP serves as a powerful bridge connecting human thought with computational capability.""",

    # 15. AI Essay on DevOps Practices
    """DevOps bridges the historical divide between software development and IT operations, fostering an organizational culture of shared accountability. It is essential to recognize that automation lies at the very heart of successful DevOps implementations. Continuous integration and automated testing validate code quality incrementally, reducing deployment failures. Furthermore, infrastructure as code enables teams to provision and manage cloud environments programmatically. In conclusion, adopting DevOps practices paves the way for accelerated delivery cycles and superior operational reliability.""",
]


def _synthesize_variants(base_corpus: List[str], label: int, target_count: int = 100) -> List[Tuple[str, int]]:
    """
    Augments base texts through paragraph sampling, combination, and realistic slicing
    to produce a robust, well-distributed dataset for cross-validation.
    """
    samples = [(text.strip(), label) for text in base_corpus]
    random.seed(42)

    # Combine pairs of sentences or paragraphs to generate realistic diverse lengths
    while len(samples) < target_count:
        t1 = random.choice(base_corpus)
        t2 = random.choice(base_corpus)
        if t1 == t2:
            continue

        p1_sentences = [s.strip() for s in t1.split(".") if len(s.split()) > 3]
        p2_sentences = [s.strip() for s in t2.split(".") if len(s.split()) > 3]

        if not p1_sentences or not p2_sentences:
            continue

        # Sample a cohesive snippet
        slice1 = " ".join(random.sample(p1_sentences, min(len(p1_sentences), random.randint(2, 4))))
        slice2 = " ".join(random.sample(p2_sentences, min(len(p2_sentences), random.randint(2, 4))))
        combined = f"{slice1}. {slice2}."
        if len(combined.split()) >= 30:
            samples.append((combined, label))

    return samples[:target_count]


def load_dataset() -> Tuple[List[str], List[int]]:
    """
    Returns balanced training pairs (texts, labels) where:
      0 = Human-authored academic writing
      1 = AI-generated text (ChatGPT, Claude, Gemini style)
    """
    human_samples = _synthesize_variants(HUMAN_CORPUS, label=0, target_count=100)
    ai_samples = _synthesize_variants(AI_CORPUS, label=1, target_count=100)

    all_samples = human_samples + ai_samples
    random.seed(42)
    random.shuffle(all_samples)

    texts = [s[0] for s in all_samples]
    labels = [s[1] for s in all_samples]
    return texts, labels
