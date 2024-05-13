const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

app.get('/xcb', async (req, res) => {
    const url = 'https://api.ping.exchange/marketdata/api/v1/tickers?symbol=xcb_usdc';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data from the API'); // This will handle HTTP errors from the API
        }
        const data = await response.json();
        if (data.length > 0) {
            const ticker = data[0];
            const lastPriceRounded = parseFloat(ticker.lastPrice).toFixed(2);

            const formattedResult = {
                frames: [
                    {
                        text: `₡ = ${lastPriceRounded} $`
                    }
                ]
            };

            res.status(200).json(formattedResult);
        } else {
            throw new Error('No data available'); // Error type 2: No data in the array
        }
    } catch (error) {
        console.error("Error:", error.message);
        // Determine error code and message based on the error type
        let errorCode = 500; // Default is 500 Internal Server Error
        let errorMessage = "Err 3"; // Default for unexpected errors
        switch (error.message) {
            case 'Failed to fetch data from the API':
                errorCode = 502; // 502 Bad Gateway indicates upstream server issues
                errorMessage = "Err 1"; // Could not connect to API
                break;
            case 'No data available':
                errorCode = 404; // 404 Not Found for no data found
                errorMessage = "Err 2"; // No data found
                break;
        }
        // Consistent error format without the icon
        const errorResult = {
            frames: [
                {
                    text: errorMessage
                }
            ]
        };
        res.status(errorCode).json(errorResult);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
