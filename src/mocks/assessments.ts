// ---------------------------------------------------------------------------
// Dummy assessment questions
// ---------------------------------------------------------------------------

export interface AssessmentQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // index of correct option
  explanation?: string
}

export interface Assessment {
  id: string
  title: string
  description: string
  totalQuestions: number
  timeLimit: number // minutes
  passingScore: number // percentage
  questions: AssessmentQuestion[]
}

export const dummyAssessment: Assessment = {
  id: "assessment-001",
  title: "Backend Developer - Technical Assessment",
  description: "Test your knowledge on Node.js, databases, and system design.",
  totalQuestions: 10,
  timeLimit: 30,
  passingScore: 70,
  questions: [
    {
      id: "q-1",
      question: "Which of the following is NOT a characteristic of REST API?",
      options: [
        "Stateless",
        "Client-Server architecture",
        "Uses HTTP methods",
        "Maintains client state on server",
      ],
      correctAnswer: 3,
      explanation: "REST APIs are stateless; the server does not maintain client state.",
    },
    {
      id: "q-2",
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
      explanation: "Binary search divides the search space in half each iteration, resulting in O(log n).",
    },
    {
      id: "q-3",
      question: "Which database operation is used to retrieve data?",
      options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
      correctAnswer: 2,
      explanation: "SELECT is the SQL command used to retrieve data from a database.",
    },
    {
      id: "q-4",
      question: "What does ACID stand for in database transactions?",
      options: [
        "Atomicity, Consistency, Isolation, Durability",
        "Access, Control, Integrity, Distribution",
        "Availability, Concurrency, Index, Data",
        "Authentication, Cipher, Identity, Debug",
      ],
      correctAnswer: 0,
      explanation:
        "ACID ensures reliable database transactions with Atomicity, Consistency, Isolation, and Durability.",
    },
    {
      id: "q-5",
      question: "Which HTTP status code indicates a resource was created successfully?",
      options: ["200 OK", "201 Created", "202 Accepted", "204 No Content"],
      correctAnswer: 1,
      explanation: "HTTP 201 Created is returned when a resource is successfully created.",
    },
    {
      id: "q-6",
      question: "What is the primary purpose of middleware in Express.js?",
      options: [
        "To replace the database",
        "To process requests and responses in the request-response cycle",
        "To define HTML templates",
        "To manage CSS styling",
      ],
      correctAnswer: 1,
      explanation: "Middleware functions process requests and responses in Express.js.",
    },
    {
      id: "q-7",
      question: "Which data structure uses LIFO (Last In First Out)?",
      options: ["Queue", "Stack", "Tree", "Graph"],
      correctAnswer: 1,
      explanation: "A Stack uses LIFO where the last element added is the first one removed.",
    },
    {
      id: "q-8",
      question: "What is the purpose of environment variables?",
      options: [
        "To store CSS values",
        "To store configuration values like API keys and database URLs",
        "To define HTML elements",
        "To declare global functions",
      ],
      correctAnswer: 1,
      explanation:
        "Environment variables store sensitive configuration like API keys and connection strings.",
    },
    {
      id: "q-9",
      question: "Which of the following is a NoSQL database?",
      options: ["PostgreSQL", "MySQL", "MongoDB", "Oracle"],
      correctAnswer: 2,
      explanation: "MongoDB is a popular NoSQL document-based database.",
    },
    {
      id: "q-10",
      question: "What is the purpose of JWT tokens?",
      options: [
        "To store user passwords",
        "To provide stateless authentication and authorization",
        "To replace HTTPS",
        "To manage database connections",
      ],
      correctAnswer: 1,
      explanation: "JWT tokens provide stateless authentication without server-side session storage.",
    },
  ],
}
