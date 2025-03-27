# Epcot Scavenger Hunt App

A mobile-friendly web application for organizing and participating in a scavenger hunt at Epcot. Teams take photos of specific tasks to earn points, with photos saved for a photobook.

## Features

- Team creation and management
- Task viewing by location
- Photo taking and uploading
- Point tracking
- Mobile-friendly interface
- Real-time team data sync across devices

## Project Structure

```
epcot-scavenger-hunt/
├── index.html          # Main application interface
├── styles.css          # Application styling
└── script.js           # Application logic
```

## Setup Instructions

### Frontend (GitHub Pages)

1. Fork this repository
2. Go to repository Settings > Pages
3. Select "main" branch as the source
4. Your site will be available at `https://YOUR_USERNAME.github.io/epcot-scavenger-hunt`

### Google Drive Setup

1. Create a Google Drive folder for the scavenger hunt
2. Share the folder with appropriate access (view/edit)
3. Update the `GOOGLE_DRIVE_FOLDER_ID` in `script.js` with your folder ID
4. Make sure you have enabled the Google Drive API in your Google Cloud Console

## How to Use

1. Visit the GitHub Pages URL
2. Create or join a team
3. View tasks by location
4. Take photos of completed tasks
5. Upload photos to earn points
6. Track your team's progress

## Development

To run locally:
1. Clone the repository
2. Open `index.html` in a browser
3. Make sure you have access to the Google Drive folder

## Notes

- Team data and photos are stored in Google Drive
- The app is optimized for mobile devices
- All team members need to sign in with their Google account to access the app 