# QRPrint Customer Web Interface Examination Checklist

Use this after the merchant installer has started the local QRPrint server.

## 1. Confirm the merchant side is reachable

- Open `http://localhost:8787/health` on the merchant PC.
- Confirm the response says `ok: true`.
- Get the merchant QR payload from `/api/merchant/qr` using the local API token if configured.
- Confirm the QR URL uses the merchant PC LAN IP, not `localhost`, before scanning from a phone.

## 2. Page-load and performance checks

Test the customer page on:

- Chrome desktop.
- Edge desktop on Windows.
- Android Chrome.
- iPhone Safari if available.

Verify:

- First screen loads in under 3 seconds on shop Wi-Fi.
- The page clearly says QRPrint, the merchant name, and PDF-only MVP limitations.
- No console errors appear in browser developer tools.
- Slow network mode in DevTools still shows readable loading and error states.

## 3. Responsive design checks

Use browser developer tools device emulation for:

- 360 × 800 Android phone.
- 390 × 844 iPhone.
- 768 × 1024 tablet.
- 1366 × 768 desktop.

Verify:

- Upload controls fit without horizontal scrolling.
- Price summary remains visible and readable.
- Buttons are at least finger-tappable size.
- Material 3 dark surfaces have enough contrast.
- Error messages are visible near the relevant form field.

## 4. QR code workflow checks

From the merchant interface, verify:

1. Create or refresh the merchant customer QR code.
2. Scan it from a phone.
3. Confirm the URL opens the expected merchant page.
4. Confirm the merchant ID in the URL matches `QRPRINT_MERCHANT_ID`.
5. Save or download the QR image when that UI action is added.
6. Print the QR poster and scan it again from paper.

For design customization later, test:

- Blue brand color.
- QR code on dark and light poster backgrounds.
- Shop name shown near the QR.
- Short instruction text such as `Scan to upload and pay for printing`.

## 5. Upload and pricing workflow checks

Run these scenarios:

| Scenario | Expected result |
| --- | --- |
| Upload one valid PDF under 25 MB | File is accepted and price is calculated. |
| Upload five PDFs under 25 MB each | Files are accepted as one job. |
| Upload six PDFs | Customer sees a clear 5-file limit error. |
| Upload a DOCX/JPG/PNG | Customer sees a PDF-only MVP error. |
| Upload one PDF over 25 MB | Customer sees a 25 MB limit error. |
| Select B/W, 1 copy | Price uses ₹2/page. |
| Select color, 1 copy | Price uses ₹10/page. |
| Increase copies | Price multiplies by copy count. |
| Leave name or phone empty | Customer cannot proceed and sees clear guidance. |

## 6. Razorpay payment workflow checks

In Razorpay sandbox mode:

1. Create a job from the customer page.
2. Start Razorpay checkout.
3. Complete a successful test payment.
4. Confirm the merchant job status changes from `pending_payment` to `payment_successful` and then `queued_for_printing`.
5. Try a failed/cancelled payment and confirm the customer sees a safe retry state.
6. Confirm the merchant app does not print until manual approval.

## 7. Manual print and deletion checks

For a paid job:

1. Merchant clicks `Print`.
2. Job changes to `printing`.
3. Printer receives the PDF.
4. Job changes to `completed` after print call succeeds.
5. Uploaded PDF files are deleted from `.qrprint-data/spool`.
6. Customer sees the final collection message: `Your print is ready. Show your collection PIN at the counter.`

For a failed print:

- Confirm the file is kept for merchant retry.
- Confirm the merchant can retry or cancel.
- Confirm failure reason is visible.

## 8. Offline-capability checks

Because QRPrint is offline-first except payment:

- Keep merchant PC and phone on the same Wi-Fi.
- Disconnect internet after the customer page has loaded and after payment is not required.
- Confirm local merchant health and job list are still reachable over LAN.
- Confirm already-paid jobs can be manually printed without internet.
- Confirm new Razorpay payments do not work without internet and show a clear payment connectivity message.

## 9. Merchant-facing vs customer-facing elements

Merchant-facing interface should show:

- Dashboard metrics.
- Printer status.
- QR generation.
- Pricing settings.
- Job queue.
- Manual print/reprint/cancel/delete controls.
- Local server settings and API-token status.

Customer-facing interface should show only:

- Merchant/shop identity.
- Upload PDF action.
- Print settings.
- Price calculator.
- Razorpay payment.
- Job status and collection PIN.
- Collection instructions.

Do not expose merchant controls, printer internals, API tokens, or local file paths on the customer page.

## 10. Browser tools to use

- **Chrome DevTools Network tab:** verify uploads go to the merchant LAN URL, not cloud storage.
- **Chrome DevTools Console:** catch JavaScript errors and failed API calls.
- **Chrome DevTools Lighthouse:** check basic performance and accessibility.
- **Responsive mode:** test phone layouts before real-device scanning.
- **Application tab:** verify no sensitive document data is stored in local storage.
