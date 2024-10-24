const axios = require('axios');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Helper function to calculate TWAP
function calculateTWAP(prices) {
  const total = prices.reduce((acc, curr) => acc + curr[1], 0);
  return total / prices.length;
}

// Export the function for Vercel serverless
module.exports = async (req, res) => {
  try {
    // Get price data for the past 7 days (CoinGecko will choose the interval automatically)
    const sevenDayData = await axios.get(`${COINGECKO_API}/coins/voi-network/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: 7,
      }
    });

    // Get price data for the past 30 days (CoinGecko will choose the interval automatically)
    const thirtyDayData = await axios.get(`${COINGECKO_API}/coins/voi-network/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: 30,
      }
    });

    const sevenDayTWAP = calculateTWAP(sevenDayData.data.prices);
    const thirtyDayTWAP = calculateTWAP(thirtyDayData.data.prices);

    // Set Cache-Control header to cache the response for 24 hours (86400 seconds)
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400');

    // Send the TWAP response
    res.json({
      sevenDayTWAP,
      thirtyDayTWAP,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching TWAP data' });
  }
};
