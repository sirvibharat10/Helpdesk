import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statuses = ["NEW", "OPEN", "PROCESSING", "RESOLVED", "CLOSED"] as const;
const categories = ["GENERAL_QUESTION", "TECHNICAL_QUESTION", "REFUND_REQUEST"] as const;
const sources = ["EMAIL", "MANUAL"] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate() {
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  return new Date(now - Math.floor(Math.random() * ninetyDaysMs));
}

const tickets = [
  // GENERAL_QUESTION
  { subject: "How do I change my account email?", body: "I need to update the email associated with my account. Can you walk me through the steps?", fromEmail: "alice.morgan@gmail.com", fromName: "Alice Morgan", status: "NEW", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "What are your support hours?", body: "I'd like to know when your support team is available. Do you offer 24/7 support?", fromEmail: "bob.chen@outlook.com", fromName: "Bob Chen", status: "CLOSED", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "Can I have multiple users on one account?", body: "We're a small team of 5. Can we all access the same account or do we need separate logins?", fromEmail: "claire.dubois@company.fr", fromName: "Claire Dubois", status: "RESOLVED", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "How do I cancel my subscription?", body: "I would like to cancel my plan at the end of this billing cycle. How do I do that without being charged again?", fromEmail: "david.kim@naver.com", fromName: "David Kim", status: "OPEN", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "Can I export my data?", body: "I want to export all my ticket history and customer data to CSV. Is there a built-in export feature?", fromEmail: "eva.martinez@hotmail.com", fromName: "Eva Martinez", status: "PROCESSING", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Is there a mobile app available?", body: "I've been looking for a mobile version of your helpdesk product. Is there an iOS or Android app?", fromEmail: "frank.nkosi@africa.co.za", fromName: "Frank Nkosi", status: "NEW", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "How do I add a team member?", body: "I'd like to invite a new agent to our workspace. Where do I find that option?", fromEmail: "grace.xu@techco.cn", fromName: "Grace Xu", status: "RESOLVED", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "What payment methods do you accept?", body: "Does your platform accept UPI, PayPal, and credit cards? I'd like to know before upgrading.", fromEmail: "harry.singh@indiamail.in", fromName: "Harry Singh", status: "CLOSED", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "How do I reset my password?", body: "I forgot my password and the reset link doesn't seem to be arriving in my inbox. Can you help?", fromEmail: "irene.popov@mail.ru", fromName: "Irene Popov", status: "RESOLVED", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Can I change my subscription plan mid-month?", body: "I want to upgrade from Basic to Pro. Will I be charged the full month or prorated?", fromEmail: "james.lee@kakao.kr", fromName: "James Lee", status: "OPEN", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "How do I set up email notifications?", body: "I want to receive an email whenever a new ticket is created. How do I configure that?", fromEmail: "karen.white@proton.me", fromName: "Karen White", status: "NEW", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "What happens to my data if I cancel?", body: "If I cancel my subscription, do you delete all my data immediately or is there a grace period?", fromEmail: "luca.ferrari@gmail.it", fromName: "Luca Ferrari", status: "CLOSED", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "How do I view my invoice history?", body: "I need to download invoices for the last 6 months for accounting purposes.", fromEmail: "mia.nakamura@softbank.jp", fromName: "Mia Nakamura", status: "RESOLVED", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "Do you offer a free trial?", body: "Before committing to a paid plan, I'd like to try the platform. Is there a free trial option?", fromEmail: "noah.osei@telkom.gh", fromName: "Noah Osei", status: "NEW", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Can I use my own domain for the helpdesk?", body: "We'd like to use support.ourcompany.com as the helpdesk URL. Is custom domain supported?", fromEmail: "olivia.brown@startup.io", fromName: "Olivia Brown", status: "PROCESSING", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "How do I merge duplicate tickets?", body: "I see two tickets created for the same issue. How do I merge them into one?", fromEmail: "peter.jones@bigcorp.com", fromName: "Peter Jones", status: "OPEN", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Can I assign tickets to specific agents?", body: "We have different teams for different issues. Can I route tickets automatically based on category?", fromEmail: "quinn.taylor@support.co", fromName: "Quinn Taylor", status: "PROCESSING", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "How do I set ticket priority?", body: "Some issues are urgent. How do I mark a ticket as high priority so it gets handled first?", fromEmail: "rachel.green@helpdesk.us", fromName: "Rachel Green", status: "NEW", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Can I set auto-close for resolved tickets?", body: "We'd like tickets to auto-close after 7 days of inactivity once resolved. Is this configurable?", fromEmail: "sam.wilson@corp.au", fromName: "Sam Wilson", status: "RESOLVED", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "How long is data retained after closing?", body: "If a ticket is closed, how long do you keep the conversation history on file?", fromEmail: "tina.huang@alibaba.com", fromName: "Tina Huang", status: "CLOSED", category: "GENERAL_QUESTION", source: "EMAIL" },

  // TECHNICAL_QUESTION
  { subject: "API integration returning 401 unauthorized", body: "I'm calling the tickets API with a Bearer token but getting 401. My token is valid and hasn't expired.", fromEmail: "aaron.dev@codebase.io", fromName: "Aaron Dev", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Webhook not triggering on ticket update", body: "I set up a webhook URL but it never fires when ticket status changes. I've verified the URL is correct.", fromEmail: "beth.qa@techfirm.com", fromName: "Beth QA", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Login page blank on Safari 16", body: "When I open the login page on Safari 16 on macOS Ventura, the page is blank. Chrome works fine.", fromEmail: "carlos.ux@design.mx", fromName: "Carlos UX", status: "OPEN", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Dashboard not loading after update", body: "After the latest update yesterday, the dashboard shows a spinner indefinitely. I've cleared cache.", fromEmail: "diana.ops@sysadmin.de", fromName: "Diana Ops", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Error 500 on ticket creation endpoint", body: "POST /api/tickets is returning 500 Internal Server Error consistently. This started 2 hours ago.", fromEmail: "ethan.be@backend.io", fromName: "Ethan BE", status: "OPEN", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "File attachment upload failing", body: "When attaching a PDF over 5MB to a ticket, the upload fails silently with no error message.", fromEmail: "fiona.support@helpco.uk", fromName: "Fiona Support", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "GraphQL query timing out on large datasets", body: "Our GraphQL queries time out when fetching more than 1000 tickets. Is there pagination support?", fromEmail: "george.api@dataheavy.com", fromName: "George API", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "2FA codes not working after phone change", body: "I changed my phone number and now my 2FA codes are invalid. I can't access my account.", fromEmail: "helen.auth@secureco.com", fromName: "Helen Auth", status: "OPEN", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Images not rendering in email replies", body: "When we send replies that contain inline images, recipients see broken image icons instead.", fromEmail: "ivan.email@mailsrv.ru", fromName: "Ivan Email", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "JWT token expiry too short causing logout", body: "Users are being logged out after 15 minutes. Where can we configure the token expiry duration?", fromEmail: "julia.sec@securenet.eu", fromName: "Julia Sec", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Cannot connect to SMTP server for outbound mail", body: "Outbound emails are not sending. The SMTP settings look correct but we keep getting a timeout error.", fromEmail: "kevin.infra@cloudsrv.com", fromName: "Kevin Infra", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Localization strings not loading in French", body: "After switching the UI language to French, some menu items still show in English.", fromEmail: "lucia.i18n@localize.fr", fromName: "Lucia I18n", status: "OPEN", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Mobile layout broken on Android Chrome", body: "On Android Chrome, the ticket form overlaps with the navigation bar making it unreadable.", fromEmail: "mike.mobile@appdev.in", fromName: "Mike Mobile", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Notification emails going to spam folder", body: "All ticket notification emails are being flagged as spam by Gmail. Is SPF/DKIM configured?", fromEmail: "nina.dmarc@deliverability.com", fromName: "Nina DMARC", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "OAuth SSO redirect loop on login", body: "When using Google SSO, users are stuck in an endless redirect loop without ever logging in.", fromEmail: "omar.sso@identityco.com", fromName: "Omar SSO", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "PDF export contains garbled text", body: "When exporting a ticket thread to PDF, some Unicode characters appear as question marks or boxes.", fromEmail: "priya.pdf@doctech.in", fromName: "Priya PDF", status: "OPEN", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Queue processing jobs stuck in pending", body: "Background job queue has 500 jobs stuck in PENDING state for over 3 hours. No workers seem to pick them up.", fromEmail: "quentin.devops@jobqueue.io", fromName: "Quentin DevOps", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Rate limiting returns 429 too frequently", body: "We're being rate limited at 50 requests per minute, but our plan should allow 500. Please investigate.", fromEmail: "rosa.api@ratelimit.net", fromName: "Rosa API", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Search results returning stale data", body: "After updating a ticket's status, the search results still show the old status for several minutes.", fromEmail: "sergio.search@elasticco.es", fromName: "Sergio Search", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Timezone mismatch in ticket timestamps", body: "Ticket timestamps show UTC but our agents are in IST. How do we configure timezone per user?", fromEmail: "tanvi.tz@timetech.in", fromName: "Tanvi TZ", status: "CLOSED", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "CSV import fails on special characters", body: "Importing a CSV with Japanese characters in customer names fails with a character encoding error.", fromEmail: "uri.import@datamigr.il", fromName: "Uri Import", status: "NEW", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Ticket auto-assignment rule not working", body: "I set up a rule to auto-assign tickets with keyword 'billing' to the billing team, but it's not triggering.", fromEmail: "vera.rules@automation.io", fromName: "Vera Rules", status: "OPEN", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Widget chat not initializing on Shopify", body: "Our Shopify store has the chat widget installed but it never loads. Console shows a CORS error.", fromEmail: "will.shopify@ecomm.uk", fromName: "Will Shopify", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "X-Frame-Options blocking embedded view", body: "We're trying to embed the helpdesk in our internal portal via iframe but getting X-Frame-Options blocked.", fromEmail: "xena.embed@intranet.com", fromName: "Xena Embed", status: "NEW", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "YAML config not recognized after import", body: "I uploaded a YAML configuration file for SLA rules but the system says the format is unsupported.", fromEmail: "yusuf.config@sla.tr", fromName: "Yusuf Config", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Zero-downtime deployment causing session drops", body: "During rolling restarts, active user sessions are being killed. Is there sticky session support?", fromEmail: "zara.devops@cluster.io", fromName: "Zara DevOps", status: "CLOSED", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Attachment preview not working for DOCX files", body: "PDF previews work fine but Word DOCX files show a generic icon with no inline preview.", fromEmail: "adam.files@cloudfile.com", fromName: "Adam Files", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Browser back button breaks ticket view", body: "After opening a ticket and pressing back, the list page is empty. Requires a hard refresh to reload.", fromEmail: "bella.ux@uibugs.com", fromName: "Bella UX", status: "OPEN", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Cannot delete ticket via API", body: "DELETE /api/tickets/:id returns 403 Forbidden even when called with admin credentials.", fromEmail: "chad.api@developer.net", fromName: "Chad API", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Database connection pool exhausted under load", body: "Under high load, the app starts throwing 'too many connections' errors from PostgreSQL.", fromEmail: "dani.dba@postgres.io", fromName: "Dani DBA", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "MANUAL" },

  // REFUND_REQUEST
  { subject: "Charged twice for same order #INV-4821", body: "My bank statement shows two identical charges of $49.99 on July 1st. My invoice number is INV-4821.", fromEmail: "emily.charged@finance.com", fromName: "Emily Charged", status: "NEW", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Subscription billed after cancellation", body: "I cancelled my subscription on June 15th but was still charged on July 1st. Please refund.", fromEmail: "felix.cancel@billing.com", fromName: "Felix Cancel", status: "OPEN", category: "REFUND_REQUEST", source: "MANUAL" },
  { subject: "Wrong plan charged — upgraded to wrong tier", body: "I clicked to upgrade to Standard but was billed for Enterprise. I need a partial refund immediately.", fromEmail: "gina.wrongplan@email.com", fromName: "Gina WrongPlan", status: "PROCESSING", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Refund request for unused annual subscription", body: "I signed up for the annual plan by mistake. I meant to choose monthly. Can I get a refund for the difference?", fromEmail: "henry.annual@corp.org", fromName: "Henry Annual", status: "RESOLVED", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Payment taken but account not activated", body: "I paid $99 on June 30th but my account is still showing as inactive. Please refund or activate.", fromEmail: "isla.inactive@startup.co", fromName: "Isla Inactive", status: "NEW", category: "REFUND_REQUEST", source: "MANUAL" },
  { subject: "Promotional discount not applied at checkout", body: "I had a 30% discount coupon but it wasn't applied when I checked out. I paid full price.", fromEmail: "jake.coupon@deals.com", fromName: "Jake Coupon", status: "OPEN", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Refund for duplicate account charges", body: "Our finance team noticed we have been billed for 2 accounts under the same company domain. One is a duplicate.", fromEmail: "kate.finance@enterprise.com", fromName: "Kate Finance", status: "PROCESSING", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Annual plan purchased in wrong currency", body: "I'm based in the EU and was charged in USD instead of EUR. The conversion rate caused an overpayment.", fromEmail: "luis.currency@spain.es", fromName: "Luis Currency", status: "RESOLVED", category: "REFUND_REQUEST", source: "MANUAL" },
  { subject: "Charged for seats I never used", body: "I was billed for 10 seats but only 3 users have ever logged in. Can I get a refund for the unused seats?", fromEmail: "mona.seats@teamco.com", fromName: "Mona Seats", status: "CLOSED", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Service outage during billing period — partial refund", body: "There was a 3-day outage last month. We couldn't use the service. I'd like a prorated refund for those days.", fromEmail: "neil.outage@service.io", fromName: "Neil Outage", status: "NEW", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Unauthorized charge from our credit card", body: "We received a charge that we did not authorize. Our card details may have been compromised. Please investigate.", fromEmail: "olivia.fraud@securepay.com", fromName: "Olivia Fraud", status: "OPEN", category: "REFUND_REQUEST", source: "MANUAL" },
  { subject: "Refund for educational institution discount", body: "We qualify for the 50% educational discount but were charged the full price. Please apply the discount retroactively.", fromEmail: "paul.edu@university.ac.uk", fromName: "Paul Edu", status: "PROCESSING", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Quarterly plan charged monthly by mistake", body: "I chose quarterly billing but I'm being charged every month. I'd like the extra charges refunded.", fromEmail: "quinn.billing@freelance.net", fromName: "Quinn Billing", status: "RESOLVED", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Refund request — competitor switch", body: "We've decided to move to a competitor. Can we get a prorated refund for the remaining 4 months of our plan?", fromEmail: "rachel.switch@migrate.com", fromName: "Rachel Switch", status: "CLOSED", category: "REFUND_REQUEST", source: "MANUAL" },
  { subject: "Trial converted to paid without warning", body: "My free trial ended and I was auto-charged without clear warning. I would like a full refund.", fromEmail: "sam.trial@freelancer.io", fromName: "Sam Trial", status: "NEW", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Tax incorrectly added to invoice", body: "We're a registered business and should be tax-exempt. Tax was applied incorrectly. Please issue a revised invoice.", fromEmail: "tanya.tax@b2b.eu", fromName: "Tanya Tax", status: "OPEN", category: "REFUND_REQUEST", source: "MANUAL" },
  { subject: "Renewal charge after account deletion", body: "I deleted my account 3 weeks ago but just received a renewal charge. This is an error and I want a full refund.", fromEmail: "umar.deleted@gone.com", fromName: "Umar Deleted", status: "PROCESSING", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Price increase not communicated before renewal", body: "My plan renewed at a higher price than before with no prior notification. This is unacceptable.", fromEmail: "vera.price@consumer.org", fromName: "Vera Price", status: "RESOLVED", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Accidentally purchased wrong add-on", body: "I meant to add 5 extra agent seats but clicked the 50-seat add-on by mistake. Please refund the difference.", fromEmail: "will.addon@team.com", fromName: "Will Addon", status: "CLOSED", category: "REFUND_REQUEST", source: "MANUAL" },
  { subject: "Refund for failed integration purchase", body: "I paid for the Salesforce integration but it has never worked. After 2 weeks of troubleshooting, I want a refund.", fromEmail: "xia.integration@crm.cn", fromName: "Xia Integration", status: "NEW", category: "REFUND_REQUEST", source: "EMAIL" },

  // Mixed continued
  { subject: "How do I archive old tickets?", body: "We have thousands of old closed tickets. Is there a bulk archive feature to clean up the dashboard?", fromEmail: "yoshi.archive@japan.jp", fromName: "Yoshi Archive", status: "OPEN", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Can I add custom fields to tickets?", body: "We need an 'Order Number' field on every ticket. Is custom field creation supported?", fromEmail: "zoe.custom@ecommerce.com", fromName: "Zoe Custom", status: "PROCESSING", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "Search not finding tickets by customer phone", body: "Our agents search by phone number but the search returns no results. Is phone number indexed for search?", fromEmail: "alex.search@callcenter.com", fromName: "Alex Search", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "How do I set up SLA policies?", body: "We need first-response SLAs of 2 hours for high-priority tickets. Where do I configure this?", fromEmail: "bella.sla@enterprise.com", fromName: "Bella SLA", status: "RESOLVED", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "Canned responses not saving correctly", body: "When I create a canned response and save it, it disappears on next login. Seems like a session issue.", fromEmail: "charlie.canned@support.com", fromName: "Charlie Canned", status: "OPEN", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Bulk update not applying to all selected tickets", body: "I selected 50 tickets and bulk-changed status to 'Resolved', but only 12 were actually updated.", fromEmail: "diana.bulk@ops.com", fromName: "Diana Bulk", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "How do I configure ticket tags?", body: "I'd like to tag tickets with labels like 'VIP', 'urgent', 'billing'. Is there a tag management system?", fromEmail: "ethan.tags@label.io", fromName: "Ethan Tags", status: "NEW", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Email thread not grouping correctly", body: "Replies to a ticket are creating new separate tickets instead of being threaded under the original.", fromEmail: "faye.thread@emailco.com", fromName: "Faye Thread", status: "OPEN", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Report shows incorrect open ticket count", body: "Our reports dashboard says 42 open tickets but the list view shows 67. There is a discrepancy.", fromEmail: "gary.report@analytics.com", fromName: "Gary Report", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "How do I set up a knowledge base article?", body: "I want to add FAQ articles that agents can reference when responding. How do I create KB articles?", fromEmail: "hannah.kb@knowledge.com", fromName: "Hannah KB", status: "CLOSED", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Agent cannot see tickets assigned to team", body: "One of our agents can log in fine but cannot see any tickets even though they are assigned to the support team.", fromEmail: "igor.perms@access.ru", fromName: "Igor Perms", status: "OPEN", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Ticket status not updating via API PATCH", body: "I send PATCH /api/tickets/:id with status: 'RESOLVED' and get 200 OK, but the ticket still shows as OPEN.", fromEmail: "jade.api@devtest.com", fromName: "Jade API", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "Do you have a reseller program?", body: "We're an IT consultancy and would like to resell your helpdesk solution to our clients. Do you have a partner program?", fromEmail: "kevin.resell@partner.com", fromName: "Kevin Resell", status: "NEW", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Customer satisfaction survey not sending", body: "After tickets are closed, the CSAT survey email should auto-send but customers report not receiving it.", fromEmail: "lisa.csat@satisfaction.com", fromName: "Lisa CSAT", status: "OPEN", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "AI suggested reply is in wrong language", body: "The AI suggested reply function is responding in English even though the customer's original message was in Spanish.", fromEmail: "marco.ai@language.es", fromName: "Marco AI", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "How do I configure auto-replies for after hours?", body: "Outside of business hours, we want an automatic reply telling customers our response time. How do I set this up?", fromEmail: "nancy.autoreply@afterhours.com", fromName: "Nancy AutoReply", status: "NEW", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "Duplicate email notifications for same ticket", body: "Agents are receiving multiple email notifications for the same ticket update. It's very noisy.", fromEmail: "omar.notif@spamcheck.com", fromName: "Omar Notif", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Refund for accidental annual plan upgrade", body: "My colleague accidentally upgraded us to the annual Enterprise plan. We want to downgrade and get a refund.", fromEmail: "pam.accidental@mistake.com", fromName: "Pam Accidental", status: "OPEN", category: "REFUND_REQUEST", source: "MANUAL" },
  { subject: "IP whitelist not accepting CIDR notation", body: "I'm trying to whitelist 192.168.1.0/24 but the field only accepts individual IPs. Is CIDR range notation supported?", fromEmail: "raj.security@network.in", fromName: "Raj Security", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Can customers track their own ticket status?", body: "We'd like customers to log in to a self-service portal and see their open tickets. Is this supported?", fromEmail: "sue.portal@selfservice.com", fromName: "Sue Portal", status: "RESOLVED", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "Transaction fee refund — payment processor error", body: "Due to a payment processor error on your end, I was charged an additional $3.50 transaction fee. Please refund.", fromEmail: "tom.fee@payment.net", fromName: "Tom Fee", status: "NEW", category: "REFUND_REQUEST", source: "EMAIL" },
  { subject: "Report CSV export contains extra blank rows", body: "Every CSV export I download has 200+ blank rows appended at the bottom, making it hard to parse.", fromEmail: "uma.csv@dataanalyst.com", fromName: "Uma CSV", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "VPN users cannot access helpdesk", body: "Agents connecting through our company VPN cannot load the helpdesk. Direct connections work fine.", fromEmail: "victor.vpn@corporate.com", fromName: "Victor VPN", status: "OPEN", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "What is the uptime SLA for your platform?", body: "Before signing an enterprise contract, we need to know your guaranteed uptime percentage and SLA terms.", fromEmail: "wendy.sla@enterprise.org", fromName: "Wendy SLA", status: "CLOSED", category: "GENERAL_QUESTION", source: "EMAIL" },
  { subject: "XML API response format causing parse errors", body: "Our legacy system expects XML responses but the API only returns JSON. Is there an XML mode available?", fromEmail: "xavier.xml@legacy.com", fromName: "Xavier XML", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Year-end audit log export needed", body: "For compliance, we need a full audit log of all admin actions taken in 2025. How do I export this?", fromEmail: "yvonne.audit@compliance.eu", fromName: "Yvonne Audit", status: "OPEN", category: "GENERAL_QUESTION", source: "MANUAL" },
  { subject: "Zoom integration not creating tickets from calls", body: "We set up the Zoom integration but missed calls are not creating tickets automatically as expected.", fromEmail: "zack.zoom@calltrack.com", fromName: "Zack Zoom", status: "PROCESSING", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Cannot add CC recipients to ticket replies", body: "When replying to a ticket, I want to CC our manager. There's no CC field visible in the reply box.", fromEmail: "anna.cc@teamwork.com", fromName: "Anna CC", status: "NEW", category: "TECHNICAL_QUESTION", source: "EMAIL" },
  { subject: "Branding customization not reflecting in emails", body: "I uploaded our company logo in branding settings but outgoing emails still show the default logo.", fromEmail: "ben.brand@marketing.com", fromName: "Ben Brand", status: "RESOLVED", category: "TECHNICAL_QUESTION", source: "MANUAL" },
  { subject: "How do I handle GDPR deletion requests?", body: "A customer has requested deletion of all their personal data. Is there a GDPR data erasure tool built in?", fromEmail: "cara.gdpr@privacy.eu", fromName: "Cara GDPR", status: "OPEN", category: "GENERAL_QUESTION", source: "EMAIL" },
];

async function main() {
  console.log(`Seeding ${tickets.length} tickets...`);

  const agent = await prisma.user.findFirst({ where: { role: "AGENT" } });

  let created = 0;
  for (const t of tickets) {
    const assignedToId = Math.random() > 0.5 && agent ? agent.id : undefined;
    const createdAt = (() => {
      const now = Date.now();
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      return new Date(now - Math.floor(Math.random() * ninetyDaysMs));
    })();

    await prisma.ticket.create({
      data: {
        subject: t.subject,
        body: t.body,
        fromEmail: t.fromEmail,
        fromName: t.fromName,
        status: t.status as any,
        category: t.category as any,
        source: t.source as any,
        createdAt,
        assignedToId,
      },
    });
    created++;
    if (created % 10 === 0) console.log(`  Created ${created}/${tickets.length} tickets...`);
  }

  console.log(`✓ Seeded ${created} tickets successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
