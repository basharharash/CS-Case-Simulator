// Add Chart.js CDN in your HTML head section
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

document.getElementById('start-simulation-btn').addEventListener('click', startSimulation);
document.getElementById('stop-simulation-btn').addEventListener('click', stopSimulation);
document.getElementById('open-one-case-btn').addEventListener('click', openOneCase);

let tries = 0;
let totalSimulations = 0;
let rarityCounts = {
    'Common': 0,
    'Uncommon': 0,
    'Rare': 0,
    'Red': 0,
    'Gold': 0
};
let simulationInterval;
let resultsArray = [];
let cumulativeCounts = {
    'Common': [],
    'Uncommon': [],
    'Rare': [],
    'Red': [],
    'Gold': []
};
let chartGenerated = false;

function startSimulation() {
    // Get the number of simulations from the input
    const simulationInput = document.getElementById('simulation-count');
    totalSimulations = parseInt(simulationInput.value);

    if (isNaN(totalSimulations) || totalSimulations <= 0) {
        alert('Please enter a valid number of cases to open.');
        return;
    }

    // Disable buttons and input
    document.getElementById('start-simulation-btn').disabled = true;
    document.getElementById('stop-simulation-btn').disabled = false;
    document.getElementById('open-one-case-btn').disabled = true;
    simulationInput.disabled = true;

    // Reset counters and arrays
    tries = 0;
    rarityCounts = {
        'Common': 0,
        'Uncommon': 0,
        'Rare': 0,
        'Red': 0,
        'Gold': 0
    };
    resultsArray = [];
    cumulativeCounts = {
        'Common': [],
        'Uncommon': [],
        'Rare': [],
        'Red': [],
        'Gold': []
    };
    chartGenerated = false;

    // Clear previous results and hide chart button and canvas
    document.getElementById('results-tbody').innerHTML = '';
    document.getElementById('statistics').style.display = 'block';
    document.getElementById('chart-container').style.display = 'none';
    const chartButton = document.getElementById('show-chart-btn');
    chartButton.style.display = 'none';
    chartButton.disabled = false;
    if (chartInstance) {
        chartInstance.destroy();
    }

    updateStatistics(); // Reset stats display

    // Start the simulation interval
    simulationInterval = setInterval(openCase, 10); // Adjust delay as needed (milliseconds)
}

function stopSimulation() {
    clearInterval(simulationInterval);
    document.getElementById('start-simulation-btn').disabled = false;
    document.getElementById('stop-simulation-btn').disabled = true;
    document.getElementById('open-one-case-btn').disabled = false;
    document.getElementById('simulation-count').disabled = false;

    // Show chart button if not already generated
    if (!chartGenerated) {
        document.getElementById('show-chart-btn').style.display = 'inline-block';
    }
}

function openCase() {
    if (tries >= totalSimulations) {
        // Simulation complete
        clearInterval(simulationInterval);
        document.getElementById('start-simulation-btn').disabled = false;
        document.getElementById('stop-simulation-btn').disabled = true;
        document.getElementById('open-one-case-btn').disabled = false;
        document.getElementById('simulation-count').disabled = false;

        // Show chart button
        document.getElementById('show-chart-btn').style.display = 'inline-block';
        return;
    }

    tries++;
    const rarity = getRandomRarity();
    rarityCounts[rarity.rarity]++;
    resultsArray.push(rarity.rarity);
    updateCumulativeCounts(rarity.rarity);
    displayResult(rarity);
    updateStatistics();
}

function openOneCase() {
    // Reset counters if no simulation has been run
    if (tries === 0 && resultsArray.length === 0) {
        document.getElementById('statistics').style.display = 'block';
    }

    tries++;
    const rarity = getRandomRarity();
    rarityCounts[rarity.rarity]++;
    resultsArray.push(rarity.rarity);
    updateCumulativeCounts(rarity.rarity);
    displayResult(rarity);
    updateStatistics();
}

