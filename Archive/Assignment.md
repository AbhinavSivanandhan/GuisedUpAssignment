## Frozen Requirements

### Project

Build the **Guised Up Real Connections Feed** as a take-home full-stack project.

* Time limit: **1 full day / 8 hours**
* Role: **Full-Stack Developer**
* Stack: **React Native, Laravel PHP, Python, SQL, and a vector database**
* AI agentic tools are **required**
* Complete all four parts: **TSD, backend API, React Native screen, and SQL challenge**

### Product Goal

Create a personalized feed that does **not** rank posts using likes, shares, or comment counts.

The feed must rank content using:

* Authenticity signals
* Relationship depth
* Semantic similarity
* Time decay

Users must also be able to search posts using natural-language semantic search rather than keyword matching.

### Part A — Technical Solution Document

The TSD must be produced before writing code and include:

* System architecture diagram
* Database schema with tables, relationships, and indexes
* Vector embedding implementation
* Selected vector database and the reason for choosing it
* API endpoints, request/response shapes, and authentication strategy
* Feed-ranking logic in plain English
* Feed-ranking pseudocode
* AI agentic tools used and how they helped
* Trade-offs and assumptions

Accepted format:

* PDF
* Notion page
* Markdown inside the repository

Required repository location or reference:

* `/docs/TSD.pdf`
* `/docs/TSD.md`
* Notion link in the README

### Part B — Backend API

Use Laravel for the main API layer. Python may be used for embedding or ML tasks.

Required endpoints:

| Endpoint                    | Requirement                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `POST /api/posts`           | Create a post with text and an optional image URL. Generate and store its vector embedding automatically.            |
| `GET /api/feed`             | Return the authenticated user’s personalized feed using the documented ranking logic. Paginate at 20 posts per page. |
| `GET /api/search?q={query}` | Perform natural-language vector similarity search and return the top 10 semantically relevant posts.                 |
| `POST /api/interactions`    | Record a view, reply, or reaction against a post for the relationship-depth signal.                                  |

Additional backend requirements:

* Laravel Sanctum token authentication
* At least two seeded test users
* MySQL or PostgreSQL
* Reproducible migrations
* Any of Pinecone, Weaviate, pgvector, Qdrant, or Chroma
* OpenAI, sentence-transformers, another embedding model, or a clearly documented hash-based mock
* At least three unit or feature tests covering critical logic

### Part C — React Native Feed Screen

Build one React Native screen that:

* Fetches and displays `GET /api/feed`
* Supports pagination and infinite scrolling
* Displays an avatar placeholder, username, post text, relative time, and reaction button on every post card
* Includes a search bar that calls `GET /api/search`
* Shows search results inline
* Handles loading, empty, and error states gracefully
* Uses intentional custom styling rather than default React Native styles

### Part D — SQL Challenge

Create `/sql/queries.sql` containing raw SQL for:

* **D1:** Top 10 most active users during the last seven days, ranked by total views, replies, and reactions.
* **D2:** For a supplied `user_id`, return posts from the users they interact with most. Order by interaction frequency descending and include only posts from the last 30 days.
* **D3:** Find posts with more than 100 views and zero reactions. Return `post_id`, `author_id`, `view_count`, and `created_at`.
* **D4:** Find users who created more than 20 posts during the last 24 hours. Return their email and post count.

### Submission

* Create a private GitHub repository named `Guised Up-assessment-[yourname]`
* Push the complete code
* Include a clear README containing setup instructions, run instructions, and `.env.example`
* Include the TSD
* Include `/sql/queries.sql`
* Send the GitHub repository link and TSD link to the founder through LinkedIn DM or the email from which the assessment was received
* Use this subject line: `[Guised Up Application] Your Name — Full-Stack Assessment`
* Make an explanatory video demonstrating the completed app and its features

### Evaluation

| Dimension                   | Weight |
| --------------------------- | -----: |
| Technical Solution Document |    25% |
| Backend quality             |    25% |
| React Native screen         |    20% |
| SQL queries                 |    15% |
| AI tool usage               |    15% |

### Instant Disqualifiers

* No Technical Solution Document
* Copy-pasted boilerplate without evidence of understanding
* Missing migrations or an unreproducible database schema
* No explanation video
* Plagiarised work

### Rules and Constraints

* Libraries, frameworks, and normal development tools are allowed
* AI agentic tools must be used and documented in the TSD
* Only one clarifying question may be sent to the founder
* The project is confidential and must not be shared
* Partial submissions are acceptable if unfinished work is explained in the README
* Vector integration may be mocked when API credits are unavailable, but the mock and intended implementation must be clearly explained
* The submitted work must not be plagiarised

These requirements are now frozen exactly to the supplied brief.
