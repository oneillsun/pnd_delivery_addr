# FedEx Ground - Delivery Location Management System

A complete web application for managing delivery location information with searchable addresses and editable content.

## Features

### Landing Page (index.html)
- **Customizable Title**: Edit the page title in real-time
- **Background Image**: Upload and display a centered background image (e.g., FedEx Ground logo)
- **Address Search**: Search for delivery locations by house number or street name
- **Live Search Results**: See matching addresses with content previews as you type
- **Add New Location**: Create new delivery locations with the + button

### Detail Page (detail.html)
- **View Location Details**: Display full address and all associated content
- **Edit Mode**: Toggle editing with the Edit button
- **Add Content**: Add text, images, or videos to locations
- **Content Types**:
  - Text blocks for delivery instructions
  - Images for location photos
  - Videos for delivery demonstrations
- **Delete Content**: Remove unwanted content blocks
- **Save Changes**: Persist changes to browser storage

## How to Use

### Getting Started
1. Open `index.html` in a web browser
2. Customize the page title if desired
3. Upload a background image (optional)

### Searching for Locations
1. Type in the search bar (e.g., "123", "Main Street", "Oak")
2. Matching addresses will appear below with previews
3. Click on any result to view full details

### Adding a New Location
1. Click the + button in the search bar
2. Enter the delivery address when prompted
3. Click "Edit" to add content
4. Use "Add Text", "Add Image", or "Add Video" buttons
5. Fill in your content
6. Click "Save Changes"

### Editing Existing Locations
1. Search for and click on the location
2. Click the "Edit" button in the top right
3. Modify existing content or add new blocks
4. Click "Save Changes" or "Cancel" to discard

### Sample Addresses (Pre-loaded)
- 123 Main Street, Springfield, IL 62701
- 456 Oak Avenue, Boston, MA 02101
- 789 Pine Road, Seattle, WA 98101
- 321 Elm Street, Austin, TX 78701
- 555 Maple Drive, Denver, CO 80202
- 888 Birch Lane, Portland, OR 97201
- 1001 Cedar Court, Miami, FL 33101
- 2020 Willow Way, Phoenix, AZ 85001

## Technical Details

### Files Structure
- `index.html` - Landing page with search
- `detail.html` - Location detail and edit page
- `styles.css` - All styling
- `script.js` - Landing page functionality
- `detail.js` - Detail page functionality
- `database.js` - Data storage and search logic

### Data Storage
- Uses browser's localStorage for persistence
- Data survives page refreshes
- Each location stored with unique ID
- Images and videos stored as base64 (Note: large files may exceed storage limits)

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- LocalStorage support required

## Customization Tips

### Changing Colors
Edit `styles.css` and modify the gradient colors:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding More Sample Data
Edit `database.js` and add entries to the `locations` object.

### File Size Limits
- Images/videos are stored as base64 in localStorage
- Keep files under 2MB for best performance
- localStorage has a ~5-10MB limit per domain

## Future Enhancements
- Backend database integration
- User authentication
- Multi-user support
- Export/import functionality
- Advanced search filters
- Map integration
- Print-friendly views

## Support
For issues or questions, please refer to the code comments or contact your system administrator.