function getRandomRarity() {
    const exponent = 1;
    const randomNum = Math.pow(Math.random(), exponent) * 100;

    if (randomNum < 50) {
        return { randomNum, rarity: 'Common', className: 'common' };
    } else if (randomNum < 80) {
        return { randomNum, rarity: 'Uncommon', className: 'uncommon' };
    } else if (randomNum < 95) {
        return { randomNum, rarity: 'Rare', className: 'rare' };
    } else if (randomNum < 99.75) {
        return { randomNum, rarity: 'Red', className: 'very-rare' };
    } else {
        return { randomNum, rarity: 'Gold', className: 'ultra-rare' };
    }
}

function displayResult(rarity) {
    const resultsTbody = document.getElementById('results-tbody');

    // Append the new row
    const row = document.createElement('tr');
    row.className = `case-result ${rarity.className}`;
    row.innerHTML = `<td>${tries}</td><td>${rarity.rarity}</td>`;
    resultsTbody.appendChild(row);

    // Scroll to the bottom of the table container
    const simulationContainer = document.getElementById('simulation-container');
    simulationContainer.scrollTop = simulationContainer.scrollHeight;
}

function updateStatistics() {
    document.getElementById('total-attempts').textContent = tries;
    document.getElementById('common-count').textContent = `${rarityCounts['Common']} (${((rarityCounts['Common'] / tries) * 100).toFixed(2)}%)`;
    document.getElementById('uncommon-count').textContent = `${rarityCounts['Uncommon']} (${((rarityCounts['Uncommon'] / tries) * 100).toFixed(2)}%)`;
    document.getElementById('rare-count').textContent = `${rarityCounts['Rare']} (${((rarityCounts['Rare'] / tries) * 100).toFixed(2)}%)`;
    document.getElementById('red-count').textContent = `${rarityCounts['Red']} (${((rarityCounts['Red'] / tries) * 100).toFixed(2)}%)`;
    document.getElementById('gold-count').textContent = `${rarityCounts['Gold']} (${((rarityCounts['Gold'] / tries) * 100).toFixed(4)}%)`;
}

function updateCumulativeCounts(rarity) {
    const lastCounts = {
        'Common': cumulativeCounts['Common'][cumulativeCounts['Common'].length - 1] || 0,
        'Uncommon': cumulativeCounts['Uncommon'][cumulativeCounts['Uncommon'].length - 1] || 0,
        'Rare': cumulativeCounts['Rare'][cumulativeCounts['Rare'].length - 1] || 0,
        'Red': cumulativeCounts['Red'][cumulativeCounts['Red'].length - 1] || 0,
        'Gold': cumulativeCounts['Gold'][cumulativeCounts['Gold'].length - 1] || 0
    };

    // Update counts
    for (let key in cumulativeCounts) {
        if (key === rarity) {
            cumulativeCounts[key].push(lastCounts[key] + 1);
        } else {
            cumulativeCounts[key].push(lastCounts[key]);
        }
    }
}

let chartInstance = null;

document.getElementById('show-chart-btn').addEventListener('click', () => {
    generateChart();
    document.getElementById('chart-container').style.display = 'block';
    document.getElementById('show-chart-btn').disabled = true;
    chartGenerated = true;
});

function generateChart() {
    const ctx = document.getElementById('results-chart').getContext('2d');
    const labels = resultsArray.map((_, index) => index + 1);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Common',
                data: cumulativeCounts['Common'],
                borderColor: 'grey',
                fill: false,
                borderWidth: 1
            },
            {
                label: 'Uncommon',
                data: cumulativeCounts['Uncommon'],
                borderColor: 'blue',
                fill: false,
                borderWidth: 1
            },
            {
                label: 'Rare',
                data: cumulativeCounts['Rare'],
                borderColor: 'purple',
                fill: false,
                borderWidth: 1
            },
            {
                label: 'Red',
                data: cumulativeCounts['Red'],
                borderColor: 'red',
                fill: false,
                borderWidth: 1
            },
            {
                label: 'Gold',
                data: cumulativeCounts['Gold'],
                borderColor: 'gold',
                fill: false,
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: 'gold',
                showLine: false // Only show points for Gold
            }
        ]
    };

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            animation: {
                duration: 0
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Attempt Number'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Count'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}
