// Global variables
let currentTeam = null;
let currentTask = null;
let currentPhoto = null;
let currentLocation = null;
let stream = null;
let photoCanvas = null;
let photoContext = null;
let teamsFileId = null;

// Configuration
const GOOGLE_DRIVE_FOLDER_ID = '1fSH2Xfeb1LT-PnpFkZE-SRDgkD-lqGRj';
const TEAMS_FILE_NAME = 'teams.json';
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

// Initialize Google API
async function initializeGoogleAPI() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        
        window.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
            callback: '', // defined later
        });
        
        console.log('Google API initialized successfully');
    } catch (error) {
        console.error('Error initializing Google API:', error);
    }
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
        window.tokenClient.requestAccessToken({prompt: ''});
    });
}

// Tasks data organized by location
const tasks = {
    'UK/Canada': [
        { id: 'uk1', description: 'With a Winnie the Pooh character topiary', points: 3 },
        { id: 'uk2', description: 'With Tinkerbell topiary', points: 3 },
        { id: 'uk3', description: 'In/by a Red Phone booth', points: 3 },
        { id: 'uk4', description: 'Find your way out of the hedge maze', points: 3 },
        { id: 'uk5', description: 'Giant tea pot tea displays', points: 3 },
        { id: 'uk6', description: 'Pretend drinking tea in the tea store', points: 3 },
        { id: 'uk7', description: 'Looking in the window at winnie the pooh plush', points: 3 },
        { id: 'uk8', description: 'Sitting at water fountain', points: 3 },
        { id: 'uk9', description: 'Ship in a bottle', points: 4 },
        { id: 'uk10', description: 'The knights in shining armor', points: 3 },
        { id: 'uk11', description: 'With the redcoat statue at attention', points: 3 },
        { id: 'ca1', description: 'The big waterfall', points: 3 },
        { id: 'ca2', description: 'Flying with the geese topiaries', points: 3 },
        { id: 'ca3', description: 'A totem pole', points: 2 },
        { id: 'ca4', description: 'With Canadian flag', points: 3 },
        { id: 'ca5', description: '"Drinking" maple syrup', points: 3 },
        { id: 'ca6', description: 'In the photo stand-in', points: 2 },
        // Common tasks for UK/Canada
        { id: 'ukca1', description: 'Picture with a cast member in any pavilion', points: 4 },
        { id: 'ukca2', description: 'Posing as and with a topiary', points: 2 },
        { id: 'ukca3', description: 'Surprised by a wait time over 50 minutes', points: 3 },
        { id: 'ukca4', description: 'Something over $1,000', points: 4 },
        { id: 'ukca5', description: 'Dancing to a band playing live music', points: 3 },
        { id: 'ukca6', description: 'Food packaging in a different language', points: 3 },
        { id: 'ukca7', description: 'Hidden mickey', points: 4 }
    ],
    'Mexico/Norway/China': [
        { id: 'mx1', description: 'In a sombrero', points: 3 },
        { id: 'mx2', description: 'Sitting on Mexico indoor fountain', points: 3 },
        { id: 'mx3', description: 'Pointing at plaza de los amigos sign', points: 3 },
        { id: 'mx4', description: 'Swooning over everlasting love statue', points: 3 },
        { id: 'mx5', description: 'Something with the three caballeros on it', points: 3 },
        { id: 'mx6', description: 'In front of the pre-Columbian pyramid', points: 2 },
        { id: 'no1', description: 'Wooden sculpture of Kristoff', points: 3 },
        { id: 'no2', description: 'Statue of Norwegian marathon champion Grete Waitz', points: 4 },
        { id: 'no3', description: 'Royal Commerhaus sign', points: 3 },
        { id: 'no4', description: 'Stave Church', points: 2 },
        { id: 'no5', description: 'King Olaf II Haroldson of Norway Statue', points: 3 },
        { id: 'no6', description: 'Image of thor in the Gallery', points: 3 },
        { id: 'no7', description: 'Image of the goddess of love in the Gallery', points: 4 },
        { id: 'no8', description: 'Something Frozen themed', points: 2 },
        { id: 'no9', description: 'With the troll', points: 4 },
        { id: 'cn1', description: 'Take a picture with Leigh\'s chinese zodiac symbol', points: 4 },
        { id: 'cn2', description: 'Gardens of imagination map', points: 4 },
        { id: 'cn3', description: 'Something with a dragon on it', points: 3 },
        { id: 'cn4', description: 'A buddha', points: 3 },
        { id: 'cn5', description: 'A lucky cat', points: 3 },
        { id: 'cn6', description: 'Under a chinese parasol umbrella', points: 3 },
        { id: 'cn7', description: 'One of the lion statues protecting the house of good fortune', points: 3 },
        { id: 'cn8', description: 'Hiding behind a china folding fan', points: 2 },
        { id: 'cn9', description: 'In front of the bianzhong', points: 3 },
        { id: 'cn10', description: 'With the small elephant statue', points: 3 },
        { id: 'cn11', description: 'In front of the temple of heaven', points: 2 },
        { id: 'cn12', description: 'With the zootopia art', points: 3 },
        // Common tasks for Mexico/Norway/China
        { id: 'mnc1', description: 'Picture with a cast member in any pavilion', points: 4 },
        { id: 'mnc2', description: 'Posing as and with a topiary', points: 2 },
        { id: 'mnc3', description: 'Surprised by a wait time over 50 minutes', points: 3 },
        { id: 'mnc4', description: 'Something over $1,000', points: 4 },
        { id: 'mnc5', description: 'Dancing to a band playing live music', points: 3 },
        { id: 'mnc6', description: 'Food packaging in a different language', points: 3 },
        { id: 'mnc7', description: 'Hidden mickey', points: 4 }
    ],
    'Germany/Italy/US': [
        { id: 'de1', description: 'Doors to Rhine River Cruise attraction', points: 4 },
        { id: 'de2', description: 'Miniature Train and Village', points: 2 },
        { id: 'de3', description: 'Pointing at miniature flower and garden banner', points: 3 },
        { id: 'de4', description: 'Hugging a Steiff plush', points: 3 },
        { id: 'de5', description: 'Posing like the clock hands with the clock tower', points: 2 },
        { id: 'de6', description: 'Swooning for the knight in the fountain', points: 3 },
        { id: 'de7', description: '"Cheers!" with a stein', points: 3 },
        { id: 'de8', description: 'Cuckoo clock', points: 3 },
        { id: 'de9', description: 'Wowww at the crystal cinderella\'s castle/spaceship earth/large crystal statue', points: 3 },
        { id: 'de10', description: 'Large golden nutcracker', points: 3 },
        { id: 'it1', description: 'In front of St Mark\'s Campanile', points: 2 },
        { id: 'it2', description: 'Sitting on the neptune fountain', points: 2 },
        { id: 'it3', description: 'With the parked gondolas', points: 2 },
        { id: 'it4', description: 'The donkey', points: 3 },
        { id: 'it5', description: '"Using" fancy perfume', points: 3 },
        { id: 'it6', description: 'By the moped', points: 3 },
        { id: 'it7', description: 'Something with a ferrari logo', points: 3 },
        { id: 'it8', description: 'Licking lips at gelateria', points: 3 },
        // Common tasks for Germany/Italy/US
        { id: 'deit1', description: 'Picture with a cast member in any pavilion', points: 4 },
        { id: 'deit2', description: 'Posing as and with a topiary', points: 2 },
        { id: 'deit3', description: 'Surprised by a wait time over 50 minutes', points: 3 },
        { id: 'deit4', description: 'Something over $1,000', points: 4 },
        { id: 'deit5', description: 'Dancing to a band playing live music', points: 3 },
        { id: 'deit6', description: 'Food packaging in a different language', points: 3 },
        { id: 'deit7', description: 'Hidden mickey', points: 4 }
    ],
    'Japan/Morocco/France': [
        { id: 'jp1', description: 'Tree pose with a bonsai tree', points: 3 },
        { id: 'jp2', description: 'Hugging a Studio Ghibli film character plush', points: 3 },
        { id: 'jp3', description: 'Hugging a pokemon plush', points: 3 },
        { id: 'jp4', description: 'Fish face with koi pond in Japan', points: 3 },
        { id: 'jp5', description: 'Watching a water feature', points: 2 },
        { id: 'jp6', description: 'Winged statue in kokedama garden', points: 3 },
        { id: 'jp7', description: 'A lucky cat', points: 3 },
        { id: 'jp8', description: 'Duffy and friends plushies in the gallery', points: 3 },
        { id: 'jp9', description: 'Kawaii museum harajuku girl', points: 3 },
        { id: 'jp10', description: 'Warrior on horse statue', points: 2 },
        { id: 'jp11', description: 'In front of the arch in the water', points: 2 },
        { id: 'fr1', description: 'Plugging your nose by a Remy sewer grate', points: 2 },
        { id: 'fr2', description: 'Health inspector plaque', points: 4 },
        { id: 'fr3', description: 'Excited for Château d\'Ego wines', points: 4 },
        { id: 'fr4', description: 'Reading in front of the book case', points: 3 },
        { id: 'fr5', description: 'Maleficent\'s outfit display', points: 3 },
        { id: 'fr6', description: 'Ratatouille fountain', points: 3 },
        { id: 'fr7', description: 'Woman by bicycle display', points: 3 },
        { id: 'mo1', description: 'Competing in "rally of the gazelles"', points: 3 },
        // Common tasks for Japan/Morocco/France
        { id: 'jmf1', description: 'Picture with a cast member in any pavilion', points: 4 },
        { id: 'jmf2', description: 'Posing as and with a topiary', points: 2 },
        { id: 'jmf3', description: 'Surprised by a wait time over 50 minutes', points: 3 },
        { id: 'jmf4', description: 'Something over $1,000', points: 4 },
        { id: 'jmf5', description: 'Dancing to a band playing live music', points: 3 },
        { id: 'jmf6', description: 'Food packaging in a different language', points: 3 },
        { id: 'jmf7', description: 'Hidden mickey', points: 4 }
    ]
};

