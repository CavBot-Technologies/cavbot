document.addEventListener("DOMContentLoaded", () => {
  const LOGIN_URL = "https://app.cavbot.io/auth?mode=login";
  const SIGNUP_URL = "https://app.cavbot.io/auth?mode=signup";
  const OPEN_APP_URL = "https://app.cavbot.io/cavai";
  const ACTIVE_MODEL_ID = "qwen3.5-flash";
  const MODEL_OPTIONS = [
    { id: "qwen3.5-flash", label: "Qwen3.5-Flash", locked: false },
    { id: "auto", label: "CavAi Auto", locked: true },
    { id: "deepseek-chat", label: "DeepSeek Chat", locked: true },
    { id: "qwen-plus-character", label: "CavBot Companion", locked: true },
    { id: "deepseek-reasoner", label: "DeepSeek Reasoner", locked: true },
    { id: "qwen3.5-plus", label: "Qwen3.5-Plus", locked: true },
    { id: "qwen3-max", label: "Qwen3-Max", locked: true },
    { id: "qwen3-coder", label: "Caven (powered by Qwen3-Coder)", locked: true },
    { id: "qwen-image-2.0-pro", label: "Image Studio (Qwen-Image-2.0-Pro)", locked: true },
    { id: "qwen-image-edit-max", label: "Image Edit (Qwen-Image-Edit-Max)", locked: true },
  ];

  const thread = document.querySelector("#cavai-thread");
  const composeForm = document.querySelector("#cavai-compose");
  const promptInput = document.querySelector("#cavai-prompt");
  const sendButton = document.querySelector("#cavai-send");
  const openAppButton = document.querySelector("#cavai-open-app");

  const modelTrigger = document.querySelector("#cavai-model-trigger");
  const modelMenu = document.querySelector("#cavai-model-menu");
  const modelMenuList = document.querySelector("#cavai-model-menu-list");

  const authModal = document.querySelector("#cavai-auth-modal");
  const authModalBackdrop = document.querySelector("#cavai-auth-modal-backdrop");
  const authModalClose = document.querySelector("#cavai-auth-modal-close");
  const authModalCopy = document.querySelector("#cavai-auth-modal-copy");
  const authModalLogin = document.querySelector("#cavai-auth-login");
  const authModalSignup = document.querySelector("#cavai-auth-signup");

  if (!thread || !composeForm || !promptInput || !sendButton || !openAppButton) return;

  if (authModalLogin) authModalLogin.setAttribute("href", LOGIN_URL);
  if (authModalSignup) authModalSignup.setAttribute("href", SIGNUP_URL);

  let activeModelId = ACTIVE_MODEL_ID;
  let submitting = false;
  let currentSessionId = "";
  const transcriptRows = [];

  function s(value) {
    return String(value ?? "").trim();
  }

  function scrollThreadToBottom() {
    thread.scrollTop = thread.scrollHeight;
  }

  function lockMetaLabel(locked) {
    if (locked) return "Locked";
    return "Active";
  }

  function renderModelMenu() {
    if (!modelMenuList) return;
    modelMenuList.replaceChildren();

    MODEL_OPTIONS.forEach((option) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "cavai-model-item";
      if (option.locked) row.classList.add("is-locked");
      if (option.id === activeModelId) row.classList.add("is-active");
      row.setAttribute("data-model-id", option.id);

      const label = document.createElement("span");
      label.textContent = option.label;

      const pill = document.createElement("span");
      pill.className = "cavai-model-lock-pill";
      if (option.locked) {
        pill.innerHTML = '<span aria-hidden="true">🔒</span> Locked';
      } else {
        pill.textContent = lockMetaLabel(false);
      }

      row.appendChild(label);
      row.appendChild(pill);

      row.addEventListener("click", () => {
        if (option.locked) {
          openAuthModal("Sign in to unlock this model.");
          return;
        }
        activeModelId = option.id;
        closeModelMenu();
        renderModelMenu();
      });

      modelMenuList.appendChild(row);
    });
  }

  function openModelMenu() {
    if (!modelMenu) return;
    modelMenu.hidden = false;
    if (modelTrigger) modelTrigger.setAttribute("aria-expanded", "true");
  }

  function closeModelMenu() {
    if (!modelMenu) return;
    modelMenu.hidden = true;
    if (modelTrigger) modelTrigger.setAttribute("aria-expanded", "false");
  }

  function openAuthModal(message) {
    if (!authModal) return;
    if (authModalCopy) {
      authModalCopy.textContent = s(message) || "Sign in to continue in CavAi and unlock full model access.";
    }
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    authModal.classList.add("is-open");
    authModal.setAttribute("aria-hidden", "false");
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove("is-open");
    authModal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }

  function setSubmitting(nextSubmitting) {
    submitting = nextSubmitting;
    sendButton.disabled = nextSubmitting;
    promptInput.disabled = nextSubmitting;
    sendButton.textContent = nextSubmitting ? "Sending..." : "Send";
  }

  function appendMessage(role, text, options = {}) {
    const item = document.createElement("article");
    item.className = `cavai-message cavai-message-${role}`;
    if (options.loading === true) item.classList.add("is-loading");

    const body = document.createElement("p");
    if (options.loading === true) {
      body.innerHTML = [
        '<span class="cavai-message-loading-dot" aria-hidden="true"></span>',
        '<span class="cavai-message-loading-dot" aria-hidden="true"></span>',
        '<span class="cavai-message-loading-dot" aria-hidden="true"></span>',
      ].join("");
    } else {
      body.textContent = text;
    }

    item.appendChild(body);
    thread.appendChild(item);
    scrollThreadToBottom();

    if (!options.ephemeral && (role === "user" || role === "assistant")) {
      transcriptRows.push({ role, text: s(text) });
      while (transcriptRows.length > 14) transcriptRows.shift();
    }

    return item;
  }

  function buildTranscriptForRequest(nextPrompt) {
    const rows = transcriptRows
      .slice(-10)
      .map((row) => `${row.role === "user" ? "User" : "Assistant"}: ${row.text}`)
      .join("\n\n");

    if (!rows) return "";
    return `${rows}\n\nUser: ${nextPrompt}`.slice(0, 6000);
  }

  function resolveAssistEndpoints() {
    const candidates = [
      s(window.CAVAI_PREVIEW_ASSIST_ENDPOINT),
      "/api/public/cavai/preview-assist",
      "https://www.cavbot.io/api/public/cavai/preview-assist",
      "https://cavbot.io/api/public/cavai/preview-assist",
      "https://app.cavbot.io/api/public/cavai/preview-assist",
    ].filter(Boolean);

    const unique = [];
    const seen = new Set();

    candidates.forEach((endpoint) => {
      if (seen.has(endpoint)) return;
      seen.add(endpoint);
      unique.push(endpoint);
    });

    return unique;
  }

  function isPublicPreviewEndpoint(endpoint) {
    return /\/api\/public\/cavai\/preview-assist(?:[/?]|$)/i.test(s(endpoint));
  }

  async function requestAssist(promptValue) {
    const endpoints = resolveAssistEndpoints();
    let lastError = "";

    const payload = {
      action: "technical_recap",
      surface: "general",
      prompt: promptValue,
      model: activeModelId,
      reasoningLevel: "low",
      sessionId: s(currentSessionId) || undefined,
      origin: `${window.location.origin}${window.location.pathname}`,
      contextLabel: "Website preview",
      context: {
        mode: "website_preview",
        source: "cavbot.io/cavai",
        transcript: buildTranscriptForRequest(promptValue),
      },
    };

    for (let index = 0; index < endpoints.length; index += 1) {
      const endpoint = endpoints[index];

      try {
        const useGuestPreviewMode = isPublicPreviewEndpoint(endpoint);
        const response = await fetch(endpoint, {
          method: "POST",
          credentials: useGuestPreviewMode ? "omit" : "include",
          mode: "cors",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "x-cavbot-csrf": "1",
          },
          body: JSON.stringify(payload),
        });

        const body = await response.json().catch(() => ({}));
        const errorCode = s(body?.error).toUpperCase();

        const isAuthFailure =
          errorCode === "UNAUTHORIZED"
          || errorCode === "NO_SESSION"
          || errorCode === "BAD_SESSION"
          || errorCode === "UNAUTHENTICATED"
          || (response.status === 401 && !errorCode);

        if (isAuthFailure) {
          return {
            type: "auth",
            message: s(body?.message) || "Sign in to continue this CavAi session.",
          };
        }

        if (response.status === 404) {
          continue;
        }

        if (!response.ok || body?.ok !== true) {
          lastError = s(body?.message) || `CavAi preview request failed (${response.status}).`;
          continue;
        }

        const answer = s(body?.data?.answer || body?.answer);
        if (!answer) {
          lastError = "CavAi returned an empty response.";
          continue;
        }

        currentSessionId = s(body?.sessionId || currentSessionId);

        return {
          type: "ok",
          answer,
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Network request failed.";
      }
    }

    return {
      type: "error",
      message: lastError || "CavAi preview is unavailable right now.",
    };
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const promptValue = s(promptInput.value);
    if (!promptValue) return;

    appendMessage("user", promptValue);
    promptInput.value = "";

    setSubmitting(true);
    const loading = appendMessage("assistant", "", { loading: true, ephemeral: true });

    const result = await requestAssist(promptValue);

    loading.remove();

    if (result.type === "ok") {
      appendMessage("assistant", result.answer);
      setSubmitting(false);
      return;
    }

    if (result.type === "auth") {
      appendMessage("system", "Sign in to continue this CavAi thread and unlock full model access.");
      openAuthModal(result.message);
      setSubmitting(false);
      return;
    }

    appendMessage(
      "system",
      `${result.message}\n\nOpen full CavAi in app to continue if this preview endpoint is unavailable.`,
    );
    setSubmitting(false);
  }

  composeForm.addEventListener("submit", onSubmit);

  openAppButton.addEventListener("click", () => {
    if (typeof window.__cavbotOpenCavGuardModal === "function") {
      window.__cavbotOpenCavGuardModal();
      return;
    }
    window.location.href = OPEN_APP_URL;
  });

  document.querySelectorAll("[data-cavai-lock]").forEach((button) => {
    button.addEventListener("click", () => {
      openAuthModal("Sign in to unlock uploads, image tools, and advanced model controls.");
    });
  });

  if (modelTrigger && modelMenu) {
    modelTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      const opening = modelMenu.hidden;
      if (opening) openModelMenu();
      else closeModelMenu();
    });

    document.addEventListener("click", (event) => {
      if (!modelMenu.contains(event.target) && !modelTrigger.contains(event.target)) {
        closeModelMenu();
      }
    });
  }

  if (authModalBackdrop) {
    authModalBackdrop.addEventListener("click", closeAuthModal);
  }
  if (authModalClose) {
    authModalClose.addEventListener("click", closeAuthModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModelMenu();
      closeAuthModal();
    }
  });

  renderModelMenu();
  closeModelMenu();
});
