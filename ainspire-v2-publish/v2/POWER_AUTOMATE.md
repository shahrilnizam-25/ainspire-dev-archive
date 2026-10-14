# Power Automate Email Setup

## Configure the app

The server owns recipient routing; the browser cannot choose `to` or `cc`.

- `POWER_AUTOMATE_TRIGGER_URL`: the HTTP-trigger URL copied from the cloud flow. Treat it as a secret; configure it in local `.env` or Sites runtime secrets, never in source control or browser code.
- `AINSPIRE_NOTIFICATION_EMPLOYEE`: default `shahril.abdullah@tm.com.my`.
- `AINSPIRE_NOTIFICATION_SUPERVISOR`: default `ctsoo@tm.com.my`.
- `AINSPIRE_NOTIFICATION_HR`: default `noorain.ismail@tm.com.my`.
- `AINSPIRE_PORTAL_URL`: default `https://ainspire.sooct2003.chatgpt.site`.

The recipient variables are server-side routing configuration. Results and project-interest messages copy the supervisor and HR. Learning milestones and reminders copy only the supervisor. No recipient depends on a sample Staff ID.

## Create the cloud flow

1. Create an automated cloud flow with the **When an HTTP request is received** trigger. Restrict trigger access to the available tenant-authenticated option where supported; otherwise keep the trigger URL secret and rotate it if exposed.
2. Use the trigger's generated schema, or allow these fields: `eventId`, `eventType`, `to`, `cc`, `subject`, `htmlBody`, and nullable `reminder` with `dueAt`, `to`, `cc`, `subject`, and `htmlBody`.
3. Add **Send an email (V2)**. Map **To** to `to`, **Cc** to `cc`, **Subject** to `subject`, and **Body** to `htmlBody`. The HTML is built server-side with the portal's dark navy, cyan, and violet presentation.
4. When `reminder` is not null, add **Delay until** using `reminder.dueAt`, then a second **Send an email (V2)** using the reminder's recipient, subject, and HTML fields. This is scheduled seven days after assessment results are ready.
5. Save the flow, copy its HTTP POST URL into `POWER_AUTOMATE_TRIGGER_URL`, and test from Employee View.

The app sends these event types: `assessment.results_ready`, `project.interest`, and `learning.milestone`. Results email includes the profile summary and learning links; project interest is confirmation only, not an assignment; learning milestones omit the employee's free-text evidence. Every email includes the portal link.

The current POC stores learning progress in the browser, so a scheduled reminder cannot reliably detect completion from another device or cancel itself when a milestone is later recorded. The seven-day reminder therefore sends as scheduled. To suppress completed learners' reminders, add a persistent progress store and have the flow check it before the reminder send. Power Automate/Exchange tenant policy must also permit delivery to the configured recipients.