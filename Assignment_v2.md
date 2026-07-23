# Guised Up Full-Stack Developer Take-Home Project — Version 2

> **Canonical machine-readable project requirements.**
>
> The **Frozen Assessment Requirements** below have been audited against the original five-page assessment PDF. They must not be weakened, removed, or reinterpreted.
>
> Additional product features may be added later under **Version 2 Product Enhancements**, but only after every frozen assessment requirement has been completed and verified.

## 1. Context

This confidential take-home project is designed to demonstrate how the candidate thinks, not merely what they know. The Technical Solution Document will be reviewed as carefully as the code, so important decisions must be explained.

Guised Up is building a social platform that helps people show up authentically online—without curated highlight reels or follower-count anxiety. The product emphasizes real people and real connections.

The candidate is being assessed as a founding engineer. This is not merely a CRUD exercise.

The work should be completed quickly using AI agentic tools, with the brief stating an expectation of reaching 80%+ efficiency.

If blocked, the candidate may contact the founder through LinkedIn or WhatsApp using the number from which the assessment was received, subject to the clarification limit below.

# Part I — Frozen Assessment Requirements

## 2. Project

Build the **Guised Up Real Connections Feed** as a take-home full-stack project.

- Time limit: **1 full day / 8 hours**
- Role: **Full-Stack Developer**
- Stack: **React Native, Laravel PHP, Python, SQL, and a vector database**
- AI agentic tools are **required**; not using them is a red flag
- Complete all four parts:
  - Technical Solution Document
  - Backend API
  - React Native Feed Screen
  - SQL challenge

## 3. Product Goal

Create a personalized **Real Connections Feed** that does **not** rank posts using engagement metrics such as likes, shares, or comment counts.

The feed must rank content using all four of the following signals:

- **Authenticity signals:** Posts with fewer filters, less-polished images, and genuine text should rank higher.
- **Relationship depth:** Content from people the user genuinely interacts with—not merely follows—should surface first.
- **Semantic similarity:** Vector embeddings should identify topics the user cares about.
- **Time decay:** Newer content should be preferred, but not at the expense of relevance.

Users must also be able to search posts using natural-language semantic search rather than keyword matching.

The assessment brief gives the example:

> “funny travel stories from last week”

That query should return semantically relevant posts rather than posts selected only through matching keywords.

## 4. Part A — Technical Solution Document

Before writing application code, produce a Technical Solution Document for the Real Connections Feed.

The TSD must include:

- A system architecture diagram
  - A rough ASCII or diagram.io sketch is acceptable
- Database schema design
  - Tables
  - Relationships
  - Indexes
- The vector-embedding implementation
- The selected vector database and the reason for choosing it
- API design
  - Endpoints
  - Request shapes
  - Response shapes
  - Authentication strategy
- Feed-ranking logic explained first in plain English
- Feed-ranking pseudocode
- The AI agentic tools used and how they helped
  - Usage must be reported honestly
- Important trade-offs
- Important assumptions

Accepted formats:

- PDF
- Notion page
- Markdown inside the repository

The repository must contain or reference the TSD through one of the following:

- `/docs/TSD.pdf`
- `/docs/TSD.md`
- A Notion link in the README

The TSD should be as long as it needs to be, and not a word more.

## 5. Part B — Backend API

Laravel PHP must be the main API layer. Python may be used for machine-learning or embedding tasks.

### 5.1 Required endpoints

| Endpoint | Requirement |
|---|---|
| `POST /api/posts` | Create a post containing text and an optional image URL. Automatically generate and store a vector embedding for the post content. |
| `GET /api/feed` | Return the authenticated user’s personalized feed using the ranking logic documented in the TSD. Return paginated results with 20 posts per page. |
| `GET /api/search?q={query}` | Perform natural-language search across posts using vector similarity. Return no more than the top 10 semantically relevant results. |
| `POST /api/interactions` | Record a view, reply, or reaction against a post. These interactions feed the relationship-depth signal. |

### 5.2 Authentication

- Use Laravel Sanctum token-based authentication.
- Seed at least two test users.

### 5.3 Relational database

- Use MySQL or PostgreSQL.
- Include every migration required to reproduce the database schema.

### 5.4 Vector database

Use one of the permitted vector databases:

- Pinecone
- Weaviate
- pgvector
- Qdrant
- Chroma

Explain the chosen vector database and the reason for choosing it in the TSD.

### 5.5 Embeddings

Embeddings may be produced using:

- OpenAI
- sentence-transformers
- Another suitable embedding model
- A clearly documented simple hash-based mock when API credits are unavailable

If a mock is used, clearly explain:

- That it is a mock
- Its limitations
- The intended real implementation
- How the mock would be replaced

### 5.6 Tests

Write at least three unit or feature tests covering the most critical logic.

## 6. Part C — React Native Feed Screen

Build one React Native screen: the **Feed Screen**.

The Feed Screen must:

- Fetch and display `GET /api/feed`
- Display the paginated feed
- Implement infinite scrolling
- Load the next page when the user reaches the bottom
- Display the following on every post card:
  - Avatar placeholder
  - Username
  - Post text
  - Relative time
  - Reaction button
- Include a search bar at the top
- Call `GET /api/search` from the search bar
- Display search results inline
- Handle the following states gracefully:
  - Loading
  - Empty
  - Error
- Use intentional custom styling rather than default React Native styling

The screen does not need to be pixel-perfect, but UI quality matters and the result should feel intentional.

## 7. Part D — SQL Challenge

