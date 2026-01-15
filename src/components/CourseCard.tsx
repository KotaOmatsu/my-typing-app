import React from 'react';
import Image from 'next/image';
import { Course } from '@/types/typing';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  onToggleFavorite?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect, onToggleFavorite }) => {
  // Map difficulty to Badge variants
  // Easy -> Secondary (subtle)
  // Normal -> Default (Primary)
  // Hard -> Destructive (Alert/Red)
  const difficultyVariant = {
    Easy: 'secondary',
    Normal: 'default',
    Hard: 'destructive',
  }[course.difficulty] as 'secondary' | 'default' | 'destructive' || 'secondary';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(course.id);
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group relative"
      onClick={() => onSelect(course)}
    >
      <div className="h-32 bg-muted flex items-center justify-center relative">
        {course.thumbnail ? (
          <Image 
            src={course.thumbnail} 
            alt={course.title} 
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-4xl">⌨️</span>
        )}
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <Button
            variant="secondary"
            size="icon"
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md z-10 bg-background/80 hover:bg-background"
            title={course.isFavorite ? "お気に入り解除" : "お気に入り登録"}
            aria-label={course.isFavorite ? "お気に入り解除" : "お気に入り登録"}
          >
             <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ${course.isFavorite ? 'text-pink-500 fill-current' : 'text-muted-foreground'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Button>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-1">
          <Badge variant={difficultyVariant}>
            {course.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-xl line-clamp-1">{course.title}</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {course.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 justify-end">
         <span className="text-primary text-sm font-semibold group-hover:underline">
          選択する →
        </span>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;