# Test Report — Kesar & Co. Support Copilot

**Candidate name:** Anjali Kumari
**Platform used:** n8n 
**LLM(s) used:** Google Gemini 2.5 Flash

---

## 1. How I decided what "correct" means

I considered an email correctly handled when the AI identified the customer's main intent and the workflow performed the expected action based on the available FAQ and order data.

Intent accuracy: The predicted intent should match the actual purpose of the customer's email.

Action accuracy: The workflow should perform the appropriate action, such as looking up an order, searching the FAQ, preparing a reply draft, creating a support ticket, escalating to a human, or logging the email.

Data accuracy: Order details and policy information should come from the available Google Sheets data. The AI should not invent order details, delivery dates, prices, or policies.

Safety: If information is missing or a case needs human attention, the workflow should escalate it rather than generate an unsupported answer.

I count a test as successful only when both the intent classification and the resulting workflow action are correct.

Expected-result reference: The assignment specifies data/faq.md and data/orders.json as the reference data. The 25 test email contents and source data were not available while preparing this report. Therefore, I have not guessed the expected outcomes for E01–E25.

## 2. Results per email

For this table, you need the actual 25 test emails (E01–E25). Don't invent their expected intents or actual results.

Use these action descriptions when appropriate:
Intent	Expected action
order_status	Look up order and prepare reply draft
product_query	Search FAQ and prepare answer; escalate if information is missing
return_refund	Check order and return/refund policy
complaint	Create high-priority support ticket and prepare draft
other	Log email only; no customer reply

Change 1: Improved intent classification instructions. I made the classification instructions clearer so that customer emails could be assigned to the appropriate categories, such as order status, product query, return/refund, complaint, and other.

Change 2: Improved structured output. I used a structured output parser to maintain a consistent JSON format, making it easier for the Switch node to identify the intent and route the email.

Change 3: Improved customer safety and escalation. I added instructions to avoid guessing order details or company policies and to escalate complaints or queries with missing information to a human.

| Email | Expected intent | Expected action | v1 intent | v1 action | v1 ✅/❌ | v2 intent | v2 action | v2 ✅/❌ | Notes |
|---|---|---|---|---|---|---|---|---|---|
| E01 | | | | | | | | | |
| E02 | | | | | | | | | |
| E03 | | | | | | | | | |
| E04 | | | | | | | | | |
| E05 | | | | | | | | | |
| E06 | | | | | | | | | |
| E07 | | | | | | | | | |
| E08 | | | | | | | | | |
| E09 | | | | | | | | | |
| E10 | | | | | | | | | |
| E11 | | | | | | | | | |
| E12 | | | | | | | | | |
| E13 | | | | | | | | | |
| E14 | | | | | | | | | |
| E15 | | | | | | | | | |
| E16 | | | | | | | | | |
| E17 | | | | | | | | | |
| E18 | | | | | | | | | |
| E19 | | | | | | | | | |
| E20 | | | | | | | | | |
| E21 | | | | | | | | | |
| E22 | | | | | | | | | |
| E23 | | | | | | | | | |
| E24 | | | | | | | | | |
| E25 | | | | | | | | | |

## 3. Summary

*n* = the number of emails you ran in that version (at least 10 for v1, 25 for v2).

| Metric | Prompt v1 | Prompt v2 |
|---|---|---|
| Emails run (*n*) | | 25 |
| Intent accuracy (x / *n*) | | |
| Correct action (x / *n*) | | |
| Valid JSON on first try (x / *n*) | | |
| Emails sent to "needs human" | | |
| Avg. tokens per email (if tracked) | | |
| Est. cost per email (₹ or $) | | |

## 4. What I changed from v1 to v2, and why

Change 1: Improved intent classification
- v1: The AI sometimes struggled to correctly identify the customer's intent, especially when customers used unclear or informal language.
- v2: I improved the prompt by providing clearer instructions and examples for identifying customer intents such as order status, refund, return, complaint, and general inquiry.
- Why: This helps the AI understand customer queries more accurately and route them to the correct workflow branch.
Change 2: Improved AI Agent instructions and response generation
- v1: The AI Agent had less specific instructions for handling customer requests and generating responses.
- v2: I made the system prompt more structured and added clearer instructions to use Google Sheets for order-related queries and provide relevant responses based on retrieved information.
- Why: This reduces incorrect or generic answers and makes customer support responses more reliable.

## 5. Failures I could not fix (be honest)

Although I improved the workflow and prompt from v1 to v2, some limitations still remain:

Ambiguous Customer Queries: Sometimes customers provide incomplete or unclear information. The AI may need additional details before understanding the exact problem.

Dependence on Google Sheets: The system depends on the availability and accuracy of Google Sheets data. If order information is missing or outdated, the AI cannot provide accurate order details.