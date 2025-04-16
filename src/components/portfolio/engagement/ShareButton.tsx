
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Portfolio } from '@/types/portfolio';

interface ShareButtonProps {
  portfolio: Portfolio;
}

const ShareButton: React.FC<ShareButtonProps> = ({ portfolio }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const portfolioUrl = `${window.location.origin}/community?portfolio=${portfolio.id}`;
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      
      toast({
        title: "Link copied!",
        description: "Portfolio link has been copied to clipboard."
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Failed to copy link",
        description: "Please try manually copying the URL.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleShare}
      className="flex items-center gap-2"
    >
      {copied ? <Link className="h-4 w-4 text-green-600" /> : <Share className="h-4 w-4" />}
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </Button>
  );
};

export default ShareButton;
