
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujrcfpwsoozunacaeuqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcmNmcHdzb296dW5hY2FldXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MDYzOTksImV4cCI6MjA4NjI4MjM5OX0.qqN9cXANKi9Zx-DRvEMXylx7jfoAe_dSQ8P57iZuHFw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
