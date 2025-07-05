const controlsContainerId = "custom-controls-container";

const controlsContainer = document.createElement("div");
controlsContainer.id = controlsContainerId;

const playIcon = chrome.runtime.getURL("assets/play.png");
const pauseIcon = chrome.runtime.getURL("assets/pause.png");
const stopIcon = chrome.runtime.getURL("assets/stop.png");

const buttonsContainer = `
    <div id="buttons-container">
        <img id="play-btn" src="${playIcon}" alt="play" height="20" width="20" style="margin-bottom: 15px; cursor: pointer; display: block;" />
        <img id="pause-btn" src="${pauseIcon}" alt="pause" height="20" width="20" style="margin-bottom: 15px; cursor: pointer; display: block; " />
        <img id="stop-btn" src="${stopIcon}" alt="stop" height="20" width="20" style="cursor: pointer; display: block;" />
    </div>
`;

controlsContainer.innerHTML = buttonsContainer;

controlsContainer.style.position = "fixed";
controlsContainer.style.bottom = "50%";
controlsContainer.style.right = "20px";
controlsContainer.style.padding = "15px";
controlsContainer.style.backgroundColor = "white";
controlsContainer.style.color = "white";
controlsContainer.style.boxShadow = "1px 1px 1px 1px #b5b3b3";
controlsContainer.style.zIndex = "10000";
controlsContainer.style.borderRadius = "8px";

document.body.appendChild(controlsContainer);
