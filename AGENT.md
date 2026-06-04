# Anthropic Managed Agent Client

Minimal clients for interacting with Anthropic Managed Agents using the sessions API with SpaceX IPO context.

## Setup

### Prerequisites
- Python 3.8+ (for Python version) OR Node.js 18+ (for TypeScript version)
- Anthropic API key with agent access

### Environment Variable
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

## Python Version

### Installation
```bash
pip install anthropic
```

### Usage
```bash
python agent_client.py
```

Prompts for user input, then streams agent response.

## TypeScript/Node.js Version

### Installation
```bash
npm install
# or
yarn install
```

### Usage
```bash
# Interactive mode (prompts for input)
node agent_client.ts

# With command-line argument
node agent_client.ts "What is the IPO price?"
```

Streams agent response to stdout.

## Features

### Embedded Context
Both versions include comprehensive SpaceX IPO context covering:
- Offering details (price, shares, proceeds)
- Financial metrics (revenue, EBITDA, capex)
- Business segments (Space, Connectivity, AI)
- Risk factors (critical, significant, monitor)
- Timeline and milestones
- Governance structure
- Market signals

### Agent Integration
- Creates session via `client.beta.sessions.create()`
- Opens event stream via `client.beta.sessions.events.stream()`
- Sends user message via `client.beta.sessions.events.send()`
- Streams `agent.message` events in real-time
- Exits cleanly on `session.status_idle`
- Error handling for API failures

## Agents

- **Agent ID**: `agent_01YB5v2AfQMGUaR1twvBidX4`
- **Environment ID**: `env_012uXsTBv6ncXexYAqaBAL9i`

## Example Queries

```bash
"What are the key financial metrics?"
"What are the critical risks?"
"Tell me about the Starlink segment"
"What does the $20B bridge loan mean?"
```
