// Communication System Frontend JavaScript
// Features: Real-time messaging, file sharing, status updates, notifications

// Global state
let currentConversationId = null;
let currentUserId = 1; // In production, get from session/JWT
let messagesPollingInterval = null;
let selectedFiles = [];
let isTyping = false;
let typingTimeout = null;

// Initialize the chat interface
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    
    // Check for conversation parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    if (conversationId) {
        openConversationById(conversationId);
    }
});

function initializeChat() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize real-time features (simulated with polling)
    startPolling();
    
    // Load user preferences
    loadUserPreferences();
}

function setupEventListeners() {
    // Message input auto-resize
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            autoResize(this);
            handleTypingIndicator();
        });
    }
    
    // File input change
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
}

// ============================================================================
// REAL-TIME MESSAGING FUNCTIONS
// ============================================================================

function openConversation(conversationId, displayName) {
    currentConversationId = conversationId;
    
    // Update UI
    showChatArea();
    updateChatHeader(displayName);
    
    // Load messages
    loadMessages(conversationId);
    
    // Start polling for new messages
    startMessagesPolling();
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('conversation', conversationId);
    window.history.pushState({}, '', url);
}

function openConversationById(conversationId) {
    // Get conversation details first
    fetch(`/communication/api/conversations/${conversationId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const conv = data.conversation;
                const displayName = conv.participant_name || 'Unknown User';
                openConversation(conversationId, displayName);
            }
        })
        .catch(error => {
            console.error('Error fetching conversation:', error);
        });
}

function showChatArea() {
    document.getElementById('no-chat-selected').classList.add('hidden');
    document.getElementById('chat-header').classList.remove('hidden');
    document.getElementById('messages-list').classList.remove('hidden');
    document.getElementById('message-input-area').classList.remove('hidden');
}

function updateChatHeader(displayName) {
    document.getElementById('chat-name').textContent = displayName;
    document.getElementById('chat-avatar').textContent = displayName.charAt(0).toUpperCase();
}

function loadMessages(conversationId) {
    fetch(`/communication/api/conversations/${conversationId}/messages`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayMessages(data.messages);
                scrollToBottom();
            }
        })
        .catch(error => {
            console.error('Error loading messages:', error);
        });
}

function displayMessages(messages) {
    const messagesList = document.getElementById('messages-list');
    messagesList.innerHTML = '';
    
    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesList.appendChild(messageElement);
    });
}

function createMessageElement(message) {
    const isOwnMessage = message.sender_id === currentUserId;
    const senderName = `${message.first_name} ${message.last_name}`;
    const messageTime = new Date(message.created_at).toLocaleTimeString();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`;
    
    messageDiv.innerHTML = `
        <div class="${isOwnMessage ? 'order-2' : 'order-1'} message-bubble">
            <div class="flex items-end space-x-2">
                ${!isOwnMessage ? `
                    <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                        ${senderName.charAt(0).toUpperCase()}
                    </div>
                ` : ''}
                
                <div class="${isOwnMessage ? 'bg-kwikr-green text-white' : 'bg-white text-gray-900'} rounded-lg px-4 py-2 shadow">
                    ${!isOwnMessage ? `<div class="text-xs text-gray-500 mb-1">${senderName}</div>` : ''}
                    
                    ${message.reply_to ? `
                        <div class="bg-gray-100 border-l-4 border-gray-400 pl-3 py-2 mb-2 text-sm italic">
                            Replying to previous message
                        </div>
                    ` : ''}
                    
                    <div class="message-content">
                        ${renderMessageContent(message)}
                    </div>
                    
                    ${message.attachments && message.attachments.length > 0 ? `
                        <div class="mt-2 space-y-1">
                            ${message.attachments.map(att => `
                                <div class="flex items-center space-x-2 bg-gray-100 rounded p-2">
                                    <i class="fas fa-${getFileIcon(att.file_type)} text-gray-600"></i>
                                    <a href="${att.file_url}" target="_blank" class="text-sm text-blue-600 hover:underline">
                                        ${att.filename}
                                    </a>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-xs ${isOwnMessage ? 'text-green-100' : 'text-gray-500'}">${messageTime}</span>
                        ${isOwnMessage ? `
                            <div class="flex items-center space-x-1">
                                <i class="fas fa-check text-xs ${message.is_read ? 'text-blue-200' : 'text-green-200'}" title="${message.is_read ? 'Read' : 'Delivered'}"></i>
                                ${message.is_read ? '<i class="fas fa-check text-xs text-blue-200" title="Read"></i>' : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${isOwnMessage ? `
                    <div class="w-8 h-8 rounded-full bg-kwikr-green flex items-center justify-center text-xs font-bold text-white">
                        You
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    return messageDiv;
}

function renderMessageContent(message) {
    if (message.message_type === 'system') {
        return `<em class="text-gray-500">${message.content}</em>`;
    }
    
    if (message.message_type === 'image') {
        return `
            <img src="${message.content}" alt="Shared image" class="max-w-xs rounded cursor-pointer" onclick="openImageModal('${message.content}')">
        `;
    }
    
    // Convert URLs to links
    let content = message.content;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank" class="underline">$1</a>');
    
    return content;
}

function getFileIcon(fileType) {
    const iconMap = {
        'image': 'image',
        'pdf': 'file-pdf',
        'document': 'file-word',
        'text': 'file-text',
        'video': 'file-video',
        'audio': 'file-audio'
    };
    return iconMap[fileType] || 'file';
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content && selectedFiles.length === 0) return;
    if (!currentConversationId) return;
    
    // Send text message if content exists
    if (content) {
        const messageData = {
            content: content,
            message_type: 'text'
        };
        
        fetch(`/communication/api/conversations/${currentConversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messageInput.value = '';
                autoResize(messageInput);
                loadMessages(currentConversationId); // Refresh messages
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            showNotification('Failed to send message', 'error');
        });
    }
    
    // Handle file uploads if any
    if (selectedFiles.length > 0) {
        uploadFiles();
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ============================================================================
// FILE SHARING FUNCTIONS (Feature 3)
// ============================================================================

function openFileDialog() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const files = event.target.files;
    selectedFiles = Array.from(files);
    
    if (selectedFiles.length > 0) {
        showFilePreview();
    }
}

function showFilePreview() {
    const filePreview = document.getElementById('file-preview');
    const fileList = document.getElementById('file-list');
    
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'flex items-center justify-between bg-white rounded p-2';
        
        fileItem.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${getFileIconFromMime(file.type)} text-gray-600"></i>
                <div>
                    <div class="text-sm font-medium">${file.name}</div>
                    <div class="text-xs text-gray-500">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        fileList.appendChild(fileItem);
    });
    
    filePreview.classList.remove('hidden');
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    
    if (selectedFiles.length === 0) {
        clearFilePreview();
    } else {
        showFilePreview();
    }
}

function clearFilePreview() {
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('fileInput').value = '';
    selectedFiles = [];
}

function uploadFiles() {
    if (selectedFiles.length === 0) return;
    
    selectedFiles.forEach(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversation_id', currentConversationId);
        
        fetch('/communication/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Send message with file attachment
                const messageData = {
                    content: `Shared file: ${file.name}`,
                    message_type: 'file'
                };
                
                return fetch(`/communication/api/conversations/${currentConversationId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(messageData)
                });
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadMessages(currentConversationId);
            }
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            showNotification('Failed to upload file', 'error');
        });
    });
    
    clearFilePreview();
}

function getFileIconFromMime(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf')) return 'file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word';
    if (mimeType.includes('text')) return 'file-text';
    if (mimeType.startsWith('video/')) return 'file-video';
    if (mimeType.startsWith('audio/')) return 'file-audio';
    return 'file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================================
// REAL-TIME FEATURES & POLLING
// ============================================================================

function startPolling() {
    // Simulate real-time by polling for updates every 2 seconds
    setInterval(() => {
        if (currentConversationId) {
            checkForNewMessages();
        }
        updateConversationsList();
    }, 2000);
}

function startMessagesPolling() {
    if (messagesPollingInterval) {
        clearInterval(messagesPollingInterval);
    }
    
    messagesPollingInterval = setInterval(() => {
        if (currentConversationId) {
            checkForNewMessages();
        }
    }, 1000);
}

function checkForNewMessages() {
    const messagesList = document.getElementById('messages-list');
    const lastMessage = messagesList.lastElementChild;
    let lastMessageTime = null;
    
    if (lastMessage) {
        // Extract timestamp from last message (simplified)
        lastMessageTime = new Date().toISOString(); // In production, get actual timestamp
    }
    
    fetch(`/communication/api/conversations/${currentConversationId}/messages?since=${lastMessageTime || ''}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.messages.length > 0) {
                // Add new messages without reloading all
                data.messages.forEach(message => {
                    const messageElement = createMessageElement(message);
                    messagesList.appendChild(messageElement);
                });
                scrollToBottom();
                
                // Play notification sound for new messages from others
                const hasNewFromOthers = data.messages.some(msg => msg.sender_id !== currentUserId);
                if (hasNewFromOthers) {
                    playNotificationSound();
                    showDesktopNotification(data.messages[0]);
                }
            }
        })
        .catch(error => {
            console.error('Error checking for new messages:', error);
        });
}

function updateConversationsList() {
    // Update conversation list with new message indicators
    // This would refresh the sidebar conversation list
}

// ============================================================================
// TYPING INDICATORS
// ============================================================================

function handleTypingIndicator() {
    if (!isTyping) {
        isTyping = true;
        sendTypingStatus(true);
    }
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        isTyping = false;
        sendTypingStatus(false);
    }, 1000);
}

