
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

    // Make sure we have array data
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data format returned:', data);
      return [];
    }

    return data as T[];
  } catch (error) {
    console.error('Error in executeSql:', error);
    throw error;
  }
}
