// analysis.js
import { getUserExpenses, getUserProfile } from "./auth.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth();
const chartCanvas = document.getElementById('expensePieChart');
const dropdownUsername = document.getElementById('dropdown-username');
let expenseChart = null;

// Trigger everything when Firebase confirms who is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Analysis engine active for:", user.uid);

        // Fetch and display the dropdown username
        try {
            const userProfile = await getUserProfile(user.uid);
            if (userProfile && userProfile.username && dropdownUsername) {
                dropdownUsername.textContent = `@${userProfile.username}`;
            }
        } catch (err) {
            console.log("Error loading dropdown username:", err);
        }
        
        // 1. GET DATA FROM CLOUD FIRESTORE INSTEAD OF LOCALSTORAGE
        const expenses = await getUserExpenses(user.uid) || [];
        
        // 2. RUN YOUR DESIGN LOGIC
        if (chartCanvas) {
            renderAnalysisDashboard(expenses);
        }
    } else {
        // If not logged in, boot them back to the login page immediately
        window.location.href = "LogIn.html";
    }
});

/**
 * Your original layout logic wrapped safely inside a cloud-fueled function
 */
function renderAnalysisDashboard(expenses) {
    /* Get HTML elements */
    const totalMonthlySpending = document.getElementById('totalMonthlySpending');
    const highestCategory = document.getElementById('highestCategory');
    const breakdownList = document.getElementById('breakdownList');

    /* Categories */
    let food = 0;
    let transport = 0;
    let shopping = 0;
    let other = 0;

    /* Loop through expenses from the database */
    expenses.forEach(expense => {
        // Make sure amounts are treated as real numbers
        const amount = Number(expense.amount) || 0; 

        if (expense.category === 'Food') {
            food += amount;
        }
        else if (expense.category === 'Transport') {
            transport += amount;
        }
        else if (expense.category === 'Shopping') {
            shopping += amount;
        }
        else {
            other += amount;
        }
    });

    /* Total expenses */
    let total = food + transport + shopping + other;

    /* Update total spending card */
    totalMonthlySpending.textContent = '₱' + total.toFixed(2);

    /* Find highest category */
    let highest = food;
    let highestName = 'Food';

    if (transport > highest) {
        highest = transport;
        highestName = 'Transport';
    }
    if (shopping > highest) {
        highest = shopping;
        highestName = 'Shopping';
    }
    if (other > highest) {
        highest = other;
        highestName = 'Other';
    }

    /* Show highest category text field */
    if (total === 0) {
        highestCategory.textContent = 'No Data';
    } else {
        highestCategory.textContent = highestName;
    }

    /* Inject Breakdown sidebar list items */
    breakdownList.innerHTML = `
    <div class="breakdownItem">
        <span class="colorIndicator" style="background-color: #E6A15C;"></span>
        <span class="categoryName">Food</span>
        <span class="categoryAmount">₱${food.toFixed(2)}</span>
    </div>
    <div class="breakdownItem">
        <span class="colorIndicator" style="background-color: #5C9EAD;"></span>
        <span class="categoryName">Transport</span>
        <span class="categoryAmount">₱${transport.toFixed(2)}</span>
    </div>
    <div class="breakdownItem">
        <span class="colorIndicator" style="background-color: #E85D75;"></span>
        <span class="categoryName">Shopping</span>
        <span class="categoryAmount">₱${shopping.toFixed(2)}</span>
    </div>
    <div class="breakdownItem">
        <span class="colorIndicator" style="background-color: #A78BFA;"></span>
        <span class="categoryName">Other</span>
        <span class="categoryAmount">₱${other.toFixed(2)}</span>
    </div>
    `;

    /* Render the ChartJS Doughnut visual element */
    const ctx = chartCanvas.getContext('2d');
    if (expenseChart) {
        expenseChart.destroy();
    }
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Transport', 'Shopping', 'Other'],
            datasets: [{
                data: [food, transport, shopping, other],
                backgroundColor: ['#E6A15C', '#5C9EAD', '#E85D75', '#A78BFA'],
                borderWidth: 2,
                borderColor: '#2D4A5C'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            cutout: '70%'
        }
    });
}
