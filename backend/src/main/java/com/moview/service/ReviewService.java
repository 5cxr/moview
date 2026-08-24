package com.moview.service;

import com.moview.dto.ReviewRequest;
import com.moview.dto.ReviewResponse;
import com.moview.exception.DuplicateResourceException;
import com.moview.exception.ResourceNotFoundException;
import com.moview.model.Movie;
import com.moview.model.Review;
import com.moview.model.User;
import com.moview.repository.MovieRepository;
import com.moview.repository.ReviewRepository;
import com.moview.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, MovieRepository movieRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
    }

    public List<ReviewResponse> getByMovie(Integer movieId) {
        return reviewRepository.findByMovieIdWithJoin(movieId).stream().map(ReviewResponse::new).toList();
    }

    public List<ReviewResponse> getByCurrentUser(String username) {
        User user = findUserOrThrow(username);
        return reviewRepository.findByUserUserId(user.getUserId()).stream().map(ReviewResponse::new).toList();
    }

    public ReviewResponse create(String username, ReviewRequest request) {
        validateRatingStep(request.getRating());

        User user = findUserOrThrow(username);
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("no movie with id: " + request.getMovieId()));

        if (reviewRepository.existsByUserUserIdAndMovieMovieId(user.getUserId(), movie.getMovieId())) {
            throw new DuplicateResourceException("you already reviewed this movie");
        }

        Review review = new Review();
        review.setUser(user);
        review.setMovie(movie);
        applyRequest(review, request);

        return new ReviewResponse(reviewRepository.save(review));
    }

    public ReviewResponse update(String username, Integer reviewId, ReviewRequest request) {
        validateRatingStep(request.getRating());

        Review review = findReviewOrThrow(reviewId);
        requireOwnership(review, username);
        applyRequest(review, request);

        return new ReviewResponse(reviewRepository.save(review));
    }

    public void delete(String username, Integer reviewId) {
        Review review = findReviewOrThrow(reviewId);
        requireOwnership(review, username);
        reviewRepository.delete(review);
    }

    private void applyRequest(Review review, ReviewRequest request) {
        review.setRating(request.getRating());
        review.setLiked(request.getLiked());
        review.setReviewText(request.getReviewText());
        review.setWatchedDate(request.getWatchedDate());
    }

    private void requireOwnership(Review review, String username) {
        if (!review.getUser().getUsername().equals(username)) {
            throw new IllegalArgumentException("you can only modify your own reviews");
        }
    }

    private void validateRatingStep(BigDecimal rating) {
        // half-star precision: rating * 2 must be a whole number (0.0, 0.5, 1.0, ... 10.0)
        BigDecimal doubled = rating.multiply(BigDecimal.valueOf(2));
        if (doubled.stripTrailingZeros().scale() > 0) {
            throw new IllegalArgumentException("rating must be in steps of 0.5");
        }
    }

    private Review findReviewOrThrow(Integer reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("no review with id: " + reviewId));
    }

    private User findUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("no user with username: " + username));
    }
}
