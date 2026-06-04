class ChatInterface {
  constructor() {
    this.conversationHistory = [];
    this.isLoading = false;
    this.loadHistory();
  }

  loadHistory() {
    const saved = sessionStorage.getItem("spcx_chat_history");
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
    }
  }

  saveHistory() {
    sessionStorage.setItem(
      "spcx_chat_history",
      JSON.stringify(this.conversationHistory)
    );
  }

  async sendMessage(message) {
    if (!message.trim() || this.isLoading) return;

    this.isLoading = true;
    const inputElement = document.getElementById("spcx-chat-input");
    const submitButton = document.getElementById("spcx-chat-submit");

    inputElement.disabled = true;
    submitButton.disabled = true;

    this.displayMessage(message, "user");
    inputElement.value = "";

    const loadingId = "loading-" + Date.now();
    const chatBody = document.getElementById("spcx-chat-body");
    const loadingDiv = document.createElement("div");
    loadingDiv.id = loadingId;
    loadingDiv.className = "spcx-chat-loading";
    loadingDiv.textContent = "Thinking...";
    chatBody.appendChild(loadingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage = data.message;

      this.conversationHistory.push({ role: "user", content: message });
      this.conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });
      this.saveHistory();

      loadingDiv.remove();
      this.displayMessage(assistantMessage, "assistant");
    } catch (error) {
      console.error("Chat error:", error);
      loadingDiv.textContent =
        "Error: Could not get response. Please try again.";
    } finally {
      this.isLoading = false;
      inputElement.disabled = false;
      submitButton.disabled = false;
      inputElement.focus();
    }
  }

  displayMessage(message, role) {
    const chatBody = document.getElementById("spcx-chat-body");
    const messageDiv = document.createElement("div");
    messageDiv.className = `spcx-chat-message ${role}`;
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  toggleChat() {
    const body = document.getElementById("spcx-chat-body");
    const footer = document.getElementById("spcx-chat-footer");
    const toggle = document.getElementById("spcx-chat-toggle");

    body.classList.toggle("collapsed");
    footer.classList.toggle("collapsed");
    toggle.classList.toggle("collapsed");

    sessionStorage.setItem(
      "spcx_chat_collapsed",
      body.classList.contains("collapsed")
    );
  }

  restoreState() {
    const isCollapsed =
      sessionStorage.getItem("spcx_chat_collapsed") === "true";
    if (isCollapsed) {
      this.toggleChat();
    }

    const chatBody = document.getElementById("spcx-chat-body");
    for (const msg of this.conversationHistory) {
      this.displayMessage(msg.content, msg.role);
    }
  }
}

let chat = null;

function initChat() {
  chat = new ChatInterface();

  document
    .getElementById("spcx-chat-header")
    .addEventListener("click", () => chat.toggleChat());

  document
    .getElementById("spcx-chat-submit")
    .addEventListener("click", () => {
      const input = document.getElementById("spcx-chat-input");
      chat.sendMessage(input.value);
    });

  document
    .getElementById("spcx-chat-input")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const input = document.getElementById("spcx-chat-input");
        chat.sendMessage(input.value);
      }
    });

  chat.restoreState();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChat);
} else {
  initChat();
}
