=== Course Flow ===
Contributors: pawelborowiec
Tags: stripe, lms, tutor, learnpress, learndash
Requires at least: 6.7
Tested up to: 6.9
Stable tag: 2.0.0
Version: 2.0.0
Requires PHP: 7.4
Tested with: LearnDash 4.25.0+, LearnPress 4.2.9+, Tutor LMS 3.9.0+
Author: Pawel Borowiec
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html



Sell online courses with Stripe using **Course Flow** — the fastest, lightweight WordPress plugin for Stripe Checkout integration with Tutor LMS, LearnPress, and LearnDash. No WooCommerce required.



== Description ==



**Course Flow** is a free and lightweight WordPress plugin that lets you sell your online courses directly with **Stripe Checkout** — without the need for WooCommerce. It integrates seamlessly with **Tutor LMS**, **LearnPress**, and **LearnDash** to offer a simple and fast checkout experience for course creators.

If you’re tired of slow or complicated WooCommerce setups, **Course Flow** gives you a direct and conflict-free way to start selling your courses online.  
No extra plugins. No conflicts. No slow checkouts. Just fast, secure payments with Stripe.



### 💡 Why course creators choose Course Flow

- **No WooCommerce required** — avoids unnecessary complexity and plugin conflicts.
- **Fast setup** — configure Stripe keys and add a shortcode to start accepting payments.
- **Direct Stripe Checkout** — secure, hosted checkout handled entirely by Stripe.
- **Automatic course enrollment** after successful payment.
- **Optional WordPress user account creation** for new customers.
- **Fully customizable buttons** — text, colors, and even image-based purchase buttons.
- **Lightweight architecture** — minimal frontend and admin assets.
- **Translation-ready** with included `.pot` file.



== 🧩 Key Features ==

- Direct **Stripe Checkout** integration (no WooCommerce dependency).
- Supports **Tutor LMS**, **LearnPress**, and **LearnDash** (requires one active LMS).
- One-time payments via Stripe Checkout.
- Automatic course enrollment after successful payment.
- Optional automatic WordPress user account creation.
- Secure Stripe webhook handling (`checkout.session.completed`).
- Test mode and live mode support.
- Shortcodes for easy setup:
  - `[courseflow_buycourse id="123"]`
  - `[courseflow_course id="123"]`
  - `[courseflow_imagebuycourse id="123"]`
- Visual button customization (text, colors, hover effects, layout).
- Image-based purchase buttons.
- Admin course list with ready-to-copy shortcodes.
- Secure REST API (`course-flow/v1`) with capability and nonce validation.
- Optional plugin telemetry (disabled by default).
- Fully translatable (`.pot` file included).

⚡ Performance & Security
Course Flow is built for speed. It loads only minimal scripts, uses secure REST API calls, and relies on Stripe’s own hosted checkout page for PCI compliance.  
All webhook events are validated via `checkout.session.completed`, ensuring that course enrollments are always secure and verified.



== Requirements ==

- WordPress 6.7 or newer
- PHP 7.4 or newer
- One active LMS plugin:
  - Tutor LMS
  - LearnPress
  - LearnDash
- Stripe account (Publishable Key, Secret Key, Webhook Secret)
- HTTPS enabled



== Installation ==

1. Upload and activate the plugin.
2. Go to **Dashboard → Course Flow → Settings**.
3. Enter your Stripe Publishable Key, Secret Key, and Webhook Secret.
4. Configure a Stripe webhook pointing to:  
   `https://your-site.com/wp-json/course-flow/v1/webhook`
5. Optionally customize buttons in **Button Settings** or **Image Button Settings**.
6. Place a purchase shortcode on a course page.



== Configuring Stripe Webhooks ==

To enable automatic enrollment after payment:

