# Epcot Scavenger Hunt App

A mobile-friendly web application for organizing and participating in a scavenger hunt at Epcot. Teams take photos of specific tasks to earn points, with photos saved for a photobook.

## Features

- Team creation and management
- Task viewing by location
- Photo taking and uploading
- Point tracking
- Mobile-friendly interface

## Project Structure

```
epcot-scavenger-hunt/
├── index.html          # Main application interface
├── styles.css          # Application styling
├── script.js           # Application logic
├── upload.php          # Backend photo upload handler
└── data/              # JSON data files
    ├── tasks.json     # Scavenger hunt tasks
    └── teams.json     # Team data
```

## Setup Instructions

### Frontend (GitHub Pages)

1. Fork this repository
2. Go to repository Settings > Pages
3. Select "main" branch as the source
4. Your site will be available at `https://YOUR_USERNAME.github.io/epcot-scavenger-hunt`

### Backend (PHP Server)

1. Sign up for a free PHP hosting account at one of these providers:
   - [InfinityFree](https://infinityfree.com/) (Recommended)
   - [Hostinger Free Hosting](https://www.hostinger.com/free-hosting)
   - [x10Hosting](https://x10hosting.com/)

2. Create a new website/hosting account

3. Upload these files to your hosting:
   - `upload.php`
   - Create an `uploads` directory with write permissions (777)

4. Update the `SERVER_URL` in `script.js` to point to your PHP hosting domain

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
2. Set up a local PHP server (e.g., XAMPP, MAMP)
3. Update `SERVER_URL` in `script.js` to point to your local server
4. Open `index.html` in a browser

## Notes

- Photos are stored on the PHP server
- Team data is stored in browser localStorage
- The app is optimized for mobile devices
- Make sure your PHP hosting provider allows file uploads and has sufficient storage space 