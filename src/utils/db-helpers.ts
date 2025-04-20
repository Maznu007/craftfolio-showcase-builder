
import { supabase } from "@/integrations/supabase/client";

export async function executeSql<T>(query: string): Promise<T[]> {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: query
  });

  if (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }

  return data as T[];
}
