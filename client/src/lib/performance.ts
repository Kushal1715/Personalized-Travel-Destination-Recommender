// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'measure' | 'mark';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric({
              name: 'page_load',
              value: entry.duration,
              timestamp: Date.now(),
              type: 'navigation'
            });
          }
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing not supported:', error);
      }

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordMetric({
              name: `resource_${entry.name.split('/').pop()}`,
              value: entry.duration,
              timestamp: Date.now(),
              type: 'measure'
            });
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing not supported:', error);
      }
    }
  }

  // Record a custom metric
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Mark a point in time
  mark(name: string) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  // Measure time between two marks
  measure(name: string, startMark: string, endMark?: string) {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        
        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
          this.recordMetric({
            name,
            value: measure.duration,
            timestamp: Date.now(),
            type: 'measure'
          });
        }
      } catch (error) {
        console.warn('Performance measure failed:', error);
      }
    }
  }

  // Get performance metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  // Get average metric value
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // Get performance summary
  getSummary() {
    const navigationMetrics = this.metrics.filter(m => m.type === 'navigation');
    const measureMetrics = this.metrics.filter(m => m.type === 'measure');
    
    return {
      totalMetrics: this.metrics.length,
      navigationMetrics: navigationMetrics.length,
      measureMetrics: measureMetrics.length,
      averagePageLoad: this.getAverageMetric('page_load'),
      recentMetrics: this.metrics.slice(-10)
    };
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const performanceUtils = {
  // Measure API call performance
  measureApiCall: async <T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startMark = `${name}_start`;
    const endMark = `${name}_end`;
    
    performanceMonitor.mark(startMark);
    
    try {
      const result = await apiCall();
      performanceMonitor.mark(endMark);
      performanceMonitor.measure(name, startMark, endMark);
      return result;
    } catch (error) {
      performanceMonitor.mark(endMark);
      performanceMonitor.measure(`${name}_error`, startMark, endMark);
      throw error;
    }
  },

  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    const startMark = `${componentName}_render_start`;
    const endMark = `${componentName}_render_end`;
    
    performanceMonitor.mark(startMark);
    renderFn();
    performanceMonitor.mark(endMark);
    performanceMonitor.measure(`${componentName}_render`, startMark, endMark);
  },

  // Measure image load time
  measureImageLoad: (imageSrc: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startMark = `image_${imageSrc.split('/').pop()}_start`;
      const endMark = `image_${imageSrc.split('/').pop()}_end`;
      
      performanceMonitor.mark(startMark);
      
      const img = new Image();
      img.onload = () => {
        performanceMonitor.mark(endMark);
        performanceMonitor.measure(`image_load_${imageSrc.split('/').pop()}`, startMark, endMark);
        resolve();
      };
      img.onerror = () => {
        performanceMonitor.mark(endMark);
        performanceMonitor.measure(`image_error_${imageSrc.split('/').pop()}`, startMark, endMark);
        reject(new Error(`Failed to load image: ${imageSrc}`));
      };
      img.src = imageSrc;
    });
  }
};

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    mark: performanceMonitor.mark.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
    clear: performanceMonitor.clear.bind(performanceMonitor)
  };
}
