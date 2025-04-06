// Global variables
let currentTeam = null;
let currentTask = null;
let currentPhoto = null;
let currentLocation = null;
let stream = null;
let photoCanvas = null;
let photoContext = null;

// Configuration
const GOOGLE_DRIVE_FOLDER_ID = '1fSH2Xfeb1LT-PnpFkZE-SRDgkD-lqGRj'; // For storing photos
const NPOINT_ID = '7d8a2bb0fe5092349a03'; // Replace with your npoint.io bin ID
const CLIENT_ID = '770657216624-v7j2d3bdpsj2t70qejqiselj5u077h2u.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDxR99_WeVcr4mA8AmalaJ85VlqdI7oocs';

// Token management
function getStoredToken() {
    const tokenData = localStorage.getItem('googleDriveToken');
    if (!tokenData) return null;
    
    const { token, expiresAt } = JSON.parse(tokenData);
    if (expiresAt && Date.now() >= expiresAt) {
        localStorage.removeItem('googleDriveToken');
        return null;
    }
    return token;
}

function storeToken(token, expiresIn) {
    const expiresAt = Date.now() + (expiresIn * 1000);
    localStorage.setItem('googleDriveToken', JSON.stringify({ token, expiresAt }));
}

// Get a valid token
async function getValidToken() {
    // Check for stored token first
    const storedToken = getStoredToken();
    if (storedToken) {
        return storedToken;
    }

    // If no stored token, request a new one
    return new Promise((resolve, reject) => {
        window.tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                reject(resp.error);
                return;
            }
            // Store the new token
            storeToken(resp.access_token, resp.expires_in);
            resolve(resp.access_token);
        };
        window.tokenClient.requestAccessToken({prompt: 'consent'});
    });
}

// Initialize Google API
async function initializeGoogleAPI() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ],
        });
        
        window.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: '', // defined later
        });
        
        // Try to get a token immediately to prompt for login at start
        try {
            await getValidToken();
        } catch (error) {
            console.error('Initial token fetch failed:', error);
        }
        
        console.log('Google API initialized successfully');
    } catch (error) {
        console.error('Error initializing Google API:', error);
    }
}

