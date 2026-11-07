/* D&K Party Planner settings.
 * primaryVerify : which channel sends the sign-up code first ('email' or 'sms').
 * smsEnabled    : set to true ONLY after an SMS provider is working in Supabase (Authentication > Providers > Phone,
 *                 or a Send SMS hook). While false, sign-up verifies by email only and phone numbers stay "not verified".
 * accountFunction: set to true after you deploy the 'pp-account' Supabase function (see supabase/functions/pp-account).
 *                 It enables sign-in with username + password and password reset by username.
 * vapidPublicKey: public key for background push alerts (see README, 'Notifications'). Leave empty to use in-app alerts only.
 */
window.DK_PP={primaryVerify:'email',smsEnabled:false,accountFunction:false,vapidPublicKey:'BGtgbRcnJkDaYuM1A-9mWn_HL9CGpWcaGaaBIkPJc66EWjKLFvBWG2jPTjCTCNC1bY_ecm3w2KsXIPm1_Vx-NtY'};
