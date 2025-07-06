// Google Sign-In
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

// Wait for Firebase to be available
const waitForFirebase = setInterval(() => {
  if (window.firebaseAuth && window.onAuthStateChanged && window.firebaseDb) {
    clearInterval(waitForFirebase);
    initializeAuth();
  }
}, 100);

function initializeAuth() {
  // Listen for auth state changes
  window.onAuthStateChanged(window.firebaseAuth, (user) => {
    if (user) {
      // User is signed in
      currentUser = user;
      userName.textContent = `Hello, ${user.displayName}`;
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      
      // Show favorites link
      const favoritesLink = document.getElementById('favoritesLink');
      if (favoritesLink) {
        favoritesLink.style.display = 'inline-block';
      }
      
      // Load user favorites
      loadUserFavorites();
    } else {
      // User is signed out
      currentUser = null;
      userFavorites.clear();
      userName.textContent = '';
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
      
      // Hide favorites link
      const favoritesLink = document.getElementById('favoritesLink');
      if (favoritesLink) {
        favoritesLink.style.display = 'none';
      }
      
      // Hide favorites section if visible
      const favoritesSection = document.getElementById('favorites');
      if (favoritesSection) {
        favoritesSection.style.display = 'none';
      }
    }
  });
}

loginBtn.addEventListener('click', () => {
  // Wait for Firebase to be available
  if (!window.firebaseAuth) {
    alert('Firebase is still loading. Please try again in a moment.');
    return;
  }
  
  const provider = new window.GoogleAuthProvider();
  window.signInWithPopup(window.firebaseAuth, provider)
    .then(result => {
      const user = result.user;
      console.log('User signed in:', user.displayName);
    })
    .catch(error => {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        alert('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        alert('Popup blocked. Please allow popups for this site and try again.');
      } else {
        alert("Login failed: " + error.message);
      }
    });
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
  window.signOut(window.firebaseAuth).then(() => {
    console.log('User signed out successfully');
  }).catch((error) => {
    console.error('Error signing out:', error);
    alert('Error signing out: ' + error.message);
  });
});

// PDF Data Management
let pdfDatabase = null;
let currentCategory = '';
let currentPage = 1;
const itemsPerPage = 12;

// Favorites Management
let userFavorites = new Set();
let currentUser = null;

