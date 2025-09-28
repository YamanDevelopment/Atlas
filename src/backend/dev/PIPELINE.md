# UCF Data Pipeline

Complete data pipeline that scrapes UCF events and organizations, analyzes them with AI for hierarchical tagging, and stores them in MongoDB.

## Quick Start

1. **Setup Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and Gemini API key
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Pipeline**:
   ```bash
   # Standard mode (recommended)
   npm run pipeline

   # Fast mode (testing - 2 pages)
   npm run pipeline:fast

   # Comprehensive mode (50+ pages - production)
   npm run pipeline:comprehensive
   ```

## What the Pipeline Does

### 1. **Data Scraping** 📡
- Scrapes events from UCF Events and Campus Labs
- Scrapes organizations from Campus Labs
- Extracts categories and metadata

### 2. **AI Analysis** 🧠
- Analyzes content with Gemini AI
- Assigns hierarchical tags with confidence weights
- Uses two-phase algorithm: primary (≥0.7) → secondary (≥0.6)
- Processes in batches with rate limiting

### 3. **Database Storage** 💾
- Initializes MongoDB with hierarchical tag taxonomy
- Stores processed events and organizations
- Maintains AI processing metadata

## Pipeline Modes

| Mode | Pages | Use Case | Time |
|------|-------|----------|------|
| `fast` | 2 | Testing/Development | ~5 min |
| `standard` | 5 | Regular updates | ~15 min |
| `comprehensive` | 50+ | Full data collection | ~2 hours |

## Configuration

### Required Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=atlas

# AI (Required)
GEMINI_API_KEY=your_api_key_here
```

### Optional Configuration

```bash
# AI Settings
GEMINI_MODEL=gemini-2.5-flash
AI_TAGGING_CONFIDENCE=0.7
AI_MAX_TAGS_PER_ITEM=5

# Processing Settings
AI_ENABLE_AUTO_TAGGING=true
```

## Output

The pipeline will:

1. **Initialize** hierarchical tags (13 primary + 67 secondary)
2. **Scrape** events and organizations from UCF sources
3. **Analyze** content with AI for smart categorization
4. **Store** processed data with weighted tags in MongoDB

### Sample Output:
```
🚀 UCF Data Pipeline Starting
═════════════════════════════════════════════════════
📋 Mode: standard
🗄️  Database: mongodb://localhost:27017/atlas
🤖 AI Model: gemini-2.5-flash

📋 Step 1: Database Initialization
✅ Created 80 tags, 145 interests

📡 Step 2: Data Scraping
✅ Scraped 247 events
✅ Scraped 156 organizations
⏱️  Scraping took 45.2s

🧠 Step 3: AI Analysis & Tagging
✅ Processed 247/247 events
✅ Processed 156/156 organizations
⏱️  AI analysis took 312.5s

💾 Step 4: Database Storage
✅ Stored 247 events
✅ Stored 156 organizations
⏱️  Storage took 12.3s

✅ Pipeline completed successfully!
```

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY is required"**
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add to `.env` file: `GEMINI_API_KEY=your_key_here`

2. **MongoDB connection failed**
   - Ensure MongoDB is running: `brew services start mongodb/brew/mongodb-community`
   - Check connection string in `.env`: `MONGODB_URI=mongodb://localhost:27017`

3. **Rate limiting errors**
   - Pipeline includes automatic rate limiting
   - Use `fast` mode for testing to reduce API calls

4. **Memory issues**
   - Use `fast` or `standard` mode for limited resources
   - Pipeline processes in batches to manage memory

## Data Structure

After completion, your MongoDB will contain:

- **Tags Collection**: 13 primary + 67 secondary hierarchical tags
- **Events Collection**: UCF events with AI-assigned weighted tags
- **Organizations Collection**: Campus organizations with AI categorization
- **Interests Collection**: Predefined interest categories for recommendations

## Next Steps

After running the pipeline:

1. **Test Recommendations**: Use the weighted tag system for personalized recommendations
2. **Set up API**: Create REST endpoints to serve the processed data
3. **Build Frontend**: Connect your React/Vue app to the API
4. **Schedule Updates**: Run pipeline regularly to keep data fresh

## Advanced Usage

### Custom Configuration

```typescript
// Modify configurations in src/backend/modules/scraper/fetchData.ts
const customConfig = {
  maxPages: 10,
  requestDelay: 500,
  maxRetries: 3
};
```

### Monitoring

Check pipeline progress:
- Real-time console output
- Database statistics after completion
- Error handling with detailed logs

---

**Ready to power your UCF platform with AI-driven content discovery!** 🚀