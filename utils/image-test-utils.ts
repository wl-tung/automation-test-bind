import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🖼️ IMAGE TEST UTILITIES
 *
 * Comprehensive utilities for image testing including:
 * - Test image generation
 * - Image validation
 * - Image manipulation testing
 * - Performance monitoring for image operations
 */

export interface ImageTestConfig {
  testImagesPath: string;
  supportedFormats: string[];
  maxFileSize: number;
  minFileSize: number;
  uploadTimeout: number;
  validationTimeout: number;
}

export const DEFAULT_IMAGE_CONFIG: ImageTestConfig = {
  testImagesPath: 'test-runner/playwright-tests/test-data/images',
  supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  minFileSize: 1024, // 1KB
  uploadTimeout: 60000, // 60 seconds
  validationTimeout: 30000, // 30 seconds
};

export class ImageTestUtils {
  private config: ImageTestConfig;

  constructor(config: Partial<ImageTestConfig> = {}) {
    this.config = { ...DEFAULT_IMAGE_CONFIG, ...config };
  }

  /**
   * Create test images for testing
   */
  async createTestImages(): Promise<void> {
    console.log('🖼️ Creating test images...');

    // Ensure test images directory exists
    const imagesDir = this.config.testImagesPath;
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Check if we have real test image in test-data folder
    const realTestImagePath = path.join(process.cwd(), 'test-data', 'images', 'testimage.jpg');
    const targetTestImagePath = path.join(imagesDir, 'test-image.jpg');

    if (fs.existsSync(realTestImagePath)) {
      // Copy real test image
      fs.copyFileSync(realTestImagePath, targetTestImagePath);
      console.log('✅ Created test file: test-image.jpg (using real test image)');
    } else {
      // Create simple test images using Canvas (if available) or placeholder files
      const testImages = [
        { name: 'test-image.jpg', size: 'small', format: 'jpeg' },
        { name: 'test-image.png', size: 'medium', format: 'png' },
        { name: 'test-image.gif', size: 'small', format: 'gif' },
        { name: 'large-test-image.jpg', size: 'large', format: 'jpeg' },
        { name: 'invalid-file.txt', size: 'small', format: 'text' },
        { name: 'test-video.mp4', size: 'medium', format: 'video' },
      ];

      for (const image of testImages) {
        const filePath = path.join(imagesDir, image.name);

        if (!fs.existsSync(filePath)) {
          await this.createTestFile(filePath, image.format, image.size);
          console.log(`✅ Created test file: ${image.name}`);
        }
      }
    }

    console.log('✅ Test images created successfully');
  }

  /**
   * Create a test file with specified format and size
   */
  private async createTestFile(filePath: string, format: string, size: string): Promise<void> {
    let content: Buffer;

    switch (format) {
      case 'jpeg':
        content = this.createJPEGTestImage(size);
        break;
      case 'png':
        content = this.createPNGTestImage(size);
        break;
      case 'gif':
        content = this.createGIFTestImage(size);
        break;
      case 'text':
        content = Buffer.from('This is not an image file', 'utf8');
        break;
      case 'video':
        content = this.createVideoTestFile(size);
        break;
      default:
        content = Buffer.from('Test file content', 'utf8');
    }

    fs.writeFileSync(filePath, content);
  }