// Load PDF data from JSON file
async function loadPdfData() {
  try {
    console.log('Attempting to load PDF data from assets/data/pdfs.json...');
    const response = await fetch('assets/data/pdfs.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    pdfDatabase = await response.json();
    console.log('PDF data loaded successfully:', pdfDatabase);
    
    // Update category counts based on actual PDFs
    if (pdfDatabase.pdfs && pdfDatabase.categories) {
      Object.keys(pdfDatabase.categories).forEach(categoryName => {
        const categoryPdfs = pdfDatabase.pdfs.filter(pdf => pdf.category === categoryName);
        pdfDatabase.categories[categoryName].count = categoryPdfs.length;
        pdfDatabase.categories[categoryName].pdfs = categoryPdfs;
      });
    }
    
    updateCategoryCards();
    return pdfDatabase;
  } catch (error) {
    console.error('Error loading PDF data:', error);
    console.log('Falling back to sample data...');
    // Fallback to sample data
    pdfDatabase = {
      categories: {
        "Poems": { name: "Poems", icon: "📝", count: 1, pdfs: [] },
        "Literature": { name: "Literature", icon: "📚", count: 0, pdfs: [] },
        "Thirukkural": { name: "Thirukkural", icon: "🏛️", count: 0, pdfs: [] },
        "History": { name: "History", icon: "🏺", count: 0, pdfs: [] },
        "Tamil Grammar": { name: "Tamil Grammar", icon: "📖", count: 0, pdfs: [] },
        "English Translations": { name: "English Translations", icon: "🌐", count: 0, pdfs: [] }
      },
      pdfs: [
        { 
          id: "bba_001", 
          title: "BBA", 
          category: "Poems", 
          author: "Karthik", 
          viewUrl: "assets/pdfs/poems/BBA.pdf", 
          downloadUrl: "assets/pdfs/poems/BBA.pdf",
          fileSize: "539 KB",
          pages: 0
        }
      ]
    };
    
    // Update category counts
    Object.keys(pdfDatabase.categories).forEach(categoryName => {
      const categoryPdfs = pdfDatabase.pdfs.filter(pdf => pdf.category === categoryName);
      pdfDatabase.categories[categoryName].count = categoryPdfs.length;
      pdfDatabase.categories[categoryName].pdfs = categoryPdfs;
    });
    
    updateCategoryCards();
    return pdfDatabase;
  }
}

// Favorites Management Functions
async function loadUserFavorites() {
  if (!currentUser || !window.firebaseDb) {
    console.log('No user or Firebase not available');
    console.log('Current user:', currentUser);
    console.log('Firebase DB:', window.firebaseDb);
    return;
  }
  
  try {
    console.log('Loading favorites for user:', currentUser.uid);
    console.log('User email:', currentUser.email);
    
    const userDocRef = window.firestore.doc(window.firebaseDb, 'users', currentUser.uid);
    console.log('User document reference:', userDocRef);
    
    const userDoc = await window.firestore.getDoc(userDocRef);
    console.log('User document exists:', userDoc.exists());
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User data from Firestore:', userData);
      
      userFavorites = new Set(userData.favorites || []);
      console.log('Loaded favorites from Firestore:', Array.from(userFavorites));
      
      // Update all visible heart buttons
      document.querySelectorAll('.heart-btn').forEach(btn => {
        const pdfId = btn.getAttribute('data-pdf-id');
        if (pdfId) {
          updateHeartButton(pdfId);
        }
      });
    } else {
      console.log('User document does not exist, creating new one...');
      // Create user document if it doesn't exist
      const newUserData = {
        email: currentUser.email,
        displayName: currentUser.displayName,
        favorites: [],
        createdAt: new Date()
      };
      
      console.log('Creating user document with data:', newUserData);
      await window.firestore.setDoc(userDocRef, newUserData);
      
      userFavorites = new Set();
      console.log('Created new user document with empty favorites');
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    userFavorites = new Set();
  }
}

async function toggleFavorite(pdfId) {
  console.log('=== toggleFavorite called ===');
  console.log('PDF ID:', pdfId);
  console.log('Current user:', currentUser);
  console.log('Firebase DB available:', !!window.firebaseDb);
  console.log('Current favorites before toggle:', Array.from(userFavorites));
  
  if (!currentUser || !window.firebaseDb) {
    alert('Please sign in to add favorites');
    return;
  }
  
  try {
    const userDocRef = window.firestore.doc(window.firebaseDb, 'users', currentUser.uid);
    console.log('User document reference:', userDocRef);
    
    if (userFavorites.has(pdfId)) {
      // Remove from favorites
      userFavorites.delete(pdfId);
      console.log('Removed from favorites:', pdfId);
    } else {
      // Add to favorites
      userFavorites.add(pdfId);
      console.log('Added to favorites:', pdfId);
    }
    
    console.log('Favorites after toggle:', Array.from(userFavorites));
    
    // Prepare data for Firestore
    const userData = {
      email: currentUser.email,
      displayName: currentUser.displayName,
      favorites: Array.from(userFavorites),
      updatedAt: new Date()
    };
    
    console.log('Saving to Firestore with data:', userData);
    
    // Update Firestore
    await window.firestore.setDoc(userDocRef, userData, { merge: true });
    
    console.log('✅ Successfully saved to Firestore');
    console.log('Favorites saved to Firestore:', Array.from(userFavorites));
    
    // Update UI immediately
    updateHeartButton(pdfId);
    
    // If we're on the favorites page, refresh it
    const favoritesSection = document.getElementById('favorites');
    if (favoritesSection && favoritesSection.style.display !== 'none') {
      displayFavorites();
    }
    
  } catch (error) {
    console.error('❌ Error updating favorites:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    alert('Error updating favorites. Please try again.');
  }
}

function getHeartSVG(filled = false) {
  return `<svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.2-5.2-8.5-8.1C1.7 10.1 2.6 7.1 5.1 5.7c2.1-1.1 4.3-0.2 5.6 1.3C11.1 6.1 13.3 5.2 15.4 5.7c2.5 1.4 3.4 4.4 1.6 7.2C18.2 15.8 12 21 12 21z" ${filled ? 'fill="#e53935"' : 'fill="none"'} /></svg>`;
}

function renderPDFCard(pdf) {
  const isFavorited = userFavorites.has(pdf.id);
  const heartBtn = `<button class="heart-btn${isFavorited ? ' favorited' : ''}" data-pdf-id="${pdf.id}" title="Add to Favorites">${getHeartSVG(isFavorited)}</button>`;
  // ... use heartBtn in the card ...
}

function updateHeartButton(pdfId) {
  const btn = document.querySelector(`.heart-btn[data-pdf-id="${pdfId}"]`);
  if (btn) {
    const isFavorited = userFavorites.has(pdfId);
    btn.classList.toggle('favorited', isFavorited);
    btn.innerHTML = getHeartSVG(isFavorited);
  }
}

function displayFavorites() {
  const favoritesSection = document.getElementById('favorites');
  const favoritesGrid = document.getElementById('favorites-grid');
  
  if (!favoritesSection || !favoritesGrid) return;
  
  // Hide other sections
  document.getElementById('pdf-list').style.display = 'none';
  document.getElementById('category').style.display = 'none';
  document.getElementById('home').style.display = 'none';
  document.getElementById('contact').style.display = 'none';
  
  // Show favorites section
  favoritesSection.style.display = 'block';
  
  // Get favorite PDFs
  const favoritePdfs = pdfDatabase.pdfs.filter(pdf => userFavorites.has(pdf.id));
  
  if (favoritePdfs.length === 0) {
    favoritesGrid.innerHTML = `
      <div class="empty-favorites" style="grid-column: 1 / -1;">
        <h3>No Favorites Yet</h3>
        <p>Start exploring PDFs and add them to your favorites by clicking the heart button!</p>
        <a href="#category" class="btn" onclick="showCategorySection()">Browse Categories</a>
      </div>
    `;
  } else {
    favoritesGrid.innerHTML = '';
    
    favoritePdfs.forEach((pdf, index) => {
      const div = document.createElement('div');
      div.className = 'pdf-card';
      div.style.animationDelay = `${index * 0.1}s`;
      
      // Check if this PDF is in user's favorites
      const isFavorited = userFavorites.has(pdf.id);
      const heartBtnHtml = `<button class="heart-btn${isFavorited ? ' favorited' : ''}" data-pdf-id="${pdf.id}" title="Add to Favorites">${getHeartSVG(isFavorited)}</button>`;
      
      div.innerHTML = `
        ${heartBtnHtml}
        <div class="pdf-thumbnail" style="
          width: 100%;
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        ">
          📄
        </div>
        <h3>${pdf.title}</h3>
        <p style="margin: 10px 0; opacity: 0.8; font-size: 14px;">
          By ${pdf.author || 'Unknown Author'}
        </p>
        <p style="margin: 10px 0; opacity: 0.7; font-size: 13px;">
          ${pdf.pages || 'N/A'} pages • ${pdf.fileSize || 'Unknown size'}
        </p>
        <div style="margin-top: 20px;">
          <a href="${pdf.viewUrl}" target="_blank" onclick="trackPdfView('${pdf.id}')">View</a>
          <a href="${pdf.downloadUrl}" target="_blank" onclick="trackPdfDownload('${pdf.id}')">Download</a>
        </div>
      `;
      
      // Add event listener to heart button
      const heartBtn = div.querySelector('.heart-btn');
      if (heartBtn) {
        heartBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Heart button clicked for PDF in favorites:', pdf.id);
          toggleFavorite(pdf.id);
        });
      }
      
      favoritesGrid.appendChild(div);
    });
  }
}

