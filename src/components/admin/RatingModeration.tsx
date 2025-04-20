
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Ban, Flag, ShieldCheck } from 'lucide-react';

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
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          profiles:user_id(display_name),
          portfolios:item_id(title)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDeleteRating = async (id: string, userId: string) => {
    const { error } = await supabase
      .from('ratings')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) {
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
                onClick={() => handleDeleteRating(rating.id, rating.user_id)}
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
