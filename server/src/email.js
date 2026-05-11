import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || 'juanbonal26@gmail.com';
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

let transporter = null;

function getTransporter() {
  if (!GMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
  }
  return transporter;
}

export async function verifyEmailConnection() {
  const t = getTransporter();
  if (!t) {
    console.warn('[email] GMAIL_APP_PASSWORD not set — email notifications disabled');
    return;
  }
  try {
    await t.verify();
    console.log(`[email] SMTP connection verified — alerts will be sent to ${GMAIL_USER}`);
  } catch (err) {
    console.error('[email] SMTP verification failed:', err.message);
  }
}

export async function sendBookingAlert(booking) {
  const t = getTransporter();
  if (!t) {
    console.warn('[email] GMAIL_APP_PASSWORD not set — skipping notification');
    return;
  }

  const now = new Date().toLocaleString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f3f6ff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6ff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 12px;margin-bottom:14px;">
                      <span style="color:#fff;font-size:14px;font-weight:700;letter-spacing:0.05em;">⚡ JB IT SOLUTIONS</span>
                    </div>
                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">New Booking Request</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">${now}</p>
                  </td>
                  <td align="right" valign="top">
                    <div style="background:rgba(255,255,255,0.2);border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:48px;font-size:22px;">📋</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                You have a new booking request through your client portal. Here are the details:
              </p>

              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #e5e9f5;border-radius:12px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr style="border-bottom:1px solid #e5e9f5;">
                        <td style="padding:14px 20px;width:36%;">
                          <span style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;font-family:monospace;">Customer</span>
                        </td>
                        <td style="padding:14px 20px;">
                          <span style="font-size:15px;font-weight:700;color:#111827;">${booking.customer_name}</span>
                        </td>
                      </tr>
                      <tr style="border-bottom:1px solid #e5e9f5;">
                        <td style="padding:14px 20px;">
                          <span style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;font-family:monospace;">Phone</span>
                        </td>
                        <td style="padding:14px 20px;">
                          <a href="tel:${booking.phone}" style="font-size:15px;font-weight:700;color:#4f46e5;text-decoration:none;font-family:monospace;">${booking.phone}</a>
                        </td>
                      </tr>
                      <tr style="border-bottom:1px solid #e5e9f5;">
                        <td style="padding:14px 20px;">
                          <span style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;font-family:monospace;">Service</span>
                        </td>
                        <td style="padding:14px 20px;">
                          <span style="font-size:15px;font-weight:700;color:#111827;">${booking.service_name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 20px;" valign="top">
                          <span style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.07em;font-family:monospace;">Notes</span>
                        </td>
                        <td style="padding:14px 20px;">
                          <span style="font-size:14px;color:#374151;line-height:1.6;">${booking.notes || '<em style="color:#9ca3af;">No additional notes</em>'}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="tel:${booking.phone}"
                      style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14px;font-weight:700;padding:13px 24px;border-radius:10px;text-decoration:none;letter-spacing:-0.01em;margin-right:10px;">
                      📞 Call ${booking.customer_name.split(' ')[0]}
                    </a>
                    <a href="sms:${booking.phone}"
                      style="display:inline-block;background:#f3f6ff;border:1px solid #e5e9f5;color:#374151;font-size:14px;font-weight:700;padding:13px 24px;border-radius:10px;text-decoration:none;letter-spacing:-0.01em;">
                      💬 Send SMS
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;font-size:13px;color:#92400e;line-height:1.55;">
                <strong>⚡ Tip:</strong> Respond within 24 hours to give your client the best experience. All services come with a 7–14 day warranty.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #e5e9f5;background:#f8faff;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;font-family:monospace;">
                Booking ID #${booking.id} · Submitted via JB IT Solutions portal<br/>
                This is an automated notification. Do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New Booking Request — JB IT Solutions\n\nCustomer: ${booking.customer_name}\nPhone: ${booking.phone}\nService: ${booking.service_name}\nNotes: ${booking.notes || 'None'}\n\nReceived: ${now}\nBooking ID: #${booking.id}`;

  try {
    await t.sendMail({
      from: `"JB IT Solutions" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `📋 New Booking: ${booking.service_name} — ${booking.customer_name}`,
      text,
      html,
    });
    console.log(`[email] Booking alert sent for #${booking.id}`);
  } catch (err) {
    console.error('[email] Failed to send booking alert:', err.message);
  }
}
