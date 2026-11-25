# Kesar & Co. Support Copilot — Anjali Kumari

## 1. Summary

What I built: I built an n8n customer-support copilot that receives email data through a webhook, classifies the customer's intent with an LLM, and routes the request to the appropriate support path. It uses Google Sheets for order/FAQ lookup, audit logging, and ticket records.
Platform and LLM used: n8n, Google Gemini Chat Model, Google Sheets.

Time spent (approx. hours): [Add your actual time spent.]

What works / what doesn't: The webhook, LLM classification, structured output, and Switch-based routing were configured. The other route was tested and a row appeared in the Audit Log sheet. The order-status route was reported working. Product-query, return/refund, and complaint paths still need end-to-end evidence before they can be marked fully verified. Replies are intended to remain drafts for human review; the workflow does not automatically send customer emails.

## 2. Architecture

## 2. Architecture

The Kesar & Co. Support Copilot is built using n8n, Google Sheets, and Google Gemini. It automates customer email classification, order and FAQ lookup, support ticket creation, and response drafting.

### Workflow

1. **Webhook:** Receives incoming customer email data, including sender email, subject, and message.
2. **AI Classification:** Google Gemini analyzes the email and identifies its intent, such as order_status, product_query, return_refund, complaint, or other.
3. **Structured Output Parser:** Converts the AI response into a structured format so the workflow can process it reliably.
4. **Audit Logging:** Stores email and classification details in the Google Sheets Audit Log.
5. **Switch Node:** Routes the email according to its classified intent.
6. **AI Agent:** Handles relevant customer queries using Google Sheets tools:
   - `get_order`: Retrieves order information from the Orders sheet.
   - `search_faq`: Searches the FAQ sheet for product and policy information.
7. **Intent-specific Actions:**
   - **Order Status:** Checks order details and prepares a response draft.
   - **Product Query:** Searches the FAQ and prepares an answer. Missing information is escalated.
   - **Return/Refund:** Checks order details and applicable policy information.
   - **Complaint:** Creates a support ticket in the Tickets sheet for human follow-up.
   - **Other:** Records the email in the Audit Log without generating a customer reply.

### Architecture Diagram

Customer Email
      |
      v
   Webhook
      |
      v
Google Gemini - Intent Classification
      |
      v
Structured Output Parser
      |
      v
   Audit Log
      |
      v
  Switch Node
      |
      +---- Order Status ----> AI Agent ----> get_order
      |
      +---- Product Query ---> AI Agent ----> search_faq
      |
      +---- Return/Refund ---> AI Agent ----> Order + FAQ Lookup
      |
      +---- Complaint -------> Create Ticket
      |
      +---- Other -----------> Audit Log

### Technologies Used

- **n8n:** Workflow automation and intent-based routing.
- **Google Gemini:** AI-powered email intent classification and response generation.
- **Google Sheets:** Stores orders, FAQs, audit records, and support tickets.
- **Webhook:** Receives incoming customer email data.

**Workflow Screenshot Path**(C:\Users\Anjali\OneDrive\Desktop\kesar-ai-copilot-assignment\screenshots\workflow.png)

## 3. Setup — how someone else can run this

Accounts/credentials needed: An n8n account or self-hosted n8n instance; Google account with access to the support spreadsheet; Google Gemini API access. Do not put API keys or credentials in this README.
How to import the workflow: In n8n, open Workflows → Import from File (or paste the exported workflow JSON). Save the imported workflow.
Where to configure credentials: In n8n, open Credentials and configure the Google Sheets OAuth credential and Gemini credential. Open each relevant node and select the correct credential, spreadsheet, and sheet tab. Confirm the webhook URL and activate the workflow for production use.
How to run the 25 test emails: Use the supplied data/test_emails.json and the provided scripts/send_test_emails.py if included in the submission. Configure the script with the n8n production webhook URL, then run it in the project environment. If the script is not included, send each JSON test email to the webhook using an HTTP POST request. Inspect n8n Executions and the Audit Log/Tickets sheets after each run. Do not treat a webhook acknowledgement alone as proof that the workflow completed successfully.

## 4. Prompts

Classification prompt
The classifier's purpose is to return structured intent data, not to answer the customer directly. Use the following final prompt if it matches the prompt configured in the Basic LLM Chain:
You are the email-intent classifier for Kesar & Co., an Indian D2C Ayurvedic skincare brand.

Read the incoming customer email and classify it into exactly one of:
order_status, product_query, return_refund, complaint, other.

Extract the order ID if one is explicitly present. Do not invent an order ID.
Also identify secondary_intent when clearly relevant, sentiment, language,
confidence (0 to 1), and a short factual summary.

Use:
- order_status for delivery, tracking, or order progress questions.
- product_query for product information, ingredients, usage, or general policy questions.
- return_refund for cancellation, return, replacement, or refund requests.
- complaint for damaged, leaking, wrong, missing, delayed-with-escalation,
  or other expressions of dissatisfaction.
- other for messages that do not fit the above categories, such as partnerships.

Return only the required structured output. Do not write a customer reply.
If the intent is ambiguous, choose the best-supported category and use a
lower confidence score. Never invent facts.

Agent/system prompt
You are Kesar & Co.'s customer support assistant.

For order-related questions, use get_order.
For product, shipping, payment, return, refund and company-policy questions,
use search_faq.

Never invent order details, policies, prices, delivery dates or product claims.

For order details, verify that the customer's sender email matches the
registered email for the order before revealing information.

For medical questions, do not provide medical advice. Recommend consulting
a doctor or dermatologist.

