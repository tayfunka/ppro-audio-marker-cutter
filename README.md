# Premiere Pro ExtendScript: Razor and Delete Sequence Clips by Audio Markers

This project is an ExtendScript utility designed for Adobe Premiere Pro 23.0. It automates the process of cutting sequence clips based on audio markers. The script identifies marker sections on the audio track and removes the corresponding sequence items within those time ranges.

## Features

- Detects audio markers in a sequence.
- Razor and deletes sequence clips based on the time ranges defined by the markers.
- Simplifies repetitive editing tasks, saving time and effort.

## Example Use Case

If the audio track has markers from 1 second to 3 seconds, the script will:
1. Identify the marker section (1s to 3s).
2. Delete the sequence items within that time range.

## Requirements

- **Adobe Premiere Pro 23.0**: Ensure you have this version installed.
- **VS Code ExtendScript Debugger**: Used to connect and evaluate the script in Premiere Pro.

## Installation

1. Clone or download this repository to your local machine.
2. Open the project in **Visual Studio Code**.
3. Install the [ExtendScript Debugger](https://marketplace.visualstudio.com/items?itemName=Adobe.extendscript-debug) extension in VS Code.

## Usage

1. Open your Premiere Pro project and load the sequence you want to edit.
2. Place markers on the audio track to define the sections you want to razor.
3. In VS Code, open the `cutMarkers.jsx` script.
4. Use the ExtendScript Debugger to connect to Premiere Pro:
   - Set the target application to Premiere Pro.
   - Run the script to evaluate it in Premiere Pro.
5. The script will process the markers and razor the sequence clips accordingly.

## Key Script: `cutMarkers.jsx`

The main logic for detecting markers and cutting sequence clips is implemented in the `cutMarkers.jsx` file. Ensure this file is correctly configured and loaded into Premiere Pro for the script to function.

## Notes

- Always back up your Premiere Pro project before running the script.
- Test the script on a sample sequence to ensure it behaves as expected.

## Contributing

Feel free to submit issues or pull requests to improve the script or add new features.

