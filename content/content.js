const CONTROLS_CONTAINER_ID = "immigration-ai-controls-container";
const PLAY_BUTTON_ID = "immi-ai-play-btn";
const PAUSE_BUTTON_ID = "immi-ai-pause-btn";
const STOP_BUTTON_ID = "immi-ai-stop-btn";

const COMMANDS_FILE_PATH = "commands/eta9035.json";
const ICONS_PATH = "assets/";

const ICON_DIMENSIONS = { height: 20, width: 20 };
const ICON_COMMON_STYLES = "cursor: pointer; display: block;";
const ICON_SPACING = "margin-bottom: 15px;";

const DELAY_BETWEEN_COMMANDS_MS = 800;
const ELEMENT_WAIT_TIMEOUT_MS = 5000;
const ELEMENT_WAIT_INTERVAL_MS = 300;

const runExecutionEngine = async () => {
  const script = await fetchScript(COMMANDS_FILE_PATH);
  const variables = {};
  const commandsQueue = [...script.Commands];

  while (commandsQueue.length) {
    const command = commandsQueue.shift();
    await executeCommand(command, variables, commandsQueue);
    await delay(DELAY_BETWEEN_COMMANDS_MS);
  }
};

const fetchScript = async (path) => {
  const response = await fetch(chrome.runtime.getURL(path));
  return response.json();
};

const executeCommand = async (command, variables) => {
  let target = substituteVariables(command.Target, variables);
  let value = substituteVariables(command.Value, variables);

  console.log(`Executing: ${command.Command} → ${target} | ${value}`);

  switch (command.Command) {
    case "store":
      variables[value] = target;
      break;

    case "open":
      if (window.location.href !== target) {
        window.location.href = target;
        return;
      }
      break;

    case "click":
      try {
        const element = await findElement(
          target,
          command.Targets || [],
          variables
        );
        highlightElement(element);
        element.click();
      } catch (error) {
        console.error("Click failed", error);
      }
      break;

    case "type":
      try {
        const element = await findElement(
          target,
          command.Targets || [],
          variables
        );
        highlightElement(element);
        element.focus();
        element.value = value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (error) {
        console.error("Type failed", error);
      }
      break;

    case "verifyElementPresent":
      try {
        const element = await findElement(
          target,
          command.Targets || [],
          variables
        );
        highlightElement(element);
        variables[value] = !!element;
      } catch {
        variables[value] = false;
      }
      break;

    case "end":
      break;

    case "XType":
      if (value === "${KEY_ESC}") {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      }
      break;
  }
};

const substituteVariables = (str, variables) =>
  str?.replace(/\$\{(\!?[\w]+)\}/g, (_, key) => {
    if (key.startsWith("!")) {
      const varName = key.slice(1);
      return !variables[varName];
    }
    return variables[key] ?? "";
  }) ?? "";

const findElement = async (primarySelector, fallbackSelectors, variables) => {
  const selectors = [primarySelector, ...fallbackSelectors];
  for (let selector of selectors) {
    selector = substituteVariables(selector, variables);
    try {
      const element = await waitForElement(selector);
      if (element) return element;
    } catch (error) {
      console.warn("Selector failed:", selector);
    }
  }
  throw new Error("No valid target found among selectors.");
};

const waitForElement = async (selector, timeout = ELEMENT_WAIT_TIMEOUT_MS) => {
  const startTime = Date.now();
  const [selectorType, selectorValue] = parseSelector(selector);

  while (Date.now() - startTime < timeout) {
    let element = null;
    switch (selectorType) {
      case "xpath":
        element = document.evaluate(
          selectorValue,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        break;
      case "css":
        element = document.querySelector(selectorValue);
        break;
      case "linkText":
        element = Array.from(document.querySelectorAll("a")).find(
          (a) => a.textContent.trim() === selectorValue
        );
        break;
    }
    if (element) return element;
    await delay(ELEMENT_WAIT_INTERVAL_MS);
  }
  throw new Error(`Timeout: Element not found: ${selector}`);
};

const parseSelector = (selector) => {
  if (selector.startsWith("xpath=")) return ["xpath", selector.slice(6)];
  if (selector.startsWith("css=")) return ["css", selector.slice(4)];
  if (selector.startsWith("linkText=")) return ["linkText", selector.slice(9)];
  return ["xpath", selector]; // default fallback
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createControlsContainer = () => {
  const container = document.createElement("div");
  container.id = CONTROLS_CONTAINER_ID;
  container.style.position = "fixed";
  container.style.bottom = "50%";
  container.style.right = "20px";
  container.style.padding = "15px";
  container.style.backgroundColor = "white";
  container.style.color = "white";
  container.style.zIndex = "10000";
  container.style.borderRadius = "8px";
  container.innerHTML = getButtonsHTML();
  return container;
};

const getButtonsHTML = () => {
  const playIcon = chrome.runtime.getURL(`${ICONS_PATH}play.png`);
  const pauseIcon = chrome.runtime.getURL(`${ICONS_PATH}pause.png`);
  const stopIcon = chrome.runtime.getURL(`${ICONS_PATH}stop.png`);
  const { height, width } = ICON_DIMENSIONS;

  return `
            <div id="buttons-container">
                    <img id="${PLAY_BUTTON_ID}" src="${playIcon}" alt="play" height="${height}" width="${width}" style="${ICON_COMMON_STYLES} ${ICON_SPACING}" />
                    <img id="${PAUSE_BUTTON_ID}" src="${pauseIcon}" alt="pause" height="${height}" width="${width}" style="${ICON_COMMON_STYLES} ${ICON_SPACING}" />
                    <img id="${STOP_BUTTON_ID}" src="${stopIcon}" alt="stop" height="${height}" width="${width}" style="${ICON_COMMON_STYLES}" />
            </div>
        `;
};

const setupEventListeners = () => {
  document.addEventListener("click", (event) => {
    if (event?.target?.id === PLAY_BUTTON_ID) runExecutionEngine();
    // Add pause/stop logic as needed
  });
};

const initialize = () => {
  const controlsContainer = createControlsContainer();
  document.body.appendChild(controlsContainer);
  setupEventListeners();
};

const highlightElement = (element, color = "yellow") => {
  if (!element) return;

  const originalOutline = element.style.outline;
  element.scrollIntoView({ behavior: "smooth", block: "center" });

  element.style.outline = `3px dashed ${color}`;
  element.style.transition = "outline 0.3s";

  setTimeout(() => {
    element.style.outline = originalOutline || "";
  }, 1500);
};

initialize();