// Load team data from npoint.io
async function loadTeam(teamName) {
    try {
        console.log('=== DEBUG: Starting loadTeam function ===');
        
        const response = await fetch(`https://api.npoint.io/${NPOINT_ID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch team data');
        }

        const data = await response.json();
        const teams = data.teams || {};
        console.log('Teams data:', JSON.stringify(teams, null, 2));

        // If no team name provided, return all teams data
        if (!teamName) {
            return teams;
        }

        // Return specific team data or empty team data if not found
        return teams[teamName] || { points: 0, completedTasks: [] };
    } catch (error) {
        console.error('Error in loadTeam:', error);
        console.error('Error stack:', error.stack);
        return { points: 0, completedTasks: [] };
    }
}

// Save team data to npoint.io
async function saveTeam(teamName, teamData) {
    try {
        console.log('Starting saveTeam function...');
        console.log('Team name:', teamName);
        console.log('Team data:', JSON.stringify(teamData, null, 2));

        // Get current data first
        const response = await fetch(`https://api.npoint.io/${NPOINT_ID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch current data');
        }

        const data = await response.json();
        const teams = data.teams || {};
        
        // Update team data
        teams[teamName] = teamData;

        // Save back to npoint.io
        const updateResponse = await fetch(`https://api.npoint.io/${NPOINT_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teams })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update team data');
        }

        return true;
    } catch (error) {
        console.error('Error in saveTeam:', error);
        alert('Failed to save team data. Please try again.');
        return false;
    }
}

// Show a specific screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Create a new team
async function createTeam() {
    const teamName = document.getElementById('team-name').value.trim();
    if (!teamName) {
        alert('Please enter a team name');
        return;
    }

    try {
        // Check if team exists
        const teamData = await loadTeam(teamName);
        if (teamData.points > 0 || teamData.completedTasks.length > 0) {
            alert('Team already exists!');
            return;
        }

        // Create new team
        const newTeamData = { points: 0, completedTasks: [] };
        if (await saveTeam(teamName, newTeamData)) {
            currentTeam = teamName;
            showGameScreen();
        }
    } catch (error) {
        console.error('Error creating team:', error);
        alert('Failed to create team. Please try again.');
    }
}

// Join an existing team
async function joinTeam() {
    const teamName = document.getElementById('team-name').value.trim();
    if (!teamName) {
        alert('Please enter a team name');
        return;
    }

    try {
        console.log('Attempting to join team:', teamName);
        
        // Load all teams data first
        const teams = await loadTeam(''); // Load all teams data
        console.log('All teams data:', JSON.stringify(teams, null, 2));
        
        if (!teams[teamName]) {
            console.log('Team not found in teams data');
            alert('Team not found!');
            return;
        }

        currentTeam = teamName;
        document.getElementById('team-points').textContent = teams[teamName].points;
        showGameScreen();
    } catch (error) {
        console.error('Error joining team:', error);
        alert('Failed to join team. Please try again.');
    }
}

// Show the game screen
function showGameScreen() {
    document.getElementById('current-team').textContent = currentTeam;
    showLocations();
    showScreen('game-screen');
    
    // Load and display total points
    loadTeam(currentTeam).then(teamData => {
        document.getElementById('team-points').textContent = teamData.points;
    });
}

// Show location buttons
function showLocations() {
    const locationButtons = document.getElementById('location-buttons');
    locationButtons.innerHTML = '';
    
    Object.keys(tasks).forEach(location => {
        const button = document.createElement('button');
        button.textContent = location;
        button.onclick = () => showTasks(location);
        locationButtons.appendChild(button);
    });
}

// Show tasks for a specific location
async function showTasks(location) {
    currentLocation = location;
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    // Load the current team's data
    const teamData = await loadTeam(currentTeam);
    console.log('Loading tasks for team:', currentTeam, 'Data:', teamData);
    
    // Calculate section points
    const sectionPoints = tasks[location].reduce((total, task) => {
        if (teamData.completedTasks && teamData.completedTasks.includes(task.id)) {
            return total + task.points;
        }
        return total;
    }, 0);
    
    // Add section points display
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.innerHTML = `
        <h3>${location}</h3>
        <div class="section-points">Section Points: ${sectionPoints}</div>
    `;
    taskList.appendChild(sectionHeader);
    
    tasks[location].forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        // Check if this task is in the team's completed tasks
        const isCompleted = teamData.completedTasks && teamData.completedTasks.includes(task.id);
        console.log('Task:', task.id, 'Completed:', isCompleted);
        
        taskElement.innerHTML = `
            <div>
                <div>${task.description}</div>
                <div>Points: ${task.points}</div>
            </div>
            ${isCompleted ? 
                '<span>✓ Completed</span>' : 
                `<button onclick="startPhoto('${task.id}')"><span>Take</span><span>Photo</span></button>`
            }
        `;
        
        taskList.appendChild(taskElement);
    });
}

// Start the photo process
function startPhoto(taskId) {
    currentTask = taskId;
    currentPhoto = null;
    document.getElementById('photo-preview').innerHTML = '';
    showScreen('camera-screen');
}

// Retake the photo
function retakePhoto() {
    currentPhoto = null;
    document.getElementById('photo-preview').innerHTML = '';
    document.getElementById('camera-input').value = '';
}

// Save the photo and complete the task
async function savePhoto() {
    if (!currentPhoto) {
        alert('Please take a photo first!');
        return;
    }

    // Validate file type
    if (!currentPhoto.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Validate file size (10MB limit)
    if (currentPhoto.size > 10 * 1024 * 1024) {
        alert('File is too large. Maximum size is 10MB');
        return;
    }

    const teamData = await loadTeam(currentTeam);
    if (teamData.completedTasks.includes(currentTask)) {
        alert('Task already completed!');
        return;
    }

    try {
        if (!window.gapiInited || !window.gisInited) {
            throw new Error('Google API not initialized. Please refresh the page.');
        }

        // Get valid token
        const token = await getValidToken();

        // Upload to Google Drive
        const metadata = {
            name: `${currentTeam}_${currentTask}_${Date.now()}.jpg`,
            parents: [GOOGLE_DRIVE_FOLDER_ID]
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', currentPhoto);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Referer': window.location.origin
            },
            body: form
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to upload to Google Drive');
        }

        // Update team data
        const task = Object.values(tasks)
            .flat()
            .find(t => t.id === currentTask);
        
        teamData.points += task.points;
        teamData.completedTasks.push(currentTask);
        
        // Save the updated team data
        if (await saveTeam(currentTeam, teamData)) {
            // Update the points display
            document.getElementById('team-points').textContent = teamData.points;
            // Return to game screen and refresh tasks
            showGameScreen();
            showTasks(currentLocation);
        }
    } catch (err) {
        console.error('Error in savePhoto:', err);
        alert('Error saving photo: ' + err.message);
    }
}

// Cancel taking a photo and return to task list
function cancelPhoto() {
    currentPhoto = null;
    document.getElementById('photo-preview').innerHTML = '';
    document.getElementById('camera-input').value = '';
    showGameScreen();
    showTasks(currentLocation);
}

// Set up camera input handler
document.getElementById('camera-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        currentPhoto = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
    }
}); 