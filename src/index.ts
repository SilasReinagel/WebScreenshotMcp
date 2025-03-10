import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

// Create an MCP server
const server = new McpServer({
  name: "WebScreenshot",
  version: "0.1.0"
});

// Add the screenshot tool
server.tool("screenshot",
  "Capture a screenshot of a webpage, with optional scaling and image quality settings. Returns a base64-encoded, gzipped image.",
  {
    url: z.string().url().describe('The URL of the webpage to capture'),
    shotWidth: z.number().optional().default(1920).describe('Viewport width in pixels (default: 1920)'),
    shotHeight: z.number().optional().default(1080).describe('Viewport height in pixels (default: 1080)'),
    scale: z.number().min(0.1).max(1).optional().default(1).describe('Scale factor for the output image (0.1 to 1.0, default: 1.0)'),
    imageType: z.enum(['jpeg', 'png']).optional().default('jpeg').describe('Output image format (default: jpeg)'),
    quality: z.number().min(0).max(100).optional().default(80).describe('Image quality for JPEG format, 1-100 (default: 80)')
  },
  async ({ url, shotWidth, shotHeight, scale, imageType, quality }) => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: shotWidth, height: shotHeight });
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      const screenshot = await page.screenshot({
        type: imageType,
        quality: imageType === 'jpeg' ? quality : undefined,
        fullPage: false
      });

      // Process the image with Sharp if scaling is needed
      let processedImage = screenshot;
      if (scale < 1) {
        const resizedWidth = Math.round(shotWidth * scale);
        const resizedHeight = Math.round(shotHeight * scale);
        
        const sharpInstance = sharp(screenshot)
          .resize(resizedWidth, resizedHeight, {
            kernel: 'lanczos3',
            fit: 'fill'
          });

        if (imageType === 'jpeg') {
          processedImage = await sharpInstance
            .jpeg({ quality })
            .toBuffer();
        } else {
          processedImage = await sharpInstance
            .png()
            .toBuffer();
        }
      }
      
      const compressed = await gzipAsync(processedImage);
      const base64Data = compressed.toString('base64');
      
      return {
        content: [{ 
          type: "text", 
          text: base64Data,
          imageType: imageType,
        }]
      };
    } finally {
      await browser.close();
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);