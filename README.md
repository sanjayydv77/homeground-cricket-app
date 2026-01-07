# 🏏 HOMEGROUND

**Professional Cricket Scoring App for Local Matches**

HOMEGROUND is a modern, mobile-first Progressive Web App (PWA) designed for cricket enthusiasts to score local matches, tournaments, and series with professional-level statistics tracking.

![HOMEGROUND Banner](https://img.shields.io/badge/Next.js-15.1.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)

---

## ✨ Features

### 🎯 Match Management
- **Single Match**: Quick setup for one-off games
- **Series Mode**: Best-of-X series with cumulative statistics
- **Tournament Mode**: Full tournament management with league tables and NRR calculations

### 📊 Live Scoring
- Ball-by-ball tracking with real-time updates
- Comprehensive dismissal types (Caught, Bowled, LBW, Run Out, Stumped, etc.)
- Extras management (Wides, No Balls, Byes, Leg Byes)
- Free Hit delivery tracking
- Undo functionality for correcting mistakes
- Auto-rotation logic for batsmen and bowlers

### 📈 Statistics & Analytics
- Detailed batting scorecard (Runs, Balls, 4s, 6s, Strike Rate)
- Comprehensive bowling figures (Overs, Maidens, Runs, Wickets, Economy)
- Automatic Man of the Match calculation
- Match summary with full scorecards
- Standard cricket dismissal notation

### 🏆 Tournament Features
- League table with points, NRR, and standings
- Multi-team management
- Match scheduling and tracking
- Knockout stage support

### 💾 Data Persistence
- Local storage for offline functionality
- Match history with automatic cleanup (30-day retention)
- PWA support for mobile installation

---

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Tailwind Merge** - Conditional class merging

### PWA & Performance
- **next-pwa** - Progressive Web App support
- **Service Workers** - Offline functionality
- **localStorage** - Client-side data persistence

### Additional
- **Context API** - State management

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sanjayydv77/homeground.git
cd homeground
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📱 PWA Installation

### On Mobile (Android/iOS)
1. Open the app in your mobile browser
2. Tap the "Install" or "Add to Home Screen" option
3. The app will work offline after installation

### On Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install" to add to your desktop
3. Launch as a standalone app

---

## 🎮 How to Use

### Creating a Match
1. Click the **"+"** button on the home screen
2. Choose match type:
   - **Single Match**: One-off game
   - **Series**: Multi-match series
   - **Tournament**: Full tournament with multiple teams
3. Enter team details and player names
4. Start scoring!

### Live Scoring
1. Complete the toss and select openers
2. Use the scoring buttons (0, 1, 2, 3, 4, 6)
3. Record extras (Wide, No Ball) when needed
4. Mark wickets with dismissal details
5. Change bowlers at the end of each over
6. View live scorecard anytime

### Match Summary
- After match completion, view detailed scorecards
- Check batting and bowling statistics
- See automatic Man of the Match selection
- Share results with your team

---

## 📂 Project Structure

```
HOMEGROUND/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── match/              # Match-related pages
│   │   ├── series/             # Series pages
│   │   └── tournament/         # Tournament pages
│   ├── components/             # React components
│   │   ├── match/              # Match-specific components
│   │   ├── ui/                 # UI components
│   │   └── pwa/                # PWA components
│   ├── contexts/               # React Context (AppContext)
│   ├── lib/                    # Utilities and database
│   └── utils/                  # Helper functions
├── public/                     # Static assets
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
└── package.json                # Dependencies
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Vercel**
- Go to [vercel.com](https://vercel.com/new)
- Import your GitHub repository
- Click "Deploy"
- Done! 🎉

### Alternative Deployment Options
- **Netlify**: Deploy via Git or drag-and-drop
- **Firebase Hosting**: Use Firebase CLI
- **Custom Server**: Run `npm start` on your server

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Sanjay Yadav**  
Full Stack Developer

- 🐙 GitHub: [@sanjayydv77](https://github.com/sanjayydv77)
- 💼 LinkedIn: [sanjuydv7](https://linkedin.com/in/sanjuydv7)
- 📷 Instagram: [@sanjuydv_7](https://instagram.com/sanjuydv_7)
- 💬 WhatsApp: [+91 7869962336](https://wa.me/917869962336)

---

## 🙏 Acknowledgments

- Cricket scoring rules and conventions
- Next.js and React communities
- Tailwind CSS for amazing styling utilities
- Lucide React for beautiful icons

---

## 📸 Screenshots

> Add screenshots of your app here after deployment

---

## 🐛 Known Issues & Roadmap

### Current Version (v1.0.0)
- ✅ Single match scoring
- ✅ Series tracking
- ✅ Tournament management
- ✅ PWA support
- ✅ Offline functionality

### Future Enhancements
- [ ] Cloud sync across devices
- [ ] Live match sharing
- [ ] Player profiles and career stats
- [ ] Team management system
- [ ] Match replays and highlights
- [ ] Multiple language support
- [ ] Dark mode

---

## 📞 Support

For support, create an issue on GitHub or reach out via social media.

---

<div align="center">

**Made with ❤️ for Cricket Lovers**

⭐ **Star this repo if you find it useful!** ⭐

</div>
