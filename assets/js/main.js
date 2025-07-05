// Google Sign-In
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

// Wait for Firebase to be available
const waitForFirebase = setInterval(() => {
  if (window.firebaseAuth && window.onAuthStateChanged) {
    clearInterval(waitForFirebase);
    initializeAuth();
  }
}, 100);

function initializeAuth() {
  // Listen for auth state changes
  window.onAuthStateChanged(window.firebaseAuth, (user) => {
    if (user) {
      // User is signed in
      userName.textContent = `Hello, ${user.displayName}`;
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
    } else {
      // User is signed out
      userName.textContent = '';
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
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

// Load PDF data from JSON file
async function loadPdfData() {
  try {
    const response = await fetch('assets/data/pdfs.json');
    pdfDatabase = await response.json();
    updateCategoryCards();
    return pdfDatabase;
  } catch (error) {
    console.error('Error loading PDF data:', error);
    // Fallback to sample data
    pdfDatabase = {
      categories: {
        "Poems": { name: "Poems", icon: "📝", count: 2, pdfs: [] },
        "Literature": { name: "Literature", icon: "📚", count: 2, pdfs: [] },
        "Thirukkural": { name: "Thirukkural", icon: "🏛️", count: 1, pdfs: [] }
      },
      pdfs: [
        { id: "1", title: "Sample Poem", category: "Poems", author: "Author", viewUrl: "#", downloadUrl: "#" },
        { id: "2", title: "Sample Literature", category: "Literature", author: "Author", viewUrl: "#", downloadUrl: "#" }
      ]
    };
    return pdfDatabase;
  }
}

// Update category cards with real data
function updateCategoryCards() {
  if (!pdfDatabase) return;
  
  // Update category counts
  Object.keys(pdfDatabase.categories).forEach(categoryKey => {
    const categoryPdfs = pdfDatabase.pdfs.filter(pdf => pdf.category === categoryKey);
    pdfDatabase.categories[categoryKey].count = categoryPdfs.length;
  });
  
  // Update category cards display
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach((card, index) => {
    const categories = Object.keys(pdfDatabase.categories);
    if (categories[index]) {
      const category = pdfDatabase.categories[categories[index]];
      card.innerHTML = `
        ${category.icon} ${category.name}
        <div style="font-size: 14px; margin-top: 8px; opacity: 0.8;">${category.count} PDFs</div>
      `;
    }
  });
}

// Get PDFs by category with pagination
function getPdfsByCategory(category, page = 1, limit = itemsPerPage) {
  if (!pdfDatabase) return { pdfs: [], totalPages: 0, currentPage: 1 };
  
  const categoryPdfs = pdfDatabase.pdfs.filter(pdf => pdf.category === category);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPdfs = categoryPdfs.slice(startIndex, endIndex);
  
  return {
    pdfs: paginatedPdfs,
    totalPages: Math.ceil(categoryPdfs.length / limit),
    currentPage: page,
    totalItems: categoryPdfs.length
  };
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
  const pdfListSection = document.getElementById('pdf-list');
  const pdfTitle = document.getElementById('pdf-title');
  const pdfGrid = document.getElementById('pdf-grid');
  
  if (!pdfListSection) return;
  
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
      div.innerHTML = `
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
    // Extract category name (remove the PDF count)
    const category = categoryText.split('\n')[0].replace(/📝|📚|🏛️|🏺|📖|🌐/g, '').trim();
    
    // Add loading animation
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);

    displayPdfs(category, 1);
  });
});

// Add smooth scrolling for navigation links
document.querySelectorAll('.navbar a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
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
  // Load PDF data on page load
  await loadPdfData();
  console.log('PDF Database loaded:', pdfDatabase?.metadata);
});