Create:

`/sql/queries.sql`

The file must contain raw SQL for all four queries below.

### D1 — Most active users

Return the top 10 most active users during the last seven days.

Rank users by their total interactions:

- Views
- Replies
- Reactions

### D2 — Posts from strongest relationships

For a supplied `user_id`, return all posts from the users with whom that user interacts most.

Requirements:

- Order by interaction frequency in descending order
- Include only posts created during the last 30 days

### D3 — Viewed posts with zero reactions

Find posts that:

- Have been viewed more than 100 times
- Have zero reactions

Return:

- `post_id`
- `author_id`
- `view_count`
- `created_at`

### D4 — Potential spam detection

Find users who created more than 20 posts during the last 24 hours.

Return:

- The user’s email
- The user’s post count

The SQL queries will be executed against a real database and evaluated for:

- Correctness
- Efficiency
- Readability

## 8. Evaluation

| Dimension | Weight | What is evaluated |
|---|---:|---|
| Technical Solution Document | 25% | Deep comprehension of the brief and clearly explained decisions |
| Backend quality | 25% | Clean architecture, a correct SQL schema, working vector search, and tests |
| React Native screen | 20% | Functionality, structure, edge-case handling, and intentional presentation |
| SQL queries | 15% | Correctness, efficiency, and readability against a real database |
| AI tool usage | 15% | Evidence of an intelligent AI-augmented workflow and fast execution |

## 9. Instant Disqualifiers

The following are instant disqualifiers:

- No Technical Solution Document
- Copy-pasted boilerplate without evidence of understanding
- Missing migrations
- An unreproducible database schema
- No explanation video
- Plagiarised work

## 10. Submission

Complete all of the following submission steps:

1. Create a private GitHub repository named:

   `Guised Up-assessment-[yourname]`

2. Push the complete code to the private repository.

3. Include a clear README containing:

   - Setup instructions
   - Instructions for running the project
   - `.env.example`

4. Include the Technical Solution Document through one of the accepted locations or references.

5. Include:

   `/sql/queries.sql`

6. Send the following to the founder through LinkedIn DM or the email from which the assessment was received:

   - Private GitHub repository link
   - TSD link

7. Use this subject line:

   `[Guised Up Application] Your Name — Full-Stack Assessment`

8. Make an explanatory video demonstrating the completed application and explaining its features.

## 11. Rules and Constraints

- Libraries, frameworks, and normal development tools are allowed.
- AI agentic tools must be used.
- AI agentic tool usage must be documented in the TSD.
- Only one clarifying question may be sent to the founder.
- The clarifying question must be sent through LinkedIn DM.
- The project is confidential and must not be shared.
- Partial submissions are acceptable.
- If the submission is incomplete, the README must explain what could not be completed because of time.
- Vector integration may be mocked when API credits are unavailable.
- Any vector mock and its intended real replacement must be clearly explained.
- The submitted work must not be plagiarised.

# Part II — Version 2 Product Enhancements

## 12. Activation Rule

Version 2 Product Enhancements must not be implemented until the frozen assessment project has reached 100% verified completion.

Reaching 100% means that:

- Every requirement in Part I is implemented or completed.
- Required automated tests pass.
- Required Docker services build and run.
- Required migrations and seeders execute successfully.
- All required API endpoints have been verified.
- The React Native Feed Screen has been verified.
- All four SQL queries execute successfully against PostgreSQL.
- README instructions match the implemented project.
- The TSD matches the implemented architecture and behavior.
- The explanation video has been created.
- The private GitHub repository has been prepared.
- The final submission materials are ready.

Optional enhancements, refinements, or experiments must not be counted toward completion of the frozen assessment requirements.

## 13. Enhancement Change Control

When Version 2 work begins:

- Preserve every frozen requirement in Part I.
- Do not replace or weaken assignment-required behavior.
- Mark every new feature as a Version 2 enhancement.
- Keep assignment-required behavior independently testable.
- Keep the feed-ranking implementation replaceable.
- Keep search logic separate from feed-ranking logic.
- Keep API integration, application state, presentation components, and styling separated in the React Native application.
- Keep design tokens and theme decisions centralized.
- Update documentation, tests, API contracts, and environment examples whenever an enhancement affects them.
- Update `Project_User_Story_Roadmap_v2.md` alongside Version 2 implementation.
- Do not claim a Version 2 feature is complete without implementation and verification evidence.

## 14. Planned Version 2 Enhancements

The detailed Version 2 enhancement list is intentionally deferred until the frozen assessment project reaches 100%.

When approved, each enhancement must be added here with:

- A unique identifier
- A clear description
- Its user value
- Acceptance criteria
- Architecture impact
- API impact
- Database impact
- Mobile impact
- Security and privacy considerations
- Automated-test requirements
- Verification evidence
- Documentation requirements

The corresponding implementation sequence, dependencies, status, and evidence must be maintained separately in:

`Project_User_Story_Roadmap_v2.md`

## 15. Requirements Authority

- Part I is the frozen assessment contract.
- Part I is synchronized with the original assessment PDF.
- Part II contains separately identified post-assessment enhancements.
- An enhancement may extend Part I but may not contradict, weaken, or silently reinterpret it.
- Routine implementation and verification must use this Markdown document.
- The original PDF must not be opened, extracted, or parsed during routine work.
- The PDF should be consulted only when the repository owner explicitly requests another synchronization audit.
- This file must not be modified unless the repository owner explicitly authorizes a requirements update.
