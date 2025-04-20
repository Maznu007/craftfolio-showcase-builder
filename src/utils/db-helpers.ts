
import { supabase } from "@/integrations/supabase/client";

export async function executeSql<T>(query: string): Promise<T[]> {
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: query
    });

    if (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }

    // Handle different response formats:
    // 1. Array of results - most common
    // 2. Single row result
    // 3. Empty or null result
    if (Array.isArray(data)) {
      return data as T[];
    } else if (data && typeof data === 'object') {
      return [data as T];
    } else if (data === null) {
      console.log('No data returned from query');
      return [];
    } else {
      console.log('Unexpected data format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error in executeSql:', error);
    throw error;
  }
}
