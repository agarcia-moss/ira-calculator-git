# IRA Calculator - Workforce Planning Tool

## 🌐 **Access the Application**

### **Desktop Application (Recommended)**
Download the latest version from [GitHub Releases](https://github.com/agarcia-moss/ira-calculator-git/releases)

**Features:**
- ✨ **Auto-updates**: Automatically checks for and installs updates
- 🖥️ **Native Experience**: Runs as a standalone desktop application
- 🔄 **Always Up-to-date**: Get new features and bug fixes automatically
- 📱 **Cross-platform**: Available for macOS, Windows, and Linux

### **Web Application**
**Visit: [https://moss-ira-calc.azurewebsites.net/](https://moss-ira-calc.azurewebsites.net/)**

No downloads required - use directly in your web browser.

---

## 📋 **What is the IRA Calculator?**

The IRA Calculator is a comprehensive workforce planning tool designed specifically for construction and energy projects that must comply with the **Inflation Reduction Act (IRA) apprenticeship requirements**. This web-based application helps project managers, contractors, and workforce planners ensure their projects meet the 15% minimum apprentice hour requirement for tax credit eligibility.

## 🎯 **Key Business Benefits**

- **IRA Compliance**: Automatically calculates and tracks apprentice percentages to ensure tax credit eligibility
- **Workforce Planning**: Visualize workforce requirements across multiple trades and time periods
- **Cost Optimization**: Plan efficient ramp-up and ramp-down schedules to minimize labor costs
- **Risk Mitigation**: Identify compliance gaps before they impact project timelines or tax benefits
- **Stakeholder Communication**: Generate professional reports and visualizations for project presentations

## 🏗️ **How It Works**

### **1. Project Setup**
- Define your project timeline and scope
- Add multiple trades (Electrical, Mechanical, Civil)
- Specify project capacity in megawatts (MW)

### **2. Workforce Configuration**
- Set man-hours required per megawatt for each trade
- Configure ramp-up and ramp-down periods
- Define apprentice ratios (Civil trade automatically set to 0% per IRA rules)

### **3. Real-Time Analysis**
- View individual trade workforce curves
- See combined project timeline with overlapping trades
- Monitor apprentice percentage compliance in real-time
- Generate comprehensive project overviews

## 📊 **What You'll See**

### **Individual Trade Analysis**
- **Weekly Workforce Charts**: Visual representation of workers needed over time
- **Ramp Curves**: Smooth transitions from startup to full production to completion
- **Apprentice Tracking**: Real-time percentage calculations for IRA compliance

### **Project Overview Dashboard**
- **Combined Timeline**: See how all trades overlap and interact
- **Compliance Status**: Clear indicators showing whether your project meets IRA requirements
- **Resource Summary**: Total hours, apprentice percentages, and workforce requirements
- **Export Capabilities**: Download detailed reports in CSV format

## 🚀 **Getting Started (No Technical Knowledge Required)**

1. **Open your web browser** (Chrome, Firefox, Safari, Edge)
2. **Navigate to**: [https://moss-ira-calc.azurewebsites.net/](https://moss-ira-calc.azurewebsites.net/)
3. **Start planning**: Add your first trade and begin workforce planning

## 💡 **Use Cases**

### **Infrastructure Development**
- Coordinate civil, electrical, and mechanical trades
- Plan long-term workforce requirements
- Ensure regulatory compliance

## 🔒 **Data Security & Privacy**

- **No Data Storage**: All calculations are performed locally in your browser
- **No Registration Required**: Start using immediately without creating accounts
- **Export Your Data**: Download your project data for offline storage
- **Private Calculations**: Your project information never leaves your device

## 📱 **Accessibility**

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Browsers**: Compatible with all current web browsers
- **No Plugins**: No additional software or browser extensions required

## 🆘 **Need Help?**

The application is designed to be intuitive and self-explanatory. However, if you need assistance:

1. **Check the tooltips** throughout the interface
2. **Review the help text** below each input field
3. **Export your data** to share with your team for review

## 🏆 **Why Choose the IRA Calculator?**

- **Purpose-Built**: Designed specifically for IRA compliance requirements
- **Industry Standard**: Follows construction and energy industry best practices
- **Cost-Effective**: Free to use, no licensing fees or subscriptions
- **Always Available**: 24/7 access from anywhere with internet connectivity
- **Professional Output**: Generate reports suitable for stakeholders and regulators

---

## 📦 **Releases & Updates**

### **Latest Release: v1.0.0**

The desktop application includes automatic update functionality:
- **Automatic Updates**: The app checks for updates on startup
- **Background Downloads**: Updates download silently in the background
- **User-Friendly Prompts**: You'll be notified when updates are ready to install
- **One-Click Updates**: Restart the application to apply updates instantly

### **Release Channels**
- **Stable**: Production-ready releases from the main branch
- **Beta**: Pre-release versions with new features (if available)

### **Installation**
1. Download the appropriate installer for your operating system from [GitHub Releases](https://github.com/agarcia-moss/ira-calculator-git/releases)
2. Run the installer and follow the setup instructions
3. The application will automatically check for updates on future launches

---

## 🛠️ **Development**

### **Prerequisites**
- Node.js 18+
- npm or yarn

### **Setup**
```bash
# Clone the repository
git clone https://github.com/agarcia-moss/ira-calculator-git.git
cd ira-calculator-git

# Install dependencies
npm install

# Start development server
npm start

# For Electron development
npm run electron
```

### **Building for Production**
```bash
# Build desktop application
npm run build-electron-prod

# Build web application
npm run build
```

### **Creating a New Release**
1. Update version in `package.json`
2. Update `CHANGELOG.md` with new features/fixes
3. Commit changes
4. Create and push a new git tag: `git tag v1.0.1 && git push origin v1.0.1`
5. GitHub Actions will automatically build and publish the release

---

## 🌟 **Ready to Start?**

**Download the desktop app from [GitHub Releases](https://github.com/agarcia-moss/ira-calculator-git/releases) for the best experience!**

*Or visit the web version at [https://moss-ira-calc.azurewebsites.net/](https://moss-ira-calc.azurewebsites.net/)* 