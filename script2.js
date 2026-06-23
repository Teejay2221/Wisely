// script2.js
import { saveUserExpenses, getUserExpenses, getUserProfile } from "./auth.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth();
let currentUserUid = null;
let allCloudExpenses = []; // Master storage array synced with Firebase

const dropdownUsername = document.getElementById('dropdown-username');
const expenseTable = document.getElementById('expense-table');
const totalExpenseDisplay = document.getElementById('total-expense');
const categoryFilter = document.getElementById('category-filter');
const addExpenseButton = document.getElementById('add-expense');
const expenseName = document.getElementById('expense-name');
const expenseAmount = document.getElementById('expense-amount');
const expenseCategory = document.getElementById('expense-category');
const expenseDate = document.getElementById('expense-date');

let editingExpenseId = null;
let deletingExpenseId = null;

// 1. Monitor the Active Firebase User Profile
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUid = user.uid;
        console.log("Expenses backend locked onto account:", currentUserUid);

        // Fetch and display the dropdown username
        try {
            const userProfile = await getUserProfile(currentUserUid);
            if (userProfile && userProfile.username && dropdownUsername) {
                dropdownUsername.textContent = `@${userProfile.username}`;
            }
        } catch (err) {
            console.log("Error loading dropdown username:", err);
        }

        // Load data array directly from Firestore
        allCloudExpenses = await getUserExpenses(currentUserUid) || [];
        
        // Build table items
        updateUI(allCloudExpenses);
    } else {
        // Force back to login if they try to access the page unauthorized
        window.location.href = "LogIn.html";
    }
});

// 2. Updated UI Renderer accepting arrays (Crucial for filtering!)
function updateUI(expenseDataList) {
    expenseTable.innerHTML = '';
    let total = 0;

    if (!expenseDataList || expenseDataList.length === 0) {
        const emptyMessageRow = document.createElement('tr');
        emptyMessageRow.innerHTML = `<td colspan='5' class='empty-table-message' style='text-align: center; padding: 15px;'>No expenses recorded.</td>`;
        expenseTable.appendChild(emptyMessageRow);
    } else {
        expenseDataList.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>₱${Number(expense.amount).toFixed(2)}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    <button class='edit-btn' onclick='openEditModal(${expense.id})'>Edit</button>
                    <button class='delete-btn' onclick='openDeleteModal(${expense.id})'>Delete</button>
                </td>`;
            expenseTable.appendChild(row);
            total += Number(expense.amount) || 0;
        });
    }
    totalExpenseDisplay.textContent = '₱' + total.toFixed(2);
}

// 3. Form input validation auto-disabled rules
function checkInputs() {
    if (expenseName.value.trim() && expenseAmount.value && expenseCategory.value && expenseDate.value) {
        addExpenseButton.disabled = false;
    } else {
        addExpenseButton.disabled = true;
    }
}
[expenseName, expenseAmount, expenseCategory, expenseDate].forEach(input => {
    input.addEventListener('input', checkInputs);
});

// 4. Handle Submitting and Pushing items to Cloud Firestore
addExpenseButton.addEventListener('click', async () => {
    const name = expenseName.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (!name || isNaN(amount) || !date) {
        alert('Please fill in all fields.');
        return;
    }

    const expense = { id: Date.now(), name, amount, category, date };
    const updatedExpenses = [...allCloudExpenses, expense];

    // Save array to cloud database BEFORE updating local state, so a failed
    // save doesn't make it look like the expense was added when it wasn't.
    try {
        await saveUserExpenses(currentUserUid, updatedExpenses);
    } catch (error) {
        alert('Could not save your expense. Please check your connection and try again.');
        return;
    }

    allCloudExpenses = updatedExpenses;

    expenseName.value = '';
    expenseAmount.value = '';
    expenseCategory.value = '';
    expenseDate.value = '';
    addExpenseButton.disabled = true;

    // Refresh dynamic display
    updateUI(allCloudExpenses);
    if(categoryFilter) categoryFilter.value = 'All'; // Reset dropdown selection visually
});

// 5. Expose Modal Open Actions globally to HTML inline onclick events
window.openEditModal = function(id) {
    const expense = allCloudExpenses.find(exp => exp.id === id);
    if (!expense) return;

    document.getElementById('edit-expense-name').value = expense.name;
    document.getElementById('edit-expense-amount').value = expense.amount;
    document.getElementById('edit-expense-category').value = expense.category;
    document.getElementById('edit-expense-date').value = expense.date;

    editingExpenseId = id;
    openModal('edit-modal');
}

// Save the edited content directly to Firestore cloud context
document.getElementById('confirm-edit').addEventListener('click', async () => {
    const name = document.getElementById('edit-expense-name').value.trim();
    const amount = parseFloat(document.getElementById('edit-expense-amount').value);
    const category = document.getElementById('edit-expense-category').value;
    const date = document.getElementById('edit-expense-date').value;

    if (!name || isNaN(amount) || !date) {
        alert('Please fill in all fields.');
        return;
    }

    const index = allCloudExpenses.findIndex(exp => exp.id === editingExpenseId);
    if (index > -1) {
        const updatedExpenses = [...allCloudExpenses];
        updatedExpenses[index] = { id: editingExpenseId, name, amount, category, date };

        try {
            await saveUserExpenses(currentUserUid, updatedExpenses);
        } catch (error) {
            alert('Could not save your changes. Please check your connection and try again.');
            return;
        }

        allCloudExpenses = updatedExpenses;
        updateUI(allCloudExpenses);
    }
    closeModal('edit-modal');
    if(categoryFilter) categoryFilter.value = 'All';
});

// Expose Delete trigger globally
window.openDeleteModal = function(id) {
    deletingExpenseId = id;
    openModal('delete-modal');
}

// Confirm delete extraction and write updated state array over to Cloud document
document.getElementById('confirm-delete').addEventListener('click', async () => {
    const updatedExpenses = allCloudExpenses.filter(exp => exp.id !== deletingExpenseId);

    try {
        await saveUserExpenses(currentUserUid, updatedExpenses);
    } catch (error) {
        alert('Could not delete the expense. Please check your connection and try again.');
        closeModal('delete-modal');
        return;
    }

    allCloudExpenses = updatedExpenses;
    updateUI(allCloudExpenses);
    closeModal('delete-modal');
    if(categoryFilter) categoryFilter.value = 'All';
});

// Core popup utilities
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}
window.closeModal = function(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 6. Filter actions looking up local application state arrays
categoryFilter.addEventListener('change', () => {
    const filterValue = categoryFilter.value;
    if (filterValue !== 'All') {
        const filteredExpenses = allCloudExpenses.filter(exp => exp.category === filterValue);
        updateUI(filteredExpenses);
    } else {
        updateUI(allCloudExpenses);
    }
});
