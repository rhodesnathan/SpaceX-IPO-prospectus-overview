#!/usr/bin/env node
/**
 * Anthropic Managed Agent client with SpaceX IPO context
 * Uses sessions API with streaming
 */

import Anthropic from "@anthropic-ai/sdk";

const SPACEX_IPO_CONTEXT = `
# SpaceX IPO Prospectus - Complete Reference

## Offering Details
- IPO Price: $135 per Class A share
- Shares Offered: 555.6M Class A common stock
- Gross Proceeds: $74.4B targeted raise
- Post-Money Valuation: $1.77T at IPO price
- Ticker: SPCX (Nasdaq)
- Trading Begin Date: June 12, 2026
- Prospectus Filed: May 20, 2026
- Pricing Date: June 11, 2026

## Lead Underwriters
- U.S.: Goldman Sachs, Morgan Stanley, BofA, Citi, JPMorgan
- Canada: Goldman Sachs Canada, Morgan Stanley Canada, RBC Dominion Securities

## Financial Metrics (2025 / Q1 2026)
- 2025 Revenue: $18.7B (consolidated)
- 2025 Adj. EBITDA: $6.6B (35% margin)
- 2025 Operating Loss (GAAP): -$2.6B
- Q1 2026 Revenue: $4.7B (3 months to Mar 31)
- 2025 Capex: $20.7B total

## Balance Sheet (Mar 31, 2026)
- Cash & Equivalents: $15.9B
- Long-term Debt: $29.1B
- Accumulated Deficit: -$41.3B
- Stockholders' Equity: $34.5B
- Bridge Loan Outstanding: $20B (matures September 2027)

## Business Segments

### Space (Investing Phase)
- 2025 Revenue: $4.1B
- 2025 Operating Loss: -$657M
- ~650 orbital launches annually
- 99%+ success rate
- 80%+ of global mass to orbit
- Starship R&D: $3B investment

### Connectivity (Starlink - Profitable)
- 2025 Revenue: $11.4B (+49.8% YoY)
- 2025 Operating Income: $4.4B
- Subscribers: 10.3M
- Countries Served: 164
- Satellites Deployed: 9,600
- Only segment generating real operating profit

### AI / xAI (Cash Negative)
- 2025 Revenue: $3.2B
- 2025 Operating Loss: -$6.4B
- 2025 Capex: $12.7B
- Products: Grok, X platform integration
- Compute Infrastructure: COLOSSUS I+II (~1 GW)
- Orbital AI compute planned for 2028+

## Valuation Multiples at $135/Share
- Price/Sales: ~95x (Tesla reference: ~9x)
- P/Adj. EBITDA: ~268x
- Premium embeds future AI compute, orbital infrastructure, and Mars thesis
- None of those future businesses generate revenue today

## Use of Proceeds
- AI compute infrastructure expansion
- Starship and launch infrastructure
- V3 satellite constellation scaling
- General corporate purposes
- No dividends planned

## Share Structure & Governance

### Class A Shares (What You're Buying)
- Votes per share: 1
- Economic rights: Yes
- Governance control: None
- Dividend: None planned

### Class B Shares (Musk's Control)
- Votes per share: 10
- Board control: Majority
- Convertible to Class A: Yes (1:1)
- Takeover protection: Yes
- Holder: Elon Musk

## Key Risks

### Critical
1. **Starship Dependency**: Entire growth thesis requires Starship at full commercial reusability and high cadence. Has not achieved this yet. Current rockets cannot deploy V3 or V2 Mobile satellites. If Starship slips, 95x revenue multiple hard to defend.

2. **$20B Bridge Loan - September 2027**: Must be refinanced or repaid ~15 months post-IPO. If capital markets tighten or stock underperforms, refinancing terms could be severely adverse.

3. **Governance Concentration**: Musk controls vote via Class B. At $1.77T you're betting on one person's judgment, focus, and continued commitment.

### Significant
- AI Segment Cash Furnace: $12.7B capex, $6.4B operating loss. Orbital AI compute not revenue-generating before 2028. Starlink funds all of this.
- Regulatory Surface Area: FAA, FCC, 164-country telecom regulators, EU AI law, FTC, content litigation
- Thin Float: ~3-4% of total shares. Morningstar projects 20-30% price swings vs Tesla's 10-15%. Limited liquidity to exit.

### Monitor
- Potential SpaceX/Tesla Merger: Late May 2026, Musk discussed with colleagues. No formal announcement.

## Market Signals
- Synthetic SPCX on Hyperliquid: ~$203/share
- Implied Valuation: ~$2.4T (36% above IPO price)
- Price Swing Projection: 20-30% vs Tesla's 10-15%

## Timeline & Milestones
- 2002: SpaceX founded by Elon Musk
- 2008: First private company to reach orbit (Falcon 1)
- 2012: Dragon first docks with ISS
- 2015: First successful propulsive landing of orbital-class booster
- 2019: First Starlink satellites launched
- 2020: First crewed ISS mission, Starlink commercial broadband opens
- 2023: Starship first launched, xAI founded (Grok-1 released)
- 2025: 10.3M Starlink subscribers, COLOSSUS II online, $18.7B revenue
- 2026: xAI acquired, Prospectus filed May 20, Trading begins June 12
- 2027: Bridge loan maturity, V3 Starlink deployment begins
- 2028+: Orbital AI compute first deployment, bulk of growth thesis begins

## Largest IPO in History
- SpaceX 2026: $74.4B
- Saudi Aramco: $29.4B
- Alibaba: $25B
- Meta: $16B
- Tesla: $1.7B
`;

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY environment variable not set");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const agentId = "agent_01YB5v2AfQMGUaR1twvBidX4";
  const environmentId = "env_012uXsTBv6ncXexYAqaBAL9i";

  try {
    // Create session
    const session = await client.beta.sessions.create({
      agent_id: agentId,
      environment_id: environmentId,
    });
    const sessionId = session.id;
    console.log(`✓ Session created: ${sessionId}\n`);

    // Get user input
    const userMessage = process.argv[2] || "What are the key financial metrics?";
    console.log(`You: ${userMessage}\n`);

    // Combine user message with context
    const messageWithContext = `${SPACEX_IPO_CONTEXT}\n\nUser Question: ${userMessage}`;

    process.stdout.write("Agent: ");

    let idle = false;
    const stream = await client.beta.sessions.events.stream({
      session_id: sessionId,
    });

    // Send user message
    await client.beta.sessions.events.send({
      session_id: sessionId,
      event: {
        type: "user.message",
        content: messageWithContext,
      },
    });

    // Process stream events
    for await (const event of stream) {
      if (event.type === "agent.message") {
        if ("text" in event && event.text) {
          process.stdout.write(event.text);
        }
      } else if (event.type === "session.status_idle") {
        console.log("\n");
        idle = true;
        break;
      } else if (event.type === "error") {
        if ("error" in event) {
          console.error(`\n✗ Error: ${event.error}`);
          process.exit(1);
        }
      }
    }

    if (idle) {
      console.log("✓ Session idle - complete");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`✗ Fatal Error: ${error.message}`);
    } else {
      console.error("✗ Fatal Error: Unknown error");
    }
    process.exit(1);
  }
}

main();
