/**
 * ViewportService - Handles responsive scaling for mobile landscape
 *
 * Scales the combat screen to fit within the viewport while maintaining
 * aspect ratio for mobile landscape orientation.
 */

// Target dimensions for the game (16:9 landscape)
const TARGET_WIDTH = 960; // Base design width
const TARGET_HEIGHT = 540; // Base design height

class ViewportServiceClass {
  private isInitialized = false;

  /**
   * Initialize viewport scaling
   */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen for orientation changes and resize
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('orientationchange', () => {
      // Delay to let orientation change complete
      setTimeout(() => this.handleResize(), 100);
    });

    // Initial check
    this.handleResize();
  }

  /**
   * Handle viewport resize
   */
  private handleResize(): void {
    const isMobileLandscape = this.isMobileLandscape();

    // Update body class for CSS targeting
    document.body.classList.toggle('mobile-landscape', isMobileLandscape);
    document.body.classList.toggle('mobile-portrait', this.isMobilePortrait());
    document.body.classList.toggle('tablet-landscape', this.isTabletLandscape());

    // Apply scaling for mobile landscape
    if (isMobileLandscape) {
      this.applyMobileLandscapeScaling();
    } else {
      this.removeScaling();
    }

    // Update pile counts in data attributes for CSS pseudo-element
    this.updatePileCounts();
  }

  /**
   * Check if we're in mobile landscape mode
   */
  private isMobileLandscape(): boolean {
    const isLandscape = window.innerWidth > window.innerHeight;
    const isShortHeight = window.innerHeight <= 500;
    return isLandscape && isShortHeight;
  }

  /**
   * Check if we're in mobile portrait mode
   */
  private isMobilePortrait(): boolean {
    const isPortrait = window.innerHeight > window.innerWidth;
    const isNarrow = window.innerWidth <= 600;
    return isPortrait && isNarrow;
  }

  /**
   * Check if we're in tablet landscape mode
   */
  private isTabletLandscape(): boolean {
    const isLandscape = window.innerWidth > window.innerHeight;
    const height = window.innerHeight;
    return isLandscape && height > 500 && height <= 700;
  }

  /**
   * Apply scaling for mobile landscape
   */
  private applyMobileLandscapeScaling(): void {
    const gameContainer = document.getElementById('combat-screen');
    if (!gameContainer) return;

    // Get available viewport size (accounting for safe areas)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate scale factor to fit content
    const scaleX = viewportWidth / TARGET_WIDTH;
    const scaleY = viewportHeight / TARGET_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x to avoid oversizing

    // Apply CSS custom properties for use in stylesheets
    document.documentElement.style.setProperty('--viewport-scale', scale.toString());
    document.documentElement.style.setProperty('--viewport-width', `${viewportWidth}px`);
    document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
  }

  /**
   * Remove scaling
   */
  private removeScaling(): void {
    document.documentElement.style.removeProperty('--viewport-scale');
    document.documentElement.style.removeProperty('--viewport-width');
    document.documentElement.style.removeProperty('--viewport-height');
  }

  /**
   * Update pile counts in data attributes (for CSS pseudo-elements)
   */
  private updatePileCounts(): void {
    const gameContainer = document.getElementById('combat-screen');
    if (!gameContainer) return;

    const drawCount = document.getElementById('draw-count')?.textContent || '0';
    const discardCount = document.getElementById('discard-count')?.textContent || '0';

    gameContainer.setAttribute('data-draw', drawCount);
    gameContainer.setAttribute('data-discard', discardCount);
  }

  /**
   * Force a recalculation of viewport scaling
   */
  recalculate(): void {
    this.handleResize();
  }

  /**
   * Check if currently in mobile landscape mode
   */
  isInMobileLandscape(): boolean {
    return this.isMobileLandscape();
  }

  /**
   * Get current viewport info
   */
  getViewportInfo(): {
    width: number;
    height: number;
    scale: number;
    mode: 'desktop' | 'mobile-landscape' | 'mobile-portrait' | 'tablet-landscape';
  } {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = parseFloat(
      document.documentElement.style.getPropertyValue('--viewport-scale') || '1'
    );

    let mode: 'desktop' | 'mobile-landscape' | 'mobile-portrait' | 'tablet-landscape' = 'desktop';
    if (this.isMobileLandscape()) mode = 'mobile-landscape';
    else if (this.isMobilePortrait()) mode = 'mobile-portrait';
    else if (this.isTabletLandscape()) mode = 'tablet-landscape';

    return { width, height, scale, mode };
  }
}

export const ViewportService = new ViewportServiceClass();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ViewportService.init());
  } else {
    ViewportService.init();
  }
}
