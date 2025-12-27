import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykcvhfouyptqhyluzelb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrY3ZoZm91eXB0cWh5bHV6ZWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTA1OTUsImV4cCI6MjA4MjI4NjU5NX0.xQGld-VXY12gKW3Rzx4TUCQDjiSt1Rah3EYME3ppbJk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
