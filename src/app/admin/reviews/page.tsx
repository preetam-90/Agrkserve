'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import SearchFilterBar from '@/components/admin/SearchFilterBar';
import Pagination from '@/components/admin/Pagination';
import { Eye, Trash2 } from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/utils/admin-constants';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const supabase = createClient();

    const fetchReviews = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('reviews')
                .select(`
          *,
          equipment:equipment(name, images),
          reviewer:user_profiles!reviewer_id(name, email, profile_image)
        `, { count: 'exact' });

            if (ratingFilter) {
                query = query.eq('rating', parseInt(ratingFilter));
            }

            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + ITEMS_PER_PAGE - 1);

            if (error) throw error;

            setReviews(data || []);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [search, ratingFilter, currentPage]);

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', reviewId);

            if (error) throw error;

            alert('Review deleted successfully');
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
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
            <div className="flex items-center justify-between mb-6">
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
                ) : reviews.length === 0 ? (
                    <p className="text-center py-8 text-text-secondary">No reviews found</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="border border-border rounded-lg p-4 hover:bg-background">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4 flex-1">
                                            {/* Equipment Image */}
                                            {review.equipment?.images?.[0] && (
                                                <img
                                                    src={review.equipment.images[0]}
                                                    alt={review.equipment.name}
                                                    className="w-20 h-20 rounded object-cover"
                                                />
                                            )}

                                            <div className="flex-1">
                                                {/* Equipment Name */}
                                                <h3 className="font-semibold text-lg">{review.equipment?.name || 'N/A'}</h3>

                                                {/* Reviewer Info */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    {review.reviewer?.profile_image ? (
                                                        <img
                                                            src={review.reviewer.profile_image}
                                                            alt={review.reviewer.name}
                                                            className="w-6 h-6 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <span className="text-xs font-semibold text-primary">
                                                                {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-text-secondary">
                                                        {review.reviewer?.name || 'Anonymous'}
                                                    </span>
                                                    <span className="text-sm text-text-secondary">•</span>
                                                    <span className="text-sm text-text-secondary">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Rating */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex text-lg">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <span className="text-sm text-text-secondary">
                                                        {review.rating}/5
                                                    </span>
                                                </div>

                                                {/* Comment */}
                                                {review.comment && (
                                                    <p className="mt-3 text-text-secondary">{review.comment}</p>
                                                )}

                                                {/* Review Images */}
                                                {review.images && review.images.length > 0 && (
                                                    <div className="flex gap-2 mt-3">
                                                        {review.images.slice(0, 4).map((img: string, idx: number) => (
                                                            <img
                                                                key={idx}
                                                                src={img}
                                                                alt={`Review ${idx + 1}`}
                                                                className="w-16 h-16 rounded object-cover cursor-pointer hover:opacity-80"
                                                            />
                                                        ))}
                                                        {review.images.length > 4 && (
                                                            <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-sm text-text-secondary">
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
                                            className="admin-btn admin-btn-danger py-2 px-3 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