1. Open Stripe Dashboard → Developers → Webhooks.
2. Add endpoint:  
   `https://your-site.com/wp-json/course-flow/v1/webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook secret and paste it into plugin settings.
5. Use the **TEST CONNECTION** button in admin to validate configuration.



== Shortcodes ==

- `[courseflow_buycourse id="123"]` — standard buy button
- `[courseflow_course id="123"]` — alternative purchase button
- `[courseflow_imagebuycourse id="123"]` — image-based buy button



== REST API ==

Namespace: `course-flow/v1`

- `POST /create-checkout`
- `POST /webhook`
- `POST /test-connection` (admin only)
- `POST /save-settings` (admin only)

Protected endpoints validate user capabilities and nonces.



== Admin Pages ==

Settings — Configuration of Stripe API keys, currency, success page, account creation behavior and optional plugin telemetry.  
Courses — List of detected LMS courses with IDs and available purchase shortcodes.  
Button Settings — Visual customization of purchase buttons.  
Image Button Settings — Management of image-based purchase buttons.



== Data Privacy ==

Course Flow includes an optional plugin telemetry feature.

When explicitly enabled by an administrator, the plugin may transmit limited, non-personal plugin metadata (such as site URL and plugin version) to the plugin author for diagnostic and compatibility purposes.

This feature is:
- Disabled by default
- Explicitly opt-in
- Does not collect personal or user-identifiable data

The plugin functions fully without enabling this option.

More information can be found in the author’s privacy policy:  
https://dev.pawelborowiec.com/course-flow/privacy-policy.html



== External Services ==

= Stripe =

Stripe is used to process payments via Stripe Checkout.

- Stripe JavaScript library is loaded from https://js.stripe.com/v3/
- Stripe API is used for checkout session creation and webhook handling.
- Payment data is transmitted directly to Stripe during checkout.

Service Provider: Stripe, Inc.  
Terms: https://stripe.com/legal  
Privacy: https://stripe.com/privacy



== Localization ==

- Translation-ready with included `.pot` file.
- Translation files should be placed in the `/languages/` directory.
- Default language: English.




== Included Libraries ==

- Stripe PHP SDK (MIT)
- Select2 (MIT)
- Bundled local fonts (OFL)



== Screenshots ==

1. Course Flow settings page for Stripe configuration.
2. Button settings page with visual customization options.
3. Example course page using a Course Flow purchase shortcode.
4. Image-based purchase button configuration.
5. Courses admin listing with generated shortcodes.
6. Stripe Checkout success / confirmation page.



== FAQ ==

= Do I need WooCommerce? =
No.

= 💳 Can I use Course Flow without WooCommerce? =
Yes! **Course Flow** is designed specifically to sell courses without WooCommerce. It connects directly to Stripe Checkout for a simple, fast, and conflict-free experience.

= 🎓 Which LMS plugins are supported? =
Course Flow supports **Tutor LMS**, **LearnPress**, and **LearnDash**. Only one needs to be active for the plugin to work.

= 🔒 Is Course Flow secure? =
Absolutely. All transactions are handled securely by **Stripe Checkout** and verified through Stripe webhooks before course enrollment.

= 🧠 How do I install Course Flow? =
Simply install it from your WordPress dashboard → Plugins → Add New → search for “Course Flow”.

= 🌍 Is Course Flow translatable? =
Yes, a `.pot` file is included so you can translate it into any language.

= 🚀 What makes Course Flow different from other Stripe plugins? =
It’s **WooCommerce-free**, **lightweight**, and built specifically for course creators who want fast, secure payments without bloat.

= 📍 Where can I find Course Flow plugin? =
You can find and download **Course Flow WordPress plugin** from the official WordPress.org repository or directly from your dashboard by searching for “Course Flow”.



== Changelog ==

= 2.0.0 =
Improved UI responsiveness and user experience

= 1.0.0 =
Initial release.



== Upgrade Notice ==

= 2.0.0 =
A modern user interface built with React

= 1.0.0 =
First stable release.



== License ==
GPLv2 or later
