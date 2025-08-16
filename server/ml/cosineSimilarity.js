class CosineSimilarityRecommender {
  constructor() {
    this.name = 'Cosine Similarity';
  }

  // Calculate cosine similarity between two vectors
  calculateSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Get recommendations based on user preferences
  getRecommendations(userPreferences, destinations, limit = 10) {
    if (!userPreferences || !destinations || destinations.length === 0) {
      return [];
    }

    // Convert user preferences to vector
    const userVector = [
      userPreferences.climate || 0,
      userPreferences.budget || 0,
      userPreferences.adventure || 0,
      userPreferences.culture || 0,
      userPreferences.nature || 0,
      userPreferences.nightlife || 0
    ];

    // Calculate similarity scores for each destination
    const recommendations = destinations.map(destination => {
      const destinationVector = [
        destination.climate || 0,
        destination.budget || 0,
        destination.adventure || 0,
        destination.culture || 0,
        destination.nature || 0,
        destination.nightlife || 0
      ];

      const similarity = this.calculateSimilarity(userVector, destinationVector);

      return {
        destinationId: destination._id,
        destinationName: destination.name,
        destinationCountry: destination.country,
        similarity: similarity,
        factors: {
          climate: destination.climate,
          budget: destination.budget,
          adventure: destination.adventure,
          culture: destination.culture,
          nature: destination.nature,
          nightlife: destination.nightlife
        }
      };
    });

    // Sort by similarity score (descending) and return top results
    return recommendations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Analyze why a destination was recommended
  analyzeRecommendation(userPreferences, destination) {
    const userVector = [
      userPreferences.climate || 0,
      userPreferences.budget || 0,
      userPreferences.adventure || 0,
      userPreferences.culture || 0,
      userPreferences.nature || 0,
      userPreferences.nightlife || 0
    ];

    const destinationVector = [
      destination.climate || 0,
      destination.budget || 0,
      destination.adventure || 0,
      destination.culture || 0,
      destination.nature || 0,
      destination.nightlife || 0
    ];

    const similarity = this.calculateSimilarity(userVector, destinationVector);

    // Find the best matching factors
    const factors = ['climate', 'budget', 'adventure', 'culture', 'nature', 'nightlife'];
    const factorScores = factors.map(factor => ({
      factor,
      userScore: userPreferences[factor] || 0,
      destinationScore: destination[factor] || 0,
      match: Math.abs((userPreferences[factor] || 0) - (destination[factor] || 0)) <= 1
    }));

    const bestMatches = factorScores.filter(f => f.match);
    const worstMatches = factorScores.filter(f => !f.match);

    return {
      similarity,
      bestMatches,
      worstMatches,
      explanation: `This destination matches your preferences with ${(similarity * 100).toFixed(1)}% similarity. Best matches: ${bestMatches.map(f => f.factor).join(', ')}`
    };
  }
}

module.exports = CosineSimilarityRecommender;
