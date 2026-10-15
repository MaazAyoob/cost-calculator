import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

import fs from 'fs';
import http from 'http';

// Helper plugin to ensure generated hero house render is in src/assets and public/
function heroAssetSyncPlugin() {
  const sync = () => {
    const srcPath = 'C:\\Users\\Avita\\.gemini\\antigravity-ide\\brain\\4c8fdd8b-8385-4493-9368-8705cb3a117a\\hero_house_render_1792063450751.jpg';
    const assetsDir = path.resolve(__dirname, 'src/assets');
    const destAssets = path.resolve(assetsDir, 'hero-house-render.jpg');
    const destPublic = path.resolve(__dirname, 'public/hero-house-render.jpg');
    try {
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      if (fs.existsSync(srcPath)) {
        if (!fs.existsSync(destAssets)) {
          fs.copyFileSync(srcPath, destAssets);
          console.log('[heroAssetSyncPlugin] Copied to src/assets/hero-house-render.jpg');
        }
        if (!fs.existsSync(destPublic)) {
          fs.copyFileSync(srcPath, destPublic);
        }
      }
    } catch (err: any) {
      console.warn('[heroAssetSyncPlugin] Sync error:', err.message);
    }
  };

  return {
    name: 'hero-asset-sync',
    buildStart() {
      sync();
    },
    configureServer() {
      sync();
    }
  };
}

