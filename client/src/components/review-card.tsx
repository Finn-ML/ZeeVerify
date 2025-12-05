import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Flag, MessageSquare, ThumbsUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Review, User, ReviewResponse } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review & { 
    user?: Partial<User>;
    responses?: (ReviewResponse & { user?: Partial<User> })[];
  };
  showBrandInfo?: boolean;
  onFlag?: (reviewId: string) => void;
  className?: string;
}

export function ReviewCard({ review, showBrandInfo = false, onFlag, className }: ReviewCardProps) {
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "F";
  };

  const isDeletedUser = review.user?.deletedAt != null;
  const displayName = isDeletedUser
    ? "Former User"
    : review.user?.firstName
      ? `${review.user.firstName} ${review.user.lastName?.charAt(0) || ""}.`
      : "Anonymous";

  const getSentimentColor = (sentiment?: string | null) => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Card className={cn("", className)} data-testid={`card-review-${review.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-2 md:w-48 shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={review.user?.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(review.user?.firstName, review.user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium text-sm">
                {displayName}
              </p>
              {review.isVerified && (
                <Badge variant="secondary" className="gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Verified
                </Badge>
              )}
            </div>
            {review.yearsAsFranchisee && (
              <p className="text-xs text-muted-foreground">
                {review.yearsAsFranchisee} years as franchisee
              </p>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-lg">{review.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <StarRating rating={review.overallRating} size="sm" />
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {review.sentiment && (
                <Badge className={cn("capitalize", getSentimentColor(review.sentiment))}>
                  {review.sentiment}
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{review.content}</p>

            {(review.supportRating || review.trainingRating || review.profitabilityRating || review.cultureRating) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t">
                {review.supportRating && (
                  <div className="text-center p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Support</p>
                    <div className="flex justify-center">
                      <StarRating rating={review.supportRating} size="sm" />
                    </div>
                  </div>
                )}
                {review.trainingRating && (
                  <div className="text-center p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Training</p>
                    <div className="flex justify-center">
                      <StarRating rating={review.trainingRating} size="sm" />
                    </div>
                  </div>
                )}
                {review.profitabilityRating && (
                  <div className="text-center p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Profitability</p>
                    <div className="flex justify-center">
                      <StarRating rating={review.profitabilityRating} size="sm" />
                    </div>
                  </div>
                )}
                {review.cultureRating && (
                  <div className="text-center p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Culture</p>
                    <div className="flex justify-center">
                      <StarRating rating={review.cultureRating} size="sm" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {review.responses && review.responses.length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {review.responses.map((response) => (
                  <div
                    key={response.id}
                    className="bg-muted/50 rounded-lg p-4 ml-4 border-l-4 border-primary"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Franchisor Response</span>
                      <span className="text-xs text-muted-foreground">
                        {response.createdAt && formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{response.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                Helpful
              </Button>
              {onFlag && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => onFlag(review.id)}
                  data-testid={`button-flag-review-${review.id}`}
                >
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