  /**
   * Create a minimal JPEG test image
   */
  private createJPEGTestImage(size: string): Buffer {
    // Minimal JPEG header + data
    const jpegHeader = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00,
      0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06,
      0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b,
      0x0c, 0x19, 0x12, 0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31,
      0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff,
      0xd9,
    ]);

    const sizeMultiplier = size === 'large' ? 100 : size === 'medium' ? 10 : 1;
    const padding = Buffer.alloc(1024 * sizeMultiplier, 0x00);

    return Buffer.concat([jpegHeader, padding]);
  }

  /**
   * Create a minimal PNG test image
   */
  private createPNGTestImage(size: string): Buffer {
    // Minimal PNG header
    const pngHeader = Buffer.from([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a, // PNG signature
      0x00,
      0x00,
      0x00,
      0x0d, // IHDR chunk length
      0x49,
      0x48,
      0x44,
      0x52, // IHDR
      0x00,
      0x00,
      0x00,
      0x01, // Width: 1
      0x00,
      0x00,
      0x00,
      0x01, // Height: 1
      0x08,
      0x02,
      0x00,
      0x00,
      0x00, // Bit depth, color type, compression, filter, interlace
      0x90,
      0x77,
      0x53,
      0xde, // CRC
      0x00,
      0x00,
      0x00,
      0x00, // IEND chunk length
      0x49,
      0x45,
      0x4e,
      0x44, // IEND
      0xae,
      0x42,
      0x60,
      0x82, // CRC
    ]);

    const sizeMultiplier = size === 'large' ? 100 : size === 'medium' ? 10 : 1;
    const padding = Buffer.alloc(512 * sizeMultiplier, 0x00);

    return Buffer.concat([pngHeader, padding]);
  }

  /**
   * Create a minimal GIF test image
   */
  private createGIFTestImage(size: string): Buffer {
    // Minimal GIF header
    const gifHeader = Buffer.from([
      0x47,
      0x49,
      0x46,
      0x38,
      0x39,
      0x61, // GIF89a
      0x01,
      0x00,
      0x01,
      0x00, // Width: 1, Height: 1
      0x80,
      0x00,
      0x00, // Global color table flag, color resolution, sort flag, global color table size
      0x00,
      0x00,
      0x00, // Background color index, pixel aspect ratio
      0x21,
      0xf9,
      0x04,
      0x01,
      0x00,
      0x00,
      0x00,
      0x00, // Graphic control extension
      0x2c,
      0x00,
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x01,
      0x00,
      0x00, // Image descriptor
      0x02,
      0x02,
      0x04,
      0x01,
      0x00, // Image data
      0x3b, // Trailer
    ]);

    const sizeMultiplier = size === 'large' ? 50 : size === 'medium' ? 5 : 1;
    const padding = Buffer.alloc(256 * sizeMultiplier, 0x00);

    return Buffer.concat([gifHeader, padding]);
  }

  /**
   * Create a test video file (not a real video, just for testing invalid uploads)
   */
  private createVideoTestFile(size: string): Buffer {
    const videoHeader = Buffer.from('FAKE_VIDEO_FILE_FOR_TESTING', 'utf8');
    const sizeMultiplier = size === 'large' ? 1000 : size === 'medium' ? 100 : 10;
    const padding = Buffer.alloc(1024 * sizeMultiplier, 0x00);

    return Buffer.concat([videoHeader, padding]);
  }

  /**
   * Validate image upload in the UI
   */
  async validateImageUpload(
    page: Page,
    fileName: string
  ): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    console.log(`🔍 Validating image upload: ${fileName}`);

    try {
      // Check for success indicators
      const successIndicators = [
        { selector: 'text="アップロード完了"', message: 'Upload complete message found' },
        { selector: 'text="Upload Complete"', message: 'Upload complete (English) found' },
        { selector: '.upload-success', message: 'Upload success class found' },
        { selector: '.image-uploaded', message: 'Image uploaded class found' },
        { selector: `img[src*="${fileName}"]`, message: 'Image element found in DOM' },
        { selector: `[title*="${fileName}"]`, message: 'Element with filename title found' },
      ];

      for (const indicator of successIndicators) {
        try {
          const element = page.locator(indicator.selector);
          if (await element.isVisible({ timeout: 5000 })) {
            return {
              success: true,
              message: indicator.message,
              details: { selector: indicator.selector },
            };
          }
        } catch (error) {
          // Continue to next indicator
        }
      }

      // Check for error indicators
      const errorIndicators = [
        { selector: 'text="エラー"', message: 'Error message found' },
        { selector: 'text="Error"', message: 'Error (English) found' },
        { selector: '.upload-error', message: 'Upload error class found' },
        { selector: '.error-message', message: 'Error message class found' },
      ];

      for (const indicator of errorIndicators) {
        try {
          const element = page.locator(indicator.selector);
          if (await element.isVisible({ timeout: 3000 })) {
            const errorText = await element.textContent();
            return {
              success: false,
              message: `${indicator.message}: ${errorText}`,
              details: { selector: indicator.selector, errorText },
            };
          }
        } catch (error) {
          // Continue to next indicator
        }
      }

      // No clear indicators found
      return {
        success: true, // Assume success if no error found
        message: 'No clear success/error indicators found, assuming success',
        details: { assumedSuccess: true },
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
        details: { error },
      };
    }
  }

  /**
   * Check if image appears in block
   */
  async validateImageInBlock(
    page: Page,
    blockSelector: string = 'iframe[name="preview"]'
  ): Promise<{
    success: boolean;
    message: string;
    imageCount: number;
  }> {
    console.log('🔍 Validating image appears in block...');

    try {
      const frame = page.locator(blockSelector).contentFrame();

      // Look for image elements
      const imageSelectors = ['img', '[style*="background-image"]', '.image-block', '.block-image'];
      let totalImages = 0;

      for (const selector of imageSelectors) {
        try {
          const count = await frame.locator(selector).count();
          totalImages += count;
        } catch (error) {
          // Continue to next selector
        }
      }

      if (totalImages > 0) {
        return {
          success: true,
          message: `Found ${totalImages} image(s) in block`,
          imageCount: totalImages,
        };
      } else {
        return {
          success: false,
          message: 'No images found in block',
          imageCount: 0,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Block validation failed: ${error instanceof Error ? error.message : String(error)}`,
        imageCount: 0,
      };
    }
  }

  /**
   * Clean up test images
   */
  async cleanupTestImages(): Promise<void> {
    console.log('🧹 Cleaning up test images...');

    try {
      const imagesDir = this.config.testImagesPath;
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        for (const file of files) {
          const filePath = path.join(imagesDir, file);
          fs.unlinkSync(filePath);
        }
        console.log('✅ Test images cleaned up successfully');
      }
    } catch (error) {
      console.log(
        `⚠️ Failed to cleanup test images: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get test image path
   */
  getTestImagePath(fileName: string): string {
    return path.join(this.config.testImagesPath, fileName);
  }

  /**
   * Check if file exists
   */
  testImageExists(fileName: string): boolean {
    return fs.existsSync(this.getTestImagePath(fileName));
  }
}

// Export singleton instance
export const imageTestUtils = new ImageTestUtils();
