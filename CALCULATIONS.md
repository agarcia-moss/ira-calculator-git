# IRA Calculator - How the Math Works

This document explains the calculations performed by the IRA Calculator in simple, business-friendly terms.

## 🎯 **What the Calculator Does**

The IRA Calculator takes your project inputs and automatically calculates:
- How many workers you need each week
- How many of those workers should be apprentices vs. journeymen
- Whether your project meets the 15% apprentice requirement for IRA tax credits
- Total project costs and timelines

---

## 📊 **Step-by-Step Calculations**

### **1. Total Project Hours**
```
Total Hours = Man Hours per MW × Total MW
```
**Example**: If you need 40 hours per megawatt and your project is 100 MW:
- Total Hours = 40 × 100 = 4,000 hours

### **2. Project Timeline**
```
Project Duration = End Date - Start Date (in weeks)
```
**Example**: If your project runs from January 1 to March 1:
- Project Duration = 8 weeks

### **3. Weekly Workforce Planning**

#### **A. Steady State (Full Production)**
The calculator determines how many workers you need during peak production:

```
Peak Workers = Total Hours ÷ (Project Duration × 40 hours per week)
```

**Example**: 4,000 hours ÷ (8 weeks × 40 hours) = 12.5 workers
- **Rounded to**: 13 workers during peak production

#### **B. Ramp-Up Period**
During ramp-up, workforce gradually increases:
- Week 1: 25% of peak workers
- Week 2: 50% of peak workers  
- Week 3: 75% of peak workers
- Week 4: 100% of peak workers

#### **C. Ramp-Down Period**
During ramp-down, workforce gradually decreases:
- Week 5: 100% of peak workers
- Week 6: 75% of peak workers
- Week 7: 50% of peak workers
- Week 8: 25% of peak workers

### **4. Apprentice vs. Journeyman Distribution**

#### **For Electrical and Mechanical Trades:**
```
Apprentices = 15% of Total Workers
Journeymen = Apprentices (1:1 supervision ratio)
Other Workers = Remaining 70%
```

**Example**: With 13 total workers:
- Apprentices: 2 workers (15%)
- Journeymen: 2 workers (15% - supervising apprentices)
- Other Workers: 9 workers (70%)

#### **For Civil Trade:**
```
Apprentices = 0 (per IRA rules)
Journeymen = 0
Other Workers = 100% of total workers
```

### **5. IRA Compliance Check**

#### **Individual Trade Compliance:**
```
Apprentice Percentage = (Apprentice Hours ÷ Total Hours) × 100
```

**Example**: If apprentices work 600 hours out of 4,000 total hours:
- Apprentice Percentage = (600 ÷ 4,000) × 100 = 15% ✅

#### **Project-Wide Compliance:**
When you have multiple trades, the calculator ensures the **entire project** meets 15%:

```
Project Apprentice % = (Total Apprentice Hours ÷ Total Project Hours) × 100
```

**Special Rule**: Since Civil trade has no apprentices, Electrical and Mechanical trades must compensate to reach 15% project-wide.

---

## 🔄 **Real-Time Updates**

The calculator updates all numbers instantly when you:
- Change project parameters
- Add or remove trades
- Adjust start/end dates
- Modify workforce ratios

---

## 📈 **What You See in the Charts**

### **Individual Trade Charts:**
- **Blue Line**: Total workers needed each week
- **Orange Line**: Apprentice workers each week
- **Green Line**: Journeyman workers each week
- **Purple Line**: Other workers each week

### **Project Overview Chart:**
- **Combined Workforce**: Total workers across all trades
- **Apprentice Percentage**: Red line showing if you're above/below 15%
- **Trade Overlap**: How different trades work simultaneously

---

## ✅ **Compliance Indicators**

### **Green Checkmark** ✅
- Your project meets or exceeds 15% apprentice requirement
- You're eligible for IRA tax credits

### **Yellow Warning** ⚠️
- Your project is below 15% apprentice requirement
- You need to increase apprentice participation to qualify for tax credits

---

## 📋 **Key Business Rules**

1. **15% Minimum**: IRA requires at least 15% apprentice hours for tax credits
2. **Civil Trade Exception**: Civil trade cannot have apprentices (IRA rule)
3. **1:1 Supervision**: Each apprentice must have a journeyman supervisor
4. **Project-Wide Calculation**: Compliance is calculated across the entire project, not individual trades

---

## 💡 **Why These Calculations Matter**

### **Tax Credit Eligibility**
- Meeting 15% apprentice requirement = eligible for IRA tax credits
- Missing the requirement = no tax credits, potential penalties

### **Workforce Planning**
- Accurate worker counts = better project scheduling
- Proper ramp-up/down = cost optimization
- Apprentice planning = compliance assurance

### **Risk Management**
- Early identification of compliance gaps
- Proactive workforce adjustments
- Stakeholder communication

---

## 🎯 **Bottom Line**

The IRA Calculator does the complex math so you can focus on your project. It ensures you:
- Meet IRA requirements for tax credits
- Plan workforce efficiently
- Avoid compliance penalties
- Optimize project costs

**No manual calculations needed** - just input your project details and let the calculator handle the rest!
