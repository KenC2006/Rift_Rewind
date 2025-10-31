# Rift Rewind

**Your Season, Your Story — AI-Powered League of Legends Coaching & Insights**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Rift Rewind is an AI-powered coaching agent that transforms your League of Legends match history into personalized, actionable insights using AWS AI services and the Riot Games API. Get brutally honest yet constructive coaching analysis, track your progress over time, and discover what's holding you back from climbing.

---

## Features

### Core Functionality
- **AI-Powered Coaching Analysis**: Get comprehensive, personalized insights powered by Amazon Bedrock and Claude AI
- **Full-Year Match History Analysis**: Deep dive into your entire season's performance data
- **Champion-Specific Insights**: Detailed analysis of your top 3 most-played champions with item build recommendations
- **Interactive Bento Grid UI**: Beautiful, organized insights presented in an intuitive card-based interface
- **Real-Time Chat Coach**: Ask questions about your gameplay and get instant AI-powered responses
- **Performance Visualizations**: Radar charts, scatter plots, and detailed statistics dashboards
- **Actionable Improvement Roadmap**: 30/60/90 day plans with specific, measurable goals

### Key Insights Generated
1. **Executive Summary**: High-level skill assessment with your biggest improvement opportunity
2. **Strengths Analysis**: What you're doing well and how to leverage it more
3. **Critical Improvement Areas**: Priority fixes with the 3-2-1 method (3 immediate changes, 2 practice drills, 1 VOD review focus)
4. **Practice Structure**: Weekly routines and deliberate practice protocols
5. **Champion Pool Optimization**: S-tier picks to main, B-tier situational picks, and C-tier champions to avoid
6. **Champion Item Analysis**: Final item build diversity, core item consistency, and adaptation recommendations
7. **Role-Specific Mastery Path**: Core responsibilities, common mistakes, and advanced techniques
8. **Macro & Objectives**: Objective control, rotation timing, and map-wide decision making
9. **30/60/90 Day Roadmap**: Concrete progression plan with specific targets

---

## Architecture

### Tech Stack
- **Backend**: Python (Flask), AWS Bedrock (Claude 3 Sonnet)
- **Frontend**: React, D3.js, GSAP
- **APIs**: Riot Games League API
- **Deployment**: Ready for AWS deployment (EC2, Elastic Beanstalk, or containerized)

### AWS Services Used
- **Amazon Bedrock** (Claude 3 Sonnet): Core AI analysis engine for generating personalized coaching insights
- **AWS SDK (boto3)**: Integration with Bedrock API
- **Resource Tagging**: All infrastructure tagged with `rift-rewind-hackathon: 2025`

---

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Riot Games API Key
- AWS Account with Bedrock access
- AWS Access Key and Secret Key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Rift_Rewind.git
   cd Rift_Rewind
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   RIOT_API_KEY=your_riot_api_key_here
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   ```

4. **Run the backend server**
   ```bash
   python api.py
   ```
   The API will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

### Production Build

```bash
cd frontend
npm run build
```

---

## How It Works

### Methodology

Rift Rewind follows a data-driven coaching philosophy inspired by elite League of Legends coaching:

1. **Data Collection**: Fetches full-year match history via Riot Games API
2. **Statistical Analysis**: Processes match data to extract:
   - CS/min, KDA, vision scores, objective participation
   - Champion pool performance metrics
   - Role-specific statistics
   - Final item build patterns
3. **Benchmark Comparison**: Compares player metrics against role and elo-specific benchmarks
4. **AI Analysis**: Amazon Bedrock (Claude 3 Sonnet) generates personalized coaching insights using a structured prompt that includes:
   - Player statistics and benchmarks
   - Champion pool data
   - Item build analysis
   - Role-specific recommendations
5. **Insight Presentation**: Insights are parsed and displayed in an interactive Bento Grid UI

### Key Discoveries

- **Cost-Effective AI**: Using Claude 3 Sonnet on Bedrock provides high-quality analysis at a fraction of the cost of GPT-4
- **Structured Prompts**: Carefully crafted prompt templates ensure consistent, actionable output
- **Data Quality Matters**: Processing match timelines for item snapshots adds valuable context

---

## Screenshots & Demo

### Demo Video
link

### Screenshots
images

---

## API Endpoints

- `POST /api/analyze` - Analyze a player's match history and generate insights
- `GET /api/items` - Get item ID to name mappings
- `GET /api/health` - Health check endpoint

---

## Design Philosophy

Rift Rewind delivers direct, actionable coaching through:
- **Data-driven analysis**: All recommendations are backed by statistical evidence and benchmark comparisons
- **Clear priorities**: Insights are organized by impact, helping players focus on high-leverage improvements
- **Actionable feedback**: Every weakness identified comes with specific, implementable fixes
- **Metric-focused goals**: Improvement targets are based on performance metrics rather than rank outcomes

The UI is designed to be:
- **Intuitive**: Clear section organization
- **Beautiful**: Modern gradient design with League-themed colors (#C89B3C gold)
- **Interactive**: Expandable cards, hover effects, smooth animations
- **Informative**: Comprehensive insights without overwhelming the user

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Riot Games for the League API
- AWS for Bedrock and hackathon resources
- The League of Legends coaching community for inspiration

---

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Built for the Rift Rewind Hackathon 2025**
