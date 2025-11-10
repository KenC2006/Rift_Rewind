# Rift Rewind

A League of Legends Year-in-Review dashboard that provides personalized, AI-powered performance analysis and coaching insights for players. Made for the Rift Rewind hackathon.

**Live Demo:** https://rift-rewind-kohl.vercel.app/

## Features

- **Comprehensive Player Analysis**: Fetches and analyzes your entire year of League matches using the Riot Games API
- **AI-Powered Coaching**: Leverages AWS Bedrock (Claude) to generate personalized, savage-yet-constructive performance reviews
- **Interactive Visualizations**: Beautiful data visualizations using D3.js and GSAP animations
- **Real-time Chat Coach**: Chat with "Ryze", an AI coach who provides personalized advice based on your stats
- **Performance Benchmarking**: Compare your stats against role and rank-specific benchmarks
- **Champion Pool Analysis**: Identifies your best champions and suggests pool optimization
- **Detailed Metrics Tracking**:
  - CS/min, KDA, vision score, objective participation
  - Item build tracking with inventory snapshots (early, mid, late game)
  - Monthly performance trends
  - Role distribution and champion mastery
- **30/60/90 Day Improvement Roadmap**: Structured practice plans with actionable drills

## Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Navigation
- **D3.js** - Data visualizations
- **GSAP** - Animations
- **Axios** - API requests
- **Vercel** - Deployment platform

### Backend
- **Python** - Backend
- **Flask** - Web framework
- **AWS Bedrock** - AI/ML service (Claude 3.5 Sonnet)
- **Riot Games API** - Match data and player stats
- **Flask-CORS** - Cross-origin resource sharing
- **Render** - Backend deployment

## Technical Architecture

### System Design
**Full-Stack AI Application** with React frontend, Flask backend, and AWS Bedrock integration
- **Decoupled Architecture**: Frontend deployed on Vercel, backend on Render for independent scaling
- **RESTful API**: Clean separation between presentation and business logic
- **Stateless Backend**: Each request is independent, enabling horizontal scaling

### Data Pipeline
```
Riot API → Match Data Processor → Statistical Analysis → AI Prompt Generation → AWS Bedrock → Structured Insights
```

**Key Processing Steps:**
1. **Match Aggregation**: Fetches up to 365 days of match history with pagination handling
2. **Timeline Reconstruction**: Reconstructs inventory from item purchase/sale/undo events
3. **Statistical Computation**: Calculates 40+ performance metrics including per-minute rates
4. **Benchmark Comparison**: Role and rank-specific performance evaluation
5. **Prompt Engineering**: Generates comprehensive context for AI analysis (2000+ token prompts)

### Technical Highlights

#### Advanced Item Tracking System
- **Timeline Event Processing**: Parses ITEM_PURCHASED, ITEM_SOLD, ITEM_DESTROYED, and ITEM_UNDO events
- **Temporal Snapshots**: Captures inventory at 3 game stages (2min, midgame, endgame)
- **Deduplication Logic**: Handles multiple purchases of same item with count tracking
- **Champion-Specific Analysis**: Aggregates builds per champion for pattern recognition

#### AI Integration (AWS Bedrock)
- **Model**: Claude 3.5 Sonnet (8000 token responses)
- **Prompt Engineering**: Structured 8-section coaching framework with role-specific guidance
- **Context Window Management**: Efficient token usage with strategic data summarization
- **Conversational Memory**: Chat feature maintains conversation history for contextual responses

#### Performance Optimizations
- **Rate Limiting**: Implements Riot API rate limit handling with exponential backoff
- **Batch Processing**: Fetches matches in 100-match batches with smart pagination
- **Selective Timeline Fetching**: Limits timeline requests to avoid API throttling (10 per batch)
- **Client-Side Caching**: React context stores player data to avoid redundant API calls

#### Data Processing Algorithms
- **Role Detection**: Multi-tiered inference (API field → champion patterns → positional heuristics)
- **Benchmark Normalization**: Dynamic benchmark selection based on detected rank and primary role
- **KDA Calculation**: Handles edge cases (0 deaths = perfect KDA handling)
- **Win Rate Aggregation**: Per-champion, per-role, and overall calculations

### Frontend Engineering

#### Visualization Layer
- **D3.js Integration**: Custom SVG-based charts for champion pool and performance metrics
- **Responsive Design**: Media queries for mobile, tablet, and desktop viewports
- **Component Architecture**: Modular React components with clear separation of concerns

#### State Management
- **React Context API**: Global state for player data and insights
- **Local State**: Component-level state for UI interactions
- **Async Handling**: Loading states and error boundaries for API calls

### Backend Engineering

#### API Design
- **Modular Structure**: Separation of concerns (api.py for routes, backend.py for business logic)
- **Error Handling**: Comprehensive try-catch blocks with meaningful error messages
- **CORS Configuration**: Properly configured for cross-origin requests from frontend
- **Health Checks**: Monitoring endpoint for deployment health verification

#### Data Models
- **RiotAPIClient**: Encapsulates all Riot API interactions with regional routing
- **AWSBedrockClient**: Manages AI model invocation with retry logic
- **MatchDataProcessor**: Pure functions for statistical computation
- **InsightGenerator**: Prompt engineering and response formatting
- **PerformanceBenchmarks**: Static benchmark data with comparison algorithms

## Key Features Explained

### Performance Benchmarking
The app compares your stats against role and rank-specific benchmarks sourced from:
- LeagueMath.com
- League of Graphs
- U.GG
- League of Legends Tools

### AI Coaching Style
The AI coach ("Ryze") provides analysis in a unique "roast-to-coach" style:
- Brutally honest about weaknesses
- Uses gaming terminology (e.g., "diff'd", "gapped", "inting")
- Provides actionable fixes for every criticism
- Balances savage humor with genuine coaching value

### Item Tracking
Item analysis includes:
- Inventory snapshots at different game stages (early, mid, final)
- Item purchase frequency tracking
- Champion-specific build patterns
- Timeline reconstruction from match events

