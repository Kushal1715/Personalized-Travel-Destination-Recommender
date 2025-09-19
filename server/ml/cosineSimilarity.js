class CosineSimilarityRecommender {
  constructor() {
    this.name = 'Cosine Similarity Recommender';
  }

  // Calculate cosine similarity between two vectors
  calculateCosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB) return 0;
    
    const keys = Object.keys(vectorA);
    if (keys.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const key of keys) {
      const a = vectorA[key] || 0;
      const b = vectorB[key] || 0;
      
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Normalize vector to 0-1 range
  normalizeVector(vector) {
    const normalized = {};
    const keys = Object.keys(vector);
    
    for (const key of keys) {
      const value = vector[key] || 0;
      // Assuming values are already in 1-5 range, normalize to 0-1
      normalized[key] = (value - 1) / 4;
    }
    
    return normalized;
  }

  // Get recommendations based on cosine similarity
  getRecommendations(userPreferences, destinations, limit = 10) {
    if (!userPreferences || !destinations || destinations.length === 0) {
      return [];
    }

    // Normalize user preferences
    const normalizedUserPrefs = this.normalizeVector(userPreferences);
    
    // Calculate similarities for all destinations
    const recommendations = destinations.map(destination => {
      // Create destination vector from its attributes
      const destinationVector = {
        climate: destination.climate || 0,
        budget: destination.budget || 0,
        adventure: destination.adventure || 0,
        culture: destination.culture || 0,
        nature: destination.nature || 0,
        nightlife: destination.nightlife || 0
      };

      // Normalize destination vector
      const normalizedDestVector = this.normalizeVector(destinationVector);
      
      // Calculate cosine similarity
      const similarity = this.calculateCosineSimilarity(normalizedUserPrefs, normalizedDestVector);
      
      // Calculate factor breakdown
      const factors = this.calculateFactorBreakdown(normalizedUserPrefs, normalizedDestVector);
      
      // Generate explanation
      const explanation = this.generateExplanation(similarity, factors, destination);
      
      return {
        destinationId: destination._id,
        destinationName: destination.name,
        destinationCountry: destination.country,
        similarity: similarity,
        factors: factors,
        explanation: explanation
      };
    });

    // Sort by similarity and return top results
    return recommendations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Calculate factor breakdown for detailed analysis
  calculateFactorBreakdown(userPrefs, destVector) {
    const factors = {};
    const keys = Object.keys(userPrefs);
    
    for (const key of keys) {
      const userValue = userPrefs[key] || 0;
      const destValue = destVector[key] || 0;
      
      // Calculate how well this factor matches
      const factorScore = 1 - Math.abs(userValue - destValue);
      factors[key] = Math.max(0, Math.min(1, factorScore));
    }
    
    return factors;
  }

  // Generate human-readable explanation
  generateExplanation(similarity, factors, destination) {
    const explanations = [];
    
    // Overall similarity explanation
    if (similarity > 0.8) {
      explanations.push('Excellent match with your preferences');
    } else if (similarity > 0.6) {
      explanations.push('Good match with your preferences');
    } else if (similarity > 0.4) {
      explanations.push('Moderate match with your preferences');
    } else {
      explanations.push('Somewhat matches your preferences');
    }

    // Factor-specific explanations
    const topFactors = Object.entries(factors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const factorExplanations = topFactors.map(([factor, score]) => {
      const factorName = this.getFactorDisplayName(factor);
      if (score > 0.8) {
        return `excellent ${factorName} match`;
      } else if (score > 0.6) {
        return `good ${factorName} match`;
      } else if (score > 0.4) {
        return `moderate ${factorName} match`;
      }
      return null;
    }).filter(Boolean);

    if (factorExplanations.length > 0) {
      explanations.push(`Strong points: ${factorExplanations.join(', ')}`);
    }

    // Destination-specific insights
    if (destination.averageRating > 4.5) {
      explanations.push('Highly rated by other travelers');
    } else if (destination.averageRating > 4.0) {
      explanations.push('Well-rated by other travelers');
    }

    if (destination.totalReviews > 1000) {
      explanations.push('Popular destination with many reviews');
    }

    return explanations.join('. ') + '.';
  }

  // Get display name for factor
  getFactorDisplayName(factor) {
    const factorNames = {
      climate: 'climate',
      budget: 'budget',
      adventure: 'adventure level',
      culture: 'cultural richness',
      nature: 'natural beauty',
      nightlife: 'nightlife scene'
    };
    return factorNames[factor] || factor;
  }

  // Analyze a specific recommendation
  analyzeRecommendation(userPreferences, destination) {
    const normalizedUserPrefs = this.normalizeVector(userPreferences);
    
    const destinationVector = {
      climate: destination.climate || 0,
      budget: destination.budget || 0,
      adventure: destination.adventure || 0,
      culture: destination.culture || 0,
      nature: destination.nature || 0,
      nightlife: destination.nightlife || 0
    };

    const normalizedDestVector = this.normalizeVector(destinationVector);
    const similarity = this.calculateCosineSimilarity(normalizedUserPrefs, normalizedDestVector);
    const factors = this.calculateFactorBreakdown(normalizedUserPrefs, normalizedDestVector);
    const explanation = this.generateExplanation(similarity, factors, destination);

    return {
      similarity,
      factors,
      explanation,
      destinationVector: normalizedDestVector,
      userVector: normalizedUserPrefs
    };
  }

  // Get recommendation insights
  getInsights(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return {
        averageSimilarity: 0,
        topFactors: {},
        diversityScore: 0,
        totalRecommendations: 0
      };
    }

    const similarities = recommendations.map(r => r.similarity);
    const averageSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;

    // Calculate top factors across all recommendations
    const factorScores = {};
    recommendations.forEach(rec => {
      Object.entries(rec.factors).forEach(([factor, score]) => {
        if (!factorScores[factor]) {
          factorScores[factor] = [];
        }
        factorScores[factor].push(score);
      });
    });

    const topFactors = {};
    Object.entries(factorScores).forEach(([factor, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      topFactors[factor] = avgScore;
    });

    // Calculate diversity score (how different the recommendations are from each other)
    let diversityScore = 0;
    if (recommendations.length > 1) {
      let totalDifference = 0;
      let comparisons = 0;
      
      for (let i = 0; i < recommendations.length; i++) {
        for (let j = i + 1; j < recommendations.length; j++) {
          const diff = Math.abs(recommendations[i].similarity - recommendations[j].similarity);
          totalDifference += diff;
          comparisons++;
        }
      }
      
      diversityScore = comparisons > 0 ? totalDifference / comparisons : 0;
    }

    return {
      averageSimilarity,
      topFactors,
      diversityScore,
      totalRecommendations: recommendations.length
    };
  }
}

module.exports = CosineSimilarityRecommender;