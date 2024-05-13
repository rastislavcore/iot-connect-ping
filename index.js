import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

app.get('/xcb', async (req, res) => {
    const urls = [
        'https://api.ping.exchange/marketdata/api/v1/tickers?symbol=xcb_usdc',
        'https://api.ping.exchange/marketdata/api/v1/tickers?symbol=ctn_usdc'
    ];

    try {
        // Fetch all URLs in parallel
        const responses = await Promise.all(urls.map(url => fetch(url)));

        // Check for any non-ok responses
        if (!responses.every(response => response.ok)) {
            throw new Error('Failed to fetch data from the API');
        }

        // Parse JSON for all responses in parallel
        const dataArrays = await Promise.all(responses.map(response => response.json()));

        // Check for any empty data
        if (!dataArrays.every(data => data.length > 0)) {
            throw new Error('No data available');
        }

        // Extracting the first item in each data array (assuming the relevant ticker is the first item)
        const lastPriceRoundedXCB = parseFloat(dataArrays[0][0].lastPrice).toFixed(2);
        const lastPriceRoundedCTN = parseFloat(dataArrays[1][0].lastPrice).toFixed(2);

        const formattedResult = {
            frames: [
                {
                    text: `${lastPriceRoundedXCB} $`,
                    icon: 60433
                },
                {
                    text: `${lastPriceRoundedCTN} $`,
                    icon: 60438
                }
            ]
        };

        res.status(200).json(formattedResult);
    } catch (error) {
        console.error("Error:", error.message);
        let errorCode = 500; // Default is 500 Internal Server Error
        let errorMessage = "Err 3"; // Default for unexpected errors
        switch (error.message) {
            case 'Failed to fetch data from the API':
                errorCode = 502;
                errorMessage = "Err 1"; // Could not connect to API
                break;
            case 'No data available':
                errorCode = 404;
                errorMessage = "Err 2"; // No data found
                break;
        }
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
