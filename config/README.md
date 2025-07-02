# Database Configuration

Konfigurasi MongoDB untuk aplikasi Lapor dengan dukungan multi-environment.

## File Konfigurasi

### 1. `database.js` (General)
Konfigurasi dasar MongoDB yang dapat digunakan untuk semua environment.

### 2. `database.development.js` (Development)
Konfigurasi khusus untuk environment development dengan fitur:
- Pool connection yang lebih kecil (5 connections)
- MongoDB debugging enabled
- Helper functions untuk development:
  - `dropDatabase()` - Menghapus database (hanya di development)
  - `getCollections()` - Mendapatkan daftar collections

### 3. `database.production.js` (Production)
Konfigurasi optimal untuk environment production dengan fitur:
- Pool connection yang lebih besar (20 max, 5 min)
- SSL/TLS support
- Compression (zlib)
- Enhanced error handling
- Health check function
- Graceful shutdown handling

### 4. `index.js` (Auto-selector)
File utama yang secara otomatis memilih konfigurasi berdasarkan `NODE_ENV`.

## Penggunaan

### Basic Usage
```javascript
const { connectDB } = require('./config');

// Connect to database
connectDB();
```

### Development Usage
```javascript
const { connectDB, dropDatabase, getCollections } = require('./config');

// Connect to database
connectDB();

// Development helpers (only available in development)
if (process.env.NODE_ENV === 'development') {
  // Drop database
  await dropDatabase();
  
  // Get all collections
  const collections = await getCollections();
  console.log('Collections:', collections);
}
```

### Production Usage
```javascript
const { connectDB, checkDBHealth } = require('./config');

// Connect to database
connectDB();

// Health check endpoint
app.get('/health/db', (req, res) => {
  const health = checkDBHealth();
  res.json(health);
});
```

## Environment Variables

### Required
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production/test)

### Optional (Production)
- `MONGO_SSL` - Enable SSL (true/false)
- `MONGO_SSL_VALIDATE` - Validate SSL certificates (true/false)

## Connection Pool Settings

### Development
- Max Pool Size: 5
- Server Selection Timeout: 5s
- Socket Timeout: 45s

### Production
- Max Pool Size: 20
- Min Pool Size: 5
- Max Idle Time: 30s
- Server Selection Timeout: 10s
- Socket Timeout: 45s
- Connection Timeout: 10s

## Features

### Error Handling
- Comprehensive error logging
- Graceful shutdown on process termination
- Automatic reconnection handling

### Production Optimizations
- Connection pooling
- Write/Read retry logic
- Compression support
- SSL/TLS encryption
- Health monitoring

### Development Features
- Query debugging
- Database utilities
- Enhanced logging
- Development-safe operations

## Best Practices

1. **Environment Separation**: Gunakan database terpisah untuk development dan production
2. **Connection Pooling**: Konfigurasi pool sesuai dengan beban aplikasi
3. **Error Monitoring**: Implementasikan logging dan monitoring untuk production
4. **Security**: Aktifkan SSL/TLS dan authentication untuk production
5. **Graceful Shutdown**: Pastikan koneksi database ditutup dengan benar saat aplikasi berhenti

## Troubleshooting

### Connection Issues
1. Periksa `MONGO_URI` di file `.env`
2. Pastikan MongoDB service berjalan
3. Periksa firewall dan network connectivity
4. Verifikasi credentials dan permissions

### Performance Issues
1. Monitor connection pool usage
2. Adjust timeout settings
3. Enable compression untuk mengurangi bandwidth
4. Optimize query patterns

### Development Issues
1. Enable debugging dengan `mongoose.set('debug', true)`
2. Gunakan helper functions untuk inspeksi database
3. Periksa log untuk error details