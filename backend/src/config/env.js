import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');
const defaultClientUrls = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

dotenv.config({ path: path.join(backendRoot, '.env') });

function readModelList() {
  const models = [process.env.AI_MODEL, process.env.AI_FALLBACK_MODELS]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((model) => model.trim().replace(/^models\//, ''))
    .filter(Boolean);

  return [...new Set(models)];
}

export const config = {
  port: process.env.PORT || 5000,
  clientUrls: [...new Set([
    ...defaultClientUrls,
    ...(process.env.CLIENT_URL || '').split(',').map((url) => url.trim()).filter(Boolean),
  ])],
  mongoUri: (process.env.MONGO_URI || process.env.MONGODB_URI)?.trim(),
  jwtSecret: process.env.JWT_SECRET || 'dev-careeros-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiApiKey: process.env.AI_API_KEY?.trim(),
  aiModels: readModelList().length ? readModelList() : ['gemini-2.0-flash'],
};

config.clientUrl = config.clientUrls[0];

config.aiModel = config.aiModels[0];

if (!config.aiApiKey) {
  console.error('FATAL: AI_API_KEY is not set in environment variables.');
  process.exit(1);
}

// Never run in production with the public default JWT secret — anyone could
// forge a valid token for any user id and pass protect(). Fail fast instead.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET is not set in production. Refusing to start with an insecure default secret.');
  process.exit(1);
}
