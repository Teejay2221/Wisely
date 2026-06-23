import { getUserExpenses } from "./auth.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth();
const homeTotalSpending = document.getElementById("homeTotalSpending");

// Only do anything on pages that actually have these elements (index.html)
if (homeTotalSpending) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // navbar.js already handles redirecting unauthenticated users
            return;
        }

        try {
            const expenses = await getUserExpenses(user.uid) || [];
            renderHomeDashboard(expenses);
        } catch (error) {
            console.error("Error loading homepage expense data:", error);
        }
    });
}

function renderHomeDashboard(expenses) {
    let food = 0;
    let transport = 0;
    let shopping = 0;
    let other = 0;

    expenses.forEach(expense => {
        const amount = Number(expense.amount) || 0;

        if (expense.category === "Food") {
            food += amount;
        } else if (expense.category === "Transport") {
            transport += amount;
        } else if (expense.category === "Shopping") {
            shopping += amount;
        } else {
            other += amount;
        }
    });

    const total = food + transport + shopping + other;

    document.getElementById("homeTotalSpending").textContent = "₱" + total.toFixed(2);
    document.getElementById("homeTransactionCount").textContent = expenses.length;

    const categories = { Food: food, Transport: transport, Shopping: shopping, Other: other };
    let highestCategory = "No Data";
    let highestAmount = 0;

    for (const category in categories) {
        if (categories[category] > highestAmount) {
            highestAmount = categories[category];
            highestCategory = category;
        }
    }

    document.getElementById("homeHighestCategory").textContent = total === 0 ? "No Data" : highestCategory;

    document.getElementById("previewFood").textContent = "₱" + food.toFixed(2);
    document.getElementById("previewTransport").textContent = "₱" + transport.toFixed(2);
    document.getElementById("previewShopping").textContent = "₱" + shopping.toFixed(2);
    document.getElementById("previewOther").textContent = "₱" + other.toFixed(2);
}
