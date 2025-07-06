# immigration-ai-extension

Chrome extension that automates repetitive web actions depending on the input script

Progress:

Implemented Features:
populating variables in commands dynamically
finding an element using the next selector if first selector is not working (fallback)
highlighting the element on which action is happening
triggering actions such as input, click or assertions

To Do:
implement stop functionality
implement manual action modal/auto pause for fields that needs manual inputs (I need an example script for such actions)
trigger actions from a confined button on screen and fetch commands from backend (need id to place a button and api details to fetch)
side buttons should appear only once main button is pressed and execution starts

Known Bug:
actions are not being performed on first click of play button in few cases (this will be fixed in future versions as we will be moving to a different trigger)