function showCategorySection() {
  // Show category section and hide others
  document.getElementById('category').style.display = 'block';
  document.getElementById('pdf-list').style.display = 'none';
  document.getElementById('favorites').style.display = 'none';
  document.getElementById('home').style.display = 'block';
  document.getElementById('contact').style.display = 'block';
}

// Update category cards with real data
function updateCategoryCards() {
  console.log('updateCategoryCards called');
  if (!pdfDatabase) {
    console.log('No pdfDatabase available for updateCategoryCards');
    return;
  }
  
  const categoryGrid = document.getElementById('categoryGrid');
  if (!categoryGrid) {
    console.log('Category grid not found');
    return;
  }
  
  console.log('Updating category counts...');
  // Update category counts
  Object.keys(pdfDatabase.categories).forEach(categoryKey => {
    const categoryPdfs = pdfDatabase.pdfs.filter(pdf => pdf.category === categoryKey);
    pdfDatabase.categories[categoryKey].count = categoryPdfs.length;
    console.log(`Category ${categoryKey}: ${categoryPdfs.length} PDFs`);
  });
  
  // Clear and recreate category cards
  categoryGrid.innerHTML = '';
  
  Object.keys(pdfDatabase.categories).forEach(categoryKey => {
    const category = pdfDatabase.categories[categoryKey];
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-icon">${category.icon}</div>
      <h3>${category.name}</h3>
      <p>${category.count} PDFs</p>
    `;
    
    // Add click event to display PDFs for this category
    card.addEventListener('click', () => {
      console.log('Category clicked:', categoryKey);
      displayPdfs(categoryKey);
    });
    
    categoryGrid.appendChild(card);
  });
}

// Get PDFs by category with pagination
function getPdfsByCategory(category, page = 1, limit = itemsPerPage) {
  console.log('getPdfsByCategory called with category:', category, 'page:', page);
  console.log('pdfDatabase:', pdfDatabase);
  
  if (!pdfDatabase) {
    console.log('No pdfDatabase available');
    return { pdfs: [], totalPages: 0, currentPage: 1 };
  }
  
  const categoryPdfs = pdfDatabase.pdfs.filter(pdf => pdf.category === category);
  console.log('Filtered PDFs for category', category, ':', categoryPdfs);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPdfs = categoryPdfs.slice(startIndex, endIndex);
  
  const result = {
    pdfs: paginatedPdfs,
    totalPages: Math.ceil(categoryPdfs.length / limit),
    currentPage: page,
    totalItems: categoryPdfs.length
  };
  
  console.log('getPdfsByCategory result:', result);
  return result;
}

// Search PDFs
function searchPdfs(query, category = '') {
  if (!pdfDatabase) return [];
  
  const searchTerm = query.toLowerCase();
  let pdfs = pdfDatabase.pdfs;
  
  if (category) {
    pdfs = pdfs.filter(pdf => pdf.category === category);
  }
  
  return pdfs.filter(pdf => 
    pdf.title.toLowerCase().includes(searchTerm) ||
    pdf.author.toLowerCase().includes(searchTerm) ||
    pdf.description.toLowerCase().includes(searchTerm) ||
    (pdf.tags && pdf.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
  );
}

// Enhanced PDF Display with Search and Pagination
function displayPdfs(category, page = 1, searchQuery = '') {
  console.log('displayPdfs called with category:', category, 'page:', page, 'searchQuery:', searchQuery);
  console.log('Current pdfDatabase:', pdfDatabase);
  
  const pdfListSection = document.getElementById('pdf-list');
  const pdfTitle = document.getElementById('pdf-title');
  const pdfGrid = document.getElementById('pdf-grid');
  
  if (!pdfListSection) {
    console.error('pdf-list section not found');
    return;
  }
  
  currentCategory = category;
  currentPage = page;
  
  // Show loading state
  pdfGrid.innerHTML = '<div class="loading-spinner">Loading PDFs...</div>';
  pdfListSection.style.display = 'block';
  
  // Get PDFs for category
  let pdfsToShow;
  if (searchQuery) {
    pdfsToShow = {
      pdfs: searchPdfs(searchQuery, category),
      totalPages: 1,
      currentPage: 1,
      totalItems: searchPdfs(searchQuery, category).length
    };
  } else {
    pdfsToShow = getPdfsByCategory(category, page);
  }
  
  console.log('PDFs to show:', pdfsToShow);
  
  // Update title
  pdfTitle.innerHTML = `
    <span>${category} PDFs</span>
    <div style="font-size: 1rem; font-weight: 400; margin-top: 10px; opacity: 0.8;">
      ${pdfsToShow.totalItems} ${pdfsToShow.totalItems === 1 ? 'PDF' : 'PDFs'} found
    </div>
  `;
  
  // Clear and populate grid
  pdfGrid.innerHTML = '';
  
  if (pdfsToShow.pdfs.length === 0) {
    pdfGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <h3 style="color: #ffffff; margin-bottom: 20px;">No PDFs Found</h3>
        <p style="color: #cccccc;">Try a different search term or browse other categories.</p>
      </div>
    `;
  } else {
    // Add search bar
    pdfGrid.innerHTML = `
      <div class="pdf-controls" style="grid-column: 1 / -1; margin-bottom: 30px;">
        <div class="search-container">
          <input type="text" id="pdfSearch" placeholder="Search PDFs in ${category}..." 
                 value="${searchQuery}" style="
                 width: 100%;
                 max-width: 500px;
                 padding: 15px 20px;
                 background: rgba(255, 255, 255, 0.1);
                 border: 1px solid rgba(255, 255, 255, 0.2);
                 border-radius: 8px;
                 color: white;
                 font-size: 16px;
                 margin: 0 auto;
                 display: block;
          ">
        </div>
      </div>
    `;
    
    // Add PDF cards
    pdfsToShow.pdfs.forEach((pdf, index) => {
      const div = document.createElement('div');
      div.className = 'pdf-card';
      div.style.animationDelay = `${index * 0.1}s`;
      
      // Check if this PDF is in user's favorites
      const isFavorited = userFavorites.has(pdf.id);
      const heartBtnHtml = `<button class="heart-btn${isFavorited ? ' favorited' : ''}" data-pdf-id="${pdf.id}" title="Add to Favorites">${getHeartSVG(isFavorited)}</button>`;
      
      console.log('Creating heart button for PDF:', pdf.id, 'Favorited:', isFavorited);
      
      div.innerHTML = `
        ${heartBtnHtml}
        <div class="pdf-thumbnail" style="
          width: 100%;
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        ">
          📄
        </div>
        <h3>${pdf.title}</h3>
        <p style="margin: 10px 0; opacity: 0.8; font-size: 14px;">
          By ${pdf.author || 'Unknown Author'}
        </p>
        <p style="margin: 10px 0; opacity: 0.7; font-size: 13px;">
          ${pdf.pages || 'N/A'} pages • ${pdf.fileSize || 'Unknown size'}
        </p>
        <div style="margin-top: 20px;">
          <a href="${pdf.viewUrl}" target="_blank" onclick="trackPdfView('${pdf.id}')">View</a>
          <a href="${pdf.downloadUrl}" target="_blank" onclick="trackPdfDownload('${pdf.id}')">Download</a>
        </div>
      `;
      
      // Add event listener to heart button
      const heartBtn = div.querySelector('.heart-btn');
      if (heartBtn) {
        heartBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Heart button clicked for PDF:', pdf.id);
          toggleFavorite(pdf.id);
        });
      }
      
      pdfGrid.appendChild(div);
    });
    
    // Add pagination if needed
    if (pdfsToShow.totalPages > 1) {
      const paginationDiv = document.createElement('div');
      paginationDiv.className = 'pagination';
      paginationDiv.style.cssText = `
        grid-column: 1 / -1;
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 40px;
      `;
      
      for (let i = 1; i <= pdfsToShow.totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === page ? 'page-btn active' : 'page-btn';
        pageBtn.style.cssText = `
          padding: 10px 15px;
          background: ${i === page ? '#ffffff' : 'rgba(255, 255, 255, 0.1)'};
          color: ${i === page ? '#000000' : '#ffffff'};
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        `;
        pageBtn.addEventListener('click', () => displayPdfs(category, i, searchQuery));
        paginationDiv.appendChild(pageBtn);
      }
      
      pdfGrid.appendChild(paginationDiv);
    }
  }
  
  // Add search functionality
  const searchInput = document.getElementById('pdfSearch');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        displayPdfs(category, 1, e.target.value);
      }, 300);
    });
  }
  
  pdfListSection.scrollIntoView({ behavior: 'smooth' });
}

