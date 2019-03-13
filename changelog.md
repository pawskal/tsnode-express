# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
### Changed
#### Breaking changes

## 0.1.0 - 2019-13-03
### Added
Add `inject` method, so now we can inject services without `@Service` decorator
When `inject` called as factory callcack can be async
Addes tests for inject functionality
Add `use` method with wrap `express.use` for more comfortalbe buildind application
### Changed
Refactor application: app methods can build chain
start methos is async now
so congigs can be loaded asynchronuasly
refactored example
refactored docs
Changeg package version

#### Breaking changes
start methos is async now
useConfig is async now 

## 0.0.9 - 2019-03-03
### Added
Add controller getter to apication instance
### Changed
Refactor auth
Removed AuthMiddleware class
Removed dist folder
Refactor middleware injection
#### Breaking changes

## 0.0.8 - 2019-03-02
### Added
### Changed
Hot fix config provider not required
#### Breaking changes

## 0.0.7 - 2019-03-01
### Added
Add logger with log levels
Add http errors lib
### Changed
Allow to override error handling methods
#### Breaking changes
Require verify function works async
 
## 0.0.6 - 2019-02-08
### Added
Add support for event sourcing
### Changed
#### Breaking changes
 "After" hook should always close response

## 0.0.4 - 2018-10-09
### Added
Docs for authorization mechanism
### Changed