# Admin Database Management - Design Skeleton

## Overview
Database administration interface for monitoring and managing database operations.

## Layout Structure

### Header Section
- Page title: "Database Management"
- Refresh button
- Backup button
- Optimize button

### Stats Bar (4 metrics)
1. Database Size
2. Total Tables
3. Total Records
4. Last Backup

### Database Overview
- Connection status
- Database version
- Uptime
- Active connections
- Query performance

### Tables List
Columns:
- Table name
- Row count
- Size
- Last modified
- Actions (View, Optimize, Export)

### Query Console
- SQL query editor
- Execute button
- Query history
- Results table
- Export results

### Backup Management
- Backup list
- Create backup
- Restore backup
- Download backup
- Schedule backups

### Performance Monitoring
- Query performance metrics
- Slow query log
- Connection pool status
- Cache statistics
- Index usage

### Maintenance Tools
- Optimize tables
- Repair tables
- Analyze tables
- Vacuum database
- Clear cache
