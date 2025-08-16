const CosineSimilarityRecommender = require('./cosineSimilarity');

class HybridRecommender {
  constructor() {
    this.name = 'Hybrid Recommender';
    this.cosineRecommender = new CosineSimilarityRecommender();
  }

  // Combine multiple recommendation scores
  combineScores(scores, weights = null) {
    if (!scores || scores.length === 0) {
      return 0;
    }

    // Default weights: equal importance
    if (!weights) {
      weights = new Array(scores.length).fill(1 / scores.length);
    }

    // Ensure weights sum to 1
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    weights = weights.map(weight => weight / totalWeight);

    // Calculate weighted average
    let combinedScore = 0;
    for (let i = 0; i < scores.length; i++) {
      combinedScore += scores[i] * weights[i];
    }

    return combinedScore;
  }

  // Get hybrid recommendations
  getRecommendations(userPreferences, destinations, limit = 10) {
    if (!userPreferences || !destinations || destinations.length === 0) {
      return [];
    }

    // Get cosine similarity recommendations
    const cosineRecommendations = this.cosineRecommender.getRecommendations(
      userPreferences, 
      destinations, 
      limit * 2
    );

    // Apply additional factors (popularity, rating, etc.)
    const enhancedRecommendations = cosineRecommendations.map(rec => {
      const destination = destinations.find(d => d._id.toString() === rec.destinationId.toString());
      
      // Calculate popularity score (based on ratings and reviews)
      const popularityScore = this.calculatePopularityScore(destination);
      
      // Calculate diversity score (how different from user's travel history)
      const diversityScore = this.calculateDiversityScore(userPreferences, destination);
      
      // Combine all scores
      const finalScore = this.combineScores([
        rec.similarity,
        popularityScore,
        diversityScore
      ], [0.6, 0.3, 0.1]); // 60% similarity, 30% popularity, 10% diversity

      return {
        ...rec,
        popularityScore,
        diversityScore,
        finalScore,
        explanation: this.generateExplanation(rec.similarity, popularityScore, diversityScore)
      };
    });

    // Sort by final score and return top results
    return enhancedRecommendations
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);
  }

  // Calculate popularity score based on destination ratings
  calculatePopularityScore(destination) {
    if (!destination) return 0;

    const rating = destination.averageRating || 0;
    const reviewCount = destination.totalReviews || 0;
    
    // Normalize rating (0-5) to 0-1
    const normalizedRating = rating / 5;
    
    // Normalize review count (logarithmic scale)
    const normalizedReviews = Math.log10(reviewCount + 1) / Math.log10(1000 + 1);
    
    // Combine rating and review count
    return (normalizedRating * 0.7) + (normalizedReviews * 0.3);
  }

  // Calculate diversity score (how different from user's typical preferences)
  calculateDiversityScore(userPreferences, destination) {
    if (!userPreferences || !destination) return 0;

    const factors = ['climate', 'budget', 'adventure', 'culture', 'nature', 'nightlife'];
    let totalDifference = 0;

    factors.forEach(factor => {
      const userPref = userPreferences[factor] || 0;
      const destValue = destination[factor] || 0;
      totalDifference += Math.abs(userPref - destValue);
    });

    // Normalize to 0-1 (higher difference = higher diversity)
    const maxPossibleDifference = factors.length * 5;
    return totalDifference / maxPossibleDifference;
  }

  // Generate explanation for recommendation
  generateExplanation(similarity, popularity, diversity) {
    const explanations = [];

    if (similarity > 0.8) {
      explanations.push('Excellent match with your preferences');
    } else if (similarity > 0.6) {
      explanations.push('Good match with your preferences');
    } else if (similarity > 0.4) {
      explanations.push('Moderate match with your preferences');
    }

    if (popularity > 0.8) {
      explanations.push('Highly popular destination');
    } else if (popularity > 0.6) {
      explanations.push('Popular destination');
    }

    if (diversity > 0.7) {
      explanations.push('Offers new experiences');
    }

    return explanations.join('. ') + '.';
  }

  // Analyze recommendation factors
  analyzeRecommendation(userPreferences, destination) {
    const cosineAnalysis = this.cosineRecommender.analyzeRecommendation(userPreferences, destination);
    const popularityScore = this.calculatePopularityScore(destination);
    const diversityScore = this.calculateDiversityScore(userPreferences, destination);

    return {
      ...cosineAnalysis,
      popularityScore,
      diversityScore,
      overallScore: this.combineScores([
        cosineAnalysis.similarity,
        popularityScore,
        diversityScore
      ], [0.6, 0.3, 0.1])
    };
  }
}

module.exports = HybridRecommender;
