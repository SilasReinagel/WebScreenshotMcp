# Web Screenshot MCP Server

This server provides a simple way to capture screenshots of web pages directly from within Cursor. It enables AI-assisted web content analysis and visual reference workflows.

## Overview

The MCP server provides a screenshot tool that allows Cursor AI to capture images of web pages at specified dimensions and quality settings. The server uses Puppeteer to render web pages and returns compressed image data.

## Setup

Add this MCP Tool following the instructions https://docs.cursor.com/context/model-context-protocol

NOTE: Find your own paths. Use absolute paths for current version of Cursor.

### Basic Instructions

1. Go to Cursor Settings > Features > MCP
2. Click on the + Add New MCP Server button.
3. Enter the following information:
   ```
   Name: "Web Screenshot"
   Type: "command"
   Command: "node /path/to/mcps/web-screenshot-mcp/src/index.js"
   ```
4. Click on the Save button.
5. Verify that the status is "Green". (If it is not, check your paths or restart Cursor)

### Tool Whitelisting

1. Go to Cursor Settings > Features
2. Enable YOLO Mode
3. Add the following to the list of whitelisted tools: 'screenshot'

## Usage

Once configured, the MCP server enables Cursor AI to:

- Capture screenshots of any valid URL
- Customize viewport dimensions (width and height)
- Adjust image quality and format (JPEG or PNG)
- Scale images to reduce file size

The server returns base64-encoded, gzipped image data that can be displayed directly in Cursor.
