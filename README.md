# D&K LIQUOR: launch guide (GitHub + free Supabase)

What you get
- `index.html`: the customer shop (share this link with customers)
- `admin.html`: the staff login page (never share or link it; staff only)
- `supabase-setup.sql`: creates the database and the security rules
- `config.js`: where you paste your Supabase details
- `app.js`, `style.css`, `logo.png`, `robots.txt`: the app itself

## Part 1: Supabase (the database), about 10 minutes
1. Go to supabase.com and create a free account, then **New project**. Choose a strong database password and the region nearest your customers. Wait until it finishes setting up.
2. Open **SQL Editor**, click **New query**, paste everything from `supabase-setup.sql`, and press **Run**. It should say "Success".
3. Open **Authentication -> Sign In / Providers** and turn **ON "Allow anonymous sign-ins"**. This lets customers order without an account.
4. Open **Authentication -> Users -> Add user -> Create new user**. Enter your own email and a strong password, and tick **Auto Confirm User**. This is your administrator login. Add one for each staff member who needs access.
5. Go back to **SQL Editor**, paste the STEP 2 block at the bottom of the SQL file (remove the `--` in front of the lines and use your email) and **Run**. This is what makes that user an administrator. Repeat for each staff email.
6. Open **Project Settings -> API**. Copy the **Project URL** and the **anon public** key.
7. Open `config.js` and paste them in. Do NOT use the `service_role` key anywhere.

## Part 2: GitHub (the website), about 10 minutes
1. Create a GitHub account, then **New repository** (name it e.g. `dk-liquor`, set to Public).
2. Click **uploading an existing file**, drag in ALL the files from this folder, and **Commit changes**.
3. Go to **Settings -> Pages**. Under "Build and deployment", choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and **Save**.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/dk-liquor/`
   - Customers use: `.../dk-liquor/`
   - Staff use: `.../dk-liquor/admin.html`

## Part 3: First use
1. Open `admin.html`, sign in, and set up your Settings (contact numbers, theme), categories, products, combos, promotions and ads.
2. Open the customer link on a phone and place a test order. It should appear under **Orders** in the admin page.

## Is the admin side really safe from customers?
- The admin page needs an email and password. Customers have no account that can log in there.
- More importantly, the database refuses every change from anyone who is not in the `admins` table. A customer cannot add products, change prices, edit orders or read other people's orders, even if they find `admin.html` or tamper with the code in their browser.
- Customers can only: read the shop, place an order marked "New", read their own orders, and save their own delivery details.

## Good to know
- Free Supabase projects pause after about 1 week with no activity. Visit the site weekly, or upgrade when you are busy. A paused project can be resumed from the Supabase dashboard.
- Prices and totals in an order are calculated in the customer's phone. Always check an order before confirming it. Online payments would need a server (for example Supabase Edge Functions).
- Product photos and ad banners are saved inside the database. Keep them small. If the catalogue grows large, move images to Supabase Storage.
- Anyone can place a fake order. Watch for spam. A phone call to confirm orders is a good habit.
- Keep your admin passwords private. If staff leave, delete their user in Authentication -> Users.
- Data you entered in the Claude preview version does not carry over. Re-add your products.
