'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Pagination from '@/components/admin/Pagination';
import { Trash2 } from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/utils/admin-constants';
import type { Review } from '@/lib/types/database';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = createClient();

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('reviews').select(
        `
          *,
          equipment:equipment(name, images)
        `,
        { count: 'exact' }
      );

      // Search only works on reviews table fields
      if (search) {
        query = query.ilike('comment', `%${search}%`);
      }

      if (ratingFilter) {
        query = query.eq('rating', parseInt(ratingFilter));
      }

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to fetch reviews');
      }

      // Fetch reviewer profiles separately
      if (data && data.length > 0) {
        const reviewerIds = [...new Set(data.map((r) => r.reviewer_id))];
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, name, email, profile_image')
          .in('id', reviewerIds);

        // Map profiles to reviews
        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        const reviewsWithProfiles = data.map((review) => ({
          ...review,
          reviewer: profileMap.get(review.reviewer_id) || null,
        }));

        setReviews(reviewsWithProfiles);
      } else {
        setReviews(data || []);
      }

      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load reviews. Please check your permissions.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ratingFilter, currentPage]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(error.message || 'Failed to delete review');
      }

      alert('Review deleted successfully');
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to delete review. Please check your permissions.';
      alert(errorMessage);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search reviews..."
        filters={[
          {
            label: 'Rating',
            value: ratingFilter,
            options: [
              { label: 'All Ratings', value: '' },
              { label: '5 Stars', value: '5' },
              { label: '4 Stars', value: '4' },
              { label: '3 Stars', value: '3' },
              { label: '2 Stars', value: '2' },
              { label: '1 Star', value: '1' },
            ],
            onChange: setRatingFilter,
          },
        ]}
      />

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="mb-2 text-red-500">{error}</p>
            <button
              onClick={fetchReviews}
              className="admin-btn admin-btn-primary px-4 py-2 text-sm"
            >
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-text-secondary py-8 text-center">No reviews found</p>
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-border hover:bg-background rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 gap-4">
                      {/* Equipment Image */}
                      {review.equipment?.images?.[0] && (
                        <div className="relative h-20 w-20 shrink-0">
                          <Image
                            src={review.equipment.images[0]}
                            alt={review.equipment.name}
                            fill
                            className="rounded object-cover"
                            loading="lazy"
                            sizes="80px"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        {/* Equipment Name */}
                        <h3 className="text-lg font-semibold">{review.equipment?.name || 'N/A'}</h3>

                        {/* Reviewer Info */}
                        <div className="mt-1 flex items-center gap-2">
                          {review.reviewer?.profile_image ? (
                            <div className="relative h-6 w-6 shrink-0">
                              <Image
                                src={review.reviewer.profile_image}
                                alt={review.reviewer.name || ''}
                                fill
                                className="rounded-full object-cover"
                                loading="lazy"
                                sizes="24px"
                              />
                            </div>
                          ) : (
                            <div className="bg-primary/20 flex h-6 w-6 items-center justify-center rounded-full">
                              <span className="text-primary text-xs font-semibold">
                                {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                          <span className="text-text-secondary text-sm">
                            {review.reviewer?.name || 'Anonymous'}
                          </span>
                          <span className="text-text-secondary text-sm">•</span>
                          <span className="text-text-secondary text-sm">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex text-lg">{renderStars(review.rating)}</div>
                          <span className="text-text-secondary text-sm">{review.rating}/5</span>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                          <p className="text-text-secondary mt-3">{review.comment}</p>
                        )}

                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {review.images.slice(0, 4).map((img: string, idx: number) => (
                              <div key={idx} className="relative h-16 w-16 cursor-pointer overflow-hidden rounded hover:opacity-80">
                                <Image
                                  src={img}
                                  alt={`Review ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                  loading="lazy"
                                  sizes="64px"
                                />
                              </div>
                            ))}
                            {review.images.length > 4 && (
                              <div className="text-text-secondary flex h-16 w-16 items-center justify-center rounded bg-gray-200 text-sm">
                                +{review.images.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="admin-btn admin-btn-danger px-3 py-2 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalCount}
            />
          </>
        )}
      </div>
    </div>
  );
}
