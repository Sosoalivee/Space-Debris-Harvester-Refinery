# Space Debris Harvester-Refinery Simulator

## 🚀 Overview
Interactive simulation demonstrating a circular space economy approach to orbital debris management. Instead of treating debris as waste, this system models collection, processing, and conversion into valuable materials.

## 🎯 Key Features
- **Smart Prioritization**: Multi-criteria algorithm ranking debris by threat, value, and accessibility
- **Real-Time Simulation**: Watch missions unfold day-by-day or year-by-year
- **Economic Analysis**: Live profit/loss tracking and material value calculations
- **Flexible Time Scales**: Model short missions (days/weeks) or long-term operations (months/years)
- **Comprehensive Visualization**: 6+ interactive charts showing orbital distribution, collection progress, and material breakdown

## 🎮 Live Demo
**[View Live Simulation](https://github.com/Sosoalivee/Space-Debris-Harvester-Refinery/)**

## 📊 What It Demonstrates
Based on the research paper approach:
1. **Debris Data Management**: Catalog generation with realistic orbital parameters
2. **Target Prioritization**: Scoring algorithm balancing threat reduction and economic value
3. **Smart Collection Sequences**: Optimized mission planning
4. **Material Recovery**: Conversion modeling with adjustable efficiency rates
5. **Economic Viability**: Cost-benefit analysis proving circular economy potential

## 🛠️ Technology Stack
- React 18
- Recharts (data visualization)
- Tailwind CSS (styling)
- Lucide React (icons)

## 📈 How to Use
1. **Adjust Mission Parameters**: Set duration, debris targets, collection efficiency, and costs
2. **Choose Time Scale**: Select days, months, or years for different analysis types
3. **Launch Mission**: Watch automated collection or step through manually
4. **Analyze Results**: Review economic outcomes, material recovery, and risk reduction

## 🎓 Academic Context
This simulation implements the workflow described in the accompanying research paper:
- Demonstrates feasibility of debris-as-resource concept
- Models economic break-even scenarios
- Provides visual evidence for sustainability advantages
- Supports mission planning and investment analysis

## 🚀 Quick Start

### Run Locally
```bash
# Clone the repository
git clone https://github.com/yourusername/space-debris-harvester-refinery.git

# Navigate to directory
cd space-debris-harvester-refinery

# Open in browser
open index.html
```

### Deploy to GitHub Pages
```bash
# Enable GitHub Pages in repository settings
# Select 'main' branch and '/ (root)' folder
# Access at: https://yourusername.github.io/space-debris-harvester-refinery/
```

## 📖 Documentation

### Mission Parameters
- **Time Unit**: Choose between days, months, or years
- **Duration**: Mission length (10-90 days, 1-36 months, 1-30 years)
- **Debris Targets**: Number of objects to collect (5-2000)
- **Recovery Efficiency**: Material conversion rate (50-95%)
- **Mission Cost**: Total operational expense ($1M-$100M)
- **Simulation Speed**: Control playback rate

### Key Metrics
- **Collected**: Number of debris objects retrieved
- **Mass**: Total recovered material in metric tons
- **Value**: Economic worth of recovered materials
- **Cost**: Operational expenses
- **Profit**: Net result (Value - Cost)
- **Risk Reduced**: Percentage decrease in collision threat

### Visualization Components
1. **Collection Timeline**: Progress tracking vs. targets
2. **Orbital Distribution**: Scatter plot showing debris altitude vs. mass
3. **Material Recovery**: Pie chart of material composition
4. **Economic Breakdown**: Bar chart of value by material type
5. **Priority Analysis**: Radar chart of top target scoring
6. **Daily Mission Log**: Detailed collection records

## 🔬 Research Applications
- **Mission Planning**: Test scenarios before committing resources
- **Economic Forecasting**: Model long-term profitability
- **Risk Assessment**: Quantify safety benefits
- **Policy Support**: Demonstrate circular economy advantages
- **Education**: Teach space sustainability concepts

## 📝 Citation
If you use this simulator in research or presentations:
```
Space Debris Harvester-Refinery Simulator
https://github.com/yourusername/space-debris-harvester-refinery
```

## 🤝 Contributing
Contributions welcome! Areas for enhancement:
- Integration with real Space-Track.org data
- Advanced orbital mechanics (Poliastro integration)
- Multi-spacecraft mission modeling
- Machine learning for optimization
- Export/report generation

## 📄 License
MIT License - feel free to use for research and education

## 📧 Contact
[Your Name] - [your.email@example.com]

Project Link: https://github.com/yourusername/space-debris-harvester-refinery

---

**Note**: This is a simulation for demonstration and research purposes. Actual space debris removal missions require extensive engineering, regulatory approvals, and safety considerations.
```

**File 4: `.gitignore`**
```
# Logs
*.log

# OS files
.DS_Store
Thumbs.db

# Editor directories
.vscode/
.idea/

# Temporary files
*.tmp
*.swp
```

**File 5: `LICENSE`**
```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
