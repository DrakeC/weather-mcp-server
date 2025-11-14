import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';

// Create an MCP server
const server = new McpServer({
    name: 'weather-mcp-server',
    version: '1.0.0'
});

// Weather API tool - fetches weather data for a city
server.registerTool(
    'get-weather',
    {
        title: 'Get Weather',
        description: 'Get current weather information for a city using Open-Meteo API',
        inputSchema: {
            city: z.string().describe('City name (e.g., Sydney, London, New York)')
        },
        outputSchema: {
            city: z.string(),
            temperature: z.number(),
            weatherCode: z.number(),
            windSpeed: z.number(),
            humidity: z.number(),
            description: z.string()
        }
    },
    async ({ city }) => {
        try {
            // First, geocode the city to get coordinates
            const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();

            if (!geocodeData.results || geocodeData.results.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ error: `City "${city}" not found` })
                    }],
                    isError: true
                };
            }

            const location = geocodeData.results[0];
            const { latitude, longitude, name, country } = location;

            // Get weather data for the coordinates
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();

            // Map weather codes to descriptions
            const weatherDescriptions: { [key: number]: string } = {
                0: 'Clear sky',
                1: 'Mainly clear',
                2: 'Partly cloudy',
                3: 'Overcast',
                45: 'Foggy',
                48: 'Depositing rime fog',
                51: 'Light drizzle',
                53: 'Moderate drizzle',
                55: 'Dense drizzle',
                61: 'Slight rain',
                63: 'Moderate rain',
                65: 'Heavy rain',
                71: 'Slight snow',
                73: 'Moderate snow',
                75: 'Heavy snow',
                77: 'Snow grains',
                80: 'Slight rain showers',
                81: 'Moderate rain showers',
                82: 'Violent rain showers',
                85: 'Slight snow showers',
                86: 'Heavy snow showers',
                95: 'Thunderstorm',
                96: 'Thunderstorm with slight hail',
                99: 'Thunderstorm with heavy hail'
            };

            const weatherCode = weatherData.current.weather_code;
            const output = {
                city: `${name}, ${country}`,
                temperature: weatherData.current.temperature_2m,
                weatherCode: weatherCode,
                windSpeed: weatherData.current.wind_speed_10m,
                humidity: weatherData.current.relative_humidity_2m,
                description: weatherDescriptions[weatherCode] || 'Unknown weather condition'
            };

            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify(output, null, 2)
                }],
                structuredContent: output
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ error: `Failed to fetch weather: ${errorMessage}` })
                }],
                isError: true
            };
        }
    }
);

// Add a simple greeting tool for testing
server.registerTool(
    'greet',
    {
        title: 'Greet User',
        description: 'Returns a friendly greeting',
        inputSchema: {
            name: z.string().describe('Name to greet')
        },
        outputSchema: {
            greeting: z.string()
        }
    },
    async ({ name }) => {
        const output = { greeting: `Hello, ${name}! Welcome to the Weather MCP Server!` };
        return {
            content: [{
                type: 'text',
                text: JSON.stringify(output)
            }],
            structuredContent: output
        };
    }
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'weather-mcp-server', version: '1.0.0' });
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`🌤️  Weather MCP Server running on http://localhost:${port}/mcp`);
    console.log(`📊 Health check available at http://localhost:${port}/health`);
    console.log(`\n🔧 Available tools:`);
    console.log(`   - get-weather: Get current weather for any city`);
    console.log(`   - greet: Simple greeting tool`);
    console.log(`\n🔌 Connect using:`);
    console.log(`   - MCP Inspector: npx @modelcontextprotocol/inspector`);
    console.log(`   - Claude Code: claude mcp add --transport http weather-server http://localhost:${port}/mcp`);
}).on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});
