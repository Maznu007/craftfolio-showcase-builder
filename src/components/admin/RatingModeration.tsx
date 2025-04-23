
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Rating {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  rating: number;
  comment: string;
  created_at: string;
  display_name?: string;
  item_title?: string;
}

const RatingModeration = () => {
  const { data: ratings, isLoading, refetch } = useQuery({
    queryKey: ['admin-ratings'],
    queryFn: async () => {
      // Using raw SQL query to get ratings with user and item information
      const { data, error } = await supabase
        .rpc('execute_sql', { 
          sql_query: `
            SELECT r.*, p.display_name, 
            CASE
              WHEN r.item_type = 'portfolio' THEN (SELECT title FROM portfolios WHERE id = r.item_id::uuid)
              ELSE 'Unknown Item'
            END as item_title
            FROM ratings r
            LEFT JOIN profiles p ON p.id = r.user_id
            WHERE r.is_deleted = false
            ORDER BY r.created_at DESC
          `
        });

      if (error) {
        console.error('Error fetching ratings:', error);
        throw error;
      }
      
      return data as Rating[];
    },
  });

  const handleDeleteRating = async (id: string) => {
    // Raw SQL approach to update the rating
    const { error } = await supabase
      .rpc('execute_sql', { 
        sql_query: `UPDATE ratings SET is_deleted = true WHERE id = '${id}' RETURNING id`
      });

    if (error) {
      console.error('Error deleting rating:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete rating",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Rating has been deleted",
    });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings?.map((rating: Rating) => (
        <Card key={rating.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {rating.display_name} rated {rating.item_type}: {rating.item_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm mb-2">
                  Rating: {rating.rating}/5
                </p>
                {rating.comment && (
                  <p className="text-sm text-gray-600">{rating.comment}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Posted on {new Date(rating.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteRating(rating.id)}
              >
                Delete Rating
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RatingModeration;
