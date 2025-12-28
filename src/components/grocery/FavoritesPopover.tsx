import { Star, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FavoriteItem } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoritesPopoverProps {
  favorites: FavoriteItem[];
  onAddToList: (item: FavoriteItem) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesPopover = ({
  favorites,
  onAddToList,
  onRemoveFavorite,
}: FavoritesPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ios-gray"
          size="icon"
          className="shrink-0 shadow-md hover:shadow-lg transition-all relative"
        >
          <Star className="w-5 h-5" />
          {favorites.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-0" 
        align="center"
        side="top"
        sideOffset={12}
      >
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-warning" />
            Quick Add Favorites
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tap to add to your list
          </p>
        </div>
        
        {favorites.length === 0 ? (
          <div className="p-6 text-center">
            <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No favorites yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Long press any item to save as favorite
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="p-2 space-y-1">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl",
                    "bg-secondary/50 hover:bg-secondary transition-colors"
                  )}
                >
                  <button
                    onClick={() => onAddToList(item)}
                    className="flex-1 flex items-center gap-2 text-left"
                  >
                    <Plus className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {item.name}
                      </p>
                      {item.category && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.category}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground shrink-0">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </button>
                  <button
                    onClick={() => onRemoveFavorite(item.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};
