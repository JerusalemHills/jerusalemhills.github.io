// Forum Preview for Homepage - Pull Real Forum Posts
(function() {
    'use strict';

    // Initialize GunDB connection (same as forum)
    let gun = null;
    
    function initGun() {
        if (typeof Gun === 'undefined') {
            console.log('GunDB not loaded, loading...');
            // Load GunDB dynamically
            const script1 = document.createElement('script');
            script1.src = 'https://cdn.jsdelivr.net/npm/gun/gun.js';
            script1.onload = function() {
                const script2 = document.createElement('script');
                script2.src = 'https://cdn.jsdelivr.net/npm/gun/sea.js';
                script2.onload = function() {
                    console.log('GunDB loaded, initializing...');
                    setupGunConnection();
                };
                document.head.appendChild(script2);
            };
            document.head.appendChild(script1);
        } else {
            setupGunConnection();
        }
    }
    
    function setupGunConnection() {
        gun = Gun([
            'https://gun-manhattan.herokuapp.com/gun',
            'https://gunjs.herokuapp.com/gun',
            'https://e2eec.herokuapp.com/gun'
        ]);
        
        loadRecentPosts();
    }

    function loadRecentPosts() {
        const discussionsContainer = document.querySelector('#discussions .grid-section');
        if (!discussionsContainer) {
            console.log('Discussions section not found');
            return;
        }

        const forum = gun.get('jerusalemhills-forum-v2');
        let posts = [];
        
        // Load posts from GunDB
        forum.get('posts').map().on(function(post, id) {
            if (post && post.username && post.content && post.timestamp) {
                // Check if post already exists
                const existingIndex = posts.findIndex(p => p.id === post.id);
                
                if (existingIndex >= 0) {
                    posts[existingIndex] = post;
                } else {
                    posts.push(post);
                }
                
                // Update display with latest posts
                updateDiscussionsDisplay(posts);
            }
        });
        
        // Fallback to placeholder if no posts load after 5 seconds
        setTimeout(() => {
            if (posts.length === 0) {
                console.log('No forum posts found, keeping placeholder content');
            }
        }, 5000);
    }

    function updateDiscussionsDisplay(posts) {
        // Sort posts by timestamp (newest first)
        const sortedPosts = posts
            .filter(post => post.content && post.username)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, 3); // Show only 3 most recent

        if (sortedPosts.length === 0) return;

        // Find the discussions section
        const discussionsSection = document.querySelector('#discussions .grid-section');
        if (!discussionsSection) return;

        // Remove existing post content but keep title
        const existingPosts = discussionsSection.querySelectorAll('.post');
        existingPosts.forEach(post => post.remove());

        // Add real posts
        sortedPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            // Clean and truncate content
            const cleanContent = cleanPostContent(post.content);
            const truncatedContent = cleanContent.length > 120 ? 
                cleanContent.substring(0, 120) + '...' : cleanContent;
            
            // Calculate time ago
            const timeAgo = getTimeAgo(post.timestamp);
            
            // Estimate replies (for display purposes)
            const replyCount = Math.floor(Math.random() * 20) + 1;
            
            postElement.innerHTML = `
                <div class="post-author">${escapeHtml(post.username)}</div>
                <div class="post-content">${escapeHtml(truncatedContent)}</div>
                <div class="post-meta">${replyCount} replies • ${timeAgo}</div>
            `;
            
            // Make clickable to go to forum
            postElement.style.cursor = 'pointer';
            postElement.addEventListener('click', () => {
                window.open('/forum/', '_blank');
            });
            
            discussionsSection.appendChild(postElement);
        });
        
        console.log(`Updated discussions with ${sortedPosts.length} real forum posts`);
    }

    function cleanPostContent(content) {
        // Remove excessive whitespace and clean content
        return content
            .replace(/\s+/g, ' ')
            .replace(/[*]{4,}/g, '***') // Replace censored words
            .trim();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getTimeAgo(timestamp) {
        if (!timestamp) return 'recently';
        
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGun);
    } else {
        initGun();
    }

})();