// Track PDF interactions
function trackPdfView(pdfId) {
  console.log(`PDF viewed: ${pdfId}`);
  // You can implement analytics tracking here
}

function trackPdfDownload(pdfId) {
  console.log(`PDF downloaded: ${pdfId}`);
  // You can implement analytics tracking here
}

// Category Click Logic with Enhanced Animations
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', async () => {
    // Ensure data is loaded
    if (!pdfDatabase) {
      await loadPdfData();
    }
    
    const categoryText = card.textContent.trim();
    console.log('Category card clicked, text:', categoryText);
    
    // Extract category name (remove the PDF count and icons)
    let category = categoryText.split('\n')[0].replace(/📝|📚|🏛️|🏺|📖|🌐/g, '').trim();
    
    // If the category card hasn't been updated by updateCategoryCards yet, use the original text
    if (!category) {
      category = categoryText.trim();
    }
    
    console.log('Extracted category:', category);
    
    // Add loading animation
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);

    // Hide other sections and show PDF list
    document.getElementById('category').style.display = 'none';
    document.getElementById('favorites').style.display = 'none';
    document.getElementById('home').style.display = 'none';
    document.getElementById('contact').style.display = 'none';

    displayPdfs(category, 1);
  });
});

// Add smooth scrolling for navigation links
document.querySelectorAll('.navbar a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    
    if (href === '#favorites') {
      // Handle favorites link
      if (!currentUser) {
        alert('Please sign in to view your favorites');
        return;
      }
      displayFavorites();
    } else if (href === '#home') {
      // Handle home link - show all sections and scroll to top
      document.querySelectorAll('section').forEach(section => {
        section.style.display = 'block';
      });
      document.getElementById('pdf-list').style.display = 'none';
      document.getElementById('favorites').style.display = 'none';
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Handle other navigation links
      const target = document.querySelector(href);
      if (target) {
        // Hide all sections first
        document.querySelectorAll('section').forEach(section => {
          section.style.display = 'none';
        });
        
        // Show the target section
        target.style.display = 'block';
        
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// Add parallax effect to hero section and scroll progress
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  const navbar = document.querySelector('.navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  
  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.3}px)`;
  }
  
  // Add scrolled class to navbar
  if (navbar) {
    if (scrolled > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  
  // Update scroll progress indicator
  if (scrollProgress) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrolled / docHeight) * 100;
    scrollProgress.style.transform = `scaleX(${progress / 100})`;
  }
});

// Add intersection observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections for animations
document.querySelectorAll('.category-section, .pdf-list-section, .contact-section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  observer.observe(section);
});

// Add hover effect for category cards
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.05)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// Add click ripple effect
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add ripple effect to buttons
document.querySelectorAll('#loginBtn, #logoutBtn, .btn').forEach(button => {
  button.addEventListener('click', createRipple);
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Handle feedback form submission
document.getElementById('feedbackForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  
  // Simulate form submission
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    // Reset form
    this.reset();
    
    // Show success message
    submitBtn.textContent = 'Message Sent!';
    submitBtn.style.background = '#4CAF50';
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '#ffffff';
      submitBtn.disabled = false;
    }, 2000);
    
    // Show alert
    alert('Thank you for your feedback! We will get back to you soon.');
  }, 1500);
});

// Add form field animations
document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
  field.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
  });
  
  field.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
  });
});

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing application...');
  
  // Make functions globally available immediately
window.toggleFavorite = toggleFavorite;
window.displayFavorites = displayFavorites;
window.showCategorySection = showCategorySection;

// Test function to check if heart buttons are working
window.testHeartButton = function() {
  console.log('Testing heart button functionality...');
  console.log('toggleFavorite function available:', typeof window.toggleFavorite);
  
  // Create a test heart button
  const testDiv = document.createElement('div');
  testDiv.innerHTML = `
    <button class="heart-btn" onclick="toggleFavorite('test-pdf')" style="position: relative; top: 0; right: 0;">
      🤍
    </button>
  `;
  document.body.appendChild(testDiv);
  
  console.log('Test heart button created. Try clicking it!');
};
  
  console.log('Global functions made available:', {
    toggleFavorite: typeof window.toggleFavorite,
    displayFavorites: typeof window.displayFavorites,
    showCategorySection: typeof window.showCategorySection
  });
  
  // Load PDF data on page load
  await loadPdfData();
  console.log('PDF Database loaded:', pdfDatabase?.metadata);
  
  // Make sure category cards are updated
  if (pdfDatabase) {
    updateCategoryCards();
  }
});

// Smooth scroll and fix hero section alignment
const homeLink = document.querySelector('a[href="#home"]');
if (homeLink) {
  homeLink.addEventListener('click', function(e) {
    e.preventDefault();
    const hero = document.getElementById('home');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}
