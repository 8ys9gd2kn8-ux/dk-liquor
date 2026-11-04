/* D&K Party Planner settings.
 * primaryVerify : which channel sends the sign-up code first ('email' or 'sms').
 * smsEnabled    : set to true ONLY after an SMS provider is working in Supabase (Authentication > Providers > Phone,
 *                 or a Send SMS hook). While false, sign-up verifies by email only and phone numbers stay "not verified".
 */
window.DK_PP={primaryVerify:'email',smsEnabled:false};
