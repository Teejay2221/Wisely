# Wisely

A self-sufficient personal finance web app that helps students and young professionals track expenses, understand spending habits, and get AI-powered budgeting advice — all in one place.

## Background

This project was built as a Capstone requirement, with the goal of integrating an AI feature into a project that benefits a specific group of people. As a team of college students, we noticed that many people our age are just starting to figure out how to manage money. So we built Wisely to be self-sufficient: a user doesn't need any outside tools to track their own expenses. The AI we integrated acts as a financial consultant for users who want extra guidance on maximizing their budget and saving more efficiently than the core tools alone.

## Features

- **User authentication** — sign up and log in with Firebase Authentication
- **Expense tracking** — add, edit, and delete expenses with name, amount, category, and date
- **Category filtering** — filter expenses by Food, Transport, Shopping, or Other
- **Analysis dashboard** — visual breakdown of spending by category using a doughnut chart
- **Home dashboard** — quick snapshot of total spending, top category, and transaction count
- **AI financial advisor** — built-in chat assistant for budgeting and saving advice
- **Subscription page** — premium tier with advanced analytics and AI insights
- **Cloud sync** — all expense data is stored per-user in Firestore, so it's available across sessions

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (ES modules)
- **Backend / Database:** Firebase Authentication, Cloud Firestore
- **Charts:** Chart.js
- **AI Assistant:** n8n workflow integration

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Homepage / dashboard |
| `LogIn.html` / `login.js` | Login page and logic |
| `SignUp.html` / `signup.js` | Registration page and logic |
| `Expenses.html` / `script2.js` | Expense tracker (add/edit/delete/filter) |
| `analysis.html` / `analysis.js` | Spending analysis and charts |
| `subscription.html` | Premium subscription page |
| `aboutus.html` | Team and project info |
| `auth.js` | Firebase auth + Firestore data layer (shared across pages) |
| `navbar.js` | Shared navigation bar, sidebar toggle, and logout logic |
| `style.css`, `style2.css`, `signUpCSS.css` | Stylesheets |

## Getting Started

1. Clone this repository.
2. Make sure you have a Firebase project set up with **Authentication** (Email/Password) and **Firestore** enabled.
3. Update the `firebaseConfig` object in `auth.js` with your own Firebase project credentials.
4. Open `index.html` in a browser (or serve the folder with a local server, since ES modules require `http://` rather than `file://`).

## Team

- **Sean Mercurio** — Web Development Project Manager
- **Denry Rafael Tango** — Front-End Developer / UI-UX Designer
- **Tristian Joseph Estrañero** — Backend Developer
- **Alexander Blanco** — Quality Tester
- **Angelo Andrade** — Quality Tester
- **Roshwell Cruz** — Analyst
- **Ken Caña** — Analyst
- **Don Antonio Angcot IV** — Analyst

## License

Developed for educational purposes as a Capstone Project. All rights reserved.

---
© 2026 Wisely. Developed as a Capstone Project.
