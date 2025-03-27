// Global variables
let currentTeam = null;
let currentTask = null;
let currentPhoto = null;
let stream = null;
let photoCanvas = null;
let photoContext = null;
let teamsFileId = null;

// Configuration
const GOOGLE_DRIVE_FOLDER_ID = '1qHL2vgr1rof782ER-VCm2hdyq8ElDlX0';
const TEAMS_FILE_NAME = 'teams.json';

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
        // Find or create teams.json file
        if (!teamsFileId) {
            const response = await gapi.client.drive.files.list({
                q: `name = '${TEAMS_FILE_NAME}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            if (response.result.files && response.result.files.length > 0) {
                teamsFileId = response.result.files[0].id;
            } else {
                // Create new teams.json file with empty data
                const createResponse = await gapi.client.drive.files.create({
                    resource: {
                        name: TEAMS_FILE_NAME,
                        parents: [GOOGLE_DRIVE_FOLDER_ID]
                    },
                    media: {
                        mimeType: 'application/json',
                        body: JSON.stringify({})
                    }
                });
                teamsFileId = createResponse.result.id;
            }
        }

        // Get teams data
        const response = await gapi.client.drive.files.get({
            fileId: teamsFileId,
            alt: 'media'
        });

        const teams = response.body || {};
        return teams[teamName] || { points: 0, completedTasks: [] };
    } catch (error) {
        console.error('Error loading team:', error);
        return { points: 0, completedTasks: [] };
    }
}

// Save team data to Google Drive
async function saveTeam(teamName, teamData) {
    try {
        // Get current teams data
        const response = await gapi.client.drive.files.get({
            fileId: teamsFileId,
            alt: 'media'
        });

        const teams = response.body || {};
        teams[teamName] = teamData;

        // Update teams.json file
        await gapi.client.drive.files.update({
            fileId: teamsFileId,
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(teams)
            }
        });

        return true;
    } catch (error) {
        console.error('Error saving team:', error);
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
        const teamData = await loadTeam(teamName);
        if (teamData.points === 0 && teamData.completedTasks.length === 0) {
            alert('Team not found!');
            return;
        }

        currentTeam = teamName;
        document.getElementById('team-points').textContent = teamData.points;
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
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    // Load the current team's data
    const teamData = await loadTeam(currentTeam);
    console.log('Loading tasks for team:', currentTeam, 'Data:', teamData);
    
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
                `<button onclick="startPhoto('${task.id}')">Take Photo</button>`
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

        if (!window.tokenClient) {
            throw new Error('Token client not initialized. Please refresh the page.');
        }

        // Request authorization
        window.tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw new Error(resp.error);
            }

            try {
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
                        'Authorization': `Bearer ${gapi.client.getToken().access_token}`
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
                    showTasks(Object.keys(tasks)[0]); // Show first location's tasks
                }
            } catch (err) {
                console.error('Upload error:', err);
                alert('Error saving photo: ' + err.message);
            }
        };

        if (gapi.client.getToken() === null) {
            window.tokenClient.requestAccessToken({prompt: ''});
        } else {
            window.tokenClient.requestAccessToken({prompt: ''});
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
    showTasks(Object.keys(tasks)[0]); // Show first location's tasks
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
}); 