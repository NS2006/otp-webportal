import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import 'dotenv/config';

import * as UserController from './controllers/UserController.js';
import * as StoreController from './controllers/StoreController.js';
import * as ExcelController from './controllers/ExcelController.js';
import * as ResponsibilityController from './controllers/ResponsibilityController.js';
import * as OTPController from './controllers/OTPController.js';
import * as SettingsController from './controllers/SettingsController.js';
import * as IngestController from './controllers/IngestController.js';

import { startOtpCleanupJob } from './jobs/OtpCleanup.js'; 

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());


// User
app.get('/api/user', UserController.getUsers); 
app.post('/api/user', UserController.createUser);
app.delete('/api/user/:id/', UserController.deleteUser);
app.patch('/api/user/:id/status', UserController.toggleUserStatus);
app.patch('/api/user/:id/admin', UserController.toggleAdminStatus);

// Store
app.get('/api/store', StoreController.getStores);
app.post('/api/store', StoreController.createStore);
app.delete('/api/store/:id/', StoreController.deleteStore);

// Responsibility
app.get('/api/user/:id/responsibilities', ResponsibilityController.getUserResponsibilities);
app.put('/api/user/:id/responsibilities', ResponsibilityController.updateUserResponsibilities);

app.get('/api/store/:id/responsibilities', ResponsibilityController.getStoreResponsibilities);
app.put('/api/store/:id/responsibilities', ResponsibilityController.updateStoreResponsibilities);

// OTP
app.get('/api/user/:id/otps/paginated', OTPController.getPaginatedOTPs);
app.post('/api/otp/insert-new-otp', OTPController.insertNewOTP);

// Excel
app.post('/api/excel/sync', ExcelController.importExcel);

// Settings
app.get('/api/settings', SettingsController.getSettings);
app.put('/api/settings', SettingsController.updateSettings);

// Ingest
app.post('/ingest', IngestController.handleIngest);

// Jobs
startOtpCleanupJob();

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'OTP Portal API & Ingest Server is running!' });
});


// Server Listener
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║        OTP Portal & Ingest Server - Started      ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`Server URL : http://localhost:${PORT}`);
  console.log(`Ingest API : http://localhost:${PORT}/ingest`);
  console.log('');
});