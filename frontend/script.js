const API_URL = "http://localhost:8081/api/expenses";

let transactions = [];
let editId = null;

const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionList = document.getElementById("transaction-list");

// Load expenses
async function loadTransactions() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }

        transactions = await response.json();
        updateDisplay();

    } catch (error) {
        console.error(error);
        alert("Could not connect to the backend.");
    }
}

// Add or Update Expense
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;

    if (description === "" || amount <= 0) {
        alert("Please enter valid details.");
        return;
    }

    const transaction = {
        title: description,
        amount: amount,
        category: type
    };

    const url = editId ? `${API_URL}/${editId}` : API_URL;
    const method = editId ? "PUT" : "POST";

    try {

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });

        if (!response.ok) {
            throw new Error("Failed to save expense");
        }

        form.reset();
        editId = null;
        document.getElementById("submit-btn").textContent = "Add Transaction";

        await loadTransactions();

    } catch (error) {
        console.error(error);
        alert("Operation failed.");
    }

});

// Display Expenses
function displayTransactions() {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {

        const li = document.createElement("li");
        li.textContent = "No transactions added yet.";
        transactionList.appendChild(li);
        return;
    }

    transactions.forEach(function(transaction) {

        const li = document.createElement("li");
        li.className = "transaction-item";

        const info = document.createElement("div");
        info.className = "transaction-info";

        info.innerHTML = `
            <strong>${transaction.title}</strong><br>
            ${transaction.category}: ₹${transaction.amount}
        `;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.onclick = function () {
            editTransaction(transaction);
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.onclick = function () {
            deleteTransaction(transaction.id);
        };

        li.appendChild(info);
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        transactionList.appendChild(li);
    });

}

// Edit
function editTransaction(transaction) {

    descriptionInput.value = transaction.title;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.category;

    editId = transaction.id;

    document.getElementById("submit-btn").textContent = "Update Transaction";
}

// Delete
async function deleteTransaction(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        await loadTransactions();

    } catch (error) {
        console.error(error);
        alert("Could not delete transaction.");
    }

}

// Summary
function updateSummary() {

    let income = 0;
    let expense = 0;

    transactions.forEach(function(transaction) {

        if (transaction.category.toLowerCase() === "income") {
            income += Number(transaction.amount);
        } else {
            expense += Number(transaction.amount);
        }

    });

    incomeElement.textContent = `₹${income}`;
    expensesElement.textContent = `₹${expense}`;
    balanceElement.textContent = `₹${income - expense}`;
}

function updateDisplay() {
    displayTransactions();
    updateSummary();
}

loadTransactions();