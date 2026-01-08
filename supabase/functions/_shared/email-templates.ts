// Professional email templates inspired by PayPal's clean design
// Anti-spam best practices: proper structure, plain text alternative, clear footer

const BRAND_COLOR = '#1a1a2e';
const ACCENT_COLOR = '#ffd700';
const TEXT_COLOR = '#333333';
const MUTED_COLOR = '#666666';
const LIGHT_BG = '#f8f9fa';
const CURRENT_YEAR = new Date().getFullYear();

// Shared email wrapper with professional styling
export const emailWrapper = (content: string, previewText: string = '') => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>StarStore</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }
    
    /* iOS link styling */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    
    /* Main styles */
    .email-container { max-width: 600px; margin: 0 auto; }
    .email-body { background-color: #ffffff; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
      .center-on-narrow { text-align: center !important; display: block !important; margin-left: auto !important; margin-right: auto !important; float: none !important; }
      table.center-on-narrow { display: inline-block !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <!-- Preview text -->
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${previewText}
  </div>
  
  <!-- Main wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 20px 10px;">
        
        <!-- Email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin: 0 auto;">
          
          <!-- Logo Header -->
          <tr>
            <td style="padding: 30px 40px 20px 40px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <span style="font-size: 28px; font-weight: 700; color: ${BRAND_COLOR};">Star</span><span style="font-size: 28px; font-weight: 700; color: ${ACCENT_COLOR};">Store</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Email Body -->
          <tr>
            <td class="email-body" style="background-color: #ffffff; padding: 0 40px 40px 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer Logo -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #ffffff;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <span style="font-size: 20px; font-weight: 600; color: ${BRAND_COLOR}; opacity: 0.6;">Star</span><span style="font-size: 20px; font-weight: 600; color: ${ACCENT_COLOR}; opacity: 0.6;">Store</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer Divider -->
          <tr>
            <td style="padding: 0 40px; background-color: #ffffff;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid #e0e0e0;"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer Links -->
          <tr>
            <td style="padding: 25px 40px 30px 40px; text-align: center; background-color: #ffffff; border-radius: 0 0 8px 8px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px;">
                    <a href="https://starstore.site/help" style="color: ${MUTED_COLOR}; text-decoration: none;">Help Center</a>
                    <span style="color: #cccccc; padding: 0 10px;">|</span>
                    <a href="https://starstore.site/support" style="color: ${MUTED_COLOR}; text-decoration: none;">Support</a>
                    <span style="color: #cccccc; padding: 0 10px;">|</span>
                    <a href="https://t.me/thestarstore" style="color: ${MUTED_COLOR}; text-decoration: none;">Telegram</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #999999; line-height: 1.6;">
                    © ${CURRENT_YEAR} StarStore. All rights reserved.<br>
                    This is an automated message from StarStore Ambassador Program.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Greeting section
export const greeting = (name: string) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding: 10px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${MUTED_COLOR};">
      Hello, ${name}
    </td>
  </tr>
</table>
`;

// Main heading
export const heading = (text: string) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding: 25px 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 26px; font-weight: 600; color: ${BRAND_COLOR}; line-height: 1.3; text-align: center;">
      ${text}
    </td>
  </tr>
</table>
`;

// Paragraph text
export const paragraph = (text: string) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding: 0 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${TEXT_COLOR}; line-height: 1.6;">
      ${text}
    </td>
  </tr>
</table>
`;

// Credentials box
export const credentialsBox = (items: { label: string; value: string }[]) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td style="background-color: ${LIGHT_BG}; border-radius: 8px; padding: 25px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${items.map((item, index) => `
        <tr>
          <td style="padding: ${index > 0 ? '12px' : '0'} 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <span style="font-size: 13px; color: ${MUTED_COLOR}; text-transform: uppercase; letter-spacing: 0.5px;">${item.label}</span><br>
            <span style="font-size: 16px; color: ${BRAND_COLOR}; font-weight: 600;">${item.value}</span>
          </td>
        </tr>
        `).join('')}
      </table>
    </td>
  </tr>
</table>
`;

// Call to action button
export const ctaButton = (text: string, url: string) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
  <tr>
    <td style="text-align: center;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
        <tr>
          <td style="border-radius: 6px; background-color: ${BRAND_COLOR};">
            <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 35px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
              ${text}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

// Numbered list
export const numberedList = (items: string[]) => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 15px 0;">
  ${items.map((item, index) => `
  <tr>
    <td style="padding: 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${TEXT_COLOR}; line-height: 1.5;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="width: 28px; vertical-align: top;">
            <span style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; background-color: ${ACCENT_COLOR}; color: ${BRAND_COLOR}; font-size: 12px; font-weight: 600; border-radius: 50%;">${index + 1}</span>
          </td>
          <td style="vertical-align: top; padding-left: 10px;">${item}</td>
        </tr>
      </table>
    </td>
  </tr>
  `).join('')}
</table>
`;

// Warning/Important notice
export const notice = (text: string, type: 'warning' | 'info' = 'info') => {
  const bgColor = type === 'warning' ? '#fff8e6' : '#e8f4fd';
  const borderColor = type === 'warning' ? '#ffd700' : '#2196f3';
  const iconColor = type === 'warning' ? '#f59e0b' : '#2196f3';
  
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 0 6px 6px 0; padding: 15px 18px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${TEXT_COLOR}; line-height: 1.5;">
            <strong style="color: ${iconColor};">${type === 'warning' ? 'Important:' : 'Note:'}</strong> ${text}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
};

// Signature
export const signature = () => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 25px;">
  <tr>
    <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${TEXT_COLOR}; line-height: 1.6;">
      Thank you for being part of StarStore.<br><br>
      <span style="color: ${MUTED_COLOR};">The StarStore Team</span>
    </td>
  </tr>
</table>
`;

// Plain text version generator
export const generatePlainText = (sections: { type: string; content: any }[]): string => {
  let text = 'StarStore\n\n';
  
  sections.forEach(section => {
    switch (section.type) {
      case 'greeting':
        text += `Hello, ${section.content}\n\n`;
        break;
      case 'heading':
        text += `${section.content}\n${'='.repeat(section.content.length)}\n\n`;
        break;
      case 'paragraph':
        text += `${section.content}\n\n`;
        break;
      case 'credentials':
        text += '---\n';
        section.content.forEach((item: { label: string; value: string }) => {
          text += `${item.label}: ${item.value}\n`;
        });
        text += '---\n\n';
        break;
      case 'button':
        text += `${section.content.text}: ${section.content.url}\n\n`;
        break;
      case 'list':
        section.content.forEach((item: string, index: number) => {
          text += `${index + 1}. ${item}\n`;
        });
        text += '\n';
        break;
      case 'notice':
        text += `[${section.content.type === 'warning' ? 'IMPORTANT' : 'NOTE'}] ${section.content.text}\n\n`;
        break;
    }
  });
  
  text += '---\n';
  text += 'Thank you for being part of StarStore.\n';
  text += 'The StarStore Team\n\n';
  text += `© ${CURRENT_YEAR} StarStore. All rights reserved.\n`;
  text += 'Help: https://starstore.site/help\n';
  text += 'Support: https://starstore.site/support\n';
  text += 'Telegram: https://t.me/thestarstore\n';
  
  return text;
};

export default {
  emailWrapper,
  greeting,
  heading,
  paragraph,
  credentialsBox,
  ctaButton,
  numberedList,
  notice,
  signature,
  generatePlainText,
};