If a customer reports a skin reaction, advise them to stop using the product
immediately, consult a doctor, and escalate to a human.

If information is missing from the FAQ, do not guess. Escalate to a human.

Never ask customers for OTP, CVV, card PIN or passwords.

Use polite, clear and helpful language. Prepare a reply draft for review;
do not send an email automatically.

Model settings: Google Gemini Chat Model was connected to the Basic LLM Chain and AI Agent. Record the exact model name, temperature, and other generation settings from the saved n8n nodes before final submission; those exact values were not available in the workflow details used to prepare this README.

## 5. Key decisions and assumptions

Low-confidence classifications: The classifier returns a confidence value. Low-confidence or ambiguous cases should be sent for human review rather than treated as safe for automatic handling. The exact numeric threshold should be configured and documented after confirming the current workflow setting.
Duplicate tickets: Use a stable email identifier (email_id) to check whether a ticket has already been created before appending another one. A unique ticket ID alone does not prevent duplicate tickets. Confirm this idempotency check is implemented before claiming duplicate prevention is complete.
Correct customer/order matching: The order lookup uses both the order ID and sender email. Order details should only be disclosed when both match the same order.
FAQ-grounded answers: The agent is instructed to use search_faq for product and policy questions and not guess when the FAQ has no answer.
Other assumptions: The FAQ sheet is the approved source of truth for product and policy answers. Replies remain drafts and risky cases require human review. No customer email should be sent automatically.

## 6. Scaling to 1,000 emails/day

At 1,000 emails per day, the first constraints are likely to be LLM rate limits, workflow execution capacity, and Google Sheets API throughput. I would place incoming messages in a durable queue and process them with controlled concurrency. I would add retries with exponential backoff for temporary API failures, dead-letter handling for messages that repeatedly fail, and idempotency keys based on email ID. I would monitor classification confidence, failure rate, processing time, token usage, cost per resolved email, and human-escalation volume. For higher volume, I would move operational records from Google Sheets to a database and keep Sheets for reporting. I would also use a smaller/cheaper model for straightforward classification and reserve stronger model calls for complex cases, subject to evaluation.

## 7. Product-thinking questions (≤150 words each)

Auto-send vs. draft: I would initially auto-send only low-risk, FAQ-backed answers such as basic product availability or standard shipping information, and only after testing shows consistently reliable results. Order-specific, refund, cancellation, complaint, damaged-item, missing-item, medical, and low-confidence cases should remain drafts for human approval. I would start with a confidence threshold around 0.90, then adjust it using a reviewed test set rather than treating the score as a guarantee. I would also require the answer to be supported by the FAQ or verified order data. The current workflow is draft-first; automatic sending is not enabled.

Cost: Exact cost depends on the Gemini model and its current input/output token rates. For a planning estimate, assume 1,000 input tokens and 300 output tokens per email. At 1,000 emails/day for 30 days, that is 30 million input tokens and 9 million output tokens per month. Monthly cost = (30 × input-token price per 1M) + (9 × output-token price per 1M). Per-email cost = monthly cost ÷ 30,000. I would replace the token-price variables with the rates for the exact Gemini model selected in n8n and measure actual token usage before presenting this as a final cost estimate.

Success metric: I would track the human-verified resolution rate in week one: the percentage of incoming emails correctly handled without a correction or customer follow-up. It reflects both answer quality and operational usefulness. I would break it down by intent so a high overall score cannot hide a failing complaint or refund path. I would pause automation if incorrect customer/order disclosures occur, if unsupported policy answers are sent, or if the error rate rises above the agreed safety limit. Since the current workflow is draft-first, I would evaluate draft acceptance and correction rate before enabling any auto-send behavior.

Failure experience: A wrong answer can confuse the customer, promise an incorrect refund or delivery date, or expose private order information. To limit damage, I keep replies as drafts, verify order ID plus sender email, ground policy answers in the FAQ, and escalate uncertain or sensitive cases. I would log the input, classification, action, and error so a human can investigate. If a mistake reaches a customer, support should acknowledge it, correct the information promptly, and handle any resulting issue through a human agent. I would monitor repeated failure patterns and disable the affected route until fixed.

Don't automate: I would keep final decisions on skin reactions and medical/safety-related complaints manual. These cases can involve individual health circumstances and require empathy and judgment that a workflow should not replace. The copilot can identify the message, provide the approved immediate safety guidance, create a high-priority ticket, and bring the case to a trained human. It should not diagnose a condition, recommend treatment, or decide compensation without review.

## 8. How I used AI tools
I used ChatGPT as a development assistant to help understand n8n nodes, structure prompts, troubleshoot expressions and routing, and prepare test payloads and documentation. I used Google Gemini through n8n as the LLM for email classification and agent-based support handling. My own judgment was used to decide the five intent categories, connect the correct Google Sheets tools, define when the workflow should escalate, and keep customer replies from being sent automatically. I also checked node execution results and Google Sheets output rather than relying only on the webhook response.

## 9. If I had one more week

9. If I had one more week
- Complete and document end-to-end tests for all 25 supplied test emails, including edge cases and low-confidence classifications.
- Add and verify duplicate-ticket prevention using email_id.
- Ensure every incoming email is audited exactly once and that final action/status fields are recorded.
- Add a clear human-approval queue for complaints, refunds, medical/safety concerns, and uncertain answers.
- Add retries, error notifications, monitoring, and a small evaluation report for classification accuracy and draft quality.
- Export the final n8n workflow JSON and include screenshots of the full canvas and successful route executions.
