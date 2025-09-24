# Balance Ball - Mobile Tilt Game 🎯

A fun and challenging mobile web game where players tilt their device to navigate a ball through obstacles and into a hole. Built with HTML5, CSS3, and vanilla JavaScript for maximum compatibility across all mobile devices.

## 🎮 Game Features

- **Device Orientation Controls**: Tilt your phone/tablet to move the ball
- **Progressive Difficulty**: 10+ levels with increasing complexity
- **Time Challenge**: Complete each level within 30 seconds
- **Calibration System**: Calibrate your device for optimal gameplay
- **Cross-Platform**: Works on Android, iOS, iPads, Samsung tablets, and more
- **Offline Support**: Play anywhere with Progressive Web App technology
- **Responsive Design**: Adapts to any screen size and orientation

## 🚀 Quick Start

1. **Open the game**: Simply open `index.html` in any modern web browser
2. **Calibrate**: Click "Calibrate Device" for the best experience
3. **Start Playing**: Tilt your device to move the blue ball to the dark hole
4. **Complete Levels**: Finish within the time limit to unlock new levels

## 📱 Installation

### For Development Team (Local Setup)
```bash
# Clone or download the repository
# No build process required - it's vanilla HTML/CSS/JS!

# Option 1: Open directly
# Simply open index.html in your browser

# Option 2: Use a local server (recommended for testing)
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# Then open: http://localhost:8000
```

### For End Users (Mobile Installation)
1. Open the game URL in your mobile browser
2. **Android Chrome**: Menu → "Add to Home Screen"
3. **iOS Safari**: Share button → "Add to Home Screen"
4. **Other browsers**: Look for "Install App" option

## 🎯 How to Play

### Controls
- **Tilt Left/Right**: Move ball horizontally
- **Tilt Forward/Back**: Move ball vertically
- **Calibrate**: Hold device flat and press calibrate for best experience

### Objective
- Navigate the blue ball to the dark hole
- Complete each level within 30 seconds
- Avoid obstacles and walls
- Progress through increasingly difficult levels

### Game Elements
- 🔵 **Blue Ball**: The player character
- ⚫ **Dark Hole**: The target destination
- 🟫 **Obstacles**: Rectangular and circular barriers
- ⏱️ **Timer**: 30-second countdown per level

## 🏗️ Project Structure

