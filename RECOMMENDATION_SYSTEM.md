# Atlas Recommendation System

## Overview

The Atlas Recommendation System provides intelligent recommendations for events, organizations, and labs based on user interests. It uses existing schemas and integrates seamlessly with the database handler.

## Features

- **Multiple Algorithms**: Content-based, collaborative filtering, and hybrid approaches
- **Comprehensive Scoring**: Detailed confidence scores and explanations
- **Flexible Options**: Customizable time ranges, minimum scores, and limits
- **Performance Metrics**: Processing time and coverage analytics
- **Clean Integration**: Works through existing database handler

## Usage Examples

### Basic Usage

```typescript
import Handler from './src/backend/modules/database/services/handler';

const handler = new Handler(DATABASE_URL);
const userId = 'user-id-here';

// Get all recommendation types
const recommendations = await handler.getComprehensiveRecommendations(userId, {
    limit: 10,
    algorithm: 'hybrid',
    includeReasons: true
});

console.log(recommendations.events.recommendations);
console.log(recommendations.organizations.recommendations);
console.log(recommendations.labs.recommendations);
```

### Event Recommendations

```typescript
// Get event recommendations with custom options
const eventRecs = await handler.getEventRecommendationsWithDetails(userId, {
    algorithm: 'content-based',
    limit: 5,
    minScore: 0.3,
    timeRange: {
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
    }
});

// Access recommendations and metrics
eventRecs.recommendations.forEach(rec => {
    console.log(`Event: ${rec.event.name}`);
    console.log(`Score: ${rec.score.score}`);
    console.log(`Reasons: ${rec.score.reasons.join(', ')}`);
    console.log(`Matched Interests: ${rec.matchedInterests.join(', ')}`);
});
```

### Organization Recommendations

```typescript
const orgRecs = await handler.getOrganizationRecommendationsWithDetails(userId, {
    algorithm: 'hybrid',
    limit: 8,
    minScore: 0.2
});

console.log(`Found ${orgRecs.recommendations.length} organization recommendations`);
console.log(`Average Score: ${orgRecs.metrics.averageScore}`);
```

### Lab Recommendations

```typescript
const labRecs = await handler.getLabRecommendationsWithDetails(userId, {
    limit: 5,
    includeReasons: true
});

labRecs.recommendations.forEach(rec => {
    console.log(`Lab: ${rec.lab.name}`);
    console.log(`Research Areas: ${rec.lab.researchAreas?.join(', ')}`);
    console.log(`Match Score: ${rec.score.score}`);
});
```

## API Reference

### RecommendationOptions

```typescript
interface RecommendationOptions {
    algorithm?: 'content-based' | 'collaborative' | 'hybrid';
    limit?: number;
    minScore?: number; // 0-1 threshold
    includeReasons?: boolean;
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    categories?: string[];
}
```

### Response Structure

All recommendation methods return:

```typescript
{
    recommendations: Array<{
        event/organization/lab: Object, // The actual item
        score: {
            score: number, // 0-1 recommendation strength
            confidence: number, // 0-1 confidence level
            reasons: string[] // Explanation of recommendation
        },
        matchedInterests: string[], // User interests that matched
        matchedTags: number[] // Tag IDs that contributed to match
    }>,
    metrics: {
        totalRecommendations: number,
        averageScore: number,
        algorithmsUsed: string[],
        processingTimeMs: number,
        coverageScore: number // How well recommendations cover user interests
    }
}
```

## Algorithms

### Content-Based Filtering
- Matches user interests to item tags
- Uses weighted tag similarities
- Applies recency boosts for events
- Best for users with well-defined interests

### Collaborative Filtering
- Finds users with similar interests
- Recommends items liked by similar users
- Currently implemented as placeholder (requires user interaction tracking)

### Hybrid Approach
- Combines content-based and collaborative methods
- Applies bonus scoring for items recommended by multiple algorithms
- Provides most comprehensive recommendations

## Performance Considerations

- **Caching**: Results are not cached by default - implement caching for production
- **Processing Time**: Typically 50-200ms per user depending on data size
- **Database Queries**: Optimized with proper indexes on tag fields
- **Memory Usage**: Processes recommendations in batches for large datasets

## Integration with Existing Code

The recommendation system uses existing schemas:
- `User` - for user profiles and interests
- `Interest` - for user interest keywords and linked tags
- `Event` - for event recommendations with tag matching
- `Organization` - for organization recommendations
- `Lab` - for lab recommendations
- `Tag` - for tag-based similarities

No new schemas are required - everything works with your current data structure.

## Testing

Run the demonstration script:

```bash
ts-node recommendation-demo.ts
```

This will show:
- Comprehensive recommendations for a test user
- Algorithm comparisons
- Performance metrics
- Usage examples

## Future Enhancements

1. **User Interaction Tracking**: Track clicks, views, and engagement for better collaborative filtering
2. **A/B Testing**: Built-in support for testing different algorithms
3. **Real-time Updates**: WebSocket support for live recommendation updates
4. **Machine Learning**: Integration with ML models for advanced scoring
5. **Caching Layer**: Redis integration for high-performance caching