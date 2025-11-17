# Changelog

All notable changes to the Baby Milk Tracker Alexa Skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-15

### Added

#### Core Features
- Initial release of Baby Milk Tracker Alexa Skill
- Support for registering three types of feedings:
  - Breastfeeding (toma de pecho)
  - Bottle with breast milk (biberón con leche materna)
  - Bottle with formula (biberón con fórmula)
- Optional amount specification for bottle feedings (in milliliters)
- Confirmation flow for all feedings (Yes/No intent handling)
- Query last feeding with details
- Daily summary of all feedings with counts by type and total volume

#### Internationalization
- Full Spanish (es-ES) support as primary language
- English (en-US) support prepared for international use
- Localization system with interceptors for easy language expansion
- Separate interaction models for each locale

#### Data Storage
- Google Sheets integration for data persistence
- Automatic timestamp recording for each feeding
- Structured data format: Timestamp, Type, Amount, Duration, Notes
- Service account authentication for secure API access

#### Developer Features
- Modular handler architecture (basic, feeding, query)
- Request interceptor for localization
- Comprehensive error handling
- Environment variable configuration for credentials
- Local testing script
- CloudWatch logging support

#### Documentation
- Complete README with setup instructions
- Quick Start guide for fast deployment
- Detailed troubleshooting section
- Code comments and JSDoc documentation
- Example environment variables file
- .gitignore for security

### Technical Details

#### Dependencies
- ask-sdk-core: ^2.14.0
- ask-sdk-model: ^1.42.0
- googleapis: ^128.0.0

#### Supported Platforms
- AWS Lambda (Node.js 18.x)
- Alexa-enabled devices
- Alexa mobile app

#### Locales
- es-ES (Spanish - Spain)
- en-US (English - United States)

### Security
- Google Service Account authentication
- Environment variable protection for credentials
- No third-party data sharing
- Local data storage in user's Google account

---

## [Unreleased]

### Future Enhancements
- Duration tracking for breastfeeding sessions
- Left/right breast tracking
- Diaper change tracking
- Sleep tracking
- Weekly and monthly summary reports
- Data export to CSV
- Feeding reminders
- Multi-baby support
- Voice-activated timer for breastfeeding duration
- Integration with smart baby monitors
- Mobile companion app
- Visualization dashboard

---

## Version History

- **1.0.0** - Initial release (2025-11-15)