```
balance-ball/
├── index.html              # Main game HTML
├── manifest.json          # PWA configuration
├── sw.js                  # Service Worker for offline support
├── icon-generator.html    # Tool to generate app icons
├── css/
│   └── styles.css         # All game styling
├── js/
│   ├── app.js            # Main application controller
│   ├── game.js           # Core game engine
│   ├── physics.js        # Physics and collision system
│   ├── levels.js         # Level configurations
│   └── utils.js          # Utility functions
└── icons/                # App icons (generated)
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Canvas for game rendering
- **CSS3**: Responsive styling and animations
- **JavaScript (ES6+)**: Game logic and physics
- **Device Orientation API**: Motion controls
- **Web Audio API**: Sound effects
- **Service Worker**: Offline functionality
- **PWA**: Installable web app

### Key Components

#### Game Engine (`game.js`)
- Main game loop with requestAnimationFrame
- State management (menu, playing, paused, etc.)
- Level progression and timing
- Canvas rendering and graphics

#### Physics System (`physics.js`)
- Ball movement and velocity
- Collision detection (circles, rectangles, walls)
- Gravity simulation based on device tilt
- Realistic bounce and friction effects

#### Level System (`levels.js`)
- 10 predefined levels with increasing difficulty
- Procedural level generation for endless gameplay
- Scalable level design for different screen sizes

#### Device Integration (`utils.js`)
- Device orientation handling
- Touch event management
- Local storage for save data
- Cross-platform compatibility

### Browser Support
- **Mobile**: iOS 12+, Android 8+, modern mobile browsers
- **Desktop**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Tablets**: iPad OS 13+, Android tablets

## 🎨 Customization

### Adding New Levels
Edit `js/levels.js` and add new level objects:

```javascript
{
    level: 11,
    timeLimit: 35,
    ballStart: { x: 50, y: 50 },
    hole: { x: 350, y: 350, radius: 25 },
    obstacles: [
        { type: 'rectangle', x: 150, y: 150, width: 20, height: 200 },
        { type: 'circle', x: 250, y: 250, radius: 30 }
    ]
}
```

### Modifying Game Physics
Adjust values in `js/physics.js`:

```javascript
constructor() {
    this.gravity = 0.5;        // Tilt sensitivity
    this.friction = 0.98;      // Ball slowdown
    this.bounce = 0.7;         // Wall bounce factor
    this.maxVelocity = 15;     // Maximum ball speed
}
```

### Styling Changes
Modify `css/styles.css` for visual customization:
- Colors and gradients
- Button styles
- Game canvas appearance
- Responsive breakpoints

## 🔧 Development

### Setting Up Icons
1. Open `icon-generator.html` in a browser
2. Click "Generate All Icons"
3. Download all generated icons
4. Place them in the `icons/` directory

### Testing Device Orientation
- **Chrome DevTools**: Enable device simulation and orientation
- **Real Device**: Always test on actual mobile devices
- **iOS Simulator**: Use Xcode's iOS Simulator
- **Android Emulator**: Use Android Studio's emulator

### Debugging
- Enable console logging by setting `window.DEBUG = true`
- Use browser developer tools for real-time debugging
- Test network throttling for offline functionality

## 📋 Deployment

### Static Hosting (Recommended)
Works with any static file hosting service:
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect to your repository
- **GitHub Pages**: Enable in repository settings
- **Firebase Hosting**: Deploy with Firebase CLI

### Server Requirements
- No server-side code required
- HTTPS recommended for full PWA features
- Gzip compression recommended for better performance

### PWA Deployment Checklist
- ✅ Manifest.json configured
- ✅ Service Worker registered
- ✅ Icons generated (all sizes)
- ✅ HTTPS enabled
- ✅ Responsive design tested
- ✅ Offline functionality working

## 🐛 Troubleshooting

### Common Issues

**Device Orientation Not Working**
- Ensure HTTPS is enabled (required on iOS)
- Check browser permissions for motion sensors
- Try the calibration feature

**Game Performance Issues**
- Close other browser tabs
- Ensure device has sufficient memory
- Try restarting the browser

**PWA Installation Issues**
- Clear browser cache and cookies
- Ensure all PWA requirements are met
- Check manifest.json is accessible

**Audio Not Playing**
- Some browsers require user interaction before audio
- Check device volume settings
- Audio may be disabled in silent mode

## 🤝 Contributing

This game is designed for your dev team! Feel free to:
- Add new levels and obstacles
- Implement new game mechanics
- Improve the physics system
- Add visual effects and animations
- Optimize performance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Game Design Notes

### Level Design Philosophy
- **Level 1-3**: Introduction to basic mechanics
- **Level 4-6**: Introduce obstacles and complexity
- **Level 7-10**: Challenge player skill and timing
- **Level 11+**: Procedurally generated for endless play

### Accessibility Features
- High contrast mode support
- Reduced motion options
- Touch-friendly UI elements
- Clear visual feedback

### Performance Optimizations
- Efficient canvas rendering
- RequestAnimationFrame for smooth gameplay
- Minimal DOM manipulation during gameplay
- Optimized collision detection algorithms

## 🚀 Future Enhancements

Potential features for future versions:
- Multiplayer mode
- Level editor
- Achievement system
- Particle effects
- Background music
- Power-ups and special abilities
- Leaderboards and statistics

---

**Happy Gaming! 🎮**

Built with ❤️ for the OnSpec Dev Team

