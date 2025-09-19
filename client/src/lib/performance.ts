// Performance monitoring utilities
export const performanceUtils = {
  // Measure function execution time
  measureTime: <T>(fn: () => T, label?: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  // Measure async function execution time
  measureTimeAsync: async <T>(fn: () => Promise<T>, label?: string): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  // Create a performance timer
  createTimer: (label?: string) => {
    const start = performance.now();
    
    return {
      end: () => {
        const end = performance.now();
        const duration = end - start;
        
        if (label) {
          console.log(`${label}: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    };
  }
};

// React performance hooks
export const usePerformanceMonitor = (componentName: string) => {
  const timer = performanceUtils.createTimer(`${componentName} render`);
  
  return {
    endRender: () => timer.end()
  };
};

// Image loading performance
export const imagePerformance = {
  // Preload images
  preloadImages: (urls: string[]): Promise<void[]> => {
    return Promise.all(
      urls.map(url => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  },

  // Lazy load images with intersection observer
  lazyLoadImages: (selector: string = 'img[data-src]') => {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll(selector);
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
};

// Bundle size monitoring
export const bundleSize = {
  // Get current bundle size (approximate)
  getCurrentSize: (): number => {
    if (typeof window === 'undefined') return 0;
    
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('_next/static')) {
        // This is a rough estimate - in reality you'd need to fetch the actual file size
        totalSize += 100000; // Assume 100KB per script
      }
    });
    
    return totalSize;
  },

  // Monitor bundle size changes
  monitorSize: (callback: (size: number) => void) => {
    if (typeof window === 'undefined') return;
    
    const checkSize = () => {
      const size = bundleSize.getCurrentSize();
      callback(size);
    };
    
    // Check on load
    checkSize();
    
    // Check on route changes (for SPA)
    window.addEventListener('popstate', checkSize);
    
    return () => {
      window.removeEventListener('popstate', checkSize);
    };
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  // Get memory usage (if available)
  getMemoryUsage: (): any => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }
    
    return (performance as any).memory;
  },

  // Monitor memory usage
  monitorMemory: (callback: (usage: any) => void) => {
    if (typeof window === 'undefined') return;
    
    const checkMemory = () => {
      const usage = memoryMonitor.getMemoryUsage();
      if (usage) {
        callback(usage);
      }
    };
    
    // Check every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    
    return () => clearInterval(interval);
  }
};

// Network performance
export const networkPerformance = {
  // Get connection info
  getConnectionInfo: (): any => {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
      return null;
    }
    
    return (navigator as any).connection;
  },

  // Monitor network changes
  onNetworkChange: (callback: (connection: any) => void) => {
    if (typeof window === 'undefined') return;
    
    const connection = networkPerformance.getConnectionInfo();
    if (connection) {
      connection.addEventListener('change', () => callback(connection));
    }
  }
};

// Performance metrics collection
export const metrics = {
  // Collect Web Vitals
  collectWebVitals: () => {
    if (typeof window === 'undefined') return;
    
    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  },

  // Custom metrics
  customMetrics: new Map<string, number>(),

  // Record custom metric
  recordMetric: (name: string, value: number) => {
    metrics.customMetrics.set(name, value);
  },

  // Get all metrics
  getAllMetrics: () => {
    return Object.fromEntries(metrics.customMetrics);
  }
};

// Performance optimization utilities
export const optimization = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memoize function
  memoize: <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map();
    
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      
      return result;
    }) as T;
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // Collect Web Vitals
  metrics.collectWebVitals();
  
  // Monitor memory usage
  memoryMonitor.monitorMemory((usage) => {
    console.log('Memory usage:', usage);
  });
  
  // Monitor network changes
  networkPerformance.onNetworkChange((connection) => {
    console.log('Network changed:', connection);
  });
};