// Load team data from Google Drive
async function loadTeam(teamName) {
    try {
        console.log('=== DEBUG: Starting loadTeam function ===');
        console.log('Current teamsFileId:', teamsFileId);
        console.log('Using folder ID:', GOOGLE_DRIVE_FOLDER_ID);
        
        // Get valid token
        const token = await getValidToken();
        console.log('Got valid token');
        
        // List all files in the folder to debug
        console.log('=== DEBUG: Listing all files in folder ===');
        const folderResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q='${GOOGLE_DRIVE_FOLDER_ID}' in parents&fields=files(id,name,parents,permissions,owners)&key=${API_KEY}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Referer': window.location.origin
            }
        });
        
        if (!folderResponse.ok) {
            const errorData = await folderResponse.json();
            console.error('Folder listing error:', errorData);
            throw new Error(`Failed to list folder contents: ${errorData.error?.message || folderResponse.statusText}`);
        }
        
        const folderData = await folderResponse.json();
        console.log('All files in folder:', JSON.stringify(folderData, null, 2));

        // Find or create teams.json file
        if (!teamsFileId) {
            console.log('=== DEBUG: Searching for teams.json file ===');
            // Search specifically in our folder
            const searchQuery = `name='${TEAMS_FILE_NAME}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents`;
            console.log('Search query:', searchQuery);
            
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,parents,permissions,owners)&key=${API_KEY}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Referer': window.location.origin
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Search response error:', errorData);
                throw new Error(`Failed to search for teams file: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Search response:', JSON.stringify(data, null, 2));

            // Filter files to only include those in our folder
            const filesInOurFolder = data.files.filter(file => 
                file.parents && file.parents.includes(GOOGLE_DRIVE_FOLDER_ID)
            );
            console.log('Files in our folder:', JSON.stringify(filesInOurFolder, null, 2));

            if (filesInOurFolder.length > 0) {
                teamsFileId = filesInOurFolder[0].id;
                console.log('Found existing teams file:', teamsFileId);
                console.log('File details:', JSON.stringify(filesInOurFolder[0], null, 2));
            } else {
                console.log('Creating new teams.json file...');
                // Create new teams.json file with empty data
                const metadata = {
                    name: TEAMS_FILE_NAME,
                    parents: [GOOGLE_DRIVE_FOLDER_ID],
                    mimeType: 'application/json'
                };
                
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', new Blob(['{}'], { type: 'application/json' }));

                console.log('Sending create request...');
                const createResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Referer': window.location.origin
                    },
                    body: form
                });
                
                if (!createResponse.ok) {
                    const errorData = await createResponse.json();
                    console.error('Create response error:', errorData);
                    throw new Error(`Failed to create teams file: ${errorData.error?.message || createResponse.statusText}`);
                }
                
                const createData = await createResponse.json();
                teamsFileId = createData.id;
                console.log('Created new teams file:', teamsFileId);
                console.log('Create response:', JSON.stringify(createData, null, 2));

                // Verify the file was created
                const verifyResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${teamsFileId}?fields=id,name,parents&key=${API_KEY}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Referer': window.location.origin
                    }
                });
                
                if (!verifyResponse.ok) {
                    const errorData = await verifyResponse.json();
                    console.error('Verification error:', errorData);
                    throw new Error(`Failed to verify file creation: ${errorData.error?.message || verifyResponse.statusText}`);
                }
                
                const verifyData = await verifyResponse.json();
                console.log('Verified teams file:', JSON.stringify(verifyData, null, 2));
            }
        }

        // Get teams data
        console.log('Fetching teams data...');
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${teamsFileId}?alt=media&key=${API_KEY}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Referer': window.location.origin
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch response error:', errorData);
            throw new Error(`Failed to fetch teams data: ${errorData.error?.message || response.statusText}`);
        }
        
        const teams = await response.json();
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

// Save team data to Google Drive
async function saveTeam(teamName, teamData) {
    try {
        console.log('Starting saveTeam function...');
        console.log('Team name:', teamName);
        console.log('Team data:', JSON.stringify(teamData, null, 2));

        // Get valid token
        const token = await getValidToken();

        // Get current teams data
        console.log('Fetching current teams data...');
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${teamsFileId}?alt=media&key=${API_KEY}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Referer': window.location.origin
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Fetch response error:', errorData);
            throw new Error(`Failed to fetch current teams data: ${errorData.error?.message || response.statusText}`);
        }
        
        const teams = await response.json();
        console.log('Current teams data:', JSON.stringify(teams, null, 2));

        teams[teamName] = teamData;
        console.log('Updated teams data:', JSON.stringify(teams, null, 2));

        // Update teams.json file
        console.log('Updating teams.json file...');
        const metadata = {
            name: TEAMS_FILE_NAME,
            mimeType: 'application/json'
        };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([JSON.stringify(teams)], { type: 'application/json' }));

        const updateResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${teamsFileId}?uploadType=multipart`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Referer': window.location.origin
            },
            body: form
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('Update response error:', errorData);
            throw new Error(`Failed to update teams file: ${errorData.error?.message || updateResponse.statusText}`);
        }

        const updateData = await updateResponse.json();
        console.log('Update response:', updateData);

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