function sendTypingStatus(typing) {
    if (!currentConversationId) return;
    
    fetch(`/communication/api/conversations/${currentConversationId}/typing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ typing })
    }).catch(error => {
        console.error('Error sending typing status:', error);
    });
}

// ============================================================================
// NOTIFICATIONS (Feature 4)
// ============================================================================

function playNotificationSound() {
    // Play a subtle notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBiOPyurl'); 
    audio.volume = 0.1;
    audio.play().catch(e => {}); // Ignore autoplay restrictions
}

function showDesktopNotification(message) {
    if (Notification.permission === 'granted') {
        const senderName = `${message.first_name} ${message.last_name}`;
        const notification = new Notification(`New message from ${senderName}`, {
            body: message.content.substring(0, 100),
            icon: '/static/icon-notification.png'
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        setTimeout(() => notification.close(), 5000);
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ============================================================================
// USER INTERFACE HELPERS
// ============================================================================

function startNewConversation() {
    // Show modal to select user and start conversation
    showNewConversationModal();
}

function showNewConversationModal() {
    // Create modal for starting new conversation
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-96">
            <h3 class="text-lg font-semibold mb-4">Start New Conversation</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search Users:</label>
                    <input type="text" id="userSearch" placeholder="Type name or email..." 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green">
                </div>
                <div id="userResults" class="max-h-48 overflow-y-auto">
                    <!-- User search results will appear here -->
                </div>
                <div class="flex justify-end space-x-3">
                    <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set up user search
    const searchInput = modal.querySelector('#userSearch');
    searchInput.addEventListener('input', function() {
        searchUsers(this.value);
    });
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function searchUsers(query) {
    if (query.length < 2) return;
    
    fetch(`/communication/api/users/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('userResults');
            resultsContainer.innerHTML = '';
            
            if (data.success && data.users.length > 0) {
                data.users.forEach(user => {
                    const userDiv = document.createElement('div');
                    userDiv.className = 'flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer';
                    userDiv.onclick = () => startConversationWithUser(user.id, user.name);
                    
                    userDiv.innerHTML = `
                        <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <span class="text-xs font-bold text-white">${user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div class="font-medium">${user.name}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                        </div>
                    `;
                    
                    resultsContainer.appendChild(userDiv);
                });
            } else {
                resultsContainer.innerHTML = '<p class="text-gray-500 text-sm p-2">No users found</p>';
            }
        })
        .catch(error => {
            console.error('Error searching users:', error);
        });
}

function startConversationWithUser(userId, userName) {
    fetch('/communication/api/conversations/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            participant_id: userId,
            type: 'direct'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            openConversation(data.conversation.id, userName);
        }
    })
    .catch(error => {
        console.error('Error creating conversation:', error);
    });
}

function closeModal() {
    const modals = document.querySelectorAll('.fixed.inset-0');
    modals.forEach(modal => modal.remove());
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function loadUserPreferences() {
    // Load user notification preferences and settings
    fetch('/communication/api/preferences')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.preferences.desktop_notifications) {
                requestNotificationPermission();
            }
        })
        .catch(error => {
            console.error('Error loading preferences:', error);
        });
}

// ============================================================================
// ADDITIONAL FEATURES
// ============================================================================

function toggleFileSharing() {
    openFileDialog();
}

function showConversationInfo() {
    // Show conversation details, participants, settings
    console.log('Show conversation info for:', currentConversationId);
}

function openImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="max-w-4xl max-h-full p-4">
            <img src="${imageUrl}" alt="Full size image" class="max-w-full max-h-full object-contain">
            <button onclick="closeModal()" class="absolute top-4 right-4 text-white text-2xl">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.body.appendChild(modal);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Communication system initialized');
});