#!/usr/bin/env python3
"""Minimal Anthropic Managed Agent client using sessions API."""

import os
import sys
from anthropic import Anthropic

def main():
    try:
        client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

        agent_id = "agent_01YB5v2AfQMGUaR1twvBidX4"
        environment_id = "env_012uXsTBv6ncXexYAqaBAL9i"

        # Create session
        session = client.beta.sessions.create(
            agent_id=agent_id,
            environment_id=environment_id
        )
        session_id = session.id
        print(f"Session created: {session_id}\n")

        # Send user message and stream response
        user_message = input("You: ").strip()
        if not user_message:
            print("No message provided.")
            return

        print("\nAgent: ", end="", flush=True)

        with client.beta.sessions.events.stream(
            session_id=session_id,
        ) as stream:
            # Send user message event
            client.beta.sessions.events.send(
                session_id=session_id,
                event={
                    "type": "user.message",
                    "content": user_message,
                },
            )

            # Process stream events
            for event in stream:
                if event.type == "agent.message":
                    if hasattr(event, 'text'):
                        print(event.text, end="", flush=True)
                elif event.type == "session.status_idle":
                    print("\n\n[Session idle - done]")
                    break
                elif event.type == "error":
                    print(f"\n[Error] {getattr(event, 'error', 'Unknown error')}")
                    sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n[Interrupted]")
        sys.exit(0)
    except Exception as e:
        print(f"\n[Fatal Error] {type(e).__name__}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
