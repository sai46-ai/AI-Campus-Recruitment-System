import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../shared/utils/logger';

const k = process.env.GEMINI_API_KEY || '';
if (!k || k === 'AIzaSy_YOUR_GEMINI_API_KEY_HERE') logger.warn('[Gemini AI] GEMINI_API_KEY fallback active.');

export const aiClient = new GoogleGenerativeAI(k || 'dummy_key_for_fallback');
export const GEMINI_MODEL = 'gemini-1.5-flash';
export default aiClient;
