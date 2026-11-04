/* D&K Party Planner settings.
 * primaryVerify : which channel sends the sign-up code first ('email' or 'sms').
 * smsEnabled    : set to true ONLY after an SMS provider is working in Supabase (Authentication > Providers > Phone,
 *                 or a Send SMS hook). While false, sign-up verifies by email only and phone numbers stay "not verified".
 * accountFunction: set to true after you deploy the 'pp-account' Supabase function (see supabase/functions/pp-account).
 *                 It enables sign-in with username + password and password reset by username.
 */
window.DK_PP={primaryVerify:'email',smsEnabled:false,accountFunction:false};
