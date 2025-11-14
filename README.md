# Weather MCP Server

A simple Model Context Protocol (MCP) server built with TypeScript that provides weather information using the Open-Meteo API.

## Features

- 🌤️ **Get Weather**: Fetch current weather data for any city worldwide
- 👋 **Greet**: Simple greeting tool for testing
- 🌍 Uses free Open-Meteo API (no API key required)
- 🚀 Built with MCP TypeScript SDK
- 📡 HTTP transport support

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

## Usage

### Development Mode

Run the server with auto-reload:

```bash
npm run dev
```

### Production Mode

1. Build the TypeScript code:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

The server will start on `http://localhost:3000/mcp` by default. You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

## Connecting to the Server

### Using MCP Inspector

The easiest way to test your server:

```bash
npx @modelcontextprotocol/inspector
```

Then connect to: `http://localhost:3000/mcp`

### Using Claude Code

```bash
claude mcp add --transport http weather-server http://localhost:3000/mcp
```

### Using VS Code

```bash
code --add-mcp "{\"name\":\"weather-server\",\"type\":\"http\",\"url\":\"http://localhost:3000/mcp\"}"
```

### Using Cursor

Click [this deeplink](cursor://anysphere.cursor-deeplink/mcp/install?name=weather-server&config=eyJ1cmwiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvbWNwIn0%3D)

## Available Tools

### 1. get-weather

Get current weather information for any city.

**Input:**
```json
{
  "city": "Sydney"
}
```

**Output:**
```json
{
  "city": "Sydney, Australia",
  "temperature": 22.5,
  "weatherCode": 0,
  "windSpeed": 15.2,
  "humidity": 65,
  "description": "Clear sky"
}
```

**Example queries:**
- "What's the weather in Tokyo?"
- "Get me the current temperature in London"
- "How's the weather in New York?"

### 2. greet

Simple greeting tool for testing the server.

**Input:**
```json
{
  "name": "Alice"
}
```

**Output:**
```json
{
  "greeting": "Hello, Alice! Welcome to the Weather MCP Server!"
}
```

## API Information

This server uses the free [Open-Meteo API](https://open-meteo.com/) which provides:
- Current weather conditions
- No API key required
- Global coverage
- Reliable geocoding

## Project Structure

```
weather-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Development

The server is built using:
- **@modelcontextprotocol/sdk**: MCP TypeScript SDK
- **Express**: HTTP server
- **Zod**: Schema validation
- **TypeScript**: Type safety

## Health Check

The server includes a health check endpoint:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "server": "weather-mcp-server",
  "version": "1.0.0"
}
```

## Troubleshooting

### Port already in use

If port 3000 is already in use, specify a different port:

```bash
PORT=8080 npm run dev
```

### City not found

Make sure you're using the correct city name. The API uses geocoding to find cities, so try:
- Full city names: "New York" instead of "NYC"
- Including country if ambiguous: "London, UK" or "London, Ontario"

## License

MIT
