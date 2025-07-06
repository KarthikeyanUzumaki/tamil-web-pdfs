# Favorites Functionality

This document explains the favorites system that has been added to the Tamil PDF Library website.

## Features

### ❤️ Heart Button on PDFs
- Each PDF card now has a heart button in the top-right corner
- Click the heart to add/remove PDFs from your favorites
- Heart turns red (❤️) when favorited, white (🤍) when not favorited

### 🔐 User Authentication Required
- You must be signed in with Google to use favorites
- Favorites are tied to your Google account
- Your favorites are saved in Firebase Firestore

### 📚 Favorites Section
- New "❤️ Favorites" link in the navigation (only visible when signed in)
- View all your favorited PDFs in one place
- Empty state with helpful message when no favorites exist

## Technical Setup

### Firebase Configuration
The favorites system uses Firebase Firestore to store user favorites. Make sure your Firebase project has:

1. **Authentication enabled** with Google sign-in
2. **Firestore Database enabled** with the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Database Structure
User favorites are stored in Firestore with this structure:

```
users/{userId}
├── email: string
├── displayName: string
├── favorites: string[] (array of PDF IDs)
├── createdAt: timestamp
└── updatedAt: timestamp
```

## How It Works

### 1. User Authentication
- When a user signs in with Google, their favorites are automatically loaded
- The favorites link appears in the navigation
- User's favorites are stored in memory for quick access

### 2. Adding/Removing Favorites
- Click the heart button on any PDF card
- The action is immediately saved to Firestore
- The UI updates instantly to reflect the change
- If not signed in, an alert prompts the user to sign in

### 3. Viewing Favorites
- Click "❤️ Favorites" in the navigation
- All favorited PDFs are displayed in a grid
- If no favorites exist, a helpful message is shown with a link to browse categories

## Files Modified

### HTML Changes (`index.html`)
- Added Firestore import to Firebase SDKs
- Added "❤️ Favorites" navigation link
- Added favorites section with grid

### CSS Changes (`assets/css/style.css`)
- Added heart button styles (`.heart-btn`)
- Added favorites section styles (`#favorites`)
- Added empty favorites state styles (`.empty-favorites`)

### JavaScript Changes (`assets/js/main.js`)
- Added favorites management variables
- Added `loadUserFavorites()` function
- Added `toggleFavorite()` function
- Added `updateHeartButton()` function
- Added `displayFavorites()` function
- Updated `displayPdfs()` to include heart buttons
- Updated navigation handlers
- Made functions globally available

## Testing

### Test Files
- `test_favorites.html` - Test Firebase connection and favorites functions
- `test.html` - Test JSON loading

### Manual Testing Steps
1. Open the website
2. Sign in with Google
3. Browse to a category (e.g., Poems)
4. Click the heart button on a PDF
5. Navigate to "❤️ Favorites" to see your favorited PDF
6. Click the heart again to remove from favorites

## Troubleshooting

### Common Issues

1. **Heart buttons not appearing**
   - Check if Firebase is properly loaded
   - Check browser console for errors
   - Verify Firestore is enabled in Firebase project

2. **Favorites not saving**
   - Check Firestore security rules
   - Verify user is authenticated
   - Check browser console for errors

3. **Favorites not loading**
   - Check if user is signed in
   - Verify Firestore connection
   - Check browser console for errors

### Debug Information
The system includes extensive console logging. Check the browser console for:
- Firebase connection status
- User authentication status
- Favorites loading/saving operations
- Error messages

## Future Enhancements

Potential improvements for the favorites system:

1. **Favorites Categories** - Organize favorites into custom categories
2. **Favorites Export** - Export favorites list as PDF or CSV
3. **Favorites Sharing** - Share favorites with other users
4. **Favorites Sync** - Sync favorites across devices
5. **Favorites Search** - Search within your favorites
6. **Favorites Analytics** - Track most favorited PDFs

## Security Considerations

- Users can only access their own favorites
- Firestore security rules ensure data isolation
- No sensitive data is stored in favorites
- Authentication is required for all favorites operations 