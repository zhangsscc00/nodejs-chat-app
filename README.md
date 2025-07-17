
# Node.js Chat App
A real-time chat application built with Node.js, Express, and Socket.io, featuring an advanced customizable word filtering system.

## Features

- Real-time messaging using Socket.io
- Room-based chat functionality
- Advanced customizable word filtering system
- Multiple filtering strategies (block, replace, warn)
- Support for multiple filter categories (profanity, spam, hate speech, etc.)
- Whitelist functionality
- Special rules for spam detection (excessive caps, repeated characters, etc.)
- Admin API for dynamic filter management
- Multiple preset configurations

## Word Filter Features

### Filter Categories
- **Profanity**: Bad language and inappropriate words
- **Political**: Political and sensitive content
- **Spam**: Advertising and promotional content
- **Hate**: Hate speech and discrimination
- **Inappropriate**: Sexual content and drug references
- **Custom**: User-defined categories

### Filter Strategies
- **Block**: Completely block messages containing filtered words
- **Replace**: Replace filtered words with asterisks (*)
- **Warn**: Add warning labels to messages

### Presets
- **Family Friendly**: Filters all inappropriate content
- **Business**: Filters spam and inappropriate content
- **Casual**: Only filters serious violations
- **Gaming**: Allows mild language but filters hate speech

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Filter Management

#### Get Filter Statistics
```bash
GET /api/filter/stats
```

#### Get Available Presets
```bash
GET /api/filter/presets
```

#### Switch Filter Preset
```bash
POST /api/filter/preset
Content-Type: application/json

{
  "preset": "family_friendly"
}
```

#### Add Custom Words
```bash
POST /api/filter/words
Content-Type: application/json

{
  "category": "custom",
  "words": ["badword1", "badword2"]
}
```

#### Remove Words
```bash
DELETE /api/filter/words
Content-Type: application/json

{
  "category": "custom",
  "words": ["badword1"]
}
```

#### Manage Whitelist
```bash
POST /api/filter/whitelist
Content-Type: application/json

{
  "action": "add",
  "words": ["class", "grass"]
}
```

#### Test Filter
```bash
POST /api/filter/test
Content-Type: application/json

{
  "text": "Test message here",
  "categories": ["profanity", "spam"]
}
```

#### Update Configuration
```bash
POST /api/filter/config
Content-Type: application/json

{
  "strategy": "replace",
  "caseSensitive": false,
  "enabledCategories": ["profanity", "spam"]
}
```

## Usage Examples

### Testing the Filter
```bash
# Test a message
curl -X POST http://localhost:3000/api/filter/test \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test message"}'

# Get current statistics
curl http://localhost:3000/api/filter/stats

# Switch to strict mode
curl -X POST http://localhost:3000/api/filter/preset \
  -H "Content-Type: application/json" \
  -d '{"preset": "family_friendly"}'
```

### Customizing the Filter

You can customize the filter by:

1. **Using different presets**: Switch between predefined configurations
2. **Adding custom words**: Add words specific to your community
3. **Managing whitelist**: Allow certain words that might be falsely flagged
4. **Adjusting strategy**: Choose how to handle filtered content

### Configuration File

The filter configuration is located in `src/config/filterConfig.js`. You can modify:

- Word lists for different categories
- Default settings
- Preset configurations
- Special rules for spam detection

## Development

### File Structure
```
src/
├── index.js              # Main server file
├── utils/
│   ├── wordFilter.js     # Custom word filter implementation
│   ├── messages.js       # Message utilities
│   └── users.js          # User management
└── config/
    └── filterConfig.js   # Filter configuration
```

### Running in Development Mode
```bash
npm run dev
```

## License

This project is licensed under the ISC License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions, please open an issue on the GitHub repository.
