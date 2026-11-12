# Employee Permit Admin — MongoDB Atlas Edition

This project is based on your uploaded employee permit page and keeps the public page's latest requested behaviour: it displays the Arabic sentence **تم التحقق من التصريح بنجاح** as a static message. It does not perform real permit verification and does not show employee personal data publicly.

The admin panel is connected to MongoDB Atlas through a Node.js + Express backend. Employee records are stored in the cloud and can be managed from the admin page.

## Features

- Admin login using username and password stored on the server in `.env`.
- Add employee records (Create).
- View employee records (Read).
- Edit employee records (Update).
- Delete employee records (Delete).
- Active / inactive permit status.
- Duplicate permit-number protection.
- Permit date validation.
- Employee counts and browser-side filtering.
- MongoDB indexes for permit number, employee name and establishment number.
- Public page shows only the static Arabic success message.

## Project structure

```text
employee-permit-mongodb-atlas/
├── middleware/
│   └── requireAdmin.js
├── models/
│   └── Employee.js
├── routes/
│   ├── auth.js
│   └── employees.js
├── public/
│   ├── admin.html
│   ├── admin.js
│   ├── index.html
│   └── style.css
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Step 1 — Install Node.js

Install Node.js LTS from https://nodejs.org/. After installation, open a new VS Code terminal and check:

```bash
node -v
npm -v
```

## Step 2 — Create a MongoDB Atlas cluster

1. Open https://www.mongodb.com/atlas and create/sign in to your account.
2. Create a free shared cluster if available in your region.
3. In **Database Access**, create a database user and set a strong password. This is not necessarily your Atlas website login.
4. In **Network Access**, add your current IP address. For a temporary development test, Atlas also offers `0.0.0.0/0`, which allows connections from anywhere; avoid this for production and remove it when no longer needed.
5. Open **Database → Connect → Drivers**.
6. Choose Node.js and copy the connection string.
7. Replace `<db_password>` with the database user's password. URL-encode special characters in the password if required.
8. Use the database name `employee_permits` in the connection URI, for example:

```text
mongodb+srv://DB_USER:DB_PASSWORD@cluster-name.xxxxx.mongodb.net/employee_permits?retryWrites=true&w=majority
```

Do not share your connection string or database password.

## Step 3 — Configure environment variables

1. In the project root, make a copy of `.env.example`.
2. Rename the copy to `.env` (exactly `.env`, not `.env.txt`).
3. Put your real Atlas connection string in `MONGODB_URI`.
4. Change `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
5. Replace `JWT_SECRET` with a long random secret.

Example `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://yourUser:yourPassword@yourCluster.mongodb.net/employee_permits?retryWrites=true&w=majority
JWT_SECRET=put_a_long_random_secret_here_at_least_32_characters
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose_a_strong_password_here
```

Never upload `.env` to GitHub or send it in screenshots/messages. `.gitignore` excludes it.

## Step 4 — Install project packages

In the VS Code terminal, make sure you are in the project root (the folder containing `package.json`), then run:

```bash
npm install
```

## Step 5 — Start the website

```bash
npm start
```

When the terminal says it connected to MongoDB Atlas and the website is running, open:

- Public page: http://localhost:5000/
- Admin panel: http://localhost:5000/admin.html

Log in with the username/password you placed in `.env`. Do not use a hard-coded demo password.

## Step 6 — Add employee data

1. Open `http://localhost:5000/admin.html`.
2. Log in.
3. Complete the employee and permit fields.
4. Tick **Active permit** if appropriate.
5. Click **Add employee**.
6. View the saved record in the Employee records table.
7. Use **Edit** to update a record and **Delete** to remove it.

The fields are:
- Permit number
- Permit type
- Permit start date
- Permit expiry date
- Employee name
- Occupation
- Nationality
- Date of birth
- Sex
- Residence / ID number
- Establishment name
- Establishment number
- Active / inactive status

MongoDB creates the `employee_permits` database and `employees` collection automatically when the first employee is inserted.

## API endpoints

All employee endpoints require this header:

```text
Authorization: Bearer YOUR_ADMIN_TOKEN
```

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/health` | Server/database health |
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Add employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

## Troubleshooting

**MongoDB connection failed**
- Check that `MONGODB_URI` is correct.
- Check the database username and password (not your Atlas account password).
- Confirm your IP is allowed in Atlas Network Access.
- URL-encode special characters in the database password.

**Invalid username/password**
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`.
- Restart `npm start` after changing `.env`.

**Port already in use**
- Change `PORT=5000` to another free port, such as `PORT=5001`, then restart.

**Admin page cannot load records**
- Open the website through `http://localhost:5000/admin.html`, not by double-clicking the HTML file.
- Check the terminal for backend errors.
- Check `/api/health` in your browser.

## Important security and privacy notes

- This is a starter implementation. Have it security-reviewed before using real employee identity information.
- Use a strong admin password and a long random JWT secret.
- The JWT token is kept in `sessionStorage` and expires after 8 hours. Log out on shared computers.
- Use HTTPS when deployed publicly.
- Restrict Atlas Network Access to trusted IP addresses; do not leave `0.0.0.0/0` enabled for production.
- Back up your Atlas database.
- Do not publish employee details on the public page unless you are authorized and have a lawful basis to disclose them.
- The public page intentionally displays a static success message only. This is not a real permit check and must not be presented as official verification.
- For a production deployment, consider stronger authentication (hashed passwords, MFA, audit logs, CSRF/security review, and managed secrets).

## Existing logo images

The public page references these optional image files:
- `public/images/mlsd-logo.png`
- `public/images/ajeer-logo.png`
- `public/images/digital-govt-auth-logo.svg`
- `public/images/takamol-logo.png`
- `public/images/tamkeen-logo.svg`

The supplied partner logos are already included in `public/images` (MLSD, Ajeer, Digital Government Authentication, Takamol, Tamkeen, and X/Twitter).


## Public permit lookup (Arabic)

- Open `/` to search by permit number.
- A matching permit opens at `/permit/PERMIT_NUMBER`.
- The individual permit page is Arabic-first (RTL) and intentionally has no copy-link or "search another permit" controls.
- The public lookup API is `GET /api/employees/public/:permitNumber`.
- Public results omit the full residence number and show only its last four digits.
- Admin CRUD endpoints remain protected by the admin login.


### Public permit display note
The public permit endpoint currently returns the full residence/ID number so it appears unmasked on the public permit page, as requested. Only publish this information when you have explicit authorization from the employee and a lawful basis to disclose it.
