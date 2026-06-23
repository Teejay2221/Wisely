// Sidebar toggle now lives in navbar.js, since navbar.js is loaded
// as a module on every page consistently (unlike this file, which
// gets loaded differently from page to page).

async function sendMessage() {
  const input = document.getElementById('userInput').value;
  if (!input) return;
  appendMessage('You', input);
  document.getElementById('userInput').value = '';

  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful financial advisor for students and working students. Give practical, friendly, and simple advice about budgeting, saving, and managing expenses.' },
        { role: 'user', content: input }
      ]
    })
  });
  const data = await response.json();
  const aiMessage = data.choices[0].message.content;
  appendMessage('Advisor', aiMessage);
}

function appendMessage(sender, message) {
  const chatlog = document.getElementById('chatlog');
  chatlog.innerHTML += `<b>${sender}:</b> ${message}<br>`;
  chatlog.scrollTop = chatlog.scrollHeight;
}

function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    chatbot.classList.toggle('open');
}


/* Analysis UI */
const chartCanvas = document.getElementById('expensePieChart');

if (chartCanvas) {

    /* Get expenses from localStorage */
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

     /* Get HTML elements */
    const totalMonthlySpending = document.getElementById('totalMonthlySpending');
    const highestCategory = document.getElementById('highestCategory');
    const breakdownList = document.getElementById('breakdownList');

    /* Categories */
    let food = 0;
    let transport = 0;
    let shopping = 0;
    let other = 0;

    /* Loop through expenses */
    expenses.forEach(expense => {

        if (expense.category === 'Food') {
            food += expense.amount;
        }

        else if (expense.category === 'Transport') {
            transport += expense.amount;
        }

        else if (expense.category === 'Shopping') {
            shopping += expense.amount;
        }

        else {
            other += expense.amount;
        }
    });

    /* Total expenses */
    let total = food + transport + shopping + other;

    /* Update total spending */
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

    /* Show highest category */
    if (total === 0) {
        highestCategory.textContent = 'No Data';
    } else {
        highestCategory.textContent = highestName;
    }

    /* Breakdown list */
    breakdownList.innerHTML = `
    
    <div class="breakdownItem">
        <span class="colorIndicator" style="background-color: #E6A15C;"></span>
        <span class="categoryName">Food</span>
        <span class="categoryAmount">
            ₱${food.toFixed(2)}
        </span>
    </div>

    <div class="breakdownItem">
        <span class="colorIndicator" style="background-color: #5C9EAD;"></span>
        <span class="categoryName">Transport</span>
        <span class="categoryAmount">
            ₱${transport.toFixed(2)}
        </span>
    </div>

    <div class="breakdownItem">
        <span class="colorIndicator" style="background-color: #E85D75;"></span>
        <span class="categoryName">Shopping</span>
        <span class="categoryAmount">
            ₱${shopping.toFixed(2)}
        </span>
    </div>

    <div class="breakdownItem">
        <span class="colorIndicator" style="background-color: #A78BFA;"></span>
        <span class="categoryName">Other</span>
        <span class="categoryAmount">
            ₱${other.toFixed(2)}
        </span>
    </div>
    `;

    /* Create chart */
    const ctx = chartCanvas.getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',

        data: {
            labels: ['Food', 'Transport', 'Shopping', 'Other'],

            datasets: [{
                data: [food, transport, shopping, other],

                backgroundColor: [
                    '#E6A15C',
                    '#5C9EAD',
                    '#E85D75',
                    '#A78BFA'
                ],

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