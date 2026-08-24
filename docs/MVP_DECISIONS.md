# QRPrint MVP Decisions

These decisions lock version 1 toward a practical, testable print-shop workflow.

## Architecture
- Connection: hybrid strategy, with LAN/same-Wi-Fi as the first implementation and tunnel fallback later.
- Offline rule: local upload, job management, printing, and deletion must work without internet; only Razorpay payment requires internet.
- Merchant app: Electron desktop app for Windows 10/11.
- Customer app: Next.js customer portal deployed to Vercel.
- Local backend: Node.js HTTP/WebSocket service embedded in the merchant app.
- Database: SQLite on the merchant PC.

## MVP Workflow
1. Customer scans the in-shop QR code.
2. Customer opens the QRPrint customer web page.
3. Customer uploads PDFs only, up to 25 MB per file and 5 files per job.
4. Customer enters name and phone number.
5. Customer selects A4 print settings and sees an INR price estimate.
6. Customer pays with Razorpay.
7. Merchant receives a paid job over LAN.
8. Merchant manually approves and prints.
9. Merchant marks job complete.
10. QRPrint deletes document files immediately after successful print completion.
11. Customer sees: “Your print is ready. Show your collection PIN at the counter.”

## Deferred Features
- Cloud tunnel fallback implementation.
- Auto-print.
- DOCX/JPG/PNG support.
- UPI QR payment.
- Refunds.
- GST/tax engine.
- WhatsApp/SMS/email notifications.
- Cloud sync.
- Auto-updates.
- Antivirus scanning.
- Multi-shop admin dashboard.

## Product Defaults
- Currency: INR.
- B/W price: ₹2/page.
- Color price: ₹10/page.
- Paper size: A4 first.
- Copies: multiply linearly.
- Duplex discount: merchant configurable later.
- Customer details: name + phone.
- Collection PIN: required.
- Merchant security: simple dashboard PIN plus local API token.
- Job metadata retention: 30 days.
- Unpaid upload cleanup: 30 minutes.
- Failed print files: keep until merchant retries or cancels.
- Theme: Material 3-inspired dark mode by default, light mode optional later.
- Brand color: blue.
