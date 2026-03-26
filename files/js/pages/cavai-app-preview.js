document.addEventListener("DOMContentLoaded", () => {
  const composeTemplate = document.querySelector("#cavai-compose-template");
  const composerFooter = document.querySelector("#cavai-composer-footer");
  const footerComposerHost = document.querySelector("#cavai-footer-composer-host");
  const inlineComposerHost = document.querySelector("#cavai-inline-composer-host");

  if (
    composeTemplate instanceof HTMLTemplateElement
    && footerComposerHost
    && !document.querySelector("#cavai-compose")
  ) {
    footerComposerHost.appendChild(composeTemplate.content.cloneNode(true));
  }

  const AGENT_GROUPS = [
    {
      id: "companion",
      label: "Companion",
      agents: [
        {
          name: "Financial Advisor",
          iconSrc: "/icons/finance-symbol-of-four-currencies-on-a-hand-svgrepo-com.svg",
        },
        {
          name: "Therapist Support",
          iconSrc: "/icons/friend-svgrepo-com.svg",
        },
        {
          name: "Mentor",
          iconSrc: "/icons/person-svgrepo-com.svg",
        },
        {
          name: "Best Friend",
          iconSrc: "/icons/teddy-bear-with-heart-svgrepo-com.svg",
        },
        {
          name: "Relationship Advisor",
          iconSrc: "/icons/relationship-counseling-marriage-counseling-couples-therapy-marriage-therapy-svgrepo-com.svg",
        },
        {
          name: "Philosopher",
          iconSrc: "/icons/priest-2-svgrepo-com.svg",
        },
        {
          name: "Focus Coach",
          iconSrc: "/icons/focus-svgrepo-com.svg",
        },
        {
          name: "Life Strategist",
          iconSrc: "/icons/achievement-2-svgrepo-com.svg",
        },
      ],
    },
    {
      id: "cavai",
      label: "CavAi",
      agents: [
        {
          name: "Messenger",
          iconSrc: "/icons/smartphone-2-svgrepo-com.svg",
        },
        {
          name: "Content Creator",
          iconSrc: "/icons/app/aperture-svgrepo-com.svg",
        },
        {
          name: "Counsel",
          iconSrc: "/icons/legal-hammer-symbol-svgrepo-com.svg",
        },
        {
          name: "PDF Studio",
          iconSrc: "/icons/pdf-file-svgrepo-com.svg",
        },
        {
          name: "404 Builder",
          iconSrc: "/icons/link-broken-svgrepo-com.svg",
        },
        {
          name: "Doc Review",
          iconSrc: "/icons/doc-on-doc-fill-svgrepo-com.svg",
        },
        {
          name: "Web Research Analyst",
          iconSrc: "/icons/app/connection-svgrepo-com.svg",
        },
        {
          name: "Incident Analyst",
          iconSrc: "/icons/app/cavcode/agents/alert-symbol-svgrepo-com.svg",
        },
        {
          name: "Storage Organizer",
          iconSrc: "/icons/app/storage-svgrepo-com.svg",
        },
        {
          name: "Access Auditor",
          iconSrc: "/icons/app/cavcode/agents/grapheneos-auditor-svgrepo-com.svg",
        },
        {
          name: "Thread Summarizer",
          iconSrc: "/icons/app/cavcode/agents/message-basic-app-conversation-chat-svgrepo-com.svg",
        },
        {
          name: "Knowledge Grounding",
          iconSrc: "/icons/app/deep-learning-svgrepo-com.svg",
        },
        {
          name: "Deterministic Research Planner",
          iconSrc: "/icons/app/research-svgrepo-com.svg",
        },
        {
          name: "Citation-Only Answerer",
          iconSrc: "/icons/app/block-quote-svgrepo-com.svg",
        },
        {
          name: "Prompt Compiler",
          iconSrc: "/icons/cavpad/sparkles-svgrepo-com.svg",
        },
        {
          name: "Memory Curator",
          iconSrc: "/icons/app/memory-svgrepo-com.svg",
        },
        {
          name: "Grounding Gap Detector",
          iconSrc: "/icons/app/grid-3x3-gap-fill-svgrepo-com.svg",
        },
        {
          name: "Competitor Intelligence",
          iconSrc: "/icons/app/chart-bubble-svgrepo-com.svg",
        },
        {
          name: "Execution Critic",
          iconSrc: "/icons/app/operation-and-maintenance-center-execution-record-svgrepo-com.svg",
        },
        {
          name: "Spec-to-Tasks Orchestrator",
          iconSrc: "/icons/app/graph-bar-svgrepo-com.svg",
        },
        {
          name: "UI Mockup Generator",
          iconSrc: "/icons/app/atom-ai-svgrepo-com.svg",
        },
        {
          name: "Website Visual Builder",
          iconSrc: "/icons/app/wireframe-svgrepo-com.svg",
        },
        {
          name: "App Screenshot Enhancer",
          iconSrc: "/icons/app/screenshot-2-svgrepo-com.svg",
        },
        {
          name: "Brand Asset Generator",
          iconSrc: "/icons/app/star-rings-svgrepo-com.svg",
        },
        {
          name: "SEO Improver",
          iconSrc: "/icons/app/cavcode/agents/seo-svgrepo-com.svg",
        },
      ],
    },
    {
      id: "caven",
      label: "Caven",
      agents: [
        {
          name: "Error Explainer",
          iconSrc: "/icons/app/alert-caution-error-svgrepo-com.svg",
        },
        {
          name: "Fix Draft",
          iconSrc: "/icons/app/cavcode/agents/repairing-browser-svgrepo-com.svg",
        },
        {
          name: "Safe Refactor",
          iconSrc: "/icons/app/cavcode/agents/security-priority-svgrepo-com.svg",
        },
        {
          name: "Code Explainer",
          iconSrc: "/icons/app/cavcode/agents/compile-compiler-script-code-config-svgrepo-com.svg",
        },
        {
          name: "File Summarizer",
          iconSrc: "/icons/app/cavcode/agents/note-favorite-svgrepo-com.svg",
        },
        {
          name: "Component Builder",
          iconSrc: "/icons/app/cavcode/agents/web-application-svgrepo-com.svg",
        },
        {
          name: "Section Builder",
          iconSrc: "/icons/app/cavcode/agents/window-section-svgrepo-com.svg",
        },
        {
          name: "Page Builder",
          iconSrc: "/icons/app/cavcode/agents/page-builder-clean.svg",
        },
        {
          name: "Engineering Note",
          iconSrc: "/icons/app/cavcode/agents/engineering-svgrepo-com.svg",
        },
        {
          name: "Accessibility Auditor",
          iconSrc: "/icons/app/cavcode/agents/accessibility-svgrepo-com.svg",
        },
        {
          name: "API Schema Contract Guard",
          iconSrc: "/icons/app/api-app-svgrepo-com.svg",
        },
        {
          name: "UI Debug Visualizer",
          iconSrc: "/icons/app/bug-fix-search-virus-debug-find-svgrepo-com.svg",
        },
      ],
    },
  ];

  const SESSION_SEED_MESSAGES = {
    "session-1": [
      {
        role: "user",
        text: "Can you mirror the CavAi app layout here?",
      },
      {
        role: "assistant",
        text: "Yes. This thread shows the app-style preview layout and controls for website users.",
      },
    ],
    "session-2": [
      {
        role: "user",
        text: "Which models are available in this preview?",
      },
      {
        role: "assistant",
        text: "Qwen3.5-Flash is active in preview. Other models are listed but stay locked until you sign in.",
      },
    ],
    "session-3": [
      {
        role: "user",
        text: "Can I continue this in the full workspace?",
      },
      {
        role: "assistant",
        text: "Yes. Open full CavAi in app to continue with full workspace controls and unlocked actions.",
      },
    ],
  };

  const shell = document.querySelector("[data-cavai-shell]");
  const sidebar = document.querySelector("[data-cavai-sidebar]");
  const sidebarCollapseButton = document.querySelector("[data-cavai-sidebar-collapse]");
  const sidebarExpandButton = document.querySelector("[data-cavai-sidebar-expand]");
  const sidebarHomeLink = document.querySelector("[data-cavai-sidebar-home]");
  const chatsToggle = document.querySelector("[data-cavai-chats-toggle]");
  const chatsGlyph = document.querySelector("[data-cavai-chats-glyph]");
  const chatList = document.querySelector("#cavai-your-chats-list");
  const chatCount = document.querySelector("#cavai-chat-count");
  const sessionSearch = document.querySelector("#cavai-session-search");

  const thread = document.querySelector("#cavai-thread");
  const threadInner = document.querySelector("#cavai-thread-inner");
  const emptyState = document.querySelector("#cavai-empty-state");

  const composeForm = document.querySelector("#cavai-compose");
  const promptInput = document.querySelector("#cavai-prompt");
  const sendButton = document.querySelector("#cavai-send");
  const sendGlyph = document.querySelector("#cavai-send-glyph");

  const modelWrap = document.querySelector("[data-cavai-model-wrap]");
  const modelTrigger = document.querySelector("#cavai-model-trigger");
  const modelTriggerText = document.querySelector("#cavai-model-trigger-text");
  const modelTriggerCaret = document.querySelector("#cavai-model-trigger-caret");
  const modelMenu = document.querySelector("#cavai-model-menu");
  const modelOptions = Array.from(document.querySelectorAll("#cavai-model-menu [data-model-id]"));
  const reasoningWrap = document.querySelector("[data-cavai-reasoning-wrap]");
  const reasoningTrigger = document.querySelector("#cavai-reasoning-trigger");
  const reasoningMenu = document.querySelector("#cavai-reasoning-menu");
  const reasoningOptions = Array.from(document.querySelectorAll("#cavai-reasoning-menu [data-reasoning-level]"));

  const quickWrap = document.querySelector("[data-cavai-quick-wrap]");
  const quickTrigger = document.querySelector("#cavai-quick-trigger");
  const quickMenu = document.querySelector("#cavai-quick-menu");
  const agentWrap = document.querySelector("[data-cavai-agent-wrap]");
  const agentTrigger = document.querySelector("#cavai-agent-trigger");
  const agentMenu = document.querySelector("#cavai-agent-menu");
  const agentList = document.querySelector("#cavai-agent-list");
  const agentCount = document.querySelector("#cavai-agent-count");

  const noticeBox = document.querySelector("#cavai-notice");
  const errorBox = document.querySelector("#cavai-error");

  const newChatButtons = document.querySelectorAll("[data-cavai-new-chat]");
  const focusSearchButtons = document.querySelectorAll("[data-cavai-focus-search]");
  const quickActionButtons = document.querySelectorAll("[data-quick-action]");
  const audioLockButton = document.querySelector("#cavai-audio-lock");

  if (
    !shell
    || !sidebar
    || !thread
    || !threadInner
    || !emptyState
    || !composerFooter
    || !footerComposerHost
    || !inlineComposerHost
    || !composeForm
    || !promptInput
    || !sendButton
    || !sendGlyph
    || !modelWrap
    || !modelTrigger
    || !modelTriggerText
    || !modelTriggerCaret
    || !modelMenu
    || !modelOptions.length
    || !reasoningWrap
    || !reasoningTrigger
    || !reasoningMenu
    || !reasoningOptions.length
    || !quickWrap
    || !quickTrigger
    || !quickMenu
    || !agentWrap
    || !agentTrigger
    || !agentMenu
    || !agentList
    || !agentCount
    || !noticeBox
    || !errorBox
  ) {
    return;
  }

  let activeModelId = "qwen3.5-flash";
  let reasoningLevel = "low";
  let submitting = false;
  let currentSessionId = "";
  let activeLocalSessionId = "";
  let chatsOpen = true;
  let sidebarCollapsed = false;
  let activeSessionMenuId = "";
  let messageSequence = 0;
  const transcriptRows = [];
  const sessionStateById = new Map();
  const copyResetTimers = new WeakMap();

  function s(value) {
    return String(value ?? "").trim();
  }

  function applyLockedTooltipState() {
    document.querySelectorAll("[data-locked='true']").forEach((node) => {
      const label = s(
        node.getAttribute("data-model-label")
        || node.getAttribute("data-reasoning-label")
        || node.getAttribute("data-agent-label")
        || node.textContent
      );
      const tooltip = label ? `${label} · User only (sign in)` : "User only (sign in)";
      node.setAttribute("title", tooltip);
      node.setAttribute("aria-label", tooltip);
      node.setAttribute("aria-disabled", "true");
    });
  }

  function getSessionRows() {
    return Array.from(chatList.querySelectorAll("[data-session-id]"));
  }

  function getSessionButtons() {
    return Array.from(chatList.querySelectorAll("[data-cavai-session-item]"));
  }

  function clearSessionSelection() {
    getSessionButtons().forEach((item) => item.classList.remove("centerSessionItemOn"));
  }

  function closeSessionMenus() {
    getSessionRows().forEach((row) => {
      row.classList.remove("centerSessionRowMenuOpen");
      const menu = row.querySelector("[data-cavai-session-more-menu]");
      const trigger = row.querySelector("[data-cavai-session-more]");
      if (menu) menu.hidden = true;
      if (trigger) trigger.classList.remove("centerSessionMoreBtnOn");
    });
    activeSessionMenuId = "";
  }

  function openSessionMenu(localSessionId) {
    const nextSessionId = s(localSessionId);
    if (!nextSessionId) return;

    const row = getSessionRows().find((item) => s(item.getAttribute("data-session-id")) === nextSessionId);
    if (!row) return;

    if (activeSessionMenuId === nextSessionId) {
      closeSessionMenus();
      return;
    }

    closeSessionMenus();
    const menu = row.querySelector("[data-cavai-session-more-menu]");
    const trigger = row.querySelector("[data-cavai-session-more]");
    if (!menu || !trigger) return;
    menu.hidden = false;
    row.classList.add("centerSessionRowMenuOpen");
    trigger.classList.add("centerSessionMoreBtnOn");
    activeSessionMenuId = nextSessionId;
  }

  function toSessionTitle(value) {
    const normalized = s(value).replace(/\s+/g, " ");
    if (!normalized) return "New chat";
    if (normalized.length <= 42) return normalized;
    return `${normalized.slice(0, 39)}...`;
  }

  function buildSessionRow(localSessionId, title, preview, timeline) {
    const row = document.createElement("div");
    row.className = "centerSessionRow";
    row.setAttribute("data-session-id", localSessionId);

    const item = document.createElement("button");
    item.type = "button";
    item.className = "centerSessionItem";
    item.setAttribute("data-cavai-session-item", "");

    const top = document.createElement("div");
    top.className = "centerSessionTop";

    const titleEl = document.createElement("span");
    titleEl.className = "centerSessionTitle";
    titleEl.textContent = toSessionTitle(title);

    const timelineEl = document.createElement("span");
    timelineEl.className = "centerSessionTimeline";
    timelineEl.textContent = s(timeline) || "Now";

    top.append(titleEl, timelineEl);

    const previewEl = document.createElement("div");
    previewEl.className = "centerSessionPreview";
    previewEl.textContent = s(preview) || "New chat";

    item.append(top, previewEl);

    const more = document.createElement("button");
    more.type = "button";
    more.className = "centerSessionMoreBtn";
    more.setAttribute("data-cavai-session-more", "");
    more.setAttribute("aria-label", `More actions for ${toSessionTitle(title)}`);
    more.setAttribute("title", "More actions");

    const moreGlyph = document.createElement("span");
    moreGlyph.className = "centerSessionMoreGlyph";
    moreGlyph.setAttribute("aria-hidden", "true");
    more.appendChild(moreGlyph);

    const menu = document.createElement("div");
    menu.className = "centerSessionMoreMenu";
    menu.setAttribute("data-cavai-session-more-menu", "");
    menu.hidden = true;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "centerSessionMoreMenuItem centerSessionMoreMenuItemDanger";
    deleteBtn.setAttribute("data-cavai-session-delete", "");
    deleteBtn.textContent = "Delete chat";

    menu.appendChild(deleteBtn);
    row.append(item, more, menu);
    return row;
  }

  function createLocalSessionFromPrompt(promptValue) {
    const localSessionId = `session-local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const row = buildSessionRow(localSessionId, promptValue, "New chat", "Now");
    chatList.prepend(row);
    ensureSessionState(localSessionId);
    updateChatsCountLabel();
    return localSessionId;
  }

  function updateSessionRowPreview(localSessionId, previewText) {
    const targetSessionId = s(localSessionId);
    if (!targetSessionId) return;
    const row = getSessionRows().find((item) => s(item.getAttribute("data-session-id")) === targetSessionId);
    if (!row) return;

    const preview = row.querySelector(".centerSessionPreview");
    const timeline = row.querySelector(".centerSessionTimeline");
    if (preview) preview.textContent = s(previewText) || "New chat";
    if (timeline) timeline.textContent = "Now";
  }

  function enterNewChatMode() {
    if (submitting) {
      setNotice("Wait for the current response before starting a new chat.");
      return;
    }

    activeLocalSessionId = "";
    currentSessionId = "";
    syncTranscriptFromState(null);
    clearSessionSelection();
    closeSessionMenus();
    clearRenderedMessages();
    setThreadMode(false);
    clearStatus();
    promptInput.value = "";
    promptInput.focus();
  }

  function deleteSession(localSessionId) {
    const targetSessionId = s(localSessionId);
    if (!targetSessionId) return;
    if (submitting && targetSessionId === activeLocalSessionId) {
      setNotice("Wait for the current response before deleting this chat.");
      return;
    }

    const row = getSessionRows().find((item) => s(item.getAttribute("data-session-id")) === targetSessionId);
    if (!row) return;

    sessionStateById.delete(targetSessionId);
    row.remove();
    closeSessionMenus();

    if (targetSessionId === activeLocalSessionId) {
      activeLocalSessionId = "";
      enterNewChatMode();
    }

    updateChatsCountLabel();
  }

  function nowLabel() {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const hour12 = hour % 12 || 12;
    const suffix = hour >= 12 ? "PM" : "AM";
    return `${hour12}:${String(min).padStart(2, "0")} ${suffix}`;
  }

  function closeModelMenu() {
    modelMenu.hidden = true;
    modelTrigger.setAttribute("aria-expanded", "false");
    modelTriggerCaret.classList.remove("centerModelTriggerCaretOpen");
  }

  function openModelMenu() {
    modelMenu.hidden = false;
    modelTrigger.setAttribute("aria-expanded", "true");
    modelTriggerCaret.classList.add("centerModelTriggerCaretOpen");
  }

  function closeReasoningMenu() {
    reasoningMenu.hidden = true;
    reasoningTrigger.setAttribute("aria-expanded", "false");
  }

  function openReasoningMenu() {
    reasoningMenu.hidden = false;
    reasoningTrigger.setAttribute("aria-expanded", "true");
  }

  function closeQuickMenu() {
    quickMenu.hidden = true;
    quickTrigger.setAttribute("aria-expanded", "false");
  }

  function openQuickMenu() {
    quickMenu.hidden = false;
    quickTrigger.setAttribute("aria-expanded", "true");
  }

  function closeAgentMenu() {
    agentMenu.hidden = true;
    agentTrigger.setAttribute("aria-expanded", "false");
  }

  function openAgentMenu() {
    agentMenu.hidden = false;
    agentTrigger.setAttribute("aria-expanded", "true");
  }

  function clearStatus() {
    noticeBox.hidden = true;
    noticeBox.textContent = "";
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function setNotice(message) {
    errorBox.hidden = true;
    errorBox.textContent = "";
    noticeBox.textContent = s(message);
    noticeBox.hidden = !s(message);
  }

  function setError(message) {
    noticeBox.hidden = true;
    noticeBox.textContent = "";
    errorBox.textContent = s(message);
    errorBox.hidden = !s(message);
  }

  function setSidebarState(collapsed) {
    sidebarCollapsed = collapsed;
    sidebar.classList.toggle("centerSidebarCollapsed", collapsed);
    shell.classList.toggle("centerShellPageSidebarCollapsed", collapsed);

    if (sidebarCollapseButton) sidebarCollapseButton.hidden = collapsed;
    if (sidebarHomeLink) sidebarHomeLink.hidden = collapsed;
    if (sidebarExpandButton) sidebarExpandButton.hidden = !collapsed;
  }

  function updateChatsCountLabel() {
    const visibleCount = Array.from(chatList.querySelectorAll("[data-session-id]")).filter((row) => !row.hidden).length;
    chatCount.textContent = `${visibleCount} ${visibleCount === 1 ? "chat" : "chats"}`;
  }

  function setChatsOpen(nextOpen) {
    chatsOpen = nextOpen;
    chatList.hidden = !nextOpen;
    chatsToggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    chatsGlyph.classList.toggle("centerSidebarSectionToggleGlyphOpen", nextOpen);
  }

  function setSubmitting(nextSubmitting) {
    submitting = nextSubmitting;
    promptInput.disabled = nextSubmitting;
    sendButton.disabled = nextSubmitting;

    sendButton.classList.toggle("primaryBtnStop", nextSubmitting);
    sendButton.classList.toggle("centerComposerSendBtnStop", nextSubmitting);

    sendGlyph.className = nextSubmitting
      ? "primaryBtnGlyph primaryBtnGlyphStop"
      : "primaryBtnGlyph primaryBtnGlyphRun";

    sendButton.setAttribute("aria-label", nextSubmitting ? "Stop CavAi prompt" : "Send prompt to CavAi");
    sendButton.setAttribute("title", nextSubmitting ? "Stop" : "Send");
  }

  function setThreadMode(hasMessages) {
    threadInner.classList.toggle("centerThreadInnerChat", hasMessages);
    threadInner.classList.toggle("centerThreadInnerEmpty", !hasMessages);
    emptyState.hidden = hasMessages;
    emptyState.classList.toggle("centerEmptyStateWithComposer", !hasMessages);

    if (hasMessages) {
      if (composeForm.parentElement !== footerComposerHost) {
        footerComposerHost.appendChild(composeForm);
      }
      inlineComposerHost.hidden = true;
      composerFooter.hidden = false;
    } else {
      if (composeForm.parentElement !== inlineComposerHost) {
        inlineComposerHost.appendChild(composeForm);
      }
      inlineComposerHost.hidden = false;
      composerFooter.hidden = true;
    }
  }

  function clearRenderedMessages() {
    threadInner.querySelectorAll("[data-cavai-message]").forEach((item) => item.remove());
  }

  function seedMessagesForSession(localSessionId) {
    const seedRows = SESSION_SEED_MESSAGES[s(localSessionId)];
    if (!Array.isArray(seedRows)) return [];

    return seedRows
      .map((row) => ({
        role: row?.role === "user" ? "user" : "assistant",
        text: s(row?.text),
      }))
      .filter((row) => row.text);
  }

  function ensureSessionState(localSessionId) {
    const key = s(localSessionId);
    if (!key) return null;

    if (!sessionStateById.has(key)) {
      sessionStateById.set(key, {
        localSessionId: key,
        remoteSessionId: "",
        rows: seedMessagesForSession(key),
      });
    }

    return sessionStateById.get(key);
  }

  function syncTranscriptFromState(state) {
    transcriptRows.length = 0;
    if (!state || !Array.isArray(state.rows)) return;

    state.rows.slice(-14).forEach((row) => {
      transcriptRows.push({
        role: row.role === "user" ? "user" : "assistant",
        text: s(row.text),
      });
    });
  }

  function renderSessionThread(localSessionId) {
    const sessionState = ensureSessionState(localSessionId);
    if (!sessionState) return;

    clearRenderedMessages();
    currentSessionId = s(sessionState.remoteSessionId);
    syncTranscriptFromState(sessionState);

    sessionState.rows.forEach((row) => {
      if (row.role === "user") appendUserMessage(row.text);
      else appendAssistantMessage(row.text);
    });

    if (!sessionState.rows.length) setThreadMode(false);
    scrollThreadToBottom();
  }

  function setActiveSession(localSessionId) {
    const nextSessionId = s(localSessionId);
    if (!nextSessionId) return;
    if (submitting && nextSessionId !== activeLocalSessionId) {
      setNotice("Wait for the current response before switching chats.");
      return;
    }

    activeLocalSessionId = nextSessionId;
    clearSessionSelection();
    closeSessionMenus();

    getSessionButtons().forEach((button) => {
      const row = button.closest("[data-session-id]");
      const rowSessionId = s(row?.getAttribute("data-session-id"));
      if (rowSessionId === nextSessionId) {
        button.classList.add("centerSessionItemOn");
      }
    });

    renderSessionThread(nextSessionId);
    clearStatus();
    if (window.matchMedia && window.matchMedia("(max-width: 960px)").matches) {
      thread.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    promptInput.focus();
  }

  function activeSessionState() {
    return ensureSessionState(activeLocalSessionId);
  }

  function activeMessageCount() {
    return threadInner.querySelectorAll("[data-cavai-message]").length;
  }

  function scrollThreadToBottom() {
    thread.scrollTop = thread.scrollHeight;
  }

  async function copyTextToClipboard(text) {
    const value = s(text);
    if (!value) return false;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // fallback below
    }

    try {
      const probe = document.createElement("textarea");
      probe.value = value;
      probe.setAttribute("readonly", "readonly");
      probe.style.position = "fixed";
      probe.style.opacity = "0";
      probe.style.pointerEvents = "none";
      probe.style.inset = "0";
      document.body.appendChild(probe);
      probe.focus();
      probe.select();
      const ok = typeof document.execCommand === "function" ? document.execCommand("copy") : false;
      probe.remove();
      return ok;
    } catch {
      return false;
    }
  }

  function setCopyButtonState(button, copied) {
    if (!button) return;
    const glyph = button.querySelector("[data-cavai-copy-glyph]");
    button.classList.toggle("centerMessageActionBtnOn", copied);
    button.setAttribute("title", copied ? "Copied" : "Copy");
    button.setAttribute("aria-label", copied ? "Copied" : "Copy message");

    if (!glyph) return;
    glyph.classList.toggle("centerMessageActionGlyphCopy", !copied);
    glyph.classList.toggle("centerMessageActionGlyphCheck", copied);
  }

  function createMessageCopyActions(messageId, messageText, isUserMessage) {
    const actions = document.createElement("div");
    actions.className = isUserMessage
      ? "centerMessageActions centerUserMessageActions"
      : "centerMessageActions";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "centerMessageActionBtn";
    copyButton.setAttribute("aria-label", "Copy message");
    copyButton.setAttribute("title", "Copy");
    copyButton.setAttribute("data-cavai-copy-token", `copy:${s(messageId)}`);

    const glyph = document.createElement("span");
    glyph.className = "centerMessageActionGlyph centerMessageActionGlyphCopy";
    glyph.setAttribute("data-cavai-copy-glyph", "");
    glyph.setAttribute("aria-hidden", "true");
    copyButton.appendChild(glyph);

    copyButton.addEventListener("click", async () => {
      if (copyButton.disabled) return;
      copyButton.classList.add("centerMessageActionBtnBusy");
      const ok = await copyTextToClipboard(messageText);
      copyButton.classList.remove("centerMessageActionBtnBusy");

      if (!ok) {
        setError("Failed to copy message.");
        return;
      }

      const existingTimer = copyResetTimers.get(copyButton);
      if (existingTimer) window.clearTimeout(existingTimer);
      setCopyButtonState(copyButton, true);
      const timer = window.setTimeout(() => {
        setCopyButtonState(copyButton, false);
      }, 1400);
      copyResetTimers.set(copyButton, timer);
    });

    actions.appendChild(copyButton);
    return actions;
  }

  function appendUserMessage(text) {
    messageSequence += 1;
    const messageId = `user-${messageSequence}`;

    const article = document.createElement("article");
    article.className = "centerMessage centerMessageUser";
    article.setAttribute("data-cavai-message", "user");
    article.setAttribute("data-cavai-message-id", messageId);

    const head = document.createElement("div");
    head.className = "centerMessageHead";

    const role = document.createElement("span");
    role.className = "centerMessageRole";
    role.textContent = "You";

    const time = document.createElement("span");
    time.className = "centerMessageTime";
    time.textContent = nowLabel();

    head.append(role, time);

    const body = document.createElement("div");
    body.className = "centerMessageBody";

    const copy = document.createElement("div");
    copy.className = "centerMessageText";
    copy.textContent = s(text);

    body.appendChild(copy);
    const actions = createMessageCopyActions(messageId, s(text), true);
    article.append(head, body, actions);

    threadInner.appendChild(article);
    setThreadMode(true);
    scrollThreadToBottom();
  }

  function appendAssistantMessage(text) {
    messageSequence += 1;
    const messageId = `assistant-${messageSequence}`;

    const article = document.createElement("article");
    article.className = "centerMessage centerMessageAssistant";
    article.setAttribute("data-cavai-message", "assistant");
    article.setAttribute("data-cavai-message-id", messageId);

    const head = document.createElement("div");
    head.className = "centerMessageHead";

    const role = document.createElement("span");
    role.className = "centerMessageRole";
    role.textContent = "CavAi";

    const time = document.createElement("span");
    time.className = "centerMessageTime";
    time.textContent = nowLabel();

    head.append(role, time);

    const row = document.createElement("div");
    row.className = "centerAssistantContentRow";

    const logo = document.createElement("span");
    logo.className = "centerResponseLogo centerResponseLogoCavAi";
    logo.setAttribute("aria-hidden", "true");

    const stack = document.createElement("div");
    stack.className = "centerMessageContentStack";

    const body = document.createElement("div");
    body.className = "centerMessageBody";

    const copy = document.createElement("div");
    copy.className = "centerMessageText";
    copy.textContent = s(text);

    body.appendChild(copy);
    const actions = createMessageCopyActions(messageId, s(text), false);
    stack.append(body, actions);
    row.append(logo, stack);
    article.append(head, row);

    threadInner.appendChild(article);
    setThreadMode(true);
    scrollThreadToBottom();
  }

  function appendLoadingMessage() {
    const article = document.createElement("article");
    article.className = "centerMessage centerMessageAssistant centerMessageLoading";
    article.setAttribute("data-cavai-message", "loading");

    const row = document.createElement("div");
    row.className = "centerMessageLoadingBody";

    const glyph = document.createElement("span");
    glyph.className = "centerMessageLoadingGlyph";
    glyph.setAttribute("aria-hidden", "true");

    const role = document.createElement("span");
    role.className = "centerMessageRole";
    role.textContent = "CavAi is thinking";

    row.append(glyph, role);
    article.appendChild(row);

    threadInner.appendChild(article);
    setThreadMode(true);
    scrollThreadToBottom();
    return article;
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
    candidates.forEach((item) => {
      if (seen.has(item)) return;
      seen.add(item);
      unique.push(item);
    });
    return unique;
  }

  function isPublicPreviewEndpoint(endpoint) {
    return /\/api\/public\/cavai\/preview-assist(?:[/?]|$)/i.test(s(endpoint));
  }

  async function requestAssist(promptValue) {
    const payload = {
      action: "technical_recap",
      surface: "general",
      prompt: promptValue,
      model: activeModelId,
      reasoningLevel,
      sessionId: s(currentSessionId) || undefined,
      origin: `${window.location.origin}${window.location.pathname}`,
      contextLabel: "Website preview",
      context: {
        mode: "website_preview",
        source: "cavbot.io/cavai",
        transcript: buildTranscriptForRequest(promptValue),
      },
    };

    let lastError = "";

    for (const endpoint of resolveAssistEndpoints()) {
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

        return {
          type: "ok",
          answer,
          sessionId: s(body?.sessionId),
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

  function resetConversation() {
    enterNewChatMode();
  }

  function renderAgentMenu() {
    agentList.replaceChildren();

    function createAgentGlyphFallback() {
      const glyphWrap = document.createElement("span");
      glyphWrap.className = "centerAgentModeGlyph";
      glyphWrap.setAttribute("aria-hidden", "true");

      const glyph = document.createElement("span");
      glyph.className = "centerAgentModeGlyphIcon centerAgentModeRobotIcon";
      glyphWrap.appendChild(glyph);
      return glyphWrap;
    }

    function createLockedAgentRow(agent) {
      const name = s(agent?.name);
      const iconSrc = s(agent?.iconSrc);
      if (!name) return null;

      const row = document.createElement("button");
      row.type = "button";
      row.className = "centerAgentModeLockedRow";
      row.setAttribute("data-agent-locked", "true");
      row.setAttribute("data-locked", "true");
      row.setAttribute("data-agent-label", name);
      row.setAttribute("aria-label", `${name} is locked`);
      row.setAttribute("title", `${name} · User only (sign in)`);
      row.setAttribute("aria-disabled", "true");

      const lead = document.createElement("span");
      lead.className = "centerAgentModeMenuLead";

      let iconNode = null;
      if (iconSrc) {
        const icon = document.createElement("img");
        icon.className = "centerAgentModeMenuIcon";
        icon.setAttribute("data-agent-id", name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        icon.src = iconSrc;
        icon.alt = "";
        icon.loading = "lazy";
        icon.decoding = "async";
        icon.setAttribute("aria-hidden", "true");
        icon.addEventListener("error", () => {
          if (!icon.parentElement) return;
          icon.replaceWith(createAgentGlyphFallback());
        }, { once: true });
        iconNode = icon;
      } else {
        iconNode = createAgentGlyphFallback();
      }

      const labelWrap = document.createElement("span");
      labelWrap.className = "centerAgentModeMenuLabelWrap";

      const label = document.createElement("span");
      label.className = "centerAgentModeMenuLabel";
      label.textContent = name;
      labelWrap.appendChild(label);

      if (iconNode) lead.append(iconNode, labelWrap);
      else lead.append(labelWrap);

      const meta = document.createElement("span");
      meta.className = "centerAgentModeLockedMeta";

      const lock = document.createElement("span");
      lock.className = "cavai-lock-icon";
      lock.setAttribute("aria-hidden", "true");
      meta.appendChild(lock);

      row.append(lead, meta);
      return row;
    }

    let totalLocked = 0;

    AGENT_GROUPS.forEach((group) => {
      const agentEntries = Array.isArray(group.agents)
        ? group.agents
          .map((entry) => ({
            name: s(entry?.name),
            iconSrc: s(entry?.iconSrc),
          }))
          .filter((entry) => entry.name)
        : [];
      if (!agentEntries.length) return;

      const section = document.createElement("details");
      section.className = "centerAgentModeSection";
      section.open = true;
      section.setAttribute("data-agent-family", s(group.id) || "group");

      const summary = document.createElement("summary");
      summary.className = "centerAgentModeSectionHead";

      const title = document.createElement("span");
      title.className = "centerAgentModeSectionTitle";
      title.textContent = s(group.label) || "Agents";

      const meta = document.createElement("span");
      meta.className = "centerAgentModeSectionMeta";
      meta.textContent = `${agentEntries.length} locked`;

      summary.append(title, meta);
      section.appendChild(summary);

      agentEntries.forEach((entry) => {
        totalLocked += 1;
        const row = createLockedAgentRow(entry);
        if (row) section.appendChild(row);
      });

      agentList.appendChild(section);
    });

    agentCount.textContent = `${totalLocked} locked`;
  }

  function syncModelMenuState() {
    modelOptions.forEach((optionButton) => {
      const optionId = s(optionButton.getAttribute("data-model-id"));
      const on = optionId === activeModelId;
      optionButton.classList.toggle("centerModelMenuItemOn", on);
      optionButton.setAttribute("aria-checked", on ? "true" : "false");

      const check = optionButton.querySelector("[data-model-check]");
      if (check) check.hidden = !on;
    });

    const activeOption = modelOptions.find((optionButton) => s(optionButton.getAttribute("data-model-id")) === activeModelId);
    const activeLabel = activeOption
      ? s(activeOption.getAttribute("data-model-label")) || s(activeOption.textContent)
      : "Qwen3.5-Flash";

    modelTriggerText.textContent = activeLabel;
    modelTrigger.setAttribute("title", activeLabel);
  }

  function syncReasoningMenuState() {
    reasoningOptions.forEach((optionButton) => {
      const optionLevel = s(optionButton.getAttribute("data-reasoning-level")).toLowerCase();
      const on = optionLevel === reasoningLevel;
      optionButton.classList.toggle("iconMenuItemOn", on);
      optionButton.setAttribute("aria-checked", on ? "true" : "false");
    });

    const activeOption = reasoningOptions.find((optionButton) => {
      return s(optionButton.getAttribute("data-reasoning-level")).toLowerCase() === reasoningLevel;
    });

    const activeLabel = activeOption ? s(activeOption.getAttribute("data-reasoning-label")) || s(activeOption.textContent) : "Fast";
    reasoningTrigger.setAttribute("title", activeLabel);
    reasoningTrigger.setAttribute("aria-label", `Reasoning: ${activeLabel}`);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const promptValue = s(promptInput.value);
    if (!promptValue) return;
    let sessionState = activeSessionState();
    if (!sessionState) {
      const localSessionId = createLocalSessionFromPrompt(promptValue);
      setActiveSession(localSessionId);
      sessionState = activeSessionState();
    }
    if (!sessionState) return;

    clearStatus();
    currentSessionId = s(sessionState.remoteSessionId);

    appendUserMessage(promptValue);
    sessionState.rows.push({ role: "user", text: promptValue });
    while (sessionState.rows.length > 80) sessionState.rows.shift();
    syncTranscriptFromState(sessionState);
    updateSessionRowPreview(sessionState.localSessionId, promptValue);

    promptInput.value = "";
    setSubmitting(true);

    const loading = appendLoadingMessage();
    const result = await requestAssist(promptValue);
    loading.remove();

    if (result.type === "ok") {
      appendAssistantMessage(result.answer);
      sessionState.rows.push({ role: "assistant", text: result.answer });
      while (sessionState.rows.length > 80) sessionState.rows.shift();
      sessionState.remoteSessionId = s(result.sessionId) || s(sessionState.remoteSessionId);
      currentSessionId = s(sessionState.remoteSessionId);
      syncTranscriptFromState(sessionState);
      setSubmitting(false);
      return;
    }

    if (result.type === "auth") {
      setNotice("This action requires an authenticated app session.");
      setSubmitting(false);
      return;
    }

    setError(`${result.message}\n\nOpen full CavAi in app to continue if this preview endpoint is unavailable.`);
    setSubmitting(false);
  }

  if (sidebarCollapseButton) {
    sidebarCollapseButton.addEventListener("click", () => setSidebarState(true));
  }

  if (sidebarExpandButton) {
    sidebarExpandButton.addEventListener("click", () => setSidebarState(false));
  }

  if (chatsToggle) {
    chatsToggle.addEventListener("click", () => setChatsOpen(!chatsOpen));
  }

  if (sessionSearch) {
    sessionSearch.addEventListener("input", () => {
      const query = s(sessionSearch.value).toLowerCase();

      chatList.querySelectorAll("[data-session-id]").forEach((row) => {
        const haystack = s(row.textContent).toLowerCase();
        row.hidden = query ? !haystack.includes(query) : false;
      });

      updateChatsCountLabel();
    });
  }

  if (chatList) {
    chatList.addEventListener("click", (event) => {
      const deleteButton = event.target.closest("[data-cavai-session-delete]");
      if (deleteButton) {
        event.preventDefault();
        event.stopPropagation();
        const row = deleteButton.closest("[data-session-id]");
        const localSessionId = s(row?.getAttribute("data-session-id"));
        deleteSession(localSessionId);
        return;
      }

      const moreButton = event.target.closest("[data-cavai-session-more]");
      if (moreButton) {
        event.preventDefault();
        event.stopPropagation();
        const row = moreButton.closest("[data-session-id]");
        const localSessionId = s(row?.getAttribute("data-session-id"));
        openSessionMenu(localSessionId);
        return;
      }

      const sessionButton = event.target.closest("[data-cavai-session-item]");
      if (!sessionButton) return;
      const row = sessionButton.closest("[data-session-id]");
      const localSessionId = s(row?.getAttribute("data-session-id"));
      setActiveSession(localSessionId);
    });
  }

  newChatButtons.forEach((button) => {
    button.addEventListener("click", resetConversation);
  });

  focusSearchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!sessionSearch) return;
      sessionSearch.focus();
      sessionSearch.select();
    });
  });

  if (audioLockButton) {
    audioLockButton.addEventListener("click", () => {
      clearStatus();
    });
  }

  if (quickTrigger) {
    quickTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeModelMenu();
      closeReasoningMenu();
      closeAgentMenu();

      if (quickMenu.hidden) openQuickMenu();
      else closeQuickMenu();
    });
  }

  if (modelTrigger) {
    modelTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeQuickMenu();
      closeReasoningMenu();
      closeAgentMenu();

      if (modelMenu.hidden) openModelMenu();
      else closeModelMenu();
    });
  }

  if (agentTrigger) {
    agentTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeQuickMenu();
      closeModelMenu();
      closeReasoningMenu();

      if (agentMenu.hidden) openAgentMenu();
      else closeAgentMenu();
    });
  }

  if (reasoningTrigger) {
    reasoningTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeQuickMenu();
      closeModelMenu();
      closeAgentMenu();

      if (reasoningMenu.hidden) openReasoningMenu();
      else closeReasoningMenu();
    });
  }

  modelOptions.forEach((optionButton) => {
    optionButton.addEventListener("click", () => {
      const optionId = s(optionButton.getAttribute("data-model-id"));
      const locked = optionButton.getAttribute("data-locked") === "true";

      if (!optionId) return;

      if (locked) return;

      activeModelId = optionId;
      syncModelMenuState();
      closeModelMenu();
    });
  });

  reasoningOptions.forEach((optionButton) => {
    optionButton.addEventListener("click", () => {
      const optionLevel = s(optionButton.getAttribute("data-reasoning-level")).toLowerCase();
      const locked = optionButton.getAttribute("data-locked") === "true";

      if (!optionLevel) return;

      if (locked) return;

      reasoningLevel = optionLevel;
      syncReasoningMenuState();
      closeReasoningMenu();
      clearStatus();
    });
  });

  quickActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = s(button.getAttribute("data-quick-action"));
      const locked = button.getAttribute("data-locked") === "true";

      closeQuickMenu();

      if (locked) return;

      if (action === "new_chat") {
        resetConversation();
      }
    });
  });

  composeForm.addEventListener("submit", onSubmit);

  promptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      composeForm.requestSubmit();
    }
  });

  document.addEventListener("click", (event) => {
    if (!chatList.contains(event.target)) {
      closeSessionMenus();
    }

    if (!modelWrap.contains(event.target)) {
      closeModelMenu();
    }

    if (!reasoningWrap.contains(event.target)) {
      closeReasoningMenu();
    }

    if (!quickWrap.contains(event.target)) {
      closeQuickMenu();
    }

    if (!agentWrap.contains(event.target)) {
      closeAgentMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSessionMenus();
      closeModelMenu();
      closeReasoningMenu();
      closeQuickMenu();
      closeAgentMenu();
    }
  });

  renderAgentMenu();
  applyLockedTooltipState();
  syncModelMenuState();
  syncReasoningMenuState();
  setSidebarState(false);
  setChatsOpen(true);
  updateChatsCountLabel();
  setSubmitting(false);
  enterNewChatMode();
});