// Helper plugin to mock/handle API requests in dev mode when backend port 4000 is not running
function viteDevApiPlugin() {
  const users: Record<string, any> = {
    'demo@hutty.in': {
      id: 'usr_demo_001',
      name: 'Priya Sharma',
      email: 'demo@hutty.in',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
    },
  };

  const projects: Record<string, any> = {
    'proj_demo_001': {
      id: 'proj_demo_001',
      name: 'Koramangala 3BHK Duplex',
      ownerId: 'usr_demo_001',
      city: 'Bangalore',
      authority: 'BBMP/BDA',
      status: 'SAVED',
      configuration: {
        plotLength: 30,
        plotWidth: 40,
        floors: 2,
        houseType: 'Duplex',
        parkingType: 'Normal Ground',
        carCount: 1,
        bikeCount: 2,
        evCharging: true,
        liftRequired: false,
        roomsJson: {},
        qualityTier: 'Premium',
        materialBrands: {},
      },
      calculation: {
        totalBUASqFt: 2400,
        totalCostINR: 5280000,
        costPerSqFt: 2200,
        timelineMonths: 9,
      },
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  };

  const orders = [
    {
      id: 'ord_demo_001',
      reference: 'HUT-ORD-2026-9021',
      type: 'PDF_ESTIMATE',
      productName: '₹99 PDF Estimate Download',
      amountINR: 99,
      status: 'PAID',
      gateway: 'RAZORPAY',
      gatewayPaymentId: 'pay_HuttySim_99_01',
      date: '12 Oct 2026',
      projectName: 'Koramangala 3BHK Duplex',
      projectId: 'proj_demo_001',
    },
  ];

  const reports = [
    {
      id: 'rep_demo_001',
      featureCode: 'PDF_ESTIMATE',
      reportTitle: '₹99 Verified PDF Cost Estimate',
      tierCode: 'BASIC_PDF',
      amountPaidINR: 99,
      projectId: 'proj_demo_001',
      projectName: 'Koramangala 3BHK Duplex',
      city: 'Bangalore',
      active: true,
      unlockedAt: '12 Oct 2026',
      downloadUrl: '#',
    },
  ];

  const consultations = [
    {
      id: 'cns_demo_001',
      publicReference: 'HUT-CNS-8812',
      topic: 'Structural & Vastu Alignment Review',
      status: 'CONFIRMED',
      preferredDate: '2026-10-22',
      preferredTime: '11:00 AM - 12:00 PM',
      confirmedDateTime: '2026-10-22T11:00:00+05:30',
      amountINR: 1499,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      consultant: {
        name: 'Ar. Rajesh Malhotra',
        title: 'Principal Residential Architect & BBMP Specialist',
        category: 'Architectural Review',
        profileImage: '',
      },
      paymentStatus: 'PAID',
    },
  ];

  function parseJsonBody(req: any): Promise<any> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  }

  function sendJson(res: any, statusCode: number, data: any) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }

  let backendOnline: boolean | null = null;
  let lastHealthCheck = 0;

  function isBackendActive(): Promise<boolean> {
    const now = Date.now();
    if (backendOnline !== null && now - lastHealthCheck < 3000) {
      return Promise.resolve(backendOnline);
    }
    return new Promise((resolve) => {
      const req = http.get('http://127.0.0.1:4000/api/v1/health', { timeout: 800 }, (res) => {
        backendOnline = res.statusCode === 200;
        lastHealthCheck = Date.now();
        resolve(backendOnline);
      });
      req.on('error', () => {
        backendOnline = false;
        lastHealthCheck = Date.now();
        resolve(false);
      });
      req.on('timeout', () => {
        req.destroy();
        backendOnline = false;
        lastHealthCheck = Date.now();
        resolve(false);
      });
    });
  }

  return {
    name: 'vite-dev-api-mock',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url || '';
        const method = req.method || 'GET';

        // Check if this is an API route
        if (!url.startsWith('/api/')) {
          return next();
        }

        // If backend port 4000 is active, pass-through so real PostgreSQL backend handles requests
        const isBackendUp = await isBackendActive();
        if (isBackendUp) {
          return next();
        }

        // Clean query string
        const [pathOnly] = url.split('?');

        // 1. Auth Registration
        if (pathOnly === '/api/v1/auth/register' && method === 'POST') {
          const body = await parseJsonBody(req);
          const email = (body.email || '').toLowerCase().trim();
          if (!email || !body.password) {
            return sendJson(res, 400, { success: false, error: 'Email and password are required' });
          }
          const user = {
            id: `usr_${Date.now()}`,
            name: body.name || 'Hutty Customer',
            email,
            phone: body.phone || null,
            role: 'CUSTOMER',
            createdAt: new Date().toISOString(),
          };
          users[email] = user;
          return sendJson(res, 201, {
            success: true,
            token: `dev_jwt_token_${user.id}`,
            user,
          });
        }

        // 2. Auth Login
        if (pathOnly === '/api/v1/auth/login' && method === 'POST') {
          const body = await parseJsonBody(req);
          const email = (body.email || '').toLowerCase().trim();
          let user = users[email];
          if (!user) {
            // Provision customer user seamlessly in dev
            user = {
              id: `usr_${Date.now()}`,
              name: email.split('@')[0],
              email,
              phone: null,
              role: 'CUSTOMER',
              createdAt: new Date().toISOString(),
            };
            users[email] = user;
          }
          return sendJson(res, 200, {
            success: true,
            token: `dev_jwt_token_${user.id}`,
            user,
          });
        }

        // 3. Auth Profile Me
        if (pathOnly === '/api/v1/auth/me' && method === 'GET') {
          const user = Object.values(users)[0] || {
            id: 'usr_guest',
            name: 'Hutty Homeowner',
            email: 'homeowner@hutty.in',
            role: 'CUSTOMER',
          };
          return sendJson(res, 200, { success: true, user });
        }

        // 4. Auth Profile Update
        if (pathOnly === '/api/v1/auth/profile' && method === 'PUT') {
          const body = await parseJsonBody(req);
          const currentUser = Object.values(users)[0] || { id: 'usr_1', email: 'user@hutty.in' };
          currentUser.name = body.name || currentUser.name;
          currentUser.phone = body.phone || currentUser.phone;
          return sendJson(res, 200, { success: true, user: currentUser });
        }

        // 5. Auth Password Recovery
        if (pathOnly === '/api/v1/auth/forgot-password' && method === 'POST') {
          return sendJson(res, 200, {
            success: true,
            message: 'If an account exists with this email, password recovery instructions have been sent.',
            resetToken: 'dev_reset_token_test',
          });
        }

        if (pathOnly === '/api/v1/auth/reset-password' && method === 'POST') {
          return sendJson(res, 200, {
            success: true,
            message: 'Your password has been successfully reset. You may now log in.',
          });
        }

        // 6. Projects Listing & Creation
        if (pathOnly === '/api/v1/projects') {
          if (method === 'GET') {
            return sendJson(res, 200, { success: true, data: Object.values(projects) });
          }
          if (method === 'POST') {
            const body = await parseJsonBody(req);
            const id = `proj_${Date.now()}`;
            const newProj = {
              id,
              name: body.name || 'My Home Project',
              ownerId: 'usr_current',
              city: body.city || 'Bangalore',
              authority: body.authority || 'BBMP/BDA',
              status: 'SAVED',
              configuration: body.configuration || {},
              calculation: body.calculation || {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            projects[id] = newProj;
            return sendJson(res, 201, { success: true, data: newProj });
          }
        }

        // 7. Project Detail, Update, Delete
        const projectMatch = pathOnly.match(/^\/api\/v1\/projects\/([^/]+)$/);
        if (projectMatch) {
          const id = projectMatch[1];
          if (method === 'GET') {
            const proj = projects[id] || {
              id,
              name: 'My Home Project',
              city: 'Bangalore',
              authority: 'BBMP/BDA',
              status: 'SAVED',
              configuration: {},
              calculation: {},
              updatedAt: new Date().toISOString(),
            };
            return sendJson(res, 200, { success: true, data: proj });
          }
          if (method === 'PUT') {
            const body = await parseJsonBody(req);
            const existing = projects[id] || { id, name: body.name || 'My Home Project' };
            existing.configuration = body.configuration || existing.configuration;
            existing.calculation = body.calculation || existing.calculation;
            existing.updatedAt = new Date().toISOString();
            projects[id] = existing;
            return sendJson(res, 200, { success: true, data: existing });
          }
          if (method === 'DELETE') {
            delete projects[id];
            return sendJson(res, 200, { success: true, message: 'Project removed successfully' });
          }
        }

        // 8. Project Rename
        const renameMatch = pathOnly.match(/^\/api\/v1\/projects\/([^/]+)\/rename$/);
        if (renameMatch && method === 'PATCH') {
          const id = renameMatch[1];
          const body = await parseJsonBody(req);
          const existing = projects[id] || { id, name: 'Home Project' };
          existing.name = body.name || existing.name;
          existing.updatedAt = new Date().toISOString();
          projects[id] = existing;
          return sendJson(res, 200, { success: true, data: existing });
        }

        // 9. Customer Account Overview, Purchases, Reports, Consultations
        if (pathOnly === '/api/v1/account/overview' && method === 'GET') {
          return sendJson(res, 200, {
            success: true,
            data: {
              user: Object.values(users)[0] || { id: 'usr_1', name: 'Homeowner', email: 'user@hutty.in' },
              metrics: {
                projectsCount: Object.keys(projects).length,
                reportsCount: reports.length,
                ordersCount: orders.length,
                consultationsCount: consultations.length,
              },
            },
          });
        }

        if (pathOnly === '/api/v1/account/purchases' && method === 'GET') {
          return sendJson(res, 200, { success: true, data: orders });
        }

        if (pathOnly === '/api/v1/account/reports' && method === 'GET') {
          return sendJson(res, 200, { success: true, data: reports });
        }

        if (pathOnly === '/api/v1/account/consultations' && method === 'GET') {
          return sendJson(res, 200, { success: true, data: consultations });
        }
        // Default pass-through to proxy for other routes
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), heroAssetSyncPlugin(), viteDevApiPlugin()],
  envPrefix: ['VITE_', 'DEVELOPMENT_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
          'vendor-animation': ['framer-motion', 'gsap'],
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['@react-pdf/renderer'],
        },
      },
    },
  },
});

