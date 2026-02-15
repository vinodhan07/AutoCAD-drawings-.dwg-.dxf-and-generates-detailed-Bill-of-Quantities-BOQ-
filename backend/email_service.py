"""
Gmail API Email Service — sends BOQ reports to the logged-in user.

Uses the user's own Google OAuth access token to send email via Gmail API.
"""

import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


def _build_boq_html(boq_data: list, grand_total: float) -> str:
    """Build a styled HTML email body with the BOQ table."""

    rows = ""
    for item in boq_data:
        total_display = f"₹{item['total']:,.2f}" if item['total'] > 0 else "—"
        total_color = "#82b868" if item['total'] > 0 else "#a69db4"

        rows += f"""
        <tr>
            <td style="padding:12px 8px; border-bottom:1px solid #ede8f5; text-align:center;
                       font-family:Arial,sans-serif; color:#8b7ec8; font-size:14px; font-weight:600;
                       width:40px; vertical-align:top;">
                {str(item['item_no']).zfill(2)}
            </td>
            <td style="padding:12px 8px; border-bottom:1px solid #ede8f5; font-weight:600;
                       color:#3d3250; font-size:14px; width:140px; vertical-align:top;
                       word-wrap:break-word;">
                {item['component']}
            </td>
            <td style="padding:12px 8px; border-bottom:1px solid #ede8f5; text-align:right;
                       font-family:Arial,sans-serif; color:#3d3250; font-weight:600;
                       font-size:14px; width:100px; vertical-align:top; white-space:nowrap;">
                {item['quantity']:,.2f}
            </td>
            <td style="padding:12px 8px; border-bottom:1px solid #ede8f5; text-align:center;
                       font-family:Arial,sans-serif; color:#7a7088; font-size:12px;
                       text-transform:uppercase; width:50px; vertical-align:top;">
                {item['unit']}
            </td>
            <td style="padding:12px 8px; border-bottom:1px solid #ede8f5; text-align:right;
                       font-family:Arial,sans-serif; color:#3d3250; font-size:14px;
                       width:110px; vertical-align:top; white-space:nowrap;">
                ₹{item['rate']:,.2f}
            </td>
            <td style="padding:12px 8px; border-bottom:1px solid #ede8f5; text-align:right;
                       font-family:Arial,sans-serif; font-weight:700;
                       color:{total_color}; font-size:13px;
                       width:210px; vertical-align:top; white-space:nowrap;">
                {total_display}
            </td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#faf7f2; font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f2;">
            <tr>
                <td align="center" style="padding:40px 16px;">
                    <table role="presentation" width="650" cellpadding="0" cellspacing="0" style="max-width:650px; width:100%;">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding-bottom:32px;">
                                <h1 style="font-size:26px; color:#3d3250; font-weight:400; margin:0;
                                           font-family:Georgia,'Times New Roman',serif;">
                                    CAD <span style="color:#8b7ec8;">to BOQ</span>
                                </h1>
                                <p style="color:#a69db4; font-size:12px; letter-spacing:1px; margin-top:6px;
                                          text-transform:uppercase;">
                                    Bill of Quantities Report
                                </p>
                            </td>
                        </tr>

                        <!-- Summary Card -->
                        <tr>
                            <td style="padding-bottom:24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                       style="background:#ffffff; border-radius:12px;
                                              border:1px solid rgba(139,126,200,0.12);
                                              box-shadow:0 2px 12px rgba(61,50,80,0.04);">
                                    <tr>
                                        <td style="padding:28px 32px;">
                                            <p style="font-size:11px; color:#a69db4; margin:0 0 6px 0;
                                                      letter-spacing:1px; text-transform:uppercase;">
                                                Estimated Project Cost
                                            </p>
                                            <p style="font-size:36px; color:#8b7ec8; font-weight:600; margin:0;
                                                      font-family:Georgia,'Times New Roman',serif; line-height:1.2;">
                                                ₹{grand_total:,.2f}
                                            </p>
                                            <p style="font-size:13px; color:#a69db4; margin-top:10px;">
                                                {len(boq_data)} line item{'s' if len(boq_data) != 1 else ''} extracted
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- BOQ Table -->
                        <tr>
                            <td>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                       style="background:#ffffff; border-radius:12px; overflow:hidden;
                                              border:1px solid rgba(139,126,200,0.12);
                                              box-shadow:0 2px 12px rgba(61,50,80,0.04);">
                                    <tr>
                                        <td>
                                            <table width="100%" cellpadding="0" cellspacing="0"
                                                   style="border-collapse:collapse; font-size:14px;
                                                          table-layout:fixed; width:100%;">
                                                <colgroup>
                                                    <col style="width:40px;">
                                                    <col style="width:140px;">
                                                    <col style="width:100px;">
                                                    <col style="width:50px;">
                                                    <col style="width:110px;">
                                                    <col style="width:210px;">
                                                </colgroup>
                                                <thead>
                                                    <tr style="background:#f8f5f0;">
                                                        <th style="padding:14px 16px; font-size:11px; color:#8b7ec8;
                                                                   text-transform:uppercase; letter-spacing:1px;
                                                                   font-family:Arial,sans-serif; font-weight:600;
                                                                   border-bottom:2px solid rgba(139,126,200,0.1);
                                                                   text-align:center;">
                                                            #
                                                        </th>
                                                        <th style="padding:14px 16px; font-size:11px; color:#8b7ec8;
                                                                   text-transform:uppercase; letter-spacing:1px;
                                                                   font-family:Arial,sans-serif; font-weight:600;
                                                                   border-bottom:2px solid rgba(139,126,200,0.1);
                                                                   text-align:left;">
                                                            Component
                                                        </th>
                                                        <th style="padding:14px 16px; font-size:11px; color:#8b7ec8;
                                                                   text-transform:uppercase; letter-spacing:1px;
                                                                   font-family:Arial,sans-serif; font-weight:600;
                                                                   border-bottom:2px solid rgba(139,126,200,0.1);
                                                                   text-align:right;">
                                                            Qty
                                                        </th>
                                                        <th style="padding:14px 16px; font-size:11px; color:#8b7ec8;
                                                                   text-transform:uppercase; letter-spacing:1px;
                                                                   font-family:Arial,sans-serif; font-weight:600;
                                                                   border-bottom:2px solid rgba(139,126,200,0.1);
                                                                   text-align:center;">
                                                            Unit
                                                        </th>
                                                        <th style="padding:14px 16px; font-size:11px; color:#8b7ec8;
                                                                   text-transform:uppercase; letter-spacing:1px;
                                                                   font-family:Arial,sans-serif; font-weight:600;
                                                                   border-bottom:2px solid rgba(139,126,200,0.1);
                                                                   text-align:right;">
                                                            Rate
                                                        </th>
                                                        <th style="padding:14px 16px; font-size:11px; color:#8b7ec8;
                                                                   text-transform:uppercase; letter-spacing:1px;
                                                                   font-family:Arial,sans-serif; font-weight:600;
                                                                   border-bottom:2px solid rgba(139,126,200,0.1);
                                                                   text-align:right;">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rows}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colspan="4" style="padding:18px 16px; text-align:right;
                                                                                 background:#f8f5f0;
                                                                                 border-top:2px solid rgba(139,126,200,0.12);">
                                                            <span style="font-weight:700; font-size:12px; color:#7a7088;
                                                                         text-transform:uppercase; letter-spacing:1px;
                                                                         font-family:Arial,sans-serif;">
                                                                Grand Total
                                                            </span>
                                                        </td>
                                                        <td colspan="2" style="padding:18px 16px; text-align:right;
                                                                                 font-weight:700; font-size:20px;
                                                                                 color:#82b868; background:#f8f5f0;
                                                                                 border-top:2px solid rgba(139,126,200,0.12);
                                                                                 font-family:Georgia,'Times New Roman',serif;
                                                                                 white-space:nowrap;">
                                                            ₹{grand_total:,.2f}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding-top:32px; border-top:1px solid rgba(139,126,200,0.08);">
                                <p style="font-size:12px; color:#a69db4; margin:24px 0 0 0;">
                                    Generated by CAD to BOQ Engine
                                </p>
                                <p style="font-size:11px; color:#ccc; margin-top:4px;">
                                    Rates are estimated (DSR 2024 approx). Please verify before use.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html


def send_boq_email(access_token: str, user_email: str, boq_data: list) -> dict:
    """
    Send BOQ report email using Gmail API with the user's access token.

    Args:
        access_token: Google OAuth access token with gmail.send scope
        user_email: Recipient email address (the logged-in user)
        boq_data: List of BOQ items with rates and totals

    Returns:
        dict with 'success' bool and 'message' string
    """
    try:
        # Calculate grand total
        grand_total = sum(item.get("total", 0) for item in boq_data)

        # Build credentials from access token
        creds = Credentials(token=access_token)

        # Build Gmail API service
        service = build("gmail", "v1", credentials=creds)

        # Create email
        message = MIMEMultipart("alternative")
        message["To"] = user_email
        message["From"] = user_email  # Sending from user's own account
        message["Subject"] = f"Your BOQ Report — Estimated ₹{grand_total:,.2f}"

        # Plain text fallback
        plain_text = f"CAD to BOQ Report\n\n"
        plain_text += f"Estimated Project Cost: ₹{grand_total:,.2f}\n"
        plain_text += f"Items: {len(boq_data)}\n\n"
        plain_text += f"{'#':<4} {'Component':<25} {'Qty':>12} {'Unit':>6} {'Rate':>12} {'Total':>14}\n"
        plain_text += "-" * 75 + "\n"
        for item in boq_data:
            plain_text += (
                f"{item['item_no']:<4} {item['component']:<25} "
                f"{item['quantity']:>12,.2f} {item['unit']:>6} "
                f"₹{item['rate']:>10,.2f} ₹{item['total']:>12,.2f}\n"
            )
        plain_text += "-" * 75 + "\n"
        plain_text += f"{'Grand Total':>49} ₹{grand_total:>12,.2f}\n"

        # HTML body
        html_body = _build_boq_html(boq_data, grand_total)

        # Attach both parts
        message.attach(MIMEText(plain_text, "plain"))
        message.attach(MIMEText(html_body, "html"))

        # Encode and send
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
        send_result = (
            service.users()
            .messages()
            .send(userId="me", body={"raw": raw_message})
            .execute()
        )

        return {
            "success": True,
            "message": f"BOQ report sent to {user_email}",
            "message_id": send_result.get("id", ""),
        }

    except Exception as e:
        print(f"[Email Error] {e}")
        return {
            "success": False,
            "message": f"Failed to send email: {str(e)}",
        }
